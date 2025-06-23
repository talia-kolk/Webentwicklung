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

  // Tabellen anlegen, falls sie noch nicht existieren
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
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.setHeader('Content-Type', 'application/json');

  if (request.method === 'OPTIONS') {
    response.statusCode = 204;
    response.end();
    return;
  }

  const url = new URL(request.url || '', `http://${request.headers.host}`);

  // Ergebnisse
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
  }

  // Optionen 
  else if (url.pathname === '/api/options') {
    if (request.method === 'GET') {
      const rows = await db.all('SELECT * FROM options');
      response.write(JSON.stringify(rows));
    }

    else if (request.method === 'POST') {
      let body = '';
      request.on('data', chunk => (body += chunk));
      request.on('end', async () => {
        const optionen = JSON.parse(body); // Array mit Strings
        await db.run('DELETE FROM options');
        const stmt = await db.prepare('INSERT INTO options (name) VALUES (?)');
        for (const name of optionen) {
          await stmt.run(name);
        }
        await stmt.finalize();
        response.end(JSON.stringify({ status: 'Optionen gespeichert' }));
      });
      return;
    }

    else {
      response.statusCode = 405;
      response.write(JSON.stringify({ error: 'Methode nicht erlaubt' }));
    }
  }
  else if (url.pathname === '/') {
    response.setHeader('Content-Type', 'text/html');
    response.end('<h1>API läuft erfolgreich </h1><p>Benutze /api/results oder /api/options</p>');
  }
  
  // Unbekannter Pfad 
  else {
    response.statusCode = 404;
    response.write(JSON.stringify({ error: 'Pfad nicht gefunden' }));
  }

  response.end();
});

startServer();
