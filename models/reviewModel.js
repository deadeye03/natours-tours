const  mongoose  = require("mongoose");

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, 'A review can not be empty']
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must belong to a tour']

    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to a user']
    }

},
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
)
// Creating index 1tour for 1_ review
reviewSchema.index({tour:1,user:1},{unique:true})


reviewSchema.pre(/^find/, function (next) {
    // I dont want to populatate tours when i get revies details in tour model.
    // this.populate({
    //     path:'tour',
    //     select:'name'
    // }).populate({
    //     path:'user',
    //     selcet:'name photo'
    // })
    this.populate({
        path: 'user',
        select: 'name photo'
    })
    next();
})
reviewSchema.statics.calAverageRatings = async function (tourId) {
    const Tour = require('./tourModel')
   
    const stats = await this.aggregate([
        {
            $match: { tour: tourId }
        },
        {
            $group: {
                _id: '$tour',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ])
    // console.log(stats)
    if(stats.length>0){
        await Tour.findByIdAndUpdate(tourId, { 
            ratingsQuantity: stats[0].nRating ,
            ratingsAverage: stats[0].avgRating
        })

    }
    else{
        await Tour.findByIdAndUpdate(tourId,{
            ratingsAverage:4.5,
            ratingsQuantity:0
        })
    }
    
   
}
reviewSchema.post('save', function () {
    this.constructor.calAverageRatings(this.tour)
});

reviewSchema.pre(/^findOneAnd/,async function(next){
    // console.log(this)
    // this.r=await this.findOne()
    this.r = await this.model.findOne(this.getQuery());
    // console.log(this.r)
    console.log(this.r)
    next();
})
reviewSchema.post(/^findOneAnd/,async function(next){
    // await this.findOne function. is not work here,query has alreadey executed
    await this.r.constructor.calAverageRatings(this.r.tour);
})

const Review = mongoose.model('review', reviewSchema);
module.exports = Review