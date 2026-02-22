# إعداد CORS في الباكند (Laravel)

عند ظهور طلبات الـ API **فاشلة** في المتصفح مع رسالة "Failed to load response data"، السبب غالباً أن الباكند لا يسمح بطلبات من مصدر التطبيق (مثلاً `http://localhost:5173`).

## ما الذي يحدث؟

المتصفح يمنع قراءة استجابة الـ API لأن السيرفر لم يرسل هيدر:
`Access-Control-Allow-Origin: http://localhost:5173` (أو المصدر الذي تستخدمه).

## الحل في مشروع Laravel

### 1) إنشاء/تعديل ملف CORS

في مشروع الـ **Backend** (Laravel) على الجهاز `192.168.1.9`:

```bash
php artisan config:publish cors
```

ثم عدّل `config/cors.php` كالتالي:

```php
<?php

return [
    'paths' => ['api/*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [
        'http://localhost:5173',   // Vite dev server
        'http://127.0.0.1:5173',
        'http://localhost:3000',
        // أضف أي مصدر آخر تستخدمه (مثلاً عنوان الويب بعد النشر)
    ],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
```

- تأكد أن **المنفذ** في `allowed_origins` يطابق منفذ تطبيقك (مثلاً 5173 لـ Vite).
- إذا كان الفرونتند يعمل من عنوان IP بدل localhost، أضفه أيضاً، مثلاً: `http://192.168.1.x:5173`.

### 2) مسح الكاش (إن لزم)

بعد التعديل:

```bash
php artisan config:clear
php artisan cache:clear
```

### 3) التأكد من أن الـ CORS middleware مفعّل

في Laravel 11، الـ CORS يُدار عادة من `config/cors.php` دون إضافة middleware يدوياً. إن كنت تستخدم إصدار أقدم، تأكد من تفعيل `HandleCors` في الـ Kernel أو في `bootstrap/app.php` حسب إصدارك.

---

## التحقق

1. أعد تشغيل سيرفر Laravel بعد تعديل `config/cors.php`.
2. من المتصفح افتح التطبيق على `http://localhost:5173` وحدّث الصفحة.
3. في Network: طلبات `featured` و `recent?limit=5` يجب أن تظهر **Status 200** وتبين Response البيانات بدل "Failed to load response data".

إذا استمر الفشل، راجع تبويب **Console** وابحث عن رسالة تحتوي على "CORS" أو "Access-Control-Allow-Origin" لمعرفة الهيدر الناقص.
