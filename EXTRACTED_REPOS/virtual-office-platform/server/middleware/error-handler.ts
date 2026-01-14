import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
import { Request, Response, NextFunction } from "express";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  if (err instanceof Error && err.message.includes('Invalid file type')) {
) {
  console.error("Error:", err);

  // Multer file size error
  if (err.message.includes("File too large")) {
    return res.status(413).json({
      success: false,
      message: "File size exceeds the maximum limit of 50MB"
    });
  }

  // Multer file type error
  if (err.message.includes("نوع الملف غير مسموح")) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  res.status(500).json({
    success: false,
    message: 'حدث خطأ في الخادم',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};
  // Database errors
  if (err.message.includes("duplicate key")) {
    return res.status(409).json({
      success: false,
      message: "Username or email already exists"
    });
  }

  // Default error
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined
  });
}
