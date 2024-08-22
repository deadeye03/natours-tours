
const tourController = require('../controllers/tourController')
const authController = require('./../controllers/authController')
// const review=require('./../controllers/reviewController')
const reviewRouter = require('./reviewRoute')
const express = require('express');
const router = express.Router();

router.use("/:tourId/reviews", reviewRouter)

router
    .route("/")
    .get(tourController.getAllTour)
    .post(authController.protect, authController.restrictTO('admin', 'lead-guide'), tourController.creatTour)

router
    .route('/tour-stats')
    .get(tourController.groupStats)

//tours-within/:Distance/cetner/:center/unit/:mi
router
    .route('/tours-within/:distance/center/:latlng/unit/:unit')
    .get(tourController.getTourWithin)

router
    .route('/distance/:latlng')
    .get(tourController.getDistances)

router
    .route('/tour-plan/:year')
    .get(authController.protect, authController.restrictTO('user'), tourController.getMonthlyPlan)

router
    .route("/:id")
    .get(tourController.findTour)
    .patch(authController.protect,
        authController.restrictTO('admin', 'lead-guide'),
        tourController.uploadTourImages,
        tourController.resizeTourImages,
        tourController.updateTour)
    .delete(authController.protect,
        authController.restrictTO('admin', 'lead-guide'),
        tourController.deleteTour)



module.exports = router;