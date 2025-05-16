import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  deleteUser,
  followUnfollowUser,
  getAllUsers,
  getSuggestedUsers,
  getUserProfile,
  updateUser,
} from "../controllers/user.controller.js";

const router = express.Router();
router.get("/all", getAllUsers);
router.get("/profile/:username", protectRoute, getUserProfile);
router.get("/suggested", protectRoute, getSuggestedUsers);
router.post("/follow/:id", protectRoute, followUnfollowUser);
router.post("/update", protectRoute, updateUser);
router.delete("/:id", deleteUser);
export default router;
