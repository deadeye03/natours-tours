const multer = require('multer')
const sharp = require('sharp')
const Tour = require('./../models/tourModel')
const catchAsync = require('./../utils/catchAsync')
const factory = require('./factoryController')
const AppError = require('../utils/appError')

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    }
    else {
        cb(new AppError('Not an image! ,Please only upload images', 400), false)
    }
}
const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

exports.uploadTourImages = upload.fields([
    { name: 'imageCover', maxCount: 1 },
    { name: 'images', maxCount: 3 }
])

exports.resizeTourImages = catchAsync(async (req, res, next) => {
    if (!req.files.imageCover || !req.files.images) return next();

    req.body.imageCover = `user-${req.User.id}-${Date.now()}-cover.jpeg`;

    await sharp(req.files.imageCover[0].buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${req.body.imageCover}`)

    req.body.images = [];

    await Promise.all(
        req.files.images.map(async(file, i) => {
           const filename = `user-${req.User.id}-${Date.now()}-${i+1}.jpeg`;
            await sharp(file.buffer)
                .resize(2000, 1333)
                .toFormat('jpeg')
                .jpeg({ quality: 90 })
                .toFile(`public/img/tours/${filename}`)

            req.body.images.push(filename);
        })
    )
    next();
});

exports.getAllTour = factory.getAll(Tour)
//////////////////////
/// Get TOUR
exports.findTour = factory.getOne(Tour, { path: 'reviews' })
//////////////////////
///  CREATE TOURE
exports.creatTour = factory.createOne(Tour)
//////////////////////
/// UPDATE DATA
exports.updateTour = factory.updateOne(Tour)
////////////////////////////////////////////////////////////////
//////// DELETE TOUR
exports.deleteTour = factory.deleteOne(Tour)
//////////////////////
/// AGGRIGATION PIPELINE 

exports.groupStats = catchAsync(async (req, res, next) => {

    const stats = await Tour.aggregate([
        {
            $match: {
                ratingsAverage: { $gte: 4.5 }
            }
        },
        {
            $group: {
                _id: { $toUpper: '$difficulty' },
                numTours: { $sum: 1 },
                numRating: { $sum: '$ratingsQuantity' },
                ratingAvg: { $avg: '$ratingsAverage' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' }
            }
        },
        {
            $sort: { avgPrice: 1 }
        }
    ])
    res.status(200).json({
        status: 'success',
        dtat: {
            stats
        }
    })


})

// Get Monthly Plan (UNWIND)
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
    const year = req.params.year * 1

    const plan = await Tour.aggregate([

        {
            $unwind: '$startDates'
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                numTours: { $sum: 1 },
                name: { $push: '$name' }
            }
        },
        {
            $addFields: { month: '$_id' }
        },
        {
            $project: { _id: 0 }
        }
    ])
    res.status(200).json({
        status: 'success',
        dtat: {
            plan
        }
    })
})

//tours-within/:Distance/cetner/:center/unit/:mi
exports.getTourWithin = catchAsync(async (req, res, next) => {
    const { distance, latlng, unit } = req.params;
    console.log(latlng)
    const [lat, lng] = latlng.split(',');
    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

    if (!lat || !lng) {
        return next(new AppError('Please provide latitude and longitude', 400))
    }
    // console.log(distance, latlng, unit)
    const tours = await Tour.find({
        startLocation: {
            $geoWithin: {
                $centerSphere: [
                    [lng, lat],
                    radius
                ]
            }
        }
    })

    res.status(200).json({
        status: 'success',
        result: tours.length,
        data: {
            data: tours
        }
    })
})

exports.getDistances = catchAsync(async (req, res, next) => {
    const { latlng } = req.params;
    console.log(latlng)
    const [lat, lng] = latlng.split(',');

    if (!lat || !lng) {
        return next(new AppError('Please provide latitude and longitude', 400))
    }

    const distances = await Tour.aggregate([
        {
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [lng * 1, lat * 1]
                },
                distanceField: 'distance',
                distanceMultiplier: 0.001
            }
        },
        {
            $project: {
                distance: 1,
                name: 1
            }
        }
    ])

    res.status(200).json({
        status: 'success',
        resutl: distances.length,
        data: {
            data: distances
        }
    })
})