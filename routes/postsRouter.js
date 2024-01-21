const { getAllPostsController, createPostController, likeandUnlikePost, updatePostController, delePostController, getMyPosts } = require('../controllers/postsController')
const requireUser = require('../middlewares/requireUser')

const router = require('express').Router()

// router.get('/all',requireUser,getAllPostsController)
router.post('/',requireUser,createPostController)   
router.post('/like',requireUser,likeandUnlikePost) 
router.put('/',requireUser,updatePostController) 
router.delete('/',requireUser,delePostController)
router.get('/',requireUser,getMyPosts)

module.exports=router