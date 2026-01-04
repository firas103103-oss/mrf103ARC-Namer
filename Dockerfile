# استخدام نسخة Debian Slim بدلاً من Alpine لتجنب مشاكل توافق المكتبات
FROM node:20-slim

# تحديد مجلد العمل
WORKDIR /app

# نسخ ملفات تعريف المكتبات أولاً
COPY package*.json ./

# تثبيت المكتبات (بما فيها devDependencies لأننا نحتاج tsx و vite)
# استخدام --legacy-peer-deps لحل تعارضات الإصدارات
RUN npm install --legacy-peer-deps

# نسخ باقي ملفات المشروع
COPY . .

# بناء المشروع (Frontend + Backend)
# هذا سيقوم بتشغيل script/build.ts كما هو محدد في مشروعك
RUN npm run build

# إعداد المنفذ
# Railway سيحدد PORT تلقائياً، لكن نضع default
ENV PORT=9002
EXPOSE 9002

# تشغيل التطبيق
CMD ["npm", "start"]