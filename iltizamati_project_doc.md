# إلتزاماتي — المواصفات الشاملة (Detailed Product Spec)

> وثيقة واحدة مركّزة وواضحة لكل ما تحتاجه لبناء MVP لتطبيق iOS باسم **"إلتزاماتي"** باستخدام **Expo Go + React Native + SQLite**. هذه النسخة تفصيلية: تصميم، بيانات، تدفقات، واجهة المستخدم، لائحة الألوان والخطوط، منطق الإشعارات، المقاييس التحليلية، وخطة التنفيذ.

---

## 0 — ملاحظة تنفيذية سريعة
- هذا المستند مكتوب بالعربي RTL كما طلبت.  
- الهدف: ملف مرجعي واحد تعطيه لأي أداة ذكاء اصطناعي أو مطور ويبدأ التنفيذ مباشرة.  
- اِستخدم الملف كـ `README.md` أو كمرجع تصميمي وعملي.

---

## 1 — ملخص المشروع (One-liner)
"إلتزاماتي" تطبيق شخصي لإدارة الالتزامات، الأقساط، والديون — Offline-first، إشعارات ذكية، واجهة عربية RTL، تجربة موجهة لموظفي الكويت.

### أهداف قابلة للقياس (KPIs للنجاح الأولي)
- إطلاق MVP على TestFlight خلال 6 أسابيع من بدء تنفيذ الواجهة.  
- احتفاظ المستخدم الأولي (DAU) ≥ 30% بعد أسبوع من الاستخدام (مستخدمين يقومون بتسجيل دفعة أو إلتزام).  
- معدل الأخطاء الحرجة في تسجيل المدفوعات < 2%.

---

## 2 — نطاق الـMVP (ما سنبني الآن)
**وظائف أساسية (مطلوبة):**
1. تخزين بيانات محلي بـ SQLite (offline-only).  
2. شاشات: Onboarding صغير (راتب/يوم الصرف)، Home (Dashboard)، Obligations (قائمة)، Obligation Detail، Payments (سجل)، Analytics، Settings.  
3. إضافة التزام عبر معالج (Wizard) يدعم: قرض بنك، تمويل، BNPL، متجر، دين شخصي، ادخار، اشتراك.  
4. تسجيل دفعات (كاملة/جزئية) وتحديث الرصيد المتبقي.  
5. إشعارات محلية (7/3/1 يوم + يوم الاستحقاق + تذكيرات بعد التأخير).  
6. Export / Import مشفّر (JSON) للنسخ الاحتياطية.  
7. App Lock (PIN/FaceID) وحفظ الإعدادات.  

**ما لن نعمله الآن:** مزامنة سحابيّة، تسجيل مستخدم متعدد الأجهزة، ربط مباشر مع بنوك.

---

## 3 — التقنية المُختارة ولماذا
- **React Native (Expo Go)** — سرعة تطوير، Hot Reload، وتجربة اختبار سهلة على iOS عبر Expo Go. مناسب لبناء MVP بدون خوض تعقيدات Native المبكرة.  
- **SQLite (expo-sqlite / react-native-sqlite-storage)** — مصفوفة بيانات محلية بسيطة، قابلة للمزامنة لاحقًا.  
- **expo-notifications** — إشعارات محلية مجدولة. ملاحظة مهمة: Push Notifications الحقيقية على iOS تتطلب بناء Development/Production أو EAS build؛ Expo Go يدعم الإختبار المحلي للإشعارات المحلية.  
- **expo-secure-store** — تخزين آمن لمفتاح التصدير وبيانات حساسة.  
- **i18n (i18next أو react-intl)** — تجهيز للترجمة لاحقًا.

> ملاحظة عملية: ابدأ بـ Expo Go لاختبار الواجهات ومكوّنات الـUX. عند الحاجة للميزات التي تحتاج native modules (push, background tasks متقدّم) انتقل إلى development build أو EAS build. 

---

## 4 — لغة التصميم (Design System) — ألوان، خطوط، مسافات
### الألوان المقترحة (Tokens)
- Primary Gradient (trust + finance):
  - `--primary-700: #0B63FF` (نَفَس أزرق داكن)
  - `--primary-500: #2C9BF0` (أزرق متوسط)
  - `--primary-300: #8FD3FF` (أزرق فاتح)`
  - مثال Gradient: linear-gradient(135deg, #0B63FF 0%, #2C9BF0 60%, #8FD3FF 100%)
- Accent / Success (money & growth):
  - `--success-600: #28A745` (أخضر واضح)
  - `--success-400: #7DE3A0` (أخضر فاتح للتقدم)
- Warnings / Alerts:
  - `--warning-500: #FFAA00` (تنبيه غير طارئ)
  - `--danger-500: #E74C3C` (متأخر/سلبي)
- Neutrals (خلفيات ونصوص):
  - `--bg: #FFFFFF` (خلفية رئيسية)
  - `--surface: #F7F9FC` (بطاقات)
  - `--muted-600: #6B7280` (نص فرعي)
  - `--text-900: #0F1724` (نص أساسي)

> لماذا أزرق + أخضر؟ الأبحاث والتطبيقات المالية تستخدم الأزرق للثقة والاستقرار، والأخضر للدلالة على المال والنمو — مناسب لتطبيق مالي موثوق. (راجع توصيات الألوان للـFinTech). 

### تدريجات وظيفية (usage tips)
- Primary gradient يُستخدم في Header، CTA الأساسي، زر FAB.  
- Success الأخضر للـ badges التي تظهر "مدفوع" أو "تقدم حفظ".  
- Danger أحمر فقط للحالات الحرجة (تأخر أو تخطي حد DTI).

### الخط
- **Cairo** هو خط مناسب، واضح وشائع للاستخدام في الواجهات العربية. استخدمه للأوزان: 400 (Regular), 600 (SemiBold), 700 (Bold). (تم اختياره لقراءة أفضل على الشاشات ولتوافق ثنائي اللغة لاحقًا). 

**حجم الخطوط (Arabic sizing guidance)**
- Display / App Title: 28–32px (وزن 700) — شاشة البداية و headings الكبيرة.  
- H1: 22–24px (700)  
- H2: 18–20px (600)  
- Body / paragraph: 16–18px (400)  
- Small / captions: 12–14px (400) — تزداد أحجام الخط العربي بنسبة ~15–25% مقارنة بالإنجليزي لضمان الوضوح.

### مسافات وأبعاد (spacing system)
- Grid spacing: 4 / 8 / 12 / 16 / 24 / 32 / 40 px scale.  
- Border radius عام: 12px لبطاقات، 8px لأزرار ثانوية، 24px للفاب ومربعات الإدخال الكبيرة.  
- Touch target: 44x44 px كحد أدنى حسب Apple HIG.

### أيقونات وصور
- استخدم مكتبة أيقونات نظيفة (Feather / Tabler / Heroicons) — أيقونات بسيطة، أحادية اللون في الوضع الافتراضي، مع إمكانية تلوينها بالألوان المميزة.

---

## 5 — مكونات UI (Component Inventory)
1. **Top header** — 2-line: اسم التطبيق + يوم الصرف/راتب سريع.
2. **Primary KPI card** — مزدوج الأعمدة: Left = Salary net, Right = Remaining after obligations. CTA صغير.
3. **Obligation Card** — اسم الدائن، نوع، قسط شهري، متبقي، progress bar صغير.
4. **Installment Row** — تاريخ | مبلغ | حالة (badge) | actions (سجل دفعة).
5. **FAB** — кругي مركز في أسفل الشاشة (+) لإضافة التزام/دفعة.
6. **Modal / Bottom sheet** — لاستخدام مع Payment entry (سهل الوصول، يختفي بسحب).
7. **Chart components** — small KPIs row و area/line و pie.
8. **Empty states** — رسائل موجزة مع CTA.
9. **Snackbars/Undo** — بعد تسجيل الدفع يظهر "تم تسجيل الدفع" مع زر تراجع لمدة 6 ث.

---

## 6 — الشاشات بالتفصيل (UX wires مصغّر)
> لكل شاشة أصف المكوّنات بالترتيب، التفاعل، والـmicro-copy (النصوص الصغيرة).

### A — Onboarding (أول فتح)
- **شاشة 1:** مرحبًا — شعار + ملخص مهم: "سجل راتبك وأضف التزاماتك — كل شيء يبقى على جهازك". CTA: "ابدأ".  
- **شاشة 2:** أدخل الراتب الشهري (input) + يوم الصرف (picker) — زر حفظ.  
- **شاشة 3:** تفعيل الإشعارات (switch) + الأذونات. 

### B — Home (Dashboard)
- Header: اسم المستخدم أو "إلتزاماتي" + Icon إعدادات.  
- KPI strip: Salary | Monthly obligations | Remaining — كل خانة ببطاقة صغيرة.  
- Goal progress (ادخار): شريط تقدم وCTA "أضف هدف".  
- List: 3 أقرب مستحقات (sortable). كل سطر: اسم الدائن — تاريخ — مبلغ — حالة.  
- Quick actions row: [سجل دفعة] [أضف التزام] [استيراد].  
- Bottom: تبويب/رابط للتحليلات.

### C — Obligations List
- Filter bar: نوع | حالة | بحث.  
- قائمة بطاقات الالتزام (see component).  
- Floating FAB لإضافة.

### D — Obligation Detail
- Header: اسم الدائن + حالة.  
- Summary strip: principal | remaining | monthly | installments left.  
- Table: قائمة الأقساط (Installment Row). عند الضغط على صف يظهر modal لتسجيل دفعة (جزئية/كاملة) + اختيار وسيلة الدفع + ملاحظة.
- Actions: Edit plan, Export, Attach receipt, Delete.

### E — Payments / Ledger
- Timeline: تاريخ — جهة — مبلغ — طريقة — receipt icon.  
- Filter: month / year / creditor.  
- Undo last payment (snackbar) لمدة 6–10 ث.

### F — Analytics
- KPIs header: Paid this month | Overdue count | DTI% | On-time rate.
- Charts: bar (payments by month 12m), pie (distribution by type), line (savings).  
- Insights box (AI-ready): "لو سددت+X د.ك شهريًا، راح تنهي قرض Y خلال Z شهر".

### G — Settings
- Profile (name), Salary/day settings, Notifications schedule, Backup & Restore, Lock, Language (placeholder), Templates (manage).  

---

## 7 — User Flows مفصّلة (بالخطوات الدقيقة)
### Flow 1 — إضافة التزام (مثال: قسط بنك)
1. FAB → Add Obligation → اختر "قرض بنك".  
2. اختر الجهة من القائمة (مثلاً بنك برقان) أو كتابة اسم جديدة.  
3. أدخل: المبلغ الأصلي، عدد الأقساط أو مبلغ القسط، تاريخ البدء، يوم الاستحقاق (أو يوم الشهر).  
4. اختر إعداد الإشعارات (7/3/1/بعد).  
5. اضغط حفظ → النظام يولّد جدول الأقساط ويقتطع الحقول: next_due_date, monthly_amount, remaining_amount.  

### Flow 2 — تسجيل دفعة
1. من Home أو Detail اضغط "سجل دفعة".  
2. يفتح bottom sheet: اختر التزام / اختر القسط (أو أدخل مبلغ).  
3. اختر طريقة الدفع (نقد، تحويل، بطاقة)، حط ملاحظة، إرفاق إيصال (اختياري).  
4. حفظ → تحديث ledger وinstallment.paid_amount، تعديل remaining_amount، تحديث progress.  
5. عرض snackbar "تم حفظ الدفع" مع زر "تراجع" (6 ث).

### Flow 3 — استعادة نسخة
- Settings → Import → اختر ملف JSON مشفّر → يطلب كلمة المرور الخاصة بالتصدير → يعيد مزامنة الجداول.

---

## 8 — نموذج قاعدة البيانات (Schema) — SQL (مقترح)
> استخدم أنواع مناسبة (INTEGER, TEXT, REAL, DATETIME). هذه نسخة قابلة للنسخ.

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  salary REAL,
  payday_day INTEGER,
  settings_json TEXT
);

CREATE TABLE obligations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  type TEXT,
  creditor_name TEXT,
  principal_amount REAL,
  installment_amount REAL,
  interest_rate REAL,
  start_date TEXT,
  due_day INTEGER,
  installments_count INTEGER,
  installments_paid INTEGER DEFAULT 0,
  remaining_amount REAL,
  status TEXT,
  meta_json TEXT
);

CREATE TABLE installments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  obligation_id INTEGER,
  due_date TEXT,
  amount REAL,
  status TEXT,
  paid_amount REAL DEFAULT 0,
  paid_date TEXT
);

CREATE TABLE payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  obligation_id INTEGER,
  installment_id INTEGER,
  amount REAL,
  date TEXT,
  method TEXT,
  note TEXT,
  receipt_path TEXT
);

CREATE TABLE savings_goals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  target_amount REAL,
  saved_amount REAL DEFAULT 0,
  target_date TEXT,
  rule_json TEXT
);

CREATE TABLE notifications_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  obligation_id INTEGER,
  scheduled_date TEXT,
  fired_at TEXT,
  status TEXT
);
```

---

## 9 — إشعارات (Notifications) — القواعد والجدولة
- جدول أساسي: لكل قسط يُنشئ النظام إشعارات محلية: **7 أيام قبل**، **3 أيام قبل**، **1 يوم قبل**، **يوم الاستحقاق**. إن لم يُسجَّل دفع → تذكير **+2 يوم** و**+7 يوم**.  
- Snooze options: 24h / 48h / 72h.  
- عند فتح التطبيق في يوم الاستحقاق: إظهار Banner في أعلى الشاشة "سجل دفعتك الآن" مع زر مباشر لفتح modal الدفع.  
- ملاحظة Expo: الإشعارات المحلية تعمل في Expo Go؛ لكن Push (خادم) وAPNs يتطلبان بناء Development/Production أو استخدام EAS Build. ضع هذا في اعتبارك عند التخطيط للميزات المستقبلية.

---

## 10 — المقاييس التحليلية (Definitions & Formulas)
1. **DTI (Debt-to-Income %)** = (مجموع الأقساط المتوقعة خلال 30 يومًا) / (دخل شهري net) × 100
2. **On-time rate / معدل الالتزام** = (عدد الأقساط المسدّدة في أو قبل تاريخ الاستحقاق) / (إجمالي الأقساط المستحقة في الفترة) × 100
3. **Overdue rate** = عدد الأقساط المتأخرة / إجمالي الأقساط
4. **Average days late** = مجموع (today - due_date) لجميع الأقساط المتأخرة ÷ عدد الأقساط المتأخرة
5. **Savings progress** = saved_amount / target_amount × 100

استخدم هذه القيم لإظهار ألوان الحالة: أخضر (<25% DTI)، أصفر (25–40%)، أحمر (>40%).

---

## 11 — الأمان والخصوصية (practical)
- **بيانات محلية فقط**: صراحة في صفحة الخصوصية — "البيانات مخزنة على جهازك فقط ما لم تقم بتصديرها".  
- **SecureStore**: خزّن مفاتيح التشفير وبيانات حساسة في secure storage.  
- **تشفير التصدير**: عند تصدير JSON استخدم AES-256 مع passphrase من المستخدم.  
- **App Lock**: PIN + FaceID (Expo supports Local Authentication via expo-local-authentication).  
- **منع النسخ التلقائي للحسّاس**: لا تحفظ أرقام البطاقات أو أي بيانات مصرفية كاملة.

---

## 12 — خطة التنفيذ (Roadmap مقترح)
**Sprint 0 (1 أسبوع):** إعداد repo، React Native + Expo boilerplate، أدخال حزمة الخط Cairo، إعداد i18n، SQLite schema skeleton، basic navigation.  

**Sprint 1 (2 أسابيع):** Onboarding, Home dashboard, Obligations list, Add obligation wizard (بنسخة مبسطة)، local notifications basic scheduling (expo-notifications).  

**Sprint 2 (2 أسابيع):** Obligation detail, Installments table, Payment modal, Payments ledger, Export/Import encrypted JSON, App Lock.  

**Sprint 3 (1–2 أسابيع):** Analytics screen, charts (recharts أو victory-native), polishing UI, accessibility checks (RTL testing), TestFlight internal build.  

**Beta & Feedback (2 أسابيع):** جمع ملاحظات 10–30 مستخدمًا، إصلاحات سريعة، تحسينات أداء.  

---

## 13 — ملاحظات متعلقة بـ Expo Go وNotifications
- **Expo Go ممتاز للتطوير والاختبار السريع**، لكنه sandbox: لبعض الميزات (Push notifications الحقيقية، background fetch المتقدم) تحتاج EAS build أو dev build. خطط لذلك قبل إضافة Push.  
- استخدم `expo-notifications` للإشعارات المحلية؛ اختبارها عملي في Expo Go.  

---

## 14 — تصميم صور App Store / أمثلة مرجعية
- استلهم من تصميمات Tabby وTamara: واجهات نظيفة، مساحات بيضاء واسعة، ألوان براقة معتدلة للأزرار. حافظ على نصوص مختصرة وواضحة في لقطات الشاشة.  

---

## 15 — Deliverables (ما سأقدمه لك بعد هذه الوثيقة)
1. نسخة Markdown جاهزة (`Iltizamati_SPEC.md`) — هذا الملف.  
2. ملف `Design tokens` صغير (JSON) يحوي الألوان والخطوط والحجوم.  
3. مخطط User Flow مفصّل لكل سيناريو (flow by flow).  
4. SQL skeleton للـ schema أعلاه.

---

## 16 — قائمة الجهات الافتراضية (Templates ابتدائي)
- بنك الكويت الوطني (NBK)
- بنك برقان
- بنك الخليج
- بيت التمويل الكويتي (KFH)
- الملا للتمويل
- الأمانة للتمويل
- رساميل للتمويل
- X-cite
- Eureka
- Best Al-Yousifi

+ خيار "أخرى" ليدخل المستخدم اسم جهة يدوياً.

---

## 17 — نصائح أخيرة تنفيذية (No-BS)
1. ابدأ بأبسط سلوك: إضافة التزام → إنشاء جدول أقساط → تسجيل دفعة → تحديث المتبقي. كل شيء آخر ثانوي.  
2. اجعل الـDB قابلاً للهجرة من اليوم الأول (migrations).  
3. لا تقم بمزامنة سحابية حتى يجربك 100 مستخدم ويطلبوها.  
4. ركز على UX صغير واضح — المستخدم يريد معرفة "كم بقي من راتبي؟" خلال ثانيتين.  

---

### انتهت الوثيقة — (استخدمها كمرجع واحد)
لو عايز أجزّئها لملفات منفصلة (README.md, DesignTokens.json, DB-schema.sql, UserFlows.md, Wireframes.md)، أعمل ذلك فورًا وأرفعهم لك في نفس المساحة. قولي أي صيغة تفضل (Markdown منفصل أو ملف ZIP).