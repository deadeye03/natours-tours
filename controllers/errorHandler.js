const AppError=require('./../utils/appError')

//1) Handle castError when your try to get data from wrong params path
const handleCastErrorDB=err=>{
  const message=`Invaild ${err.path} : ${err.value}`
  return new AppError(message,400)
}

//2) Handle Duplicate Name when user try to enter duplicate name
const handleDuplicateName =err=>{
  const message=` "${err.keyValue.name}" Name already avilable in DB please enter another name`
  return new AppError(message,404)
}

//3) Handle all validation errror of model(schema) like minlength,String many more
const handleValidatorError=err=>{
  const errors=Object.values(err.errors).map(el=> el.message)
  const message=`Invaild input data :- ${errors.join('. ')}`
  return new AppError(message,404)
}
//4) Handle Invalid token when user try to get data from wrong token
const handleJsonWebTokenError=()=> new AppError('Invalid token Please Login Again!',401);
//5) Handle Expire token when user try to get data from a expire token
const handleTokenExpiredError=()=> new AppError('Your session has Expire! Please Login Again!',401);

///////////////////
//// This handle the error in dev mode
const sendErrorDev=(err,req,res)=>{
  //A)Api
  if (req.originalUrl.startsWith('/api')) {
   return res.status(err.statusCode).json({
      status:err.status,
      error:err,
      message:err.message,
      stack:err.stack
    });
    
  }
  console.log('Error: ',err);
  //Render Website
  return res.status(err.statusCode).render('error',{
    title:'Something went wrong',
    msg:err.message
  });
}

/// Its handle ther error in production mode
const sendErrorProd=(err,req,res)=>{
  //Operational trusted error send to client
  if (req.originalUrl.startsWith('/api')) {
    if(err.isOperational){
     return res.status(err.statusCode).json({
        status:err.status,
        message:err.message
      })
  
    }
  }
  //Generic error send to client When we dont clear about the error
    //B)Rendering error messsage on website
    // 2) send generic message
   return res.status(err.statusCode).render('error',{
      title:'Something went wrong',
      msg:err.message
    })
  

}

//ALL handle error concept 
module.exports=(err,req,res,next)=>{   //Exports to app.js As global handler
    // console.log(err.stack)

    err.statusCode=err.statusCode || 500;
    err.status=err.status || 'error' ;
  
    if(process.env.NODE_ENV==='development'){
      sendErrorDev(err,req,res);
    }
    else if(process.env.NODE_ENV==='production'){
      let error={...err}
      error.message=err.message
      if (err.name === 'CastError') error=handleCastErrorDB(error);
      if(error.code === 11000) error=handleDuplicateName(error);
      if(error.name==='ValidatorError') error=handleValidatorError(error);
      if(error.name==='JsonWebTokenError') error=handleJsonWebTokenError();
      if(error.name==='TokenExpiredError') error=handleTokenExpiredError();
      sendErrorProd(error,req, res)
    }
   next();
}