const mongoose = require('mongoose'); 
const bcrypt = require('bcrypt');
const crypto = require('crypto');


// CREATING A SCHEMA FOR THE USER
var userSchema = new mongoose.Schema({
    firstname:{
        type:String,
        required:true,
    },
    lastname:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    mobile:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
    },
    role:{
        type:String,
        default:'user',
    },
    isBlocked:{
        type:Boolean,
        default:false,
    },
    cart:{
        type:Array,
        default:[],
    },
    address:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Address'
       } ],
    wishlist:[{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Product'
        }],
    refreshToken:{
        type:String,
    },
    passwordChangedAt:{
        type:Date,
    },
    passwordResetToken:{
        type:String,
    },
    passwordResetExpires:{
        type:Date,
    },
},
    {
        timestamps:true,
    }
);

//HASHING THE PASSWORD BEFORE SAVING IT TO THE DATABASE
userSchema.pre("save",async function(next){
if(!this.isModified('password')){  //CHEKING IS PASSWORD IS MODIFIED OR NOT IN UPDATE OPERATION
    next();
}
    const salt = await bcrypt.genSaltSync(10);
    this.password = await bcrypt.hash(this.password,salt);
    next();
});

//COMPARING FUNCTION TO CHECK IF THE ENTERED PASSWORD MATCHES THE HASHED PASSWORD
userSchema.methods.isPasswordMatched = async function (enteredPassword){
    return await bcrypt.compare(enteredPassword,this.password);
}

//CHECKING IF THE PASSWORD IS CHANGED AFTER THE TOKEN WAS ISSUED
userSchema.methods.createPasswordResetToken = function(){
    const resetToken = crypto.randomBytes(32).toString('hex'); 
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; //10 minutes
    return resetToken;
}

//EXPORTING THE MODEL
module.exports = mongoose.model('User', userSchema);