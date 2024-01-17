import mongoose from "mongoose";

//👇🏻 create a schema for the user
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  timezone: Object,
  schedule: Array,
  formResponse: Array,
});

// export default mongoose.model("User", userSchema);
export const UserModel = mongoose.model("User", userSchema);
