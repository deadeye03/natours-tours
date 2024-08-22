const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const Booking = require('./bookingModel')


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide your name'],
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'Please provide your email'],
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    photo: {
        type: String,
        default: 'default.jpg'
    },
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },
    bookTour: [
        {
            type: mongoose.Schema.ObjectId,
            ref: Booking.modelName
        }
    ],
    password: {
        type: String,
        required: [true, 'Please Enter the password'],
        minlength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        // required: [true, 'Please confirm your password'],
        validate: {
            validator: function (el) {
                return el === this.password
            },
            message: 'Password not match'
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true
    }
}, {
    versionKey: false
})



userSchema.pre('save', async function (next) {
    //Only run this function when password was actually modified
    if (!this.isModified('password')) return next();

    // adding encryption in password 
    this.password = await bcrypt.hash(this.password, 12)

    // Delte the passwordConfirm because of no need in database
    this.passwordConfirm = undefined
    next();
})

userSchema.pre('save', function (next) {
    if (this.isModified('password') || this.isNew) return next()

    this.passwordChangedAt = Date.now() - 1000;
    next()
})
userSchema.pre(/^find/, function (next) {
    this.find({ active: { $ne: false } })
    next();
})
//1) First instance for check password
//CREATING INSTANCE METHOD AVILLABLE FOR ALL DOCUMENT check password is correnct or not
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword)
}
// Check token after THE changePassword 
// 2) Second instance for user changed password or not if change then token not validate any more....
userSchema.methods.changedPasswordAfter = async function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changeTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

        console.log(JWTTimestamp < changeTimestamp)
        return JWTTimestamp < changeTimestamp
    }

    return false;
}
// 3) Third instance for generrate Random toke for forgot passwor

userSchema.methods.creatPasswordResetToken = async function () {
    const resetToken = crypto.randomBytes(32).toString('hex')

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')

    console.log({ resetToken }, this.passwordResetToken);
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;

}

const User = mongoose.model('User', userSchema)

module.exports = User;
