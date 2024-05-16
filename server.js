const express = require('express');
const fs = require('fs');
const app = express();
const PORT = 3000;

// Middleware zur Verarbeitung von URL-kodierten Daten
app.use(express.urlencoded({ extended: true }));

// Routen
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/register', (req, res) => {
    const { name, email, password } = req.body;
    const userData = `Name: ${name}, Email: ${email}, Passwort: ${password}\n`;

    fs.appendFile('users.txt', userData, (err) => {
        if (err) {
            console.error('Fehler beim Schreiben der Datei', err);
            return res.status(500).send('Fehler beim Schreiben der Datei');
        }
        res.send('Registrierung erfolgreich!');
    });
});

// Starten des Servers
app.listen(PORT, () => {
    console.log(`Server läuft auf http://localhost:${PORT}`);
});
