import express from "express";
import UserModel from "../Model/user.js";
import mongoose from "mongoose";
import { UserError } from "../Errors/userError.js";
import convoModel from "../Model/convo.js";

export const userInfo = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await UserModel.findById(id);

    if (!user) {
      return res.status(404).json({ type: UserError.NO_USER_FOUND });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json("internal server error");
  }
};
export const friends = async (req, res) => {
  // Assuming you have a message model defined

  try {
    const Message = mongoose.model("messages");

    const userId = req.user._id;

    const results = await convoModel.aggregate([
      {
        $match: {
          _id: { $in: req.user.convos }, // Match conversations that are in the user's convos array
        },
      },
      {
        // Lookup the latest message from the messages array
        $lookup: {
          from: "messages", // Collection name for messages
          localField: "messages", // Field in convoModel (array of message IDs)
          foreignField: "_id", // Corresponding field in messages collection
          as: "messageDetails", // Store the results in 'messageDetails'
        },
      },
      {
        // Unwind the messageDetails array to work with individual messages
        $unwind: "$messageDetails",
      },
      {
        // Sort the messages by the timestamp in descending order to get the latest message
        $sort: { "messageDetails.createdAt": -1 },
      },
      {
        // Group by conversation ID, and take the latest message from the group
        $group: {
          _id: "$_id", // Group by conversation ID
          participants: { $first: "$participants" }, // Keep the participants array
          latestMessage: { $first: "$messageDetails" }, // Get the latest message
        },
      },
      {
        // Optionally sort the conversations by the latest message time
        $sort: { "latestMessage.createdAt": -1 },
      },
      {
        // Now group the conversations based on the user (sender/receiver other than the current user)
        $addFields: {
          otherUser: {
            $cond: [
              { $eq: ["$latestMessage.senderID", userId] }, // If the user is the sender
              "$latestMessage.receiverID", // Group by receiver ID
              "$latestMessage.senderID", // Otherwise, group by sender ID
            ],
          },
        },
      },
      {
        // Optionally sort the conversations by the latest message time
        $sort: { "latestMessage.createdAt": -1 },
      },
    ]);

    let result = [];
    if (results) {
      for (const u of results) {
        const userID = await UserModel.findById(u?.otherUser);

        if (userID) {
          result.push(userID);
        }
      }
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json("internal error");
  }
};

export const follow = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await UserModel.findById(id);
    const authorizedUser = await UserModel.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ type: UserError.NO_USER_FOUND });
    }

    if (
      user.followers.includes(authorizedUser._id) &&
      authorizedUser.following.includes(user._id)
    ) {
      await user.updateOne({ $pull: { followers: authorizedUser._id } });
      await authorizedUser.updateOne({ $pull: { following: user._id } });
      authorizedUser.followingCount = authorizedUser.following.length;
      user.followersCount = user.followers.length;
      return res.status(200).json({ user, authorizedUser });
    } else {
      user.followers.push(authorizedUser._id);
      authorizedUser.following.push(user._id);
      console.log("yes");
      user.save();
      authorizedUser.save();
    }
    user.followersCount = user.followers.length;
    authorizedUser.followingCount = authorizedUser.following.length;

    return res.status(200).json({ user, authorizedUser });
  } catch (error) {
    return res.status(500).json("internal server error!");
  }
};

export const get_following_followers = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await UserModel.findById(new mongoose.Types.ObjectId(id));

    let followers = [];

    if (user.followers.length != 0) {
      followers = user.followers.map((f) => {
        if (mongoose.Types.ObjectId.isValid(f)) {
          return UserModel.findById(f);
        } else {
          return null;
        }
      });
      followers = await Promise.all(followers);
    }
    let following = [];

    if (user.following.length != 0) {
      following = user.following.map((f) => {
        if (mongoose.Types.ObjectId.isValid(f)) {
          return UserModel.findById(f);
        } else {
          return null;
        }
      });
      following = await Promise.all(following);
    }
    return res.status(200).json({ following, followers });
  } catch (error) {
    console.log(error);
    return res.status(500).json("internal server errror");
  }
};
