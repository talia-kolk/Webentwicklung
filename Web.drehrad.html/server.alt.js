const http = require('http');
const sqlite3 = require('sqlite3');
const sqlite = require('sqlite');

const hostname = '127.0.0.1'; // localhost
const port = 3000;
const dbFilePath = 'testDb.db';
let db;

async function startServer() {
  db = await sqlite.open({
    filename: dbFilePath,
    driver: sqlite3.Database,
  });
  // Tabelle anlegen, falls nicht vorhanden
  await db.run(`CREATE TABLE IF NOT EXISTS student (
    studentNr INTEGER PRIMARY KEY,
    firstName TEXT,
    lastName TEXT,
    semester INTEGER,
    faculty TEXT,
    course TEXT
  )`);
  server.listen(port, hostname, () => { // Server starten
    console.log(`Server running at http://${hostname}:${port}/`);
  });
}

const server = http.createServer(async (request, response) => {
    response.statusCode = 200;
    response.setHeader('Access-Control-Allow-Origin', '*'); // bei CORS Fehler

    let url = new URL(request.url || '', `http://${request.headers.host}`);
    switch (url.pathname) {
      case '/student': {
        switch (request.method) {
          case 'GET':
            let result;
            if(url.searchParams.get('studentNr')){
              result = await db.all(
                'SELECT * FROM student WHERE studentNr = ?',
                Number(url.searchParams.get('studentNr')) // von String zu Zahl konvertieren
              );
            }
            else {
              result = await db.all('SELECT * FROM student')
            }
            response.setHeader('Content-Type', 'application/json');
            response.write(JSON.stringify(result));
            break;
          case 'POST':
            let jsonString = '';
            request.on('data', data => {
              jsonString += data;
            });
            request.on('end', async () => {
              const student = JSON.parse(jsonString);
              await db.run(
                'INSERT INTO student VALUES (?, ?, ?, ?, ?, ?)',
                [student.studentNr, student.firstName, student.lastName, student.semester, student.faculty, student.course]
              );
            });
            break;
        }
        break;
      }
      case '/clearAll':
        await db.run('DELETE FROM student');
        break;
      default:
        response.statusCode = 404;
    }
    response.end();
  }
);

startServer();