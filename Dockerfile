# استخدام نسخة Debian Slim بدلاً من Alpine لتجنب مشاكل توافق المكتبات
FROM node:20-slim

# تحديد مجلد العمل
WORKDIR /app

# نسخ ملفات تعريف المكتبات أولاً
COPY package*.json ./

# تثبيت المكتبات (بما فيها devDependencies لأننا نحتاج tsx و vite)
RUN npm install

# نسخ باقي ملفات المشروع
COPY . .

# بناء المشروع (Frontend + Backend)
# هذا سيقوم بتشغيل script/build.ts كما هو محدد في مشروعك
RUN npm run build

# إعداد المنفذ (Cloud Run يتطلب هذا)
ENV PORT=8080
EXPOSE 8080

# تشغيل التطبيق
CMD ["npm", "start"]