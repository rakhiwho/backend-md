import mongoose, { Schema, model } from "mongoose";

const messageSchema = new Schema(
  {
    senderID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    receiverID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    messages: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const messageModel = model("messages", messageSchema);

export default messageModel;
