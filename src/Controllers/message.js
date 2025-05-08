import mongoose, { Types, ObjectId } from "mongoose";
import UserModel from "../Model/user.js";
import messageModel from "../Model/message.js";
import convoModel from "../Model/convo.js";
import { getRecieverSocketID } from "../socket.io/socket.js";
import { io } from "../socket.io/socket.js";

export const sendFunction = async (req, res) => {
  try {
    const { messages } = req.body;
    const { id } = req.params;
    const user = req.user;

    const senderID = user._id;
    const receiver = await UserModel.findById(id);
    const receiverID = receiver._id;

    if (!senderID || !receiverID || !messages) {
      console.log("yrytuhg");
      return res
        .status(400)
        .json({ error: "senderID, receiverID, and messages are required" });
    }

    const newMessage = new messageModel({
      senderID: senderID,
      receiverID: receiverID,
      messages,
    });

    let convo = await convoModel.findOne({
      participants: {
        $all: [senderID, receiverID],
      },
    });
    if (!convo) {
      convo = await convoModel.create({
        participants: [senderID, receiverID],
        messages: [],
      });
    }

    if (newMessage) {
      convo.messages.push(newMessage._id);
    }
    console.log(user.convos.includes());

    if (!user.convos.includes(convo._id)) {
      user.convos.push(convo._id);
    }
    if (!receiver.convos.includes(convo._id)) receiver.convos.push(convo._id);

    await newMessage.save();
    await convo.save();
    await user.save();
    await receiver.save();
    const receiverSocketID = getRecieverSocketID(receiverID);

    if (receiverSocketID) {
      io.to(receiverSocketID).emit("newMessage", newMessage);
    }

    return res.status(200).json(newMessage);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "internal server errror" });
  }
};

export const getFunction = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const senderID = user._id;
    const userToChatID = await UserModel.findById(id);

    const conversation = await convoModel
      .findOne({
        participants: {
          $all: [senderID, userToChatID._id],
        },
      })
      .populate("messages");
    if (!conversation) return res.status(200).json([]);
    return res.status(200).json(conversation);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "internal server errror" });
  }
};

export const delete_convo = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await UserModel.findById(req.user._id);

    if (!user) {
      return res.status(401).json("user is not auuthorized");
    }

    const convo = await convoModel.findById(id);

    if (!convo) {
      return res.status(404).json("convo  not found");
    }
    if (user.convos.includes(convo._id)) {
      const con = await user.updateOne({ $pull: { convos: convo._id } });
      return res.status(200).json(con);
    }

    return res.status(200).json("cant delete this message!");
  } catch (error) {
    return res.status(500).json("internal server error");
  }
};
