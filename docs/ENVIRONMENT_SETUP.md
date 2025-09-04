# إعداد البيئة - إلتزاماتي

> دليل شامل لإعداد متغيرات البيئة ومتطلبات التشغيل

---

## 🎯 نظرة عامة

هذا الدليل يوضح كيفية إعداد البيئة المطلوبة لتشغيل تطبيق إلتزاماتي في بيئات التطوير والإنتاج.

### البيئات المدعومة
- **Development**: التطوير المحلي
- **Staging**: اختبار ما قبل الإنتاج  
- **Production**: الإنتاج النهائي

---

## 📋 متطلبات النظام

### الأدوات الأساسية

```bash
# Node.js (الإصدار 18 أو أحدث)
node --version  # يجب أن يكون >= 18.0.0

# npm (يأتي مع Node.js)
npm --version   # يجب أن يكون >= 8.0.0

# Git
git --version

# Expo CLI
npm install -g @expo/cli @expo/cli@latest

# EAS CLI (للنشر)
npm install -g eas-cli
```

### متطلبات إضافية للتطوير

```bash
# Yarn (اختياري)
npm install -g yarn

# TypeScript (إذا لم يكن مثبت عالمياً)
npm install -g typescript

# React Native CLI (اختياري للتطوير المحلي)
npm install -g @react-native-community/cli
```

---

## 🔧 إعداد ملف البيئة

### إنشاء ملف .env

```bash
# انسخ الملف المرجعي
cp .env.example .env

# أو أنشئ ملف جديد
touch .env
```

### متغيرات البيئة الأساسية

```bash
# ===== إعدادات قاعدة البيانات =====
NEON_DB_URL=postgresql://neondb_owner:npg_7q4CPKmIuTOL@ep-cool-forest-adprkcwh-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# ===== إعدادات التطبيق =====
EXPO_PUBLIC_ENV=development
EXPO_PUBLIC_API_URL=http://localhost:3000
ENCRYPTION_SECRET_KEY=your-32-character-secret-key-here

# ===== إعدادات Expo =====
EXPO_PROJECT_ID=your-expo-project-id

# ===== إعدادات الأمان =====
JWT_SECRET=your-jwt-secret-key
SESSION_TIMEOUT=30

# ===== إعدادات المراقبة =====
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
DEBUG=true
LOG_LEVEL=debug
```

---

## 🗄️ إعداد قاعدة البيانات

### 1. إعداد Neon (الموصى به للإنتاج)

```bash
# تسجيل في Neon
# الذهاب إلى https://console.neon.tech
# إنشاء مشروع جديد
# نسخ connection string

# إضافة للـ .env
NEON_DB_URL=postgresql://username:password@host:port/database?sslmode=require
```

### 2. إعداد PostgreSQL محلي (للتطوير)

```bash
# تثبيت PostgreSQL
# macOS
brew install postgresql

# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib

# Windows
# تحميل من https://www.postgresql.org/download/

# إنشاء قاعدة بيانات
createdb eltizamati_dev

# إضافة للـ .env
DEV_DB_URL=postgresql://localhost:5432/eltizamati_dev
```

### 3. إعداد SQLite (للتطوير السريع)

```bash
# SQLite مدمج مع Expo
# لا حاجة لإعداد إضافي
SQLITE_DB_PATH=./database.db
```

---

## 📱 إعداد Expo

### 1. تسجيل الدخول

```bash
# تسجيل الدخول في Expo
expo login

# التحقق من الحساب
expo whoami
```

### 2. إنشاء مشروع Expo

```bash
# إذا كان المشروع موجود
cd eltizamati

# إذا كنت تبدأ من الصفر
npx create-expo-app eltizamati --template blank-typescript
cd eltizamati
```

### 3. إعداد EAS

```bash
# تسجيل الدخول في EAS
eas login

# إعداد المشروع
eas build:configure

# اختبار الإعداد
eas build --platform ios --profile development
```

---

## 🔐 إعداد الأمان

### 1. مفاتيح التشفير

```bash
# إنشاء مفتاح تشفير قوي
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# إضافة للـ .env
ENCRYPTION_SECRET_KEY=generated-key-here
```

### 2. JWT Secrets

```bash
# إنشاء JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# إضافة للـ .env
JWT_SECRET=generated-jwt-secret-here
```

### 3. Secure Store (للإنتاج)

```bash
# استخدام خدمات إدارة المفاتيح
# AWS Secrets Manager
# HashiCorp Vault
# Azure Key Vault
```

---

## 📊 إعداد المراقبة

### 1. Sentry (لتتبع الأخطاء)

```bash
# إنشاء حساب في https://sentry.io
# إنشاء مشروع React Native
# نسخ DSN

# إضافة للـ .env
SENTRY_DSN=https://your-key@sentry.io/project-id

# تثبيت Sentry
npx @sentry/wizard -i reactNative -p ios
```

### 2. Analytics (اختياري)

```bash
# Firebase Analytics
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_API_KEY=your-api-key

# Google Analytics
GA_TRACKING_ID=GA-XXXXXXXXX

# Mixpanel
MIXPANEL_TOKEN=your-token
```

---

## 🚀 إعداد النشر

### 1. Apple Developer

```bash
# متطلبات iOS
APPLE_ID=your-apple-id@example.com
APPLE_TEAM_ID=your-team-id
ASC_APP_ID=your-app-store-connect-id
BUNDLE_IDENTIFIER=com.eltizamati.app

# إنشاء certificates
eas credentials
```

### 2. إعداد البيئات

```javascript
// app.config.js
export default ({ config }) => {
  const env = process.env.EXPO_PUBLIC_ENV || 'development';
  
  return {
    ...config,
    name: env === 'production' ? 'إلتزاماتي' : `إلتزاماتي (${env})`,
    slug: 'eltizamati',
    extra: {
      env,
      apiUrl: process.env.EXPO_PUBLIC_API_URL,
      sentryDsn: process.env.SENTRY_DSN,
    },
    ios: {
      bundleIdentifier: env === 'production' 
        ? 'com.eltizamati.app' 
        : `com.eltizamati.${env}`,
    },
  };
};
```

---

## 📦 Dependencies المطلوبة

### إضافة للـ package.json

```json
{
  "dependencies": {
    "@neondatabase/serverless": "^0.9.0",
    "expo-sqlite": "^15.2.14",
    "expo-secure-store": "^13.1.2",
    "expo-notifications": "^0.31.4",
    "@sentry/react-native": "^5.15.0",
    "drizzle-orm": "^0.29.0",
    "crypto-js": "^4.1.1"
  },
  "devDependencies": {
    "@types/crypto-js": "^4.1.1",
    "drizzle-kit": "^0.20.0"
  }
}
```

### تثبيت Dependencies

```bash
# تثبيت جميع المكتبات
npm install

# أو باستخدام Yarn
yarn install

# تثبيت iOS pods (إذا لزم الأمر)
cd ios && pod install && cd ..
```

---

## 🧪 اختبار الإعداد

### 1. اختبار اتصال قاعدة البيانات

```typescript
// test-db-connection.ts
import { neonDB } from './lib/neon-database';

async function testConnection() {
  try {
    const isConnected = await neonDB.testConnection();
    console.log('Database connection:', isConnected ? 'SUCCESS' : 'FAILED');
  } catch (error) {
    console.error('Connection test error:', error);
  }
}

testConnection();
```

### 2. اختبار Expo

```bash
# تشغيل التطبيق
npm run dev

# أو
expo start

# فحص في متصفح
open http://localhost:19006
```

### 3. اختبار البناء

```bash
# بناء محلي
eas build --profile development --platform ios --local

# بناء سحابي
eas build --profile development --platform ios
```

---

## 🔧 استكشاف الأخطاء

### مشاكل شائعة وحلولها

#### 1. خطأ اتصال قاعدة البيانات

```bash
# التحقق من الـ URL
echo $NEON_DB_URL

# اختبار الاتصال
psql $NEON_DB_URL

# التحقق من SSL
# تأكد من وجود sslmode=require في URL
```

#### 2. مشاكل Expo

```bash
# تنظيف cache
expo r -c

# إعادة تثبيت dependencies
rm -rf node_modules
npm install

# إعادة تسجيل الدخول
expo logout
expo login
```

#### 3. مشاكل iOS Build

```bash
# تنظيف iOS
cd ios && xcodebuild clean && cd ..

# إعادة تثبيت pods
cd ios && rm -rf Pods && pod install && cd ..

# التحقق من certificates
eas credentials
```

#### 4. مشاكل متغيرات البيئة

```bash
# التحقق من وجود الملف
ls -la .env

# التحقق من المتغيرات
node -e "console.log(process.env.NEON_DB_URL)"

# في Expo
console.log(Constants.expoConfig?.extra);
```

---

## 📋 قائمة مراجعة الإعداد

### التطوير المحلي
- [ ] Node.js 18+ مثبت
- [ ] Expo CLI مثبت
- [ ] Git مكون
- [ ] ملف .env موجود
- [ ] اتصال قاعدة البيانات يعمل
- [ ] التطبيق يعمل على المحاكي

### Staging
- [ ] Neon database مُعد
- [ ] متغيرات البيئة صحيحة
- [ ] EAS Build يعمل
- [ ] TestFlight setup
- [ ] Sentry monitoring فعال

### Production
- [ ] Apple Developer Account جاهز
- [ ] Production database مُعد
- [ ] SSL certificates صحيحة
- [ ] App Store Connect مكون
- [ ] Monitoring systems فعالة
- [ ] Backup strategy جاهزة

---

## 📞 الحصول على المساعدة

### إذا واجهت مشاكل

1. **راجع الـ logs**
   ```bash
   # Expo logs
   expo logs
   
   # Device logs
   expo logs --type=device
   ```

2. **تحقق من المستندات**
   - [Expo Documentation](https://docs.expo.dev/)
   - [Neon Documentation](https://neon.tech/docs)

3. **تواصل مع الفريق**
   - GitHub Issues للمشاكل التقنية
   - dev@eltizamati.com للدعم المباشر

---

## 🔗 روابط مفيدة

### الخدمات الخارجية
- [Neon Console](https://console.neon.tech)
- [Expo Dashboard](https://expo.dev)
- [Apple Developer](https://developer.apple.com)
- [App Store Connect](https://appstoreconnect.apple.com)

### الأدوات
- [React Native Debugger](https://github.com/jhen0409/react-native-debugger)
- [Flipper](https://fbflipper.com/)
- [Sentry](https://sentry.io)

### المستندات
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

---

**آخر تحديث:** 2024-01-20  
**الإصدار:** 1.0.0  
**البيئة المُختبرة:** Development/Staging/Production
