const mongoose=require('mongoose');
const DataSchema=mongoose.Schema({
        email:{type:String,unique:true,required:true,lowercase:true,trim: true},
        otp:{type:String,required:true,default: "0"}
    },
    {timestamps:true,versionKey:false}
)
const UserModel=mongoose.model('users',DataSchema)
module.exports=UserModel