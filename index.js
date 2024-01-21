const express = require('express');
const dbConnect = require('./db/dbconnect');
const app = express();
const dotenv=require('dotenv').config()
const authRouter = require('./routes/authRouter')
const postRouter = require('./routes/postsRouter')
const userRouter = require('./routes/userRouter')
const cookieParser = require('cookie-parser') 
const cors =require('cors')
const cloudinary = require('cloudinary').v2
          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret:  process.env.CLOUDINARY_API_SECRET
});

app.use(express.json(
    {limit:'10mb'}
))
app.use(cookieParser())
app.use(cors({
    credentials:true,
    origin:'https://social-media-frontend-mern.vercel.app'
}))
 
dbConnect();

app.get('/',(req,res)=>{
    res.send('Done')
})
app.use('/auth',authRouter)
app.use('/posts',postRouter)
app.use('/user',userRouter)


app.listen(process.env.PORT,()=>{
    console.log(`Server is runing on ${process.env.PORT}`);
})