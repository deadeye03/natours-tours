const express=require('express');
const viewController=require('./../controllers/viewController')
const authController=require('../controllers/authController')
const bookingController=require('../controllers/bookingController')
const router=express.Router();

router.use(authController.isLogedin,);

router.route('/').get(bookingController.createBookingRoute,authController.isLogedin,viewController.getOverView)
router.route('/tour/:slug').get(authController.isLogedin,viewController.tour)
router.route('/me').get(authController.protect,viewController.getAccount);
router.route('/my-tours').get(authController.protect,viewController.getMyTour);
router.route('/login').get(authController.isLogedin,viewController.login);
router.route('/forgotPassword').get(viewController.forgotPassword);
router.route('/resetPassword/:token').get( viewController.newPassword)

module.exports=router
