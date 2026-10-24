const fs = require('fs');
const path = require('path');

const BUILTIN_PROGRAM_FILES = [
  "arnold-split.md",
  "arnoldgoldensix.md",
  "barbell-medicine-the-bridge.md",
  "basicBeginner.md",
  "bro-split.md",
  "bullmastiff.md",
  "calgary-barbell-16-week.md",
  "coolcicada-ppl.md",
  "cube-method.md",
  "dbPpl.md",
  "deep-water.md",
  "doggcrapp.md",
  "doug-hepburn-method.md",
  "easy-strength.md",
  "fierce-5.md",
  "german-volume-training.md",
  "gzcl-general-gainz.md",
  "gzcl-jacked-and-tan-2.md",
  "gzcl-the-rippler.md",
  "gzcl-uhf-5-weeks.md",
  "gzclp.md",
  "ice-cream-fitness-5x5.md",
  "ivysaur-4-4-8.md",
  "jay-cutler-split.md",
  "juggernaut-method.md",
  "lylegenericbulking.md",
  "madcow.md",
  "metallicadpappl.md",
  "mike-mentzer-heavy-duty.md",
  "monolith531.md",
  "nsuns.md",
  "phat.md",
  "phrakgreyskull.md",
  "phul.md",
  "planet-fitness-hypertrophy.md",
  "recommended-routine.md",
  "sheiko-29-32.md",
  "shortcut-to-size.md",
  "smolov-jr.md",
  "smolov-squat.md",
  "ss1.md",
  "ss2.md",
  "ss3.md",
  "strongcurves.md",
  "super-squats.md",
  "texasmethod.md",
  "the531bbb.md",
  "westside-for-skinny-bastards.md"
];

const AR_NAMES = {
  "arnold-split": "نظام أرنولد شوارزنيجر (Arnold Split 6-Day)",
  "arnoldgoldensix": "الستة الذهبية لأرنولد (Golden Six Full Body)",
  "barbell-medicine-the-bridge": "باربيل ميديسين: الجسر (The Bridge)",
  "basicBeginner": "البرنامج التأسيسي للمبتدئين (Basic Beginner)",
  "bro-split": "الجدول التقليدي الكلاسيكي (Bro Split 5-Day)",
  "bullmastiff": "برنامج بول ماستيف للقوة والحجم (Bullmastiff)",
  "calgary-barbell-16-week": "كالغاري باورليفتنج 16 أسبوع (Calgary Barbell)",
  "coolcicada-ppl": "كول سيكادا دفع سحب أرجل (Coolcicada PPL)",
  "cube-method": "طريقة المكعب لبراندون ليلي (Cube Method)",
  "dbPpl": "جدول PPL بالدمبلز فقط للمنزل (Dumbbell PPL)",
  "deep-water": "المياه العميقة لجون أندرسن (Deep Water Beginner)",
  "doggcrapp": "تدريب DC الشرس ريست بوز (Doggcrapp DC)",
  "doug-hepburn-method": "طريقة دوغ هيبورن للقوة الخارقة (Doug Hepburn)",
  "easy-strength": "القوة السهلة لدان جون (Dan John Easy Strength)",
  "fierce-5": "فيرس فايف لكامل الجسم (Fierce 5 Novice)",
  "german-volume-training": "التدريب الحجمي الألماني 10×10 (GVT)",
  "gzcl-general-gainz": "جنرال جينز لكودي ليفيفر (General Gainz)",
  "gzcl-jacked-and-tan-2": "جاكد آند تان 2.0 للتضخيم الفائق (Jacked & Tan 2.0)",
  "gzcl-the-rippler": "ذا ريبلر للتنشيف مع القوة (The Rippler)",
  "gzcl-uhf-5-weeks": "يو إتش إف التردد العالي جداً (GZCL UHF 5-Week)",
  "gzclp": "نظام GZCLP للمبتدئين والمتوسطين (GZCLP Linear)",
  "ice-cream-fitness-5x5": "آيس كريم فيتنس 5×5 (ICF 5x5 Jason Blaha)",
  "ivysaur-4-4-8": "آيفي سور 4-4-8 للتطور المتوازن (Ivysaur 4-4-8)",
  "jay-cutler-split": "تقسيم جاي كتلر ليفينج لارج (Jay Cutler Living Large)",
  "juggernaut-method": "طريقة الجوجرنوت للقوة والقدرة (Juggernaut Method 2.0)",
  "lylegenericbulking": "روتين لايل مكدونالد للتضخيم العام (Lyle Bulking Upper/Lower)",
  "madcow": "مادكاو 5×5 لكسر الثبات (Madcow 5x5 Intermediate)",
  "metallicadpappl": "برنامج ريديت الرسمي دفع سحب أرجل (Reddit Metallicadpa PPL)",
  "mike-mentzer-heavy-duty": "مايك مينتزر هيفي ديوتي الشدة القصوى (Mike Mentzer Heavy Duty)",
  "monolith531": "5/3/1 بناء المونوليث الحجم الأقصى (Building the Monolith)",
  "nsuns": "إن-صنز 5/3/1 بروغريشن متسارع (nSuns 5/3/1 LP)",
  "phat": "لاين نورتون PHAT قوة وتضخيم متقدم (Layne Norton PHAT)",
  "phrakgreyskull": "فراك جرايسكول إل بي (Phrak's Greyskull LP)",
  "phul": "بي إتش يو إل PHUL علوي وسفلي قوة وتضخيم (PHUL 4-Day)",
  "planet-fitness-hypertrophy": "تضخيم الدمبلز والآلات (Dumbbell/Machine Hypertrophy)",
  "recommended-routine": "روتين وزن الجسم المعتمد (Reddit Bodyweight Routine)",
  "sheiko-29-32": "برنامج بوريس شيكو للباورليفتنج (Boris Sheiko Prep)",
  "shortcut-to-size": "شورت كت تو سايز د. جيم ستوباني (Shortcut to Size)",
  "smolov-jr": "سمولوف جونيور لضغط البنش والسكوات (Smolov Jr. 3-Week)",
  "smolov-squat": "دورة سمولوف الكاملة للسكوات الأسطوري (Smolov Squat)",
  "ss1": "ستارتنج سترينث المرحلة 1 (Starting Strength Phase 1)",
  "ss2": "ستارتنج سترينث المرحلة 2 (Starting Strength Phase 2)",
  "ss3": "ستارتنج سترينث المرحلة 3 (Starting Strength Phase 3)",
  "strongcurves": "سترونج كيرفز لنحت الجزء السفلي (Strong Curves)",
  "super-squats": "سوبر سكواتس 20 عدة لتفجير العضلات (Super Squats 20-Rep)",
  "texasmethod": "طريقة تكساس للقوة الأسبوعية (Texas Method)",
  "the531bbb": "جيم وندلر 5/3/1 بورينج بت بيج (5/3/1 Boring But Big)",
  "westside-for-skinny-bastards": "وست سايد للشباب النحفاء (Westside For Skinny Bastards III)"
};

function parseYamlFrontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return { frontmatter: {}, body: text };
  const yamlText = match[1];
  const body = text.slice(match[0].length);
  const data = {};
  yamlText.split('\n').forEach(line => {
    const colonIdx = line.indexOf(':');
    if (colonIdx > 0) {
      const key = line.slice(0, colonIdx).trim();
      let val = line.slice(colonIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      } else if (val === 'true') val = true;
      else if (val === 'false') val = false;
      else if (!isNaN(val) && val !== '') val = Number(val);
      data[key] = val;
    }
  });
  return { frontmatter: data, body };
}

function parseLiftoscript(body) {
  const match = body.match(/```liftoscript\r?\n([\s\S]*?)```/);
  if (!match) return [];
  const script = match[1];
  const lines = script.split('\n').map(l => l.trim()).filter(Boolean);
  const days = [];
  let currentDay = null;

  for (const line of lines) {
    if (line.startsWith('# Week')) {
      // ignore or handle if multiweek
    } else if (line.startsWith('## ')) {
      const dayTitle = line.replace(/^##\s+/, '').trim();
      currentDay = {
        title: dayTitle,
        exercises: [],
        exerciseIds: [],
        focus: dayTitle,
        coachNote: "حافظ على الإيقاع والتحكم في النزول السلبي وضبط الوزن المناسب لكل جولة."
      };
      days.push(currentDay);
    } else if (currentDay && !line.startsWith('#') && !line.startsWith('//') && line.includes('/')) {
      const parts = line.split('/').map(p => p.trim());
      const exName = parts[0];
      const setsReps = parts[1] || '3x10';
      const weight = parts[2] || '';
      const rest = parts[3] || '90s';
      currentDay.exercises.push({
        name: exName,
        setsReps,
        weight,
        rest
      });
      // create a normalized ID token
      const slug = exName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      currentDay.exerciseIds.push(slug);
    }
  }
  return days;
}

function getGoalArabic(goal) {
  if (!goal) return "تضخيم وبناء عضلات وقوة شاملة";
  const g = goal.toLowerCase();
  if (g.includes('hypertrophy') && g.includes('strength')) return "قوة وتضخيم عضلي متوازن (Power & Hypertrophy)";
  if (g.includes('hypertrophy')) return "تضخيم عضلي وزيادة الكتلة الصافية (Hypertrophy)";
  if (g.includes('strength')) return "زيادة القوة البدنية ورفع الأوزان (Strength)";
  if (g.includes('powerlifting')) return "باورليفتنج وقوة رفع قصوى (Powerlifting)";
  if (g.includes('endurance') || g.includes('general')) return "لياقة وقوة تحمل وتناسق بدني";
  return "بناء وتطوير بدني شامل";
}

function getDifficultyArabic(age) {
  if (!age) return "متوسط";
  const a = String(age).toLowerCase();
  if (a.includes('beginner') || a.includes('0_to_3') || a.includes('novice')) return "مبتدئ (0 - 6 أشهر)";
  if (a.includes('3_to_12') || a.includes('intermediate')) return "متوسط (6 - 18 شهراً)";
  if (a.includes('year') || a.includes('advanced')) return "متقدم (سنة ونصف فأكثر)";
  return "جميع المستويات";
}

async function buildLiftosaurPlans() {
  console.log(`Starting Liftosaur programs parser (${BUILTIN_PROGRAM_FILES.length} programs)...`);
  const parsedPlans = [];

  for (const filename of BUILTIN_PROGRAM_FILES) {
    const progId = filename.replace(/\.md$/, '');
    const url = `https://raw.githubusercontent.com/astashov/liftosaur/master/programs/builtin/${filename}`;
    try {
      const res = await fetch(url);
      if (!res.ok) {
        console.warn(`Failed to fetch ${filename}: HTTP ${res.status}`);
        continue;
      }
      const text = await res.text();
      const { frontmatter, body } = parseYamlFrontmatter(text);
      const days = parseLiftoscript(body);

      if (days.length === 0) {
        console.warn(`No days parsed for ${filename}`);
        continue;
      }

      const planObj = {
        id: `liftosaur_${frontmatter.id || progId}`,
        source: "liftosaur",
        name: AR_NAMES[progId] || frontmatter.name || progId,
        nameEn: frontmatter.name || progId,
        author: frontmatter.author || "Liftosaur Built-in",
        icon: "fa-dumbbell",
        difficulty: getDifficultyArabic(frontmatter.age),
        daysCount: frontmatter.frequency || days.length,
        goal: getGoalArabic(frontmatter.goal),
        targetRpe: "RPE 7.5 - 9 (زيادة تدريجية في الحمل الميكانيكي)",
        warmupSets: "1-2 جولة إحماء تصاعدية قبل الأوزان الأساسية",
        progressionTip: frontmatter.shortDescription || "طبق مبدأ الزيادة الدورية في الأوزان أسبوعياً عند إتمام كافة العدات المحددة.",
        description: (frontmatter.shortDescription ? frontmatter.shortDescription + " - " : "") + 
          (body.split('<!-- more -->')[0] || body.split('##')[0] || "").replace(/<[^>]+>/g, '').trim().slice(0, 450),
        requiredEquipment: ["barbell", "dumbbell", "bench"],
        requiredEquipmentNames: ["البار الحر", "الدمبلز", "مقعد التدريب / البنش"],
        days: days.map((d, idx) => ({
          title: `اليوم ${idx + 1}: ${d.title}`,
          focus: d.focus || d.title,
          coachNote: d.coachNote || "التزم بالتكنيك الصحيح وخذ الراحة الكافية بين الجولات.",
          exercises: d.exercises,
          exerciseIds: d.exerciseIds
        }))
      };

      parsedPlans.push(planObj);
      console.log(`Parsed ${progId}: ${days.length} days, ${days.reduce((acc, d) => acc + d.exercises.length, 0)} total exercise slots.`);
    } catch (err) {
      console.error(`Error processing ${filename}:`, err.message);
    }
  }

  // Read existing plans.json
  const existingPath = path.join(__dirname, 'plans.json');
  let currentPlans = [];
  if (fs.existsSync(existingPath)) {
    try {
      currentPlans = JSON.parse(fs.readFileSync(existingPath, 'utf8'));
      console.log(`Loaded ${currentPlans.length} existing plans.`);
    } catch (e) {
      console.warn('Could not parse existing plans.json:', e);
    }
  }

  // Filter out any previous liftosaur plans to avoid duplicates
  const keptPlans = currentPlans.filter(p => !p.id.startsWith('liftosaur_'));
  const finalPlans = [...keptPlans, ...parsedPlans];

  fs.writeFileSync(existingPath, JSON.stringify(finalPlans, null, 2), 'utf8');
  console.log(`Successfully wrote ${finalPlans.length} total workout plans to ${existingPath}`);
}

buildLiftosaurPlans();
