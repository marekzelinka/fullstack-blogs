import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
  title: { type: String, required: [true, "Title is required"] },
  author: String,
  url: { type: String, required: [true, "Url is missing"] },
  likes: { type: Number, default: 0, min: 0 },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "A blog must belong to a owner"],
    immutable: [true, "Changing the owner of a blog is not allowed"],
  },
});

blogSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  },
});

export const Blog = mongoose.model("Blog", blogSchema);
