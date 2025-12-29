# 1. نستخدم Node 20 لأنك تستخدم types/node:20
FROM node:20-alpine

# 2. مجلد العمل
WORKDIR /app

# 3. ننسخ ملفات تعريف المكتبات
COPY package*.json ./

# 4. تثبيت المكتبات (نحتاج devDependencies عشان tsx يشتغل في البناء)
RUN npm install

# 5. ننسخ باقي الكود
COPY . .

# 6. عملية البناء (هنا سيتم تشغيل script/build.ts وإنشاء مجلد dist)
RUN npm run build

# 7. تنظيف المكتبات غير الضرورية (اختياري لتخفيف الوزن، لكن خلنا نتركه الآن للأمان)
# RUN npm prune --production 

# 8. المنفذ
ENV PORT=8080
EXPOSE 8080

# 9. التشغيل (سيقوم بتشغيل الأمر start الموجود في package.json)
CMD ["npm", "start"]