const authController = require('./../controllers/authController')
const userController = require('./../controllers/userController')
const express = require('express');
const router = express.Router();

// Auth controller
router.post('/signup', authController.signup)
router.post('/login', authController.login)
router.get('/logout', authController.logout)
router.post('/forgotPassword', authController.forgotPassword)
router.patch('/resetPassword/:token', authController.resetPassword)
router.patch('/updateMyPassword', authController.protect, authController.updatePassword)

//USER CONTROLLER
router.use(authController.protect)
router.get('/me', userController.getMe, userController.getUser)
router.patch('/updateMe', userController.uploadPhotos, userController.resizeUserPhoto, userController.updateMe)
router.delete('/deleteMe', userController.deleteMe)

router.use(authController.restrictTO('admin'))
router.get('/', userController.getAllUsers)
router
    .route('/:id')
    .delete(userController.deleteUser)
    .patch(userController.updateUser)
    .get(userController.getUser)




module.exports = router
