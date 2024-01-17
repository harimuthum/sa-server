import mongoose from "mongoose";

const responseFormModel = new mongoose.Schema({
  artist_id: String,
  clientName: String,
  clientEmail: String,
  message: String,
  duration: String,
  appointment: {
    day: String,
    startTime: String,
    endTime: String,
  },
  statusOfClient: {
    type: String,
    default: "pending",
  },
});

export const ResponseFormModel = mongoose.model(
  "ClientResponse",
  responseFormModel
);
