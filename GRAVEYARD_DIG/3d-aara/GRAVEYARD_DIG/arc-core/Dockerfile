# استخدم صورة Node الرسمية
FROM node:20

# تعيين مجلد العمل داخل الحاوية
WORKDIR /app

# نسخ ملفات الباكج والتبعيات

# حذف node_modules وpackage-lock.json إن وجدت
RUN rm -rf node_modules package-lock.json

# نسخ ملفات الباكج والتبعيات
COPY package*.json ./

# تثبيت التبعيات
RUN npm install && npm rebuild better-sqlite3

# نسخ بقية ملفات المشروع
COPY . .

# تعيين المنفذ الافتراضي
EXPOSE 8080

# أمر التشغيل
CMD ["node", "server.js"]
