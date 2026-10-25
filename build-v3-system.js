const fs = require('fs');
const path = require('path');

console.log('Building FitCraft v3 with all fixes...');

// 1. Read plans.json (all 54 Liftosaur programs)
let plansData = [];
try {
    plansData = JSON.parse(fs.readFileSync('plans.json', 'utf8'));
    console.log(`Loaded ${plansData.length} Liftosaur programs from plans.json.`);
} catch (e) {
    console.error('Error loading plans.json:', e);
}

// 2. Read stretch-mobility-data.json (202 exercises)
let stretchData = [];
try {
    stretchData = JSON.parse(fs.readFileSync('stretch-mobility-data.json', 'utf8'));
    console.log(`Loaded ${stretchData.length} stretch & mobility exercises.`);
} catch (e) {
    console.error('Error loading stretch-mobility-data.json:', e);
}

// 3. Read wger looping videos
let wgerVideos = [];
try {
    wgerVideos = JSON.parse(fs.readFileSync('wger-videos.json', 'utf8')).slice(0, 30);
    console.log(`Loaded ${wgerVideos.length} wger looping videos.`);
} catch (e) {
    console.error('Error loading wger-videos.json:', e);
}

// 4. Build Clean HTML without emojis
const htmlContent = `<!DOCTYPE html>
<html lang="ar" dir="rtl" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>FitCraft | منصة اللياقة البدنية والتمارين الذكية</title>
    
    <!-- PWA Configuration -->
    <link rel="manifest" href="./manifest.json">
    <meta name="theme-color" content="#f59e0b">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="FitCraft">
    <link rel="apple-touch-icon" href="./icons/apple-touch-icon.png">
    <link rel="icon" type="image/svg+xml" href="./icons/icon-vector.svg">

    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- Google Fonts: Cairo & Outfit -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    
    <!-- Font Awesome 6 -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    
    <!-- Canvas Confetti -->
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js"></script>

    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        fitDark: {
                            950: '#07080a',
                            900: '#0e1015',
                            850: '#141720',
                            800: '#1c212d',
                            750: '#252c3c',
                            700: '#323b50',
                            600: '#47536d'
                        },
                        amberGold: {
                            DEFAULT: '#f59e0b',
                            hover: '#d97706',
                            glow: 'rgba(245, 158, 11, 0.4)',
                            subtle: 'rgba(245, 158, 11, 0.12)'
                        },
                        muscleRed: {
                            DEFAULT: '#ef4444',
                            hover: '#dc2626',
                            glow: 'rgba(239, 68, 68, 0.4)',
                            subtle: 'rgba(239, 68, 68, 0.12)'
                        },
                        cyberEmerald: {
                            DEFAULT: '#10b981',
                            subtle: 'rgba(16, 185, 129, 0.12)'
                        },
                        cyberCyan: {
                            DEFAULT: '#06b6d4',
                            subtle: 'rgba(6, 182, 212, 0.12)'
                        }
                    },
                    fontFamily: {
                        cairo: ['Cairo', 'sans-serif'],
                        outfit: ['Outfit', 'sans-serif']
                    },
                    boxShadow: {
                        'amberGlow': '0 0 25px -4px rgba(245, 158, 11, 0.35)',
                        'redGlow': '0 0 25px -4px rgba(239, 68, 68, 0.35)',
                        'emeraldGlow': '0 0 25px -4px rgba(16, 185, 129, 0.35)',
                        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.55)'
                    }
                }
            }
        }
    </script>

    <style>
        * { -webkit-tap-highlight-color: transparent; }
        body {
            font-family: 'Cairo', sans-serif;
            background-color: #07080a;
            color: #f3f4f6;
            overflow-x: hidden;
        }
        .font-num { font-family: 'Outfit', sans-serif; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #07080a; }
        ::-webkit-scrollbar-thumb { background: #252c3c; border-radius: 9999px; }
        ::-webkit-scrollbar-thumb:hover { background: #f59e0b; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .bg-gym-grid {
            background-image: radial-gradient(rgba(245, 158, 11, 0.04) 1px, transparent 1px);
            background-size: 28px 28px;
        }
        .glass-card {
            background: rgba(14, 16, 21, 0.78);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .glass-card-hover { transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        .glass-card-hover:hover {
            border-color: rgba(245, 158, 11, 0.4);
            transform: translateY(-2px);
            box-shadow: 0 12px 30px -8px rgba(245, 158, 11, 0.15);
        }
        .orb-breath-inhale {
            transform: scale(1.45);
            box-shadow: 0 0 60px 20px rgba(6, 182, 212, 0.5), inset 0 0 40px rgba(6, 182, 212, 0.6);
            transition: all 4s ease-in-out;
        }
        .orb-breath-hold {
            transform: scale(1.45);
            box-shadow: 0 0 70px 25px rgba(245, 158, 11, 0.6), inset 0 0 45px rgba(245, 158, 11, 0.7);
            transition: all 0.5s ease-in-out;
        }
        .orb-breath-exhale {
            transform: scale(0.9);
            box-shadow: 0 0 35px 8px rgba(239, 68, 68, 0.4), inset 0 0 25px rgba(239, 68, 68, 0.5);
            transition: all 4s ease-in-out;
        }
        .orb-breath-hold-post {
            transform: scale(0.9);
            box-shadow: 0 0 30px 6px rgba(113, 113, 122, 0.4), inset 0 0 20px rgba(113, 113, 122, 0.5);
            transition: all 0.5s ease-in-out;
        }
    </style>
</head>
<body class="bg-fitDark-950 text-zinc-100 min-h-screen bg-gym-grid selection:bg-amberGold selection:text-black flex flex-col justify-between">

    <!-- Top Sticky Glass Nav Header -->
    <header class="sticky top-0 z-40 bg-fitDark-900/90 backdrop-blur-xl border-b border-white/10 transition-all duration-300">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="h-16 flex items-center justify-between gap-3">
                
                <!-- Logo & Brand with 4-Click Easter Egg Admin Access -->
                <div class="flex items-center gap-3 cursor-pointer shrink-0 select-none group" id="fitcraftBrandLogo" onclick="handleLogoEasterEggClick()" title="FitCraft - انقر 4 مرات متتالية">
                    <div id="fitcraftLogoBadge" class="w-10 h-10 rounded-xl bg-gradient-to-tr from-amberGold/20 via-fitDark-800 to-amberGold/30 border border-amberGold/40 flex items-center justify-center shadow-amberGlow transition-transform">
                        <i class="fa-solid fa-dumbbell text-amberGold text-xl"></i>
                    </div>
                    <div>
                        <div class="flex items-center gap-2">
                            <span class="text-xl sm:text-2xl font-black tracking-tight text-white font-outfit">FIT<span class="text-amberGold">CRAFT</span></span>
                            <span id="secretAdminIndicator" class="hidden text-[9px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse font-num">ADMIN</span>
                            <span id="headerTotalBadge" class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amberGold/15 text-amberGold border border-amberGold/30 font-num">1,323 تمرين</span>
                        </div>
                        <p class="text-[10px] text-zinc-400 hidden sm:block">ترسانة الجيم، برامج التدريب والاستشفاء الحركي</p>
                    </div>
                </div>

                <!-- Global Quick Search (Desktop / Tablet) -->
                <div class="flex-1 max-w-md hidden md:block">
                    <div class="relative">
                        <i class="fa-solid fa-magnifying-glass absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-xs"></i>
                        <input type="text" id="globalSearchInput" placeholder="ابحث عن تمرين، جهاز، أو عضلة..."
                               class="w-full bg-fitDark-850 border border-fitDark-750 rounded-xl pr-9 pl-8 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amberGold focus:ring-1 focus:ring-amberGold transition-all">
                        <button id="clearGlobalSearchBtn" onclick="clearGlobalSearch()" class="hidden absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 text-xs">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                </div>

                <!-- Action Controls -->
                <div class="flex items-center gap-2">
                    <!-- Arabic Voice Guidance Toggle in Header -->
                    <button onclick="toggleVoiceGuide()" id="headerVoiceToggleBtn" title="تفعيل / كتم التوجيه الصوتي العربي"
                            class="px-2.5 py-1.5 rounded-xl bg-fitDark-800 border border-fitDark-700 hover:border-amberGold text-xs font-bold flex items-center gap-1.5 text-zinc-300 transition-colors">
                        <i class="fa-solid fa-volume-high text-amberGold" id="headerVoiceIcon"></i>
                        <span class="hidden sm:inline text-[11px]" id="headerVoiceText">صوتي: مفعل</span>
                    </button>

                    <!-- Active Workout Direct Trigger Button -->
                    <button onclick="switchMainTab('active_session')" id="navActiveWorkoutBtn"
                            class="relative px-3.5 py-2 rounded-xl bg-gradient-to-r from-muscleRed/20 to-amberGold/20 border border-muscleRed/40 hover:border-amberGold/60 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-redGlow">
                        <span class="relative flex h-2 w-2">
                            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-muscleRed opacity-75"></span>
                            <span class="relative inline-flex rounded-full h-2 w-2 bg-muscleRed"></span>
                        </span>
                        <i class="fa-solid fa-fire text-amberGold"></i>
                        <span class="hidden xs:inline">جلسة التمرين</span>
                        <span id="activeWorkoutBadgeCount" class="font-num px-1.5 py-0.2 rounded-full bg-amberGold text-black font-black text-[10px]">0</span>
                    </button>

                    <!-- Media Settings Button -->
                    <button onclick="openMediaSettingsModal()" title="إعدادات مصدر الوسائط وربط السيرفر"
                            class="w-9 h-9 rounded-xl bg-fitDark-800 border border-fitDark-700 hover:border-zinc-500 text-zinc-300 hover:text-white flex items-center justify-center text-xs transition-colors">
                        <i class="fa-solid fa-server"></i>
                    </button>
                </div>
            </div>

            <!-- Lower Nav Row: 7 Pro Gym Tabs (Clean Text without Emojis) -->
            <nav class="flex items-center gap-2 py-2 overflow-x-auto no-scrollbar scroll-smooth border-t border-white/5" id="mainNavBar">
                <button onclick="switchMainTab('equipment_hub')" id="tabBtn-equipment_hub"
                        class="tab-btn shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 bg-amberGold text-black shadow-amberGlow">
                    <i class="fa-solid fa-dumbbell text-sm"></i>
                    <span>التمارين والأجهزة</span>
                </button>

                <button onclick="switchMainTab('stretching')" id="tabBtn-stretching"
                        class="tab-btn shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 text-zinc-400 hover:text-white hover:bg-fitDark-800">
                    <i class="fa-solid fa-person-walking text-sm"></i>
                    <span>الاستشفاء وتصحيح القوام</span>
                </button>

                <button onclick="switchMainTab('breathwork')" id="tabBtn-breathwork"
                        class="tab-btn shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 text-zinc-400 hover:text-white hover:bg-fitDark-800">
                    <i class="fa-solid fa-lungs text-sm"></i>
                    <span>جلسات التنفس الموجهة</span>
                </button>

                <button onclick="switchMainTab('programs')" id="tabBtn-programs"
                        class="tab-btn shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 text-zinc-400 hover:text-white hover:bg-fitDark-800">
                    <i class="fa-solid fa-clipboard-list text-sm"></i>
                    <span>البرامج المعتمدة (54)</span>
                </button>

                <button onclick="switchMainTab('generator')" id="tabBtn-generator"
                        class="tab-btn shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 text-zinc-400 hover:text-white hover:bg-fitDark-800">
                    <i class="fa-solid fa-bolt text-sm"></i>
                    <span>المولد الذكي التكيفي</span>
                </button>

                <button onclick="switchMainTab('active_session')" id="tabBtn-active_session"
                        class="tab-btn shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 text-zinc-400 hover:text-white hover:bg-fitDark-800">
                    <i class="fa-solid fa-fire text-sm text-muscleRed"></i>
                    <span>جلسة التمرين المباشرة</span>
                </button>

                <button onclick="switchMainTab('profile')" id="tabBtn-profile"
                        class="tab-btn shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 text-zinc-400 hover:text-white hover:bg-fitDark-800">
                    <i class="fa-solid fa-user text-sm"></i>
                    <span>ملف المتدرب وإحصائياته</span>
                </button>

                <!-- Hidden Admin Button -->
                <button onclick="switchMainTab('admin')" id="tabBtn-admin"
                        class="tab-btn hidden shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 text-red-400 border border-red-500/30 bg-red-500/10 hover:bg-red-500/20">
                    <i class="fa-solid fa-user-shield text-sm"></i>
                    <span>لوحة الإدارة</span>
                </button>
            </nav>
        </div>
    </header>

    <!-- Main Container -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-8">

        <!-- ============================================================ -->
        <!-- TAB 1: ترسانة الأجهزة والتمارين                             -->
        <!-- ============================================================ -->
        <section id="view-equipment_hub" class="space-y-8">
            <div class="relative rounded-3xl p-6 sm:p-8 overflow-hidden bg-gradient-to-r from-fitDark-900 via-fitDark-850 to-fitDark-900 border border-white/10 shadow-glass">
                <div class="absolute -left-10 -bottom-10 w-64 h-64 bg-amberGold/10 rounded-full blur-3xl pointer-events-none"></div>
                <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div class="space-y-3 max-w-2xl">
                        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amberGold/15 border border-amberGold/30 text-amberGold text-xs font-bold">
                            <i class="fa-solid fa-shield-halved"></i>
                            <span>الترسانة الميكانيكية وبدائل التمارين الذكية</span>
                        </div>
                        <h1 class="text-2xl sm:text-4xl font-black text-white tracking-tight">
                            اختر أجهزتك، وانطلق بتمارين دقيقة لزواياك العضلية
                        </h1>
                        <p class="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                            حدد أجهزة الجيم المتاحة لتصفية أكثر من <span class="font-num text-amberGold font-bold" id="heroExerciseCounter">1,323</span> تمرين وفيديو حركي، مع بدائل ذكية بنقرة واحدة (ماكينة، كيبل، دمبل، أو وزن جسم).
                        </p>
                    </div>

                    <div class="flex items-center gap-3 w-full md:w-auto shrink-0">
                        <div class="flex-1 md:flex-initial p-4 rounded-2xl bg-fitDark-950/80 border border-white/5 text-center min-w-[110px]">
                            <div class="text-xl sm:text-2xl font-black font-num text-amberGold" id="hubExercisesCount">1,323</div>
                            <div class="text-[11px] text-zinc-400">تمرين مفهرس</div>
                        </div>
                        <div class="flex-1 md:flex-initial p-4 rounded-2xl bg-fitDark-950/80 border border-white/5 text-center min-w-[110px]">
                            <div class="text-xl sm:text-2xl font-black font-num text-muscleRed">10</div>
                            <div class="text-[11px] text-zinc-400">محطات ميكانيكية</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Equipment Catalog (Visual SVGs from ./equipment-icons/) -->
            <div class="space-y-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <div class="w-2.5 h-6 rounded-full bg-amberGold"></div>
                        <h2 class="text-lg sm:text-xl font-bold text-white">ترسانة أجهزة ومعدات الجيم (فلترة فورية متعددة)</h2>
                    </div>
                    <button onclick="clearEquipmentFilters()" class="text-xs text-zinc-400 hover:text-amberGold flex items-center gap-1 transition-colors">
                        <i class="fa-solid fa-rotate-left"></i>
                        <span>إلغاء التحديد</span>
                    </button>
                </div>

                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3" id="equipmentCatalogGrid">
                    <!-- Populated dynamically via JS -->
                </div>
            </div>

            <!-- Secondary Filters: Muscles & Mobile Search -->
            <div class="glass-card rounded-2xl p-4 sm:p-5 space-y-4">
                <div class="block md:hidden">
                    <div class="relative">
                        <i class="fa-solid fa-magnifying-glass absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-xs"></i>
                        <input type="text" id="mobileSearchInput" placeholder="بحث سريع في التمارين..."
                               class="w-full bg-fitDark-850 border border-fitDark-750 rounded-xl pr-9 pl-4 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amberGold">
                    </div>
                </div>

                <div class="space-y-2">
                    <span class="text-xs font-bold text-zinc-400 flex items-center gap-1.5">
                        <i class="fa-solid fa-filter text-amberGold"></i>
                        <span>تصفية بحسب العضلة المستهدفة:</span>
                    </span>
                    <div class="flex items-center gap-2 overflow-x-auto no-scrollbar py-1" id="muscleChipsContainer">
                        <button onclick="filterByMuscle('all')" data-muscle="all" class="muscle-chip shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all bg-amberGold text-black shadow-amberGlow">الكل</button>
                        <button onclick="filterByMuscle('chest')" data-muscle="chest" class="muscle-chip shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all bg-fitDark-800 text-zinc-300 hover:text-white">الصدر</button>
                        <button onclick="filterByMuscle('back')" data-muscle="back" class="muscle-chip shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all bg-fitDark-800 text-zinc-300 hover:text-white">الظهر والمجنص</button>
                        <button onclick="filterByMuscle('legs')" data-muscle="legs" class="muscle-chip shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all bg-fitDark-800 text-zinc-300 hover:text-white">الأرجل</button>
                        <button onclick="filterByMuscle('shoulders')" data-muscle="shoulders" class="muscle-chip shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all bg-fitDark-800 text-zinc-300 hover:text-white">الأكتاف</button>
                        <button onclick="filterByMuscle('arms')" data-muscle="arms" class="muscle-chip shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all bg-fitDark-800 text-zinc-300 hover:text-white">الذراعين</button>
                        <button onclick="filterByMuscle('abs')" data-muscle="abs" class="muscle-chip shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all bg-fitDark-800 text-zinc-300 hover:text-white">البطن والكور</button>
                    </div>
                </div>
            </div>

            <!-- Exercises Cards Grid -->
            <div class="space-y-4">
                <div class="flex items-center justify-between text-xs text-zinc-400">
                    <span>التمارين المطابقة: <strong class="text-amberGold font-num" id="filteredExercisesCount">0</strong></span>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6" id="exercisesGridContainer">
                    <!-- Populated dynamically via JS -->
                </div>

                <div class="text-center pt-6 hidden" id="loadMoreExercisesWrapper">
                    <button onclick="loadMoreExercises()"
                            class="px-8 py-3 rounded-2xl bg-fitDark-800 hover:bg-fitDark-750 text-amberGold border border-amberGold/30 font-bold text-xs shadow-lg transition-all">
                        عرض المزيد من التمارين
                    </button>
                </div>
            </div>
        </section>


        <!-- ============================================================ -->
        <!-- TAB 2: الاستشفاء وتصحيح القوام                               -->
        <!-- ============================================================ -->
        <section id="view-stretching" class="space-y-8 hidden">
            <div class="relative rounded-3xl p-6 sm:p-8 overflow-hidden bg-gradient-to-r from-fitDark-900 via-fitDark-850 to-fitDark-900 border border-white/10 shadow-glass">
                <div class="space-y-2 max-w-2xl">
                    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyberEmerald/15 border border-cyberEmerald/30 text-cyberEmerald text-xs font-bold">
                        <i class="fa-solid fa-heart-pulse"></i>
                        <span>مكتبة الاستشفاء الحركي، صحة المكاتب وتدرجات الكاليستنكس</span>
                    </div>
                    <h2 class="text-2xl sm:text-3xl font-black text-white">الاستشفاء وتصحيح القوام والمرونة</h2>
                    <p class="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                        أكثر من 200 تمرين وإطالة متحركة محلية لعلاج متلازمة الجلوس الطويل، تدرجات الكاليستنكس، وإطالات الإحماء والتبريد.
                    </p>
                </div>
            </div>

            <!-- Sub-Categories Navigation -->
            <div class="flex items-center gap-2 overflow-x-auto no-scrollbar py-1" id="stretchingCategoryBar">
                <button onclick="filterStretchingCategory('all')" class="stretch-cat-btn shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all bg-amberGold text-black shadow-amberGlow" data-stretch="all">
                    الكل (<span id="count-all-stretch" class="font-num">202</span>)
                </button>
                <button onclick="filterStretchingCategory('posture_desk')" class="stretch-cat-btn shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all bg-fitDark-800 text-zinc-300 hover:text-white" data-stretch="posture_desk">
                    <i class="fa-solid fa-chair ml-1.5 text-amberGold"></i>صحة المكاتب وتصحيح القوام
                </button>
                <button onclick="filterStretchingCategory('calisthenics')" class="stretch-cat-btn shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all bg-fitDark-800 text-zinc-300 hover:text-white" data-stretch="calisthenics">
                    <i class="fa-solid fa-bars-staggered ml-1.5 text-muscleRed"></i>تدرجات الكاليستنكس
                </button>
                <button onclick="filterStretchingCategory('dynamic_warmup')" class="stretch-cat-btn shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all bg-fitDark-800 text-zinc-300 hover:text-white" data-stretch="dynamic_warmup">
                    <i class="fa-solid fa-bolt ml-1.5 text-cyberCyan"></i>إطالات ديناميكية (قبل التمرين)
                </button>
                <button onclick="filterStretchingCategory('static_relief')" class="stretch-cat-btn shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all bg-fitDark-800 text-zinc-300 hover:text-white" data-stretch="static_relief">
                    <i class="fa-solid fa-shield-heart ml-1.5 text-cyberEmerald"></i>إطالات استاتيكية (بعد التمرين)
                </button>
            </div>

            <!-- Cards Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" id="stretchingCardsGrid">
                <!-- Dynamically populated via JS -->
            </div>
        </section>


        <!-- ============================================================ -->
        <!-- TAB 3: مختبر التنفس التفاعلي                                -->
        <!-- ============================================================ -->
        <section id="view-breathwork" class="space-y-8 hidden">
            <div class="text-center max-w-2xl mx-auto space-y-3">
                <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyberCyan/15 border border-cyberCyan/30 text-cyberCyan text-xs font-bold">
                    <i class="fa-solid fa-wind"></i>
                    <span>مختبر ضبط الجهاز العصبي والأكسجة الحيوية</span>
                </div>
                <h2 class="text-2xl sm:text-4xl font-black text-white">مختبر جلسات التنفس الموجهة</h2>
                <p class="text-xs sm:text-sm text-zinc-400">
                    بروتوكولات علمية لمزامنة ضربات القلب وخفض هرمون التوتر وتجهيز طاقتك العصبية مع محاكي بصري وصوتي نابض.
                </p>
            </div>

            <!-- 4 Scientific Protocols -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
                <div onclick="selectBreathTechnique('box')" id="breathCard-box"
                     class="cursor-pointer p-5 rounded-2xl glass-card border-2 border-amberGold bg-amberGold/10 transition-all space-y-2">
                    <div class="flex items-center justify-between">
                        <span class="w-8 h-8 rounded-lg bg-amberGold/20 text-amberGold flex items-center justify-center text-sm font-bold"><i class="fa-solid fa-square"></i></span>
                        <div class="flex items-center gap-1.5">
                            <span class="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">andfaulkner/box-breathing</span>
                            <span class="text-[10px] px-2 py-0.5 rounded-full bg-amberGold text-black font-black font-num">4-4-4-4</span>
                        </div>
                    </div>
                    <h3 class="font-bold text-white text-sm">تنفس المربع (Box Breathing)</h3>
                    <p class="text-[11px] text-zinc-400">بروتوكول علمي معتمد في مستودع andfaulkner/box-breathing لخفض التوتر العصبي وتثبيت ضربات القلب تحت الضغط.</p>
                </div>

                <div onclick="selectBreathTechnique('relax')" id="breathCard-relax"
                     class="cursor-pointer p-5 rounded-2xl glass-card border-2 border-white/5 bg-fitDark-850 hover:border-cyberCyan/50 transition-all space-y-2">
                    <div class="flex items-center justify-between">
                        <span class="w-8 h-8 rounded-lg bg-cyberCyan/20 text-cyberCyan flex items-center justify-center text-sm font-bold"><i class="fa-solid fa-moon"></i></span>
                        <span class="text-[10px] px-2 py-0.5 rounded-full bg-cyberCyan text-black font-black font-num">4-7-8</span>
                    </div>
                    <h3 class="font-bold text-white text-sm">الاسترخاء العميق (4-7-8)</h3>
                    <p class="text-[11px] text-zinc-400">تنشيط العصب الحائر وتخفيض ضغط الدم استعداداً للاستشفاء.</p>
                </div>

                <div onclick="selectBreathTechnique('coherence')" id="breathCard-coherence"
                     class="cursor-pointer p-5 rounded-2xl glass-card border-2 border-white/5 bg-fitDark-850 hover:border-cyberEmerald/50 transition-all space-y-2">
                    <div class="flex items-center justify-between">
                        <span class="w-8 h-8 rounded-lg bg-cyberEmerald/20 text-cyberEmerald flex items-center justify-center text-sm font-bold"><i class="fa-solid fa-wave-square"></i></span>
                        <span class="text-[10px] px-2 py-0.5 rounded-full bg-cyberEmerald text-black font-black font-num">5.5s - 5.5s</span>
                    </div>
                    <h3 class="font-bold text-white text-sm">الرنين المتوازن (Coherence)</h3>
                    <p class="text-[11px] text-zinc-400">أعلى درجات توازن نبضات القلب والهدوء الذهني المتدفق.</p>
                </div>

                <div onclick="selectBreathTechnique('power')" id="breathCard-power"
                     class="cursor-pointer p-5 rounded-2xl glass-card border-2 border-white/5 bg-fitDark-850 hover:border-muscleRed/50 transition-all space-y-2">
                    <div class="flex items-center justify-between">
                        <span class="w-8 h-8 rounded-lg bg-muscleRed/20 text-muscleRed flex items-center justify-center text-sm font-bold"><i class="fa-solid fa-fire"></i></span>
                        <span class="text-[10px] px-2 py-0.5 rounded-full bg-muscleRed text-black font-black font-num">4-1-2-0</span>
                    </div>
                    <h3 class="font-bold text-white text-sm">التنفس التنشيطي (Power)</h3>
                    <p class="text-[11px] text-zinc-400">شحن الأكسجين ورفع اليقظة الحركية قبل التدريب.</p>
                </div>
            </div>

            <!-- Central Animated Orb (Does NOT auto-start) -->
            <div class="max-w-lg mx-auto glass-card rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-8 relative overflow-hidden">
                <div class="flex items-center justify-between w-full text-xs text-zinc-400">
                    <div class="flex items-center gap-2">
                        <i class="fa-solid fa-rotate text-amberGold"></i>
                        <span>الدورات المنجزة: <span id="breathCompletedCycles" class="font-num text-white font-bold">0</span></span>
                    </div>
                    <label class="flex items-center gap-1.5 cursor-pointer text-zinc-400 hover:text-white select-none">
                        <input type="checkbox" id="breathAudioToggle" checked class="w-3.5 h-3.5 rounded text-amberGold focus:ring-amberGold">
                        <span class="text-[11px]">التوجيه الصوتي للأنفاس</span>
                    </label>
                </div>

                <div class="relative w-64 h-64 flex items-center justify-center my-4">
                    <div id="breathOrbOuter" class="w-48 h-48 rounded-full border-2 border-amberGold/30 transition-all duration-700 flex items-center justify-center">
                        <div id="breathInteractiveOrb" class="w-36 h-36 rounded-full bg-gradient-to-tr from-amberGold/80 to-amber-300 transition-all flex flex-col items-center justify-center shadow-amberGlow text-black select-none">
                            <span id="breathPhaseCountdown" class="text-3xl font-black font-num">4</span>
                            <span id="breathPhaseTitle" class="text-xs font-black mt-1">جاهز للبدء</span>
                        </div>
                    </div>
                </div>

                <div class="space-y-1">
                    <div id="breathPhaseDesc" class="text-sm font-bold text-white">اضغط زر البدء للدخول في الدورة التنفسية</div>
                    <p id="breathNextPreview" class="text-xs text-zinc-400">تنفس بهدوء من الأنف واملأ قاع الرئتين</p>
                </div>

                <div class="flex items-center gap-3 w-full">
                    <button onclick="toggleBreathSession()" id="breathStartPauseBtn"
                            class="flex-1 py-3.5 rounded-2xl bg-amberGold text-black font-bold text-sm hover:bg-amber-400 transition-all shadow-amberGlow flex items-center justify-center gap-2">
                        <i class="fa-solid fa-play"></i>
                        <span>بدء الجلسة</span>
                    </button>
                    <button onclick="resetBreathSession()" class="px-5 py-3.5 rounded-2xl bg-fitDark-800 hover:bg-fitDark-750 text-zinc-300 font-bold text-sm transition-all">
                        <i class="fa-solid fa-stop"></i>
                    </button>
                </div>
            </div>
        </section>


        <!-- ============================================================ -->
        <!-- TAB 4: البرامج التدريبية المعتمدة (54 برنامج Liftosaur)       -->
        <!-- ============================================================ -->
        <section id="view-programs" class="space-y-8 hidden">
            <div class="relative rounded-3xl p-6 sm:p-8 overflow-hidden bg-gradient-to-r from-fitDark-900 via-fitDark-850 to-fitDark-900 border border-white/10 shadow-glass">
                <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div class="space-y-2 max-w-xl">
                        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amberGold/15 border border-amberGold/30 text-amberGold text-xs font-bold">
                            <i class="fa-solid fa-trophy"></i>
                            <span>قواعد بيانات Liftosaur المعتمدة عالمياً</span>
                        </div>
                        <h2 class="text-2xl sm:text-3xl font-black text-white">البرامج التدريبية الاحترافية (54 برنامج)</h2>
                        <p class="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                            أنظمة تدريب معتمدة من كبار المدربين وأبطال العالم مع تفاصيل الجولات وتفعيل مباشر بنقرة واحدة.
                        </p>
                    </div>

                    <div class="flex items-center gap-2 overflow-x-auto no-scrollbar w-full md:w-auto">
                        <button onclick="filterProgramsCategory('all')" class="program-cat-btn shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all bg-amberGold text-black" data-cat="all">الكل (54)</button>
                        <button onclick="filterProgramsCategory('ppl')" class="program-cat-btn shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all bg-fitDark-800 text-zinc-300 hover:text-white" data-cat="ppl">دفع سحب أرجل</button>
                        <button onclick="filterProgramsCategory('strength')" class="program-cat-btn shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all bg-fitDark-800 text-zinc-300 hover:text-white" data-cat="strength">القوة 5x5</button>
                        <button onclick="filterProgramsCategory('upper_lower')" class="program-cat-btn shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all bg-fitDark-800 text-zinc-300 hover:text-white" data-cat="upper_lower">علوي / سفلي</button>
                        <button onclick="filterProgramsCategory('arnold')" class="program-cat-btn shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all bg-fitDark-800 text-zinc-300 hover:text-white" data-cat="arnold">أرنولد</button>
                    </div>
                </div>
            </div>

            <!-- Programs Search Input -->
            <div class="glass-card rounded-2xl p-4">
                <div class="relative">
                    <i class="fa-solid fa-magnifying-glass absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-xs"></i>
                    <input type="text" id="programSearchInput" placeholder="ابحث في البرامج المعتمدة (مثل: GZCLP, Arnold, nSuns, PPL)..."
                           oninput="handleProgramSearch(this.value)"
                           class="w-full bg-fitDark-850 border border-fitDark-750 rounded-xl pr-9 pl-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amberGold">
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6" id="proProgramsGrid">
                <!-- Dynamically populated via JS with 54 Liftosaur programs -->
            </div>
        </section>


        <!-- ============================================================ -->
        <!-- TAB 5: المولد الذكي التكيفي للإصابات ونقاط الضعف               -->
        <!-- ============================================================ -->
        <section id="view-generator" class="space-y-8 hidden">
            <div class="text-center max-w-2xl mx-auto space-y-2">
                <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amberGold/15 border border-amberGold/30 text-amberGold text-xs font-bold">
                    <i class="fa-solid fa-wand-magic-sparkles"></i>
                    <span>المدرب الخوارزمي التكيفي</span>
                </div>
                <h2 class="text-2xl sm:text-3xl font-black text-white">توليد جدولك التدريبي المخصص بأمان تام</h2>
                <p class="text-xs sm:text-sm text-zinc-400">
                    خوارزمية ذكية تستبعد الحركات المجهدة للمفاصل المصابة وتضع نقاط ضعفك العضلية في مقدمة الحصة.
                </p>
            </div>

            <div class="max-w-4xl mx-auto glass-card rounded-3xl p-6 sm:p-8 space-y-6">
                <!-- Step 1: Goal & Level -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div class="space-y-3">
                        <label class="text-xs font-bold text-zinc-300 flex items-center gap-2">
                            <span class="w-5 h-5 rounded-full bg-amberGold text-black font-num font-black flex items-center justify-center text-[10px]">1</span>
                            <span>الهدف التدريبي الأساسي:</span>
                        </label>
                        <div class="grid grid-cols-2 gap-2">
                            <button type="button" onclick="setGeneratorGoal('hypertrophy')" id="genGoal-hypertrophy"
                                    class="gen-goal-btn p-3 rounded-xl border-2 border-amberGold bg-amberGold/15 text-white font-bold text-xs flex flex-col items-center gap-1.5 transition-all">
                                <i class="fa-solid fa-dumbbell text-amberGold text-base"></i>
                                <span>تضخيم وبناء عضلات</span>
                            </button>
                            <button type="button" onclick="setGeneratorGoal('strength')" id="genGoal-strength"
                                    class="gen-goal-btn p-3 rounded-xl border-2 border-white/5 bg-fitDark-850 hover:border-zinc-500 text-zinc-300 font-bold text-xs flex flex-col items-center gap-1.5 transition-all">
                                <i class="fa-solid fa-medal text-base"></i>
                                <span>زيادة القوة البدنية</span>
                            </button>
                            <button type="button" onclick="setGeneratorGoal('fatloss')" id="genGoal-fatloss"
                                    class="gen-goal-btn p-3 rounded-xl border-2 border-white/5 bg-fitDark-850 hover:border-zinc-500 text-zinc-300 font-bold text-xs flex flex-col items-center gap-1.5 transition-all">
                                <i class="fa-solid fa-fire text-base"></i>
                                <span>حرق الدهون والتنشيف</span>
                            </button>
                            <button type="button" onclick="setGeneratorGoal('mobility')" id="genGoal-mobility"
                                    class="gen-goal-btn p-3 rounded-xl border-2 border-white/5 bg-fitDark-850 hover:border-zinc-500 text-zinc-300 font-bold text-xs flex flex-col items-center gap-1.5 transition-all">
                                <i class="fa-solid fa-heart-pulse text-base"></i>
                                <span>مرونة ورشاقة</span>
                            </button>
                        </div>
                    </div>

                    <div class="space-y-3">
                        <label class="text-xs font-bold text-zinc-300 flex items-center gap-2">
                            <span class="w-5 h-5 rounded-full bg-amberGold text-black font-num font-black flex items-center justify-center text-[10px]">2</span>
                            <span>المستوى التدريبي:</span>
                        </label>
                        <div class="grid grid-cols-3 gap-2">
                            <button type="button" onclick="setGeneratorLevel('beginner')" id="genLevel-beginner"
                                    class="gen-level-btn p-3 rounded-xl border border-white/5 bg-fitDark-850 text-zinc-300 font-bold text-xs text-center transition-all">
                                مبتدئ (1-6 أشهر)
                            </button>
                            <button type="button" onclick="setGeneratorLevel('intermediate')" id="genLevel-intermediate"
                                    class="gen-level-btn p-3 rounded-xl border-2 border-amberGold bg-amberGold text-black font-bold text-xs text-center transition-all">
                                متوسط (1-3 سنوات)
                            </button>
                            <button type="button" onclick="setGeneratorLevel('advanced')" id="genLevel-advanced"
                                    class="gen-level-btn p-3 rounded-xl border border-white/5 bg-fitDark-850 text-zinc-300 font-bold text-xs text-center transition-all">
                                متقدم (+3 سنوات)
                            </button>
                        </div>

                        <!-- Priority Weak Muscle Focus -->
                        <div class="pt-2 space-y-1.5">
                            <label class="text-xs font-bold text-amberGold flex items-center gap-1.5">
                                <i class="fa-solid fa-bullseye"></i>
                                <span>العضلة الضعيفة ذات الأولوية (توضع في مقدمة الحصة):</span>
                            </label>
                            <select id="genPriorityMuscleSelect" class="w-full bg-fitDark-850 border border-fitDark-750 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amberGold">
                                <option value="balanced">توزيع متوازن (بدون تركيز خاص)</option>
                                <option value="chest">عضلة الصدر</option>
                                <option value="back">عضلة الظهر والمجنص</option>
                                <option value="shoulders">الأكتاف وتدوير الذراع</option>
                                <option value="arms">الذراعين: البايسبس والترايسبس</option>
                                <option value="legs">عضلات الأرجل والجلوتس</option>
                                <option value="abs">عضلات البطن والكور</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Step 3: Injury Blacklist (Safety Protection) -->
                <div class="space-y-3 pt-2 p-4 rounded-2xl bg-muscleRed/10 border border-muscleRed/30">
                    <label class="text-xs font-bold text-muscleRed flex items-center justify-between">
                        <span class="flex items-center gap-2">
                            <i class="fa-solid fa-shield-virus text-sm"></i>
                            <span>مراعاة الإصابات النشطة (يتم استبعاد الحركات المجهدة تلقائياً):</span>
                        </span>
                        <span class="text-[10px] text-zinc-400">حدد ما تعاني منه لحماية مفاصلك</span>
                    </label>

                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                        <label class="flex items-center gap-2 p-2.5 rounded-xl bg-fitDark-900 border border-white/5 cursor-pointer hover:border-red-400 select-none">
                            <input type="checkbox" id="injury-lower_back" onchange="toggleInjuryFilter('lower_back')" class="w-4 h-4 rounded text-red-500 focus:ring-0">
                            <span class="text-xs font-bold text-zinc-300">أسفل الظهر</span>
                        </label>
                        <label class="flex items-center gap-2 p-2.5 rounded-xl bg-fitDark-900 border border-white/5 cursor-pointer hover:border-red-400 select-none">
                            <input type="checkbox" id="injury-shoulder" onchange="toggleInjuryFilter('shoulder')" class="w-4 h-4 rounded text-red-500 focus:ring-0">
                            <span class="text-xs font-bold text-zinc-300">مفصل الكتف</span>
                        </label>
                        <label class="flex items-center gap-2 p-2.5 rounded-xl bg-fitDark-900 border border-white/5 cursor-pointer hover:border-red-400 select-none">
                            <input type="checkbox" id="injury-knee" onchange="toggleInjuryFilter('knee')" class="w-4 h-4 rounded text-red-500 focus:ring-0">
                            <span class="text-xs font-bold text-zinc-300">مفصل الركبة</span>
                        </label>
                        <label class="flex items-center gap-2 p-2.5 rounded-xl bg-fitDark-900 border border-white/5 cursor-pointer hover:border-red-400 select-none">
                            <input type="checkbox" id="injury-wrist" onchange="toggleInjuryFilter('wrist')" class="w-4 h-4 rounded text-red-500 focus:ring-0">
                            <span class="text-xs font-bold text-zinc-300">مفصل المعصم</span>
                        </label>
                    </div>
                </div>

                <!-- Step 4: Days & Duration -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                    <div class="space-y-3">
                        <label class="text-xs font-bold text-zinc-300 flex items-center gap-2">
                            <span class="w-5 h-5 rounded-full bg-amberGold text-black font-num font-black flex items-center justify-center text-[10px]">3</span>
                            <span>أيام التدريب في الأسبوع:</span>
                        </label>
                        <div class="grid grid-cols-5 gap-2">
                            <button type="button" onclick="setGeneratorDays(2)" class="gen-days-btn py-2.5 rounded-xl border border-white/5 bg-fitDark-850 text-xs font-num font-bold" data-days="2">2 يوم</button>
                            <button type="button" onclick="setGeneratorDays(3)" class="gen-days-btn py-2.5 rounded-xl border border-white/5 bg-fitDark-850 text-xs font-num font-bold" data-days="3">3 أيام</button>
                            <button type="button" onclick="setGeneratorDays(4)" class="gen-days-btn py-2.5 rounded-xl border-2 border-amberGold bg-amberGold text-black text-xs font-num font-bold" data-days="4">4 أيام</button>
                            <button type="button" onclick="setGeneratorDays(5)" class="gen-days-btn py-2.5 rounded-xl border border-white/5 bg-fitDark-850 text-xs font-num font-bold" data-days="5">5 أيام</button>
                            <button type="button" onclick="setGeneratorDays(6)" class="gen-days-btn py-2.5 rounded-xl border border-white/5 bg-fitDark-850 text-xs font-num font-bold" data-days="6">6 أيام</button>
                        </div>
                    </div>

                    <div class="space-y-3">
                        <label class="text-xs font-bold text-zinc-300 flex items-center gap-2">
                            <span class="w-5 h-5 rounded-full bg-amberGold text-black font-num font-black flex items-center justify-center text-[10px]">4</span>
                            <span>الوقت المتاح للحصة:</span>
                        </label>
                        <div class="grid grid-cols-4 gap-2">
                            <button type="button" onclick="setGeneratorDuration(30)" class="gen-dur-btn py-2.5 rounded-xl border border-white/5 bg-fitDark-850 text-xs font-num font-bold" data-dur="30">30 دقيقة</button>
                            <button type="button" onclick="setGeneratorDuration(45)" class="gen-dur-btn py-2.5 rounded-xl border border-white/5 bg-fitDark-850 text-xs font-num font-bold" data-dur="45">45 دقيقة</button>
                            <button type="button" onclick="setGeneratorDuration(60)" class="gen-dur-btn py-2.5 rounded-xl border-2 border-amberGold bg-amberGold text-black text-xs font-num font-bold" data-dur="60">60 دقيقة</button>
                            <button type="button" onclick="setGeneratorDuration(90)" class="gen-dur-btn py-2.5 rounded-xl border border-white/5 bg-fitDark-850 text-xs font-num font-bold" data-dur="90">90 دقيقة</button>
                        </div>
                    </div>
                </div>

                <!-- Step 5: Equipment -->
                <div class="space-y-3 pt-2">
                    <div class="flex items-center justify-between">
                        <label class="text-xs font-bold text-zinc-300 flex items-center gap-2">
                            <span class="w-5 h-5 rounded-full bg-amberGold text-black font-num font-black flex items-center justify-center text-[10px]">5</span>
                            <span>المعدات والأجهزة المتوفرة لديك:</span>
                        </label>
                        <button type="button" onclick="selectAllGeneratorEquipment()" class="text-[11px] text-amberGold hover:underline">تحديد الكل</button>
                    </div>
                    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5" id="generatorEquipmentChecks"></div>
                </div>

                <div class="pt-4">
                    <button type="button" onclick="generateSmartRoutine()"
                            class="w-full py-4 rounded-2xl bg-gradient-to-r from-amberGold via-amber-400 to-amberGold text-black font-black text-sm flex items-center justify-center gap-2 shadow-amberGlow hover:brightness-110 transition-all">
                        <i class="fa-solid fa-wand-magic-sparkles"></i>
                        <span>توليد البرنامج التكيفي الآن</span>
                    </button>
                </div>
            </div>

            <!-- Result Container (Fixed ID) -->
            <div id="generatorResultContainer" class="hidden max-w-4xl mx-auto space-y-6">
                <div class="glass-card rounded-3xl p-6 sm:p-8 space-y-4 border border-amberGold/30">
                    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                        <div>
                            <span class="text-xs text-amberGold font-bold font-num" id="genResultBadge">برنامج مخصص</span>
                            <h3 class="text-xl font-bold text-white mt-1" id="genResultTitle">الخطة التدريبية التكيفية</h3>
                            <div id="genSafetyShieldNotice" class="text-xs text-cyberEmerald mt-1 hidden flex items-center gap-1.5">
                                <i class="fa-solid fa-shield-halved"></i>
                                <span>تم تطبيق حماية المفاصل واستبعاد التمارين المجهدة.</span>
                            </div>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4" id="generatedRoutineDaysList"></div>
                </div>
            </div>
        </section>


        <!-- ============================================================ -->
        <!-- TAB 6: جلسة التمرين المباشرة                                -->
        <!-- ============================================================ -->
        <section id="view-active_session" class="space-y-8 hidden">
            <!-- Header Card with Voice & Cadence Controls -->
            <div class="glass-card rounded-3xl p-6 sm:p-8 space-y-6 border border-white/10 relative overflow-hidden">
                <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div class="space-y-1">
                        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muscleRed/15 border border-muscleRed/30 text-muscleRed text-xs font-bold">
                            <span class="w-2 h-2 rounded-full bg-muscleRed animate-ping"></span>
                            <span>وضع شاشة التركيز وإدارة الجولات الحية</span>
                        </div>
                        <h2 class="text-xl sm:text-3xl font-black text-white" id="activeViewSessionTitle">جلسة التمرين المباشرة</h2>
                        <p class="text-xs text-zinc-400">تتبع دقيق للجولات، رتم الحركة الصوتي (Tempo 3-1-1-0)، وبديل فوري لأي تمرين.</p>
                    </div>

                    <div class="flex items-center gap-2 flex-wrap">
                        <button onclick="toggleVoiceGuide()" id="activeVoiceGuideBtn"
                                class="px-3.5 py-2 rounded-xl bg-fitDark-800 border border-fitDark-700 hover:border-amberGold text-xs font-bold text-zinc-200 flex items-center gap-2 transition-colors">
                            <i class="fa-solid fa-volume-high text-amberGold" id="activeVoiceIcon"></i>
                            <span id="activeVoiceLabel">التوجيه الصوتي العربي: مفعل</span>
                        </button>
                    </div>
                </div>

                <!-- Session Progress Bar -->
                <div class="space-y-2">
                    <div class="flex items-center justify-between text-xs">
                        <span class="text-zinc-400">تقدم الحصة التدريبية:</span>
                        <span class="font-num font-bold text-amberGold"><span id="activeSessionCompletedSets">0</span> من <span id="activeSessionTotalSets">0</span> جولة مكتملة</span>
                    </div>
                    <div class="w-full bg-fitDark-900 h-2 rounded-full overflow-hidden border border-white/5">
                        <div id="activeSessionProgressBar" class="bg-gradient-to-r from-amberGold to-muscleRed h-2 transition-all duration-300" style="width: 0%"></div>
                    </div>
                </div>
            </div>

            <!-- Repetition Tempo Cadence Trainer (3-1-1-0) -->
            <div class="glass-card rounded-3xl p-6 sm:p-7 space-y-4 border border-amberGold/30 bg-gradient-to-tr from-fitDark-900 via-fitDark-850 to-fitDark-900">
                <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-amberGold/20 text-amberGold flex items-center justify-center text-lg">
                            <i class="fa-solid fa-stopwatch-20"></i>
                        </div>
                        <div>
                            <h4 class="text-sm font-bold text-white flex items-center gap-2">
                                <span>عداد الرتم الزمني للعدات (Tempo Cadence: 3-1-1-0)</span>
                                <span class="text-[10px] px-2 py-0.5 rounded-full bg-amberGold/15 text-amberGold font-num">علمي</span>
                            </h4>
                            <p class="text-xs text-zinc-400">3 ثوانٍ نزول وتحكم (شهيق) • 1 ثانية ثبات وعصر • 1 ثانية دفع وانفجار (زفير)</p>
                        </div>
                    </div>

                    <div class="flex items-center gap-2">
                        <button onclick="toggleCadenceTrainer()" id="cadenceToggleBtn"
                                class="px-4 py-2 rounded-xl bg-amberGold text-black font-bold text-xs hover:bg-amber-400 transition-all shadow-amberGlow flex items-center gap-1.5">
                            <i class="fa-solid fa-play" id="cadencePlayIcon"></i>
                            <span id="cadenceBtnLabel">تشغيل الرتم للعدة</span>
                        </button>
                        <button onclick="resetCadenceTrainer()" class="w-8 h-8 rounded-xl bg-fitDark-800 text-zinc-400 hover:text-white flex items-center justify-center text-xs">
                            <i class="fa-solid fa-rotate-left"></i>
                        </button>
                    </div>
                </div>

                <div class="flex items-center justify-around p-4 rounded-2xl bg-fitDark-950 border border-white/5 flex-wrap gap-4">
                    <div class="flex items-center gap-4">
                        <div id="cadenceVisualOrb" class="w-14 h-14 rounded-full bg-amberGold/20 border-2 border-amberGold flex items-center justify-center text-amberGold font-black text-lg font-num transition-all">
                            3
                        </div>
                        <div>
                            <span class="text-[10px] text-zinc-500 uppercase tracking-wider block">المرحلة الحالية</span>
                            <span id="cadencePhaseText" class="text-sm font-bold text-white">جاهز للبدء</span>
                        </div>
                    </div>
                    <div class="text-center sm:text-right">
                        <span class="text-[10px] text-zinc-500 block">عداد التكرار</span>
                        <span class="text-lg font-black font-num text-cyberEmerald" id="cadenceRepsCountDisplay">العدة 0 / 10</span>
                    </div>
                </div>
            </div>

            <!-- Active Workout Exercises Cards Container -->
            <div class="space-y-6" id="activeSessionExercisesContainer"></div>

            <!-- Finish Session Footer -->
            <div class="glass-card rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 border border-white/10">
                <div>
                    <h4 class="text-base font-bold text-white">هل أكملت حصتك التدريبية بالكامل؟</h4>
                    <p class="text-xs text-zinc-400">سيتم حفظ الحمل الحجمي ومزامنة إحصائياتك في ملفك الشخصي.</p>
                </div>
                <div class="flex items-center gap-3 w-full sm:w-auto">
                    <button onclick="finishActiveWorkoutSession()"
                            class="flex-1 sm:flex-initial px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyberEmerald to-teal-500 text-black font-black text-xs shadow-emeraldGlow hover:brightness-110 transition-all flex items-center justify-center gap-2">
                        <i class="fa-solid fa-flag-checkered"></i>
                        <span>إنهاء الحصة التدريبية</span>
                    </button>
                    <button onclick="clearActiveWorkout()" class="px-4 py-3.5 rounded-2xl bg-fitDark-800 hover:bg-fitDark-750 text-zinc-400 hover:text-red-400 text-xs">
                        تفريغ
                    </button>
                </div>
            </div>
        </section>


        <!-- ============================================================ -->
        <!-- TAB 7: ملف المتدرب وإحصائياته                               -->
        <!-- ============================================================ -->
        <section id="view-profile" class="space-y-8 hidden">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-num">
                <div class="p-5 rounded-3xl glass-card border border-white/5 space-y-1">
                    <div class="flex items-center justify-between text-zinc-400 text-xs font-cairo">
                        <span>أيام الالتزام المتتالية</span>
                        <i class="fa-solid fa-fire text-amberGold"></i>
                    </div>
                    <div class="text-3xl font-black text-amberGold" id="profileStreakDisplay">0</div>
                    <p class="text-[10px] text-zinc-500 font-cairo">أفضل إنجاز: <span id="profileBestStreakDisplay">0</span> يوم</p>
                </div>

                <div class="p-5 rounded-3xl glass-card border border-white/5 space-y-1">
                    <div class="flex items-center justify-between text-zinc-400 text-xs font-cairo">
                        <span>إجمالي الحصص المنجزة</span>
                        <i class="fa-solid fa-dumbbell text-cyberEmerald"></i>
                    </div>
                    <div class="text-3xl font-black text-white" id="profileWorkoutsCountDisplay">0</div>
                    <p class="text-[10px] text-zinc-500 font-cairo">موثقة في المتصفح</p>
                </div>

                <div class="p-5 rounded-3xl glass-card border border-white/5 space-y-1">
                    <div class="flex items-center justify-between text-zinc-400 text-xs font-cairo">
                        <span>الحمل الحجمي التراكمي</span>
                        <i class="fa-solid fa-weight-hanging text-muscleRed"></i>
                    </div>
                    <div class="text-3xl font-black text-cyberEmerald" id="profileTotalVolumeDisplay">0</div>
                    <p class="text-[10px] text-zinc-500 font-cairo">كجم تم رفعها</p>
                </div>

                <div class="p-5 rounded-3xl glass-card border border-white/5 space-y-1">
                    <div class="flex items-center justify-between text-zinc-400 text-xs font-cairo">
                        <span>النسخ الاحتياطي</span>
                        <i class="fa-solid fa-database text-cyberCyan"></i>
                    </div>
                    <div class="flex items-center gap-2 pt-2">
                        <button onclick="exportUserDataBackup()" class="flex-1 py-1.5 rounded-xl bg-fitDark-800 hover:bg-fitDark-750 text-amberGold border border-amberGold/30 text-[10px] font-bold font-cairo transition-all">
                            تصدير JSON
                        </button>
                        <label class="flex-1 py-1.5 rounded-xl bg-fitDark-800 hover:bg-fitDark-750 text-zinc-300 border border-white/10 text-[10px] font-bold font-cairo text-center cursor-pointer transition-all">
                            استيراد
                            <input type="file" accept=".json" onchange="importUserDataBackup(event)" class="hidden">
                        </label>
                    </div>
                </div>
            </div>

            <!-- Heatmap Calendar (28-day) -->
            <div class="glass-card rounded-3xl p-6 sm:p-8 space-y-4 border border-white/10">
                <div class="flex items-center justify-between">
                    <div>
                        <h3 class="text-base font-bold text-white">تقويم الالتزام الرياضي (آخر 28 يوماً)</h3>
                        <p class="text-xs text-zinc-400">سجل استمرارك اليومي في أداء التمارين</p>
                    </div>
                </div>
                <div class="grid grid-cols-7 gap-2 sm:gap-3" id="miniCalendarGrid"></div>
            </div>

            <!-- Biometrics Calculator & Macronutrients -->
            <div class="glass-card rounded-3xl p-6 sm:p-8 space-y-6 border border-white/10">
                <div class="flex items-center justify-between border-b border-white/10 pb-4">
                    <h3 class="text-base font-bold text-white">المقاييس الحيوية واحتياج السعرات (TDEE & Macros)</h3>
                    <button onclick="saveUserProfileData()" class="px-4 py-2 rounded-xl bg-amberGold text-black font-bold text-xs hover:bg-amber-400 transition-all shadow-amberGlow">
                        حفظ البيانات
                    </button>
                </div>

                <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-xs">
                    <div class="space-y-1.5">
                        <label class="text-zinc-400">اسم المتدرب:</label>
                        <input type="text" id="profileNameInput" class="w-full bg-fitDark-850 border border-fitDark-750 rounded-xl px-3 py-2 text-white">
                    </div>
                    <div class="space-y-1.5">
                        <label class="text-zinc-400">الوزن (كجم):</label>
                        <input type="number" id="profileWeightInput" oninput="calculateBiometrics()" class="w-full bg-fitDark-850 border border-fitDark-750 rounded-xl px-3 py-2 text-white font-num font-bold">
                    </div>
                    <div class="space-y-1.5">
                        <label class="text-zinc-400">الطول (سم):</label>
                        <input type="number" id="profileHeightInput" oninput="calculateBiometrics()" class="w-full bg-fitDark-850 border border-fitDark-750 rounded-xl px-3 py-2 text-white font-num font-bold">
                    </div>
                    <div class="space-y-1.5">
                        <label class="text-zinc-400">العمر:</label>
                        <input type="number" id="profileAgeInput" oninput="calculateBiometrics()" class="w-full bg-fitDark-850 border border-fitDark-750 rounded-xl px-3 py-2 text-white font-num font-bold">
                    </div>
                    <div class="space-y-1.5">
                        <label class="text-zinc-400">الجنس:</label>
                        <select id="profileGenderInput" onchange="calculateBiometrics()" class="w-full bg-fitDark-850 border border-fitDark-750 rounded-xl px-3 py-2 text-white">
                            <option value="male">ذكر</option>
                            <option value="female">أنثى</option>
                        </select>
                    </div>
                    <div class="space-y-1.5">
                        <label class="text-zinc-400">مستوى النشاط:</label>
                        <select id="profileActivityInput" onchange="calculateBiometrics()" class="w-full bg-fitDark-850 border border-fitDark-750 rounded-xl px-3 py-2 text-white">
                            <option value="1.2">خامل (مكتبي)</option>
                            <option value="1.375">نشاط خفيف (1-3 أيام)</option>
                            <option value="1.55" selected>نشاط متوسط (3-5 أيام)</option>
                            <option value="1.725">نشاط عالي (6-7 أيام)</option>
                        </select>
                    </div>
                </div>

                <!-- Results Grid -->
                <div class="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 font-num">
                    <div class="p-3.5 rounded-2xl bg-fitDark-900 border border-white/5 text-center">
                        <span class="text-[10px] text-zinc-400 font-cairo block">مؤشر الكتلة (BMI)</span>
                        <span id="bioBmiValue" class="text-base font-black text-white">23.7</span>
                        <span id="bioBmiBadge" class="text-[9px] font-bold px-2 py-0.5 rounded-full bg-cyberEmerald/20 text-cyberEmerald block mt-1 font-cairo">مثالي</span>
                    </div>
                    <div class="p-3.5 rounded-2xl bg-fitDark-900 border border-white/5 text-center">
                        <span class="text-[10px] text-zinc-400 font-cairo block">الأيض الأساسي (BMR)</span>
                        <span id="bioBmrValue" class="text-base font-black text-amberGold">1,720</span>
                        <span class="text-[9px] text-zinc-500 block font-cairo">سعرة بالراحة</span>
                    </div>
                    <div class="p-3.5 rounded-2xl bg-fitDark-900 border border-white/5 text-center">
                        <span class="text-[10px] text-zinc-400 font-cairo block">الاحتياج اليومي (TDEE)</span>
                        <span id="bioTdeeValue" class="text-base font-black text-cyberEmerald">2,665</span>
                        <span class="text-[9px] text-zinc-500 block font-cairo">سعرة للمحافظة</span>
                    </div>
                    <div class="p-3.5 rounded-2xl bg-fitDark-900 border border-white/5 text-center">
                        <span class="text-[10px] text-zinc-400 font-cairo block">البروتين المقترح</span>
                        <span id="bioProteinValue" class="text-base font-black text-cyberCyan">150g</span>
                        <span class="text-[9px] text-zinc-500 block font-cairo">2 جم / كجم</span>
                    </div>
                    <div class="p-3.5 rounded-2xl bg-fitDark-900 border border-white/5 text-center">
                        <span class="text-[10px] text-zinc-400 font-cairo block">الكاربوهيدرات والدهون</span>
                        <span class="text-sm font-bold text-white"><span id="bioCarbsValue">345g</span> / <span id="bioFatsValue">68g</span></span>
                        <span class="text-[9px] text-zinc-500 block font-cairo">توزيع طاقة متوازن</span>
                    </div>
                </div>
            </div>

            <!-- Workout History Table -->
            <div class="glass-card rounded-3xl p-6 sm:p-8 space-y-4 border border-white/10">
                <div class="flex items-center justify-between">
                    <h3 class="text-base font-bold text-white">سجل الحصص السابقة المنجزة</h3>
                    <button onclick="clearWorkoutHistory()" class="text-xs text-zinc-400 hover:text-red-400 transition-colors">مسح السجل</button>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-right text-xs">
                        <thead>
                            <tr class="border-b border-white/10 text-zinc-400 font-bold">
                                <th class="py-2.5 px-3">التاريخ</th>
                                <th class="py-2.5 px-3">الحصة التدريبية</th>
                                <th class="py-2.5 px-3">التمارين</th>
                                <th class="py-2.5 px-3">الحمل الحجمي</th>
                                <th class="py-2.5 px-3">المدة</th>
                            </tr>
                        </thead>
                        <tbody id="workoutHistoryTableBody" class="divide-y divide-white/5"></tbody>
                    </table>
                </div>
            </div>
        </section>


        <!-- ============================================================ -->
        <!-- TAB 8: لوحة الإدارة والتحكم السرية                          -->
        <!-- ============================================================ -->
        <section id="view-admin" class="space-y-8 hidden">
            <!-- Pin Lock Gate -->
            <div id="adminLockedState" class="max-w-md mx-auto glass-card rounded-3xl p-8 space-y-6 text-center border border-red-500/30">
                <div class="w-16 h-16 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center text-2xl mx-auto">
                    <i class="fa-solid fa-lock"></i>
                </div>
                <div class="space-y-1">
                    <h3 class="text-lg font-bold text-white">منطقة الإدارة والتحكم</h3>
                    <p class="text-xs text-zinc-400">أدخل رمز PIN لتسجيل الدخول (الرمز الافتراضي: 1234)</p>
                </div>
                <div class="space-y-3">
                    <input type="password" id="adminPinInput" placeholder="أدخل رمز PIN" maxlength="6"
                           class="w-full bg-fitDark-850 border border-fitDark-750 rounded-xl px-4 py-3 text-center text-lg text-white font-num tracking-widest focus:outline-none focus:border-red-400">
                    <button onclick="verifyAdminPin()"
                            class="w-full py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs transition-all shadow-redGlow">
                        دخول لوحة التحكم
                    </button>
                </div>
            </div>

            <!-- Unlocked Admin Content -->
            <div id="adminUnlockedContent" class="hidden space-y-8">
                <!-- Admin Stats -->
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 font-num">
                    <div class="p-5 rounded-2xl glass-card border border-white/5">
                        <span class="text-xs text-zinc-400 block font-cairo">التمارين الإجمالية</span>
                        <span id="adminStatsExercises" class="text-2xl font-black text-amberGold">0</span>
                    </div>
                    <div class="p-5 rounded-2xl glass-card border border-white/5">
                        <span class="text-xs text-zinc-400 block font-cairo">محطات الأجهزة</span>
                        <span id="adminStatsEquipment" class="text-2xl font-black text-cyberCyan">10</span>
                    </div>
                    <div class="p-5 rounded-2xl glass-card border border-white/5">
                        <span class="text-xs text-zinc-400 block font-cairo">البرامج المعتمدة</span>
                        <span id="adminStatsPrograms" class="text-2xl font-black text-cyberEmerald">54</span>
                    </div>
                    <div class="p-5 rounded-2xl glass-card border border-white/5">
                        <span class="text-xs text-zinc-400 block font-cairo">حجم التخزين</span>
                        <span id="adminStatsStorage" class="text-2xl font-black text-muscleRed">0 KB</span>
                    </div>
                </div>

                <!-- Add New Exercise Form -->
                <div class="glass-card rounded-3xl p-6 sm:p-8 space-y-6 border border-white/10">
                    <h3 class="text-base font-bold text-white flex items-center gap-2">
                        <i class="fa-solid fa-plus text-amberGold"></i>
                        <span>إضافة تمرين جديد لقاعدة البيانات المحلية</span>
                    </h3>

                    <form id="addCustomExerciseForm" onsubmit="handleAddNewExercise(event)" class="space-y-4 text-xs">
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div class="space-y-1.5">
                                <label class="text-zinc-400">اسم التمرين (عربي):</label>
                                <input type="text" id="adminExNameAr" required class="w-full bg-fitDark-850 border border-fitDark-750 rounded-xl px-3 py-2 text-white">
                            </div>
                            <div class="space-y-1.5">
                                <label class="text-zinc-400">اسم التمرين (إنجليزي):</label>
                                <input type="text" id="adminExNameEn" required class="w-full bg-fitDark-850 border border-fitDark-750 rounded-xl px-3 py-2 text-white">
                            </div>
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div class="space-y-1.5">
                                <label class="text-zinc-400">العضلة المستهدفة:</label>
                                <select id="adminExMuscle" class="w-full bg-fitDark-850 border border-fitDark-750 rounded-xl px-3 py-2 text-white">
                                    <option value="chest">الصدر</option>
                                    <option value="back">الظهر والمجنص</option>
                                    <option value="legs">الأرجل</option>
                                    <option value="shoulders">الأكتاف</option>
                                    <option value="arms">الذراعين</option>
                                    <option value="abs">البطن والكور</option>
                                </select>
                            </div>
                            <div class="space-y-1.5">
                                <label class="text-zinc-400">الجهاز أو الأداة:</label>
                                <select id="adminExEquipment" class="w-full bg-fitDark-850 border border-fitDark-750 rounded-xl px-3 py-2 text-white">
                                    <option value="chest-press">جهاز دفع الصدر</option>
                                    <option value="lat-pulldown">سحب الظهر العالي</option>
                                    <option value="leg-press">دفع الأرجل 45</option>
                                    <option value="leg-extension-curl">تمديد وثني الأرجل</option>
                                    <option value="pec-deck">جهاز الفراشة Pec Deck</option>
                                    <option value="smith-machine">جهاز سميث</option>
                                    <option value="cable-crossover">الكابلات المتقاطعة</option>
                                    <option value="pulleys">البكرات العلوية والسفلية</option>
                                    <option value="free-weights">الأوزان الحرة</option>
                                    <option value="bodyweight-tower">برج وزن الجسم والعقلة</option>
                                </select>
                            </div>
                            <div class="space-y-1.5">
                                <label class="text-zinc-400">مسار الوسائط أو الرابط:</label>
                                <input type="text" id="adminExGifPath" placeholder="pectorals/barbell-bench-press.gif" class="w-full bg-fitDark-850 border border-fitDark-750 rounded-xl px-3 py-2 text-white font-num">
                            </div>
                        </div>

                        <div class="space-y-1.5">
                            <label class="text-zinc-400">اقتراح بديل ذكي للتمرين:</label>
                            <input type="text" id="adminExAlternative" placeholder="مثال: ضغط الصدر بالدمبلز أو بجهاز دفع الصدر Seated Press" class="w-full bg-fitDark-850 border border-fitDark-750 rounded-xl px-3 py-2 text-white">
                        </div>

                        <button type="submit" class="px-6 py-2.5 rounded-xl bg-amberGold text-black font-bold text-xs hover:bg-amber-400 transition-all shadow-amberGlow">
                            حفظ التمرين في قاعدة البيانات
                        </button>
                    </form>
                </div>

                <!-- Custom Exercises Table -->
                <div class="glass-card rounded-3xl p-6 sm:p-8 space-y-4 border border-white/10">
                    <h3 class="text-base font-bold text-white">التمارين المخصصة المضافة</h3>
                    <div class="overflow-x-auto">
                        <table class="w-full text-right text-xs">
                            <thead>
                                <tr class="border-b border-white/10 text-zinc-400 font-bold">
                                    <th class="py-2.5 px-3">اسم التمرين</th>
                                    <th class="py-2.5 px-3">العضلة</th>
                                    <th class="py-2.5 px-3">الجهاز</th>
                                    <th class="py-2.5 px-3 text-center">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody id="customExercisesTableBody" class="divide-y divide-white/5"></tbody>
                        </table>
                    </div>
                </div>

                <!-- Factory Reset -->
                <div class="p-6 rounded-3xl bg-red-500/10 border border-red-500/30 flex items-center justify-between gap-4">
                    <div>
                        <h4 class="text-sm font-bold text-red-400">استعادة ضبط المصنع بالكامل</h4>
                        <p class="text-xs text-zinc-400">سيتم مسح كافة البيانات من المتصفح والعودة للحالة الافتراضية الأولية.</p>
                    </div>
                    <button onclick="confirmFactoryReset()" class="px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs transition-colors">
                        تصفير شامل
                    </button>
                </div>
            </div>
        </section>

    </main>

    <!-- Footer -->
    <footer class="border-t border-white/10 bg-fitDark-900/60 py-6 text-center text-xs text-zinc-500">
        <div class="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div class="flex items-center gap-2">
                <span class="font-outfit font-black text-amberGold tracking-wider">FITCRAFT</span>
                <span>منصة اللياقة البدنية والتمارين الذكية المعتمدة</span>
            </div>
            <div class="text-[11px] font-num text-zinc-400">
                FitCraft Engine v3.0 • Liftosaur & Open Source Gym Datasets
            </div>
        </div>
    </footer>


    <!-- MODALS & DRAWERS -->

    <!-- 1. Alternative Exercise Smart Swap Modal -->
    <div id="alternativeModal" class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md hidden flex items-center justify-center p-4">
        <div class="glass-card rounded-3xl max-w-xl w-full p-6 space-y-5 border border-amberGold/30">
            <div class="flex items-center justify-between border-b border-white/10 pb-4">
                <div class="flex items-center gap-2.5">
                    <span class="w-9 h-9 rounded-xl bg-amberGold/20 text-amberGold flex items-center justify-center text-base"><i class="fa-solid fa-arrows-rotate"></i></span>
                    <div>
                        <h4 class="font-bold text-white text-base">اقتراح بديل ذكي للتمرين</h4>
                        <p class="text-[11px] text-zinc-400" id="altModalOriginalName">اسم التمرين الأصلي</p>
                    </div>
                </div>
                <button onclick="closeAlternativeModal()" class="w-8 h-8 rounded-full bg-fitDark-800 text-zinc-400 hover:text-white flex items-center justify-center">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>

            <!-- Categorized Swap Suggestions -->
            <div class="space-y-3" id="altModalSuggestionsList"></div>
        </div>
    </div>

    <!-- 2. Workout Summary Celebration Modal -->
    <div id="workoutSummaryModal" class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md hidden flex items-center justify-center p-4">
        <div class="glass-card rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 border border-amberGold/40 text-center relative">
            <div class="w-16 h-16 rounded-3xl bg-amberGold/20 border border-amberGold/40 text-amberGold flex items-center justify-center text-3xl mx-auto shadow-amberGlow">
                <i class="fa-solid fa-trophy"></i>
            </div>
            
            <div class="space-y-1">
                <h3 class="text-xl font-black text-white">تم إنجاز الحصة التدريبية بنجاح</h3>
                <p class="text-xs text-zinc-400">إليك ملخص إنجازك الرياضي الموثق في ملفك الشخصي:</p>
            </div>

            <!-- Stats Summary Grid -->
            <div class="grid grid-cols-3 gap-3 font-num">
                <div class="p-4 rounded-2xl bg-fitDark-900 border border-white/5">
                    <span class="text-[10px] text-zinc-400 block font-cairo">الحمل الحجمي</span>
                    <span id="summaryTotalVolume" class="text-lg font-black text-amberGold">0 كجم</span>
                </div>
                <div class="p-4 rounded-2xl bg-fitDark-900 border border-white/5">
                    <span class="text-[10px] text-zinc-400 block font-cairo">الجولات المنجزة</span>
                    <span id="summaryTotalSets" class="text-lg font-black text-cyberEmerald">0</span>
                </div>
                <div class="p-4 rounded-2xl bg-fitDark-900 border border-white/5">
                    <span class="text-[10px] text-zinc-400 block font-cairo">المدة المستغرقة</span>
                    <span id="summaryDuration" class="text-lg font-black text-white">45 دقيقة</span>
                </div>
            </div>

            <div class="flex items-center gap-3">
                <button onclick="exportWorkoutSummaryToWhatsApp()"
                        class="flex-1 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs flex items-center justify-center gap-2 transition-all">
                    <i class="fa-brands fa-whatsapp text-base"></i>
                    <span>مشاركة التقرير عبر واتساب</span>
                </button>
                <button onclick="closeWorkoutSummaryModal()"
                        class="px-5 py-3.5 rounded-2xl bg-fitDark-800 hover:bg-fitDark-750 text-zinc-300 font-bold text-xs transition-colors">
                    إغلاق
                </button>
            </div>
        </div>
    </div>

    <!-- 3. Exercise Details Modal -->
    <div id="exerciseDetailsModal" class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md hidden flex items-center justify-center p-4">
        <div class="glass-card rounded-3xl max-w-2xl w-full p-6 sm:p-7 space-y-5 border border-white/10 max-h-[90vh] overflow-y-auto">
            <div class="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                    <h3 class="text-lg font-bold text-white" id="detailsModalTitle">اسم التمرين</h3>
                    <p class="text-xs text-zinc-400 font-num mt-0.5" id="detailsModalSubtitle">Exercise English Name</p>
                </div>
                <button onclick="closeDetailsModal()" class="w-8 h-8 rounded-full bg-fitDark-800 text-zinc-400 hover:text-white flex items-center justify-center">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>

            <!-- Media Preview -->
            <div class="aspect-video bg-fitDark-950 rounded-2xl overflow-hidden border border-white/5 flex items-center justify-center">
                <img id="detailsModalGif" src="" alt="Exercise Demonstration" class="w-full h-full object-contain">
            </div>

            <!-- Badges -->
            <div class="flex items-center gap-2 flex-wrap text-xs" id="detailsModalBadges"></div>

            <!-- Instructions -->
            <div class="space-y-2">
                <h4 class="text-xs font-bold text-amberGold flex items-center gap-1.5">
                    <i class="fa-solid fa-list-check"></i>
                    <span>إرشادات الأداء الحركي والتكنيك:</span>
                </h4>
                <div class="space-y-2 text-zinc-300 text-xs" id="detailsModalInstructions"></div>
            </div>

            <!-- Action Buttons -->
            <div class="pt-3 border-t border-white/10 flex items-center gap-3">
                <button id="detailsModalAddActiveBtn"
                        class="flex-1 py-3 rounded-xl bg-amberGold text-black font-bold text-xs hover:bg-amber-400 transition-all flex items-center justify-center gap-2">
                    <i class="fa-solid fa-plus"></i>
                    <span>إضافة لجدول اليوم</span>
                </button>
                <button id="detailsModalAltBtn"
                        class="px-5 py-3 rounded-xl bg-fitDark-800 hover:bg-fitDark-750 text-zinc-300 font-bold text-xs transition-colors flex items-center gap-1.5">
                    <i class="fa-solid fa-arrows-rotate"></i>
                    <span>بديل التمرين</span>
                </button>
            </div>
        </div>
    </div>

    <!-- 4. Media Settings & Local Server Modal -->
    <div id="mediaSettingsModal" class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md hidden flex items-center justify-center p-4">
        <div class="glass-card rounded-3xl max-w-lg w-full p-6 space-y-6 border border-white/10">
            <div class="flex items-center justify-between border-b border-white/10 pb-4">
                <div class="flex items-center gap-2.5">
                    <span class="w-9 h-9 rounded-xl bg-amberGold/20 text-amberGold flex items-center justify-center text-base"><i class="fa-solid fa-server"></i></span>
                    <div>
                        <h4 class="font-bold text-white text-base">مصدر الوسائط وإعدادات السيرفر</h4>
                        <p class="text-[11px] text-zinc-400">التحكم في قراءة الملفات محلياً أو عبر سحابة CDN</p>
                    </div>
                </div>
                <button onclick="closeMediaSettingsModal()" class="w-8 h-8 rounded-full bg-fitDark-800 text-zinc-400 hover:text-white flex items-center justify-center">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>

            <div class="space-y-4">
                <div class="space-y-2">
                    <label class="text-xs font-bold text-zinc-300">اختر مصدر تحميل الوسائط:</label>
                    <div class="grid grid-cols-2 gap-3">
                        <button type="button" onclick="setMediaSource('local')" id="mediaSrcBtn-local"
                                class="p-3 rounded-xl border-2 border-amberGold bg-amberGold/15 text-white font-bold text-xs flex flex-col items-center gap-1">
                            <i class="fa-solid fa-hard-drive text-amberGold text-base"></i>
                            <span>السيرفر المحلي (أوفلاين)</span>
                        </button>
                        <button type="button" onclick="setMediaSource('cdn')" id="mediaSrcBtn-cdn"
                                class="p-3 rounded-xl border border-white/10 bg-fitDark-850 text-zinc-400 font-bold text-xs flex flex-col items-center gap-1">
                            <i class="fa-solid fa-cloud text-base"></i>
                            <span>سحابة CDN السريعة</span>
                        </button>
                    </div>
                </div>

                <div class="space-y-2">
                    <label class="text-xs font-bold text-zinc-300">رابط السيرفر المحلي:</label>
                    <div class="flex items-center gap-2">
                        <input type="text" id="localServerUrlInput" placeholder="http://localhost:8000"
                               class="flex-1 bg-fitDark-850 border border-fitDark-750 rounded-xl px-3 py-2 text-xs text-white font-num">
                        <button onclick="testLocalServerPing()" class="px-4 py-2 rounded-xl bg-fitDark-800 hover:bg-fitDark-750 text-amberGold border border-amberGold/30 font-bold text-xs">
                            فحص الاتصال
                        </button>
                    </div>
                    <div id="pingStatusResult" class="text-[11px] text-zinc-500 pt-1"></div>
                </div>
            </div>
        </div>
    </div>

    <!-- Toast Notification Element -->
    <div id="toastNotification" class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none transform translate-y-12 opacity-0 transition-all duration-300 px-5 py-3 rounded-2xl glass-card border border-amberGold/40 text-white font-bold text-xs shadow-2xl flex items-center gap-2">
        <i class="fa-solid fa-circle-check text-amberGold" id="toastIcon"></i>
        <span id="toastMessage">تم بنجاح</span>
    </div>

    <!-- Web Audio API synthesized Chimes Helper -->
    <script>
        const AudioHelper = {
            ctx: null,
            init() {
                if (!this.ctx) {
                    const AudioContext = window.AudioContext || window.webkitAudioContext;
                    if (AudioContext) this.ctx = new AudioContext();
                }
            },
            playChime(type = 'bell') {
                try {
                    this.init();
                    if (!this.ctx) return;
                    if (this.ctx.state === 'suspended') this.ctx.resume();
                    
                    const now = this.ctx.currentTime;
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    
                    if (type === 'bell') {
                        osc.type = 'sine';
                        osc.frequency.setValueAtTime(587.33, now);
                        osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
                        gain.gain.setValueAtTime(0.3, now);
                        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
                        osc.start(now);
                        osc.stop(now + 1.2);
                    } else if (type === 'beep') {
                        osc.type = 'triangle';
                        osc.frequency.setValueAtTime(880, now);
                        gain.gain.setValueAtTime(0.2, now);
                        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
                        osc.start(now);
                        osc.stop(now + 0.25);
                    } else if (type === 'secret') {
                        osc.type = 'sine';
                        osc.frequency.setValueAtTime(523.25, now);
                        osc.frequency.setValueAtTime(1046.50, now + 0.12);
                        gain.gain.setValueAtTime(0.35, now);
                        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
                        osc.start(now);
                        osc.stop(now + 0.6);
                    } else if (type === 'finish') {
                        [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
                            const o = this.ctx.createOscillator();
                            const g = this.ctx.createGain();
                            o.connect(g);
                            g.connect(this.ctx.destination);
                            o.frequency.setValueAtTime(freq, now + i * 0.08);
                            g.gain.setValueAtTime(0.25, now + i * 0.08);
                            g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.8);
                            o.start(now + i * 0.08);
                            o.stop(now + i * 0.08 + 0.8);
                        });
                    }
                } catch (e) {}
            }
        };
    </script>
`;

fs.writeFileSync('build-new-index.js', 'const fs = require("fs");\nconst htmlContent = ' + JSON.stringify(htmlContent) + ';\nconst engineJs = fs.readFileSync("engine.js", "utf8");\nfs.writeFileSync("index.html", htmlContent + "\\n<script>\\n" + engineJs + "\\n</script>\\n</body>\\n</html>\\n", "utf8");\nconsole.log("Assembled index.html");\n', 'utf8');

console.log('Updated build-new-index.js with clean UI and no emojis.');
