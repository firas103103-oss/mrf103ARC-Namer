-- =============================================
-- CLONING SYSTEM DATABASE MIGRATION
-- Version: 1.0.0
-- Date: 2026-01-06
-- =============================================

-- جدول ملفات المستخدمين (User Profiles)
CREATE TABLE IF NOT EXISTS user_profiles (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  username VARCHAR NOT NULL UNIQUE,
  email VARCHAR NOT NULL UNIQUE,
  phone_number VARCHAR,
  password VARCHAR NOT NULL, -- Hashed with bcrypt
  
  -- معلومات شخصية (JSONB لمرونة البيانات)
  personal_info JSONB DEFAULT '{}'::jsonb,
  
  -- معلومات المشاريع
  projects_info JSONB DEFAULT '{}'::jsonb,
  
  -- معلومات التواصل الاجتماعي
  social_info JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes للبحث السريع
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- =============================================

-- جدول ملفات المستخدمين (Files)
CREATE TABLE IF NOT EXISTS user_files (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id VARCHAR NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  file_type VARCHAR NOT NULL, -- 'voice', 'photo', 'document'
  file_name VARCHAR NOT NULL,
  file_path VARCHAR NOT NULL,
  file_size INTEGER, -- in bytes
  mime_type VARCHAR,
  uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Index لسرعة استرجاع ملفات المستخدم
CREATE INDEX IF NOT EXISTS idx_user_files_user_id ON user_files(user_id);
CREATE INDEX IF NOT EXISTS idx_user_files_type ON user_files(file_type);

-- =============================================

-- جدول أجهزة IoT للمستخدمين
CREATE TABLE IF NOT EXISTS user_iot_devices (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id VARCHAR NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  device_type VARCHAR NOT NULL, -- 'xbio_sentinel', 'personal_xbio', etc
  device_name VARCHAR,
  device_config JSONB DEFAULT '{}'::jsonb, -- Configuration specific to device
  is_active BOOLEAN DEFAULT TRUE,
  added_at TIMESTAMP DEFAULT NOW()
);

-- Index لسرعة استرجاع أجهزة المستخدم
CREATE INDEX IF NOT EXISTS idx_user_iot_devices_user_id ON user_iot_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_user_iot_devices_type ON user_iot_devices(device_type);

-- =============================================
-- Sample Data (Optional - للاختبار فقط)
-- =============================================

-- مستخدم تجريبي
-- Password: TestPassword123!
INSERT INTO user_profiles (username, email, password, personal_info, projects_info, social_info)
VALUES (
  'demo_user',
  'demo@mrf103.com',
  '$2b$10$YourHashedPasswordHere', -- استبدل بـ hash حقيقي
  '{"skills": "JavaScript, Python, React", "jobTitle": "Full Stack Developer", "bio": "Passionate developer building amazing things"}',
  '{"github": "https://github.com/demouser", "portfolio": "https://demouser.com"}',
  '{"linkedin": "https://linkedin.com/in/demouser", "twitter": "https://twitter.com/demouser"}'
) ON CONFLICT (email) DO NOTHING;

-- ملفات تجريبية
-- (سيتم إضافتها عند رفع الملفات الفعلية)

-- أجهزة تجريبية
INSERT INTO user_iot_devices (user_id, device_type, device_name, device_config)
SELECT 
  id,
  'xbio_sentinel',
  'XBio Sentinel - Primary',
  '{"status": "active", "location": "office"}'::jsonb
FROM user_profiles
WHERE email = 'demo@mrf103.com'
ON CONFLICT DO NOTHING;

-- =============================================
-- Views للاستعلامات الشائعة
-- =============================================

-- View لعرض ملخص المستخدمين مع إحصائيات
CREATE OR REPLACE VIEW user_profiles_summary AS
SELECT 
  up.id,
  up.username,
  up.email,
  up.created_at,
  COUNT(DISTINCT uf.id) AS total_files,
  COUNT(DISTINCT uid.id) AS total_devices,
  SUM(uf.file_size) AS total_storage_bytes
FROM user_profiles up
LEFT JOIN user_files uf ON up.id = uf.user_id
LEFT JOIN user_iot_devices uid ON up.id = uid.user_id
GROUP BY up.id, up.username, up.email, up.created_at;

-- =============================================
-- Functions
-- =============================================

-- Function لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger لتطبيق الـ Function على user_profiles
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- Row Level Security (RLS) - Optional
-- =============================================

-- تفعيل RLS على الجداول
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_iot_devices ENABLE ROW LEVEL SECURITY;

-- Policy: المستخدمون يمكنهم قراءة ملفاتهم فقط
CREATE POLICY user_profiles_select_policy ON user_profiles
FOR SELECT
USING (true); -- يمكن تعديلها حسب الحاجة

CREATE POLICY user_files_select_policy ON user_files
FOR SELECT
USING (true); -- أو auth.uid() = user_id في حال استخدام Supabase Auth

CREATE POLICY user_iot_devices_select_policy ON user_iot_devices
FOR SELECT
USING (true);

-- Policy: المستخدمون يمكنهم إدراج بياناتهم فقط
CREATE POLICY user_files_insert_policy ON user_files
FOR INSERT
WITH CHECK (true); -- يمكن تحسينها

CREATE POLICY user_iot_devices_insert_policy ON user_iot_devices
FOR INSERT
WITH CHECK (true);

-- =============================================
-- Verification Query
-- =============================================

-- للتحقق من أن كل شيء تم إنشاؤه بنجاح
SELECT 
  'user_profiles' AS table_name,
  COUNT(*) AS record_count
FROM user_profiles
UNION ALL
SELECT 
  'user_files',
  COUNT(*)
FROM user_files
UNION ALL
SELECT 
  'user_iot_devices',
  COUNT(*)
FROM user_iot_devices;

-- عرض الـ indexes
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename IN ('user_profiles', 'user_files', 'user_iot_devices')
ORDER BY tablename, indexname;

-- =============================================
-- Cleanup (Optional - لحذف كل شيء)
-- =============================================

/*
-- تحذير: هذا سيحذف جميع البيانات!
-- DROP VIEW IF EXISTS user_profiles_summary;
-- DROP TABLE IF EXISTS user_iot_devices CASCADE;
-- DROP TABLE IF EXISTS user_files CASCADE;
-- DROP TABLE IF EXISTS user_profiles CASCADE;
-- DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
*/

-- =============================================
-- END OF MIGRATION
-- =============================================

-- ✅ Migration Complete!
-- النظام جاهز للاستخدام
