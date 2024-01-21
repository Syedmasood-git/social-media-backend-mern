const PostModel = require("../Models/PostModel");
const UserModel = require("../Models/userModel");
const mapPostOutput = require("../utils/Utils");
const { success, error } = require("../utils/responseWrapper");
const cloudinary=require('cloudinary').v2

const createPostController = async (req, res) => {
  try {
    const { caption,postImg } = req.body;
    const owner = req.id;
    const cloudImg = await cloudinary.uploader.upload(postImg,{
        folder:'postImg'
      })
    if(!postImg){
      return res.send(error(400,'Post image is required'))
    }

    const user = await UserModel.findById(req.id);

    const post = await PostModel.create({ owner, caption,image:{
      publicId:cloudImg.public_id,
      url:cloudImg.url
    } });

    user.posts.push(post._id);
    await user.save();

    return res.send(success(201, {post}));
  } catch (err) {
    res.send(error(500, err.message));
  }
};

const likeandUnlikePost = async (req, res) => {
  try {
    const { postId } = req.body;
    const post = await PostModel.findById(postId).populate('owner');
    const curUserId = req.id;

    if (!post) {
      return res.send(error(404, "Post not found"));
    }
    if (post.likes.includes(curUserId)) {
      const index = post.likes.indexOf(curUserId);
      post.likes.splice(index, 1);
      
    } else {
      post.likes.push(curUserId);
      
    }
    await post.save();
    return res.send(success(200,{post:mapPostOutput(post,req.id)}))
  } catch (err) {
    res.send(error(500, err.message));
  }
};

const updatePostController = async (req, res) => {
  try {
    const { postId, caption } = req.body;
    const curUserId = req.id;

    const post = await PostModel.findById(postId);
    //Check if post is available
    if (!post) {
      return res.send(error(404, "Post not found"));
    }
    //Only owners can modify post
    if (post.owner.toString() !== curUserId) {
      return res.send(error(403, "Only owners can update thier post"));
    }
    console.log("PostOwner", post.owner.toString(), "currentUser", curUserId);
    if (caption) {
      post.caption = caption;
    }
    await post.save();
    return res.send(success(200, { post }));
  } catch (err) {
    return res.send(error(400, err.message));
  }
};

const delePostController = async (req, res) => {
  try {
    const { postId } = req.body;
    const curUserId = req.id;

    const post = await PostModel.findById(postId);
    const curUser = await UserModel.findById(curUserId);
    if (!post) {
      return res.send(error(404, "Post not found"));
    }

    if (post.owner.toString() !== curUserId) {
      return res.send(error(403, "Only owners can delete thier posts"));
    }
    const index = curUser.posts.indexOf(postId);
    curUser.posts.splice(index, 1);

    await curUser.save();
    await post.deleteOne();

    return res.send(success(200, "Post deleted succesfully"));
  } catch (err) {
    return res.send(error(404, err.message));
  }
};
const getMyPosts = async (req, res) => {
  try {
    const curUserId = req.id;
    const curUser = await UserModel.findById(curUserId);
    const posts = await PostModel.find({
      owner: {
        $in: curUser._id,
      },
    });
    if (!posts) {
      return res.send(error(400, "Posts not found"));
    }

    return res.send(success(200, { posts }));
  } catch (e) {
    return res.send(error(400, e.message));
  }
};


module.exports = {
  // getAllPostsController,
  createPostController,
  likeandUnlikePost,
  updatePostController,
  delePostController,
  getMyPosts,
};
