import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import { db } from "../db/connection";
import { userProfiles, userFiles, userIotDevices } from "../db/schema";
import { eq } from "drizzle-orm";
import { upload } from "../middleware/multer-config";

const router = Router();

// الـ Passcode من متغيرات البيئة
const CLONING_PASSCODE = process.env.PASSCODE || "passcodemrf1Q@";

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
    console.error("خطأ في التحقق من الـ passcode:", error);
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
      console.error("خطأ في التسجيل:", error);
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
    console.error("خطأ في جلب معلومات المستخدم:", error);
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
      console.error("خطأ في تحديث المعلومات:", error);
      return res.status(500).json({
        success: false,
        message: "حدث خطأ أثناء التحديث",
        error: (error instanceof Error ? error.message : 'Unknown error'),
      });
    }
  }
);

export default router;
