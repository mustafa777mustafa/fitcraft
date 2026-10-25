const fs = require('fs');
const path = require('path');

console.log('Building stretch-mobility-gifs directory and dataset from hasaneyldrm/exercises-dataset...');

const targetDir = path.join(__dirname, 'stretch-mobility-gifs');
if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

const rawDataPath = path.join(__dirname, 'temp_hasan', 'data', 'exercises.json');
if (!fs.existsSync(rawDataPath)) {
    console.error('temp_hasan/data/exercises.json not found!');
    process.exit(1);
}

const exercises = JSON.parse(fs.readFileSync(rawDataPath, 'utf8'));

// Filter stretching, mobility, posture, calisthenics
const stretchKeywords = ['stretch', 'mobility', 'yoga', 'flexibility', 'pose', 'cat cow', 'cobra', 'child', 'pigeon', 'bridge', 'spine', 'neck', 'foam roll'];
const calisthenicsKeywords = ['pull-up', 'chin-up', 'dip', 'push-up', 'pistol squat', 'muscle-up', 'handstand', 'l-sit', 'plank', 'hanging leg'];
const postureKeywords = ['neck', 'shoulder', 'scapular', 'back extension', 'wall slide', 'thoracic', 'glute bridge', 'hip flexor'];

const processedList = [];
let copiedCount = 0;

exercises.forEach(ex => {
    const nameLower = (ex.name || '').toLowerCase();
    const catLower = (ex.category || '').toLowerCase();
    const bpLower = (ex.bodyPart || '').toLowerCase();
    const combined = nameLower + ' ' + catLower + ' ' + bpLower;

    let subCategory = '';
    if (postureKeywords.some(k => combined.includes(k)) && (combined.includes('stretch') || combined.includes('mobility') || combined.includes('slide') || combined.includes('bridge') || combined.includes('neck') || combined.includes('posture'))) {
        subCategory = 'posture_desk';
    } else if (calisthenicsKeywords.some(k => combined.includes(k))) {
        subCategory = 'calisthenics';
    } else if (combined.includes('dynamic') || combined.includes('warm') || combined.includes('rotation') || combined.includes('swing') || combined.includes('circle')) {
        subCategory = 'dynamic_warmup';
    } else if (stretchKeywords.some(k => combined.includes(k)) || catLower === 'stretching') {
        subCategory = 'static_relief';
    }

    if (subCategory) {
        // Source gif file
        const gifRelPath = ex.gif_url || '';
        const gifFileName = path.basename(gifRelPath);
        const srcGifPath = path.join(__dirname, 'temp_hasan', 'videos', gifFileName);
        const destGifPath = path.join(targetDir, gifFileName);

        if (fs.existsSync(srcGifPath)) {
            try {
                if (!fs.existsSync(destGifPath)) {
                    fs.copyFileSync(srcGifPath, destGifPath);
                    copiedCount++;
                }
            } catch (err) {
                // ignore single file error
            }
        }

        // Arabic title translation mapping & cues
        processedList.push({
            id: 'sm-' + ex.id,
            nameEn: ex.name,
            nameAr: translateExerciseNameAr(ex.name, subCategory),
            subCategory: subCategory,
            targetMuscle: ex.target || ex.muscle_group || 'general',
            targetMuscleAr: translateTargetMuscleAr(ex.target || ex.muscle_group || ''),
            gifFile: gifFileName,
            localPath: 'stretch-mobility-gifs/' + gifFileName,
            cdnPath: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/' + gifFileName,
            durationOrReps: getDurationOrReps(subCategory),
            instructionsEn: (ex.instruction_steps && ex.instruction_steps.en) || [],
            cueAr: getArabicCue(subCategory, ex.target || ''),
            level: ex.level || (subCategory === 'calisthenics' ? 'متدرج' : 'عام')
        });
    }
});

function translateExerciseNameAr(name, subCat) {
    if (!name) return 'تمرين مرونة واستشفاء';
    let ar = name;
    // Common replacements
    const map = [
        ['neck', 'الرقبة'],
        ['shoulder', 'الكتف'],
        ['chest', 'الصدر'],
        ['hip flexor', 'مثنيات الحوض'],
        ['hamstring', 'الفخذ الخلفي'],
        ['quadriceps', 'الفخذ الأمامي'],
        ['quad', 'الفخذ الأمامي'],
        ['glute', 'الألوية / الجلوتس'],
        ['calf', 'السمانة'],
        ['spine', 'العمود الفقري'],
        ['thoracic', 'أعلى الظهر'],
        ['lat', 'المجنص والظهر'],
        ['stretch', 'إطالة'],
        ['mobility', 'مرونة'],
        ['pull-up', 'عقلة'],
        ['push-up', 'ضغط'],
        ['dip', 'متوازي'],
        ['pistol squat', 'سكوات بساق واحدة'],
        ['plank', 'بلانك ثبات'],
        ['seated', 'جالساً'],
        ['standing', 'واقفاً'],
        ['kneeling', 'راكعاً'],
        ['lying', 'مستلقياً']
    ];
    let res = name;
    map.forEach(([en, arabic]) => {
        const re = new RegExp('\\b' + en + '\\b', 'gi');
        res = res.replace(re, arabic);
    });
    return 'حركة ' + res;
}

function translateTargetMuscleAr(t) {
    const map = {
        quads: 'الفخذ الأمامي',
        hamstrings: 'الفخذ الخلفي',
        glutes: 'عضلات الألوية',
        calves: 'السمانة والكاحل',
        chest: 'الصدر والأكتاف',
        lats: 'المجنص والظهر',
        shoulders: 'الكتفين واللوح',
        neck: 'الرقبة وأعلى الظهر',
        spine: 'العمود الفقري',
        abdominals: 'عضلات البطن والكور'
    };
    return map[t] || 'مرونة عامة واستشفاء';
}

function getDurationOrReps(subCat) {
    if (subCat === 'dynamic_warmup') return '10-12 تكرار ديناميكي';
    if (subCat === 'static_relief') return '30-45 ثانية ثبات';
    if (subCat === 'posture_desk') return '35 ثانية أو 10 حركات';
    if (subCat === 'calisthenics') return '3 جولات × 8-12 تكرار';
    return '30 ثانية';
}

function getArabicCue(subCat, target) {
    if (subCat === 'posture_desk') return 'افتح القفص الصدري وارجع الذقن للخلف لتحرير الضغط عن الفقرات العنقية.';
    if (subCat === 'calisthenics') return 'حافظ على قفل المفاصل الكامل في القمة وثبات الكور لمنع التأرجح.';
    if (subCat === 'dynamic_warmup') return 'تحرك بنعومة وتدريج في المدى الحركي دون أي ارتداد مفاجئ.';
    return 'تنفس بهدوء بعمق من البطن واسترخِ في أقصى نقطة تمدد مريحة دون ألم حاد.';
}

const outputPath = path.join(__dirname, 'stretch-mobility-data.json');
fs.writeFileSync(outputPath, JSON.stringify(processedList, null, 2), 'utf8');

console.log(`Copied ${copiedCount} GIFs to ./stretch-mobility-gifs/`);
console.log(`Saved ${processedList.length} indexed mobility & posture exercises to ${outputPath}`);
