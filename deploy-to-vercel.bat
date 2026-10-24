@echo off
chcp 65001 >nul
echo ========================================================
echo   FitCraft - النشر المباشر على منصة Vercel
echo ========================================================
echo.
echo 1. التحقق من جاهزية ملفات المشروع...
if not exist vercel.json (
    echo خطأ: ملف vercel.json غير موجود!
    pause
    exit /b
)
if not exist .vercelignore (
    echo خطأ: ملف .vercelignore غير موجود!
    pause
    exit /b
)

echo.
echo 2. جاري تشغيل أداة Vercel CLI للنشر السحابي...
echo    (إذا كانت هذه أول مرة، سيطلب منك تسجيل الدخول لحساب Vercel)
echo.
npx -y vercel --prod

echo.
echo ========================================================
echo   اكتمل أمر النشر! يمكنك الآن فتح الرابط على أي موبايل
echo ========================================================
pause
