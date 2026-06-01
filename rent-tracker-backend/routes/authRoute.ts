import { signup, login, logout, getMe } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import express from "express";

const authRouter = express.Router();

authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.get("/me", authMiddleware as any, getMe);

export default authRouter;