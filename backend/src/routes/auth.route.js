import express from 'express';
import authController from "../controllers/auth.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// Публічні роути (без авторизації)
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/logout", authController.logout);

// Захищені роути (потребують авторизації)
router.get("/check", authMiddleware.protectRoute, authController.checkAuth);
router.put("/update-profile", authMiddleware.protectRoute, authController.updateProfile);
router.get("/stats", authMiddleware.protectRoute, authController.getUserStats);

export default router;