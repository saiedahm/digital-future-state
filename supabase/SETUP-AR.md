# إعداد DIGITAL FUTURE STATE — خطوات التشغيل

هذه التعليمات خاصة بمشروع Supabase الجديد المخصص لـ DIGITAL FUTURE STATE، وليست مشروع NEXORA.

1. افتح مشروع Supabase الصحيح.
2. افتح SQL Editor.
3. افتح ملف `supabase/migrations/20261009000000_initial_schema.sql` من GitHub وانسخ محتواه إلى محرر SQL.
4. راجع اسم المشروع قبل التنفيذ، ثم نفّذ SQL وتأكد من عدم وجود أخطاء.
5. في إعدادات Authentication فعّل تأكيد البريد الإلكتروني، واضبط Site URL وروابط إعادة التوجيه لنطاق الإنتاج ومعاينة Vercel.
6. في Vercel، ضمن مشروع DIGITAL FUTURE STATE فقط، أضف متغيرات الخادم المطلوبة في `docs/VERCEL-ENVIRONMENT.md`.
7. في `supabase/config.js` ضع رابط المشروع ومفتاحه العام Publishable Key فقط. لا تضع مفتاح Secret أو Service Role في ملف عام.
8. أعد النشر، ثم اختبر حسابين مختلفين للتأكد من عدم تمكن أحدهما من رؤية بيانات الآخر.
9. طبّق أيضًا `supabase/migrations/20261010020000_stripe_webhook_idempotency.sql` لإنشاء سجل منع تكرار إشعارات Stripe.
10. أنشئ خمسة أسعار شهرية متكررة باليورو في وضع الاختبار: 4.99 و6.99 و8.99 و11.99 و13.99، ثم ضع معرّفاتها في متغيرات `STRIPE_PRICE_499` و`STRIPE_PRICE_699` و`STRIPE_PRICE_899` و`STRIPE_PRICE_1199` و`STRIPE_PRICE_1399` داخل Vercel.
11. في Stripe فعّل Billing Portal وأضف أحداث Checkout وتحديث/إلغاء الاشتراك وفواتير الدفع الناجحة والفاشلة كما هو موضح في `docs/VERCEL-ENVIRONMENT.md`.
12. اختبر عملية شراء كاملة في Sandbox قبل استخدام أي مفاتيح Live.
13. لا تفعّل الدفع الحقيقي قبل إكمال Stripe checkout وwebhook واختبارهما.

مهم: هذه الخطوات تحتاج تنفيذًا داخل لوحتي Supabase وVercel. لا يمكن اعتبارها منجزة بمجرد حفظ ملفات GitHub.
