import express from "express";
import mongoose from "mongoose"

// const dbConfig = () => {
//   mongoose.connect(
//     process.env.DB_CONNECT,
//     {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     },
//     (err) => {
//       if (!err) console.log("Mongodb connected ");
//       else console.log("Connection error:" + err);
//     }
//   )};
 
export default dbConfig