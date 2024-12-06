const { createHmac, randomBytes }=require("crypto");
const mongoose = require('mongoose');
const { createTokenForUser } = require("../services/auth");

const userSchema = new mongoose.Schema({
    fullName:{
        type: String,
        require: true,
        unique: true,

    },
    email:{
        type: String,
        require: true,
        unique: true,

    },
    salt:{
        type: String,
        

    },
    password:{
        type: String,
        require: true,
       

    },
    profileImageUrl:{
        type:String,
        default:'/images/avatar.png',
    },
    role:{
        type:String,
        enum:["USER","ADMIN"],
        default: "USER",
    },

},{timestamps:true}
);

userSchema.pre("save",function(next){
    const user = this;

    if (!user.isModified("password")) return;

    const salt =randomBytes(16).toString();
       const hashPassword= createHmac('sha256',salt).update(user.password).digest('hex');
       this.salt=salt;
       this.password=hashPassword;
       next();
});

userSchema.static("matchPasswordAndGenerateToken",async function(email,password){
    const user= await this.findOne({email});
    if(!user) throw new Error('User not Found');

    const salt = user.salt;
    const hashPassword=user.password;

    const userProvidedHash= createHmac("sha256",salt).update(password).digest("hex");

    if(hashPassword !== userProvidedHash) throw new Error('Incorrrect Password ');
    const token= createTokenForUser(user);
    return token;
});

const User= mongoose.model('user',userSchema);

module.exports= User;