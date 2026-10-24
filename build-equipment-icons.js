const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'equipment-icons');
if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

const icons = {
    'lat-pulldown': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 10h40M32 10v18M18 16l14 12 14-12M24 38h16M20 48h24M26 38v10M38 38v10M16 58h32M32 28v10" stroke="#f59e0b"/>
  <circle cx="32" cy="30" r="3" fill="#ef4444"/>
  <path d="M10 58h44" stroke="#71717a"/>
</svg>`,
    'chest-press': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <rect x="10" y="12" width="12" height="40" rx="2" stroke="#71717a"/>
  <path d="M22 32h20M42 20v24M42 24h12M42 40h12" stroke="#f59e0b"/>
  <circle cx="30" cy="32" r="4" fill="#ef4444"/>
  <path d="M14 20h4M14 28h4M14 36h4M14 44h4" stroke="#10b981"/>
  <path d="M8 56h48" stroke="#71717a"/>
</svg>`,
    'leg-press': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M10 52l36-36M46 16h8v8M18 44l14-14M16 54h36" stroke="#f59e0b"/>
  <rect x="38" y="10" width="14" height="12" rx="2" stroke="#ef4444" fill="#ef4444" fill-opacity="0.2"/>
  <path d="M24 38l6 6M14 48l6 6" stroke="#71717a"/>
</svg>`,
    'leg-extension-curl': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="24" cy="28" r="12" stroke="#f59e0b"/>
  <path d="M24 28l16 16M40 44l8-8M24 40v14M12 54h28" stroke="#71717a"/>
  <circle cx="40" cy="44" r="5" fill="#ef4444"/>
</svg>`,
    'pec-deck': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <rect x="26" y="16" width="12" height="32" rx="2" stroke="#71717a"/>
  <path d="M14 22v20c0 4 4 6 8 6M50 22v20c0 4-4 6-8 6" stroke="#f59e0b"/>
  <circle cx="14" cy="22" r="3" fill="#ef4444"/>
  <circle cx="50" cy="22" r="3" fill="#ef4444"/>
  <path d="M10 56h44" stroke="#71717a"/>
</svg>`,
    'smith-machine': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M14 8v48M50 8v48" stroke="#71717a"/>
  <path d="M8 56h48M14 8h36" stroke="#71717a"/>
  <path d="M10 26h44" stroke="#f59e0b"/>
  <rect x="18" y="22" width="28" height="8" rx="2" stroke="#ef4444" fill="#ef4444" fill-opacity="0.2"/>
  <circle cx="14" cy="26" r="2" fill="#10b981"/>
  <circle cx="50" cy="26" r="2" fill="#10b981"/>
</svg>`,
    'cable-crossover': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M10 10v44M54 10v44M10 14h44" stroke="#71717a"/>
  <circle cx="10" cy="20" r="3" stroke="#f59e0b" fill="#f59e0b"/>
  <circle cx="54" cy="20" r="3" stroke="#f59e0b" fill="#f59e0b"/>
  <path d="M10 20l22 14M54 20l-22 14" stroke="#ef4444" stroke-dasharray="2 2"/>
  <circle cx="32" cy="34" r="4" fill="#f59e0b"/>
  <path d="M6 54h12M46 54h12" stroke="#71717a"/>
</svg>`,
    'pulleys': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="32" cy="18" r="8" stroke="#f59e0b"/>
  <circle cx="32" cy="46" r="8" stroke="#f59e0b"/>
  <path d="M24 18v28M40 18v28" stroke="#ef4444"/>
  <path d="M32 10v-4M32 54v4" stroke="#71717a"/>
  <circle cx="32" cy="18" r="2" fill="#fff"/>
  <circle cx="32" cy="46" r="2" fill="#fff"/>
</svg>`,
    'free-weights': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M14 32h36" stroke="#f59e0b"/>
  <rect x="8" y="24" width="6" height="16" rx="1" fill="#ef4444" stroke="#ef4444"/>
  <rect x="50" y="24" width="6" height="16" rx="1" fill="#ef4444" stroke="#ef4444"/>
  <rect x="4" y="27" width="4" height="10" rx="1" fill="#71717a" stroke="#71717a"/>
  <rect x="56" y="27" width="4" height="10" rx="1" fill="#71717a" stroke="#71717a"/>
</svg>`,
    'bodyweight-tower': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M16 10h32M20 10v46M44 10v46M12 28h12M40 28h12M12 56h40" stroke="#71717a"/>
  <circle cx="32" cy="20" r="4" stroke="#f59e0b" fill="#f59e0b"/>
  <path d="M32 24v12M24 30l8 4 8-4M28 42l4-6 4 6" stroke="#ef4444"/>
</svg>`
};

for (const [id, svg] of Object.entries(icons)) {
    fs.writeFileSync(path.join(targetDir, id + '.svg'), svg, 'utf8');
}
console.log('Successfully generated', Object.keys(icons).length, 'equipment SVG icons in equipment-icons/');
