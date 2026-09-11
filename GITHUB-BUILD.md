# بناء PhysioCenter كـ EXE باستخدام GitHub Actions

بدل بناء البرنامج على جهازك، ارفع المشروع إلى GitHub وشغّل Workflow باسم:
**Build PhysioCenter Windows Installer**

الـWorkflow يعمل على Windows في GitHub، ينزّل Electron والحزم المطلوبة، ثم يبني:
`PhysioCenter-Setup-1.0.0.exe`

## التشغيل
1. ارفع كل ملفات المشروع إلى Repository على GitHub.
2. افتح تبويب **Actions**.
3. اختر **Build PhysioCenter Windows Installer**.
4. اضغط **Run workflow** ثم **Run workflow** مرة أخرى.
5. انتظر حتى تصبح المهمة خضراء.
6. افتح نتيجة التشغيل وستجد **Artifacts**.
7. نزّل `PhysioCenter-Windows-Installer`.
8. فك الضغط وستجد ملف `PhysioCenter-Setup-1.0.0.exe`.

لا يحتاج مستخدم البرنامج إلى Node.js أو npm.
