const User = require('../models/userModel')
const catchAsync = require('./../utils/catchAsync')
const AppError = require('./../utils/appError')
const factory = require('./factoryController')
const multer = require('multer')
const sharp = require('sharp')

// uploading photo
// const multerStorage=multer.diskStorage({
//     destination:(req,file,cb)=>{
//         cb(null,'public/img/users')
//     },
//     filename:(req,file,cb)=>{
//         const ext=file.mimetype.split('/')[1];
//         cb(null,`user-${req.User.id}-${Date.now()}.${ext}`)
//     }
// })
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    }
    else {
        cb(new AppError('Not an image! ,Please only upload images', 400), false)
    }
}
const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});
exports.uploadPhotos = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async(req, res, next) => {
    if (!req.file) return next();
    req.file.filename = `user-${req.User.id}-${Date.now()}.jpeg`;

   await sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg') 
        .jpeg({ quality: 90 })
        .toFile(`public/img/users/${req.file.filename}`);

    next();
});

exports.updateMe = catchAsync(async (req, res, next) => {
    //1) usert try to change password or not ?
    console.log('updating data')
    if (req.body.password || req.body.passwrodConfirm) {
        return next(new AppError('This Route is not for changing password please Visit updatePassword route', 400))
    }
    //2) Update only require filed ..... of user..name and email....
    const updates = {
        name: req.body.name,
        email: req.body.email
    };

    if (req.file) {
        updates.photo = req.file.filename;
    }

    const updateUser = await User.findByIdAndUpdate(req.User.id,
        updates, //update require filed
        { new: true, runValidators: true });

    res.status(200).json({
        status: 'success',
        data: {
            user: updateUser
        }
    });
})
exports.getMe = (req, res, next) => {
    req.params.id = req.User.id
    next();
}

exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.User.id, { active: false })
    res.status(204).json({
        status: 'success',
        data: null
    })
})
// THIS routes is directly relate to user not authcontroller

exports.getAllUsers = factory.getAll(User)
exports.deleteUser = factory.deleteOne(User)
exports.updateUser = factory.updateOne(User)
exports.getUser = factory.getOne(User)
