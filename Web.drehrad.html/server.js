const http = require('http');
const sqlite3 = require('sqlite3');
const sqlite = require('sqlite');

const hostname = '127.0.0.1';
const port = 3000;
const dbFilePath = 'results.db';
let db;

async function startServer() {
  db = await sqlite.open({
    filename: dbFilePath,
    driver: sqlite3.Database,
  });

  // Neue Tabelle für Glücksrad-Ergebnisse
  await db.run(`CREATE TABLE IF NOT EXISTS results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  server.listen(port, hostname, () => {
    console.log(`Server läuft unter http://${hostname}:${port}/`);
  });
}

const server = http.createServer(async (request, response) => {
  response.statusCode = 200;
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Content-Type', 'application/json');

  const url = new URL(request.url || '', `http://${request.headers.host}`);

  if (url.pathname === '/api/results') {
    if (request.method === 'GET') {
      const results = await db.all('SELECT * FROM results');
      response.write(JSON.stringify(results));
    }

    else if (request.method === 'POST') {
      let body = '';
      request.on('data', chunk => (body += chunk));
      request.on('end', async () => {
        const { result } = JSON.parse(body);
        await db.run('INSERT INTO results (text) VALUES (?)', [result]);
        response.end(JSON.stringify({ status: 'Gespeichert' }));
      });
      return;
    }

    else if (request.method === 'DELETE') {
      await db.run('DELETE FROM results');
      response.write(JSON.stringify({ status: 'Alle Ergebnisse gelöscht' }));
    }

    else {
      response.statusCode = 405;
      response.write(JSON.stringify({ error: 'Methode nicht erlaubt' }));
    }
  } else {
    response.statusCode = 404;
    response.write(JSON.stringify({ error: 'Pfad nicht gefunden' }));
  }

  response.end();
});

startServer();