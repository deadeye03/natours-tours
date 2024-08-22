const { promisify } = require('util')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const User = require('../models/userModel')
const catchAsync = require('./../utils/catchAsync')
const AppError = require('./../utils/appError')
const Email = require('./../utils/email')
const { locales } = require('validator/lib/isFloat')

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIREIN
    })
}
const createSendToken = (user, statusCode, res) => {
    console.log(user.name);
    const token = signToken(user._id);
    const cookiesOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIREIN * 24 * 60 * 60 * 1000),
        httpOnly: true
    }
    if (process.env.NODE_ENV === 'production') cookiesOptions.secure = true;
    res.cookie('jwt', token, cookiesOptions);

    user.password = undefined

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    })

}

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.confirmPassword
        // photo: req.body.photo,
        // passwordChangedAt: req.body.passwordChangedAt,
        // role: req.body.role
    })
    const url = `${req.protocol}://${req.get('host')}/me`;
    console.log(url);
    await new Email(newUser, url).sendWelcome();
    res.status(201).json({
        status: 'success',
        data: {
            data: newUser
        }
    })

})

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body
    // 1) Check email and password enterd or not
    if (!email || !password) return next(new AppError('please enter email and password', 400))

    // 2)Check enter email and password valid or not 
    const user = await User.findOne({ email }).select('+password');
    if (!user || ! await (user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password', 401))
    }
    //3) Sending token to client 
    createSendToken(user, 201, res)
})

exports.logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 1 * 1000),
        httpOnly: true

    });
    res.status(200).json({
        status: 'success'
    })
}

exports.protect = catchAsync(async (req, res, next) => {
    //1 USER loggedin or not (token exist or not in authorization)
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    else if (req.cookies.jwt) {
        token = req.cookies.jwt
    }
    if (!token) {
        return next(new AppError('You not logged in ! Please logged in to access this!!!'))
    }
    //2) Verify the token a token valid or not 
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)

    //3) Check if user still exist
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(new AppError('The user belonging to this token is no longer Avillabel!!', 401))
    }

    //4) Check if user Change The pasword after token was issued

    if (await currentUser.changedPasswordAfter(decoded.iat)) {
        return next(new AppError('User recently changed the password plase login again!', 401))
    }

    req.User = currentUser;
    if (currentUser) {
        res.locals.user = currentUser;
    }
    else {
        res.locals.user = null;
    }
    next();
})

exports.isLogedin = async (req, res, next) => {
    try {
        //1 USER loggedin or not (token exist or not in authorization)   
        if (req.cookies.jwt) {
            //2) Verify the token a token valid or not 
            const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET)

            //3) Check if user still exist
            const currentUser = await User.findById(decoded.id);
            if (!currentUser) {
                return next();
            }
            //4) Check if user Change The pasword after token was issued
            if (await currentUser.changedPasswordAfter(decoded.iat)) {
                return next();
            }

            res.locals.user = currentUser;
            req.User=currentUser;
            return next();
        }
    }
    catch (err) {
        res.locals.user = null;
        return next();
    }
    res.locals.user = null;
    next();
};

exports.restrictTO = (...roles) => {
    // roles['admin','lead-guide']
    return (req, res, next) => {
        if (!roles.includes(req.User.role)) {
            return next(new AppError('You donot have to permisssion to perform this action', 403))
        }
        next();
    };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
    //1) Get user based on POSTed Email.
    const user = await User.findOne({ email: req.body.email })
    if (!user) {
        return next(new AppError('There is no user with this email address.', 404))
    }
    //2 )Generate the random secret token  
    try {
        const resetToken = await user.creatPasswordResetToken();
        await user.save({ validateBeforeSave: false })
        //3) send it's user Email.....
        // const resetURL = `${req.protocol}://${req.get('host')}/api/v1/user/resetPassword/${resetToken}`;
        const resetURL = `${req.protocol}://${req.get('host')}/resetPassword/${resetToken}`;
        
        console.log(resetURL)
        await new Email(user, resetURL).sendRestPassword();
        res.status(200).json({
            status: 'success',
            message: 'Token sent to email'
        })

    } catch (error) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false })

        return next(new AppError('There was an error occurd during the sending email', 500));
    }
})

exports.resetPassword = catchAsync(async (req, res, next) => {
    //1) geting orginal token through params. and encrypt those token
    console.log(req.body)
    console.log(req.params.token)

    const hasToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    //2) find user with valid token .. and change password
    const user = await User.findOne({
        passwordResetToken: hasToken,
        passwordResetExpires: { $gt: Date.now() }
    });
    if (!user) {
        return next(new AppError('Link is invalid or has expire', 404))
    }
    user.password = req.body.password
    user.passwordConfirm = req.body.passwordConfirm
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save();

    //3)Update date properties at changeAt password.
    // . for this i user pre save middleware in in userModel 

    //4) Log the user ... and aSign a NEW jwt
    createSendToken(user, 200, res)
})

exports.updatePassword = catchAsync(async (req, res, next) => {
    // const password=req.body.password
    //1) Find the user in Collection.
    const user = await User.findById(req.User.id).select('+password');
    if (!user) {
        return next(new AppError('please login with valid email id', 404))
    }

    //2) Now check current password is correct or not
    if (!await user.correctPassword(req.body.passwordCurrent, user.password)) {
        return next(new AppError('Your Current password is incorrect !Please enter your valid password', 401))
    }

    //3) if so,then change your password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();
    // send jwt token to client.....
    createSendToken(user, 200, res)
})