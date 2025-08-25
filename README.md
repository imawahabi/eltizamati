# إلتزاماتي – eltizamati

> **ملف مواصفات وتنفيذ شامل (README.md)** – يشرح المنتج خطوة بخطوة، المنطق المالي، التصميم، مخطط البيانات، الخوارزميات، أمثلة عملية، وخطة التنفيذ. موجه لكل مطوّر وذكاء صناعي يعمل على المشروع.

---

## 0) المبدأ التوجيهي

* **واقعي ومباشر**: التطبيق يعكس سلوك المستخدم الحقيقي في الكويت: الناس تكتب ديونها في **Notes/WhatsApp** وتراجع تفاصيل القروض من **تطبيق البنك**.
* **نسخة أولى مخصّصة للكويت فقط**: المنطقة **Kuwait**، العملة **KWD** حصريًا، المنطقة الزمنية **Asia/Kuwait**، تنسيق الأرقام ثلاث منازل عشرية.
* **قيمة أساسية**: ترتيب الالتزامات، تسجيل السداد (بما في ذلك **أكثر من دفعة في نفس الشهر**)، تنبيهات، وتأجيل مع محاكاة أثر، مع **ذكاء اصطناعي** يحوّل الفوضى (Notes) لبيانات منظمة ويوجّه قرارات السداد.

---

## 1) نظرة عامة

* **الفئة المستهدفة**: موظفون، عملاء BNPL/تقسيط إلكترونيات، ديون شخصية (أصدقاء/عائلة)، قروض بنكية.
* **المنصّة**: iOS أولًا (التطوير على **Windows** باستخدام **Windsurf IDE + Vibe Coding** عبر **React Native + Expo + SQLite**، البناء عبر **EAS Build**).
* **اللغة والخط**: عربي/إنجليزي، **Cairo** كخط أساسي، دعم RTL كامل.

### 1.1 ماذا يفعل التطبيق؟

* **لوحة شهرية**: الراتب – إجمالي الأقساط/المدفوعات – المتبقي المتوقع.
* **سجل الالتزامات**: قروض بنكية، إلكترونيات (X-cite/Best/Eureka/Hatef 2000 …)، BNPL (Tabby/Deema)، ديون الأصدقاء/العائلة، فواتير لمرة واحدة.
* **سداد متعدد**: سجل أكثر من دفعة لنفس القسط في نفس الشهر.
* **تجميع ديون الشخص/الجهة** عبر الزمن مع إجمالي مستحق.
* **تذكيرات ذكية**: T-7/T-3/T-1/T مع مراعاة الجمعة/السبت والعطل.
* **تأجيل/إعادة جدولة**: تاريخ محدد أو للشهر القادم، مع محاكاة أثر الرسوم والضغط القادم.
* **ذكاء اصطناعي**: تحويل نصوص حرة إلى التزامات، ترتيب سداد (Avalanche/Snowball/Hybrid)، تنبؤ فائض/عجز، واقتراحات نصية.

---

## 2) شخصيات المستخدم (Personas)

* **موظف راتب ثابت**: يريد رؤية الصافي والمتبقي وتفادي الغرامات.
* **عميل إلكترونيات/BNPL**: يقسّط عبر X-cite/Best/Eureka/هاتف 2000 أو Tabby/Deema.
* **دين عائلة/أصدقاء**: يسجّل أخذ/رد مبالغ على دفعات، يحتاج تنبيهات دقيقة واحترام المواعيد.

---

## 3) سيناريوهات الاستخدام (Flows)

### 3.1 إدخال من Notes/WhatsApp (NLP)

* المستخدم ينسخ نصًا مثل:

  * "اخدت 120 من محمد يوم 2025-08-05 اسدد كل 10 في الشهر 3 شهور"
  * "قسط Eureka 18.500 يوم 15 باقي 7 شهور"
* التطبيق يقترح حقولًا مُعبأة: النوع، الجهة/الشخص، المبلغ، يوم الاستحقاق، عدد الأشهر، قيمة القسط… مع إمكانية التعديل والحفظ.

### 3.2 Snapshot من تطبيق البنك

* المستخدم يرى في تطبيق البنك: "المتبقي 3,200 KWD – 24 شهر متبقٍ – قسط 160 KWD – فائدة 7% سنويًا" → يدخلها **كما هي** لإنشاء التزام قرض مع تواريخ وقيم دقيقة.

### 3.3 تسجيل دفعات متعددة

* قسط 18.500 KWD يوم 15: يدفع 10.000 يوم 5 + 8.500 يوم 14 → القسط مغطّى لهذا الشهر، ولا تتضاعف أي رسوم.

### 3.4 التأجيل

* يختار تأجيل قسط Best للشهر القادم → التطبيق يحسب رسوم التأخير + يوضح تراكم الأقساط في الشهر القادم ويقترح تعويض من بند مصاريف أخرى.

### 3.5 إقفال دين شخصي

* "دفعت لمحمد 25 يوم 2025-09-05" → يُخصم من الرصيد. لو الرصيد صفر → الحالة **Closed** + أرشفة + تقرير مختصر.

---

## 4) قواعد العمل (Business Rules)

* **الرّاتب**: `settings.payday_day` يحدد يوم الصرف؛ يعرض المتبقي المتوقع حتى نهاية الشهر.
* **Due Day**: لو 30/31 في شهر قصير → **آخر يوم في الشهر**.
* **عطلة/ويكند**: إن صادف الاستحقاق جمعة/سبت أو عطلة رسمية → يقترح السداد قبلها بيوم عمل.
* **فائدة القروض**: تُحتسب **يوميًا** على الرصيد القائم: `interest = principal_remaining * (APR/365) * days`.
* **BNPL/إلكترونيات بدون فائدة**: لا فائدة، قد توجد رسوم تأخير **ثابتة**.
* **دفعات زائدة/مبكرة**:

  * قرض: الزيادة تُخصم من **الأصل** وقد تقلّل عدد الأقساط المتبقية حسب سياسة الجهة.
  * BNPL: إن غُطّي قسط الشهر، يبقى الجدول كما هو؛ الزائد قد يُسجّل كسداد مبكر.
* **تجميع الديون**: كل الديون على نفس الجهة/الشخص تُظهر **Total Outstanding** مع **Breakdown** زمني.
* **العملة**: KWD (ثلاث منازل عشرية). التقريب Bankers Rounding حيث يلزم.

---

## 5) الذكاء الاصطناعي (AI)

### 5.1 تصنيف وتحويل النصوص (NLP)

قواعد تحويل من نص حر إلى حقول:

* إذا ذُكر **عدد الأشهر** ولم يُذكر القسط: `installment_amount = principal / total_installments`.
* إذا ذُكر **قسط شهري** ولم تُذكر المدة: `total_installments = ceil(principal / installment_amount)`.
* إذا ذُكرت **رسوم/فائدة**: تحفظ كـ `apr` أو `fee_fixed` حسب النص.
* دعم كلمات مفتاحية عربية/إنجليزية: (قسط/installment, فائدة/APR, رسوم/fee, تأجيل/postpone…).

### 5.2 ترتيب أولوية السداد (Scoring)

```
score = w1*cost_index + w2*urgency + w3*penalty_risk + w4*relationship_factor
```

* **Avalanche**: `w1=0.55, w2=0.25, w3=0.2, w4=0`
* **Snowball**: استبدل `cost_index` بـ `1 - normalized_remaining_principal`
* **Hybrid**: `w1=0.4, w2=0.35, w3=0.2, w4=0.05`
  **المخرجات**: قائمة مرتبة مع تفسير: لماذا هذا أولًا؟ كم ستوفّر إن سدّدت الآن؟

### 5.3 تنبؤات نهاية الشهر

* يحسب فائض/عجز متوقع ويقترح تحويل مبالغ بين البنود لتجنّب رسوم.

### 5.4 مساعد نصي

* قوالب رسائل: طلب تأجيل لطيف للأصدقاء/التجار، تأكيد استلام، تسوية نهائية…

---

## 6) قاعدة البيانات (SQLite)

### 6.1 المخطط (DDL)

```sql
-- إعدادات عامة (سجل منفرد)
CREATE TABLE settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  language TEXT DEFAULT 'ar',                -- 'ar' | 'en'
  payday_day INTEGER NOT NULL,               -- 1..31
  currency TEXT DEFAULT 'KWD',
  strategy_default TEXT DEFAULT 'hybrid',    -- 'avalanche'|'snowball'|'hybrid'
  quiet_hours_from TEXT DEFAULT '21:00',     -- HH:MM local
  quiet_hours_to   TEXT DEFAULT '08:00'
);

-- مصادر الدخل (اختياري للرصد)
CREATE TABLE incomes (
  id INTEGER PRIMARY KEY,
  amount REAL NOT NULL,
  date TEXT NOT NULL,                        -- ISO 8601
  note TEXT
);

-- الجهات (بنوك/تجزئة/BNPL/اتصالات/أشخاص)
CREATE TABLE entities (
  id INTEGER PRIMARY KEY,
  kind TEXT NOT NULL,                        -- 'bank'|'bnpl'|'retailer'|'telco'|'person'|'finance'|'other'
  name TEXT NOT NULL,
  phone TEXT,
  note TEXT,
  UNIQUE(kind, name)
);

-- الالتزامات
CREATE TABLE debts (
  id INTEGER PRIMARY KEY,
  entity_id INTEGER NOT NULL REFERENCES entities(id) ON DELETE RESTRICT,
  kind TEXT NOT NULL,                        -- 'loan'|'bnpl'|'friend'|'oneoff'
  principal REAL NOT NULL,                   -- أصل الدين/إجمالي العقد
  apr REAL DEFAULT 0,                        -- % سنوي
  fee_fixed REAL DEFAULT 0,                  -- رسوم تأخير ثابتة
  start_date TEXT NOT NULL,                  -- تاريخ بداية الالتزام
  due_day INTEGER NOT NULL,                  -- 1..31
  total_installments INTEGER,                -- إن وجد
  remaining_installments INTEGER,            -- محدث دائمًا
  installment_amount REAL,                   -- إن وجد
  status TEXT NOT NULL DEFAULT 'active',     -- 'active'|'closed'|'paused'
  penalty_policy TEXT,                       -- JSON صغير: {late_fee:2, grace_days:3}
  relationship_factor REAL DEFAULT 0,        -- 0..1
  tags TEXT                                  -- CSV لوسوم سريعة
);

-- الدفعات (يسمح بأكثر من دفعة بالشهر)
CREATE TABLE payments (
  id INTEGER PRIMARY KEY,
  debt_id INTEGER NOT NULL REFERENCES debts(id) ON DELETE CASCADE,
  amount REAL NOT NULL,
  date TEXT NOT NULL,                        -- تاريخ الدفع
  method TEXT,                               -- cash|knet|visa|applepay|banktransfer|other
  note TEXT
);

-- التذكيرات
CREATE TABLE reminders (
  id INTEGER PRIMARY KEY,
  debt_id INTEGER NOT NULL REFERENCES debts(id) ON DELETE CASCADE,
  remind_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'     -- pending|sent|snoozed|done
);

-- عطلات (اختياري)
CREATE TABLE holidays (
  id INTEGER PRIMARY KEY,
  date TEXT NOT NULL UNIQUE,
  name TEXT
);

CREATE INDEX idx_debts_entity ON debts(entity_id);
CREATE INDEX idx_payments_debt ON payments(debt_id);
CREATE INDEX idx_reminders_date ON reminders(remind_date);
```

### 6.2 قواعد اشتقاق/تحديث

* عند إدخال BNPL وتوفّر العدد × قيمة القسط → اشتق `principal` تلقائيًا إن لم يُذكر.
* تقلّ `remaining_installments` عندما تُغطّى قيمة قسط ذلك الشهر.
* الفائدة اليومية للقروض تُحتسب على الرصيد **بعد** كل دفعة.

### 6.3 بيانات تأسيسية (Seed)

* **بنوك**: NBK, KFH, Gulf Bank, CBK, ABK, Burgan, Boubyan, KIB, Warba, IBK
* **تجزئة/إلكترونيات**: X-cite (Alghanim), Best Al-Yousifi, Eureka, Digits, **Hatef 2000**
* **شركات تمويل**: CFC, Al Mulla Finance, Al Manar, KFIC Finance
* **BNPL**: Tabby, **Deema**
* **اتصالات**: Zain, Ooredoo, stc

**مثال Seed SQL**:

```sql
INSERT INTO entities(kind,name) VALUES
('bank','National Bank of Kuwait (NBK)'),('bank','Kuwait Finance House (KFH)'),('bank','Gulf Bank'),('bank','Commercial Bank of Kuwait (CBK)'),('bank','Al Ahli Bank of Kuwait (ABK)'),('bank','Burgan Bank'),('bank','Boubyan Bank'),('bank','Kuwait International Bank (KIB)'),('bank','Warba Bank'),('bank','Industrial Bank of Kuwait (IBK)'),
('retailer','X-cite (Alghanim)'),('retailer','Best Al-Yousifi'),('retailer','Eureka'),('retailer','Digits'),('retailer','Hatef 2000'),
('finance','Commercial Facilities Company (CFC)'),('finance','Al Mulla Finance'),('finance','Al Manar'),('finance','KFIC Finance'),
('bnpl','Tabby'),('bnpl','Deema'),
('telco','Zain Kuwait'),('telco','Ooredoo Kuwait'),('telco','stc Kuwait');
```

---

## 7) الخوارزميات والتواريخ

### 7.1 حساب الاستحقاق الفعلي

```
function next_due_date(due_day, month, year):
  last = last_day_of_month(month, year)
  d = min(due_day, last)
  if is_weekend(d) or is_holiday(d):
    return previous_business_day(d)
  return d
```

### 7.2 الفائدة اليومية للقروض

```
interest = principal_remaining * (APR/100) / 365 * days_elapsed
```

تُضاف للرصيد أو تعرض كمعلومة تقديرية حسب سياسة الجهة.

### 7.3 محاكاة التأجيل

```
extra_cost = late_fee (إن وُجد) + extra_interest
next_month_pressure = count(due_next_month) + 1 (هذا المؤجل)
```

المخرج: رسوم + تزاحم + توصية لتعديل بند إنفاق لتجنّب العجز.

### 7.4 ترتيب السداد (Scoring)

انظر قسم AI أعلاه؛ أعد حساب الدرجات عند كل تغيير للرصيد/الوقت.

---

## 8) واجهة الاستخدام (UI/UX)

* **الخط**: Cairo. أحجام متفاوتة واضحة.
* **RTL**: للعربية تلقائيًا.
* **شاشات**: لوحة رئيسية، الالتزامات، تفاصيل التزام، إضافة/تعديل، تسجيل دفعة، التأجيل، التذكيرات، الإعدادات.
* **نسخ واجهة (أمثلة)**:

  * تذكير: "قسط **{name}** بعد **{days}** أيام: **{amount} KWD**. تسدّد الآن؟"
  * نصيحة: "تأجيل **{name}** = رسوم **{fee} KWD**. سدّد مبكرًا وتجنّب الرسوم."
  * ملخص: "سددت **{n}** التزامات / **{sum} KWD**. المتبقي المتوقع **{remain} KWD**."

---

## 9) التطوير – بيئة وأدوات

* **Windows + Windsurf IDE + Vibe Coding**.
* **React Native + Expo**، قاعدة بيانات: **expo-sqlite** (ويمكن استخدام SQLCipher لاحقًا للتشفير).
* البناء لـ iOS عبر **EAS Build** (حساب Apple مطلوب للنشر).
* الإشعارات: **Expo Notifications** (محلية)، مراعاة **Quiet Hours**.

### 9.1 هيكل المستودع

```
/eltizamati
  /app
    /screens
    /components
    /i18n (ar.json, en.json)
    /lib (date, money, scoring, nlp)
    /db (migrations.sql, seed.sql)
  /docs (هذا الملف + أمثلة JSON)
```

### 9.2 خطوات الإقلاع (Dev)

1. `npm i -g expo-cli` ثم `npx create-expo-app eltizamati`.
2. إضافة `expo-sqlite`, `expo-notifications`, `dayjs`.
3. إنشاء `db/migrations.sql` و`db/seed.sql` وتشغيلها أول تشغيل.
4. تجهيز i18n (ar/en) وتفعيل RTL.
5. تنفيذ الشاشات الأساسية (تفاصيلها أدناه).

---

## 10) تنفيذ الشاشات خطوة بخطوة

### 10.1 الإعدادات (Settings)

* حقول: payday\_day, language, strategy\_default, quiet\_hours.
* أزرار: استيراد/تصدير JSON، تحميل Seed كيانات الكويت.

### 10.2 إدارة الجهات (Entities)

* قائمة بالكيانات الافتراضية (Kuwait) + زر إضافة جديد.
* بحث سريع + وسوم (bank, bnpl, retailer, telco, person).

### 10.3 إضافة التزام (Debt Form)

* اختيار الجهة/الشخص.
* النوع: loan | bnpl | friend | oneoff.
* الحقول: principal, apr/fee\_fixed, start\_date, due\_day, total\_installments, installment\_amount, penalty\_policy.
* زر: **لصق من Notes** → نافذة NLP تعبئة تلقائية.
* زر: **Snapshot بنك** → إدخال: الرصيد المتبقي + القسط + الأشهر المتبقية + APR.

### 10.4 تفاصيل التزام

* بطاقة معلومات: الرصيد، القسط، المتبقي من الأشهر، الاستحقاق القادم (بعد تصحيح العطلات/الويكند).
* سجل الدفعات الشهري (يمكن إضافة أكثر من دفعة).
* أزرار: **سداد الآن**، **تأجيل**، **إقفال**.

### 10.5 تسجيل دفعة

* مبلغ + تاريخ + طريقة + ملاحظة.
* منطق: إن غُطي قسط الشهر → علامة ✅ لهذا الشهر.

### 10.6 التأجيل

* اختيار: للشهر القادم أو تاريخ محدد.
* شاشة محاكاة: رسوم + ضغط الشهر القادم + توصية.

### 10.7 لوحة رئيسية (Dashboard)

* Snapshot: راتب الشهر – إجمالي أقساط الشهر – المتبقي المتوقع.
* قائمة التزامات هذا الشهر بترتيب **الذكاء الاصطناعي**.
* بطاقات تنبيه: استحقاقات خلال 7/3/1 أيام، تأخرات، مخاطر رسوم.

---

## 11) i18n و RTL

* ملفات `ar.json`, `en.json`.
* تبديل اللغة من الإعدادات.
* RTL عند العربية تلقائيًا.

---

## 12) التذكيرات (Notifications)

* جدولة افتراضية: T-7, T-3, T-1, T.
* احترام **Quiet Hours** (لا إشعار 21:00–08:00).
* لو صادفت جمعة/سبت/عطلة: تقترح إشعار/سداد سابق.
* تنطبق على **كل الأنواع**: قروض، إلكترونيات/BNPL، ديون الأصدقاء/العائلة.

---

## 13) استيراد/تصدير

* **Export JSON**: جداول settings, entities, debts, payments, reminders, holidays.
* **Import**: دمج بالاعتماد على `(kind, name)` للجهات، و`id` لباقي الجداول.

---

## 14) أمثلة عملية (End-to-End)

### مثال A – دين شخصي من Notes

* نص: "اخدت 120 من محمد يوم 2025-08-05 اسدد كل 10 في الشهر 3 شهور" → يقترح:

  * entity: person:"محمد"، kind: friend
  * principal: 120, total\_installments: 3, due\_day: 10, installment: 40, apr: 0
  * start\_date: 2025-08-05
  * reminders: 2025-09-10 (T-7/T-3/T-1/T)

### مثال B – BNPL Eureka

* 7 × 18.500 يوم 15 → principal = 129.500، due\_day=15، remaining\_installments=7.
* مدفوعات: 10.000 (5th) + 8.500 (14th) → شهر مغطّى.

### مثال C – قرض بنك Snapshot

* رصيد: 3,200، قسط: 160، 24 شهر متبقٍ، APR 7% → يحسب الفائدة اليومية ويعرض الرصيد المتوقع كل شهر قبل/بعد دفعات مبكرة.

### مثال D – تأجيل Best

* تأجيل شهر + late\_fee=2 → شاشة أثر: رسوم 2 + تزاحم الشهر القادم + توصية خفض بند المطاعم 2 KWD هذا الشهر.

---

## 15) معايير القبول (Acceptance)

* إضافة التزام عبر النموذج أو لصق نص حر (NLP) بدقة ≥ 90% في الحقول الأساسية.
* تسجيل **دفعتين أو أكثر** لنفس القسط في نفس الشهر دون أخطاء في الترصيد.
* تنبيهات تُنشأ تلقائيًا وتراعي الويكند/العطل.
* ترتيب توصيات السداد يظهر مبررات واضحة.
* التأجيل يعرض رسوم/تزاحم قبل التأكيد.

---

## 16) الاختبارات

* تاريخ استحقاق 31 في فبراير ⇒ يتحول لآخر يوم.
* BNPL 7×18.500 ⇒ أصل 129.500.
* قرض APR 7%: تحقق من الفائدة اليومية لمدد مختلفة.
* دفعات متعددة تغطي قسط الشهر دون تكرار رسوم.

---

## 17) الأمان والخصوصية

* البيانات محليًا في SQLite. خيار تشفير (SQLCipher لاحقًا).
* Keychain للمفاتيح والإعدادات الحساسة.
* قفل بالتطبيق (PIN/FaceID) + وضع إخفاء مبالغ (Blur).

---

## 18) خطة التنفيذ (Sprints)

### Sprint 0 (3 أيام)

* تهيئة المشروع (Expo)، SQLite، i18n، RTL، Cairo.
* مهاجرات DB + Seed الكويت.

### Sprint 1 (أسبوع)

* Entities UI + Debt Form + NLP بسيط.

### Sprint 2 (أسبوع)

* Payments (دفعات متعددة) + Dashboard Snapshot + Notifications T-7..T.

### Sprint 3 (أسبوع)

* تأجيل/محاكاة الأثر + توصيات السداد (Scoring) + تقارير شهرية.

### Sprint 4 (3–5 أيام)

* صقل UX + اختبارات قبول + تصدير/استيراد JSON + إعداد EAS Build.

---

## 19) قائمة مهام (ToDo)

* [ ] Setup Expo + SQLite + i18n + RTL + Cairo.
* [ ] جداول ومهاجرات + Seed الكويت.
* [ ] شاشة الإعدادات.
* [ ] إدارة الجهات + بحث + إضافة.
* [ ] نموذج إضافة التزام + Snapshot بنك + لصق Notes (NLP).
* [ ] تفاصيل التزام + سجل دفعات + دفعات متعددة بالشهر.
* [ ] لوحة رئيسية + Snapshot شهري.
* [ ] تنبيهات T-7/T-3/T-1/T + Quiet Hours + عطلات.
* [ ] تأجيل/محاكاة أثر + توصيات سداد (Hybrid/Avalanche/Snowball).
* [ ] استيراد/تصدير JSON.
* [ ] اختبارات وحدات + قبول.

---

## 20) ملاحق

### A) holiday.json (مثال)

```json
[
  {"date":"2025-01-01","name":"New Year"},
  {"date":"2025-02-27","name":"National Day"}
]
```

### B) نماذج نصوص (NLP)

* "سلف 200 من أحمد 2025-08-01 رجعها 15 كل شهر 4 شهور"
* "قرض بنك NBK قسط 160 كل 25 فائدة 7%"
* "Tabby Eureka 12×10.000 يوم 12"

### C) رسائل جاهزة

* "مساء الخير، أحتاج تأجيل السداد لهذا الشهر إلى {date}. أؤكد التزامي بالسداد الكامل الشهر القادم. شكرًا لتعاونك."

---

**جاهز للتنفيذ فورًا.**
