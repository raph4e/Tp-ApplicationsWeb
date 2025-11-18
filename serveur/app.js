/* Fichier app.js : point d'entrée du serveur */
const express  = require('express');

/* Path permet de gérer les chemins de fichiers */
const path = require('path');

/* Importe la base de données de db.js */
const { db, createTable } = require('./db');

/* Créer une instance du serveur express */
const app = express();

/* Importe le package crypto pour générer des identifiants uniques */
const crypto = require('crypto');

/* Permet au serveur de traiter des données au format Json */
app.use(express.json());

/* Créer une route jusque dans le dossier client */
app.use(express.static(path.join(__dirname, '../client')));

/* Joint le chemin jusqu'à dashboard.html */
app.get('/', (req, res)=> {
    res.sendFile(path.join(__dirname, "../client", "dashboard.html"));
});

/* Crée la table clients si elle n'existe pas, puis démarre le serveur */
createTable().then(() => {

    /* Vérifie si le serveur actif sur le port 3000 */
    app.listen(3000, () => {
        console.log("Serveur actif sur le port 3000");
    });

}).catch((error) => {

    /* En cas d'erreur lors de la création de la table, on l'affiche dans la console */
    console.error("Erreur lors de la création de la table :", error);

    /* On quitte le processus avec un code d'erreur */
    process.exit(1);
});