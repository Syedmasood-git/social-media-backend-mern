const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
        select:false,
    },
    name:{
        type:String,
        required:true,
    },
    bio:{
        type:String,
    },
    avatar:{
        publicId:String,
        url:String,
    },
    followers:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"user"
        }
    ],
    followings:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"user"
        }
    ],
    posts:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"post"
        }
    ]
},{timestamps:true})

const UserModel = mongoose.model("user",userSchema);

module.exports = UserModel