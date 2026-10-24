const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = 8000;
const ROOT_DIR = __dirname;

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.webmanifest': 'application/manifest+json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.mov': 'video/quicktime',
    '.woff2': 'font/woff2'
};

function getLocalIPAddresses() {
    const interfaces = os.networkInterfaces();
    const ips = [];
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                ips.push(iface.address);
            }
        }
    }
    return ips;
}

const server = http.createServer((req, res) => {
    // Set CORS and Private Network Access headers so Vercel can fetch local exercise files
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Allow-Private-Network', 'true');

    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', '*');
        res.setHeader('Access-Control-Allow-Private-Network', 'true');
        res.writeHead(204);
        res.end();
        return;
    }

    try {
        let decodedUrl = decodeURIComponent(req.url.split('?')[0]);

        // Health check / ping endpoint for live latency test in the UI
        if (decodedUrl === '/api/ping') {
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ status: 'ok', time: Date.now(), service: 'FitCraft Local Server' }));
            return;
        }

        if (decodedUrl === '/' || decodedUrl === '') {
            decodedUrl = '/index.html';
        }

        const safePath = path.normalize(path.join(ROOT_DIR, decodedUrl));
        if (!safePath.startsWith(ROOT_DIR)) {
            res.writeHead(403, { 'Content-Type': 'text/plain' });
            res.end('403 Forbidden');
            return;
        }

        fs.stat(safePath, (err, stats) => {
            if (err || !stats.isFile()) {
                res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end('404 Not Found: ' + decodedUrl);
                return;
            }

            const ext = path.extname(safePath).toLowerCase();
            const contentType = MIME_TYPES[ext] || 'application/octet-stream';

            // Special header for Service Worker
            if (decodedUrl === '/sw.js') {
                res.setHeader('Service-Worker-Allowed', '/');
                res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            }

            // Support Range requests for smooth video/large gif scrubbing
            const range = req.headers.range;
            if (range) {
                const parts = range.replace(/bytes=/, "").split("-");
                const start = parseInt(parts[0], 10);
                const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
                const chunksize = (end - start) + 1;

                const fileStream = fs.createReadStream(safePath, { start, end });
                res.writeHead(206, {
                    'Content-Range': `bytes ${start}-${end}/${stats.size}`,
                    'Accept-Ranges': 'bytes',
                    'Content-Length': chunksize,
                    'Content-Type': contentType,
                });
                fileStream.pipe(res);
            } else {
                res.writeHead(200, {
                    'Content-Length': stats.size,
                    'Content-Type': contentType,
                    'Accept-Ranges': 'bytes'
                });
                fs.createReadStream(safePath).pipe(res);
            }
        });
    } catch (e) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error: ' + e.message);
    }
});

server.listen(PORT, '0.0.0.0', () => {
    const ips = getLocalIPAddresses();
    console.log(`===============================================`);
    console.log(`🔥 FitCraft Gym & PWA Server is RUNNING at:`);
    console.log(`💻 Localhost:      http://localhost:${PORT}`);
    ips.forEach(ip => {
        console.log(`📱 Mobile/Wi-Fi:   http://${ip}:${PORT}`);
    });
    console.log(`📁 Root directory: ${ROOT_DIR}`);
    console.log(`===============================================`);
});
