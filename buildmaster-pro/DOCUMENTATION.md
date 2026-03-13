# BuildMaster Pro - توثيق البرنامج الشامل

## ملخص عام

**BuildMaster Pro** هو نظام متكامل لإدارة مشاريع البناء والتشييد، يوفر مجموعة شاملة من الأدوات لإدارة:
- المشاريع والعقود
- المقاولين والموردين
- المصاريف والفواتير
- المبيعات والوحدات العقارية
- الوثائق الهندسية
- التقارير والقرارات

---

## القسم الأول: هيكل المشروع

### 1.1 المجلدات الرئيسية

```
buildmaster-pro/
├── src/
│   ├── components/          # المكونات القابلة لإعادة الاستخدام
│   │   ├── documents/      # مكونات تصدير الوثائق
│   │   ├── forms/          # نماذج إدخال البيانات
│   │   ├── layout/         # مكونات التخطيط
│   │   └── shared/         # مكونات مشتركة
│   ├── contexts/           # سياقات React
│   ├── lib/                # مكتبات وإعدادات
│   ├── pages/              # صفحات التطبيق
│   ├── utils/              # أدوات مساعدة
│   ├── App.jsx             # المكون الرئيسي
│   └── main.jsx            # نقطة الدخول
├── supabase/
│   └── schema.sql          # هيكل قاعدة البيانات
└── package.json            # تبعيات المشروع
```

### 1.2 التقنيات المستخدمة

| التقنية | الإصدار | الاستخدام |
|---------|---------|----------|
| React | 19.2.0 | إطار العمل |
| React Router | 7.13.1 | التوجيه |
| Supabase | 2.99.1 | قاعدة البيانات والمصادقة |
| Tailwind CSS | 4.2.1 | التصميم |
| Vite | 7.3.1 | البناء |
| Recharts | 3.8.0 | الرسوم البيانية |
| pdfmake | 0.3.6 | توليد PDF |
| exceljs | 4.4.0 | توليد Excel |
| docx | 9.6.0 | توليد Word |
| qrcode | 1.5.4 | توليد QR |

---

## القسم الثاني: قاعدة البيانات (Backend)

### 2.1 هيكل الجداول

#### جدول company_info - معلومات الشركة
```sql
- id: UUID (مفتاح أساسي)
- name: TEXT (اسم الشركة)
- owner: TEXT (المالك)
- phone: TEXT (الهاتف)
- email: TEXT (البريد الإلكتروني)
- address: TEXT (العنوان)
- logo: TEXT (شعار الشركة)
- tax_number: TEXT (الرقم الضريبي)
- commercial_record: TEXT (السجل التجاري)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### جدول projects - المشاريع
```sql
- id: UUID (مفتاح أساسي)
- name: TEXT (اسم المشروع) - مطلوب
- location: TEXT (الموقع)
- client_name: TEXT (اسم العميل)
- client_phone: TEXT (هاتف العميل)
- client_email: TEXT (بريد العميل)
- start_date: DATE (تاريخ البدء)
- end_date: DATE (تاريخ الانتهاء)
- status: TEXT (الحالة) - افتراضي: "قيد التنفيذ"
- budget: NUMERIC (الميزانية)
- paid_amount: NUMERIC (المبلغ المدفوع)
- description: TEXT (الوصف)
- notes: TEXT (ملاحظات)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### جدول contractors - المقاولون
```sql
- id: UUID (مفتاح أساسي)
- name: TEXT (الاسم) - مطلوب
- type: TEXT (النوع) - افتراضي: "مقاول"
- specialty: TEXT (الاختصاص)
- phone: TEXT (الهاتف)
- email: TEXT (البريد الإلكتروني)
- address: TEXT (العنوان)
- contract_start_date: DATE
- contract_end_date: DATE
- agreed_amount_usd: NUMERIC (المبلغ المتفق عليه دولار)
- agreed_amount_syp: NUMERIC (المبلغ المتفق عليه Lira)
- notes: TEXT (ملاحظات)
- rating: NUMERIC (التقييم)
- payments: JSONB (الدفعات)
- created_at: TIMESTAMP
```

#### جدول expenses - المصاريف
```sql
- id: UUID (مفتاح أساسي)
- project_id: UUID (مرجع للمشروع)
- contractor_id: UUID (مرجع للمقاول)
- category: TEXT (الفئة)
- description: TEXT (الوصف)
- amount: NUMERIC (المبلغ)
- date: DATE (التاريخ)
- receipt: TEXT (الإيصال)
- notes: TEXT (ملاحظات)
- created_at: TIMESTAMP
```

#### جدول invoices - الفواتير
```sql
- id: UUID (مفتاح أساسي)
- invoice_number: TEXT (رقم الفاتورة)
- project_id: UUID (مرجع للمشروع)
- contractor_id: UUID (مرجع للمقاول)
- client_name: TEXT (اسم العميل)
- client_email: TEXT (بريد العميل)
- client_phone: TEXT (هاتف العميل)
- client_address: TEXT (عنوان العميل)
- items: JSONB (البنود)
- subtotal_usd: NUMERIC (المجموع دولار)
- subtotal_syp: NUMERIC (المجموع Lira)
- tax_rate: NUMERIC (نسبة الضريبة) - افتراضي: 15%
- tax_amount_usd: NUMERIC (مبلغ الضريبة دولار)
- tax_amount_syp: NUMERIC (مبلغ الضريبة Lira)
- total_usd: NUMERIC (الإجمالي دولار)
- total_syp: NUMERIC (الإجمالي Lira)
- status: TEXT (الحالة) - افتراضي: "مفتوح"
- issue_date: DATE (تاريخ الإصدار)
- due_date: DATE (تاريخ الاستحقاق)
- payment_terms: TEXT (شروط الدفع)
- notes: TEXT (ملاحظات)
- paid_at: TIMESTAMP (تاريخ الدفع)
```

#### جدول drawings - الرسومات الهندسية
```sql
- id: UUID (مفتاح أساسي)
- drawing_number: TEXT (رقم الرسم)
- project_id: UUID (مرجع للمشروع)
- name: TEXT (الاسم)
- type: TEXT (النوع)
- related_reports: TEXT[] (التقارير المرتبطة)
- related_decisions: TEXT[] (القرارات المرتبطة)
- file: TEXT (الملف)
- file_name: TEXT (اسم الملف)
- notes: TEXT (ملاحظات)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### جدول reports - التقارير الهندسية
```sql
- id: UUID (مفتاح أساسي)
- report_number: TEXT (رقم التقرير)
- project_id: UUID (مرجع للمشروع)
- subject: TEXT (الموضوع)
- date: DATE (التاريخ)
- engineer: TEXT (المهندس)
- description: TEXT (الوصف)
- notes: TEXT (ملاحظات)
- recommendations: TEXT (التوصيات)
- attachments: JSONB (المرفقات)
- related_drawings: TEXT[] (الرسومات المرتبطة)
- related_decisions: TEXT[] (القرارات المرتبطة)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### جدول decisions - القرارات
```sql
- id: UUID (مفتاح أساسي)
- decision_number: TEXT (رقم القرار)
- project_id: UUID (مرجع للمشروع)
- subject: TEXT (الموضوع)
- date: DATE (التاريخ)
- responsible_party: TEXT (الجهة المسؤولة)
- description: TEXT (الوصف)
- decision: TEXT (القرار)
- status: TEXT (الحالة) - افتراضي: "معلق"
- due_date: DATE (تاريخ الاستحقاق)
- notes: TEXT (ملاحظات)
- attachments: JSONB (المرفقات)
- related_drawings: TEXT[] (الرسومات المرتبطة)
- related_reports: TEXT[] (التقارير المرتبطة)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### جدول units - الوحدات العقارية
```sql
- id: UUID (مفتاح أساسي)
- unit_number: TEXT (رقم الوحدة)
- type: TEXT (النوع) - افتراضي: "apartment"
- project_id: UUID (مرجع للمشروع)
- floor: TEXT (الطابق)
- area: NUMERIC (المساحة)
- rooms: NUMERIC (الغرف)
- bathrooms: NUMERIC (الحمامات)
- price_usd: NUMERIC (السعر دولار)
- price_syp: NUMERIC (السعر Lira)
- status: TEXT (الحالة) - افتراضي: "available"
- buyer_id: TEXT (معرف المشتري)
- description: TEXT (الوصف)
- notes: TEXT (ملاحظات)
- created_at: TIMESTAMP
```

#### جدول leads - العملاء المحتملين
```sql
- id: UUID (مفتاح أساسي)
- full_name: TEXT (الاسم الكامل)
- phone: TEXT (الهاتف)
- national_id: TEXT (رقم الهوية)
- id_issue_date: DATE (تاريخ إصدار الهوية)
- email: TEXT (البريد الإلكتروني)
- project_id: TEXT (معرف المشروع)
- unit_id: TEXT (معرف الوحدة)
- stage: TEXT (المرحلة) - افتراضي: "interested"
- budget: NUMERIC (الميزانية)
- notes: TEXT (ملاحظات)
- contact_date: DATE (تاريخ التواصل)
- created_at: TIMESTAMP
```

#### جدول contracts - العقود
```sql
- id: UUID (مفتاح أساسي)
- contract_number: TEXT (رقم العقد)
- date: DATE (التاريخ)
- seller_name: TEXT (اسم البائع)
- seller_license: TEXT (رخصة البائع)
- buyer_id: TEXT (معرف المشتري)
- buyer_name: TEXT (اسم المشتري)
- buyer_national_id: TEXT (رقم هوية المشتري)
- buyer_id_issue_date: DATE (تاريخ إصدار هوية المشتري)
- unit_id: TEXT (معرف الوحدة)
- property_number: TEXT (رقم العقار)
- region: TEXT (المنطقة)
- unit_description: TEXT (وصف الوحدة)
- area: NUMERIC (المساحة)
- floor: TEXT (الطابق)
- total_usd: NUMERIC (الإجمالي دولار)
- price_per_meter: NUMERIC (السعر للمتر)
- total_syp: NUMERIC (الإجمالي Lira)
- remaining_syp: NUMERIC (المتبقي Lira)
- witness1: TEXT (الشاهد الأول)
- witness2: TEXT (الشاهد الثاني)
- notes: TEXT (ملاحظات)
- created_at: TIMESTAMP
```

#### جدول settings - الإعدادات
```sql
- id: UUID (مفتاح أساسي)
- currency: TEXT (العملة) - افتراضي: "SAR"
- currency_symbol: TEXT (رمز العملة) - افتراضي: "ر.س"
- tax_rate: NUMERIC (نسبة الضريبة) - افتراضي: 15%
- date_format: TEXT (تنسيق التاريخ) - افتراضي: "DD/MM/YYYY"
- language: TEXT (اللغة) - افتراضي: "ar"
- theme: TEXT (السمة) - افتراضي: "dark"
- exchange_rate_usd: NUMERIC (سعر الصرف دولار) - افتراضي: 13000
- created_at: TIMESTAMP
```

### 2.2 سياسات الأمان (RLS)

جميع الجداول تحتوي على سياسات Row Level Security تسمح بالوصول الكامل:
```sql
CREATE POLICY "Enable all access" ON public.table_name FOR ALL USING (true) WITH CHECK (true);
```

> ⚠️ **تحذير**: هذه السياسات مخصصة للتجربة. في الإنتاج، يجب تخصيصها حسب دور المستخدم.

### 2.3 طبقة البيانات (database.js)

الملف `src/lib/database.js` يوفر واجهة برمجية للوصول للبيانات:

```javascript
// المشاريع
db.projects.getAll()        // جلب جميع المشاريع
db.projects.getById(id)    // جلب مشروع واحد
db.projects.create(data)   // إنشاء مشروع
db.projects.update(id, data) // تحديث مشروع
db.projects.delete(id)     // حذف مشروع

// المصاريف
db.expenses.getAll()       // جلب جميع المصاريف
db.expenses.getByProject(projectId) // جلب مصاريف مشروع
db.expenses.create(data)   // إنشاء مصروف
db.expenses.update(id, data)
db.expenses.delete(id)

// الفواتير
db.invoices.getAll()
db.invoices.getByProject(projectId)
db.invoices.create(data)
db.invoices.update(id, data)
db.invoices.delete(id)

// المقاولون
db.contractors.getAll()
db.contractors.getById(id)
db.contractors.create(data)
db.contractors.update(id, data)
db.contractors.delete(id)

// ... وهكذا لكل جدول
```

---

## القسم الثالث: التخزين (Storage)

### 3.1 تخزين Supabase

التطبيق يستخدم Supabase Storage لتخزين الملفات:

```javascript
// رفع ملف
const url = await db.files.upload(file, 'documents');

// حذف ملف
await db.files.delete(filePath);
```

### 3.2 حاوية الملفات

- **اسم الحاوية**: `files`
- **الوصول**: عام (للقراءة والإضافة والتحديث والحذف)

### 3.3 أنواع الملفات المدعومة

- صور (JPG, PNG, GIF)
- مستندات (PDF, DOC, DOCX)
- ملفات CAD
- أي نوع آخر

---

## القسم الرابع: المصادقة (Authentication)

### 4.1 نظام المصادقة

الموقع يستخدم نظام مصادقة مخصص مبني على localStorage:

```javascript
// ملف: src/contexts/AuthContext.jsx
```

#### المستخدم الافتراضي

```javascript
{
  id: '1',
  username: 'admin',
  password: 'admin123',
  name: 'مدير النظام',
  role: 'admin',
  email: 'admin@buildmaster.com'
}
```

### 4.2 الصلاحيات

| الدور | الصلاحيات |
|-------|----------|
| admin | جميع الصلاحيات |
| manager | projects, expenses, invoices, contractors, sales, reports |
| user | projects, expenses, invoices |
| viewer | reports فقط |

### 4.3 دوال المصادقة

```javascript
// تسجيل الدخول
const result = login(username, password)
//returns: { success: true, user: userObject } or { success: false, error: message }

// تسجيل الخروج
logout()

// تسجيل مستخدم جديد
register(userData)
// userData: { username, password, name, email, role }

// تحديث بيانات مستخدم
updateUser(userId, updates)

// حذف مستخدم
deleteUser(userId)

// جلب جميع المستخدمين
getAllUsers()

// التحقق من صلاحية
hasPermission(permission)
```

### 4.4 حماية المسارات

```javascript
// المسار المحمي
<ProtectedRoute>
  <Layout />
</ProtectedRoute>

// مسار تسجيل الدخول
<AuthRoute>
  <Login />
</AuthRoute>
```

---

## القسم الخامس: إدارة المستخدمين

### 5.1 هيكل المستخدم

```javascript
{
  id: string,           // معرف فريد
  username: string,     // اسم المستخدم
  password: string,     // كلمة المرور (مشفرة في localStorage)
  name: string,         // الاسم الحقيقي
  role: string,         // الدور (admin, manager, user, viewer)
  email: string,        // البريد الإلكتروني
  createdAt: string     // تاريخ الإنشاء
}
```

### 5.2 مستخدم افتراضي

عند第一次 التشغيل، يتم إنشاء مستخدم افتراضي:
- **اسم المستخدم**: admin
- **كلمة المرور**: admin123
- **الدور**: admin

---

## القسم السادس: الواجهة الأمامية (Frontend)

### 6.1 الصفحات الرئيسية

| المسار | الصفحة | الوصف |
|--------|--------|-------|
| `/` | Setup | إعداد الشركة (إذا لم يتم الإعداد) |
| `/login` | Login | صفحة تسجيل الدخول |
| `/home` | Home | لوحة التحكم |
| `/projects` | Projects | إدارة المشاريع |
| `/projects/:id` | ProjectDetail | تفاصيل المشروع |
| `/engineering` | EngineeringDocs | الوثائق الهندسية |
| `/expenses` | Expenses | المصاريف |
| `/invoices` | Invoices | الفواتير |
| `/contractors` | Contractors | المقاولون |
| `/sales` | Sales | المبيعات والعقود |
| `/settings` | Settings | الإعدادات |

### 6.2 المكونات

#### المكونات المشتركة (Shared Components)
- **Modal**: نافذة منبثقة
- **Toast**: إشعارات
- **DatePicker**: منتقي التاريخ
- **LocationPicker**: منتقي الموقع
- **ConfirmDialog**: تأكيد الإجراءات
- **Charts**: رسوم بيانية
- **Skeleton**: تحميل

#### النماذج (Forms)
- **ProjectForm**: نموذج المشروع
- **ContractorForm**: نموذج المقاول
- **ExpenseForm**: نموذج المصروف
- **InvoiceForm**: نموذج الفاتورة
- **DecisionForm**: نموذج القرار
- **EngineeringReportForm**: نموذج التقرير الهندسي

#### التخطيط (Layout)
- **Layout**: التخطيط الرئيسي
- **Header**: الرأس
- **Sidebar**: الشريط الجانبي

### 6.3 الأدوات المساعدة (Utils)

```javascript
// التخزين
storage.js           // إدارة localStorage
storageSupabase.js   // إدارة Supabase

// التاريخ
dateUtils.js         // أدوات التاريخ

// التحقق
validation.js        // التحقق من البيانات

// التصدير
exportExcel.js       // تصدير Excel
exportWord.js        // تصدير Word
PDFService.js        // خدمات PDF
exportUtils.js       // أدوات التصدير
downloadUtils.js     // تحميل الملفات

// QR Code
generateQR.js        // توليد QR

// الصور
imageStorage.js      // تخزين الصور
```

---

## القسم السابع: الإشعارات

### 7.1 نظام الإشعارات

التطبيق يستخدم نظام Toast للإشعارات:

```javascript
// ملف: src/components/shared/Toast.jsx
```

#### أنواع الإشعارات

| النوع | الاستخدام |
|-------|----------|
| success | نجاح العمليات |
| error | أخطاء |
| warning | تحذيرات |
| info | معلومات |

### 7.2 استخدام الإشعارات

```javascript
import { useToast } from './components/shared/Toast';

const { showToast } = useToast();

showToast('تم حفظ البيانات بنجاح', 'success');
showToast('حدث خطأ', 'error');
```

---

## القسم الثامن: نظام المبيعات

### 8.1 مراحل العميل المحتمل (Leads)

```
interested → contacted → qualified → proposal → negotiation → won/lost
```

### 8.2 حالات الوحدة العقارية

```
available → reserved → sold
```

### 8.3 الوحدات العقارية

كل وحدة تحتوي على:
- رقم الوحدة
- النوع (شقة، فيلا، محل...)
- الطابق
- المساحة
- عدد الغرف والحمامات
- السعر (دولار وليرة)
- الحالة

### 8.4 العقود

نظام عقود متكامل يشمل:
- بيانات البائع والمشتري
- معلومات الوحدة
- الأسعار والتفاصيل
- الشهود
- التواريخ

---

## القسم التاسع: الفواتير والمصاريف

### 9.1 الفواتير

- رقم الفاتورة
- بيانات العميل
- البنود (اسم، كمية، سعر، إجمالي)
- الضريبة (قابلة للتعديل)
- الإجمالي (دولار وليرة)
- الحالة (مفتوح، مدفوع، ملغى)
- تواريخ الإصدار والاستحقاق

### 9.2 المصاريف

- الفئة (مواد، عمالة، معدات،...)
- المشروع المرتبط
- المقاول المرتبط
- المبلغ
- التاريخ
- رقم الإيصال

---

## القسم العاشر: الوثائق الهندسية

### 10.1 الرسومات

- رقم الرسم
- اسم المشروع
- النوع
- الملف
- ربط مع القرارات والتقارير

### 10.2 التقارير

- رقم التقرير
- التاريخ
- الموضوع
- المهندس المسؤول
- التوصيات
- المرفقات

### 10.3 القرارات

- رقم القرار
- التاريخ
- الموضوع
-الجهة المسؤولة
- نص القرار
- الحالة (معلق، منجز، ملغى)
- تاريخ الاستحقاق

---

## القسم الحادي عشر: الإعدادات

### 11.1 إعدادات النظام

```javascript
{
  currency: 'SAR',              // العملة
  currency_symbol: 'ر.س',        // رمز العملة
  tax_rate: 15,                 // نسبة الضريبة %
  date_format: 'DD/MMYYYY',    // تنسيق التاريخ
  language: 'ar',               // اللغة
  theme: 'dark',                // السمة
  exchange_rate_usd: 13000     // سعر الصرف دولار
}
```

### 11.2 معلومات الشركة

- اسم الشركة
- اسم المالك
- الهاتف
- البريد الإلكتروني
- العنوان
- الشعار
- الرقم الضريبي
- السجل التجاري

---

## القسم الثاني عشر: التصدير

### 12.1_supported Formats

| التنسيق | المكتبة | الاستخدام |
|---------|---------|----------|
| PDF | pdfmake | تقارير، فواتير |
| Excel | exceljs | جداول البيانات |
| Word | docx | عقود، وثائق |

### 12.2 دوال التصدير

```javascript
// PDF
import PDFService from './utils/PDFService';

PDFService.generateInvoicePDF(data, company, { download: true });
PDFService.generateExpensesPDF(data, company, { download: true });
PDFService.generateContractPDF(data, company, { download: true });
PDFService.generateDecisionPDF(data, company, { download: true });
PDFService.generateReportPDF(data, company, { download: true });
PDFService.generateLeadPDF(data, company, { download: true });
PDFService.generateProjectPDF(data, company, { download: true });

// Excel
import exportExcel from './utils/exportExcel';

exportExcel.exportExpensesToExcel(expenses, projects, contractors);
exportExcel.exportInvoicesToExcel(invoices, projects);
exportExcel.exportLeadsToExcel(leads, projects, units);
exportExcel.exportProjectsToExcel(projects);
exportExcel.exportContractorsToExcel(contractors);
exportExcel.exportUnitsToExcel(units, projects);
exportExcel.exportContractsToExcel(contracts, units, projects);

// Word
import exportWord from './utils/exportWord';

exportWord.exportToWord(data, filename, docType);
```

### 12.3 أدوات التصدير

```javascript
import { formatDate, formatNumber, formatCurrency, formatDateShort, getExchangeRate, toSYP } from './utils/exportUtils';
```

### 12.2 QR Code

توليد QR Codes للوثائق باستخدام `qrcode.react`

---

## القسم الثالث عشر: التكامل

### 13.1 Supabase

```javascript
// ملف: src/lib/supabase.js
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

### 13.2 البيئة

إنشاء ملف `.env`:
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## القسم الرابع عشر: التنصيب والتشغيل

### 14.1 المتطلبات

- Node.js 18+
- npm أو yarn

### 14.2 التثبيت

```bash
cd buildmaster-pro
npm install
```

### 14.3 التشغيل

```bash
# تطوير
npm run dev

# بناء
npm run build

# معاينة
npm run preview
```

### 14.4 إعداد Supabase

1. إنشاء مشروع جديد في Supabase
2. تشغيل ملف `supabase/schema.sql` في SQL Editor
3. نسخ URL و Anonymous Key إلى ملف .env

---

## القسم الخامس عشر: هيكل API

### 15.1 نقاط الوصول

لا يوجد Backend منفصل. التطبيق يستخدم:
- **Supabase Client** للوصول المباشر لقاعدة البيانات
- **localStorage** للتخزين المحلي (بديل بدون Supabase)

### 15.2 Database Functions

جميع العمليات تمر من خلال `db` object في `database.js`:

```javascript
// إنشاء
await db.table.create(data)

// قراءة
await db.table.getAll()
await db.table.getById(id)
await db.table.getByProject(projectId)

// تحديث
await db.table.update(id, data)

// حذف
await db.table.delete(id)
```

---

## الملاحق

### أ. مفاتيح التخزين

```javascript
STORAGE_KEYS = {
  COMPANY_INFO: 'company_info',
  PROJECTS: 'projects',
  DRAWINGS: 'drawings',
  REPORTS: 'reports',
  DECISIONS: 'decisions',
  EXPENSES: 'expenses',
  INVOICES: 'invoices',
  CONTRACTORS: 'contractors',
  UNITS: 'units',
  LEADS: 'leads',
  CONTRACTS: 'contracts',
  SETTINGS: 'settings',
};
```

### ب. قوالب الألوان (Dark Theme)

```css
--bg-primary: #0f172a    /* خلفية رئيسية */
--bg-secondary: #1e293b /* خلفية ثانوية */
--bg-tertiary: #334155  /* خلفية ثالثة */
--text-primary: #f1f5f9 /* نص رئيسي */
--text-secondary: #94a3b8 /* نص ثانوي */
--border: #475569       /* حدود */
--accent: #3b82f6       /* تمييز */
--success: #22c55e      /* نجاح */
--error: #ef4444        /* خطأ */
--warning: #f59e0b      /* تحذير */
```

### ج. التراخيص

- React: MIT
- Supabase: Apache 2.0
- Tailwind CSS: MIT
- Vite: MIT

---

## الخريطة التنظيمية للتطبيق

```
┌─────────────────────────────────────────────────────────┐
│                    App.jsx (Root)                       │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐    │
│  │           AuthProvider (المصادقة)               │    │
│  ├─────────────────────────────────────────────────┤    │
│  │  ┌─────────────────────────────────────────┐   │    │
│  │  │      ToastProvider (الإشعارات)          │   │    │
│  │  ├─────────────────────────────────────────┤   │    │
│  │  │   ┌─────────────────────────────────┐  │   │    │
│  │  │   │      BrowserRouter               │  │   │    │
│  │  │   ├─────────────────────────────────┤  │   │    │
│  │  │   │   Routes                         │  │   │    │
│  │  │   │   ├── Login                      │  │   │    │
│  │  │   │   ├── Setup                      │  │   │    │
│  │  │   │   └── Protected Routes           │  │   │    │
│  │  │   │       └── Layout                  │  │   │    │
│  │  │   │           ├── Sidebar             │  │   │    │
│  │  │   │           ├── Header              │  │   │    │
│  │  │   │           └── Pages               │  │   │    │
│  │  │   │               ├── Home            │  │   │    │
│  │  │   │               ├── Projects        │  │   │    │
│  │  │   │               ├── ProjectDetail   │  │   │    │
│  │  │   │               ├── EngineeringDocs │  │   │    │
│  │  │   │               ├── Expenses        │  │   │    │
│  │  │   │               ├── Invoices        │  │   │    │
│  │  │   │               ├── Contractors     │  │   │    │
│  │  │   │               ├── Sales           │  │   │    │
│  │  │   │               └── Settings        │  │   │    │
│  │  │   └─────────────────────────────────┘  │   │    │
│  │  └─────────────────────────────────────────┘   │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘

                    ┌─────────────────┐
                    │   Supabase      │
                    │   (Backend)     │
                    ├─────────────────┤
                    │ • Database      │
                    │ • Auth          │
                    │ • Storage       │
                    │ • Row Level     │
                    │   Security      │
                    └─────────────────┘

┌─────────────────────────────────────────────────────────┐
│              قاعدة البيانات (Tables)                    │
├──────────┬──────────┬──────────┬──────────┬───────────┤
│ company_ │ projects │contractors│ expenses │ invoices  │
│ info     │          │          │          │           │
├──────────┼──────────┼──────────┼──────────┼───────────┤
│ drawings │ reports  │ decisions│  units   │   leads   │
│          │          │          │          │           │
├──────────┼──────────┼──────────┼──────────┼───────────┤
│ contracts│ settings │          │          │           │
└──────────┴──────────┴──────────┴──────────┴───────────┘
```

---

**تاريخ التوثيق**: 2026
**إصدار البرنامج**: 1.0.0
**آخر تحديث**: March 2026
