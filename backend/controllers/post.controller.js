import Notification from "../models/notification.model.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import { v2 as cloudinary } from "cloudinary";

export const createPost = async (req, res) => {
  try {
    const { text } = req.body;
    let { img } = req.body;
    const userId = req.user._id.toString();

    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ message: "Không tìm thấy người dùng" });

    if (!text && !img) {
      return res.status(400).json({ error: "Bài đăng không hợp lệ" });
    }

    if (img) {
      const uploadedResponse = await cloudinary.uploader.upload(img);
      img = uploadedResponse.secure_url;
    }

    const newPost = new Post({
      user: userId,
      text,
      img,
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ error: "Lỗi máy chủ nội bộ" });
    console.log("Error in createPost controller: ", error);
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Không tìm thấy bài đăng" });
    }

    if (post.user.toString() !== req.user._id.toString()) {
      return res
        .status(401)
        .json({ error: "Bạn không được phép xóa bài đăng này" });
    }

    if (post.img) {
      const imgId = post.img.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(imgId);
    }

    await Post.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Bài đăng được xóa thành công" });
  } catch (error) {
    console.log("Error in deletePost controller: ", error);
    res.status(500).json({ error: "Lỗi máy chủ nội bộ" });
  }
};

export const commentOnPost = async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params.id;
    const userId = req.user._id;

    if (!text) {
      return res.status(400).json({ error: "Không tìm thấy bình luận nào" });
    }
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: "Không tìm thấy bài đăng" });
    }

    const comment = { user: userId, text };

    post.comments.push(comment);
    await post.save();

    res.status(200).json(post);
  } catch (error) {
    console.log("Error in commentOnPost controller: ", error);
    res.status(500).json({ error: "Lỗi máy chủ nội bộ" });
  }
};

export const likeUnlikePost = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id: postId } = req.params;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: "Không tìm thấy bài đăng" });
    }

    const userLikedPost = post.likes.includes(userId);

    if (userLikedPost) {
      // Unlike post
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
      await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });

      const updatedLikes = post.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
      res.status(200).json(updatedLikes);
    } else {
      // Like post
      post.likes.push(userId);
      await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
      await post.save();

      const notification = new Notification({
        from: userId,
        to: post.user,
        type: "like",
      });
      await notification.save();

      const updatedLikes = post.likes;
      res.status(200).json(updatedLikes);
    }
  } catch (error) {
    console.log("Error in likeUnlikePost controller: ", error);
    res.status(500).json({ error: "Lỗi máy chủ nội bộ" });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    if (posts.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(posts);
  } catch (error) {
    console.log("Error in getAllPosts controller: ", error);
    res.status(500).json({ error: "Lỗi máy chủ nội bộ" });
  }
};
export const getCommentsByPostId = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId).populate({
      path: "comments.user",
      select: "fullName profileImg",
    });

    if (!post) {
      return res.status(404).json({ error: "Không tìm thấy bài đăng" });
    }

    const formattedComments = post.comments.map((comment) => ({
      _id: comment._id,
      text: comment.text,
      createdAt: comment.createdAt || post.createdAt,
      user: comment.user,
    }));

    res.status(200).json(formattedComments);
  } catch (error) {
    console.error("Lỗi khi lấy comments:", error);
    res.status(500).json({ error: "Lỗi máy chủ nội bộ" });
  }
};

export const getLikedPosts = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ error: "Không tìm thấy người dùng" });

    const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    res.status(200).json(likedPosts);
  } catch (error) {
    console.log("Error in getLikedPosts controller: ", error);
    res.status(500).json({ error: "Lỗi máy chủ nội bộ" });
  }
};

export const getFollowingPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ error: "Không tìm thấy người dùng" });

    const following = user.following;

    const feedPosts = await Post.find({ user: { $in: following } })
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    res.status(200).json(feedPosts);
  } catch (error) {
    console.log("Error in getFollowingPosts controller: ", error);
    res.status(500).json({ error: "Lỗi máy chủ nội bộ" });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username });
    if (!user)
      return res.status(404).json({ error: "Không tìm thấy người dùng" });

    const posts = await Post.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    res.status(200).json(posts);
  } catch (error) {
    console.log("Error in getUserPosts controller: ", error);
    res.status(500).json({ error: "Lỗi máy chủ nội bộ" });
  }
};
