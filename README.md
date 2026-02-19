# صندوق رعاية الطالب الجامعي – الويب

موقع ويب لمشروع صندوق رعاية الطالب الجامعي (Student Welfare Fund)، يعمل مع نفس الـ Backend (Laravel API) الموثّق في `PROJECT_AND_API_REFERENCE.md`.

## ما الذي يوفره الملف المرجعي؟

الملف **`PROJECT_AND_API_REFERENCE.md`** يغطي تقريباً كل ما تحتاجه للويب:

- نظرة عامة على المشروع والـ Backend
- عناوين الـ API (Auth، الحملات، التبرعات، الدفع، الشركاء، الأخبار، البانرات، تسجيل الطلاب، الصفحات الثابتة)
- تفاصيل الـ Request/Response واقتراحات لاستخدام الـ API من الويب

ما قد لا يكون مذكوراً بالتفصيل: واجهات/أسكرينات جاهزة، وقواعد التحقق (validation) حقل بحقل.

## التصميم

- **احترافي عصري**: نظام ألوان وتيبوغرافي موحّد (CSS variables)، مكوّنات قابلة لإعادة الاستخدام.
- **دعم العربية والإنجليزية مع RTL و LTR**: استخدام `react-i18next` وتبديل اللغة من الهيدر؛ يتم تعيين `dir` و`lang` على `<html>` تلقائياً.
- **متجاوب**: استخدام وحدات مرنة (`clamp`، `min()`) و breakpoints للجوال والتابلت والديسكتوب.

## التشغيل

```bash
npm install
npm run dev
```

لتشغيل الـ API محلياً، أنشئ ملف `.env`:

```
VITE_API_URL=https://welfare-student.maksab.om
```

أو عنوان الـ Backend المحلي إن وُجد.

## الهيكل

- `src/i18n/` – إعداد اللغة والترجمات (ar, en)
- `src/styles/` – متغيرات التصميم والأنماط العامة (RTL-safe)
- `src/components/ui/` – مكوّنات واجهة قابلة لإعادة الاستخدام (Button, Container, Card)
- `src/components/layout/` – Header, Footer, PageLayout
- `src/pages/` – الصفحات (Home, Campaigns, Donate, Login, Register, News, Partners, About)
- `src/config/api.ts` – عنوان الـ API ودالة `resolveImageUrl`

## دفع Thawani

التكامل مع الدفع موثّق في **`THAWANI_PAYMENT_INTEGRATION.md`**. الويب يرسل `return_origin` (أصل الموقع)؛ يُفضّل أن يوجّه الباكند بعد الدفع إلى:

`{return_origin}/donate/return?session_id=...&status=success`

(أو `status=cancel` للإلغاء). صفحة `/donate/return` تستدعي `POST /payments/confirm` ثم تعرض شكراً أو إلغاء.

## الروابط

- الرئيسية، الحملات، التبرع، الأخبار، الشركاء، من نحن، تسجيل الدخول، إنشاء حساب، الملف الشخصي، تبرعاتي، العودة من الدفع: `/donate/return`.
