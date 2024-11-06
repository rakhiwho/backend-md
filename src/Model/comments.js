import mongoose, { Schema, model } from "mongoose";

const commentSchema = new Schema({
  comment: {
    type: String,
    required: true,
  },
  commentedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },

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
});

const CommentModel = model("comment", commentSchema);

export default CommentModel;
