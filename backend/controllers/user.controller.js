import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";
import Post from "../models/post.model.js";
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";

export const getUserProfile = async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username }).select("-password");
    if (!user)
      return res.status(404).json({ message: "Không tìm thấy người dùng" });

    res.status(200).json(user);
  } catch (error) {
    console.log("Error in getUserProfile: ", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const followUnfollowUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userToModify = await User.findById(id);
    const currentUser = await User.findById(req.user._id);

    if (id === req.user._id.toString()) {
      return res
        .status(400)
        .json({ error: "Bạn không thể theo dõi/bỏ theo dõi chính mình" });
    }

    if (!userToModify || !currentUser)
      return res.status(400).json({ error: "Không tìm thấy người dùng" });

    const isFollowing = currentUser.following.includes(id);

    if (isFollowing) {
      // Bỏ theo dõi người dùng
      await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });

      res.status(200).json({ message: "Người dùng đã bỏ theo dõi thành công" });
    } else {
      // Theo dõi người dùng
      await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });
      // Tạo thông báo theo dõi
      const newNotification = new Notification({
        type: "follow",
        from: req.user._id,
        to: userToModify._id,
      });

      await newNotification.save();

      res.status(200).json({ message: "Người dùng đã theo dõi thành công" });
    }
  } catch (error) {
    console.log("Error in followUnfollowUser: ", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getSuggestedUsers = async (req, res) => {
  try {
    const userId = req.user._id;

    const currentUser = await User.findById(userId).select("following");
    const followingIds = currentUser?.following || [];

    // Tìm tất cả user ngoại trừ bản thân
    const allOtherUsers = await User.find({ _id: { $ne: userId } }).select(
      "_id"
    );

    const unfollowedUsers = allOtherUsers.filter(
      (user) => !followingIds.includes(user._id)
    );

    if (unfollowedUsers.length === 0) {
      return res.status(200).json({
        message: "Bạn đã theo dõi mọi người rồi!",
        users: [],
      });
    }

    const randomUsers = await User.aggregate([
      { $match: { _id: { $ne: userId } } },
      { $sample: { size: 10 } },
    ]);

    const filteredUsers = randomUsers.filter(
      (user) => !followingIds.includes(user._id)
    );

    const suggestedUsers = filteredUsers.slice(0, 5).map((user) => {
      const { password, ...rest } = user;
      return { ...rest, password: null };
    });

    res.status(200).json({
      message: "Đã tìm thấy người dùng được đề xuất.",
      users: suggestedUsers,
    });
  } catch (error) {
    console.error("Error in getSuggestedUsers:", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    console.log("Error in getAllUsers: ", error.message);
    res.status(500).json({ error: error.message });
  }
};
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    // Kiểm tra nếu người dùng có tồn tại trong cơ sở dữ liệu
    const user = await User.findById(id);
    if (!user)
      return res.status(404).json({ message: "Không tìm thấy người dùng" });

    // Xóa tất cả bài đăng của người dùng
    const postsDeleted = await Post.deleteMany({ userId: id });
    console.log(`${postsDeleted.deletedCount} posts deleted`);

    // Xóa người dùng
    await User.findByIdAndDelete(id);

    res.status(200).json({
      message: "Người dùng và bài viết của họ đã được xóa thành công",
    });
  } catch (error) {
    console.log("Error in deleteUser: ", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const updateUser = async (req, res) => {
  const { fullName, email, username, currentPassword, newPassword, bio, link } =
    req.body;
  let { profileImg, coverImg } = req.body;

  const userId = req.user._id;

  try {
    let user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ message: "Không tìm thấy người dùng" });

    if (
      (!newPassword && currentPassword) ||
      (!currentPassword && newPassword)
    ) {
      return res.status(400).json({
        error: "Vui lòng cung cấp cả mật khẩu hiện tại và mật khẩu mới",
      });
    }

    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch)
        return res.status(400).json({ error: "Mật khẩu hiện tại không đúng" });
      if (newPassword.length < 6) {
        return res
          .status(400)
          .json({ error: "Mật khẩu phải dài ít nhất 6 ký tự" });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    if (profileImg) {
      if (user.profileImg) {
        await cloudinary.uploader.destroy(
          user.profileImg.split("/").pop().split(".")[0]
        );
      }

      const uploadedResponse = await cloudinary.uploader.upload(profileImg);
      profileImg = uploadedResponse.secure_url;
    }

    if (coverImg) {
      if (user.coverImg) {
        await cloudinary.uploader.destroy(
          user.coverImg.split("/").pop().split(".")[0]
        );
      }

      const uploadedResponse = await cloudinary.uploader.upload(coverImg);
      coverImg = uploadedResponse.secure_url;
    }

    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.username = username || user.username;
    user.bio = bio || user.bio;
    user.link = link || user.link;
    user.profileImg = profileImg || user.profileImg;
    user.coverImg = coverImg || user.coverImg;

    user = await user.save();

    user.password = null;

    return res.status(200).json(user);
  } catch (error) {
    console.log("Error in updateUser: ", error.message);
    res.status(500).json({ error: error.message });
  }
};
