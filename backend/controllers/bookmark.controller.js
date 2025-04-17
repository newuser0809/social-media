import Bookmark from "../models/bookmark.model.js";
import Post from "../models/post.model.js";

// @desc    Thêm bài viết vào bookmark
export const addBookmark = async (req, res) => {
  const userId = req.user._id;
  const { postId } = req.body;

  try {
    // Kiểm tra post có tồn tại không
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    // Tạo bookmark nếu chưa có
    const bookmark = await Bookmark.findOneAndUpdate(
      { user: userId, post: postId },
      {},
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(201).json(bookmark);
  } catch (err) {
    console.error("Error adding bookmark:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// @desc    Xoá bài viết khỏi bookmark
export const removeBookmark = async (req, res) => {
  const userId = req.user._id;
  const { postId } = req.params;

  try {
    const bookmark = await Bookmark.findOneAndDelete({
      user: userId,
      post: postId,
    });

    if (!bookmark) return res.status(404).json({ error: "Bookmark not found" });

    res.status(200).json({ message: "Bookmark removed successfully" });
  } catch (err) {
    console.error("Error removing bookmark:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// @desc    Lấy tất cả bookmarks của người dùng
export const getBookmarks = async (req, res) => {
  const userId = req.user._id;

  try {
    const bookmarks = await Bookmark.find({ user: userId }).populate("post");

    res.status(200).json(bookmarks);
  } catch (err) {
    console.error("Error getting bookmarks:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
