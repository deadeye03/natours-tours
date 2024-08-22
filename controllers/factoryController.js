const catchAsync = require('./../utils/catchAsync')
const AppError = require("./../utils/appError");
const ApiFeatures = require('./../utils/apifeatures')

exports.getAll = Model =>
    catchAsync(async (req, res, next) => {
        let filter = {}
        if (req.params.tourId) filter = { tour: req.params.tourId };
        //SENDING RESPONSE 
        const features = new ApiFeatures(Model.find(filter), req.query)
            .filter()
            .sort()
            .fields()
            .pagination()
        let doc = await features.query      
        if (!doc) return next(new AppError('No documents avilable '));

        res.status(200).json({
            status: 'success',
            results: doc.length,
            data: {
                data: doc
            }
        })
    })
exports.deleteOne = Model =>

    catchAsync(async (req, res, next) => {
        let id = req.params.id;
        // console.log(id);

        const doc = await Model.findByIdAndDelete(id);
        if (!doc) {
            return next(new AppError('document not found With that Id', 404))
        }
        res.status(204).json({
            status: 'success',
            message: 'doc is successfully deleted '
        })


    })

exports.createOne = Model =>
    catchAsync(async (req, res, next) => {
        let data = await Model.create(req.body)

        res.status(202).json({
            stauts: "success",
            result: Model.length,
            data: {
                data
            }

        })

    })

exports.updateOne = Model =>
    catchAsync(async (req, res, next) => {
        let id = req.params.id;
        let data = await Model.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true
        });
        if (!data) {
            return next(new AppError('Document not found With this Id', 404))
        }
        res.status(200).json({
            status: 'success',
            dtat: {
                data
            }
        })
    })

exports.getOne = (Model, popOption) =>
    catchAsync(async (req, res, next) => {
        let id = req.params.id
        let doc = await Model.findById(id)
        if (popOption) doc = await doc.populate(popOption)

        if (!doc) {
            return next(new AppError('Document not found With this Id', 404))
        }
        res.status(200).json({
            status: 'success',
            data: {
                data: doc
            }
        })
    })