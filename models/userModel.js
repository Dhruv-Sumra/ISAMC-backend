import mongoose from "mongoose";
import bcrypt from 'bcryptjs'
const userSchema = new mongoose.Schema({
    name: {type:String , required:true},
    email: {type:String , required:[true, "Email is required"] , unique: true ,  regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, lowercase: true},
    password: {type:String , required:[true, "Password is required"]},
    contact: {type: String, default: ""},
    bio: {type: String, default: ""},
    role: {type: String, enum: ['user', 'admin'], default: 'user'},
    verifyOtp: {type:String , default:" "},
    verifyOtpExpireAt: {type:Number , default:0},
    isAccountVerified: {type:Boolean , default:false},
    resetOtp: {type:String , default:" "},
    resetOtpExpireAt: {type:Number , default:0},
    googleId: { type: String },
    refreshToken: {
      type: String,
    },
}, { 
    timestamps: true,
  })

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

//  Compare passwords
userSchema.methods.comparePassword = async function (inputPassword) {
  return await bcrypt.compare(inputPassword, this.password);
};
const userModel =mongoose.models.user ||  mongoose.model('user',userSchema)

export default userModel