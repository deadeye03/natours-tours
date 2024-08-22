const Review = require('./../models/reviewModel')
const factory = require('./factoryController')
exports.setReviewRoute = (req, res, next) => {
    // Allow nested routes
    if (!req.body.tour) req.body.tour = req.params.tourId
    if (!req.body.user) req.body.user = req.User.id
    next()
}
exports.getAllReviews = factory.getAll(Review)
exports.createReviews = factory.createOne(Review)
exports.deleteReview = factory.deleteOne(Review)
exports.updateReview = factory.updateOne(Review)
exports.getReview=factory.getOne(Review)