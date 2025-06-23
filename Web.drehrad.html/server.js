const http = require('http');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3');
const sqlite = require('sqlite');

const hostname = '127.0.0.1';
const port = 3000;
const dbFilePath = 'results.db';
let db;

// === Server starten mit Datenbank ===
async function startServer() {
  db = await sqlite.open({
    filename: dbFilePath,
    driver: sqlite3.Database,
  });

  await db.run(`CREATE TABLE IF NOT EXISTS results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  await db.run(`CREATE TABLE IF NOT EXISTS options (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
  )`);

  server.listen(port, hostname, () => {
    console.log(`Server läuft unter http://${hostname}:${port}/`);
  });
}

const server = http.createServer(async (request, response) => {
  const { url: reqUrl, method } = request;
  const pathname = reqUrl.split('?')[0];

  // === CORS + JSON-Header ===
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    response.statusCode = 204;
    return response.end();
  }

  // === API ===
  if (pathname === '/api/results') {
    if (method === 'GET') {
      const results = await db.all('SELECT * FROM results');
      response.setHeader('Content-Type', 'application/json');
      return response.end(JSON.stringify(results));
    }
    if (method === 'POST') {
      let body = '';
      request.on('data', chunk => body += chunk);
      request.on('end', async () => {
        const { result } = JSON.parse(body);
        await db.run('INSERT INTO results (text) VALUES (?)', [result]);
        response.setHeader('Content-Type', 'application/json');
        return response.end(JSON.stringify({ status: 'Gespeichert' }));
      });
      return;
    }
    if (method === 'DELETE') {
      await db.run('DELETE FROM results');
      response.setHeader('Content-Type', 'application/json');
      return response.end(JSON.stringify({ status: 'Alle gelöscht' }));
    }
  }

  if (pathname === '/api/options') {
    if (method === 'GET') {
      const options = await db.all('SELECT * FROM options');
      response.setHeader('Content-Type', 'application/json');
      return response.end(JSON.stringify(options));
    }
    if (method === 'POST') {
      let body = '';
      request.on('data', chunk => body += chunk);
      request.on('end', async () => {
        const names = JSON.parse(body);
        await db.run('DELETE FROM options');
        const stmt = await db.prepare('INSERT INTO options (name) VALUES (?)');
        for (const name of names) {
          await stmt.run(name);
        }
        await stmt.finalize();
        response.setHeader('Content-Type', 'application/json');
        return response.end(JSON.stringify({ status: 'Optionen gespeichert' }));
      });
      return;
    }
  }

  // === Statische Dateien aus public ===
  const staticPath = {
    '/': 'webdrehrad.html',
    '/webdrehrad.css': 'webdrehrad.css',
    '/webdrehrad.js': 'webdrehrad.js',
  };

  if (pathname in staticPath) {
    const filePath = path.join(__dirname, 'public', staticPath[pathname]);
    const ext = path.extname(filePath).slice(1);
    const mime = {
      html: 'text/html',
      css: 'text/css',
      js: 'application/javascript',
    };

    fs.readFile(filePath, (err, data) => {
      if (err) {
        response.statusCode = 500;
        return response.end('Datei nicht gefunden');
      }
      response.statusCode = 200;
      response.setHeader('Content-Type', mime[ext] || 'text/plain');
      return response.end(data);
    });
  } else {
    // Kein statischer Pfad und keine API
    response.statusCode = 404;
    response.setHeader('Content-Type', 'application/json');
    return response.end(JSON.stringify({ error: 'Pfad nicht gefunden' }));
  }
});

startServer();