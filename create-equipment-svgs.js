const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'equipment-icons');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const svgs = {
    'lat-pulldown.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none">
  <rect width="120" height="120" rx="20" fill="#0e1015"/>
  <rect x="2" y="2" width="116" height="116" rx="18" stroke="#f59e0b" stroke-opacity="0.3" stroke-width="2"/>
  <path d="M60 18v30M25 24l35 6 35-6" stroke="#f59e0b" stroke-width="4" stroke-linecap="round"/>
  <circle cx="60" cy="18" r="5" fill="#f59e0b"/>
  <rect x="20" y="70" width="30" height="10" rx="3" fill="#323b50" stroke="#f59e0b" stroke-width="1.5"/>
  <rect x="35" y="80" width="8" height="24" fill="#1c212d"/>
  <path d="M15 104h90" stroke="#47536d" stroke-width="4" stroke-linecap="round"/>
  <rect x="75" y="32" width="22" height="60" rx="3" fill="#141720" stroke="#f59e0b" stroke-width="2"/>
  <line x1="78" y1="44" x2="94" y2="44" stroke="#f59e0b" stroke-width="2"/>
  <line x1="78" y1="56" x2="94" y2="56" stroke="#f59e0b" stroke-width="2"/>
  <line x1="78" y1="68" x2="94" y2="68" stroke="#f59e0b" stroke-width="2"/>
  <line x1="78" y1="80" x2="94" y2="80" stroke="#f59e0b" stroke-width="2"/>
  <circle cx="45" cy="46" r="7" fill="#ef4444" fill-opacity="0.8"/>
  <path d="M45 53l-8 20h12" stroke="#ef4444" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`,

    'chest-press.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none">
  <rect width="120" height="120" rx="20" fill="#0e1015"/>
  <rect x="2" y="2" width="116" height="116" rx="18" stroke="#f59e0b" stroke-opacity="0.3" stroke-width="2"/>
  <path d="M15 104h90" stroke="#47536d" stroke-width="4" stroke-linecap="round"/>
  <rect x="24" y="55" width="28" height="10" rx="2" fill="#323b50" stroke="#f59e0b" stroke-width="1.5"/>
  <rect x="22" y="30" width="8" height="35" rx="2" fill="#323b50" stroke="#f59e0b" stroke-width="1.5"/>
  <rect x="32" y="65" width="8" height="38" fill="#1c212d"/>
  <path d="M26 30l24-14M50 16v40M50 42h22" stroke="#f59e0b" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="72" cy="42" r="4" fill="#ef4444"/>
  <rect x="80" y="28" width="24" height="66" rx="3" fill="#141720" stroke="#f59e0b" stroke-width="2"/>
  <line x1="84" y1="42" x2="100" y2="42" stroke="#f59e0b" stroke-width="2"/>
  <line x1="84" y1="54" x2="100" y2="54" stroke="#f59e0b" stroke-width="2"/>
  <line x1="84" y1="66" x2="100" y2="66" stroke="#f59e0b" stroke-width="2"/>
  <line x1="84" y1="78" x2="100" y2="78" stroke="#f59e0b" stroke-width="2"/>
</svg>`,

    'leg-press.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none">
  <rect width="120" height="120" rx="20" fill="#0e1015"/>
  <rect x="2" y="2" width="116" height="116" rx="18" stroke="#f59e0b" stroke-opacity="0.3" stroke-width="2"/>
  <path d="M15 104h90" stroke="#47536d" stroke-width="4" stroke-linecap="round"/>
  <path d="M25 90l35-55 40 40" stroke="#323b50" stroke-width="5" stroke-linecap="round"/>
  <path d="M30 75l18-18" stroke="#f59e0b" stroke-width="6" stroke-linecap="round"/>
  <rect x="22" y="70" width="16" height="24" rx="2" fill="#1c212d" stroke="#f59e0b" stroke-width="1.5" transform="rotate(-45 22 70)"/>
  <rect x="52" y="38" width="24" height="12" rx="2" fill="#ef4444" transform="rotate(-45 52 38)"/>
  <circle cx="68" cy="30" r="10" fill="#141720" stroke="#f59e0b" stroke-width="3"/>
  <circle cx="68" cy="30" r="4" fill="#f59e0b"/>
  <path d="M75 23l25 25" stroke="#f59e0b" stroke-width="3"/>
</svg>`,

    'leg-extension-curl.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none">
  <rect width="120" height="120" rx="20" fill="#0e1015"/>
  <rect x="2" y="2" width="116" height="116" rx="18" stroke="#f59e0b" stroke-opacity="0.3" stroke-width="2"/>
  <path d="M15 104h90" stroke="#47536d" stroke-width="4" stroke-linecap="round"/>
  <rect x="30" y="55" width="30" height="10" rx="2" fill="#323b50" stroke="#f59e0b" stroke-width="1.5"/>
  <rect x="22" y="30" width="8" height="35" rx="2" fill="#323b50" stroke="#f59e0b" stroke-width="1.5"/>
  <rect x="42" y="65" width="8" height="38" fill="#1c212d"/>
  <circle cx="60" cy="60" r="6" fill="#ef4444"/>
  <path d="M60 60l14 26" stroke="#f59e0b" stroke-width="4" stroke-linecap="round"/>
  <circle cx="74" cy="86" r="6" fill="#f59e0b"/>
  <rect x="82" y="30" width="22" height="64" rx="3" fill="#141720" stroke="#f59e0b" stroke-width="2"/>
  <line x1="85" y1="44" x2="101" y2="44" stroke="#f59e0b" stroke-width="2"/>
  <line x1="85" y1="56" x2="101" y2="56" stroke="#f59e0b" stroke-width="2"/>
  <line x1="85" y1="68" x2="101" y2="68" stroke="#f59e0b" stroke-width="2"/>
</svg>`,

    'pec-deck.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none">
  <rect width="120" height="120" rx="20" fill="#0e1015"/>
  <rect x="2" y="2" width="116" height="116" rx="18" stroke="#f59e0b" stroke-opacity="0.3" stroke-width="2"/>
  <path d="M15 104h90" stroke="#47536d" stroke-width="4" stroke-linecap="round"/>
  <rect x="48" y="22" width="24" height="75" rx="3" fill="#141720" stroke="#f59e0b" stroke-width="2"/>
  <rect x="46" y="55" width="28" height="10" rx="2" fill="#323b50" stroke="#f59e0b" stroke-width="1.5"/>
  <rect x="54" y="25" width="12" height="30" rx="2" fill="#323b50" stroke="#f59e0b" stroke-width="1.5"/>
  <path d="M30 35v25l18-5M90 35v25l-18-5" stroke="#f59e0b" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
  <rect x="26" y="38" width="8" height="18" rx="2" fill="#ef4444"/>
  <rect x="86" y="38" width="8" height="18" rx="2" fill="#ef4444"/>
</svg>`,

    'smith-machine.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none">
  <rect width="120" height="120" rx="20" fill="#0e1015"/>
  <rect x="2" y="2" width="116" height="116" rx="18" stroke="#f59e0b" stroke-opacity="0.3" stroke-width="2"/>
  <path d="M15 104h90" stroke="#47536d" stroke-width="4" stroke-linecap="round"/>
  <path d="M28 20v84M92 20v84" stroke="#f59e0b" stroke-width="4" stroke-linecap="round"/>
  <path d="M28 20h64" stroke="#323b50" stroke-width="4"/>
  <line x1="20" y1="52" x2="100" y2="52" stroke="#f59e0b" stroke-width="5" stroke-linecap="round"/>
  <circle cx="28" cy="52" r="6" fill="#ef4444"/>
  <circle cx="92" cy="52" r="6" fill="#ef4444"/>
  <rect x="48" y="65" width="24" height="35" rx="3" fill="#141720" stroke="#47536d" stroke-width="2"/>
</svg>`,

    'cable-crossover.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none">
  <rect width="120" height="120" rx="20" fill="#0e1015"/>
  <rect x="2" y="2" width="116" height="116" rx="18" stroke="#f59e0b" stroke-opacity="0.3" stroke-width="2"/>
  <path d="M15 104h90" stroke="#47536d" stroke-width="4" stroke-linecap="round"/>
  <path d="M22 24h76" stroke="#47536d" stroke-width="4" stroke-linecap="round"/>
  <rect x="18" y="22" width="16" height="82" rx="3" fill="#141720" stroke="#f59e0b" stroke-width="2"/>
  <rect x="86" y="22" width="16" height="82" rx="3" fill="#141720" stroke="#f59e0b" stroke-width="2"/>
  <circle cx="26" cy="34" r="4" fill="#f59e0b"/>
  <circle cx="94" cy="34" r="4" fill="#f59e0b"/>
  <path d="M26 34l34 32M94 34l-34 32" stroke="#f59e0b" stroke-width="2.5" stroke-dasharray="3 3"/>
  <circle cx="60" cy="66" r="6" fill="#ef4444"/>
</svg>`,

    'pulleys.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none">
  <rect width="120" height="120" rx="20" fill="#0e1015"/>
  <rect x="2" y="2" width="116" height="116" rx="18" stroke="#f59e0b" stroke-opacity="0.3" stroke-width="2"/>
  <path d="M15 104h90" stroke="#47536d" stroke-width="4" stroke-linecap="round"/>
  <rect x="42" y="18" width="36" height="86" rx="3" fill="#141720" stroke="#f59e0b" stroke-width="2"/>
  <circle cx="60" cy="28" r="6" fill="#f59e0b"/>
  <circle cx="60" cy="94" r="6" fill="#f59e0b"/>
  <path d="M60 28v66" stroke="#f59e0b" stroke-width="2" stroke-dasharray="2 2"/>
  <path d="M50 48l-18 10M50 78l-18-10" stroke="#ef4444" stroke-width="3" stroke-linecap="round"/>
  <circle cx="32" cy="58" r="4" fill="#ef4444"/>
  <circle cx="32" cy="68" r="4" fill="#ef4444"/>
</svg>`,

    'free-weights.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none">
  <rect width="120" height="120" rx="20" fill="#0e1015"/>
  <rect x="2" y="2" width="116" height="116" rx="18" stroke="#f59e0b" stroke-opacity="0.3" stroke-width="2"/>
  <path d="M15 104h90" stroke="#47536d" stroke-width="4" stroke-linecap="round"/>
  <line x1="20" y1="42" x2="100" y2="42" stroke="#f59e0b" stroke-width="4" stroke-linecap="round"/>
  <rect x="30" y="28" width="6" height="28" rx="2" fill="#323b50" stroke="#f59e0b" stroke-width="1.5"/>
  <rect x="84" y="28" width="6" height="28" rx="2" fill="#323b50" stroke="#f59e0b" stroke-width="1.5"/>
  <circle cx="26" cy="42" r="12" fill="#1c212d" stroke="#f59e0b" stroke-width="2"/>
  <circle cx="94" cy="42" r="12" fill="#1c212d" stroke="#f59e0b" stroke-width="2"/>
  <rect x="38" y="70" width="44" height="8" rx="2" fill="#323b50" stroke="#f59e0b" stroke-width="1.5"/>
  <line x1="44" y1="78" x2="40" y2="104" stroke="#47536d" stroke-width="3"/>
  <line x1="76" y1="78" x2="80" y2="104" stroke="#47536d" stroke-width="3"/>
</svg>`,

    'bodyweight-tower.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none">
  <rect width="120" height="120" rx="20" fill="#0e1015"/>
  <rect x="2" y="2" width="116" height="116" rx="18" stroke="#f59e0b" stroke-opacity="0.3" stroke-width="2"/>
  <path d="M15 104h90" stroke="#47536d" stroke-width="4" stroke-linecap="round"/>
  <path d="M35 104V24M85 104V24" stroke="#47536d" stroke-width="4" stroke-linecap="round"/>
  <path d="M25 24h70M25 24l8 6M95 24l-8 6" stroke="#f59e0b" stroke-width="4" stroke-linecap="round"/>
  <path d="M30 60h20M70 60h20" stroke="#f59e0b" stroke-width="3.5" stroke-linecap="round"/>
  <rect x="44" y="44" width="32" height="20" rx="3" fill="#1c212d" stroke="#f59e0b" stroke-width="1.5"/>
</svg>`
};

for (const [filename, content] of Object.entries(svgs)) {
    fs.writeFileSync(path.join(dir, filename), content.trim(), 'utf8');
}

console.log('Created 10 high-resolution athletic equipment SVGs successfully in equipment-icons/');
