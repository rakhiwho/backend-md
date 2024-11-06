import UserModel from "../Model/user.js";
import { UserError } from "../Errors/userError.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import PostModel from "../Model/post.js";

export const get_loggedIn_User = async (req, res) => {
  try {
    const userID = req.user._id;
    const info = await UserModel.findById(userID).select("-password");
    if (!info) {
      return res.status(404).json({ type: UserError.NO_USER_FOUND });
    }
    return res.status(200).json(info);
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getusers = async (req, res) => {
  try {
    const userID = req.user._id;
    const allUsers = await UserModel.find({ _id: { $ne: userID } });
    return res.status(200).json(allUsers);
  } catch (error) {
    return res.status(500).json({ message: "something went wrong" });
  }
};

export const register = async (req, res) => {
  const { userName, password } = req.body;

  if (!userName || !password) {
    return res.status(400).json({ type: UserError.MISSING_INFO });
  }

  try {
    const user = await UserModel.findOne({ userName: userName });
    console.log("hey its success till here");
    if (user) {
      return res.status(400).json({ type: UserError.USERNAME_ALREADY_EXISTS });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new UserModel({ userName, password: hashedPassword });
    await newUser.save();
    res.json({ message: "user successfully registered" });
  } catch (error) {
    res.status(500).json("something went srong");
  }
};

export const login = async (req, res) => {
  const { userName, password } = req.body;

  if (!userName || !password) {
    return res.status(400).json({ type: UserError.MISSING_INFO });
  }
  try {
    const user = await UserModel.findOne({ userName: userName });
    if (!user) {
      return res.status(400).json({ type: UserError.NO_USER_FOUND });
    }
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(500).json({ type: UserError.WRONG_CREDENIALS });
    }

    const token = jwt.sign({ userID: user._id }, process.env.SECRET , { expiresIn: "1h" });
    res.cookie("access_token", token, { httpOnly: true, secure: false });
    res.json({ token, userID: user._id });
  } catch (error) {
    res.status(401).json({ type: error });
  }
};

export const change_user_privacy = async (req, res) => {
  try {
    const { privacy } = req.body;

    const validOptions = ["public", "private", "following"];
    if (!validOptions.includes(privacy)) {
      return res.status(400).json("invallid option for settings");
    }
    const user = await UserModel.findById(req.user._id);
    user.privacy.postVisibility = privacy;

    user.save();
    const posts = await PostModel.find({ owner: user._id });
    posts.map((p) => {
      p.privacy = privacy;
      p.save();
    });
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json("internal server error");
  }
};
