const mongoose=require("mongoose");

const bookingSchema=new mongoose.Schema({
  destination:{
    type: String,
    required:true,
  },
  guests:{
    type:Number,
  },
  arrival:{
    type:Date,
  },
  departure:{
    type:Date,
  },
  bookingSite:{
    type:String,
  }
}

);

const Booking=new mongoose.model("booking",bookingSchema);
module.exports=Booking;