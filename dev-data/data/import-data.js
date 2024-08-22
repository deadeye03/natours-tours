const fs = require('fs')
const dotenv = require('dotenv')
dotenv.config({ path: './config.env' })

const mongoose = require('mongoose');
const DB = process.env.DATABASE.replace('<PASSWORD>',process.env.PASSWORD);
console.log(DB)
async function main() {
    try {
        if(await mongoose.connect(DB)){
            console.log("connection successfull to database");
        }
    }
    catch (err) {
        console.log("unable to connect database", err)
    }
}
main();

const Tour = require('./../../models/tourModel');
const User = require('./../../models/userModel');
const Review = require('./../../models/reviewModel');


const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'))
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'))
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'))

const importData = async () => {
    try {
        await Tour.create(tours);
        await User.create(users ,{validateBeforeSave:false});
        await Review.create(reviews);
        console.log('success')
    } catch (error) {
        console.log('failed', error)
    }
    process.exit();
}
// importData();
const deleteAllTours = async () => {
    try {
        await Tour.deleteMany()
        await User.deleteMany()
        await Review.deleteMany()
        console.log('success')
    } catch (error) {
        console.log('failed', error)
    }
    process.exit()
}
console.log(process.argv)
if (process.argv[2] === '--import') {
    importData();
}
else if (process.argv[2] === '--delete') {
    deleteAllTours();
}
