import { generateToken } from "../lib/utils/generateToken.js";
import User from "../models/user.model.js";

export const signup = async (req, res) => {
  try {
    const { fullName, username, email, password } = req.body;

    if (!fullName || !username || !email || !password) {
      return res.status(400).json({ error: "Vui lòng điền đầy đủ thông tin" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Định dạng email không hợp lệ" });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Tên người dùng đã được sử dụng" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: "Email đã được sử dụng" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Mật khẩu phải dài ít nhất 6 ký tự" });
    }

    const profileImg = `https://api.dicebear.com/7.x/notionists/png?seed=${username}`;
    const user = new User({
      fullName,
      username,
      email,
      password,
      profileImg,
    });
    await user.save();
    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        followers: user.followers,
        following: user.following,
        profileImg: user.profileImg,
        coverImg: user.coverImg,
      },
    });
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ error: "Lỗi máy chủ nội bộ" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Vui lòng điền đầy đủ thông tin" });
    }
    const user = await User.findOne({ email });

    if (!user)
      return res.status(400).json({ message: "Người dùng không tồn tại" });

    const isPasswordCorrect = await user.comparePassword(password);

    console.log(isPasswordCorrect);
    if (!isPasswordCorrect) {
      return res
        .status(400)
        .json({ message: "Mật khẩu đăng nhập không hợp lệ" });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        followers: user.followers,
        following: user.following,
        profileImg: user.profileImg,
        coverImg: user.coverImg,
      },
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ error: "Lỗi máy chủ nội bộ" });
  }
};

export const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Đã đăng xuất thành công" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ error: "Lỗi máy chủ nội bộ" });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.status(200).json(user);
  } catch (error) {
    console.log("Error in getMe controller", error.message);
    res.status(500).json({ error: "Lỗi máy chủ nội bộ" });
  }
};
