const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// Middleware zur Verarbeitung von URL-kodierten Daten
app.use(express.urlencoded({ extended: true }));

// Sicherstellen, dass users.json existiert und ein gültiges JSON-Format hat
const usersFilePath = path.join(__dirname, 'users.json');
if (!fs.existsSync(usersFilePath)) {
    fs.writeFileSync(usersFilePath, '[]');
}

// Routen
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/register', (req, res) => {
    const { name, email, password } = req.body;
    const userData = { name, email, password };

    fs.readFile(usersFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Fehler beim Lesen der Datei', err);
            return res.status(500).send('Fehler beim Lesen der Datei');
        }

        let users = [];
        if (data) {
            try {
                users = JSON.parse(data);
            } catch (e) {
                console.error('Fehler beim Parsen der JSON-Daten', e);
                return res.status(500).send('Fehler beim Parsen der Daten');
            }
        }

        users.push(userData);

        fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), (err) => {
            if (err) {
                console.error('Fehler beim Schreiben der Datei', err);
                return res.status(500).send('Fehler beim Schreiben der Datei');
            }

            // Erstellen der individuellen HTML-Datei für den Benutzer
            const userPageContent = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Willkommen, ${name}!</title>
                </head>
                <body>
                    <h1>Willkommen, ${name}!</h1>
                    <p>Dies ist Ihre persönliche Seite.</p>
                </body>
                </html>
            `;

            fs.writeFile(path.join(__dirname, `user_${name}.html`), userPageContent, (err) => {
                if (err) {
                    console.error('Fehler beim Erstellen der Benutzerseite', err);
                    return res.status(500).send('Fehler beim Erstellen der Benutzerseite');
                }

                res.send('Registrierung erfolgreich!');
            });
        });
    });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    fs.readFile(usersFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Fehler beim Lesen der Datei', err);
            return res.status(500).send('Fehler beim Lesen der Datei');
        }

        let users = [];
        if (data) {
            try {
                users = JSON.parse(data);
            } catch (e) {
                console.error('Fehler beim Parsen der JSON-Daten', e);
                return res.status(500).send('Fehler beim Parsen der Daten');
            }
        }

        const user = users.find(user => user.email === email && user.password === password);

        if (user) {
            res.redirect(`/user_${encodeURIComponent(user.name)}.html`);
        } else {
            res.status(401).send('Ungültige Anmeldedaten');
        }
    });
});

// Bereitstellen der individuellen Benutzerseiten
app.use(express.static(__dirname));

// Starten des Servers
app.listen(PORT, () => {
    console.log(`Server läuft auf http://localhost:${PORT}`);
});

