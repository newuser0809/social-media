import Bookmark from "../models/bookmark.model.js";
import Post from "../models/post.model.js";
export const toggleBookmark = async (req, res) => {
  const userId = req.user._id;
  const { postId } = req.body;

  try {
    // Kiểm tra xem bài viết có tồn tại không
    const post = await Post.findById(postId);
    if (!post)
      return res.status(404).json({ error: "Không tìm thấy bài viết" });

    const existing = await Bookmark.findOne({ user: userId, post: postId });

    if (existing) {
      await existing.deleteOne();
      return res.status(200).json({ bookmarked: false });
    } else {
      const newBookmark = await Bookmark.create({ user: userId, post: postId });
      return res.status(201).json({ bookmarked: true, bookmark: newBookmark });
    }
  } catch (err) {
    console.error("Toggle bookmark error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const isBookmarked = async (req, res) => {
  const userId = req.user._id;
  const { postId } = req.params;

  try {
    const bookmark = await Bookmark.findOne({ user: userId, post: postId });
    res.status(200).json({ bookmarked: !!bookmark });
  } catch (err) {
    console.error("Error checking bookmark:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getBookmarks = async (req, res) => {
  const userId = req.user._id;
  const sort = req.query.sort === "asc" ? 1 : -1; // mặc định: mới nhất

  try {
    const bookmarks = await Bookmark.find({ user: userId })
      .populate({
        path: "post",
        populate: { path: "user", select: "username profileImg" }, // nếu cần
      })
      .sort({ createdAt: sort }); // 🔁 Sắp xếp theo thời gian bookmark

    res.status(200).json(bookmarks);
  } catch (err) {
    console.error("Error getting bookmarks:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
