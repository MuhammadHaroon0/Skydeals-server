////////////////////////////Packages
import dotenv from 'dotenv';
dotenv.config();

process.on("uncaughtException", (err) => {
  console.log(`${err.name} : ${err.message}`);
  console.log("Shutting down App");
  process.exit(1);
});

///////////////////////////Files
import app from "./app";
import connectDB from "./db";
connectDB();

const server = app.listen(process.env.PORT || 5000, () => {
  console.log("Server started at port " + process.env.PORT);
});

process.on("unhandledRejection", (err: Error, promise) => {
  console.log(`${err.name} : ${err.message}`);
  console.log(`Atpromise: ${promise}`);
  console.log("Shutting down App");
  server.close(() => {
    process.exit(1);
  });
});
