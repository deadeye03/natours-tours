const mongoose=require('mongoose')

const bookingSchema=new mongoose.Schema({
    tour:{
        type:mongoose.Schema.ObjectId,
        ref:'Tour',
        require:[true,'A booking must be a tour']
    },
    user:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
        require:[true,'A booking must belong to a user']
    },
    price:{
        type:Number,
        require:[true,'Booking must be a price']
    },
    createdAt:{
        type:Date,
        default:Date.now()
    },
    paid:{
        type:Boolean,
        default:true
    }
})

bookingSchema.pre(/^find/,function(next){
    this.populate('user').populate({
        path:'tour',
        select:'name'
    });
    next()
})
const Booking=mongoose.model('booking',bookingSchema)

module.exports=Booking