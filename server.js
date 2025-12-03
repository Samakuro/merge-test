const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;

function sendJSON(res, data, status = 200) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

function serveStatic(req, res, pathname) {
  let filePath = path.join(PUBLIC_DIR, pathname);
  // protect from path traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  fs.stat(filePath, (err, stats) => {
    if (err) {
      // If not found, try index.html for root
      if (pathname === '/' || pathname === '/index.html') {
        const indexPath = path.join(PUBLIC_DIR, 'index.html');
        fs.readFile(indexPath, (e, data) => {
          if (e) { res.writeHead(500); return res.end('Server error'); }
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(data);
        });
        return;
      }
      res.writeHead(404);
      return res.end('Not found');
    }

    if (stats.isDirectory()) {
      // serve index.html inside directory
      const indexPath = path.join(filePath, 'index.html');
      fs.readFile(indexPath, (e, data) => {
        if (e) { res.writeHead(404); return res.end('Not found'); }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(data);
      });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const map = {
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.html': 'text/html; charset=utf-8',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon',
      '.woff2': 'font/woff2'
    };

    const contentType = map[ext] || 'application/octet-stream';
    fs.readFile(filePath, (e, data) => {
      if (e) { res.writeHead(500); return res.end('Server error'); }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  });
}

function getFeatures() {
  return [
    { title: 'ดีไซน์โมเดิร์น', desc: 'โทนสีสุภาพ พร้อมเอฟเฟกต์เล็กน้อย' },
    { title: 'รองรับภาษาไทย', desc: 'ฟอนต์ Sarabun สำหรับการอ่านที่สบายตา' },
    { title: 'ปรับแต่งง่าย', desc: 'ตัวแปร CSS ที่ชัดเจน' },
    { title: 'ตอบสนองดี', desc: 'เลย์เอาต์ grid ยืดหยุ่น' },
    { title: 'คอมโพเนนต์พร้อมใช้', desc: 'ปุ่ม การ์ด และการ์ดตัวอย่าง' },
    { title: 'เบาและเร็ว', desc: 'ไม่พึ่งพา JavaScript มาก' }
  ];
}

function getStats() {
  return {
    loadTime: '0.9s',
    responsiveness: '100%',
    support: 'มือถือ'
  };
}

function handleAPI(req, res) {
  const parsed = url.parse(req.url, true);
  if (req.method === 'GET' && parsed.pathname === '/api/features') {
    return sendJSON(res, { features: getFeatures() });
  }

  if (req.method === 'GET' && parsed.pathname === '/api/stats') {
    return sendJSON(res, { stats: getStats() });
  }

  if (req.method === 'POST' && parsed.pathname === '/api/contact') {
    let body = '';
    req.on('data', (chunk) => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const data = JSON.parse(body || '{}');
        const submissionsPath = path.join(PUBLIC_DIR, 'submissions.json');
        fs.readFile(submissionsPath, 'utf8', (err, content) => {
          let arr = [];
          if (!err) {
            try { arr = JSON.parse(content); } catch (e) { arr = []; }
          }
          const entry = { id: Date.now(), receivedAt: new Date().toISOString(), payload: data };
          arr.push(entry);
          fs.writeFile(submissionsPath, JSON.stringify(arr, null, 2), (e) => {
            if (e) { return sendJSON(res, { error: 'Could not save submission' }, 500); }
            sendJSON(res, { ok: true, entry });
          });
        });
      } catch (e) {
        return sendJSON(res, { error: 'Invalid JSON' }, 400);
      }
    });
    return;
  }

  // Not an API route
  return false;
}

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url);
  // API handling
  const apiHandled = handleAPI(req, res);
  if (apiHandled !== false) return;

  // default: serve static files
  let pathname = decodeURIComponent(parsed.pathname);
  if (pathname === '/') pathname = '/index.html';
  serveStatic(req, res, pathname);
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});

// graceful shutdown on SIGINT
process.on('SIGINT', () => {
  console.log('Shutting down...');
  server.close(() => process.exit(0));
});
