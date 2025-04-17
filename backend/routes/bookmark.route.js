import express from "express";
import {
  addBookmark,
  removeBookmark,
  getBookmarks,
} from "../controllers/bookmark.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.get("/", protectRoute, getBookmarks);

router.post("/", protectRoute, addBookmark);

router.delete("/:postId", protectRoute, removeBookmark);

export default router;
