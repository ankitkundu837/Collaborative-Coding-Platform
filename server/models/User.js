const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true
    },

    password:{
        type:String,
        required:true,
        select:false
    },

    verified:{
        type:Boolean,
        default:false
    },

    role:{
        type:String,
        enum:["user","admin"],
        default:"user"
    },

    otp:String,

    otpExpires:Date,

    otpAttempts:{
        type:Number,
        default:0
    },

    resetToken:String,

    resetTokenExpires:Date

},{
    timestamps:true,
    versionKey:false
});

module.exports =
mongoose.model("User",userSchema);