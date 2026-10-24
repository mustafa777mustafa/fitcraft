const fs = require('fs');
const path = require('path');

async function fetchWgerVideos() {
    console.log('Fetching wger exercise videos...');
    try {
        const videoRes = await fetch('https://wger.de/api/v2/video/?limit=150', {
            headers: { 'Accept': 'application/json' }
        });
        const videoData = await videoRes.json();
        console.log(`Found ${videoData.results.length} wger videos.`);

        // Unique exercise IDs
        const exerciseIds = [...new Set(videoData.results.map(v => v.exercise))];
        console.log(`Unique exercise IDs: ${exerciseIds.length}`);

        // Fetch exercise details for each
        const exercisesMap = {};
        for (const exId of exerciseIds) {
            try {
                const infoRes = await fetch(`https://wger.de/api/v2/exerciseinfo/${exId}/`, {
                    headers: { 'Accept': 'application/json' }
                });
                if (infoRes.ok) {
                    const info = await infoRes.json();
                    // Find English translation
                    const enTrans = (info.translations || []).find(t => t.language === 2) || (info.translations || [])[0];
                    exercisesMap[exId] = {
                        name: enTrans ? enTrans.name : `Exercise ${exId}`,
                        description: enTrans ? enTrans.description : '',
                        category: info.category ? info.category.name : '',
                        muscles: (info.muscles || []).map(m => m.name_en || m.name),
                        secondaryMuscles: (info.muscles_secondary || []).map(m => m.name_en || m.name),
                        equipment: (info.equipment || []).map(eq => eq.name)
                    };
                }
            } catch (err) {
                console.warn(`Failed to fetch exercise info for ${exId}:`, err.message);
            }
        }

        // Map videos to structured list
        const processedVideos = videoData.results.map(v => {
            const exInfo = exercisesMap[v.exercise] || {};
            return {
                id: `wger-${v.id}`,
                exerciseId: v.exercise,
                uuid: v.uuid,
                name: exInfo.name || `Exercise ${v.exercise}`,
                category: exInfo.category || 'General',
                primaryMuscle: (exInfo.muscles && exInfo.muscles[0]) ? exInfo.muscles[0] : 'All',
                muscles: exInfo.muscles || [],
                equipment: exInfo.equipment || [],
                videoUrl: v.video,
                duration: v.duration,
                width: v.width,
                height: v.height,
                codec: v.codec,
                license: v.license_title || 'Creative Commons'
            };
        });

        const outputPath = path.join(__dirname, 'wger-videos.json');
        fs.writeFileSync(outputPath, JSON.stringify(processedVideos, null, 2), 'utf8');
        console.log(`Successfully saved ${processedVideos.length} wger videos to ${outputPath}`);
    } catch (err) {
        console.error('Error fetching wger videos:', err);
    }
}

fetchWgerVideos();
