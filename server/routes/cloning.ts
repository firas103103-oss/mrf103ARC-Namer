/* eslint-disable no-undef */
import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import bcrypt from "bcryptjs";
import logger from "../utils/logger";
import { db } from "../db";
import { userProfiles, userFiles, userIotDevices } from "../../shared/schema";
import { eq } from "drizzle-orm";

const router = Router();

// إعداد تخزين الملفات باستخدام Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), "uploads", "cloning");
    
    // إنشاء المجلد إذا لم يكن موجوداً
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // إنشاء اسم فريد للملف
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  },
});

// فلتر أنواع الملفات المسموحة
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
    cb(new Error(`نوع الملف غير مسموح: ${file.mimetype}`));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max per file
  },
});

// الـ Passcode الثابت
const CLONING_PASSCODE = "passcodemrf1Q@";

/**
 * POST /api/cloning/verify-passcode
 * التحقق من الـ Passcode
 */
router.post("/verify-passcode", async (req: Request, res: Response) => {
  try {
    const { passcode } = req.body;

    if (!passcode) {
      return res.status(400).json({
        success: false,
        message: "الرجاء إدخال رمز المرور",
      });
    }

    if (passcode === CLONING_PASSCODE) {
      return res.status(200).json({
        success: true,
        message: "تم التحقق بنجاح",
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "رمز المرور غير صحيح",
      });
    }
  } catch (error) {
    logger.error("خطأ في التحقق من الـ passcode:", error);
    return res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء التحقق",
    });
  }
});

/**
 * POST /api/cloning/register
 * تسجيل مستخدم جديد مع رفع الملفات
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

      // التحقق من البيانات الأساسية
      if (!username || !email || !password) {
        return res.status(400).json({
          success: false,
          message: "الرجاء إدخال جميع البيانات المطلوبة",
        });
      }

      // التحقق من وجود المستخدم
      const existingUser = await db
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.email, email))
        .limit(1);

      if (existingUser.length > 0) {
        return res.status(409).json({
          success: false,
          message: "البريد الإلكتروني مسجل مسبقاً",
        });
      }

      // تشفير كلمة المرور
      const hashedPassword = await bcrypt.hash(password, 10);

      // إنشاء ملف المستخدم
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

      // معالجة الملفات المرفوعة
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

      // إضافة الأجهزة المختارة
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
        message: "تم التسجيل بنجاح",
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
      logger.error("خطأ في التسجيل:", error);
      return res.status(500).json({
        success: false,
        message: "حدث خطأ أثناء التسجيل",
        error: (error instanceof Error ? error.message : 'Unknown error'),
      });
    }
  }
);

/**
 * GET /api/cloning/profile/:userId
 * الحصول على معلومات المستخدم الكاملة
 */
router.get("/profile/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // الحصول على معلومات المستخدم
    const [user] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.id, userId))
      .limit(1);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "المستخدم غير موجود",
      });
    }

    // الحصول على الملفات
    const files = await db
      .select()
      .from(userFiles)
      .where(eq(userFiles.userId, userId));

    // الحصول على الأجهزة
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
    logger.error("خطأ في جلب معلومات المستخدم:", error);
    return res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب المعلومات",
      error: (error instanceof Error ? error.message : 'Unknown error'),
    });
  }
});

/**
 * PUT /api/cloning/profile/:userId
 * تحديث معلومات المستخدم
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

      // التحقق من وجود المستخدم
      const [user] = await db
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.id, userId))
        .limit(1);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "المستخدم غير موجود",
        });
      }

      // تحديث البيانات
      const updateData: any = {};
      if (personalInfo) updateData.personalInfo = JSON.parse(personalInfo);
      if (projectsInfo) updateData.projectsInfo = JSON.parse(projectsInfo);
      if (socialInfo) updateData.socialInfo = JSON.parse(socialInfo);
      updateData.updatedAt = new Date();

      await db
        .update(userProfiles)
        .set(updateData)
        .where(eq(userProfiles.id, userId));

      // معالجة الملفات الجديدة
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
        message: "تم تحديث المعلومات بنجاح",
        data: {
          newFilesCount: uploadedFiles.length,
        },
      });
    } catch (error) {
      logger.error("خطأ في تحديث المعلومات:", error);
      return res.status(500).json({
        success: false,
        message: "حدث خطأ أثناء التحديث",
        error: (error instanceof Error ? error.message : 'Unknown error'),
      });
    }
  }
);

export default router;
