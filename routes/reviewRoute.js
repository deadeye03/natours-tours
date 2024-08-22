const route=require('../controllers/reviewController')
const authController=require('../controllers/authController')
const express=require('express');
const router=express.Router({mergeParams:true});

router
    .route('/')
    .get(route.getAllReviews)
    .get(route.getReview)

router.use(authController.protect)
router.route('/').post(authController.restrictTO('user'),route.setReviewRoute,route.createReviews)
router
    .route('/:id')
    .put(authController.protect,authController.restrictTO('use'),route.updateReview)
    .delete(authController.restrictTO('user','admin'),route.deleteReview)
    .get(route.getReview)


module.exports=router