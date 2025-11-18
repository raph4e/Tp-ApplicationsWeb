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

app.post('/addClient', async (req, res) => {
    try {

        /* Récupère les infos du client a créé */
        const {nom, prénom, email, numéroDeTéléphone, adresse} = req.body;

        /* Ici pas besoin de vérifier que chaque champ de la requête a été bien rempli, puisque que les champs du formulaire sont 'required' */

        /* Les store dans une variable */
        const client = {
            id: crypto.randomUUID(),
            nom: nom,
            prénom: prénom,
            email: email,
            numéroDeTéléphone: numéroDeTéléphone,
            adresse: adresse
        };

        /* Ajoute le client à la base de données */
        await db('client').insert(client);

        /* Indique que le client a bel et bien été ajouté à la base de données */
        res.status(200).json(client);

    } catch (error) {

        /* En cas d'erreur lors de la création de la table, on l'affiche dans la console */
        console.error("Erreur lors de l'ajout du client :", error);

        /* Affiche une erreur 500 */
        res.status(500).json("Erreur lors de l'ajout du client à la base de données : " , error);
    }
})

app.put('/editClient', async (req, res) => {
    try {

        /* Récupère les infos du client à modifié */
        const {id} = req.params;
        const {nom, prénom, email, numéroDeTéléphone, adresse} = req.body;

        /* Les store dans une variable */
        const client = {
            id: id,
            nom: nom,
            prénom: prénom,
            email: email,
            numéroDeTéléphone: numéroDeTéléphone,
            adresse: adresse
        };

        /* Modifie le client dans la base de données */
        await db('client')

    } catch (error) {

        /* En cas d'erreur lors de la création de la table, on l'affiche dans la console */
        console.error("Erreur lors de la modification du client :", error);

        /* Affiche une erreur 500 */
        res.status(500).json("Erreur lors de la modification du client : " , error);
    }
})