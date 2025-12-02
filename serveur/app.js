/* Fichier app.js : point d'entrée du serveur */
const express = require('express');

/* Path permet de gérer les chemins de fichiers */
const path = require('path');

/* Importe la base de données de db.js */
const { db, createTable } = require('./db');

/* Créer une instance du serveur express */
const app = express();

/* Importe le package crypto pour générer des identifiants uniques */
const crypto = require('crypto');
const { error } = require('console');

/* Permet au serveur de traiter des données au format Json */
app.use(express.json());

/* Créer une route jusque dans le dossier client */
app.use(express.static(path.join(__dirname, '../client')));

/* Joint le chemin jusqu'à dashboard.html */
app.get('/', (req, res) => {
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

/* Requête permettant d'ajouter un client */
app.post('/addClient', async (req, res) => {
    try {
        /* Récupère les infos du client a créé */
        const { nom, prenom, email, numeroDeTelephone, adresse } = req.body;

        /* Vérifie pour voir si les champs remplis par l'utilisateur sont vides */
        if (!nom) {
            return res.status(400).json({ error: "Champ 'nom' du client non rempli" })
        }
        if (!prenom) {
            return res.status(400).json({ error: "Champ 'prenom' du client non rempli" })
        }
        if (!email) {
            return res.status(400).json({ error: "Champ 'email' du client non rempli" })
        }
        if ((!numeroDeTelephone) || (numeroDeTelephone.length < 10)) {
            return res.status(400).json({ error: "Champ 'numero de téléphone' du client non rempli ou invalide" })
        }
        if (!adresse) {
            return res.status(400).json({ error: "Champ 'adresse' du client non rempli" })
        };

        /* Les store dans une variable */
        const client = {
            nom: nom,
            prenom: prenom,
            email: email,
            numeroDeTelephone: numeroDeTelephone,
            adresse: adresse,
            nombreDePrets: 0,
            montantDu: 0
        };

        /* Ajoute le client à la base de données */
        await db('clients').insert(client);
        /* Indique que le client a bel et bien été ajouté à la base de données */
        res.status(200).json(client);

    } catch (error) {
        /* En cas d'erreur lors de la création de la table, on l'affiche dans la console */
        console.error("Erreur lors de l'ajout du client :", error);
        /* Affiche une erreur 500 */
        res.status(500).json("Erreur lors de l'ajout du client à la base de données : ", error);
    }
})

/* Requête permettant de modifier un client en fonction de son id */
app.put('/editClient/:id', async (req, res) => {
    try {
        /* Récupère les infos du client à modifié */
        const { id } = req.params;
        const { nom, prenom, email, numeroDeTelephone, adresse } = req.body;

        /* Les store dans une variable */
        const client = {
            id: id,
            nom: nom,
            prenom: prenom,
            email: email,
            numeroDeTelephone: numeroDeTelephone,
            adresse: adresse
        };

        /* Modifie le client dans la base de données */
        await db('clients').where({ id }).update(client)
        /* Renvoie le client modifé au front-end, pour éviter toutes erreurs */
        const clientModifie = await db('clients').where({ id }).first();
        res.status(200).json(clientModifie);

    } catch (error) {
        /* En cas d'erreur lors de la création de la table, on l'affiche dans la console */
        console.error("Erreur lors de la modification du client :", error);
        /* Affiche une erreur 500 */
        res.status(500).json("Erreur lors de la modification du client : ");
    }
})

/* Requête qui permet de récupérer tout les clients */
app.get('/getClients', async (req, res) => {
    try {
        /* Récupère tous les clients dans la base de données */
        const clients = await db('clients').select("*");
        /* Renvoie les produits au client */
        res.status(200).json(clients);
    } catch (error) {
        /* En cas d'erreur, on l'affiche dans la console et on renvoie un code 500 a l'utilisateur */
        console.error("Erreur lors de la récupération des clients :", error);
        /* Renvoie une réponse a l'utilisateur avec un code 500 */
        res.status(500).json({ error: "Erreur serveur" });
    }
});

/* Requête qui permet de supprimer un client dans la base de données */
app.delete('/deleteClient/:id', async (req, res) => {
    try {
        const { id } = req.params;

        /* Récupère le client avant suppression */
        const client = await db('clients').where({ id }).first();
        /* Supprime le client de la base de données*/
        await db('clients').where({ id }).del();
        /* Renvoie le client supprimé */
        res.status(200).json({ deletedClient: client });
    } catch (error) {
        /* En cas d'erreur, on l'affiche dans la console et on renvoie un code 500 à l'utilisateur */
        console.error("Erreur lors de la suppression du client:", error);
        /* Renvoie une réponse à l'utilisateur avec un code 500 */
        res.status(500).json({ error: "Erreur serveur" });
    }
});

/* Requête permettant de récupérer tout les prêts */
app.get('/getPrets', async (req, res) => {
    try {
        const resultat = await db("prets").select("*").orderBy("idPret", "desc")
        res.status(200).json(resultat)
    }
    catch (err) {
        console.error("Erreur /getPrets", err)
        res.status(500).json({ error: "Erreur serveur." })
    }
})

/* Requête permettant de récupérer un client en fonction de ses prêts */
app.get('/getNomPrets/:idClient', async (req, res) => {
    try {

        /* Récupère l'id du client en paramètre */
        const idClient = req.params.idClient

        /* Récupère le prénom et le nom correspondant */
        const client = await db("clients").select("id", "prenom", "nom").where({id : idClient})

        /* Renvoie le résultat au côté client */
        res.status(200).json(client)

    } catch (err) {

        /* Envoie une erreur si c'est le cas */
        console.error("Erreur /getNomPrets", err)
        res.status(500).json({ error: "Erreur serveur." })
    }
})

/* Requête qui récupère le prenom et le nom de chaque client */
app.get('/getNomsClients', async (req, res) => {
    try {
        const resultat = await db("clients").select("id", "prenom", "nom").orderBy("prenom")
        res.status(200).json(resultat)
    }
    catch (err) {
        console.error("Erreur /getNomsClients", err)
        res.status(500).json({ error: "Erreur serveur" })
    }
})

/* Requête qui permet d'ajouter un prêt à la base de données */
app.post('/addPret', async (req, res) => {
    try {
        const { idClient, montantPret, interet, duree, dateDebut } = req.body
        const numPret = Number(montantPret)
        const numInteret = Number(interet)
        const numDuree = Number(duree)
        const date_dateDebut = dateDebut

        // checks pour voir si un des champs est vide
        if (!idClient) {
            return res.status(400).json({ error: "Champ 'idClient' non rempli" })
        }
        if (!numPret) {
            return res.status(400).json({ error: "Champ 'montantPret' non rempli" })
        }
        if (!numInteret) {
            return res.status(400).json({ error: "Champ 'interet' non rempli" })
        }
        if (!numDuree) {
            return res.status(400).json({ error: "Champ 'duree' non rempli" })
        }
        if (!date_dateDebut) {
            return res.status(400).json({ error: "Champ 'dateDebut' non rempli" })
        }
        if (numDuree < 1) {
            return res.status(400).json({ error: "'duree' doit être supérieur à 1" })
        }
        if (numInteret < 0) {
            return res.status(400).json({ error: "'interet' doit être supérieur à 0" })
        }
        if (numPret < 50) {
            return res.status(400).json({ error: "'montantPret' doit être supérieur à 50" })
        }

        const pret = {
            idClient: idClient,
            montant: numPret,
            interet: numInteret,
            duree: numDuree,
            dateDebut: date_dateDebut
        }

        /* Ajoute le montant du prêt à la colonne montant dû du client */
        await db('clients')
        .where({ id: idClient  })
        .increment('montantDu', numPret); 

        /* Ajoute 1 à la colonne nombre de prêts du client */
        await db('clients')
        .where({ id: idClient  })
        .increment('nombreDePrets', 1); 

        const resultat = await db("prets").insert(pret)
        res.status(201).json(pret)
    }
    catch (err) {
        console.error("Erreur /addPret", err);
        res.status(500).json({ error: "Erreur serveur" })
    }
})

/* Requête qui permet d'ajouter des paiements */
app.post('/addPaiement', async (req, res) => {
    try {

        /* Récupère les infos du paiement ajouté */
        let { idPret, montantPaye, datePaiement, modePaiement, notePaiement, clientId } = req.body;

        /* Converti en nombre */
        idPret = Number(idPret);
        montantPaye = Number(montantPaye);
        clientId = Number(clientId);

        /* Vérifie les champs */
        if (!idPret) {
            return res.status(400).json({ error: "Champ 'idPret' non rempli" })
        }
        if (!montantPaye) {
            return res.status(400).json({ error: "Champ 'montantPaye' non rempli" })
        }
        if (!datePaiement) {
            return res.status(400).json({ error: "Champ 'datePaiement' non rempli" })
        }
        if (!modePaiement) {
            return res.status(400).json({ error: "Champ 'modePaiement' non rempli" })
        }
        
        /* Le store dans une variable */
        const paiement = {
            idPrêt : idPret,
            montantPaye : montantPaye,
            datePaiement : datePaiement,
            modePaiement : modePaiement,
            notePaiement : notePaiement
        };

        /* Ajoute le paiement à la table paiements */
        await db('paiements').insert(paiement);

        /* Retire le montant paye dans le pret correspondant */
        await db('prets')
        .where({idPret: idPret})
        .decrement("montant", montantPaye);

        /* Récupère le client correspondant au prêt et soustraie le paiement de son montant dû */
        await db('clients')
        .where({id: clientId})
        .decrement("montantDu", montantPaye)

        /* Store le prêt correspondant dans une variable */
        pretCorrespondant = await db('prets').where({idPret: idPret}).first();

        /* Si le prêt est remboursé complètement on l'indique avec la colonne statut */
        if (pretCorrespondant && pretCorrespondant.montant <= 0) {
            await db('prets').where({idPret: pretCorrespondant.idPret}).update({statut : 'payé'})
        };

        /* Envoie un message de confirmation */
        res.status(200).json({ message: "Paiement ajouté avec succès" });
        
    } catch (err) {

        /* Envoie une erreur si c'est le cas */
        console.error("Erreur /addPaiement", err);
        res.status(500).json({ error: "Erreur serveur" })
    }
})

/* Requête qui permet de récupérer tout les paiements */
app.get('/getPaiements', async (req, res) => {
    try {

        /* Récupère tous les clients dans la base de données */
        const paiements = await db('paiements').select("*");

        /* Renvoie les produits au client */
        res.status(200).json(paiements);

    } catch (error) {

        /* En cas d'erreur, on l'affiche dans la console et on renvoie un code 500 a l'utilisateur */
        console.error("Erreur lors de la récupération des paiements :", error);

        /* Renvoie une réponse a l'utilisateur avec un code 500 */
        res.status(500).json({ error: "Erreur serveur" });

    }
});

// requete pour verifier l'état de paiement d'un certain pret
app.get('/getSpecificPaiement/:id', async (req, res)=> {
    try {
        let id = req.params
        idPret = Number(id)
        const resultat = await db('paiements').select('*').where({dPret: idPret})
        res.status(200).json(resultat)
    }
    catch(error){
        console.error("Erreur lors de la récupération du paiement :", error);
        res.status(500).json({ error: "Erreur serveur" });   
    }
})

/* Requête permettant de récupérer l'admin connecté si c'est le cas */
app.get('/getAdminConnecte', async (req, res) => {

    try {

        /* Récupère l'admin connecté */
        const adminConnecte = await db('adminConnecte').select('*').first();

        /* Indique au client s'il n'y a pas d'admin connecté */
        if (!adminConnecte) {
            res.status(404).json("Aucun admin connecté, veuillez vous connecter ou vous inscrire")
        }

        /* Envoie l'admin connecté au client */
        res.status(200).json(adminConnecte)
    } catch(error) {
        console.error("Erreur lors de la récupération de l'admin connecté (/getAdminConnecte");
        res.status(500).json({ error: "Erreur serveur" })
    }
})