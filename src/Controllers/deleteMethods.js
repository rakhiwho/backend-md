import express from "express";
import UserModel from "../Model/user.js";
import { UserError } from "../Errors/userError.js";
import { Story_model } from "../Model/story.js";
import messageModel from "../Model/message.js";

export const deleteUser = async (req, res) => {
  try {
    const userID = req.user._id;

    const user = await UserModel.findByIdAndDelete(userID);

    if (!user) return res.status(404).json(UserError.NO_USER_FOUND);

    return res.status(200).json("dalted user successfully : ", user);
  } catch (error) {
    return res.status(500).json("internal server error");
  }
};

export const delete_Story = async (req, res) => {
  try {
    const { userID } = req.params;

    //    const  user = await UserModel.findById(userID);
    //   const story = await Story_model.findByIdAndDelete(user.story);
    //  await user.save();
    const user = await UserModel.findByIdAndUpdate(
      userID,
      { $unset: { story: null } }, // Use $unset to remove the property
      { new: true } // Return the updated document
    );

    if (!story) {
      return res.status(400).json(UserError.MISSING_INFO);
    }
    return res.status(200).json("story deleted successfully :", story);
  } catch (error) {
    return res.status(500).json("internal server error");
  }
};

export const deleteMassege = async (req, res) => {
  try {
    const { id } = req.query;

    const message = await messageModel.findById(id);
    if (!message) {
      return res.status(404).json("message no available");
    }

    console.log(message);
    const validOwner = req.user._id.toString() === message.senderID.toString();

    let deleted_message = {};
    if (validOwner) {
      message.deleteOne();
    } else {
      return res.status(403).json("you are not allowed to delete message");
    }

    return res.status(200).json(deleted_message);
  } catch (error) {
    return res.status(500).json("internal server error");
  }
};
