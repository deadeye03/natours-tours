const Stripe = require('stripe')
const stripe = Stripe('sk_test_51Pe7kpRxdmX4TkLviTdz3L1qaC7TqWYf2JpyrlMgDOJkyUzEitc4NqszuF9LcCjLMTdOnLJutQfI5zdCY3FEpzFp00pz8T3Viv');
const Tour = require('../models/tourModel');
const User =require('../models/userModel')
const Booking=require('../models/bookingModel')
const catchAsync = require('../utils/catchAsync')

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
    //1) Get currently booked tour
    const tour = await Tour.findById(req.params.tourId);

    //2) create checkout session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: `${req.protocol}://${req.get('host')}/?tour=${tour.id}&user=${req.User.id}&price=${tour.price}`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${encodeURIComponent(tour.name)}`,
        customer_email: req.User.email,
        client_reference_id: req.params.tourId,
        line_items: [
            {
                price_data: {
                    currency: 'usd',
                    unit_amount: tour.price*100 ,
                    product_data: {
                        name: tour.name,
                        description: tour.summary,
                        images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
                    },
                },
                quantity:1
            }
        ],
        mode: 'payment',
    });
    //3) Create session report
    res.status(200).json({
        status: 'success',
        session
    })
})

exports.createBookingRoute=catchAsync(async(req,res,next)=>{
    

    const {tour,user,price}=req.query;

    if(!user && !tour && !price ) return next();

    const booking=await Booking.create({user , tour ,price});

    await User.findByIdAndUpdate(user,{$push:{bookTour:booking.id}},{
        new:true
    });


    res.redirect(req.originalUrl.split('?')[0]);

})