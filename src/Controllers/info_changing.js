import UserModel from "../Model/user.js";
import { UserError } from "../Errors/userError.js";
import bcrypt from "bcrypt";
import path from "path";
import { Story_model } from "../Model/story.js";
import { upload_on_cloudinery } from "../utility/cloudinery.js";
// Set up storage engine

export const editInfo = async (req, res) => {
  try {
    const { userName, password, gender, about } = req.body;

    const userName_check = await UserModel.findOne({ userName: userName });

    if (userName_check) {
      return res.status(400).json({ type: UserError.USERNAME_ALREADY_EXISTS });
    }

    const userID = req.user._id;

    const user = await UserModel.findById(userID);

    if (userName) {
      user.userName = userName;
    }
    if (password) {
      user.password = password;
    }
    if (gender) {
      user.gender = gender;
    }
    if (about) {
      user.about = about;
    }
    if (req.file) {
      const localFilePath = req.file.path;

      // Call your upload function
      const uploadResponse = await upload_on_cloudinery(localFilePath);

      if (uploadResponse) {
        // If upload is successful, return the URL of the uploaded file
        user.profilePic = uploadResponse.url;
        console.log(uploadResponse.data);
      }
    }
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }
    await user.save();
    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
    return res.status(500).json("internal server error");
  }
};

export const Uplaod_Story = async (req, res) => {
  try {
    const { content, story_discription } = req.body;
    const userID = req.user._id;
    const user = await UserModel.findById(userID);
    console.log(content);
    if (!user) {
      return res.status(404).json("user not found");
    }
    //   await Story_model.deleteMany({ _id: user.story });
    const newStory = new Story_model({
      content: content,
      available_from: new Date(),
      available_until: new Date(Date.now() + 24 * 60 * 60 * 1000),
      discription: story_discription,
    });

    if (content) {
      newStory.content = content;
    }
    await newStory.save();
    user.story = newStory._id;
    await user.save();
    console.log(user);
    return res.status(200).json(newStory);
  } catch (error) {
    return res.json(error);
  }
};

export const get_Story = async (req, res) => {
  try {
    const { id: userId } = req.params;
    const user = await UserModel.findById(userId);
    const story = user.story;

    const storyobj = await Story_model.findById(story);
    return res.status(200).json(storyobj);
  } catch (error) {
    return res.status(500).json("internal server error");
  }
};
