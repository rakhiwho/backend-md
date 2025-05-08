import express from "express";
import jwt from "jsonwebtoken";

import UserModel from "../Model/user.js";

export const verifyToken = async (req, res, next) => {
  try {
    const token = req.cookies.access_token;

    if (!token) {
      return res.status(401).json({ error: "missing token" });
    }
    const decoded = jwt.verify(token, process.env.SECRET);

    if (!decoded) {
      return res.status(401).json({ error: "unauthorized , invalid" });
    }

    const user = await UserModel.findById(decoded.userID).select("-password");
    console.log(user)
    if (!user) {
      return res.status(404);
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ error: "internal error" });
  }
};
