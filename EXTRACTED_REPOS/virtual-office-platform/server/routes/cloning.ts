/* eslint-disable no-undef */
import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import bcrypt from "bcrypt";
import { db } from "../db/connection";
import { userProfiles, userFiles, userIotDevices } from "../db/schema";
import { eq } from "drizzle-orm";

const router = Router();

// Setup file storage using Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), "uploads", "cloning");
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  },
});

// Allowed file types filter
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = [
    // Audio files
    "audio/mpeg",
    "audio/mp3",
    "audio/wav",
    "audio/ogg",
    "audio/webm",
    // Image files
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    // Document files
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed: ${file.mimetype}`));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max per file
  },
});

// Static passcode
const CLONING_PASSCODE = process.env.PASSCODE || "passcodemrf1Q@";

/**
 * POST /api/cloning/verify-passcode
 * Verify passcode
 */
router.post("/verify-passcode", async (req: Request, res: Response) => {
  try {
    const { passcode } = req.body;

    if (!passcode) {
      return res.status(400).json({
        success: false,
        message: "Please enter passcode",
      });
    }

    if (passcode === CLONING_PASSCODE) {
      return res.status(200).json({
        success: true,
        message: "Verification successful",
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Incorrect passcode",
      });
    }
  } catch (error) {
    console.error("Error verifying passcode:", error);
    return res.status(500).json({
      success: false,
      message: "Error during verification",
    });
  }
});

/**
 * POST /api/cloning/register
 * Register new user with file uploads
 */
router.post(
  "/register",
  upload.fields([
    { name: "voiceSamples", maxCount: 5 },
    { name: "photos", maxCount: 10 },
    { name: "documents", maxCount: 10 },
  ]),
  async (req: Request, res: Response) => {
    try {
      const {
        username,
        email,
        phoneNumber,
        password,
        personalInfo,
        projectsInfo,
        socialInfo,
        selectedDevices,
        selectedIntegrations,
      } = req.body;

      // Validate required fields
      if (!username || !email || !password) {
        return res.status(400).json({
          success: false,
          message: "Please enter all required fields",
        });
      }

      // Check if user exists
      const existingUser = await db
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.email, email))
        .limit(1);

      if (existingUser.length > 0) {
        return res.status(409).json({
          success: false,
          message: "Email already registered",
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user profile
      const [newUser] = await db
        .insert(userProfiles)
        .values({
          username,
          email,
          phoneNumber: phoneNumber || null,
          password: hashedPassword,
          personalInfo: personalInfo ? JSON.parse(personalInfo) : {},
          projectsInfo: projectsInfo ? JSON.parse(projectsInfo) : {},
          socialInfo: socialInfo ? JSON.parse(socialInfo) : {},
        })
        .returning();

      // Process uploaded files
      const files = req.files as Record<string, Express.Multer.File[]>;
      const uploadedFiles: any[] = [];

      if (files) {
        for (const [fieldName, fileArray] of Object.entries(files)) {
          let fileType = "";
          
          if (fieldName === "voiceSamples") fileType = "voice";
          else if (fieldName === "photos") fileType = "photo";
          else if (fieldName === "documents") fileType = "document";

          for (const file of fileArray) {
            const [uploadedFile] = await db
              .insert(userFiles)
              .values({
                userId: newUser.id,
                fileType,
                fileName: file.originalname,
                filePath: file.path,
                fileSize: file.size,
                mimeType: file.mimetype,
              })
              .returning();
            
            uploadedFiles.push(uploadedFile);
          }
        }
      }

      // Add selected devices
      const devices = selectedDevices ? JSON.parse(selectedDevices) : [];
      const addedDevices: any[] = [];

      for (const deviceType of devices) {
        const [device] = await db
          .insert(userIotDevices)
          .values({
            userId: newUser.id,
            deviceType,
            deviceName: deviceType,
            deviceConfig: {},
            isActive: true,
          })
          .returning();
        
        addedDevices.push(device);
      }

      return res.status(201).json({
        success: true,
        message: "Registration successful",
        data: {
          user: {
            id: newUser.id,
            username: newUser.username,
            email: newUser.email,
          },
          filesCount: uploadedFiles.length,
          devicesCount: addedDevices.length,
        },
      });
    } catch (error) {
      console.error("Error during registration:", error);
      return res.status(500).json({
        success: false,
        message: "Error during registration",
        error: (error instanceof Error ? error.message : 'Unknown error'),
      });
    }
  }
);

/**
 * GET /api/cloning/profile/:userId
 * Get complete user information
 */
router.get("/profile/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // Get user information
    const [user] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.id, userId))
      .limit(1);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get files
    const files = await db
      .select()
      .from(userFiles)
      .where(eq(userFiles.userId, userId));

    // Get devices
    const devices = await db
      .select()
      .from(userIotDevices)
      .where(eq(userIotDevices.userId, userId));

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          phoneNumber: user.phoneNumber,
          personalInfo: user.personalInfo,
          projectsInfo: user.projectsInfo,
          socialInfo: user.socialInfo,
          createdAt: user.createdAt,
        },
        files,
        devices,
      },
    });
  } catch (error) {
    console.error("Error fetching user information:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching information",
      error: (error instanceof Error ? error.message : 'Unknown error'),
    });
  }
});

/**
 * PUT /api/cloning/profile/:userId
 * Update user information
 */
router.put(
  "/profile/:userId",
  upload.fields([
    { name: "voiceSamples", maxCount: 5 },
    { name: "photos", maxCount: 10 },
    { name: "documents", maxCount: 10 },
  ]),
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { personalInfo, projectsInfo, socialInfo } = req.body;

      // Check if user exists
      const [user] = await db
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.id, userId))
        .limit(1);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Update data
      const updateData: any = {};
      if (personalInfo) updateData.personalInfo = JSON.parse(personalInfo);
      if (projectsInfo) updateData.projectsInfo = JSON.parse(projectsInfo);
      if (socialInfo) updateData.socialInfo = JSON.parse(socialInfo);
      updateData.updatedAt = new Date();

      await db
        .update(userProfiles)
        .set(updateData)
        .where(eq(userProfiles.id, userId));

      // Process new files
      const files = req.files as Record<string, Express.Multer.File[]>;
      const uploadedFiles: any[] = [];

      if (files) {
        for (const [fieldName, fileArray] of Object.entries(files)) {
          let fileType = "";
          
          if (fieldName === "voiceSamples") fileType = "voice";
          else if (fieldName === "photos") fileType = "photo";
          else if (fieldName === "documents") fileType = "document";

          for (const file of fileArray) {
            const [uploadedFile] = await db
              .insert(userFiles)
              .values({
                userId: userId,
                fileType,
                fileName: file.originalname,
                filePath: file.path,
                fileSize: file.size,
                mimeType: file.mimetype,
              })
              .returning();
            
            uploadedFiles.push(uploadedFile);
          }
        }
      }

      return res.status(200).json({
        success: true,
        message: "Information updated successfully",
        data: {
          newFilesCount: uploadedFiles.length,
        },
      });
    } catch (error) {
      console.error("Error updating information:", error);
      return res.status(500).json({
        success: false,
        message: "Error during update",
        error: (error instanceof Error ? error.message : 'Unknown error'),
      });
    }
  }
);

export default router;
