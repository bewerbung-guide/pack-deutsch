# German Zone · HTML / CSS / JavaScript

1. فكّ ZIP. افتح `index.html` فالمتصفح باش تشوف الموقع.
2. ارفع محتويات ZIP مباشرة فجذر مستودع GitHub، بما فيها `assets/` و`.nojekyll`.
3. من **Settings → Pages** اختار **Deploy from a branch → main → /(root)**.

`settings.js` فيه رقم واتساب ديال German Zone. فالإعداد الحالي الزائر كيعمّر الفورم، وكيحل واتساب برسالة واجدة لرقمك. كيبقى عليه يضغط **إرسال** فواتساب.

ريل الأستاذة مربوط فـ`index.html` و`main.js`. الرابط المباشر ليوتيوب متاح أيضاً للمشاهدة.

خط Lifta Black كيتحمّل من جهاز الزائر إذا كان مثبتاً. ملف الخط المرسل نسخة تجريبية، والواجهة كتستعمل خطها العربي الحالي كبديل. من بعد الحصول على رخصة الويب، ضع ملف WOFF2 المرخّص باسم `assets/lifta-black.woff2` وزد `,url("assets/lifta-black.woff2") format("woff2")` في نهاية `src` ديال Lifta Black فـ`styles.css`.

الإرسال التلقائي كيتفعّل إلا ربطت `registrationApiUrl` و`turnstileSiteKey` بالخدمة الخلفية ديال حزمة GitHub وواتساب. أسرار الربط مكانها فالخدمة الخلفية.
