import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username is required"],
    unique: true,
    minlength: [3, "Username must be at least 3 characters long"],
    match: [/^[a-zA-Z0-9]+$/, "Username can only contain letters and numbers"],
  },
  name: {
    type: String,
    trim: true,
  },
  passwordHash: {
    type: String,
    required: [true, "Password hash is required"],
  },
  blogs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Blog" }],
});

userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    // the passwordHash should not be revealed
    delete ret.passwordHash;
  },
});

export const User = mongoose.model("User", userSchema);
