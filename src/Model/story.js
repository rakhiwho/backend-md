import { Schema, model } from "mongoose";

export const story_Schema = new Schema({
  content: {
    type: String,
  },
  available_from: Date,
  available_until: Date,
  discription: {
    type: String,
    require: false,
  },
});

export const Story_model = model("story", story_Schema);
