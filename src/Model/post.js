import { Schema, model } from "mongoose";
import mongoose from "mongoose";

const postSchema = new Schema(
  {
    post: [
      {
        type: String,
        required: true,
        default: [],
      },
    ],
    caption: {
      type: String,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "comment",
        default: [],
      },
    ],
    likes: {
      type: Number,
      default: 0,
    },
    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        default: [],
      },
    ],
    privacy: {
      type: String,
      enum: ["public", "private", "following"], // Who can see posts
      default: "public",
    },
  },
  { timestamps: true }
);

const PostModel = model("post", postSchema);

export default PostModel;
