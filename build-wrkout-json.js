const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'wrkout-data', 'exercises');
if (fs.existsSync(dir)) {
  const folders = fs.readdirSync(dir);
  const all = [];

  for (const folder of folders) {
    const p = path.join(dir, folder, 'exercise.json');
    if (fs.existsSync(p)) {
      try {
        const data = JSON.parse(fs.readFileSync(p, 'utf8'));
        const imgDir = path.join(dir, folder, 'images');
        let images = [];
        if (fs.existsSync(imgDir)) {
          images = fs.readdirSync(imgDir).map(f => `./wrkout-data/exercises/${folder}/images/${f}`);
        }
        all.push({
          id: 'wrk-' + folder.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          folder: folder,
          name: data.name || folder.replace(/_/g, ' '),
          force: data.force || '',
          level: data.level || 'beginner',
          mechanic: data.mechanic || '',
          equipment: data.equipment || 'bodyweight',
          primaryMuscles: data.primaryMuscles || [],
          secondaryMuscles: data.secondaryMuscles || [],
          instructions: data.instructions || [],
          category: data.category || 'strength',
          images: images
        });
      } catch (e) {}
    }
  }

  const outPath = path.join(__dirname, 'wrkout-data', 'wrkout-summary.json');
  fs.writeFileSync(outPath, JSON.stringify(all, null, 2), 'utf8');
  console.log('Successfully compiled wrkout-summary.json with', all.length, 'exercises!');
} else {
  console.log('Directory not found:', dir);
}
