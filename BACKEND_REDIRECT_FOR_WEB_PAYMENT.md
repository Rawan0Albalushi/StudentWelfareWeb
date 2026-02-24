# إعادة التوجيه بعد الدفع للويب / Backend Redirect for Web Payment

**تم تنفيذ التعديلات في الباكند.** الواجهة الأمامية تدعم صفحة واحدة `/payments/success` مع `result=success` أو `result=cancel`.

---

## المشكلة / Problem

بعد إتمام الدفع بنجاح، المستخدم يُوجّه إلى:
`/api/v1/payments/mobile/success?donation_id=...`

والباكند يرجّع **JSON** في المتصفح، فيظهر للمستخدم صفحة JSON خام بدل صفحة "تم التبرع بنجاح" في الويب.

---

After successful payment, the user is redirected to the backend success URL, but the backend **returns JSON**. The user then sees raw JSON in the browser instead of the web app’s success page.

---

## المطلوب من الباكند / Required Backend Change

لطلبات **الويب** (متصفح)، عند وجود `return_origin` محفوظ مع الجلسة/التبرع:

- **لا تُرجع JSON** من:
  - `GET /api/v1/payments/success`
  - `GET /api/v1/payments/mobile/success`
- **أرجع إعادة توجيه HTTP 302** إلى موقع الويب:

**Success (نجاح):**

```
HTTP 302 Location: {return_origin}/payments/success?donation_id={donation_id}&session_id={session_id}&result=success
```

**Cancel (إلغاء):**

```
HTTP 302 Location: {return_origin}/payments/success?result=cancel
```

`return_origin` = أصل موقع الويب الذي أُرسل عند إنشاء التبرع/الجلسة (مثلاً `http://localhost:5173` أو `https://your-site.com`).

---

For **web** (browser) requests, when a `return_origin` was stored with the session/donation:

- **Do not return JSON** from the success/cancel endpoints.
- **Return HTTP 302 Redirect** to the web app:

**Success:**  
`{return_origin}/payments/success?donation_id={donation_id}&session_id={session_id}&result=success`

**Cancel:**  
`{return_origin}/payments/success?result=cancel`

---

## تمييز الويب عن الموبايل / Detecting Web vs Mobile

- إذا كان الطلب قادمًا من **متصفح** (بعد إعادة توجيه من Thawani)، استخدم `return_origin` وارسِل **302**.
- إذا كان الطلب من **تطبيق موبايل** ولا يوجد `return_origin`، يمكن إرجاع JSON كما هو الآن.

مثال (Laravel): التحقق من وجود `return_origin` في الجلسة أو في سجل الدفع؛ إن وُجد فاستخدم `redirect()->away($return_origin . '/payments/success?...')` بدل `response()->json(...)`.

---

## إذا استمر الباكند بإرجاع JSON / If Backend Still Returns JSON

إذا كان الرابط يحتوي على `origin` (مثلاً `...&origin=http://localhost:5173`) والمتصفح ما زال يعرض JSON:

1. **قراءة `origin` من الـ query:** التأكد من أن الـ handler يقرأ معامل `origin` من **رابط الطلب** (مثلاً `$request->query('origin')`) وليس فقط من الجلسة.
2. **القائمة البيضاء:** التأكد من أن `http://localhost:5173` و `http://127.0.0.1:5173` مسموحان في القائمة البيضاء، وإلا يُرفض الأصل ويُعاد JSON.
3. **عدم الوصول لـ JSON بعد التوجيه:** التأكد من أن كود التوجيه 302 يُنفَّذ ويُرجع من الدالة **قبل** أي `return response()->json(...)`. لو كان هناك مسار واحد يرجع JSON في النهاية، سيظهر للمتصفح.
4. **التحقق من الاستجابة:** في تبويب Network في أدوات المطور، الطلب إلى `mobile/success` يجب أن يكون **Status: 302** و **Response Headers** تحتوي على `Location: http://localhost:5173/payments/success?...`. إذا كان Status **200** فالباكند لا يرسل توجيه.

**بديل إذا تعذّر استخدام 302:** إرجاع **HTML** بدل JSON عندما يوجد `origin`، مع إعادة توجيه من جانب العميل:

```html
<!DOCTYPE html>
<html><head>
  <meta http-equiv="refresh" content="0;url=http://localhost:5173/payments/success?donation_id=DN_xxx&session_id=xxx&result=success">
</head><body>جاري التحويل...</body></html>
```

يُبنى الـ URL من معامل `origin` + المسار + معاملات `donation_id` و `session_id` و `result=success`. بهذا ينتقل المستخدم لصفحة الويب حتى لو كان الـ response 200.

---

## مراجع / References

- `THAWANI_PAYMENT_INTEGRATION.md` — قسم "Success and cancel URLs"
- `API_DOCUMENTATION.md` — قسم "Payments (Thawani)"
