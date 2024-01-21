const router = require('express').Router()
const { rawListeners } = require('../Models/userModel');
const { followOrUnfollowUserController,getUserProfileController,updateUserProfile, getPostsOfFollowings, deleteMyProfile, getUserPosts, getMyInfo } = require('../controllers/userController');
const requireUser = require('../middlewares/requireUser');



router.post('/follow',requireUser,followOrUnfollowUserController)
router.get('/getFeedData',requireUser,getPostsOfFollowings)
router.delete('/deleteMyProfile',requireUser,deleteMyProfile)
router.post('/userPost',requireUser,getUserPosts)
router.get('/getMyInfo',requireUser,getMyInfo)
router.put('/',requireUser,updateUserProfile)
router.post('/getUserProfile',requireUser,getUserProfileController)

module.exports=router;