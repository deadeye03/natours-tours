const Tour = require('./../models/tourModel')
const User = require('../models/userModel')
const Booking = require('../models/bookingModel')
const catchAsync = require('./../utils/catchAsync')
const AppError = require('../utils/appError')
exports.getOverView = catchAsync(async (req, res) => {
    const tours = await Tour.find();
    res.status(200).render('overview', {
        title: 'All Tours',
        tours
    })
})
exports.tour = catchAsync(async (req, res, next) => {
    // let allBookTours=[];
    const tour = await Tour.findOne({ name: req.params.slug }).populate({
        path: 'reviews',
        fields: 'review rating user'
    })
    const user = await User.findById(req.User.id).populate({
        path: 'bookTour',
        select: 'tour', // Get only the 'tour' field from the Booking model
        populate: {
            path: 'tour',
            select: '_id' // Get only the '_id' field from the Tour model
        }
    });
    // Extract only the required information
    const bookTours = user.bookTour.map(booking => ({
        tour: booking.tour._id
    }));

    // console.log(bookTours);
    const allBookTours = bookTours.map(booking => booking.tour.toString());
    console.log(allBookTours);
    if (!tour) {
        return next(new AppError('No tour avillable with this name'))
    }
    res.status(200).render('tour', {
        title: `${tour.name} Tour`,
        tour,
        allBookTours
    })
})
exports.login = catchAsync(async (req, res, next) => {
    res.status(200).render('login', {
        title: 'Login'
    })
})
exports.forgotPassword = (req, res) => {
    res.status(200).render('resetPassword', {
        title: 'Reset Password'
    })
}
exports.newPassword = (req, res) => {
    res.status(200).render('newPassword', {
        title: 'New password'
    })
}
exports.getAccount = (req, res) => {
    res.status(200).render('account', {
        title: 'Your Account'
    })
};
exports.updateUserData = catchAsync(async (req, res, next) => {
    const user = await findByIdAndUpdate(req.User.id, {
        name: req.body.name,
        email: req.body.email
    }, {
        new: true,
        runValidators: true
    })
})
exports.getMyTour = catchAsync(async (req, res, next) => {

    const bookings = await Booking.find({ user: req.User.id })

    const tourIDs = bookings.map(el => el.tour)
    const tours = await Tour.find({ _id: { $in: tourIDs } })
    // await User.findByIdAndUpdate(req.User.id,{bookTour:bookings})

    res.status(200).render('overview', {
        title: 'My Tours',
        tours
    })
    // res.status(200).json({
    //     status:'sucees',
    //     bookTours
    // })

})
