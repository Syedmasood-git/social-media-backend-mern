const PostModel = require("../Models/PostModel");
const UserModel = require("../Models/userModel");
const mapPostOutput = require("../utils/Utils");
const { success, error } = require("../utils/responseWrapper");
const cloudinary = require('cloudinary').v2

const followOrUnfollowUserController = async (req, res) => {
  try {
    const { userIdToFollow } = req.body;
    const curUserId = req.id;

    const userToFollow = await UserModel.findById(userIdToFollow);
    const curUser = await UserModel.findById(curUserId);

    if (curUserId === userIdToFollow) {
      return res.send(error(409, "Users cannot follow yourself"));
    }

    if (!userToFollow) {
      return res.send(error(404, "User to follow not found"));
    }
    if (curUser.followings.includes(userIdToFollow)) {
      //already followed
      const followingIndex = curUser.followings.indexOf(userIdToFollow);
      curUser.followings.splice(followingIndex, 1);

      const followerIndex = userToFollow.followers.indexOf(curUserId);
      userToFollow.followers.splice(followerIndex, 1);

    } else {
      //follow user
      userToFollow.followers.push(curUserId);
      curUser.followings.push(userIdToFollow);
    }
    await userToFollow.save();
    await curUser.save()
      return res.send(success(200, {user:userToFollow}));

  } catch (err) {
    return res.send(error(500, err.message));
  }
};

const getPostsOfFollowings = async (req, res) => {
  try {
    const curUserId = req.id;
    const curUser = await UserModel.findById(curUserId).populate('followings');
    const fullPosts = await PostModel.find({
      owner: {
        $in: curUser.followings,
      },
    }).populate('owner');
    const posts = fullPosts.map(item=>mapPostOutput(item,req.id)).reverse();
    curUser.posts=posts
    const followingIds = curUser.followings.map(item=>item._id);
    const suggestions = await UserModel.find({
      _id:{
        $nin:[...followingIds,req.id]
      }
    })
    return res.send(success(200, {...curUser._doc,suggestions,posts}));
  } catch (err) {
    res.send(error(500, err.message));
  }
};
const deleteMyProfile = async (req, res) => {
  try {
    const curUserId = req.id;

    const curUser = await UserModel.findById(curUserId);
    const posts = await PostModel.find({
      owner: {$in:curUser._id}
    });
    const followings = await UserModel.find({
      followings: curUser._id
    });
    const followers = await UserModel.find({
      followers: curUser._id,
    });
    const foll = followers.map((user)=>user._id)
    console.log("followers>>>>",followers);


    const followingUserIds = followings.map(user => user._id);
    const followerUserIds = followers.map(user => user._id);

    // Remove the current user from other users' followings
    await UserModel.updateMany(
      { _id: { $in: followingUserIds } },
      { $pull: { followings: curUserId } }
    );

    // Remove the current user from other users' followers
    await UserModel.updateMany(
      { _id: { $in: followerUserIds } },
      { $pull: { followers: curUserId } }
    );

    await PostModel.deleteMany({owner:curUser._id});
    await curUser.deleteOne();
    return res.send(success(200, "User deleted Successfully"));
  } catch (err) {
    return res.send(error(400,err.message))
  }
};
const getUserPosts = async (req,res)=>{
    const {userId} = req.body;
    const posts = await PostModel.find({
        owner:{
            $in:userId
        }
    })
  
    if(!posts){
      return res.send(error(404,"No posts found"))
    }
    return res.send(200,posts)
  }
  const getMyInfo = async(req,res)=>{
    try {
      const user = await UserModel.findById(req.id);
      return res.send(success(200,{user}))
    } catch (err) {
      return res.send(error(500,err.message))
    }
  }

  const updateUserProfile = async(req,res)=>{
    try {
      const {name,bio,userImg} = req.body;
      const user = await UserModel.findById(req.id);

      if(name){
        user.name=name
      }
      if(bio){
        user.bio = bio;
      }
      if(userImg){
        const cloudImg = await cloudinary.uploader.upload(userImg,{
          folder:'profileImg'
        })
        user.avatar={
          url:cloudImg.secure_url,
          publicId:cloudImg.public_id
        }
      }
      await user.save()
      console.log(user)
      return res.send(success(200,{user}))
    } catch (err) {
      return res.send(error(404,err.message))
    }
  }
  const getUserProfileController =async (req,res)=>{
    try {
      const userId = req.body.userId;
      const user = await UserModel.findById(userId).populate({
        path:'posts',
        populate:{
          path:'owner'
        }
      })
      const fullPosts = user.posts;
      const posts = fullPosts.map(item=>mapPostOutput(item,req.id)).reverse();
      console.log(posts)
      return res.send(success(200,{...user._doc,posts}))
    } catch (err) {
      return res.send(error(500,err.message))
    }
  }


module.exports = {
  followOrUnfollowUserController,
  getPostsOfFollowings,
  deleteMyProfile,
  getUserPosts,
  getMyInfo,
  updateUserProfile,
  getUserProfileController
};
