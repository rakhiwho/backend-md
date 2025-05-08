import mongoose, { Schema, model } from "mongoose";
import { UserError } from "../Errors/userError.js";
import PostModel from "../Model/post.js";
import UserModel from "../Model/user.js";
import CommentModel from "../Model/comments.js";
import { upload_on_cloudinery } from "../utility/cloudinery.js";

export const post = async (req, res) => {
  try {
    const content = req.files;

    const userID = req.user._id;
    const user = await UserModel.findById(userID);
    if (!user) {
      return res.status(404).json({ type: UserError.NO_USER_FOUND });
    }
    const uploadResponses = [];
    const { caption } = req.body;

    for (const file of content) {
      const response = await upload_on_cloudinery(file.path);
      console.log(response.url);
      uploadResponses.push(response.url);
    }
    console.log(uploadResponses);
    const newPost = new PostModel({
      post: uploadResponses,
      caption: caption ? caption : "",
      owner: user._id,
    });
    if (!newPost) {
      return res
        .status(400)
        .json("somthing weent wrong could not create post!");
    }
    await newPost.save();

    user.posts.push(newPost._id);

    await user.save();

    return res.status(200).json(newPost);
  } catch (error) {
    return res.status(500).json("intrnal server error!");
  }
};

export const Add_comments = async (req, res) => {
  try {
    const { comments } = req.body;

    const { id } = req.params;
    const userID = req.user._id;

    const post = await PostModel.findById(id);

    if (!comments) {
      return res.status(400).json("cant post blank as a comment");
    }
    if (!post) {
      return res.status(404).json("post not found try another path may be!");
    }

    const comment = new CommentModel({
      comment: comments,
      commentedBy: userID,
    });
    await comment.save();

    post.comments.push(comment._id);

    await post.save();

    return res.status(200).json(comment);
  } catch (error) {
    return res.status(500).json("internal server error");
  }
};

export const get_comment = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await PostModel.findById(id);

    const comments = post.comments;

    const commentPromises = comments.map((commentId) => {
      if (mongoose.Types.ObjectId.isValid(commentId)) {
        return CommentModel.findById(commentId);
      }
      return null;
    });
    const result = await Promise.all(commentPromises);

    if (result.length === 0) {
      return res.status(200).json([]);
    }
    return res.status(200).json(result);
  } catch (error) {
    console.log(error);
    return res.status(500).json("internal server error");
  }
};

export const likes = async (req, res) => {
  try {
    const { postID, commentID } = req.body;
    const userID = req.user._id;

    const user = await UserModel.findById(userID);
    if (postID) {
      const post = await PostModel.findById(postID);
      if (post.likedBy.includes(userID)) {
        await post.updateOne({ $pull: { likedBy: userID } });

        await user.updateOne({ $pull: { postsLikedByYou: post._id } });
      } else {
        post.likedBy.push(req.user._id);
        user.postsLikedByYou.push(post._id);
      }
      if (post.likedBy.length != 0) {
        console.log(post.likedBy.length);
        post.likes = post.likedBy.length;
      } else {
        post.likes = 0;
      }
      await user.save();
      await post.save();
      return res.status(200).json(post);
    }
    if (commentID) {
      const comment = await CommentModel.findById(commentID);
      if (comment.likedBy.includes(userID)) {
        await comment.updateOne({ $pull: { likedBy: userID } });
      } else {
        comment.likedBy.push(req.user._id);
      }
      comment.likes = comment.likedBy.length;

      await comment.save();
      return res.status(200).json(comment);
    }

    return res.status(200).json(user.posts);
  } catch (error) {
    return res.status(500).json("internal server error");
  }
};

// get posts from specific user
export const get_post = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await UserModel.findById(id);

    if (!user) {
      return res.status(404).json({ type: UserError.NO_USER_FOUND });
    }

    const PostId = user.posts;

    const post_URLs = [];

    for (const file of PostId) {
      const post = await PostModel.findById(file);
      post_URLs.push(post);
    }

    if (post_URLs.length === 0) {
      return res.status(200).json("user has not posted anything yet");
    }

    return res.status(200).json(post_URLs);
  } catch (error) {
    return res.status(500).json("internal server error");
  }
};
// get post for people you follow and your post

export const allPost = async (req, res) => {
  try {
    const userID = req.user._id;
    const user = await UserModel.findById(userID);

    const followingIds = user.following.map(
      (id) => new mongoose.Types.ObjectId(id)
    ); // Convert following to ObjectId

    const posts = await PostModel.find({
      owner: { $in: followingIds },
      privacy: { $in: ["public", "following"] },
    }).sort({ createdAt: -1 });

    const postFromUser = await PostModel.find({ owner: user._id });

    postFromUser.map((p) => posts.push(p));
    const sortedPosts = posts.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    if (!posts) {
      return res.status(404).json({ message: "No posts found" });
    }
    if (posts.length === 0) {
      return res.status(200).json([]);
    }

    return res.status(200).json(sortedPosts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const exploreGetPost = async (req, res) => {
  try {
    const posts = await PostModel.find({ privacy: "public" }).sort({
      likes: -1,
      comments: -1,
    });
    if (posts.length === 0) {
      return res.status(404).json({ message: "No public posts found" });
    }
    return res.status(200).json(posts);
  } catch (error) {
    console.log(error);
    return res.status(500).json("internal server error");
  }
};

export const delete_post = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await PostModel.findById(id);

    if (!post) {
      return res.status(404).json("post not found");
    }

    if (post.owner != req.user._id.toString()) {
      return res.status(401).json("you are not authorized to delete this post");
    }
    const deleted_message = await post.deleteOne();

    return res.status(200).json(deleted_message);
  } catch (error) {
    return res.status(500).json("internal server error");
  }
};

export const edit_post = async (req, res) => {
  try {
    const { id } = req.params;

    const { content } = req.body;

    const post = await PostModel.findById(id);

    if (!post) {
      return res.status(404).json("post is not available");
    }
    if (post.owner.toString() != req.user._id.toString()) {
      return res.status(401).json("you are not authorized to edit this post");
    }
    post.caption = content;
    await post.save();
    console.log(post);
    return res.status(200).json(post);
  } catch (error) {
    console.log(error);
    return res.status(500).json("internal server error");
  }
};

export const save_post = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await PostModel.findById(id);

    if (!post) {
      return res.status(404).json("post not available");
    }

    const user = await UserModel.findById(req.user._id);

    user.savedPosts.push(post._id);
  } catch (error) {
    return res.status(500).json("internal server error");
  }
};
