# وثائق API - إلتزاماتي

> دليل شامل لواجهات برمجة التطبيقات (APIs) والخدمات المستخدمة في تطبيق إلتزاماتي

---

## 🎯 نظرة عامة

يستخدم تطبيق إلتزاماتي نظام APIs محلي مع إمكانية المزامنة السحابية. هذا المستند يوثق جميع الواجهات والخدمات المتاحة.

### هيكل API
```
/api
  /settings      - إدارة الإعدادات
  /entities      - إدارة الجهات
  /debts         - إدارة الالتزامات
  /payments      - إدارة الدفعات
  /analytics     - التحليلات والتقارير
  /sync          - المزامنة
```

---

## 🔧 الإعدادات (Settings)

### GET /api/settings
الحصول على إعدادات المستخدم

**Response:**
```json
{
  "id": 1,
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "language": "ar",
  "payday_day": 25,
  "currency": "KWD",
  "strategy_default": "hybrid",
  "quiet_hours_from": "21:00",
  "quiet_hours_to": "08:00",
  "salary": 1200.000,
  "user_name": "أحمد محمد",
  "onboarding_completed": true,
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-15T10:00:00Z"
}
```

### PUT /api/settings
تحديث إعدادات المستخدم

**Request Body:**
```json
{
  "salary": 1300.000,
  "payday_day": 28,
  "user_name": "أحمد محمد الجديد",
  "strategy_default": "avalanche"
}
```

**Response:**
```json
{
  "success": true,
  "message": "تم تحديث الإعدادات بنجاح",
  "data": {
    "id": 1,
    "salary": 1300.000,
    "payday_day": 28,
    "updated_at": "2024-01-15T12:00:00Z"
  }
}
```

### POST /api/settings/initialize
إعداد أولي للتطبيق (onboarding)

**Request Body:**
```json
{
  "user_name": "أحمد محمد",
  "salary": 1200.000,
  "payday_day": 25,
  "language": "ar"
}
```

---

## 🏢 الجهات (Entities)

### GET /api/entities
الحصول على قائمة الجهات

**Query Parameters:**
- `kind` (optional): نوع الجهة (bank, bnpl, retailer, person, etc.)
- `search` (optional): البحث في الاسم
- `limit` (optional): عدد النتائج (default: 50)
- `offset` (optional): البداية (default: 0)

**Example Request:**
```
GET /api/entities?kind=bank&search=الكويت&limit=10
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "kind": "bank",
      "name": "بنك الكويت الوطني",
      "phone": "+965 1801801",
      "note": "البنك الرئيسي",
      "created_at": "2024-01-15T10:00:00Z"
    },
    {
      "id": 2,
      "kind": "bank", 
      "name": "بيت التمويل الكويتي",
      "phone": "+965 1866866",
      "note": null,
      "created_at": "2024-01-15T10:00:00Z"
    }
  ],
  "total": 2,
  "limit": 10,
  "offset": 0
}
```

### POST /api/entities
إضافة جهة جديدة

**Request Body:**
```json
{
  "kind": "person",
  "name": "محمد أحمد",
  "phone": "+965 12345678",
  "note": "صديق العائلة"
}
```

**Response:**
```json
{
  "success": true,
  "message": "تم إضافة الجهة بنجاح",
  "data": {
    "id": 15,
    "kind": "person",
    "name": "محمد أحمد",
    "phone": "+965 12345678",
    "note": "صديق العائلة",
    "created_at": "2024-01-15T12:00:00Z"
  }
}
```

### GET /api/entities/kuwait-defaults
الحصول على الجهات الافتراضية في الكويت

**Response:**
```json
{
  "banks": [
    "بنك الكويت الوطني",
    "بيت التمويل الكويتي",
    "بنك برقان",
    "بنك الخليج"
  ],
  "retailers": [
    "X-cite (الغانم)",
    "Best Al-Yousifi",
    "Eureka",
    "هاتف 2000"
  ],
  "bnpl": [
    "Tabby", 
    "Deema"
  ],
  "finance": [
    "شركة التسهيلات التجارية",
    "الملا للتمويل"
  ]
}
```

---

## 💳 الالتزامات (Debts)

### GET /api/debts
الحصول على قائمة الالتزامات

**Query Parameters:**
- `status` (optional): الحالة (active, closed, paused)
- `kind` (optional): النوع (loan, bnpl, friend, oneoff)
- `entity_id` (optional): معرف الجهة
- `due_this_month` (optional): المستحقة هذا الشهر (true/false)

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "entity": {
        "id": 1,
        "name": "بنك الكويت الوطني",
        "kind": "bank"
      },
      "kind": "loan",
      "principal": 5000.000,
      "apr": 7.5,
      "fee_fixed": 0,
      "start_date": "2024-01-01",
      "due_day": 15,
      "total_installments": 24,
      "remaining_installments": 20,
      "installment_amount": 230.000,
      "remaining_amount": 4600.000,
      "status": "active",
      "next_due_date": "2024-02-15",
      "progress_percentage": 16.67,
      "created_at": "2024-01-01T10:00:00Z"
    }
  ],
  "summary": {
    "total_active": 5,
    "total_monthly_payment": 890.500,
    "total_remaining": 12500.000
  }
}
```

### POST /api/debts
إضافة التزام جديد

**Request Body:**
```json
{
  "entity_id": 1,
  "kind": "loan",
  "principal": 5000.000,
  "apr": 7.5,
  "start_date": "2024-01-01",
  "due_day": 15,
  "total_installments": 24,
  "installment_amount": 230.000,
  "penalty_policy": {
    "late_fee": 5.000,
    "grace_days": 3
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "تم إضافة الالتزام بنجاح",
  "data": {
    "id": 10,
    "remaining_installments": 24,
    "remaining_amount": 5000.000,
    "next_due_date": "2024-02-15",
    "created_at": "2024-01-15T12:00:00Z"
  }
}
```

### GET /api/debts/:id
الحصول على تفاصيل التزام محدد

**Response:**
```json
{
  "id": 1,
  "entity": {
    "id": 1,
    "name": "بنك الكويت الوطني",
    "kind": "bank",
    "phone": "+965 1801801"
  },
  "kind": "loan",
  "principal": 5000.000,
  "current_balance": 4600.000,
  "installment_amount": 230.000,
  "apr": 7.5,
  "total_paid": 400.000,
  "remaining_installments": 20,
  "payment_history": [
    {
      "id": 1,
      "amount": 230.000,
      "date": "2024-01-15",
      "method": "bank_transfer",
      "status": "completed"
    }
  ],
  "upcoming_payments": [
    {
      "due_date": "2024-02-15",
      "amount": 230.000,
      "is_overdue": false
    }
  ]
}
```

### PUT /api/debts/:id
تحديث التزام

**Request Body:**
```json
{
  "installment_amount": 250.000,
  "due_day": 20,
  "status": "active"
}
```

### DELETE /api/debts/:id
حذف التزام

**Response:**
```json
{
  "success": true,
  "message": "تم حذف الالتزام بنجاح"
}
```

---

## 💰 الدفعات (Payments)

### GET /api/payments
الحصول على سجل الدفعات

**Query Parameters:**
- `debt_id` (optional): معرف الالتزام
- `from_date` (optional): من تاريخ (YYYY-MM-DD)
- `to_date` (optional): إلى تاريخ (YYYY-MM-DD)
- `method` (optional): طريقة الدفع

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "debt": {
        "id": 1,
        "entity_name": "بنك الكويت الوطني"
      },
      "amount": 230.000,
      "payment_date": "2024-01-15",
      "method": "bank_transfer",
      "note": "دفعة شهرية",
      "receipt_url": null,
      "created_at": "2024-01-15T14:30:00Z"
    }
  ],
  "summary": {
    "total_amount": 1150.000,
    "total_payments": 5,
    "period": "2024-01"
  }
}
```

### POST /api/payments
تسجيل دفعة جديدة

**Request Body:**
```json
{
  "debt_id": 1,
  "amount": 230.000,
  "payment_date": "2024-01-15",
  "method": "bank_transfer",
  "note": "دفعة شهرية",
  "receipt_url": "https://example.com/receipt.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "message": "تم تسجيل الدفعة بنجاح",
  "data": {
    "id": 25,
    "debt_updated": {
      "remaining_amount": 4370.000,
      "remaining_installments": 19
    },
    "next_due_date": "2024-02-15"
  }
}
```

### PUT /api/payments/:id
تعديل دفعة

**Request Body:**
```json
{
  "amount": 250.000,
  "note": "دفعة شهرية محدثة"
}
```

### DELETE /api/payments/:id
حذف دفعة

**Response:**
```json
{
  "success": true,
  "message": "تم حذف الدفعة وتحديث الرصيد"
}
```

---

## 📊 التحليلات (Analytics)

### GET /api/analytics/dashboard
الحصول على بيانات لوحة القيادة

**Response:**
```json
{
  "current_month": {
    "salary": 1200.000,
    "total_obligations": 890.500,
    "remaining_budget": 309.500,
    "dti_percentage": 74.2
  },
  "upcoming_payments": [
    {
      "debt_id": 1,
      "entity_name": "بنك الكويت الوطني", 
      "amount": 230.000,
      "due_date": "2024-02-15",
      "days_until_due": 5,
      "priority_score": 8.5
    }
  ],
  "overdue_payments": [],
  "monthly_trend": {
    "labels": ["ديسمبر", "يناير", "فبراير"],
    "paid_amounts": [850.0, 890.5, 0],
    "remaining_amounts": [13500.0, 12609.5, 12379.5]
  }
}
```

### GET /api/analytics/dti
حساب نسبة الدين إلى الدخل

**Response:**
```json
{
  "current_dti": 74.2,
  "target_dti": 40.0,
  "status": "high",
  "recommendation": "يُنصح بتقليل الالتزامات أو زيادة الدخل",
  "breakdown": {
    "monthly_income": 1200.000,
    "monthly_obligations": 890.500,
    "discretionary_income": 309.500
  }
}
```

### GET /api/analytics/payment-trends
الاتجاهات في الدفعات

**Query Parameters:**
- `period` (optional): الفترة (6months, 1year, 2years)

**Response:**
```json
{
  "period": "6months",
  "data": {
    "monthly_payments": [
      {"month": "2023-09", "amount": 750.0},
      {"month": "2023-10", "amount": 890.5},
      {"month": "2023-11", "amount": 890.5},
      {"month": "2023-12", "amount": 850.0},
      {"month": "2024-01", "amount": 890.5}
    ],
    "on_time_rate": 95.2,
    "average_payment": 854.3,
    "total_paid": 4271.5
  }
}
```

---

## 🔄 المزامنة (Sync)

### POST /api/sync/upload
رفع البيانات المحلية إلى السحابة

**Request Body:**
```json
{
  "last_sync": "2024-01-15T10:00:00Z",
  "data": {
    "settings": {...},
    "entities": [...],
    "debts": [...],
    "payments": [...]
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "تم رفع البيانات بنجاح",
  "sync_timestamp": "2024-01-15T15:30:00Z",
  "conflicts": [],
  "uploaded_records": {
    "settings": 1,
    "entities": 5,
    "debts": 3,
    "payments": 12
  }
}
```

### GET /api/sync/download
تحميل البيانات من السحابة

**Query Parameters:**
- `since` (optional): تحميل التغييرات منذ تاريخ معين

**Response:**
```json
{
  "data": {
    "settings": {...},
    "entities": [...],
    "debts": [...],
    "payments": [...]
  },
  "last_modified": "2024-01-15T15:30:00Z",
  "total_records": 156
}
```

### GET /api/sync/status
حالة المزامنة

**Response:**
```json
{
  "is_synced": true,
  "last_sync": "2024-01-15T15:30:00Z",
  "pending_uploads": 0,
  "conflicts": 0,
  "connection_status": "online"
}
```

---

## 🔔 الإشعارات (Notifications)

### GET /api/notifications/scheduled
الحصول على الإشعارات المجدولة

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "debt_id": 1,
      "debt_name": "قرض بنك الكويت الوطني",
      "remind_date": "2024-02-12",
      "reminder_type": "due_date",
      "status": "pending",
      "message": "تذكير: قسط بقيمة 230.000 د.ك مستحق خلال 3 أيام"
    }
  ]
}
```

### POST /api/notifications/schedule
جدولة إشعار جديد

**Request Body:**
```json
{
  "debt_id": 1,
  "remind_date": "2024-02-12",
  "reminder_type": "custom",
  "custom_message": "تذكير مخصص للدفعة"
}
```

---

## ⚠️ معالجة الأخطاء

### رموز الأخطاء الشائعة

| الكود | الوصف | الحل المقترح |
|-------|--------|-------------|
| 400 | Bad Request | تحقق من صيغة البيانات المرسلة |
| 404 | Not Found | تأكد من وجود المورد المطلوب |
| 409 | Conflict | حل التضارب في البيانات |
| 422 | Validation Error | تصحيح البيانات المدخلة |
| 500 | Server Error | إعادة المحاولة أو الاتصال بالدعم |

### تنسيق رسائل الخطأ

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "البيانات المدخلة غير صحيحة",
    "details": {
      "field": "salary",
      "value": -100,
      "constraint": "must be positive"
    }
  },
  "timestamp": "2024-01-15T15:30:00Z"
}
```

---

## 🔐 المصادقة والأمان

### Headers مطلوبة

```http
Content-Type: application/json
X-App-Version: 1.0.0
X-Device-ID: unique-device-identifier
Authorization: Bearer [token] # في المستقبل
```

### Rate Limiting

- **العمليات العادية**: 100 طلب/دقيقة
- **المزامنة**: 10 طلب/دقيقة  
- **التحليلات**: 20 طلب/دقيقة

---

## 🧪 أمثلة الاختبار

### مثال JavaScript/TypeScript

```typescript
// خدمة العمل مع APIs
class DebtAPIService {
  private baseURL = 'http://localhost:3000/api';

  async getActiveDebts(): Promise<Debt[]> {
    try {
      const response = await fetch(`${this.baseURL}/debts?status=active`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching active debts:', error);
      throw error;
    }
  }

  async createPayment(payment: CreatePaymentInput): Promise<Payment> {
    try {
      const response = await fetch(`${this.baseURL}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payment),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error.message);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  }
}
```

### مثال cURL

```bash
# إضافة التزام جديد
curl -X POST http://localhost:3000/api/debts \
  -H "Content-Type: application/json" \
  -d '{
    "entity_id": 1,
    "kind": "loan",
    "principal": 5000.000,
    "apr": 7.5,
    "start_date": "2024-01-01",
    "due_day": 15,
    "total_installments": 24,
    "installment_amount": 230.000
  }'

# تسجيل دفعة
curl -X POST http://localhost:3000/api/payments \
  -H "Content-Type: application/json" \
  -d '{
    "debt_id": 1,
    "amount": 230.000,
    "payment_date": "2024-01-15",
    "method": "bank_transfer"
  }'
```

---

## 📱 تكامل React Native

### مثال خدمة API في React Native

```typescript
// services/api.ts
import { Alert } from 'react-native';

class APIService {
  private async handleResponse(response: Response) {
    if (!response.ok) {
      const error = await response.json();
      Alert.alert('خطأ', error.error.message || 'حدث خطأ غير متوقع');
      throw new Error(error.error.message);
    }
    return response.json();
  }

  async getDashboardData() {
    try {
      const response = await fetch('/api/analytics/dashboard');
      return this.handleResponse(response);
    } catch (error) {
      console.error('Dashboard API error:', error);
      throw error;
    }
  }
}

export const apiService = new APIService();
```

---

## 📋 قائمة المراجعة للتطوير

### قبل البدء
- [ ] إعداد متغيرات البيئة
- [ ] تهيئة قاعدة البيانات
- [ ] اختبار الاتصال بـ Neon
- [ ] تشغيل migration scripts

### أثناء التطوير
- [ ] إضافة validation لكل endpoint
- [ ] كتابة tests للـ APIs
- [ ] توثيق أي تغييرات جديدة
- [ ] اختبار error scenarios

### قبل النشر
- [ ] مراجعة الأمان
- [ ] تحسين الأداء
- [ ] اختبار التحميل
- [ ] تحديث المستندات

---

**آخر تحديث:** $(date)  
**الإصدار:** 1.0.0  
**بيئة الاختبار:** http://localhost:3000/api
