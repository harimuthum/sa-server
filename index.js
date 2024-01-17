import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import { UserModel } from "./models/user-model.js";
import { ResponseFormModel } from "./models/response-model.js";

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());

app.post("/register", (req, res) => {
  const { username, email, password } = req.body;
  const newUser = new UserModel({
    username,
    email,
    password,
    timezone: {},
    schedule: [],
    formResponse: [],
  });

  newUser
    .save()
    .then(() => {
      return res.status(201).json({ message: "Account created successfully!" });
    })
    .catch((err) => {
      return res.status(400).json({ error_message: err.message });
    });
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const foundUser = await UserModel.findOne({ username });
  if (!foundUser) {
    return res.json({ error_message: "Incorrect credentials" });
  }
  if (foundUser.password !== password) {
    return res.json({ error_message: "Incorrect credentials" });
  }

  res.status(200).json({
    message: "Login successfully",
    data: {
      _id: foundUser._id,
      _email: foundUser.email,
      _username: foundUser.username,
    },
  });
});

//✅
app.post("/api/artist/set-schedule-timezone", (req, res) => {
  const { userId, timezone, schedule } = req.body;

  UserModel.findByIdAndUpdate(
    userId,
    {
      timezone,
      schedule,
    },
    { new: true }
  )
    .then((data) => {
      res.status(200).json({
        message: "Schedule created successfully",
        data: data,
      });
    })
    .catch((err) => {
      res.status(400).json({
        error_message: err.message,
      });
    });
});

//✅Fetch the artist's schedule and timezone for profile page
app.get("/api/artist/get-schedule/:id", (req, res) => {
  const { id } = req.params;

  UserModel.findById(id)
    .then((userData) => {
      res.status(200).json({
        message: "Schedules fetched successfully",
        data: userData,
      });
    })
    .catch((err) => {
      res.status(400).json({
        error_message: err.message,
      });
    });
});

//✅ To get artist's schedule and timezone for the form inputs
app.post("/api/form/get-schedule-timezone", async (req, res) => {
  const { username } = req.body;

  try {
    const foundUser = await UserModel.findOne({ username });
    if (foundUser) {
      const filteredSchedule = foundUser.schedule.filter(
        (schedule) => schedule.startTime !== "" || schedule.endTime !== ""
      );
      return res.json({
        message: "Schedules successfully retrieved!",
        schedules: filteredSchedule,
        timezone: foundUser.timezone,
        receiverEmail: foundUser.email,
      });
    } else {
      return res.json({ error_message: "User doesn't exist" });
    }
  } catch (err) {
    return res.json({ error_message: err.message });
  }
});

//✅ To save the submitted form
app.post("/api/form/save-submitted-form", async (req, res) => {
  const { user_id } = req.body;
  const {
    artistEmail,
    clientEmail,
    clientName,
    message,
    duration,
    appointment,
  } = req.body;

  const foundUser = await UserModel.findById(user_id);
  // console.log(foundUser.email);

  if (foundUser.email !== "") {
    if (foundUser.email !== artistEmail) {
      console.log(foundUser.email);
    }

    const newResponse = new ResponseFormModel({
      artist_id: user_id,
      clientName: clientName,
      clientEmail,
      message,
      duration,
      appointment,
    });

    newResponse
      .save()
      .then(() => {
        return res.json({ message: "Response saved" });
      })
      .catch((err) => {
        console.log(err.message);
        return res.json({ error_message: "Something went wrong!!" });
      });
  } else {
    return res.json({ error_message: "User doesn't exist" });
  }
});

//✅ To get the artist's form responses for Landing Page
app.post("/api/form/get-form-responses", (req, res) => {
  const { userID } = req.body;

  ResponseFormModel.find({ artist_id: userID })
    .then((data) => {
      console.log(data);
      return res.json({
        message: "Form response fetched successfully",
        data: data,
      });
    })
    .catch((err) => {
      return res.json({ error_message: err.message });
    });
});

app.get("/", (req, res) => {
  //Display all users from mongoose
  const users = UserModel.find({});
  users
    .then((data) => {
      res.status(200).json({
        message: "Users fetched successfully",
        data: data,
      });
    })
    .catch((err) => {
      res.status(400).json({
        error_message: err.message,
      });
    });
});

//👇🏻 connect to the database
mongoose
  .connect("mongodb+srv://harimuthuu:hari123@sa.4oon3kk.mongodb.net/sa-app", {})
  .then(() => console.log("Connected to Mongo Atlas"))
  .catch((err) => console.log(err.message));

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
