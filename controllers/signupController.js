const jwt = require("jsonwebtoken");
const UserModel = require("../Models/userModel");
const bcrypt = require("bcrypt");
const { error, success } = require("../utils/responseWrapper");

const signupController = async (req, res) => {
  try {
    const { username, password, name } = req.body;
    if (!username || !password || !name) {
      return res.send(error(400,"All fields are required"))
    }
    const oldUser = await UserModel.findOne({ username });
    if (oldUser) {
      return res.send(error(409,"User is already registered"))
    }
    const hashedpassword = await bcrypt.hash(password, 10);

    const user = await UserModel.create({name, username, password: hashedpassword });
    return res.send(success(201,"User created successfully"))
  } catch (error) {
    res.json(error);
  }
};
const loginController = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.send(error(400,"All fields are required"))
  }
  const User = await UserModel.findOne({ username }).select('+password');

  if (!User) {
    return res.send(error(404,"User is not found"))
  }
  const matched = await bcrypt.compare(password, User.password);
  if (!matched) {
    return res.send(error(403,"incorrect password"))
  }
  const accessToken = generateAccessToken({id:User._id})
  const refreshToken = generateRefreshToken({id:User._id})
  res.cookie('jwt',refreshToken,{
    httpOnly:true,
    secure:true
  })
  return res.send(success(201,{accessToken}))
};

const logoutController = async(req,res)=>{
  try {
    res.clearCookie('jwt',{
      httpOnly:true,
      secure:true
    })
    return res.send(success(200,"User Logged out successfull"))
  } catch (err) {
    return res.send(error(500,e.message))
  }
}

//This api will check refresh access token validity and generate new access token
const refreshAccessTokenController=async(req,res)=>{
  const cookies = req.cookies
  if(!cookies.jwt){
    return res.send(error(401,"Refresh token in cookie is required"))
  }
  const refreshToken= cookies.jwt;
  try {
    const decoded = jwt.verify(refreshToken,process.env.REFRESH_TOKEN_KEY);
    
    const id =decoded.id
    
    const accessToken = generateAccessToken({id})
    return res.send(success(201,{accessToken}))
  } catch (e) {
    console.log(e);
    return res.send(error(401,"Invalid Refresh Token"))
  }
}

const generateAccessToken = (data)=>{
  try {
    const token = jwt.sign(data,process.env.ACCESS_TOKEN_KEY,{expiresIn:'1d'})
    console.log("Access Token>>>",token);
    return token
  } catch (error) {
    console.log(error);
  }
}

const generateRefreshToken = (data)=>{
  try {
    const token = jwt.sign(data,process.env.REFRESH_TOKEN_KEY,{expiresIn:'30d'})
    console.log("Refresh Token>>>",token);
    return token
  } catch (error) {
    console.log(error);
  }
} 

module.exports = {
  signupController,
  loginController,
  refreshAccessTokenController,
  logoutController
};







 

