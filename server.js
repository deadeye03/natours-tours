
const server =require('./app')
const dotenv=require('dotenv');
dotenv.config({path:'./config.env'})  
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

const port=process.env.PORT || 3001

server.listen(port,()=>{
    console.log("server listen at ",port)
})

process.on('unhandledRejection',err=>{
    console.log('UNHANDLED REJECTION SERVER SHUTING DOWN');
    // server.close(()=>{
    //     process.exit(1);
    // })
});