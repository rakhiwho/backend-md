import mongoose from "mongoose";
import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    userName: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    profilePic: {
      type: String,
      default: "",
    },
    about: {
      type: String,
      default: "",
    },
    gender: {
      type: String,
      default: "",
    },
    convos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "convo",
        default: [],
      },
    ],
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        default: [],
      },
    ],
    story: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "story",
    },
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "post",
        default: [],
      },
    ],
    postsLikedByYou: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "post",
        default: [],
      },
    ],
    savedPosts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "post",
        default: [],
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        default: [],
      },
    ],
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        default: [],
      },
    ],
    followersCount: {
      type: Number,
      default: 0,
    },
    followingCount: {
      type: Number,
      default: 0,
    },
    privacy: {
      postVisibility: {
        type: String,
        enum: ["public", "private", "following"], // Who can see posts
        default: "public",
      },
    },
  },
  { timestamps: true }
);

const UserModel = model("user", userSchema);

export default UserModel;
