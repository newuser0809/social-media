import express from "express";
import {
  getBookmarks,
  toggleBookmark,
  isBookmarked,
} from "../controllers/bookmark.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

// Lấy danh sách bookmarks của người dùng hiện tại
router.get("/", protectRoute, getBookmarks);

// Kiểm tra một bài viết cụ thể đã được bookmark hay chưa
router.get("/:postId", protectRoute, isBookmarked);

// Toggle trạng thái bookmark (mới)
router.post("/toggle", protectRoute, toggleBookmark);

export default router;
