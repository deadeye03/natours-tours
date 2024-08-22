
const mongoose = require('mongoose');
// const User = require('./userModel');
const Review = require('./reviewModel')

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have name'],
        unique: true,
        trim: true,
        maxlength: [40, 'A tour name must have maximus 40 character'],
        minlength: [10, 'A tour must have minimum 10 character']
    },
    duration: {
        type: Number,
        required: [true, 'A tour must have duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have group size']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have diffcultiy'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'A tour have difficulty either : Easy,medium ,difficult'
        }
    },

    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'A tour of ratings must have minimum 1 rating'],
        max: [5, 'A tour have maximum 5 ratings '],
        set: val=>Math.round(val*10)/10
        
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },

    price: {
        type: Number,
        required: [true, 'A tour must have price']
    },
    priceDiscount: Number,

    summary: {
        type: String,
        trim: true,
        required: [true, 'A tour must have summary']
    },
    description: {
        type: String,
        required: [true, 'A tour must have description']
    },
    imageCover: {
        type: String,
        required: [true, 'A tour must have image']
    },
    images: [String],

    createdAt: {
        type: Date,
        default: Date.now()
    },
    startDates: [Date],
    startLocation: {
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String
    },
    locations: [
        {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']

            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number
        }
    ],
    guides: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }
    ]
},
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);
// Virtual is user for create a field in model manuaaly in this case 'durationWeeks
tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7;
});

tourSchema.virtual('reviews', {
    ref: Review,
    foreignField: 'tour',
    localField: '_id'
});
tourSchema.index({price:1, ratingsAverage:-1})
tourSchema.index({slug:1})
tourSchema.index({startLocation:'2dsphere'})

// 1) asign guides by id using preSave method. ru befor save and create not for update documents (Embedding method)
// tourSchema.pre('save', async function (next) {
//     const guidesPromise = this.guides.map(async id => await User.findById(id));
//     this.guides = await Promise.all(guidesPromise);
//     next();
// });
//2) second method with populate()

tourSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'guides',
        select: '-__v -passwordChangedAt'

    });
    next();
});



const Tour = mongoose.model('Tour', tourSchema)
module.exports = Tour;
