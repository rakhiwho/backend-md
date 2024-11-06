import { Schema, model } from "mongoose";
import mongoose from "mongoose";

const convoSchema = new Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "messages",
        default: [],
      },
    ],
  },
  { timestamps: true }
);

const convoModel = model("convo", convoSchema);

export default convoModel;
