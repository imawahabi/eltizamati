# دليل النشر - إلتزاماتي

> دليل شامل لنشر تطبيق إلتزاماتي على مختلف البيئات والمنصات

---

## 🎯 نظرة عامة

هذا الدليل يغطي عملية نشر تطبيق إلتزاماتي من بيئة التطوير إلى الإنتاج، مع التركيز على أفضل الممارسات والأمان.

### البيئات المدعومة
- **Development**: بيئة التطوير المحلية
- **Staging**: بيئة اختبار ما قبل الإنتاج
- **Production**: بيئة الإنتاج النهائية

### المنصات المستهدفة
- **iOS**: App Store و TestFlight
- **Android**: Google Play Store (مستقبلاً)
- **Web**: نسخة ويب (اختيارية)

---

## 🛠️ متطلبات ما قبل النشر

### 1. الأدوات المطلوبة

```bash
# Node.js وnpm
node --version  # يجب أن يكون >= 18
npm --version   # يجب أن يكون >= 8

# Expo CLI
npm install -g @expo/cli
npm install -g eas-cli

# Git
git --version

# Docker (اختياري للـ backend)
docker --version
```

### 2. الحسابات المطلوبة

- **Apple Developer Account** ($99/سنة) - للنشر على iOS
- **Expo Account** - مجاني للمشاريع الشخصية
- **Neon Database Account** - للإنتاج
- **Sentry Account** (اختياري) - لمراقبة الأخطاء

### 3. إعداد المتغيرات

```bash
# .env.development
EXPO_PUBLIC_ENV=development
NEON_DB_URL=postgresql://localhost:5432/eltizamati_dev
EXPO_PUBLIC_API_URL=http://localhost:3000

# .env.staging  
EXPO_PUBLIC_ENV=staging
NEON_DB_URL=postgresql://staging-db-url
EXPO_PUBLIC_API_URL=https://staging-api.eltizamati.com

# .env.production
EXPO_PUBLIC_ENV=production
NEON_DB_URL=postgresql://neondb_owner:npg_7q4CPKmIuTOL@ep-cool-forest-adprkcwh-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
EXPO_PUBLIC_API_URL=https://api.eltizamati.com
SENTRY_DSN=https://your-sentry-dsn
```

---

## 📦 إعداد EAS Build

### 1. تسجيل الدخول في EAS

```bash
# تسجيل الدخول في Expo
expo login

# تسجيل الدخول في EAS
eas login
```

### 2. إعداد ملف eas.json

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "resourceClass": "m-medium"
      }
    },
    "staging": {
      "distribution": "internal",
      "channel": "staging",
      "ios": {
        "buildConfiguration": "Release",
        "bundleIdentifier": "com.eltizamati.staging"
      }
    },
    "production": {
      "channel": "production", 
      "ios": {
        "buildConfiguration": "Release",
        "bundleIdentifier": "com.eltizamati.app"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "your-app-store-connect-app-id",
        "appleTeamId": "your-team-id"
      }
    }
  }
}
```

### 3. إعداد App Store Connect

```javascript
// app.config.js
export default {
  name: "إلتزاماتي",
  slug: "eltizamati",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "automatic",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#0B63FF"
  },
  ios: {
    bundleIdentifier: "com.eltizamati.app",
    buildNumber: "1",
    supportsTablet: true,
    infoPlist: {
      CFBundleAllowMixedLocalizations: true,
      NSFaceIDUsageDescription: "يستخدم التطبيق FaceID لحماية بياناتك المالية"
    }
  },
  extra: {
    eas: {
      projectId: "your-project-id"
    }
  },
  plugins: [
    "expo-font",
    "expo-sqlite",
    [
      "expo-notifications",
      {
        icon: "./assets/notification-icon.png",
        color: "#0B63FF"
      }
    ]
  ]
};
```

---

## 🏗️ عملية البناء (Build Process)

### 1. Development Build

```bash
# إنشاء development build
eas build --profile development --platform ios

# تثبيت على الجهاز
eas device:create
eas build --profile development --platform ios
```

### 2. Staging Build

```bash
# إنشاء staging build
eas build --profile staging --platform ios

# النشر على TestFlight الداخلي
eas submit --platform ios --profile staging
```

### 3. Production Build

```bash
# تحديث رقم الإصدار
npm version patch  # أو minor أو major

# إنشاء production build
eas build --profile production --platform ios

# النشر على App Store
eas submit --platform ios --profile production
```

### 4. أتمتة البناء مع GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    tags:
      - 'v*'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Setup Expo and EAS
        uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Build for production
        run: eas build --platform ios --non-interactive --profile production

      - name: Submit to App Store
        run: eas submit --platform ios --non-interactive --profile production
```

---

## 🗄️ إعداد قاعدة البيانات للإنتاج

### 1. إعداد Neon Production Database

```sql
-- إنشاء المستخدمين والأذونات
CREATE USER eltizamati_app WITH ENCRYPTED PASSWORD 'secure_password';
CREATE USER eltizamati_readonly WITH ENCRYPTED PASSWORD 'readonly_password';

-- إنشاء قاعدة البيانات
CREATE DATABASE eltizamati_production OWNER eltizamati_app;

-- إعداد الأذونات
GRANT CONNECT ON DATABASE eltizamati_production TO eltizamati_app;
GRANT CONNECT ON DATABASE eltizamati_production TO eltizamati_readonly;

-- بعد الاتصال بقاعدة البيانات
GRANT USAGE ON SCHEMA public TO eltizamati_app;
GRANT CREATE ON SCHEMA public TO eltizamati_app;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO eltizamati_readonly;

-- تشغيل الmigrations
\i migrations/001_initial_schema.sql
\i migrations/002_indexes.sql
\i migrations/003_seed_data.sql
```

### 2. النسخ الاحتياطي التلقائي

```bash
#!/bin/bash
# scripts/backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_URL=$NEON_DB_URL

# إنشاء نسخة احتياطية
pg_dump $DB_URL > "$BACKUP_DIR/eltizamati_backup_$DATE.sql"

# ضغط الملف
gzip "$BACKUP_DIR/eltizamati_backup_$DATE.sql"

# حذف النسخ القديمة (أكثر من 30 يوم)
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete

echo "Backup completed: eltizamati_backup_$DATE.sql.gz"
```

### 3. إعداد الـ Monitoring

```bash
# تثبيت أدوات المراقبة
npm install @sentry/react-native
npx @sentry/wizard -i reactNative -p ios

# إعداد Sentry في التطبيق
```

```typescript
// lib/monitoring.ts
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  debug: __DEV__,
  environment: process.env.EXPO_PUBLIC_ENV,
});

export { Sentry };
```

---

## 🔒 إعدادات الأمان للإنتاج

### 1. تشفير البيانات الحساسة

```typescript
// lib/encryption.ts
import CryptoJS from 'crypto-js';
import * as SecureStore from 'expo-secure-store';

export class EncryptionService {
  private static SECRET_KEY = 'your-secret-key';

  static async encryptData(data: string): Promise<string> {
    const encrypted = CryptoJS.AES.encrypt(data, this.SECRET_KEY).toString();
    return encrypted;
  }

  static async decryptData(encryptedData: string): Promise<string> {
    const decrypted = CryptoJS.AES.decrypt(encryptedData, this.SECRET_KEY);
    return decrypted.toString(CryptoJS.enc.Utf8);
  }

  static async storeSecurely(key: string, value: string): Promise<void> {
    const encrypted = await this.encryptData(value);
    await SecureStore.setItemAsync(key, encrypted);
  }

  static async getSecurely(key: string): Promise<string | null> {
    const encrypted = await SecureStore.getItemAsync(key);
    if (!encrypted) return null;
    return this.decryptData(encrypted);
  }
}
```

### 2. إعداد SSL Pinning (متقدم)

```typescript
// lib/network-security.ts
import { Platform } from 'react-native';

const SSL_PINS = {
  'api.eltizamati.com': [
    'sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=',
    'sha256/BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB='
  ]
};

export function setupNetworkSecurity() {
  if (Platform.OS === 'ios') {
    // iOS SSL pinning setup
  }
}
```

### 3. حماية من Reverse Engineering

```javascript
// metro.config.js (للإنتاج)
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

if (process.env.NODE_ENV === 'production') {
  // تفعيل minification
  config.transformer.minifierConfig = {
    keep_fnames: false,
    mangle: {
      keep_fnames: false,
    },
  };
}

module.exports = config;
```

---

## 📊 مراقبة الأداء

### 1. إعداد Analytics

```typescript
// lib/analytics.ts
import { Analytics } from '@segment/analytics-react-native';

const analytics = new Analytics({
  writeKey: 'your-segment-write-key',
  debug: __DEV__,
});

export class AnalyticsService {
  static track(event: string, properties?: Record<string, any>) {
    analytics.track(event, properties);
  }

  static screen(name: string, properties?: Record<string, any>) {
    analytics.screen(name, properties);
  }

  static identify(userId: string, traits?: Record<string, any>) {
    analytics.identify(userId, traits);
  }
}
```

### 2. مراقبة الأداء

```typescript
// lib/performance.ts
import { Performance } from 'react-native-performance';

export class PerformanceMonitor {
  static measureFunction<T>(
    name: string,
    fn: () => T | Promise<T>
  ): T | Promise<T> {
    const start = Performance.now();
    
    const result = fn();
    
    if (result instanceof Promise) {
      return result.finally(() => {
        const duration = Performance.now() - start;
        this.logPerformance(name, duration);
      });
    } else {
      const duration = Performance.now() - start;
      this.logPerformance(name, duration);
      return result;
    }
  }

  private static logPerformance(name: string, duration: number) {
    if (duration > 1000) {
      console.warn(`Slow operation detected: ${name} took ${duration}ms`);
    }
  }
}
```

---

## 🧪 اختبارات ما قبل النشر

### 1. قائمة مراجعة الجودة

```bash
# تشغيل جميع الاختبارات
npm test

# فحص الكود
npm run lint

# فحص النوع
npm run type-check

# فحص الثغرات الأمنية
npm audit

# تحليل حجم البانل
npx expo export --platform ios --analyzer
```

### 2. اختبارات الأداء

```bash
# قياس وقت التحميل
npm run performance-test

# اختبار الذاكرة
npm run memory-test

# اختبار البطارية (على الجهاز)
npm run battery-test
```

### 3. اختبارات المستخدم

```markdown
## قائمة اختبار المستخدم النهائي

### الوظائف الأساسية
- [ ] إنشاء حساب جديد
- [ ] تسجيل الدخول
- [ ] إضافة التزام جديد
- [ ] تسجيل دفعة
- [ ] عرض لوحة القيادة
- [ ] الإشعارات تعمل

### الأداء
- [ ] التطبيق يفتح خلال 3 ثوان
- [ ] البيانات تتحمل خلال 2 ثانية
- [ ] لا توجد تجمدات أو crashes

### الأمان
- [ ] App Lock يعمل
- [ ] البيانات لا تظهر في screenshot
- [ ] النسخ الاحتياطي محمي

### إمكانية الوصول
- [ ] يعمل مع VoiceOver
- [ ] حجم الخط قابل للتعديل
- [ ] ألوان واضحة للمصابين بعمى الألوان
```

---

## 📱 نشر iOS

### 1. إعداد App Store Connect

```markdown
## خطوات إعداد App Store Connect

1. **إنشاء App ID**
   - Bundle ID: com.eltizamati.app
   - Name: إلتزاماتي
   - Services: Push Notifications, App Groups

2. **إنشاء Certificates**
   - Development Certificate
   - Distribution Certificate  

3. **إنشاء Provisioning Profiles**
   - Development Profile
   - Distribution Profile

4. **App Store Connect Setup**
   - Create new app
   - Upload screenshots
   - Add app description
   - Set pricing
   - Configure App Store Review Information
```

### 2. معلومات App Store

```markdown
## App Store Listing

### العنوان
إلتزاماتي - إدارة الالتزامات المالية

### الوصف المختصر
تطبيق ذكي لإدارة الأقساط والديون مع تذكيرات تلقائية وتحليلات مالية

### الوصف الكامل
إلتزاماتي تطبيق مصمم خصيصاً لمساعدتك في إدارة التزاماتك المالية بطريقة ذكية ومنظمة.

الميزات الرئيسية:
• إدارة الأقساط والديون
• تذكيرات ذكية للدفعات
• تحليلات مالية مفصلة
• دعم كامل للعربية
• أمان عالي للبيانات

### الكلمات المفتاحية
ديون,أقساط,مالية,تذكيرات,ميزانية,كويت

### الفئة
Finance

### التقييم
4+
```

### 3. لقطات الشاشة

```bash
# إنشاء لقطات شاشة لمختلف الأجهزة
# iPhone 6.7" (iPhone 14 Pro Max)
# iPhone 6.5" (iPhone 11 Pro Max) 
# iPhone 5.5" (iPhone 8 Plus)
# iPad Pro 12.9" (5th generation)
# iPad Pro 12.9" (2nd generation)

# الأحجام المطلوبة
# iPhone: 1290×2796, 1284×2778, 1242×2208
# iPad: 2048×2732
```

---

## 🚀 إطلاق التطبيق

### 1. استراتيجية الإطلاق التدريجي

```markdown
## مراحل الإطلاق

### المرحلة 1: Beta Testing (أسبوعين)
- TestFlight internal testing (5-10 مستخدمين)
- جمع feedback أولي
- إصلاح bugs حرجة

### المرحلة 2: Closed Beta (شهر)
- TestFlight external testing (50-100 مستخدم)
- اختبار الأداء تحت ضغط
- تحسينات UX

### المرحلة 3: Soft Launch (شهر)
- إطلاق في الكويت فقط
- مراقبة المقاييس
- تحسينات نهائية

### المرحلة 4: Full Launch
- إطلاق عام
- حملة تسويقية
- مراقبة مستمرة
```

### 2. خطة المراقبة بعد الإطلاق

```bash
# مراقبة يومية
- Crash reports (Sentry)
- App Store reviews
- Download numbers
- User retention

# مراقبة أسبوعية  
- Performance metrics
- Database performance
- User feedback analysis
- Feature usage statistics

# مراقبة شهرية
- Business metrics
- Cost analysis
- Roadmap updates
- Market research
```

---

## 📞 الدعم والصيانة

### 1. إعداد نظام الدعم

```markdown
## قنوات الدعم

### في التطبيق
- Help section مع FAQ
- Contact form
- Bug report feature

### خارج التطبيق  
- Email: support@eltizamati.com
- Website: https://eltizamati.com/support
- Social media

### للمطورين
- GitHub Issues
- Development documentation
- API documentation
```

### 2. خطة الصيانة

```markdown
## جدول الصيانة

### يومياً
- مراقبة النظام
- متابعة reports
- رد على استفسارات المستخدمين

### أسبوعياً
- تحديث الأمان
- نسخ احتياطية
- مراجعة الأداء

### شهرياً
- تحديثات الميزات
- تحليل البيانات
- تخطيط المستقبل

### فصلياً
- مراجعة شاملة للأمان
- تحديث dependencies
- تقييم الأداء العام
```

---

## 🔧 استكشاف الأخطاء

### مشاكل شائعة وحلولها

```markdown
## Build Errors

### Error: "No provisioning profile found"
**الحل:**
1. تأكد من وجود Apple Developer Account
2. إنشاء provisioning profile جديد
3. تحديث eas.json مع team ID صحيح

### Error: "Bundle identifier already exists"
**الحل:**
1. تغيير bundle identifier في app.config.js
2. إنشاء app ID جديد في Apple Developer Portal

## Runtime Errors

### Database connection failed
**الحل:**
1. التحقق من NEON_DB_URL
2. فحص network connectivity
3. مراجعة database permissions

### Notifications not working
**الحل:**
1. التحقق من permissions
2. فحص notification service setup
3. تأكيد صحة device tokens
```

---

## 📋 قائمة مراجعة ما قبل الإطلاق

```markdown
## Pre-Launch Checklist

### التطوير
- [ ] جميع الميزات الأساسية تعمل
- [ ] اختبارات شاملة تمت
- [ ] Performance optimization
- [ ] Security audit completed

### التسويق
- [ ] App Store listing محضر
- [ ] Screenshots عالية الجودة
- [ ] App preview video
- [ ] Press kit جاهز

### الدعم
- [ ] Documentation مكتملة
- [ ] Support channels جاهزة
- [ ] FAQ محضرة
- [ ] Bug tracking system

### القانوني
- [ ] Privacy policy
- [ ] Terms of service  
- [ ] GDPR compliance
- [ ] Local regulations review

### البنية التحتية
- [ ] Production database ready
- [ ] Monitoring setup
- [ ] Backup systems
- [ ] Scaling plan ready
```

---

**آخر تحديث:** $(date)  
**الإصدار:** 1.0.0  
**البيئة:** Production Ready
