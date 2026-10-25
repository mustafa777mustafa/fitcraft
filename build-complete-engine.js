const fs = require('fs');

console.log('Building complete engine.js with all 8 modules...');

// Read stretch-mobility-data.json
let stretchData = [];
try {
    const raw = fs.readFileSync('stretch-mobility-data.json', 'utf8');
    stretchData = JSON.parse(raw);
    console.log(`Loaded ${stretchData.length} stretch & mobility exercises.`);
} catch (e) {
    console.warn('Could not read stretch-mobility-data.json, using fallback');
}

// Read wger-videos.json sample (take top 25 high-quality looping videos)
let wgerVideos = [];
try {
    const raw = fs.readFileSync('wger-videos.json', 'utf8');
    const parsed = JSON.parse(raw);
    wgerVideos = parsed.slice(0, 25);
    console.log(`Loaded ${wgerVideos.length} wger looping videos.`);
} catch (e) {
    console.warn('Could not read wger-videos.json');
}

// Write the complete engine.js
const engineCode = `// FitCraft 2.0 - Core Engine & Application Logic
// Single-file Architecture with Adaptive Media Engine, Arabic Voice Guidance, Cadence Tempo, and Injury-Safe Generator

(function() {
    'use strict';

    // --- 1. GLOBAL STATE & CONFIGURATION ---
    const STATE = {
        currentTab: 'equipment_hub',
        mediaSource: localStorage.getItem('fitcraft_media_source') || 'local', // 'local' | 'cdn'
        localServerUrl: localStorage.getItem('fitcraft_server_url') || 'http://localhost:8000',
        voiceGuideEnabled: localStorage.getItem('fitcraft_voice_enabled') !== 'false',
        
        allExercises: [],
        filteredExercises: [],
        selectedEquipment: new Set(),
        selectedMuscle: 'all',
        searchQuery: '',
        page: 1,
        pageSize: 24,

        // Active Workout Live Session
        activeWorkout: JSON.parse(localStorage.getItem('fitcraft_active_workout') || 'null') || {
            title: 'تمرين اليوم الحر',
            date: new Date().toISOString(),
            exercises: []
        },
        restTimer: null,
        restRemaining: 0,
        restTargetExerciseIdx: null,

        // Cadence Trainer (3-1-1-0 Tempo)
        cadence: {
            isRunning: false,
            phase: 'ready', // 'eccentric' (3s) | 'isometric' (1s) | 'concentric' (1s) | 'reset' (0s)
            phaseSeconds: 3,
            currentRep: 0,
            targetReps: 10,
            timerId: null
        },

        // Breathwork
        breath: {
            technique: 'box', // 'box' | 'relax' | 'coherence' | 'power'
            isRunning: false,
            phaseIdx: 0,
            secondsRemaining: 4,
            completedCycles: 0,
            timerId: null
        },

        // Generator
        generator: {
            goal: 'hypertrophy',
            level: 'intermediate',
            priorityMuscle: 'balanced',
            days: 4,
            duration: 60,
            selectedEquipment: new Set(['lat-pulldown', 'chest-press', 'leg-press', 'pulleys', 'free-weights', 'bodyweight-tower']),
            injuries: new Set(), // 'lower_back', 'shoulder', 'knee', 'wrist'
            generatedRoutine: null
        },

        // User Profile & Commitment
        profile: JSON.parse(localStorage.getItem('fitcraft_user_profile') || 'null') || {
            name: 'المتدرب الرياضي',
            age: 26,
            weight: 75,
            height: 178,
            gender: 'male',
            activity: 1.55,
            streak: 3,
            bestStreak: 7,
            workoutsCount: 5,
            totalVolume: 12450,
            activeDays: [
                new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0],
                new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0],
                new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
                new Date(Date.now() - 86400000 * 1).toISOString().split('T')[0]
            ],
            workoutHistory: [
                { date: '2026-10-22 18:30', title: 'تمارين دفع علوي (Push)', exercisesCount: 5, totalVolume: '2,800 كجم', completedSets: 15, duration: '48 دقيقة' },
                { date: '2026-10-20 19:15', title: 'تمارين سحب ومجنص (Pull)', exercisesCount: 6, totalVolume: '3,200 كجم', completedSets: 18, duration: '55 دقيقة' },
                { date: '2026-10-18 17:00', title: 'تمارين أرجل وسمانة (Legs)', exercisesCount: 5, totalVolume: '4,100 كجم', completedSets: 16, duration: '50 دقيقة' }
            ]
        },

        // Admin
        admin: {
            isUnlocked: false,
            pin: '1234'
        }
    };

    // --- 2. EASTER EGG SECRET ADMIN (4 rapid clicks on FitCraft Logo within 2 seconds) ---
    let _logoClicks = [];
    window.handleLogoEasterEggClick = function() {
        const now = Date.now();
        _logoClicks = _logoClicks.filter(t => now - t <= 2000);
        _logoClicks.push(now);

        const logoBadge = document.getElementById('fitcraftLogoBadge');
        if (logoBadge) {
            logoBadge.classList.add('scale-90');
            setTimeout(() => logoBadge.classList.remove('scale-90'), 150);
        }

        if (_logoClicks.length >= 4) {
            _logoClicks = [];
            if (window.AudioHelper) AudioHelper.playChime('secret');

            const indicator = document.getElementById('secretAdminIndicator');
            if (indicator) {
                indicator.classList.remove('hidden');
                indicator.classList.add('inline-flex');
            }
            const adminTabBtn = document.getElementById('tabBtn-admin');
            if (adminTabBtn) {
                adminTabBtn.classList.remove('hidden');
                adminTabBtn.classList.add('flex');
            }
            switchMainTab('admin');
            showToast('🔓 مبروك! تم فك قفل لوحة الإدارة والتحكم السرية');
            const pinInput = document.getElementById('adminPinInput');
            if (pinInput) setTimeout(() => pinInput.focus(), 300);
        }
    };

    // --- 3. ARABIC VOICE GUIDANCE (Web Speech Synthesis API) ---
    const VoiceGuide = {
        speak(text) {
            if (!STATE.voiceGuideEnabled || !('speechSynthesis' in window)) return;
            try {
                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = 'ar-SA';
                utterance.rate = 0.95;
                utterance.pitch = 1.0;
                const voices = window.speechSynthesis.getVoices();
                const arVoice = voices.find(v => v.lang && v.lang.startsWith('ar'));
                if (arVoice) utterance.voice = arVoice;
                window.speechSynthesis.speak(utterance);
            } catch (e) {
                console.warn('Speech synthesis error:', e);
            }
        },
        toggleVoice() {
            STATE.voiceGuideEnabled = !STATE.voiceGuideEnabled;
            localStorage.setItem('fitcraft_voice_enabled', STATE.voiceGuideEnabled);
            VoiceGuide.updateUI();
            if (STATE.voiceGuideEnabled) {
                if (window.AudioHelper) AudioHelper.playChime('bell');
                showToast('تم تفعيل التوجيه الصوتي العربي 🔊');
                VoiceGuide.speak('تم تفعيل التوجيه الصوتي، استعد لحصة تدريبية قوية');
            } else {
                showToast('تم كتم التوجيه الصوتي 🔇');
            }
        },
        updateUI() {
            const isEn = STATE.voiceGuideEnabled;
            // Header button
            const hIcon = document.getElementById('headerVoiceIcon');
            const hText = document.getElementById('headerVoiceText');
            if (hIcon) hIcon.className = isEn ? 'fa-solid fa-volume-high text-amberGold' : 'fa-solid fa-volume-xmark text-zinc-500';
            if (hText) hText.innerText = isEn ? 'صوتي: مفعل' : 'صوتي: معطل';

            // Active session button
            const aIcon = document.getElementById('activeVoiceIcon');
            const aLabel = document.getElementById('activeVoiceLabel');
            if (aIcon) aIcon.className = isEn ? 'fa-solid fa-volume-high text-amberGold' : 'fa-solid fa-volume-xmark text-zinc-500';
            if (aLabel) aLabel.innerText = isEn ? 'التوجيه الصوتي العربي: مفعل' : 'التوجيه الصوتي: معطل';
        }
    };
    window.toggleVoiceGuide = VoiceGuide.toggleVoice;

    // --- 4. REPETITION TEMPO CADENCE ENGINE (3-1-1-0) ---
    // 3s Eccentric (نزول وتحكم / شهيق) -> 1s Isometric (ثبات وعصر) -> 1s Concentric (صعود وانفجار / زفير) -> 0s Reset
    const TempoCadence = {
        toggle() {
            if (STATE.cadence.isRunning) {
                TempoCadence.pause();
            } else {
                TempoCadence.start();
            }
        },
        start() {
            STATE.cadence.isRunning = true;
            const playIcon = document.getElementById('cadencePlayIcon');
            const btnLabel = document.getElementById('cadenceBtnLabel');
            if (playIcon) playIcon.className = 'fa-solid fa-pause';
            if (btnLabel) btnLabel.innerText = 'إيقاف مؤقت للرتم';

            if (STATE.cadence.phase === 'ready' || STATE.cadence.phase === 'reset') {
                STATE.cadence.currentRep = Math.max(1, STATE.cadence.currentRep + 1);
                TempoCadence.enterPhase('eccentric', 3);
            }

            STATE.cadence.timerId = setInterval(() => {
                STATE.cadence.phaseSeconds--;
                TempoCadence.renderOrb();

                if (STATE.cadence.phaseSeconds <= 0) {
                    TempoCadence.advancePhase();
                }
            }, 1000);
        },
        pause() {
            STATE.cadence.isRunning = false;
            clearInterval(STATE.cadence.timerId);
            const playIcon = document.getElementById('cadencePlayIcon');
            const btnLabel = document.getElementById('cadenceBtnLabel');
            if (playIcon) playIcon.className = 'fa-solid fa-play';
            if (btnLabel) btnLabel.innerText = 'استئناف الرتم';
        },
        reset() {
            TempoCadence.pause();
            STATE.cadence.phase = 'ready';
            STATE.cadence.phaseSeconds = 3;
            STATE.cadence.currentRep = 0;
            TempoCadence.renderOrb();
            const btnLabel = document.getElementById('cadenceBtnLabel');
            if (btnLabel) btnLabel.innerText = 'تشغيل الرتم للعدة';
            showToast('تم تصفير عداد الرتم الزمني');
        },
        advancePhase() {
            if (STATE.cadence.phase === 'eccentric') {
                TempoCadence.enterPhase('isometric', 1);
            } else if (STATE.cadence.phase === 'isometric') {
                TempoCadence.enterPhase('concentric', 1);
            } else if (STATE.cadence.phase === 'concentric') {
                // Completed one full repetition!
                if (window.AudioHelper) AudioHelper.playChime('beep');
                if (STATE.cadence.currentRep >= STATE.cadence.targetReps) {
                    TempoCadence.pause();
                    STATE.cadence.phase = 'ready';
                    VoiceGuide.speak('أحسنت! أكملت عشر عدات برتم مثالي، خذ راحة');
                    showToast('تمت العدات العشر بنجاح! 💪');
                    TempoCadence.renderOrb();
                    return;
                }
                STATE.cadence.currentRep++;
                TempoCadence.enterPhase('eccentric', 3);
            }
        },
        enterPhase(phase, seconds) {
            STATE.cadence.phase = phase;
            STATE.cadence.phaseSeconds = seconds;
            TempoCadence.renderOrb();

            if (phase === 'eccentric') {
                if (window.AudioHelper) AudioHelper.playChime('beep');
                VoiceGuide.speak('شهيق، نزول بطيء 3 ثوانٍ');
            } else if (phase === 'isometric') {
                VoiceGuide.speak('اثبت واعصر');
            } else if (phase === 'concentric') {
                VoiceGuide.speak('ادفع بقوة وازفر');
            }
        },
        renderOrb() {
            const orb = document.getElementById('cadenceVisualOrb');
            const phaseText = document.getElementById('cadencePhaseText');
            const repsDisplay = document.getElementById('cadenceRepsCountDisplay');

            if (repsDisplay) {
                repsDisplay.innerText = 'العدة ' + STATE.cadence.currentRep + ' / ' + STATE.cadence.targetReps;
            }

            if (!orb || !phaseText) return;

            if (STATE.cadence.phase === 'ready') {
                orb.innerText = '3';
                orb.className = 'w-14 h-14 rounded-full bg-amberGold/20 border-2 border-amberGold flex items-center justify-center text-amberGold font-black text-lg font-num transition-all';
                phaseText.innerText = 'جاهز للبدء';
            } else if (STATE.cadence.phase === 'eccentric') {
                orb.innerText = STATE.cadence.phaseSeconds;
                orb.className = 'w-14 h-14 rounded-full bg-amberGold/30 border-2 border-amberGold flex items-center justify-center text-amberGold font-black text-lg font-num transition-all scale-110 shadow-amberGlow';
                phaseText.innerText = 'نزول بطيء وتحكم (شهيق) • ' + STATE.cadence.phaseSeconds + 'ث';
            } else if (STATE.cadence.phase === 'isometric') {
                orb.innerText = '1';
                orb.className = 'w-14 h-14 rounded-full bg-cyberCyan/30 border-2 border-cyberCyan flex items-center justify-center text-cyan-400 font-black text-lg font-num transition-all scale-100';
                phaseText.innerText = 'ثبات وعصر العضلة (Hold) • 1ث';
            } else if (STATE.cadence.phase === 'concentric') {
                orb.innerText = '1';
                orb.className = 'w-14 h-14 rounded-full bg-cyberEmerald/30 border-2 border-cyberEmerald flex items-center justify-center text-cyberEmerald font-black text-lg font-num transition-all scale-125 shadow-emeraldGlow';
                phaseText.innerText = 'دفع وانفجار (زفير) • 1ث';
            }
        }
    };
    window.toggleCadenceTrainer = TempoCadence.toggle;
    window.resetCadenceTrainer = TempoCadence.reset;

    // --- 5. ADAPTIVE MEDIA ENGINE (Videos, GIFs, CDN & Smart Fallbacks) ---
    function isVideoFile(path) {
        if (!path) return false;
        const lower = path.toLowerCase();
        return lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.endsWith('.mov') || lower.endsWith('.m4v');
    }

    function getMediaUrl(filePath) {
        if (!filePath) return '';
        if (filePath.startsWith('http') || filePath.startsWith('data:')) return filePath;

        // Local stretch mobility path
        if (filePath.startsWith('stretch-mobility-gifs/') || filePath.startsWith('./stretch-mobility-gifs/')) {
            const clean = filePath.replace('./stretch-mobility-gifs/', '').replace('stretch-mobility-gifs/', '');
            if (STATE.mediaSource === 'local') {
                return './stretch-mobility-gifs/' + clean;
            }
            return 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/' + clean;
        }

        // Standard gym exercises
        const cleanPath = filePath.startsWith('./') ? filePath.slice(2) : filePath;
        const baseServer = STATE.localServerUrl.endsWith('/') ? STATE.localServerUrl.slice(0, -1) : STATE.localServerUrl;
        if (STATE.mediaSource === 'local') {
            return baseServer + '/gym-exercises/' + cleanPath;
        }
        return 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@main/' + cleanPath;
    }

    window.handleMediaFallback = function(el, muscle = 'general', equipment = 'fitness') {
        if (!el || el.dataset.failed) return;
        el.dataset.failed = 'true';

        // If local mode failed, try CDN immediately
        if (el.tagName === 'IMG' && el.src.includes('localhost')) {
            const match = el.src.split('/gym-exercises/');
            if (match[1]) {
                el.src = 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@main/' + match[1];
                return;
            }
        }

        // Replace with athletic SVG placeholder without breaking layout
        const parent = el.parentElement;
        if (parent) {
            const svgPlaceholder = \`
                <div class="w-full h-full flex flex-col items-center justify-center bg-fitDark-900 border border-white/5 rounded-2xl p-4 text-center space-y-2 select-none">
                    <div class="w-12 h-12 rounded-xl bg-amberGold/15 border border-amberGold/30 text-amberGold flex items-center justify-center text-xl">
                        <i class="fa-solid fa-dumbbell animate-pulse"></i>
                    </div>
                    <span class="text-xs font-bold text-white block">\${muscle}</span>
                    <span class="text-[10px] text-zinc-400 font-num block">\${equipment}</span>
                </div>
            \`;
            parent.innerHTML = svgPlaceholder;
        }
    };

    function renderAdaptiveMedia(filePath, alt = '', className = 'w-full h-full object-contain', extraAttrs = '') {
        const mediaUrl = getMediaUrl(filePath);
        if (isVideoFile(filePath) || isVideoFile(mediaUrl)) {
            return \`<video autoplay loop muted playsinline class="\${className}" \${extraAttrs}
                           onerror="handleMediaFallback(this, 'exercise', 'video')">
                        <source src="\${mediaUrl}" type="video/mp4">
                    </video>\`;
        }
        return \`<img src="\${mediaUrl}" alt="\${alt}" loading="lazy" class="\${className}" \${extraAttrs}
                     onerror="handleMediaFallback(this, 'exercise', 'gif')">\`;
    }

    // --- 6. EQUIPMENT CATALOG & CLASSIFICATION ---
    const EQUIPMENT_CATALOG = [
        { id: 'lat-pulldown', name: 'جهاز سحب الظهر العالي', nameEn: 'Lat Pulldown', icon: 'equipment-icons/lat-pulldown.svg', target: 'الظهر والمجنص', matches: ['lat pulldown', 'pulldown', 'cable lat'] },
        { id: 'chest-press', name: 'جهاز دفع الصدر جالس', nameEn: 'Chest Press', icon: 'equipment-icons/chest-press.svg', target: 'الصدر والترايسبس', matches: ['chest press', 'seated chest', 'lever chest'] },
        { id: 'leg-press', name: 'دفع الأرجل 45 والهاك سكوات', nameEn: 'Leg Press 45°', icon: 'equipment-icons/leg-press.svg', target: 'الفخذ والمؤخرة', matches: ['leg press', 'hack squat', 'sled'] },
        { id: 'leg-extension-curl', name: 'تمديد وثني الأرجل', nameEn: 'Leg Extension & Curl', icon: 'equipment-icons/leg-extension-curl.svg', target: 'الفخذ الأمامي والخلفي', matches: ['leg extension', 'leg curl'] },
        { id: 'pec-deck', name: 'جهاز الفراشة وتفتيح الصدر', nameEn: 'Pec Deck Fly', icon: 'equipment-icons/pec-deck.svg', target: 'الصدر والكتف الخلفي', matches: ['pec deck', 'butterfly', 'reverse fly'] },
        { id: 'smith-machine', name: 'جهاز سميث الموجه', nameEn: 'Smith Machine', icon: 'equipment-icons/smith-machine.svg', target: 'سكوات ودفع الصدر', matches: ['smith'] },
        { id: 'cable-crossover', name: 'محطة الكابلات المتقاطعة', nameEn: 'Cable Crossover', icon: 'equipment-icons/cable-crossover.svg', target: 'الصدر والكتف والذراعين', matches: ['cable crossover', 'cross over', 'functional'] },
        { id: 'pulleys', name: 'البكرات العلوية والسفلية', nameEn: 'High & Low Pulley', icon: 'equipment-icons/pulleys.svg', target: 'الذراعين والظهر والأكتاف', matches: ['cable', 'pulley'] },
        { id: 'free-weights', name: 'الأوزان الحرة والمقاعد', nameEn: 'Free Weights & Bench', icon: 'equipment-icons/free-weights.svg', target: 'كافة المجموعات العضلية', matches: ['dumbbell', 'barbell', 'kettlebell', 'bench'] },
        { id: 'bodyweight-tower', name: 'برج وزن الجسم والعقلة', nameEn: 'Power Tower & Dip', icon: 'equipment-icons/bodyweight-tower.svg', target: 'العقلة والمتوازي والكور', matches: ['bodyweight', 'pull-up', 'chin-up', 'dip', 'body weight', 'none'] }
    ];

    // --- 7. SEED EXERCISES WITH COMPREHENSIVE ALTERNATIVES ---
    const SEED_EXERCISES = [
        {
            id: 'chest-1',
            name: 'ضغط الصدر بالبار مستوي (Bench Press)',
            nameEn: 'Barbell Bench Press',
            muscle: 'chest',
            muscleNameAr: 'عضلة الصدر بالكامل',
            equipment: 'free-weights',
            difficulty: 'متوسط',
            file: 'pectorals/barbell-bench-press.gif',
            contraindicatedFor: ['shoulder', 'wrist'],
            instructions: ['استلقِ على المقعد المستوي وثبت قدميك بالأرض.', 'أمسك البار بقبضة أوسع من الكتفين بقليل.', 'انزل بالبار بهدوء حتى يلامس منتصف الصدر مع الحفاظ على زاوية الكوعين 45 درجة.', 'ادفع البار بقوة للأعلى مع عصر الصدر في القمة.'],
            alternatives: {
                machine: { id: 'chest-2', name: 'دفع الصدر جالس بالجهاز الميكانيكي', equipment: 'chest-press' },
                cable: { id: 'chest-4', name: 'تقاطع الكابلات من أعلى لأسفل (Cable Crossover)', equipment: 'cable-crossover' },
                free: { id: 'chest-5', name: 'ضغط الصدر بالدمبلز على مقعد مستوي', equipment: 'free-weights' },
                bodyweight: { id: 'chest-6', name: 'تمرين الضغط الكلاسيكي (Push-ups)', equipment: 'bodyweight-tower' }
            }
        },
        {
            id: 'chest-2',
            name: 'دفع الصدر جالس بالجهاز الميكانيكي',
            nameEn: 'Seated Machine Chest Press',
            muscle: 'chest',
            muscleNameAr: 'عضلة الصدر والكتف الأمامي',
            equipment: 'chest-press',
            difficulty: 'مبتدئ',
            file: 'pectorals/cable-seated-chest-press.gif',
            contraindicatedFor: [],
            instructions: ['اضبط ارتفاع المقعد لتكون المقابض بمحاذاة منتصف الصدر.', 'ادفع للأمام بسلاسة وازفر مع عصر الصدر.', 'تحكم في حركة الرجوع دون السماح للأوزان بالتصادم.'],
            alternatives: {
                machine: { id: 'chest-3', name: 'تجميع الصدر بجهاز الفراشة (Pec Deck)', equipment: 'pec-deck' },
                cable: { id: 'chest-4', name: 'تقاطع الكابلات بالبكرة العلوية', equipment: 'cable-crossover' },
                free: { id: 'chest-1', name: 'ضغط الصدر بالبار مستوي', equipment: 'free-weights' },
                bodyweight: { id: 'chest-6', name: 'تمرين الضغط بوزن الجسم', equipment: 'bodyweight-tower' }
            }
        },
        {
            id: 'chest-3',
            name: 'تجميع الصدر بجهاز الفراشة (Pec Deck)',
            nameEn: 'Pec Deck Chest Fly',
            muscle: 'chest',
            muscleNameAr: 'عضلة الصدر وعزل الألياف الداخلية',
            equipment: 'pec-deck',
            difficulty: 'مبتدئ',
            file: 'delts/cable-cross-over-revers-fly.gif',
            contraindicatedFor: [],
            instructions: ['ثبت ظهرك بالمسند واثنِ الكوعين ثنياً طفيفاً.', 'اجمع الذراعين في قوس واسع واعصر الصدر لثانية في المنتصف.', 'ارجع ببطء لتحقيق أقصى تمدد عضلي.'],
            alternatives: {
                machine: { id: 'chest-2', name: 'دفع الصدر جالس بالجهاز', equipment: 'chest-press' },
                cable: { id: 'chest-4', name: 'تفتيح الكابلات المتقاطعة', equipment: 'cable-crossover' },
                free: { id: 'chest-5', name: 'تفتيح الصدر بالدمبلز مستلقياً', equipment: 'free-weights' },
                bodyweight: { id: 'chest-6', name: 'تمرين الضغط بقبضة واسعة', equipment: 'bodyweight-tower' }
            }
        },
        {
            id: 'chest-4',
            name: 'تقاطع الكابلات من أعلى لأسفل (Cable Crossover)',
            nameEn: 'Cable Crossover High to Low',
            muscle: 'chest',
            muscleNameAr: 'أسفل الصدر والألياف الداخلية',
            equipment: 'cable-crossover',
            difficulty: 'متوسط',
            file: 'pectorals/cable-cross-over-variation.gif',
            contraindicatedFor: [],
            instructions: ['تقدم خطوة للأمام لتحقيق شد دائم على الكيبل.', 'اسحب المقابض للأسفل وللداخل حتى تلتقي اليدان أمام الحوض.', 'اعصر الصدر السفلي لثانية ثم عد ببطء.'],
            alternatives: {
                machine: { id: 'chest-3', name: 'جهاز الفراشة Pec Deck', equipment: 'pec-deck' },
                cable: { id: 'chest-4', name: 'تقاطع كابلات سفلي', equipment: 'pulleys' },
                free: { id: 'chest-1', name: 'ضغط الصدر بالبار', equipment: 'free-weights' },
                bodyweight: { id: 'chest-7', name: 'المتوازي المائل للصدر (Chest Dips)', equipment: 'bodyweight-tower' }
            }
        },
        {
            id: 'chest-5',
            name: 'ضغط الصدر بالدمبلز على مقعد مستوي',
            nameEn: 'Dumbbell Flat Bench Press',
            muscle: 'chest',
            muscleNameAr: 'الصدر الأوسط والألياف الخارجية',
            equipment: 'free-weights',
            difficulty: 'متوسط',
            file: 'pectorals/barbell-bench-press.gif',
            contraindicatedFor: [],
            instructions: ['انزل بالدمبلز بزاوية 45 درجة حتى تشعر باستطالة الصدر.', 'ادفع للأعلى واقترب بالدمبلز دون تصادمهما.'],
            alternatives: {
                machine: { id: 'chest-2', name: 'جهاز دفع الصدر جالس', equipment: 'chest-press' },
                cable: { id: 'chest-4', name: 'تقاطع الكابلات', equipment: 'cable-crossover' },
                free: { id: 'chest-1', name: 'ضغط الصدر بالبار', equipment: 'free-weights' },
                bodyweight: { id: 'chest-6', name: 'تمرين الضغط Push-ups', equipment: 'bodyweight-tower' }
            }
        },
        {
            id: 'chest-6',
            name: 'تمرين الضغط الكلاسيكي (Push-ups)',
            nameEn: 'Classic Bodyweight Push-up',
            muscle: 'chest',
            muscleNameAr: 'الصدر والكور والترايسبس',
            equipment: 'bodyweight-tower',
            difficulty: 'مبتدئ',
            file: 'pectorals/behind-head-chest-stretch.gif',
            contraindicatedFor: ['wrist'],
            instructions: ['ضع يديك بعرض الكتفين مع استقامة كاملة للجسم.', 'انزل حتى يقترب صدرك من الأرض ثم ادفع بقوة.'],
            alternatives: {
                machine: { id: 'chest-2', name: 'جهاز دفع الصدر Seated Press', equipment: 'chest-press' },
                cable: { id: 'chest-4', name: 'دفع الكابلات واقفاً', equipment: 'pulleys' },
                free: { id: 'chest-5', name: 'ضغط الدمبلز مستوي', equipment: 'free-weights' },
                bodyweight: { id: 'chest-7', name: 'تمرين المتوازي Dips', equipment: 'bodyweight-tower' }
            }
        },
        {
            id: 'back-1',
            name: 'سحب الظهر العالي قبضة واسعة (Lat Pulldown)',
            nameEn: 'Wide Grip Lat Pulldown',
            muscle: 'back',
            muscleNameAr: 'عضلة المجنص وعرض الظهر',
            equipment: 'lat-pulldown',
            difficulty: 'مبتدئ',
            file: 'lats/cable-lat-pulldown-full-range-of-motion.gif',
            contraindicatedFor: [],
            instructions: ['أمسك البار أوسع من الكتفين وثبت فخذيك تحت الوسائد.', 'اسحب البار لأسفل باتجاه أعلى الصدر مع إرجاع الكتفين للخلف.', 'تجنب التأرجح المفرط بالجذع واعصر المجنص جيداً.'],
            alternatives: {
                machine: { id: 'back-4', name: 'جهاز سحب الظهر الميكانيكي مسنود الصدر', equipment: 'lat-pulldown' },
                cable: { id: 'back-2', name: 'تجديف سحب أرضي بالكيبل (Seated Cable Row)', equipment: 'pulleys' },
                free: { id: 'back-5', name: 'تجديف الدمبل الفردي على المقعد (Dumbbell Row)', equipment: 'free-weights' },
                bodyweight: { id: 'back-3', name: 'تمرين العقلة وزن الجسم (Pull-ups)', equipment: 'bodyweight-tower' }
            }
        },
        {
            id: 'back-2',
            name: 'تجديف سحب أرضي بالكيبل (Seated Cable Row)',
            nameEn: 'Seated Cable Row V-Bar',
            muscle: 'back',
            muscleNameAr: 'سماكة الظهر والترابيس الوسطى',
            equipment: 'pulleys',
            difficulty: 'متوسط',
            file: 'upper-back/cable-low-seated-row.gif',
            contraindicatedFor: [],
            instructions: ['اجلس بظهر مستقيم وثني خفيف في الركبتين.', 'اسحب المقبض باتجاه السرة مع ضم لوحي الكتف للخلف.', 'ارجع ببطء مع استطالة عضلات الظهر دون انحناء العمود الفقري.'],
            alternatives: {
                machine: { id: 'back-1', name: 'جهاز سحب المجنص العالي', equipment: 'lat-pulldown' },
                cable: { id: 'back-6', name: 'سحب الكابل الفردي للظهر', equipment: 'pulleys' },
                free: { id: 'back-5', name: 'تجديف بالدمبل الفردي مسنود الركبة', equipment: 'free-weights' },
                bodyweight: { id: 'back-7', name: 'تمرين العقلة الأفقية المعكوسة (Inverted Row)', equipment: 'bodyweight-tower' }
            }
        },
        {
            id: 'back-3',
            name: 'تمرين العقلة وزن الجسم (Pull-ups)',
            nameEn: 'Bodyweight Pull-ups',
            muscle: 'back',
            muscleNameAr: 'الظهر العلوي والمجنص وقوة السحب',
            equipment: 'bodyweight-tower',
            difficulty: 'متقدم',
            file: 'lats/archer-pull-up.gif',
            contraindicatedFor: ['shoulder'],
            instructions: ['تعلق بالبار بقبضة واسعة.', 'اسحب صدرك للأعلى باتجاه البار حتى تتجاوز ذقنك العارضة.', 'انزل ببطء لتحقيق استطالة كاملة.'],
            alternatives: {
                machine: { id: 'back-1', name: 'جهاز سحب الظهر العالي Lat Pulldown', equipment: 'lat-pulldown' },
                cable: { id: 'back-2', name: 'تجديف السحب الأرضي بالبكرة', equipment: 'pulleys' },
                free: { id: 'back-5', name: 'تجديف الدمبل الفردي', equipment: 'free-weights' },
                bodyweight: { id: 'back-7', name: 'عقلة أسترالية منخفضة (Inverted Row)', equipment: 'bodyweight-tower' }
            }
        },
        {
            id: 'back-5',
            name: 'تجديف الدمبل الفردي مسنود الركبة (One-Arm Dumbbell Row)',
            nameEn: 'One-Arm Dumbbell Row',
            muscle: 'back',
            muscleNameAr: 'المجنص وأسفل الظهر الداعم',
            equipment: 'free-weights',
            difficulty: 'متوسط',
            file: 'upper-back/cable-low-seated-row.gif',
            contraindicatedFor: [],
            instructions: ['ثبت ركبة ويد على المقعد مع استقامة الظهر موازياً للأرض.', 'اسحب الدمبل باتجاه الحوض مع ضم الكوع للجذع.'],
            alternatives: {
                machine: { id: 'back-1', name: 'سحب الظهر العالي بالجهاز', equipment: 'lat-pulldown' },
                cable: { id: 'back-2', name: 'تجديف الكابل الأرضي', equipment: 'pulleys' },
                free: { id: 'back-8', name: 'تجديف البار الحر Bent-over Row', equipment: 'free-weights' },
                bodyweight: { id: 'back-3', name: 'العقلة وزن الجسم', equipment: 'bodyweight-tower' }
            }
        },
        {
            id: 'legs-1',
            name: 'دفع الأرجل بزاوية 45 درجة (Leg Press)',
            nameEn: 'Leg Press 45 Degree',
            muscle: 'legs',
            muscleNameAr: 'الفخذ الأمامي والمؤخرة',
            equipment: 'leg-press',
            difficulty: 'متوسط',
            file: 'quads/lever-seated-squat.gif',
            contraindicatedFor: [],
            instructions: ['ضع قدميك بعرض الكتفين في منتصف المنصة.', 'أنزل المنصة حتى تصبح الركبتان بزاوية 90 درجة تقريباً.', 'ادفع بالكعبين دون قفل مفصل الركبة في النهاية.'],
            alternatives: {
                machine: { id: 'legs-3', name: 'تمديد الأرجل جالس (Leg Extension)', equipment: 'leg-extension-curl' },
                cable: { id: 'legs-5', name: 'سحب الكابل الخلفي للجلوتس (Cable Kickback)', equipment: 'pulleys' },
                free: { id: 'legs-6', name: 'سكوات الكأس بالدمبل (Goblet Squat)', equipment: 'free-weights' },
                bodyweight: { id: 'legs-7', name: 'سكوات وزن الجسم (Bodyweight Squat)', equipment: 'bodyweight-tower' }
            }
        },
        {
            id: 'legs-2',
            name: 'سكوات بجهاز سميث الموجه (Smith Squat)',
            nameEn: 'Smith Machine Squat',
            muscle: 'legs',
            muscleNameAr: 'الفخذين وعضلات الحوض',
            equipment: 'smith-machine',
            difficulty: 'متوسط',
            file: 'quads/smith-squat.gif',
            contraindicatedFor: ['lower_back', 'knee'],
            instructions: ['ضع البار فوق عضلات الترابيس.', 'انزل بالحوض للخلف والأسفل كأنك تجلس على كرسي.', 'ادفع بكعبيك للأعلى مع الحفاظ على استقامة الظهر.'],
            alternatives: {
                machine: { id: 'legs-1', name: 'جهاز دفع الأرجل 45 درجة (أمان تام للظهر)', equipment: 'leg-press' },
                cable: { id: 'legs-5', name: 'سحب الكابل للجلوتس', equipment: 'pulleys' },
                free: { id: 'legs-6', name: 'سكوات الكأس بالدمبل مسنود الكعب', equipment: 'free-weights' },
                bodyweight: { id: 'legs-7', name: 'سكوات وزن الجسم البطيء', equipment: 'bodyweight-tower' }
            }
        },
        {
            id: 'legs-3',
            name: 'تمديد الأرجل جالس بالجهاز (Leg Extension)',
            nameEn: 'Seated Leg Extension Machine',
            muscle: 'legs',
            muscleNameAr: 'الفخذ الأمامي وعزل الكوادز',
            equipment: 'leg-extension-curl',
            difficulty: 'مبتدئ',
            file: 'quads/lever-leg-extension.gif',
            contraindicatedFor: ['knee'],
            instructions: ['ثبت ظهرك واضبط الوسادة فوق الكاحلين مباشرة.', 'ارفع الوزن حتى الاستقامة الكاملة واعصر الفخذ لثانية.', 'انزل ببطء وتحكم.'],
            alternatives: {
                machine: { id: 'legs-1', name: 'دفع الأرجل 45 درجة Leg Press', equipment: 'leg-press' },
                cable: { id: 'legs-5', name: 'سحب الكابل الأمامي للكوادز', equipment: 'pulleys' },
                free: { id: 'legs-6', name: 'لانجز الطعن بالدمبلز', equipment: 'free-weights' },
                bodyweight: { id: 'legs-7', name: 'سكوات الحائط الثابت Wall Sit', equipment: 'bodyweight-tower' }
            }
        },
        {
            id: 'legs-4',
            name: 'ثني الأرجل مستلقياً (Lying Leg Curl)',
            nameEn: 'Lying Leg Curl Machine',
            muscle: 'legs',
            muscleNameAr: 'الفخذ الخلفي (Hamstrings)',
            equipment: 'leg-extension-curl',
            difficulty: 'مبتدئ',
            file: 'hamstrings/lever-lying-leg-curl.gif',
            contraindicatedFor: [],
            instructions: ['استلقِ على بطنك وضع الوسادة أسفل عضلات السمانة.', 'اثنِ الساقين للأعلى باتجاه المؤخرة مع تثبيت الحوض.', 'ارجع ببطء وتحكم.'],
            alternatives: {
                machine: { id: 'legs-1', name: 'دفع الأرجل مع وضع القدمين أعلى المنصة', equipment: 'leg-press' },
                cable: { id: 'legs-5', name: 'ثني الساق بالكيبل مع حزام الكاحل', equipment: 'pulleys' },
                free: { id: 'legs-8', name: 'ديدليفت روماني بالدمبلز (Romanian Deadlift)', equipment: 'free-weights' },
                bodyweight: { id: 'legs-9', name: 'جسر المؤخرة برجل واحدة Glute Bridge', equipment: 'bodyweight-tower' }
            }
        },
        {
            id: 'shoulders-1',
            name: 'ضغط الأكتاف جالس بالجهاز (Machine Shoulder Press)',
            nameEn: 'Seated Machine Shoulder Press',
            muscle: 'shoulders',
            muscleNameAr: 'الكتف الأمامي والجانبي',
            equipment: 'smith-machine',
            difficulty: 'مبتدئ',
            file: 'delts/smith-seated-shoulder-press.gif',
            contraindicatedFor: ['shoulder'],
            instructions: ['اضبط المقعد لتكون المقابض بمحاذاة الأذنين.', 'ادفع للأعلى دون قفل مفصل الكوع.', 'انزل ببطء حتى مستوى الذقن.'],
            alternatives: {
                machine: { id: 'shoulders-3', name: 'جهاز دفع الأكتاف الميكانيكي بقبضة محايدة', equipment: 'smith-machine' },
                cable: { id: 'shoulders-4', name: 'رفع جانبي بالكيبل (Cable Lateral Raise)', equipment: 'pulleys' },
                free: { id: 'shoulders-5', name: 'ضغط الأكتاف بالدمبلز بقبضة محايدة', equipment: 'free-weights' },
                bodyweight: { id: 'shoulders-6', name: 'ضغط البايك بوزن الجسم (Pike Push-ups)', equipment: 'bodyweight-tower' }
            }
        },
        {
            id: 'shoulders-2',
            name: 'رفرفة جانبي بالكيبل الفردي (Cable Lateral Raise)',
            nameEn: 'Single Arm Cable Lateral Raise',
            muscle: 'shoulders',
            muscleNameAr: 'تدوير الكتف الجانبي وعرض الأكتاف',
            equipment: 'pulleys',
            difficulty: 'متوسط',
            file: 'delts/cable-one-arm-lateral-raise.gif',
            contraindicatedFor: [],
            instructions: ['اضبط البكرة عند أدنى مستوى وقف بجانبها.', 'ارفع الذراع جانباً حتى مستوى الكتف مع ثني خفيف في الكوع.', 'انزل ببطء لمقاومة الشد المستمر.'],
            alternatives: {
                machine: { id: 'shoulders-1', name: 'جهاز الأكتاف Seated Press', equipment: 'smith-machine' },
                cable: { id: 'shoulders-4', name: 'رفرفة الكابل المتقاطع خلف الظهر', equipment: 'cable-crossover' },
                free: { id: 'shoulders-7', name: 'رفرفة جانبية بالدمبلز جالساً', equipment: 'free-weights' },
                bodyweight: { id: 'shoulders-6', name: 'بلانك جانبي مع تفعيل الكتف', equipment: 'bodyweight-tower' }
            }
        },
        {
            id: 'arms-1',
            name: 'دفع الترايسبس بالبكرة العلوية بالحبل (Triceps Pushdown)',
            nameEn: 'Cable Rope Triceps Pushdown',
            muscle: 'arms',
            muscleNameAr: 'عضلة الترايسبس والرأس الخارجي',
            equipment: 'pulleys',
            difficulty: 'مبتدئ',
            file: 'triceps/cable-triceps-pushdown.gif',
            contraindicatedFor: [],
            instructions: ['ثبت الكوعين بجانبي القفص الصدري.', 'ادفع الحبل لأسفل وافرد الطرفين في أقصى نقطة لعصر الترايسبس.', 'عد بنصف الذراع للأعلى ببطء.'],
            alternatives: {
                machine: { id: 'arms-3', name: 'جهاز دفع الترايسبس الميكانيكي Dip Machine', equipment: 'chest-press' },
                cable: { id: 'arms-4', name: 'مد الترايسبس فوق الرأس بالكيبل', equipment: 'pulleys' },
                free: { id: 'arms-5', name: 'كسار الجمجمة بالدمبلز مستلقياً', equipment: 'free-weights' },
                bodyweight: { id: 'arms-6', name: 'تمرين المتوازي بالقبضة الضيقة (Triceps Dips)', equipment: 'bodyweight-tower' }
            }
        },
        {
            id: 'arms-2',
            name: 'كيرل البايسبس بالكيبل المستقيم (Cable Biceps Curl)',
            nameEn: 'Standing Cable Biceps Curl',
            muscle: 'arms',
            muscleNameAr: 'عضلة البايسبس وقمة الذراع',
            equipment: 'pulleys',
            difficulty: 'مبتدئ',
            file: 'biceps/cable-biceps-curl.gif',
            contraindicatedFor: [],
            instructions: ['قف مستقيماً وثبت الكوعين.', 'اسحب البار باتجاه الصدر واعصر البايسبس في القمة.', 'انزل ببطء لمقاومة الجاذبية والكيبل.'],
            alternatives: {
                machine: { id: 'arms-7', name: 'جهاز البايسبس الميكانيكي مسنود الكوعين (Preacher Machine)', equipment: 'smith-machine' },
                cable: { id: 'arms-8', name: 'كيرل الكابل الفردي بالحبل Hammer Curl', equipment: 'pulleys' },
                free: { id: 'arms-9', name: 'كيرل البايسبس بالدمبلز متبادل', equipment: 'free-weights' },
                bodyweight: { id: 'arms-10', name: 'عقلة قبضة معكوسة ضيقة (Chin-ups)', equipment: 'bodyweight-tower' }
            }
        },
        {
            id: 'abs-1',
            name: 'طحن البطن بالكيبل جالس (Cable Crunch)',
            nameEn: 'Kneeling Cable Rope Crunch',
            muscle: 'abs',
            muscleNameAr: 'عضلات البطن الستة (Six Packs)',
            equipment: 'pulleys',
            difficulty: 'متوسط',
            file: 'abs/cable-kneeling-crunch.gif',
            contraindicatedFor: [],
            instructions: ['اركع أمام البكرة العلوية وأمسك الحبل بجانب أذنيك.', 'اثنِ جذعك للأسفل كأنك تضم ضلوعك لحوضك مع عصر البطن.', 'ارجع ببطء لتحقيق استطالة دون تحريك الوركين.'],
            alternatives: {
                machine: { id: 'abs-2', name: 'جهاز البطن الميكانيكي Seated Ab Machine', equipment: 'smith-machine' },
                cable: { id: 'abs-3', name: 'سحب الكابل المائل للحزام (Woodchopper)', equipment: 'pulleys' },
                free: { id: 'abs-4', name: 'طحن البطن مع حمل وزن خفيف', equipment: 'free-weights' },
                bodyweight: { id: 'abs-5', name: 'رفع الأرجل معلقاً بالعقلة (Hanging Leg Raise)', equipment: 'bodyweight-tower' }
            }
        }
    ];

    // Embed Stretch & Mobility Dataset (202 exercises from hasaneyldrm/exercises-dataset)
    const STRETCH_MOBILITY_DATASET = ${JSON.stringify(stretchData)};

    // Embed Looping Open Videos from wger
    const WGER_VIDEOS_DATASET = ${JSON.stringify(wgerVideos)};

    // --- 8. INITIALIZATION ---
    window.addEventListener('DOMContentLoaded', async () => {
        console.log('FitCraft 2.0 Engine Loaded with 8 core pillars.');

        VoiceGuide.updateUI();
        renderEquipmentCatalog();
        renderGeneratorEquipmentCheckboxes();
        renderProfileDetails();
        renderStretchingCards('all');
        renderProPrograms('all');
        updateActiveWorkoutUI();
        renderActiveSessionView();

        // Load exercises data
        await loadAllExercisesData();

        // Search inputs
        const gSearch = document.getElementById('globalSearchInput');
        if (gSearch) {
            gSearch.addEventListener('input', (e) => {
                STATE.searchQuery = e.target.value.trim();
                toggleClearSearchBtn(STATE.searchQuery);
                applyFiltersAndRender(true);
            });
        }
        const mSearch = document.getElementById('mobileSearchInput');
        if (mSearch) {
            mSearch.addEventListener('input', (e) => {
                STATE.searchQuery = e.target.value.trim();
                applyFiltersAndRender(true);
            });
        }
    });

    // --- 9. TAB NAVIGATION SYSTEM (7 Primary Gym Tabs + Admin) ---
    window.switchMainTab = function(tabName) {
        STATE.currentTab = tabName;

        // Highlight Active Tab in Top Athletic Gym Nav
        document.querySelectorAll('.tab-btn').forEach(btn => {
            if (btn.id === 'tabBtn-' + tabName) {
                btn.className = 'tab-btn shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 bg-amberGold text-black shadow-amberGlow';
            } else if (btn.id !== 'tabBtn-admin') {
                btn.className = 'tab-btn shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 text-zinc-400 hover:text-white hover:bg-fitDark-800';
            }
        });

        // Toggle Section Views
        const viewIds = ['equipment_hub', 'stretching', 'breathwork', 'programs', 'generator', 'active_session', 'profile', 'admin'];
        viewIds.forEach(id => {
            const el = document.getElementById('view-' + id);
            if (el) {
                if (id === tabName) el.classList.remove('hidden');
                else el.classList.add('hidden');
            }
        });

        // Tab-specific lifecycle activations
        if (tabName === 'active_session') {
            renderActiveSessionView();
            updateActiveWorkoutUI();
            VoiceGuide.updateUI();
        } else if (tabName === 'profile') {
            renderProfileDetails();
        } else if (tabName === 'admin') {
            updateAdminStats();
            renderCustomExercisesTable();
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // --- 10. LOAD DATA (Local Storage DB & Fallback Engine) ---
    async function loadAllExercisesData() {
        let loaded = [];

        // 1. Try reading from localStorage
        try {
            const cachedDbStr = localStorage.getItem('fitcraft_exercises_db');
            if (cachedDbStr) {
                const parsed = JSON.parse(cachedDbStr);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    loaded = parsed;
                    console.log('Loaded ' + loaded.length + ' exercises from localStorage.');
                }
            }
        } catch (e) {
            console.warn('Error reading fitcraft_exercises_db:', e);
        }

        // 2. Fallback to API / local server or rich SEED
        if (loaded.length === 0) {
            try {
                const baseSrv = STATE.localServerUrl.endsWith('/') ? STATE.localServerUrl.slice(0, -1) : STATE.localServerUrl;
                const url = STATE.mediaSource === 'local'
                    ? (baseSrv + '/gym-exercises/api/en/exercises.json')
                    : 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@main/api/en/exercises.json';

                const res = await fetch(url, { cache: 'no-cache' });
                if (res.ok) {
                    const data = await res.json();
                    const list = Array.isArray(data) ? data : (data.exercises || []);
                    if (list.length > 0) {
                        loaded = normalizeImportedExercises(list);
                    }
                }
            } catch (err) {
                console.warn('Network fetch error, utilizing built-in seed dataset:', err);
            }
        }

        // 3. Ensure SEED exercises and Wger videos are merged
        if (loaded.length === 0) {
            loaded = [...SEED_EXERCISES];
        } else {
            SEED_EXERCISES.forEach(seed => {
                if (!loaded.some(e => e.id === seed.id)) {
                    loaded.unshift(seed);
                }
            });
        }

        // Append wger looping videos as video exercises
        if (WGER_VIDEOS_DATASET && WGER_VIDEOS_DATASET.length > 0) {
            WGER_VIDEOS_DATASET.forEach((wv, i) => {
                const vidEx = {
                    id: 'wger-' + (wv.id || i),
                    name: 'فيديو واقعي: ' + wv.name,
                    nameEn: wv.name,
                    muscle: (wv.category || 'back').toLowerCase(),
                    muscleNameAr: wv.category || 'الظهر والأرجل',
                    equipment: 'free-weights',
                    difficulty: 'متوسط',
                    file: wv.videoUrl,
                    instructions: ['شاهد التكنيك الحركي في الفيديو القصير المكرر.', 'تنفس بانتظام واضبط المسار الحركي.'],
                    contraindicatedFor: []
                };
                if (!loaded.some(e => e.id === vidEx.id)) {
                    loaded.push(vidEx);
                }
            });
        }

        STATE.allExercises = loaded;
        try {
            localStorage.setItem('fitcraft_exercises_db', JSON.stringify(STATE.allExercises));
        } catch (e) {}

        const heroCount = document.getElementById('heroExerciseCounter');
        const hubCount = document.getElementById('hubExercisesCount');
        const headerBadge = document.getElementById('headerTotalBadge');
        if (heroCount) heroCount.innerText = STATE.allExercises.length.toLocaleString('en-US');
        if (hubCount) hubCount.innerText = STATE.allExercises.length.toLocaleString('en-US');
        if (headerBadge) headerBadge.innerText = STATE.allExercises.length.toLocaleString('en-US') + ' تمرين';

        applyFiltersAndRender(true);
    }

    function normalizeImportedExercises(rawList) {
        return rawList.map((item, idx) => {
            const eqId = detectEquipmentId(item.name || '', item.equipment || '');
            const muscleId = detectMuscleId(item.muscle || item.target || '');
            return {
                id: item.id || ('ex-' + idx),
                name: item.name || item.title || 'تمرين رياضي',
                nameEn: item.nameEn || item.name || '',
                muscle: muscleId,
                muscleNameAr: getMuscleArabicName(muscleId),
                equipment: eqId,
                difficulty: item.difficulty || 'متوسط',
                file: item.file || item.gifUrl || item.path || '',
                instructions: item.instructions || [
                    'اضبط الجهاز وتأكد من محاذاة المفاصل.',
                    'قم بأداء الحركة بتحكم كامل مع عصر العضلة في أقصى نقطة.',
                    'تنفس بانتظام مع الزفير أثناء الدفع والشهيق أثناء النزول.'
                ],
                contraindicatedFor: item.contraindicatedFor || []
            };
        });
    }

    function detectEquipmentId(name, eqStr) {
        const str = (name + ' ' + eqStr).toLowerCase();
        for (const cat of EQUIPMENT_CATALOG) {
            for (const match of cat.matches) {
                if (str.includes(match)) return cat.id;
            }
        }
        return 'free-weights';
    }

    function detectMuscleId(mStr) {
        const s = mStr.toLowerCase();
        if (s.includes('chest') || s.includes('pect')) return 'chest';
        if (s.includes('back') || s.includes('lat') || s.includes('trap')) return 'back';
        if (s.includes('leg') || s.includes('quad') || s.includes('ham') || s.includes('glute') || s.includes('calf')) return 'legs';
        if (s.includes('shoulder') || s.includes('delt')) return 'shoulders';
        if (s.includes('bicep') || s.includes('tricep') || s.includes('arm')) return 'arms';
        if (s.includes('ab') || s.includes('core')) return 'abs';
        return 'chest';
    }

    function getMuscleArabicName(m) {
        const map = {
            chest: 'الصدر والألياف الأمامية',
            back: 'الظهر والمجنص والترابيس',
            legs: 'الأرجل والكوادز والجلوتس',
            shoulders: 'الأكتاف وتدوير الذراع',
            arms: 'البايسبس والترايسبس والساعد',
            abs: 'عضلات البطن والكور'
        };
        return map[m] || 'كافة العضلات';
    }

    // --- 11. EQUIPMENT CATALOG RENDERING ---
    function renderEquipmentCatalog() {
        const grid = document.getElementById('equipmentCatalogGrid');
        if (!grid) return;
        grid.innerHTML = '';

        EQUIPMENT_CATALOG.forEach(eq => {
            const isSelected = STATE.selectedEquipment.has(eq.id);
            const card = document.createElement('div');
            card.className = 'glass-card rounded-2xl p-3 sm:p-4 cursor-pointer transition-all border flex flex-col justify-between ' + (
                isSelected 
                    ? 'border-amberGold bg-amberGold/15 shadow-amberGlow' 
                    : 'border-white/5 bg-fitDark-900/60 hover:border-white/20'
            );
            card.onclick = () => toggleEquipmentFilter(eq.id);

            card.innerHTML = \`
                <div class="space-y-2">
                    <div class="flex items-center justify-between">
                        <div class="w-8 h-8 rounded-lg bg-fitDark-800 p-1.5 flex items-center justify-center border border-white/5">
                            <img src="\${eq.icon}" alt="\${eq.name}" class="w-full h-full object-contain filter invert opacity-80"
                                 onerror="this.src='icons/icon-vector.svg'">
                        </div>
                        <span class="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black \${isSelected ? 'bg-amberGold text-black' : 'bg-fitDark-800 text-zinc-500'}">
                            \${isSelected ? '✓' : ''}
                        </span>
                    </div>
                    <div>
                        <h4 class="font-bold text-white text-xs leading-snug">\${eq.name}</h4>
                        <p class="text-[10px] text-zinc-400 font-num mt-0.5">\${eq.nameEn}</p>
                    </div>
                </div>
                <div class="mt-2 text-[10px] text-amberGold/80 font-bold">
                    \${eq.target}
                </div>
            \`;
            grid.appendChild(card);
        });
    }

    window.toggleEquipmentFilter = function(eqId) {
        if (STATE.selectedEquipment.has(eqId)) {
            STATE.selectedEquipment.delete(eqId);
        } else {
            STATE.selectedEquipment.add(eqId);
        }
        renderEquipmentCatalog();
        applyFiltersAndRender(true);
    };

    window.clearEquipmentFilters = function() {
        STATE.selectedEquipment.clear();
        renderEquipmentCatalog();
        applyFiltersAndRender(true);
    };

    window.filterByMuscle = function(m) {
        STATE.selectedMuscle = m;
        document.querySelectorAll('.muscle-chip').forEach(btn => {
            if (btn.getAttribute('data-muscle') === m) {
                btn.className = 'muscle-chip shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all bg-amberGold text-black shadow-amberGlow';
            } else {
                btn.className = 'muscle-chip shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all bg-fitDark-800 text-zinc-300 hover:text-white hover:bg-fitDark-750';
            }
        });
        applyFiltersAndRender(true);
    };

    // --- 12. FILTERING & EXERCISE CARDS RENDERING ---
    function applyFiltersAndRender(resetPage = false) {
        if (resetPage) STATE.page = 1;

        let list = [...STATE.allExercises];

        // Equipment Filter
        if (STATE.selectedEquipment.size > 0) {
            list = list.filter(ex => STATE.selectedEquipment.has(ex.equipment));
        }

        // Muscle Filter
        if (STATE.selectedMuscle !== 'all') {
            list = list.filter(ex => ex.muscle === STATE.selectedMuscle);
        }

        // Search Filter
        if (STATE.searchQuery) {
            const q = STATE.searchQuery.toLowerCase();
            list = list.filter(ex =>
                (ex.name && ex.name.toLowerCase().includes(q)) ||
                (ex.nameEn && ex.nameEn.toLowerCase().includes(q)) ||
                (ex.muscleNameAr && ex.muscleNameAr.toLowerCase().includes(q))
            );
        }

        STATE.filteredExercises = list;
        const countEl = document.getElementById('filteredExercisesCount');
        if (countEl) countEl.innerText = list.length.toLocaleString('en-US');

        renderExercisesGrid();
    }

    function renderExercisesGrid() {
        const container = document.getElementById('exercisesGridContainer');
        const loadMoreWrapper = document.getElementById('loadMoreExercisesWrapper');
        if (!container) return;

        const sliceLimit = STATE.page * STATE.pageSize;
        const itemsToShow = STATE.filteredExercises.slice(0, sliceLimit);

        if (itemsToShow.length === 0) {
            container.innerHTML = \`
                <div class="col-span-full py-16 text-center space-y-3 glass-card rounded-3xl">
                    <i class="fa-solid fa-magnifying-glass text-4xl text-zinc-600"></i>
                    <h3 class="text-base font-bold text-white">لم يتم العثور على أي تمارين متطابقة</h3>
                    <p class="text-xs text-zinc-400">جرب تقليل فلاتر الأجهزة أو البحث باسم آخر</p>
                </div>
            \`;
            if (loadMoreWrapper) loadMoreWrapper.classList.add('hidden');
            return;
        }

        container.innerHTML = '';
        itemsToShow.forEach(ex => {
            const card = document.createElement('div');
            card.className = 'glass-card glass-card-hover rounded-3xl p-4 flex flex-col justify-between space-y-3 relative group';

            const mediaHtml = renderAdaptiveMedia(ex.file, ex.name, 'w-full h-full object-contain');

            card.innerHTML = \`
                <div class="space-y-3">
                    <div class="aspect-video bg-fitDark-950 rounded-2xl overflow-hidden relative cursor-pointer flex items-center justify-center border border-white/5"
                         onclick="openExerciseDetails('\${ex.id}')">
                        \${mediaHtml}
                        <div class="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-amberGold border border-amberGold/30">
                                \${ex.muscleNameAr || ex.muscle}
                            </span>
                        </div>
                    </div>

                    <div>
                        <h3 class="font-bold text-white text-sm line-clamp-1 hover:text-amberGold cursor-pointer transition-colors"
                            onclick="openExerciseDetails('\${ex.id}')">\${ex.name}</h3>
                        <p class="text-[11px] text-zinc-400 font-num line-clamp-1 mt-0.5">\${ex.nameEn}</p>
                    </div>
                </div>

                <div class="pt-2 border-t border-white/5 flex items-center gap-2">
                    <button onclick="addExerciseToActiveWorkout('\${ex.id}')" title="إضافة لتمرين اليوم"
                            class="flex-1 py-2 rounded-xl bg-amberGold/15 hover:bg-amberGold text-amberGold hover:text-black border border-amberGold/30 font-bold text-xs flex items-center justify-center gap-1.5 transition-all">
                        <i class="fa-solid fa-plus text-[10px]"></i>
                        <span>تمرين اليوم</span>
                    </button>

                    <button onclick="openAlternativeModal('\${ex.id}')" title="اقتراح بديل ذكي"
                            class="px-2.5 py-2 rounded-xl bg-fitDark-800 hover:bg-fitDark-700 text-zinc-300 hover:text-white border border-white/5 text-xs transition-colors">
                        <i class="fa-solid fa-arrows-rotate"></i>
                    </button>

                    <button onclick="openExerciseDetails('\${ex.id}')" title="شرح تفصيلي"
                            class="px-2.5 py-2 rounded-xl bg-fitDark-800 hover:bg-fitDark-700 text-zinc-300 hover:text-white border border-white/5 text-xs transition-colors">
                        <i class="fa-solid fa-circle-info"></i>
                    </button>
                </div>
            \`;
            container.appendChild(card);
        });

        if (loadMoreWrapper) {
            if (sliceLimit < STATE.filteredExercises.length) {
                loadMoreWrapper.classList.remove('hidden');
            } else {
                loadMoreWrapper.classList.add('hidden');
            }
        }
    }

    window.loadMoreExercises = function() {
        STATE.page++;
        renderExercisesGrid();
    };

    // --- 13. SMART EXERCISE SWAP ENGINE (4 Categorized Alternatives) ---
    window.openAlternativeModal = function(exId) {
        const ex = STATE.allExercises.find(e => e.id === exId);
        if (!ex) return;

        const originalNameEl = document.getElementById('altModalOriginalName');
        if (originalNameEl) {
            originalNameEl.innerText = ex.name + ' (' + (ex.muscleNameAr || ex.muscle) + ')';
        }

        const listEl = document.getElementById('altModalSuggestionsList');
        if (!listEl) return;
        listEl.innerHTML = '';

        // Generate 4 Categorized Alternatives:
        // 1. Guided Machine Alternative (🛡️ أمان وثبات)
        // 2. Cable / Pulley Alternative (⚡ شد مستمر)
        // 3. Free Weights Alternative (🏋️ دمبلز وتوازن)
        // 4. Bodyweight / Home Alternative (🏠 وزن جسم)
        const categories = [
            { type: 'machine', title: '🛡️ بديل جهاز ميكانيكي موجه (أعلى درجات الأمان والعزل)', eqList: ['chest-press', 'lat-pulldown', 'leg-press', 'leg-extension-curl', 'pec-deck', 'smith-machine'] },
            { type: 'cable', title: '⚡ بديل كيبل وبكرات (شد مستمر ومسارات حرة)', eqList: ['pulleys', 'cable-crossover'] },
            { type: 'free', title: '🏋️ بديل أوزان حرة / دمبلز (تفعيل العضلات المثبتة والتوازن)', eqList: ['free-weights'] },
            { type: 'bodyweight', title: '🏠 بديل وزن جسم / كاليستنكس (منزلي بدون أجهزة)', eqList: ['bodyweight-tower'] }
        ];

        let foundCount = 0;

        categories.forEach(cat => {
            // Find an alternative matching the muscle and in this equipment group
            let match = null;
            if (ex.alternatives && ex.alternatives[cat.type]) {
                const altInfo = ex.alternatives[cat.type];
                match = STATE.allExercises.find(e => e.id === altInfo.id) || {
                    id: altInfo.id,
                    name: altInfo.name,
                    equipment: altInfo.equipment,
                    muscle: ex.muscle,
                    file: 'pectorals/barbell-bench-press.gif'
                };
            }

            if (!match) {
                match = STATE.allExercises.find(e => 
                    e.id !== ex.id && 
                    e.muscle === ex.muscle && 
                    cat.eqList.includes(e.equipment)
                );
            }

            if (match) {
                foundCount++;
                const item = document.createElement('div');
                item.className = 'p-3.5 rounded-2xl bg-fitDark-900 border border-white/5 space-y-2 hover:border-amberGold/30 transition-all';

                const mediaHtml = renderAdaptiveMedia(match.file, match.name, 'w-full h-full object-contain');

                item.innerHTML = \`
                    <div class="text-[11px] font-bold text-amberGold flex items-center gap-1.5">
                        <span>\${cat.title}</span>
                    </div>
                    <div class="flex items-center justify-between gap-3">
                        <div class="flex items-center gap-3">
                            <div class="w-12 h-12 rounded-xl bg-fitDark-950 overflow-hidden shrink-0 border border-white/5">
                                \${mediaHtml}
                            </div>
                            <div>
                                <h5 class="text-xs font-bold text-white">\${match.name}</h5>
                                <span class="text-[10px] text-zinc-400 font-num">\${match.nameEn || match.equipment}</span>
                            </div>
                        </div>
                        <button onclick="replaceExerciseInActive('\${ex.id}', '\${match.id}')"
                                class="px-3.5 py-1.5 rounded-xl bg-amberGold text-black font-bold text-xs hover:bg-amber-400 transition-all flex items-center gap-1">
                            <i class="fa-solid fa-arrows-rotate text-[10px]"></i>
                            <span>استبدال فوري</span>
                        </button>
                    </div>
                \`;
                listEl.appendChild(item);
            }
        });

        if (foundCount === 0) {
            listEl.innerHTML = \`
                <div class="p-6 rounded-2xl bg-fitDark-900 text-center text-xs text-zinc-400 space-y-2">
                    <i class="fa-solid fa-triangle-exclamation text-2xl text-amberGold"></i>
                    <p>لا توجد بدائل مباشرة مسجلة لهذه الزاوية حالياً. يمكنك استخدام الدمبلز أو أجهزة الكيبل المفتوحة.</p>
                </div>
            \`;
        }

        document.getElementById('alternativeModal')?.classList.remove('hidden');
    };

    window.closeAlternativeModal = function() {
        document.getElementById('alternativeModal')?.classList.add('hidden');
    };

    window.replaceExerciseInActive = function(oldId, newId) {
        const oldIdx = STATE.activeWorkout.exercises.findIndex(e => e.id === oldId);
        const newEx = STATE.allExercises.find(e => e.id === newId);

        if (oldIdx !== -1 && newEx) {
            STATE.activeWorkout.exercises[oldIdx] = {
                id: newEx.id,
                name: newEx.name,
                muscle: newEx.muscleNameAr || newEx.muscle,
                file: newEx.file,
                equipment: newEx.equipment,
                sets: [
                    { reps: 10, weight: 20, completed: false },
                    { reps: 10, weight: 25, completed: false },
                    { reps: 8, weight: 30, completed: false }
                ]
            };
            saveActiveWorkout();
            updateActiveWorkoutUI();
            renderActiveSessionView();
            renderActiveWorkoutExercises();
            showToast('تم استبدال التمرين بالبديل المقترح بنجاح ✅');
            VoiceGuide.speak('تم استبدال التمرين بـ ' + newEx.name);
        } else if (newEx) {
            addExerciseToActiveWorkout(newId);
        }
        closeAlternativeModal();
    };

    // --- 14. ACTIVE WORKOUT LIVE SESSION (Distraction-Free Tab 6 & Drawer) ---
    window.openActiveWorkoutDrawer = function() {
        document.getElementById('activeWorkoutDrawer')?.classList.remove('hidden');
        renderActiveWorkoutExercises();
    };

    window.closeActiveWorkoutDrawer = function() {
        document.getElementById('activeWorkoutDrawer')?.classList.add('hidden');
    };

    window.addExerciseToActiveWorkout = function(exId) {
        const ex = STATE.allExercises.find(e => e.id === exId);
        if (!ex) return;

        const existing = STATE.activeWorkout.exercises.find(e => e.id === exId);
        if (existing) {
            showToast('هذا التمرين موجود بالفعل في جدول اليوم');
            switchMainTab('active_session');
            return;
        }

        STATE.activeWorkout.exercises.push({
            id: ex.id,
            name: ex.name,
            muscle: ex.muscleNameAr || ex.muscle,
            file: ex.file,
            equipment: ex.equipment,
            sets: [
                { reps: 12, weight: 20, completed: false },
                { reps: 10, weight: 25, completed: false },
                { reps: 8, weight: 30, completed: false }
            ]
        });

        saveActiveWorkout();
        updateActiveWorkoutUI();
        renderActiveSessionView();
        showToast('تمت إضافة "' + ex.name + '" لجدول اليوم 🔥');
        VoiceGuide.speak('أضيف تمرين ' + ex.name + ' لجدولك');
    };

    function saveActiveWorkout() {
        localStorage.setItem('fitcraft_active_workout', JSON.stringify(STATE.activeWorkout));
    }

    function updateActiveWorkoutUI() {
        const badge = document.getElementById('activeWorkoutBadgeCount');
        if (badge) badge.innerText = STATE.activeWorkout.exercises.length;

        let totalSets = 0;
        let completedSets = 0;
        STATE.activeWorkout.exercises.forEach(ex => {
            ex.sets.forEach(s => {
                totalSets++;
                if (s.completed) completedSets++;
            });
        });

        // Update Drawer Progress
        const dCount = document.getElementById('drawerSetsCompletedCount');
        const dTotal = document.getElementById('drawerTotalSetsCount');
        const dBar = document.getElementById('drawerProgressBar');
        if (dCount) dCount.innerText = completedSets;
        if (dTotal) dTotal.innerText = totalSets;
        if (dBar) {
            const pct = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;
            dBar.style.width = pct + '%';
        }

        // Update Active Session Tab 6 Progress
        const aCount = document.getElementById('activeSessionCompletedSets');
        const aTotal = document.getElementById('activeSessionTotalSets');
        const aBar = document.getElementById('activeSessionProgressBar');
        if (aCount) aCount.innerText = completedSets;
        if (aTotal) aTotal.innerText = totalSets;
        if (aBar) {
            const pct = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;
            aBar.style.width = pct + '%';
        }
    }

    // Render active workout cards in Tab 6 (Full Screen Distraction-Free view)
    function renderActiveSessionView() {
        const container = document.getElementById('activeSessionExercisesContainer');
        if (!container) return;
        container.innerHTML = '';

        if (STATE.activeWorkout.exercises.length === 0) {
            container.innerHTML = \`
                <div class="py-16 text-center space-y-4 glass-card rounded-3xl p-8 border border-white/5">
                    <div class="w-16 h-16 rounded-3xl bg-fitDark-900 border border-white/5 text-zinc-500 flex items-center justify-center text-3xl mx-auto">
                        <i class="fa-solid fa-dumbbell"></i>
                    </div>
                    <h3 class="text-base font-bold text-white">جلسة تمرين اليوم فارغة حالياً</h3>
                    <p class="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
                        اختر تمارين من قسم ترسانة الأجهزة، أو استعن بالبرامج المعتمدة أو المولد الذكي لتفعيل الحصة بضغطة زر.
                    </p>
                    <button onclick="switchMainTab('equipment_hub')" class="px-6 py-2.5 rounded-xl bg-amberGold text-black font-bold text-xs hover:bg-amber-400 transition-all">
                        تصفح ترسانة الأجهزة والتمارين
                    </button>
                </div>
            \`;
            return;
        }

        STATE.activeWorkout.exercises.forEach((ex, exIdx) => {
            const card = document.createElement('div');
            card.className = 'glass-card rounded-3xl p-5 sm:p-6 space-y-5 border border-white/10 relative';

            let setsHtml = '';
            ex.sets.forEach((set, setIdx) => {
                setsHtml += \`
                    <div class="flex items-center justify-between gap-3 p-3 rounded-2xl \${set.completed ? 'bg-cyberEmerald/10 border border-cyberEmerald/30' : 'bg-fitDark-950 border border-white/5'}">
                        <div class="flex items-center gap-2">
                            <button onclick="toggleWorkoutSet(\${exIdx}, \${setIdx})"
                                    class="w-8 h-8 rounded-xl flex items-center justify-center transition-all \${set.completed ? 'bg-cyberEmerald text-black font-black' : 'bg-fitDark-800 text-zinc-400 hover:text-white border border-white/10'}">
                                <i class="fa-solid fa-check text-xs"></i>
                            </button>
                            <span class="text-xs font-bold \${set.completed ? 'line-through text-zinc-400' : 'text-white'}">جولة \${setIdx + 1}</span>
                        </div>
                        <div class="flex items-center gap-2 text-xs font-num">
                            <div class="flex items-center gap-1">
                                <input type="number" placeholder="10" value="\${set.reps || ''}" onchange="updateSetReps(\${exIdx}, \${setIdx}, this.value)"
                                       class="w-16 bg-fitDark-850 border border-fitDark-750 rounded-xl px-2 py-1.5 text-center text-xs text-white">
                                <span class="text-zinc-500 text-[10px] font-cairo">عدة</span>
                            </div>
                            <div class="flex items-center gap-1">
                                <input type="number" step="0.5" placeholder="كجم" value="\${set.weight || ''}" onchange="updateSetWeight(\${exIdx}, \${setIdx}, this.value)"
                                       class="w-18 bg-fitDark-850 border border-fitDark-750 rounded-xl px-2 py-1.5 text-center text-xs text-amberGold font-bold">
                                <span class="text-zinc-500 text-[10px] font-cairo">كجم</span>
                            </div>
                            <button onclick="toggleWorkoutSet(\${exIdx}, \${setIdx})" class="px-3 py-1.5 rounded-xl text-xs font-bold \${set.completed ? 'bg-cyberEmerald/20 text-cyberEmerald' : 'bg-amberGold text-black hover:bg-amber-400'} font-cairo transition-all">
                                \${set.completed ? 'تمت ✓' : 'تأكيد'}
                            </button>
                        </div>
                    </div>
                \`;
            });

            const isRestActive = STATE.restTargetExerciseIdx === exIdx && STATE.restRemaining > 0;
            const mediaHtml = renderAdaptiveMedia(ex.file, ex.name, 'w-full h-full object-contain');

            card.innerHTML = \`
                <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                    <div class="flex items-center gap-3">
                        <div class="w-16 h-16 rounded-2xl bg-fitDark-950 overflow-hidden shrink-0 border border-white/5">
                            \${mediaHtml}
                        </div>
                        <div>
                            <h4 class="text-base font-bold text-white">\${ex.name}</h4>
                            <div class="flex items-center gap-2 mt-1">
                                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amberGold/15 text-amberGold">\${ex.muscle}</span>
                                <span class="text-[10px] text-zinc-400 font-num">\${ex.equipment}</span>
                            </div>
                        </div>
                    </div>

                    <div class="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <button onclick="openAlternativeModal('\${ex.id}')"
                                class="px-3 py-2 rounded-xl bg-fitDark-800 hover:bg-fitDark-700 text-zinc-200 border border-white/5 text-xs font-bold flex items-center gap-1.5 transition-colors">
                            <i class="fa-solid fa-arrows-rotate text-amberGold"></i>
                            <span>🔄 بديل التمرين</span>
                        </button>
                        <button onclick="removeExerciseFromActiveWorkout(\${exIdx})"
                                class="w-9 h-9 rounded-xl bg-fitDark-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 flex items-center justify-center text-xs transition-colors">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>

                <div class="space-y-2">
                    \${setsHtml}
                </div>

                <!-- Embedded Rest Timer Inside Each Active Exercise Card -->
                <div class="pt-2">
                    <div class="p-3.5 rounded-2xl bg-gradient-to-r from-fitDark-950 via-fitDark-900 to-fitDark-950 border border-white/5 flex items-center justify-between gap-3 flex-wrap">
                        <div class="flex items-center gap-2">
                            <i class="fa-solid fa-stopwatch text-amberGold text-base"></i>
                            <span class="text-xs font-bold text-white">مؤقت الراحة البينية:</span>
                            <span class="font-num text-sm font-black text-amberGold" id="cardRestTimerDisplay-\${exIdx}">
                                \${isRestActive ? STATE.restRemaining + 's' : 'جاهز'}
                            </span>
                        </div>
                        <div class="flex items-center gap-2">
                            <button onclick="triggerEmbeddedRestTimer(\${exIdx}, 45)" class="px-2.5 py-1 rounded-lg bg-fitDark-800 hover:bg-fitDark-750 text-white font-num font-bold text-xs">45s</button>
                            <button onclick="triggerEmbeddedRestTimer(\${exIdx}, 60)" class="px-2.5 py-1 rounded-lg bg-fitDark-800 hover:bg-fitDark-750 text-white font-num font-bold text-xs">60s</button>
                            <button onclick="triggerEmbeddedRestTimer(\${exIdx}, 90)" class="px-2.5 py-1 rounded-lg bg-fitDark-800 hover:bg-fitDark-750 text-white font-num font-bold text-xs">90s</button>
                            <button onclick="skipRestTimer()" class="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-xs">تخطي</button>
                        </div>
                    </div>
                </div>
            \`;
            container.appendChild(card);
        });
    }

    // Render active workout cards in side Drawer
    function renderActiveWorkoutExercises() {
        const container = document.getElementById('drawerExercisesList');
        if (!container) return;
        container.innerHTML = '';

        if (STATE.activeWorkout.exercises.length === 0) {
            container.innerHTML = \`
                <div class="py-16 text-center space-y-3 glass-card rounded-3xl p-6">
                    <i class="fa-solid fa-dumbbell text-4xl text-zinc-600"></i>
                    <h4 class="text-sm font-bold text-white">جدول اليوم فارغ حالياً</h4>
                    <p class="text-xs text-zinc-400 leading-relaxed">
                        اختر تمارين من قسم ترسانة الأجهزة أو فعل أحد البرامج المعتمدة لتظهر هنا مع تتبع الجولات ومؤقت الراحة.
                    </p>
                </div>
            \`;
            return;
        }

        STATE.activeWorkout.exercises.forEach((ex, exIdx) => {
            const card = document.createElement('div');
            card.className = 'glass-card rounded-3xl p-4 sm:p-5 space-y-4 border border-white/5 relative';

            let setsHtml = '';
            ex.sets.forEach((set, setIdx) => {
                setsHtml += \`
                    <div class="flex items-center justify-between gap-3 p-2.5 rounded-xl \${set.completed ? 'bg-cyberEmerald/10 border border-cyberEmerald/30' : 'bg-fitDark-950 border border-white/5'}">
                        <div class="flex items-center gap-2">
                            <button onclick="toggleWorkoutSet(\${exIdx}, \${setIdx})"
                                    class="w-7 h-7 rounded-lg flex items-center justify-center transition-all \${set.completed ? 'bg-cyberEmerald text-black font-black' : 'bg-fitDark-800 text-zinc-400 hover:text-white border border-white/10'}">
                                <i class="fa-solid fa-check text-xs"></i>
                            </button>
                            <span class="text-xs font-bold \${set.completed ? 'line-through text-zinc-400' : 'text-white'}">جولة \${setIdx + 1}</span>
                        </div>
                        <div class="flex items-center gap-2 text-xs font-num">
                            <input type="number" placeholder="10" value="\${set.reps || ''}" onchange="updateSetReps(\${exIdx}, \${setIdx}, this.value)"
                                   class="w-14 bg-fitDark-850 border border-fitDark-750 rounded-lg px-2 py-1 text-center text-xs text-white">
                            <input type="number" step="0.5" placeholder="كجم" value="\${set.weight || ''}" onchange="updateSetWeight(\${exIdx}, \${setIdx}, this.value)"
                                   class="w-16 bg-fitDark-850 border border-fitDark-750 rounded-lg px-2 py-1 text-center text-xs text-amberGold font-bold">
                            <button onclick="toggleWorkoutSet(\${exIdx}, \${setIdx})" class="px-2 py-1 rounded-lg text-[10px] font-bold \${set.completed ? 'bg-cyberEmerald/20 text-cyberEmerald' : 'bg-amberGold text-black hover:bg-amber-400'} font-cairo">
                                \${set.completed ? 'تمت ✓' : 'تأكيد'}
                            </button>
                        </div>
                    </div>
                \`;
            });

            const mediaHtml = renderAdaptiveMedia(ex.file, ex.name, 'w-full h-full object-contain');

            card.innerHTML = \`
                <div class="flex items-center justify-between gap-3">
                    <div class="flex items-center gap-3">
                        <div class="w-12 h-12 rounded-xl bg-fitDark-950 overflow-hidden shrink-0 border border-white/5">
                            \${mediaHtml}
                        </div>
                        <div>
                            <h4 class="text-sm font-bold text-white">\${ex.name}</h4>
                            <span class="text-[10px] text-amberGold">\${ex.muscle}</span>
                        </div>
                    </div>
                    <div class="flex items-center gap-1.5">
                        <button onclick="openAlternativeModal('\${ex.id}')" title="اقتراح بديل" class="w-8 h-8 rounded-lg bg-fitDark-800 hover:bg-fitDark-700 text-zinc-400 hover:text-white text-xs">
                            <i class="fa-solid fa-arrows-rotate"></i>
                        </button>
                        <button onclick="removeExerciseFromActiveWorkout(\${exIdx})" title="حذف" class="w-8 h-8 rounded-lg bg-fitDark-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 text-xs">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="space-y-2">
                    \${setsHtml}
                </div>
            \`;
            container.appendChild(card);
        });
    }

    window.toggleWorkoutSet = function(exIdx, setIdx) {
        const set = STATE.activeWorkout.exercises[exIdx].sets[setIdx];
        set.completed = !set.completed;
        saveActiveWorkout();
        updateActiveWorkoutUI();

        if (set.completed) {
            if (window.AudioHelper) AudioHelper.playChime('bell');
            VoiceGuide.speak('أحسنت! جولة مكتملة، ابدأ الراحة');
            triggerEmbeddedRestTimer(exIdx, 60);
        }

        renderActiveSessionView();
        renderActiveWorkoutExercises();
    };

    window.updateSetWeight = function(exIdx, setIdx, weight) {
        STATE.activeWorkout.exercises[exIdx].sets[setIdx].weight = weight;
        saveActiveWorkout();
    };

    window.updateSetReps = function(exIdx, setIdx, reps) {
        STATE.activeWorkout.exercises[exIdx].sets[setIdx].reps = reps;
        saveActiveWorkout();
    };

    window.removeExerciseFromActiveWorkout = function(idx) {
        STATE.activeWorkout.exercises.splice(idx, 1);
        saveActiveWorkout();
        updateActiveWorkoutUI();
        renderActiveSessionView();
        renderActiveWorkoutExercises();
    };

    window.clearActiveWorkout = function() {
        if (confirm('هل أنت متأكد من تفريغ كافة تمارين جدول اليوم؟')) {
            STATE.activeWorkout.exercises = [];
            saveActiveWorkout();
            updateActiveWorkoutUI();
            renderActiveSessionView();
            renderActiveWorkoutExercises();
            showToast('تم إفراغ جدول اليوم النشط');
        }
    };

    // Rest Timer Logic
    window.triggerEmbeddedRestTimer = function(exIdx, seconds) {
        if (STATE.restTimer) clearInterval(STATE.restTimer);
        STATE.restTargetExerciseIdx = exIdx;
        STATE.restRemaining = seconds;

        const updateTimerLabel = () => {
            const el = document.getElementById('cardRestTimerDisplay-' + exIdx);
            if (el) el.innerText = STATE.restRemaining + 's';
        };
        updateTimerLabel();

        STATE.restTimer = setInterval(() => {
            STATE.restRemaining--;
            updateTimerLabel();
            if (STATE.restRemaining <= 0) {
                clearInterval(STATE.restTimer);
                STATE.restTimer = null;
                STATE.restTargetExerciseIdx = null;
                if (window.AudioHelper) AudioHelper.playChime('beep');
                VoiceGuide.speak('انتهى وقت الراحة! حان وقت الجولة التالية');
                showToast('انتهى وقت الراحة! حان وقت الجولة التالية 💪');
                renderActiveSessionView();
            }
        }, 1000);
    };

    window.skipRestTimer = function() {
        if (STATE.restTimer) clearInterval(STATE.restTimer);
        STATE.restTimer = null;
        STATE.restRemaining = 0;
        STATE.restTargetExerciseIdx = null;
        renderActiveSessionView();
    };

    // Finish Workout Session with Confetti, Victory Audio, Volume Load & WhatsApp Exporter!
    window.finishActiveWorkoutSession = function() {
        if (STATE.activeWorkout.exercises.length === 0) {
            showToast('أضف تمارين لجدولك قبل إنهاء الحصة');
            return;
        }

        let totalVolume = 0;
        let completedSetsCount = 0;
        STATE.activeWorkout.exercises.forEach(ex => {
            ex.sets.forEach(s => {
                if (s.completed) {
                    completedSetsCount++;
                    const w = parseFloat(s.weight) || 0;
                    const r = parseInt(s.reps) || 0;
                    totalVolume += (w * r);
                }
            });
        });

        // Confetti Celebration
        if (typeof confetti === 'function') {
            confetti({ particleCount: 160, spread: 100, origin: { y: 0.6 } });
            setTimeout(() => {
                confetti({ particleCount: 90, angle: 60, spread: 60, origin: { x: 0 } });
                confetti({ particleCount: 90, angle: 120, spread: 60, origin: { x: 1 } });
            }, 300);
        }

        if (window.AudioHelper) AudioHelper.playChime('finish');
        VoiceGuide.speak('مبارك يا بطل! أنهيت حصتك التدريبية بنجاح واحترافية');

        // Record active day for Heatmap
        const todayIso = new Date().toISOString().split('T')[0];
        if (!STATE.profile.activeDays) STATE.profile.activeDays = [];
        if (!STATE.profile.activeDays.includes(todayIso)) {
            STATE.profile.activeDays.push(todayIso);
        }

        STATE.profile.workoutsCount = (STATE.profile.workoutsCount || 0) + 1;
        STATE.profile.streak = (STATE.profile.streak || 0) + 1;
        if (STATE.profile.streak > (STATE.profile.bestStreak || 0)) {
            STATE.profile.bestStreak = STATE.profile.streak;
        }
        STATE.profile.totalVolume = (STATE.profile.totalVolume || 0) + totalVolume;

        const dateStr = new Date().toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' });
        const workoutSummary = {
            date: dateStr,
            title: STATE.activeWorkout.title || 'حصة تدريبية مخصصة',
            exercisesCount: STATE.activeWorkout.exercises.length,
            totalVolume: totalVolume.toLocaleString('en-US') + ' كجم',
            completedSets: completedSetsCount,
            duration: '45 دقيقة',
            exerciseNames: STATE.activeWorkout.exercises.map(e => e.name)
        };

        STATE.profile.workoutHistory.unshift(workoutSummary);
        saveUserProfileData();

        // Update Summary Modal
        const volEl = document.getElementById('summaryTotalVolume');
        const setsEl = document.getElementById('summaryTotalSets');
        const durEl = document.getElementById('summaryDuration');
        if (volEl) volEl.innerText = totalVolume.toLocaleString('en-US') + ' كجم';
        if (setsEl) setsEl.innerText = completedSetsCount + ' جولة';
        if (durEl) durEl.innerText = '45 دقيقة';

        window._lastWorkoutSummary = workoutSummary;

        // Clear active session
        STATE.activeWorkout.exercises = [];
        saveActiveWorkout();
        updateActiveWorkoutUI();
        renderActiveSessionView();
        closeActiveWorkoutDrawer();

        document.getElementById('workoutSummaryModal')?.classList.remove('hidden');
    };

    window.exportWorkoutSummaryToWhatsApp = function() {
        const s = window._lastWorkoutSummary || (STATE.profile.workoutHistory && STATE.profile.workoutHistory[0]);
        if (!s) {
            showToast('لا يوجد ملخص متاح للتصدير');
            return;
        }

        const exList = (s.exerciseNames || []).map(n => '• ' + n).join('\\n');
        const msg = '🏋️‍♂️ *تقرير إنجاز الحصة التدريبية - FitCraft* 🚀\\n' +
                    '━━━━━━━━━━━━━━━━━━━━\\n' +
                    '📅 *التاريخ:* ' + s.date + '\\n' +
                    '🏆 *البرنامج:* ' + s.title + '\\n' +
                    '💪 *الحمل الحجمي المرفوع:* ' + s.totalVolume + '\\n' +
                    '🔥 *الجولات المنجزة:* ' + s.completedSets + ' جولة\\n' +
                    '⏱️ *المدة المستغرقة:* ' + s.duration + '\\n' +
                    (exList ? '\\n📋 *التمارين المنفذة:*\\n' + exList + '\\n' : '') +
                    '━━━━━━━━━━━━━━━━━━━━\\n' +
                    'عاش يا بطل! مستمرون نحو أقوى نسخة منك 💪🔥';

        if (navigator.clipboard) {
            navigator.clipboard.writeText(msg).then(() => {
                showToast('📋 تم نسخ ملخص التمرين، جاري فتح الواتساب...');
            }).catch(() => {});
        }

        const encoded = encodeURIComponent(msg);
        window.open('https://wa.me/?text=' + encoded, '_blank');
    };

    window.closeWorkoutSummaryModal = function() {
        document.getElementById('workoutSummaryModal')?.classList.add('hidden');
        renderProfileDetails();
    };

    // --- 15. DETAILS MODAL ---
    window.openExerciseDetails = function(exId) {
        const ex = STATE.allExercises.find(e => e.id === exId);
        if (!ex) return;

        document.getElementById('detailsModalTitle').innerText = ex.name;
        document.getElementById('detailsModalSubtitle').innerText = ex.nameEn;
        
        const previewContainer = document.getElementById('detailsModalGif')?.parentElement;
        if (previewContainer) {
            previewContainer.innerHTML = renderAdaptiveMedia(ex.file, ex.name, 'w-full h-full object-contain');
        }

        const badgesContainer = document.getElementById('detailsModalBadges');
        if (badgesContainer) {
            badgesContainer.innerHTML = \`
                <span class="px-2.5 py-1 rounded-full bg-amberGold/20 text-amberGold border border-amberGold/30 font-bold">\${ex.muscleNameAr || ex.muscle}</span>
                <span class="px-2.5 py-1 rounded-full bg-fitDark-800 text-zinc-300 font-bold">\${ex.equipment}</span>
                <span class="px-2.5 py-1 rounded-full bg-cyberEmerald/20 text-cyberEmerald font-bold">\${ex.difficulty || 'متوسط'}</span>
            \`;
        }

        const instructionsContainer = document.getElementById('detailsModalInstructions');
        if (instructionsContainer) {
            instructionsContainer.innerHTML = '';
            (ex.instructions || []).forEach((inst, idx) => {
                const step = document.createElement('div');
                step.className = 'flex items-start gap-2 text-xs leading-relaxed';
                step.innerHTML = \`<span class="w-5 h-5 rounded-full bg-amberGold/20 text-amberGold font-num font-bold flex items-center justify-center shrink-0 text-[10px]">\${idx + 1}</span><span>\${inst}</span>\`;
                instructionsContainer.appendChild(step);
            });
        }

        const addBtn = document.getElementById('detailsModalAddActiveBtn');
        if (addBtn) {
            addBtn.onclick = () => {
                addExerciseToActiveWorkout(ex.id);
                closeDetailsModal();
            };
        }

        const altBtn = document.getElementById('detailsModalAltBtn');
        if (altBtn) {
            altBtn.onclick = () => {
                closeDetailsModal();
                openAlternativeModal(ex.id);
            };
        }

        document.getElementById('exerciseDetailsModal')?.classList.remove('hidden');
    };

    window.closeDetailsModal = function() {
        document.getElementById('exerciseDetailsModal')?.classList.add('hidden');
    };

    // --- 16. STRETCHING, RECOVERY & POSTURE CORRECTION (202 Local GIFs) ---
    function renderStretchingCards(filterType = 'all') {
        const container = document.getElementById('stretchingCardsGrid');
        if (!container) return;
        container.innerHTML = '';

        const dataset = STRETCH_MOBILITY_DATASET;
        const list = filterType === 'all'
            ? dataset
            : dataset.filter(s => s.subCategory === filterType);

        list.slice(0, 48).forEach(item => {
            const card = document.createElement('div');
            card.className = 'glass-card glass-card-hover rounded-3xl p-5 space-y-4 border border-white/5 flex flex-col justify-between';

            const mediaHtml = renderAdaptiveMedia(item.localPath || item.gifFile, item.nameAr || item.nameEn, 'w-full h-full object-contain');

            const isStatic = item.subCategory === 'static_relief';

            card.innerHTML = \`
                <div class="space-y-3">
                    <div class="aspect-video bg-fitDark-950 rounded-2xl overflow-hidden flex items-center justify-center border border-white/5 relative">
                        \${mediaHtml}
                        <span class="absolute top-2.5 right-2.5 text-[10px] font-bold px-2 py-0.5 rounded-full \${isStatic ? 'bg-cyberEmerald text-black' : 'bg-amberGold text-black'} font-num">
                            \${isStatic ? 'ثبات استشفائي' : 'حركي ديناميكي'}
                        </span>
                    </div>
                    <div>
                        <h4 class="font-bold text-white text-sm">\${item.nameAr || item.nameEn}</h4>
                        <p class="text-[11px] text-zinc-400 font-num">\${item.nameEn}</p>
                    </div>
                    <div class="space-y-1.5 text-xs">
                        <div class="text-zinc-300"><strong class="text-amberGold">التوجيه:</strong> \${item.cueAr || 'تنفس بهدوء بعمق واسترخِ في أقصى نقطة تمدد مريحة.'}</div>
                    </div>
                </div>

                <div class="pt-3 border-t border-white/5 flex items-center justify-between text-xs font-num">
                    <span class="text-zinc-400"><i class="fa-solid fa-clock ml-1 text-amberGold"></i>\${item.durationOrReps}</span>
                    \${isStatic ? \`
                        <button onclick="startStretchHoldTimer('\${item.id}', 30)" id="stretchBtn-\${item.id}"
                                class="px-2.5 py-1 rounded-lg bg-cyberEmerald/20 text-cyberEmerald hover:bg-cyberEmerald hover:text-black font-cairo font-bold text-[10px] transition-all">
                            ⏱️ بدء الثبات (30ث)
                        </button>
                    \` : \`
                        <span class="text-amberGold font-bold font-cairo">\${item.targetMuscleAr || item.targetMuscle}</span>
                    \`}
                </div>
            \`;
            container.appendChild(card);
        });
    }

    window.filterStretchingCategory = function(type) {
        document.querySelectorAll('.stretch-cat-btn').forEach(btn => {
            if (btn.getAttribute('data-stretch') === type) {
                btn.className = 'stretch-cat-btn shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all bg-amberGold text-black shadow-amberGlow';
            } else {
                btn.className = 'stretch-cat-btn shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all bg-fitDark-800 text-zinc-300 hover:text-white';
            }
        });
        renderStretchingCards(type);
    };

    window.startStretchHoldTimer = function(id, seconds) {
        let remaining = seconds;
        const btn = document.getElementById('stretchBtn-' + id);
        if (!btn) return;

        btn.disabled = true;
        btn.innerText = 'ثبات: ' + remaining + 'ث';
        btn.className = 'px-2.5 py-1 rounded-lg bg-amberGold text-black font-cairo font-black text-[10px] animate-pulse';

        if (window.AudioHelper) AudioHelper.playChime('bell');
        VoiceGuide.speak('ابدأ وضعية الثبات، تنفس بهدوء');

        const interval = setInterval(() => {
            remaining--;
            if (btn) btn.innerText = 'ثبات: ' + remaining + 'ث';
            if (remaining <= 0) {
                clearInterval(interval);
                if (btn) {
                    btn.disabled = false;
                    btn.innerText = 'مكتمل ✓';
                    btn.className = 'px-2.5 py-1 rounded-lg bg-cyberEmerald text-black font-cairo font-black text-[10px]';
                }
                if (window.AudioHelper) AudioHelper.playChime('finish');
                VoiceGuide.speak('أحسنت! اكتملت مدة الإطالة بنجاح');
            }
        }, 1000);
    };

    // --- 17. GUIDED BREATHWORK LAB (Box, Relax 4-7-8, Coherence 5.5s, Power) ---
    const BREATH_PROTOCOLS = {
        box: {
            title: 'تنفس المربع (Box)',
            phases: [
                { label: 'شهيق عميق (Inhale)', seconds: 4, desc: 'استنشق الهواء ببطء وعمق من الأنف واملأ الحجاب الحاجز', class: 'orb-breath-inhale', voice: 'شهيق عميق من الأنف' },
                { label: 'حبس النفس (Hold)', seconds: 4, desc: 'اثبت في وضعية الامتلاء واسترخِ الكتفين والفك', class: 'orb-breath-hold', voice: 'اثبت واحبس النفس بسلام' },
                { label: 'زفير هادئ (Exhale)', seconds: 4, desc: 'أخرج الهواء ببطء وتدرج من الفم مفرغاً قاع الرئتين', class: 'orb-breath-exhale', voice: 'زفير بطيء وتفريغ كامل' },
                { label: 'حبس النفس (Hold)', seconds: 4, desc: 'اثبت في وضعية الفراغ التام بسلام عصبي', class: 'orb-breath-hold-post', voice: 'اثبت بهدوء' }
            ]
        },
        relax: {
            title: 'الاسترخاء العميق (4-7-8)',
            phases: [
                { label: 'شهيق هادئ (Inhale)', seconds: 4, desc: 'تنفس بهدوء من الأنف لمدة 4 ثوانٍ', class: 'orb-breath-inhale', voice: 'شهيق هادئ' },
                { label: 'حبس النفس التام (Hold)', seconds: 7, desc: 'احتفظ بالأكسجين لتنشيط العصب الحائر لمدة 7 ثوانٍ', class: 'orb-breath-hold', voice: 'احبس النفس التام' },
                { label: 'زفير ممتد (Exhale)', seconds: 8, desc: 'أطلق زفيراً بطيئاً كاملاً مع صوت هسيس لطيف لثماني ثوانٍ', class: 'orb-breath-exhale', voice: 'زفير عميق ممتد' }
            ]
        },
        coherence: {
            title: 'الرنين المتوازن (Coherence)',
            phases: [
                { label: 'شهيق متوازن (Inhale)', seconds: 5, desc: 'شهيق ناعم ومتدفق ينسجم مع ضربات القلب لمدة 5.5 ثوانٍ', class: 'orb-breath-inhale', voice: 'شهيق متوازن متدفق' },
                { label: 'زفير متوازن (Exhale)', seconds: 5, desc: 'زفير سلس يعيد التوازن بين القلب والجهاز العصبي', class: 'orb-breath-exhale', voice: 'زفير سلس متوازن' }
            ]
        },
        power: {
            title: 'التنفس التنشيطي (Power)',
            phases: [
                { label: 'شهيق انفجاري (Inhale)', seconds: 4, desc: 'املأ الصدر والأكسجين بطاقة عالية لرفع التركيز', class: 'orb-breath-inhale', voice: 'شهيق انفجاري قوي' },
                { label: 'ثبات لحظي (Hold)', seconds: 1, desc: 'ثبت لثانية واحدة لتوجيه الطاقة للأطراف', class: 'orb-breath-hold', voice: 'ثبات لحظي' },
                { label: 'زفير قوي (Exhale)', seconds: 2, desc: 'تفريغ هواء فوري وحازم مع شد عضلات الكور', class: 'orb-breath-exhale', voice: 'زفير حازم وسريع' }
            ]
        }
    };

    window.selectBreathTechnique = function(tech) {
        STATE.breath.technique = tech;
        ['box', 'relax', 'coherence', 'power'].forEach(t => {
            const card = document.getElementById('breathCard-' + t);
            if (card) {
                if (t === tech) {
                    card.className = 'cursor-pointer p-5 rounded-2xl glass-card border-2 border-amberGold bg-amberGold/10 transition-all space-y-2';
                } else {
                    card.className = 'cursor-pointer p-5 rounded-2xl glass-card border-2 border-white/5 bg-fitDark-850 hover:border-zinc-600 transition-all space-y-2';
                }
            }
        });
        resetBreathSession();
    };

    window.toggleBreathSession = function() {
        if (STATE.breath.isRunning) {
            pauseBreathSession();
        } else {
            startBreathSession();
        }
    };

    function startBreathSession() {
        STATE.breath.isRunning = true;
        const btn = document.getElementById('breathStartPauseBtn');
        if (btn) btn.innerHTML = '<i class="fa-solid fa-pause"></i><span>إيقاف مؤقت</span>';

        const protocol = BREATH_PROTOCOLS[STATE.breath.technique];
        const currentPhase = protocol.phases[STATE.breath.phaseIdx];
        applyBreathOrbVisual(currentPhase);

        const audioToggle = document.getElementById('breathAudioToggle');
        if (audioToggle && audioToggle.checked) {
            VoiceGuide.speak(currentPhase.voice);
        }

        STATE.breath.timerId = setInterval(() => {
            STATE.breath.secondsRemaining--;
            const countEl = document.getElementById('breathPhaseCountdown');
            if (countEl) countEl.innerText = STATE.breath.secondsRemaining;

            if (STATE.breath.secondsRemaining <= 0) {
                STATE.breath.phaseIdx = (STATE.breath.phaseIdx + 1) % protocol.phases.length;
                if (STATE.breath.phaseIdx === 0) {
                    STATE.breath.completedCycles++;
                    const cyclesEl = document.getElementById('breathCompletedCycles');
                    if (cyclesEl) cyclesEl.innerText = STATE.breath.completedCycles;
                    if (window.AudioHelper) AudioHelper.playChime('bell');
                }
                const nextPhase = protocol.phases[STATE.breath.phaseIdx];
                STATE.breath.secondsRemaining = nextPhase.seconds;
                applyBreathOrbVisual(nextPhase);

                if (audioToggle && audioToggle.checked) {
                    VoiceGuide.speak(nextPhase.voice);
                }
            }
        }, 1000);
    }

    function pauseBreathSession() {
        STATE.breath.isRunning = false;
        clearInterval(STATE.breath.timerId);
        const btn = document.getElementById('breathStartPauseBtn');
        if (btn) btn.innerHTML = '<i class="fa-solid fa-play"></i><span>استئناف</span>';
    }

    window.resetBreathSession = function() {
        pauseBreathSession();
        STATE.breath.phaseIdx = 0;
        const protocol = BREATH_PROTOCOLS[STATE.breath.technique];
        STATE.breath.secondsRemaining = protocol.phases[0].seconds;
        const countEl = document.getElementById('breathPhaseCountdown');
        if (countEl) countEl.innerText = STATE.breath.secondsRemaining;

        const orb = document.getElementById('breathInteractiveOrb');
        if (orb) orb.className = 'w-36 h-36 rounded-full bg-gradient-to-tr from-amberGold/80 to-amber-300 transition-all flex flex-col items-center justify-center shadow-amberGlow text-black select-none';

        const titleEl = document.getElementById('breathPhaseTitle');
        if (titleEl) titleEl.innerText = 'جاهز للبدء';
        const descEl = document.getElementById('breathPhaseDesc');
        if (descEl) descEl.innerText = 'اضغط زر البدء للدخول في الدورة التنفسية';
        const nextEl = document.getElementById('breathNextPreview');
        if (nextEl) nextEl.innerText = 'تنفس بهدوء من الأنف واملأ قاع الرئتين';

        const btn = document.getElementById('breathStartPauseBtn');
        if (btn) btn.innerHTML = '<i class="fa-solid fa-play"></i><span>بدء الجلسة</span>';
    };

    function applyBreathOrbVisual(phase) {
        const orb = document.getElementById('breathInteractiveOrb');
        if (orb) {
            orb.className = 'w-36 h-36 rounded-full bg-gradient-to-tr from-cyan-400 to-amber-300 transition-all duration-1000 flex flex-col items-center justify-center shadow-amberGlow text-black select-none ' + phase.class;
        }
        const titleEl = document.getElementById('breathPhaseTitle');
        if (titleEl) titleEl.innerText = phase.label;
        const descEl = document.getElementById('breathPhaseDesc');
        if (descEl) descEl.innerText = phase.desc;

        const protocol = BREATH_PROTOCOLS[STATE.breath.technique];
        const nextIdx = (STATE.breath.phaseIdx + 1) % protocol.phases.length;
        const nextEl = document.getElementById('breathNextPreview');
        if (nextEl) nextEl.innerText = 'المرحلة التالية: ' + protocol.phases[nextIdx].label;
    }

    // --- 18. PRO PROGRAMS DATA & RENDERING (Liftosaur & Workout Wizard) ---
    const PRO_PROGRAMS_DATA = [
        {
            id: 'prog-ppl',
            title: 'برنامج دفع سحب أرجل الاحترافي (PPL 6-Day)',
            cat: 'ppl',
            daysCount: 6,
            level: 'متوسط إلى متقدم',
            goal: 'بناء وتضخيم متوازن',
            banner: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=60',
            days: [
                { title: 'اليوم 1: دفع (Push - الصدر، الأكتاف، الترايسبس)', exerciseIds: ['chest-1', 'chest-2', 'chest-3', 'shoulders-1', 'arms-1'] },
                { title: 'اليوم 2: سحب (Pull - الظهر، المجنص، البايسبس)', exerciseIds: ['back-1', 'back-2', 'back-3', 'arms-2'] },
                { title: 'اليوم 3: أرجل وبطن (Legs & Abs)', exerciseIds: ['legs-1', 'legs-2', 'legs-3', 'legs-4', 'abs-1'] }
            ]
        },
        {
            id: 'prog-arnold',
            title: 'نظام أرنولد شوارزنيجر الأسطوري (Arnold Split)',
            cat: 'arnold',
            daysCount: 6,
            level: 'متقدم',
            goal: 'ضخامة عضلية شاملة وسوبر سيت',
            banner: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&auto=format&fit=crop&q=60',
            days: [
                { title: 'اليوم 1: الصدر والظهر (Chest & Back SuperSet)', exerciseIds: ['chest-1', 'back-1', 'chest-3', 'back-2'] },
                { title: 'اليوم 2: الأكتاف والذراعين (Shoulders & Arms)', exerciseIds: ['shoulders-1', 'shoulders-2', 'arms-1', 'arms-2'] },
                { title: 'اليوم 3: الأرجل والكور (Legs & Abs)', exerciseIds: ['legs-1', 'legs-2', 'legs-3', 'abs-1'] }
            ]
        },
        {
            id: 'prog-strength-5x5',
            title: 'ستارتنج سترينث 5x5 للقوة الأساسية (Starting Strength)',
            cat: 'strength',
            daysCount: 3,
            level: 'مبتدئ إلى متوسط',
            goal: 'زيادة القوة القصوى للأوزان الحرة',
            banner: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=60',
            days: [
                { title: 'تمرين A: سكوات، بنش برس، تجديف بار', exerciseIds: ['legs-2', 'chest-1', 'back-2'] },
                { title: 'تمرين B: سكوات، ضغط أكتاف، ديدليفت', exerciseIds: ['legs-2', 'shoulders-1', 'back-3'] }
            ]
        },
        {
            id: 'prog-upper-lower',
            title: 'تقسيم علوي وسفلي متقدم (Upper / Lower 4-Day)',
            cat: 'upper_lower',
            daysCount: 4,
            level: 'مناسب لجميع المستويات',
            goal: 'أفضل استشفاء وتطور أسبوعي',
            banner: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&auto=format&fit=crop&q=60',
            days: [
                { title: 'اليوم 1: الجزء العلوي قوة (Upper Strength)', exerciseIds: ['chest-1', 'back-1', 'shoulders-1', 'arms-1'] },
                { title: 'اليوم 2: الجزء السفلي قوة (Lower Strength)', exerciseIds: ['legs-1', 'legs-2', 'legs-3', 'abs-1'] }
            ]
        }
    ];

    function renderProPrograms(cat = 'all') {
        const container = document.getElementById('proProgramsGrid');
        if (!container) return;
        container.innerHTML = '';

        const list = cat === 'all'
            ? PRO_PROGRAMS_DATA
            : PRO_PROGRAMS_DATA.filter(p => p.cat === cat);

        list.forEach(prog => {
            const card = document.createElement('div');
            card.className = 'glass-card glass-card-hover rounded-3xl p-6 space-y-5 border border-white/5 flex flex-col justify-between';

            let daysHtml = '';
            prog.days.forEach((day, idx) => {
                daysHtml += \`
                    <div class="p-3.5 rounded-2xl bg-fitDark-900 border border-white/5 space-y-2">
                        <div class="flex items-center justify-between">
                            <h5 class="text-xs font-bold text-white">\${day.title}</h5>
                            <button onclick="activateProgramDay('\${prog.id}', \${idx})"
                                    class="px-2.5 py-1 rounded-lg bg-muscleRed/20 hover:bg-muscleRed text-muscleRed hover:text-white border border-muscleRed/40 font-bold text-[10px] transition-all">
                                تفعيل كجدول نشط
                            </button>
                        </div>
                    </div>
                \`;
            });

            card.innerHTML = \`
                <div class="space-y-4">
                    <div class="h-44 rounded-2xl overflow-hidden relative border border-white/5">
                        <img src="\${prog.banner}" alt="\${prog.title}" class="w-full h-full object-cover">
                        <div class="absolute inset-0 bg-gradient-to-t from-fitDark-950 via-fitDark-950/40 to-transparent"></div>
                        <div class="absolute bottom-3 right-3 left-3 flex items-center justify-between">
                            <span class="px-2.5 py-1 rounded-full bg-amberGold text-black font-black text-[10px] font-num">
                                \${prog.daysCount} أيام / أسبوع
                            </span>
                            <span class="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-zinc-300 font-bold text-[10px]">
                                \${prog.level}
                            </span>
                        </div>
                    </div>

                    <div>
                        <h3 class="text-base font-bold text-white">\${prog.title}</h3>
                        <p class="text-xs text-amberGold mt-1"><i class="fa-solid fa-bullseye ml-1"></i>الهدف: \${prog.goal}</p>
                    </div>

                    <div class="space-y-2">
                        \${daysHtml}
                    </div>
                </div>

                <div class="pt-3 border-t border-white/5 flex items-center gap-2">
                    <button onclick="exportProgramToWhatsApp('\${prog.id}')"
                            class="flex-1 py-2.5 rounded-xl bg-fitDark-800 hover:bg-fitDark-750 text-emerald-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors">
                        <i class="fa-brands fa-whatsapp text-sm"></i>
                        <span>مشاركة الخطة عبر واتساب</span>
                    </button>
                </div>
            \`;
            container.appendChild(card);
        });
    }

    window.filterProgramsCategory = function(cat) {
        document.querySelectorAll('.program-cat-btn').forEach(btn => {
            if (btn.getAttribute('data-cat') === cat) {
                btn.className = 'program-cat-btn shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all bg-amberGold text-black shadow-amberGlow';
            } else {
                btn.className = 'program-cat-btn shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all bg-fitDark-800 text-zinc-300 hover:text-white';
            }
        });
        renderProPrograms(cat);
    };

    window.activateProgramDay = function(progId, dayIdx) {
        const prog = PRO_PROGRAMS_DATA.find(p => p.id === progId);
        if (!prog || !prog.days[dayIdx]) return;

        const day = prog.days[dayIdx];
        STATE.activeWorkout = {
            title: prog.title + ' - ' + day.title,
            date: new Date().toISOString(),
            exercises: []
        };

        day.exerciseIds.forEach(id => {
            const ex = STATE.allExercises.find(e => e.id === id);
            if (ex) {
                STATE.activeWorkout.exercises.push({
                    id: ex.id,
                    name: ex.name,
                    muscle: ex.muscleNameAr || ex.muscle,
                    file: ex.file,
                    equipment: ex.equipment,
                    sets: [
                        { reps: 10, weight: 20, completed: false },
                        { reps: 10, weight: 25, completed: false },
                        { reps: 8, weight: 30, completed: false }
                    ]
                });
            }
        });

        saveActiveWorkout();
        updateActiveWorkoutUI();
        switchMainTab('active_session');
        showToast('تم تفعيل "' + day.title + '" كجدول نشط لليوم! 🔥');
        VoiceGuide.speak('تم تفعيل ' + day.title + ' كجدول نشط لليوم');
    };

    window.exportProgramToWhatsApp = function(progId) {
        const prog = PRO_PROGRAMS_DATA.find(p => p.id === progId);
        if (!prog) return;

        let msg = '🏆 *خطة ' + prog.title + ' المعتمدة من FitCraft* 🏋️‍♂️\\n';
        msg += '🎯 *الهدف:* ' + prog.goal + '\\n';
        msg += '📅 *الأيام:* ' + prog.daysCount + ' أيام أسبوعياً\\n';
        msg += '━━━━━━━━━━━━━━━━━━━━\\n';
        prog.days.forEach(d => {
            msg += '\\n📍 *' + d.title + '*\\n';
            d.exerciseIds.forEach(id => {
                const ex = STATE.allExercises.find(e => e.id === id);
                if (ex) msg += '  • ' + ex.name + ' (' + (ex.muscleNameAr || ex.muscle) + ')\\n';
            });
        });
        msg += '\\n🔥 انطلق وتمرن بذكاء مع FitCraft!';

        const url = 'https://wa.me/?text=' + encodeURIComponent(msg);
        window.open(url, '_blank');
    };

    // --- 19. SMART ROUTINE GENERATOR WITH INJURY BLACKLIST & WEAK MUSCLE FOCUS ---
    function renderGeneratorEquipmentCheckboxes() {
        const container = document.getElementById('generatorEquipmentChecks');
        if (!container) return;
        container.innerHTML = '';

        EQUIPMENT_CATALOG.forEach(eq => {
            const isChecked = STATE.generator.selectedEquipment.has(eq.id);
            const item = document.createElement('label');
            item.className = 'flex items-center gap-2 p-2.5 rounded-xl bg-fitDark-900 border border-white/5 cursor-pointer hover:border-amberGold/30 select-none';
            item.innerHTML = \`
                <input type="checkbox" \${isChecked ? 'checked' : ''} onchange="toggleGeneratorEquipment('\${eq.id}')"
                       class="w-4 h-4 rounded text-amberGold focus:ring-amberGold bg-fitDark-800 border-zinc-700">
                <span class="text-xs font-bold text-zinc-300">\${eq.name}</span>
            \`;
            container.appendChild(item);
        });
    }

    window.toggleGeneratorEquipment = function(eqId) {
        if (STATE.generator.selectedEquipment.has(eqId)) {
            STATE.generator.selectedEquipment.delete(eqId);
        } else {
            STATE.generator.selectedEquipment.add(eqId);
        }
    };

    window.selectAllGeneratorEquipment = function() {
        EQUIPMENT_CATALOG.forEach(eq => STATE.generator.selectedEquipment.add(eq.id));
        renderGeneratorEquipmentCheckboxes();
    };

    window.toggleInjuryFilter = function(injuryId) {
        if (STATE.generator.injuries.has(injuryId)) {
            STATE.generator.injuries.delete(injuryId);
        } else {
            STATE.generator.injuries.add(injuryId);
            showToast('تم تفعيل حماية مفصل ' + injuryId + ' واستبعاد التمارين المجهدة 🛡️');
        }
    };

    window.setGeneratorGoal = function(goal) {
        STATE.generator.goal = goal;
        ['hypertrophy', 'strength', 'fatloss', 'mobility'].forEach(g => {
            const btn = document.getElementById('genGoal-' + g);
            if (btn) {
                if (g === goal) {
                    btn.className = 'gen-goal-btn p-3 rounded-xl border-2 border-amberGold bg-amberGold/15 text-white font-bold text-xs flex flex-col items-center gap-1.5 transition-all';
                } else {
                    btn.className = 'gen-goal-btn p-3 rounded-xl border-2 border-white/5 bg-fitDark-850 hover:border-zinc-500 text-zinc-300 font-bold text-xs flex flex-col items-center gap-1.5 transition-all';
                }
            }
        });
    };

    window.setGeneratorLevel = function(lvl) {
        STATE.generator.level = lvl;
        ['beginner', 'intermediate', 'advanced'].forEach(l => {
            const btn = document.getElementById('genLevel-' + l);
            if (btn) {
                if (l === lvl) {
                    btn.className = 'gen-level-btn p-3 rounded-xl border-2 border-amberGold bg-amberGold text-black font-bold text-xs text-center transition-all';
                } else {
                    btn.className = 'gen-level-btn p-3 rounded-xl border border-white/5 bg-fitDark-850 text-zinc-300 font-bold text-xs text-center transition-all';
                }
            }
        });
    };

    window.setGeneratorDays = function(days) {
        STATE.generator.days = days;
        document.querySelectorAll('.gen-days-btn').forEach(btn => {
            if (parseInt(btn.getAttribute('data-days')) === days) {
                btn.className = 'gen-days-btn py-2.5 rounded-xl border-2 border-amberGold bg-amberGold text-black text-xs font-num font-bold';
            } else {
                btn.className = 'gen-days-btn py-2.5 rounded-xl border border-white/5 bg-fitDark-850 text-xs font-num font-bold';
            }
        });
    };

    window.setGeneratorDuration = function(dur) {
        STATE.generator.duration = dur;
        document.querySelectorAll('.gen-dur-btn').forEach(btn => {
            if (parseInt(btn.getAttribute('data-dur')) === dur) {
                btn.className = 'gen-dur-btn py-2.5 rounded-xl border-2 border-amberGold bg-amberGold text-black text-xs font-num font-bold';
            } else {
                btn.className = 'gen-dur-btn py-2.5 rounded-xl border border-white/5 bg-fitDark-850 text-xs font-num font-bold';
            }
        });
    };

    window.generateSmartRoutine = function() {
        const availEq = STATE.generator.selectedEquipment;
        if (availEq.size === 0) {
            showToast('يرجى تحديد جهاز أو أداة واحدة على الأقل متاحة لديك');
            return;
        }

        // Filter compatible exercises by Equipment
        let compatibleExercises = STATE.allExercises.filter(ex => availEq.has(ex.equipment));

        // Active Injury Blacklist Filter (Exclude contra-indicated exercises)
        if (STATE.generator.injuries.size > 0) {
            compatibleExercises = compatibleExercises.filter(ex => {
                if (!ex.contraindicatedFor || ex.contraindicatedFor.length === 0) return true;
                for (const injury of STATE.generator.injuries) {
                    if (ex.contraindicatedFor.includes(injury)) return false;
                }
                return true;
            });
        }

        if (compatibleExercises.length < 5) {
            showToast('الأجهزة والخيارات المحددة بها تمارين قليلة، وسع خيارات الأجهزة لتوليد جدول متوازن');
            return;
        }

        const priorityMuscle = document.getElementById('genPriorityMuscleSelect')?.value || 'balanced';
        const daysCount = STATE.generator.days;
        const routineDays = [];

        const splits = {
            2: [
                { title: 'اليوم 1: الجزء العلوي وكور (Upper Focus)', muscles: ['chest', 'back', 'shoulders', 'arms', 'abs'] },
                { title: 'اليوم 2: الجزء السفلي والظهر (Lower & Back)', muscles: ['legs', 'back', 'abs'] }
            ],
            3: [
                { title: 'اليوم 1: الجزء العلوي (Upper Body)', muscles: ['chest', 'back', 'shoulders', 'arms'] },
                { title: 'اليوم 2: الجزء السفلي والكور (Lower Body & Core)', muscles: ['legs', 'abs'] },
                { title: 'اليوم 3: تمرين شامل للجسم بالكامل (Full Body Power)', muscles: ['chest', 'back', 'legs', 'shoulders'] }
            ],
            4: [
                { title: 'اليوم 1: الجزء العلوي قوة (Upper Power)', muscles: ['chest', 'back', 'shoulders'] },
                { title: 'اليوم 2: الجزء السفلي قوة (Lower Power)', muscles: ['legs', 'abs'] },
                { title: 'اليوم 3: الجزء العلوي ضخامة (Upper Hypertrophy)', muscles: ['chest', 'back', 'arms'] },
                { title: 'اليوم 4: الجزء السفلي والكور (Lower Hypertrophy)', muscles: ['legs', 'abs'] }
            ],
            5: [
                { title: 'اليوم 1: عضلات الصدر والترايسبس (Chest & Triceps)', muscles: ['chest', 'arms'] },
                { title: 'اليوم 2: عضلات الظهر والبايسبس (Back & Biceps)', muscles: ['back', 'arms'] },
                { title: 'اليوم 3: الأرجل والسمانة (Legs & Calves)', muscles: ['legs'] },
                { title: 'اليوم 4: الأكتاف والترابيس (Shoulders & Traps)', muscles: ['shoulders'] },
                { title: 'اليوم 5: الأذرع والكور (Arms & Core Focus)', muscles: ['arms', 'abs'] }
            ],
            6: [
                { title: 'اليوم 1: دفع A (Push - الصدر، الأكتاف، الترايسبس)', muscles: ['chest', 'shoulders', 'arms'] },
                { title: 'اليوم 2: سحب A (Pull - الظهر، المجنص، البايسبس)', muscles: ['back', 'arms'] },
                { title: 'اليوم 3: أرجل A (Legs & Abs)', muscles: ['legs', 'abs'] },
                { title: 'اليوم 4: دفع B (Push Focus)', muscles: ['chest', 'shoulders'] },
                { title: 'اليوم 5: سحب B (Pull Focus)', muscles: ['back', 'arms'] },
                { title: 'اليوم 6: أرجل B (Legs Focus)', muscles: ['legs', 'abs'] }
            ]
        };

        const selectedSplit = splits[daysCount] || splits[4];

        selectedSplit.forEach(d => {
            const exercisesForDay = [];

            // PRIORITY WEAK MUSCLE FOCUS: Add priority muscle exercise FIRST if applicable
            if (priorityMuscle !== 'balanced' && d.muscles.includes(priorityMuscle)) {
                const priorityMatches = compatibleExercises.filter(e => e.muscle === priorityMuscle);
                if (priorityMatches.length > 0) {
                    exercisesForDay.push(priorityMatches[0]);
                }
            }

            d.muscles.forEach(m => {
                const matchMuscles = compatibleExercises.filter(e => e.muscle === m);
                if (matchMuscles.length > 0) {
                    const pick = matchMuscles[Math.floor(Math.random() * matchMuscles.length)];
                    if (!exercisesForDay.some(x => x.id === pick.id)) {
                        exercisesForDay.push(pick);
                    }
                }
            });

            routineDays.push({
                title: d.title,
                exercises: exercisesForDay
            });
        });

        renderGeneratedRoutineOutput(routineDays);
    };

    function renderGeneratedRoutineOutput(routineDays) {
        const container = document.getElementById('generatedRoutineOutput');
        const listEl = document.getElementById('generatedRoutineDaysList');
        if (!container || !listEl) return;

        listEl.innerHTML = '';
        routineDays.forEach((day, dayIdx) => {
            const dayCard = document.createElement('div');
            dayCard.className = 'glass-card rounded-2xl p-4 sm:p-5 space-y-3 border border-white/5';

            let exHtml = '';
            day.exercises.forEach(ex => {
                exHtml += \`
                    <div class="flex items-center justify-between p-2 rounded-xl bg-fitDark-900 border border-white/5 text-xs">
                        <div class="flex items-center gap-2">
                            <span class="w-1.5 h-1.5 rounded-full bg-amberGold"></span>
                            <span class="font-bold text-white">\${ex.name}</span>
                        </div>
                        <span class="text-[10px] text-zinc-400 font-num">\${ex.equipment}</span>
                    </div>
                \`;
            });

            dayCard.innerHTML = \`
                <div class="flex items-center justify-between border-b border-white/5 pb-2">
                    <h4 class="text-xs font-bold text-amberGold">\${day.title}</h4>
                    <button onclick="activateGeneratedDay(\${dayIdx})"
                            class="px-2.5 py-1 rounded-lg bg-amberGold/20 hover:bg-amberGold text-amberGold hover:text-black font-bold text-[10px] transition-all">
                        تفعيل كيوم نشط
                    </button>
                </div>
                <div class="space-y-1.5">
                    \${exHtml || '<p class="text-[11px] text-zinc-500">لا توجد تمارين كافية لهذا اليوم.</p>'}
                </div>
            \`;
            listEl.appendChild(dayCard);
        });

        window._currentGeneratedRoutine = routineDays;
        container.classList.remove('hidden');
        container.scrollIntoView({ behavior: 'smooth' });
        showToast('تم بناء جدولك الذكي التكيفي بنجاح! 🚀');
        VoiceGuide.speak('تم بناء جدولك الذكي، يمكنك تفعيل أي يوم لمباشرة التمرين');
    }

    window.activateGeneratedDay = function(dayIdx) {
        if (!window._currentGeneratedRoutine || !window._currentGeneratedRoutine[dayIdx]) return;
        const day = window._currentGeneratedRoutine[dayIdx];

        STATE.activeWorkout = {
            title: 'المولد الذكي: ' + day.title,
            date: new Date().toISOString(),
            exercises: day.exercises.map(ex => ({
                id: ex.id,
                name: ex.name,
                muscle: ex.muscleNameAr || ex.muscle,
                file: ex.file,
                equipment: ex.equipment,
                sets: [
                    { reps: 10, weight: 20, completed: false },
                    { reps: 10, weight: 25, completed: false },
                    { reps: 8, weight: 30, completed: false }
                ]
            }))
        };

        saveActiveWorkout();
        updateActiveWorkoutUI();
        switchMainTab('active_session');
        showToast('تم تفعيل جدول اليوم المولد بنجاح! 🔥');
        VoiceGuide.speak('تم تفعيل ' + day.title + '، ابدأ تمرينك');
    };

    // --- 20. USER PROFILE & COMMITMENT DASHBOARD ---
    function renderProfileDetails() {
        const p = STATE.profile;
        const nameEl = document.getElementById('profileNameDisplay');
        const streakEl = document.getElementById('profileStreakDisplay');
        const bestStreakEl = document.getElementById('profileBestStreakDisplay');
        const workoutsEl = document.getElementById('profileWorkoutsCountDisplay');
        const volEl = document.getElementById('profileTotalVolumeDisplay');

        if (nameEl) nameEl.innerText = p.name || 'المتدرب الرياضي';
        if (streakEl) streakEl.innerText = p.streak || 0;
        if (bestStreakEl) bestStreakEl.innerText = p.bestStreak || p.streak || 0;
        if (workoutsEl) workoutsEl.innerText = p.workoutsCount || 0;
        if (volEl) volEl.innerText = (p.totalVolume || 0).toLocaleString('en-US');

        const nameInput = document.getElementById('profileNameInput');
        const ageInput = document.getElementById('profileAgeInput');
        const weightInput = document.getElementById('profileWeightInput');
        const heightInput = document.getElementById('profileHeightInput');
        const genderInput = document.getElementById('profileGenderInput');
        const actInput = document.getElementById('profileActivityInput');

        if (nameInput) nameInput.value = p.name || '';
        if (ageInput) ageInput.value = p.age || 26;
        if (weightInput) weightInput.value = p.weight || 75;
        if (heightInput) heightInput.value = p.height || 178;
        if (genderInput) genderInput.value = p.gender || 'male';
        if (actInput) actInput.value = p.activity || 1.55;

        renderMiniCalendar();
        calculateBiometrics();
        renderWorkoutHistoryTable();
    }

    function renderMiniCalendar() {
        const grid = document.getElementById('miniCalendarGrid');
        if (!grid) return;
        grid.innerHTML = '';

        const today = new Date();
        const activeDays = new Set(STATE.profile.activeDays || []);

        const daysToShow = 28;
        const startDate = new Date();
        startDate.setDate(today.getDate() - (daysToShow - 1));

        for (let i = 0; i < daysToShow; i++) {
            const d = new Date(startDate);
            d.setDate(startDate.getDate() + i);
            const iso = d.toISOString().split('T')[0];
            const dayNum = d.getDate();
            const isCompleted = activeDays.has(iso);
            const isToday = iso === today.toISOString().split('T')[0];

            const dayCell = document.createElement('div');
            dayCell.className = 'p-2 rounded-xl text-center flex flex-col items-center justify-center transition-all ' + (
                isCompleted
                    ? 'bg-gradient-to-tr from-cyberEmerald/25 to-amberGold/25 border border-cyberEmerald/40 text-cyberEmerald shadow-emeraldGlow'
                    : isToday
                        ? 'bg-white/10 border border-amberGold/50 text-amberGold'
                        : 'bg-fitDark-900 border border-white/5 text-zinc-500'
            );

            dayCell.innerHTML = \`
                <span class="text-[11px] font-num font-bold">\${dayNum}</span>
                <span class="text-[9px] mt-0.5">\${isCompleted ? '🔥' : isToday ? '•' : ''}</span>
            \`;
            grid.appendChild(dayCell);
        }
    }

    function calculateBiometrics() {
        const w = parseFloat(document.getElementById('profileWeightInput')?.value || 75);
        const h = parseFloat(document.getElementById('profileHeightInput')?.value || 178);
        const age = parseFloat(document.getElementById('profileAgeInput')?.value || 26);
        const gender = document.getElementById('profileGenderInput')?.value || 'male';
        const activity = parseFloat(document.getElementById('profileActivityInput')?.value || 1.55);

        // BMI
        const hM = h / 100;
        const bmi = (w / (hM * hM)).toFixed(1);
        const bmiEl = document.getElementById('bioBmiValue');
        const bmiBadge = document.getElementById('bioBmiBadge');
        if (bmiEl) bmiEl.innerText = bmi;
        if (bmiBadge) {
            if (bmi < 18.5) {
                bmiBadge.innerText = 'نقص في الوزن';
                bmiBadge.className = 'text-[10px] font-bold px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30';
            } else if (bmi <= 24.9) {
                bmiBadge.innerText = 'وزن مثالي ورشيق';
                bmiBadge.className = 'text-[10px] font-bold px-2.5 py-1 rounded-full bg-cyberEmerald/20 text-cyberEmerald border border-cyberEmerald/30';
            } else if (bmi <= 29.9) {
                bmiBadge.innerText = 'زيادة وزن طفيفة';
                bmiBadge.className = 'text-[10px] font-bold px-2.5 py-1 rounded-full bg-amberGold/20 text-amberGold border border-amberGold/30';
            } else {
                bmiBadge.innerText = 'سمنة';
                bmiBadge.className = 'text-[10px] font-bold px-2.5 py-1 rounded-full bg-muscleRed/20 text-muscleRed border border-muscleRed/30';
            }
        }

        // BMR (Mifflin-St Jeor formula)
        let bmr = (10 * w) + (6.25 * h) - (5 * age);
        bmr = gender === 'male' ? Math.round(bmr + 5) : Math.round(bmr - 161);
        const bmrEl = document.getElementById('bioBmrValue');
        if (bmrEl) bmrEl.innerText = bmr.toLocaleString('en-US');

        // TDEE
        const tdee = Math.round(bmr * activity);
        const tdeeEl = document.getElementById('bioTdeeValue');
        if (tdeeEl) tdeeEl.innerText = tdee.toLocaleString('en-US');

        // Recommended Macronutrients
        const protein = Math.round(w * 2);
        const fats = Math.round(w * 0.9);
        const carbs = Math.max(50, Math.round((tdee - (protein * 4 + fats * 9)) / 4));

        const protEl = document.getElementById('bioProteinValue');
        const carbEl = document.getElementById('bioCarbsValue');
        const fatEl = document.getElementById('bioFatsValue');

        if (protEl) protEl.innerText = protein + 'g';
        if (carbEl) carbEl.innerText = carbs + 'g';
        if (fatEl) fatEl.innerText = fats + 'g';
    }

    window.saveUserProfileData = function() {
        STATE.profile.name = document.getElementById('profileNameInput')?.value || 'المتدرب الرياضي';
        STATE.profile.age = parseFloat(document.getElementById('profileAgeInput')?.value || 26);
        STATE.profile.weight = parseFloat(document.getElementById('profileWeightInput')?.value || 75);
        STATE.profile.height = parseFloat(document.getElementById('profileHeightInput')?.value || 178);
        STATE.profile.gender = document.getElementById('profileGenderInput')?.value || 'male';
        STATE.profile.activity = parseFloat(document.getElementById('profileActivityInput')?.value || 1.55);

        localStorage.setItem('fitcraft_user_profile', JSON.stringify(STATE.profile));
        calculateBiometrics();
        renderProfileDetails();
        showToast('تم حفظ وتحديث ملف المتدرب بنجاح! ✅');
    };

    function renderWorkoutHistoryTable() {
        const tbody = document.getElementById('workoutHistoryTableBody');
        if (!tbody) return;
        tbody.innerHTML = '';

        const history = STATE.profile.workoutHistory || [];
        if (history.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="py-4 text-center text-zinc-500">لا توجد حصص مسجلة بعد.</td></tr>';
            return;
        }

        history.slice(0, 15).forEach(item => {
            const tr = document.createElement('tr');
            tr.className = 'hover:bg-white/5 transition-colors';
            tr.innerHTML = \`
                <td class="py-2.5 px-3 text-zinc-400 font-num">\${item.date}</td>
                <td class="py-2.5 px-3 font-bold text-white">\${item.title}</td>
                <td class="py-2.5 px-3 font-num text-amberGold">\${item.exercisesCount || 0} تمارين</td>
                <td class="py-2.5 px-3 font-num font-bold text-cyberEmerald">\${item.totalVolume || '2,400 كجم'}</td>
                <td class="py-2.5 px-3 text-zinc-400 font-num">\${item.duration || '45 دقيقة'}</td>
            \`;
            tbody.appendChild(tr);
        });
    }

    window.clearWorkoutHistory = function() {
        if (confirm('هل أنت متأكد من مسح سجل التمارين؟')) {
            STATE.profile.workoutHistory = [];
            STATE.profile.totalVolume = 0;
            saveUserProfileData();
            renderProfileDetails();
            showToast('تم مسح سجل التمارين بنجاح');
        }
    };

    window.exportUserDataBackup = function() {
        const backup = {
            version: '2.0',
            exportDate: new Date().toISOString(),
            exercisesDb: STATE.allExercises,
            profile: STATE.profile,
            activeWorkout: STATE.activeWorkout
        };

        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
        const dlAnchor = document.createElement('a');
        dlAnchor.setAttribute('href', dataStr);
        dlAnchor.setAttribute('download', 'fitcraft_backup_' + new Date().toISOString().split('T')[0] + '.json');
        dlAnchor.click();
        showToast('تم تصدير ملف النسخة الاحتياطية بنجاح 💾');
    };

    window.importUserDataBackup = function(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const parsed = JSON.parse(e.target.result);
                if (parsed.profile) {
                    STATE.profile = parsed.profile;
                    localStorage.setItem('fitcraft_user_profile', JSON.stringify(STATE.profile));
                }
                if (parsed.exercisesDb && Array.isArray(parsed.exercisesDb)) {
                    STATE.allExercises = parsed.exercisesDb;
                    localStorage.setItem('fitcraft_exercises_db', JSON.stringify(STATE.allExercises));
                }
                if (parsed.activeWorkout) {
                    STATE.activeWorkout = parsed.activeWorkout;
                    localStorage.setItem('fitcraft_active_workout', JSON.stringify(STATE.activeWorkout));
                }
                showToast('تم استيراد النسخة الاحتياطية بنجاح! جاري التحديث...');
                setTimeout(() => window.location.reload(), 1200);
            } catch (err) {
                showToast('خطأ في قراءة ملف النسخة الاحتياطية');
            }
        };
        reader.readAsText(file);
    };

    // --- 21. ADMIN CONTROL CENTER (CRUD & Media Toggle) ---
    window.verifyAdminPin = function() {
        const pin = document.getElementById('adminPinInput')?.value;
        if (pin === STATE.admin.pin) {
            STATE.admin.isUnlocked = true;
            document.getElementById('adminLockedState')?.classList.add('hidden');
            document.getElementById('adminUnlockedContent')?.classList.remove('hidden');
            updateAdminStats();
            renderCustomExercisesTable();
            showToast('تم فتح لوحة الإدارة بنجاح');
        } else {
            showToast('رمز PIN غير صحيح! الرمز الافتراضي: 1234');
        }
    };

    function updateAdminStats() {
        const exStat = document.getElementById('adminStatsExercises');
        const eqStat = document.getElementById('adminStatsEquipment');
        const prStat = document.getElementById('adminStatsPrograms');
        const stStat = document.getElementById('adminStatsStorage');

        if (exStat) exStat.innerText = STATE.allExercises.length.toLocaleString('en-US');
        if (eqStat) eqStat.innerText = EQUIPMENT_CATALOG.length;
        if (prStat) prStat.innerText = PRO_PROGRAMS_DATA.length;

        let totalBytes = 0;
        for (let x in localStorage) {
            if (localStorage.hasOwnProperty(x)) {
                totalBytes += (localStorage[x].length * 2);
            }
        }
        if (stStat) stStat.innerText = '~' + Math.round(totalBytes / 1024) + ' KB';
    }

    window.handleAddNewExercise = function(e) {
        e.preventDefault();
        const nameAr = document.getElementById('adminExNameAr').value.trim();
        const nameEn = document.getElementById('adminExNameEn').value.trim();
        const muscle = document.getElementById('adminExMuscle').value;
        const equipment = document.getElementById('adminExEquipment').value;
        const file = document.getElementById('adminExGifPath').value.trim() || 'pectorals/barbell-bench-press.gif';
        const alternative = document.getElementById('adminExAlternative').value.trim();

        const newEx = {
            id: 'custom-' + Date.now(),
            slug: nameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            name: nameAr,
            nameEn: nameEn,
            muscle: muscle,
            muscleNameAr: getMuscleArabicName(muscle),
            equipment: equipment,
            difficulty: 'متوسط',
            file: file,
            instructions: [
                'تأكد من ضبط وضعية الجهاز ومحاذاة المفاصل.',
                'قم بأداء التكرارات بتحكم زمني وعصر العضلة في أقصى انقباض.',
                'تنفس بانتظام وتجنب تحميل وزن يخل بالتكنيك.'
            ],
            alternative: alternative,
            isCustom: true
        };

        STATE.allExercises.unshift(newEx);
        localStorage.setItem('fitcraft_exercises_db', JSON.stringify(STATE.allExercises));

        applyFiltersAndRender(true);
        updateAdminStats();
        renderCustomExercisesTable();
        document.getElementById('addCustomExerciseForm').reset();
        showToast('تم حفظ التمرين الجديد في قاعدة البيانات المحلية! 🎉');
    };

    function renderCustomExercisesTable() {
        const tbody = document.getElementById('customExercisesTableBody');
        if (!tbody) return;
        tbody.innerHTML = '';

        const customList = STATE.allExercises.filter(e => e.isCustom || e.id.toString().startsWith('custom-'));
        if (customList.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="py-4 text-center text-zinc-500">لا توجد تمارين مخصصة مضافة حالياً.</td></tr>';
            return;
        }

        customList.forEach(ex => {
            const tr = document.createElement('tr');
            tr.className = 'hover:bg-white/5 transition-colors';
            tr.innerHTML = \`
                <td class="py-2.5 px-3 font-bold text-white">\${ex.name}</td>
                <td class="py-2.5 px-3 text-amberGold">\${ex.muscleNameAr || ex.muscle}</td>
                <td class="py-2.5 px-3 text-zinc-400">\${ex.equipment}</td>
                <td class="py-2.5 px-3 text-center">
                    <button onclick="deleteCustomExercise('\${ex.id}')" class="px-2.5 py-1 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 text-[10px]">
                        حذف
                    </button>
                </td>
            \`;
            tbody.appendChild(tr);
        });
    }

    window.deleteCustomExercise = function(id) {
        if (confirm('هل أنت متأكد من حذف هذا التمرين من قاعدة البيانات؟')) {
            STATE.allExercises = STATE.allExercises.filter(x => x.id !== id);
            localStorage.setItem('fitcraft_exercises_db', JSON.stringify(STATE.allExercises));
            applyFiltersAndRender(true);
            updateAdminStats();
            renderCustomExercisesTable();
            showToast('تم حذف التمرين بنجاح');
        }
    };

    window.confirmFactoryReset = function() {
        if (confirm('تحذير: هل أنت متأكد تماماً من استعادة ضبط المصنع؟ سيتم تصفير localStorage بالكامل.')) {
            localStorage.clear();
            showToast('جاري إعادة تعيين النظام...');
            setTimeout(() => window.location.reload(), 1000);
        }
    };

    // --- 22. MEDIA SOURCE & LOCAL SERVER MODAL ---
    window.openMediaSettingsModal = function() {
        document.getElementById('mediaSettingsModal')?.classList.remove('hidden');
        const locInput = document.getElementById('localServerUrlInput');
        if (locInput) locInput.value = STATE.localServerUrl;
        updateMediaSourceButtons();
    };

    window.closeMediaSettingsModal = function() {
        document.getElementById('mediaSettingsModal')?.classList.add('hidden');
    };

    window.setMediaSource = function(src) {
        STATE.mediaSource = src;
        localStorage.setItem('fitcraft_media_source', src);
        updateMediaSourceButtons();
        showToast('تم تغيير مصدر الوسائط إلى: ' + (src === 'local' ? 'السيرفر المحلي' : 'سحابة CDN'));
        applyFiltersAndRender();
    };

    function updateMediaSourceButtons() {
        const locBtn = document.getElementById('mediaSrcBtn-local');
        const cdnBtn = document.getElementById('mediaSrcBtn-cdn');
        if (locBtn && cdnBtn) {
            if (STATE.mediaSource === 'local') {
                locBtn.className = 'p-3 rounded-xl border-2 border-amberGold bg-amberGold/15 text-white font-bold text-xs flex flex-col items-center gap-1';
                cdnBtn.className = 'p-3 rounded-xl border border-white/10 bg-fitDark-850 text-zinc-400 font-bold text-xs flex flex-col items-center gap-1';
            } else {
                cdnBtn.className = 'p-3 rounded-xl border-2 border-amberGold bg-amberGold/15 text-white font-bold text-xs flex flex-col items-center gap-1';
                locBtn.className = 'p-3 rounded-xl border border-white/10 bg-fitDark-850 text-zinc-400 font-bold text-xs flex flex-col items-center gap-1';
            }
        }
    }

    window.testLocalServerPing = async function() {
        const url = document.getElementById('localServerUrlInput')?.value.trim();
        if (!url) return;
        STATE.localServerUrl = url;
        localStorage.setItem('fitcraft_server_url', url);

        const resultEl = document.getElementById('pingStatusResult');
        if (resultEl) resultEl.innerText = 'جاري الفحص...';

        try {
            const cleanUrl = url.endsWith('/') ? url.slice(0, -1) : url;
            const res = await fetch(cleanUrl + '/gym-exercises/package.json', { mode: 'no-cors' });
            if (resultEl) {
                resultEl.innerText = 'حالة الاتصال: الخادم متصل بنجاح! ✅';
                resultEl.className = 'text-[11px] text-cyberEmerald pt-1';
            }
        } catch (err) {
            if (resultEl) {
                resultEl.innerText = 'حالة الاتصال: تعذر الوصول، تأكد من تشغيل الخادم ❌';
                resultEl.className = 'text-[11px] text-muscleRed pt-1';
            }
        }
    };

    // --- 23. TOAST & UTILITIES ---
    window.showToast = function(msg) {
        const toast = document.getElementById('toastNotification');
        const msgEl = document.getElementById('toastMessage');
        if (!toast || !msgEl) return;

        msgEl.innerText = msg;
        toast.classList.remove('translate-y-12', 'opacity-0');
        toast.classList.add('translate-y-0', 'opacity-100');

        setTimeout(() => {
            toast.classList.remove('translate-y-0', 'opacity-100');
            toast.classList.add('translate-y-12', 'opacity-0');
        }, 3000);
    };

    window.clearGlobalSearch = function() {
        STATE.searchQuery = '';
        const gInput = document.getElementById('globalSearchInput');
        if (gInput) gInput.value = '';
        toggleClearSearchBtn('');
        applyFiltersAndRender(true);
    };

    function toggleClearSearchBtn(val) {
        const btn = document.getElementById('clearGlobalSearchBtn');
        if (btn) {
            if (val) btn.classList.remove('hidden');
            else btn.classList.add('hidden');
        }
    }

})();
`;

fs.writeFileSync('engine.js', engineCode, 'utf8');
console.log('engine.js written successfully! Size:', (fs.statSync('engine.js').size / 1024).toFixed(1) + ' KB');
