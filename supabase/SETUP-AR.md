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
9. لا تفعّل الدفع قبل إكمال Stripe checkout وwebhook الآمنين واختبارهما.

مهم: هذه الخطوات تحتاج تنفيذًا داخل لوحتي Supabase وVercel. لا يمكن اعتبارها منجزة بمجرد حفظ ملفات GitHub.
