import mongoose from "mongoose";
import AircraftModel from "./models/aircraftModel";

export default async function () {
  try {
    const conn = await mongoose.connect(`${process.env.DB_URL}`, {
      autoIndex: process.env.NODE_ENV === "development" // Auto-index in dev only
    });

    // Create indexes after connection
    await createAircraftIndexes();

    console.log("DataBase Connected Successfully on port " + conn.connection.host);
  } catch (error) {
    if (process.env.NODE_ENV === "development") console.log(error);
    else console.log("Database connection failed. Exiting!");
    process.exit(1);
  }
};

async function createAircraftIndexes() {
  try {
    await AircraftModel.collection.createIndex(
      { category: 1 },
      {
        collation: {
          locale: 'en',
          strength: 2 // Case-insensitive
        },
        name: 'category_case_insensitive_idx'
      }
    );
  } catch (error) {
    console.error('Error creating aircraft indexes:', error);
  }
}