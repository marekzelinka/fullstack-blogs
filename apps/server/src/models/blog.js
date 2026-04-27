import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
  title: { type: String, required: [true, "Title is required"] },
  author: String,
  url: { type: String, required: [true, "Url is missing"] },
  likes: { type: Number, default: 0 },
});

blogSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  },
});

export const Blog = mongoose.model("Blog", blogSchema);
