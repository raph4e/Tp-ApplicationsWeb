/* Liste de clients vide au départ */
let clients = [];

/* Déclaration de la variable qui va déterminée si un client se fait modifié ou non */
let clientModifié = null;

/* Charge les clients depuis le serveur */
async function loadClients() {
    const res = await fetch('http://localhost:3000/getClients');
    clients = await res.json();
    remplirTableau();
};

/* Appel de la fonction, ajoute les clients au tableau côté front-end */
loadClients();

/* Récupère le tableau du HTML */
const tableauClients = document.getElementById("tableauClients");

/* Récupère les éléments par leurs id sur gestionClients.html */
const dropDownMenuNomClients = document.getElementById("selectDropDownMenuNomsClients");
const formClient = document.getElementById("formClient");
const nomClient = document.getElementById("nom");
const prenomClient = document.getElementById("prenom");
const telephoneClient = document.getElementById("telephone");
const emailClient = document.getElementById("email");
const adresseClient = document.getElementById("adresse");
const messageConfirmation = document.getElementById("messageConfirmation");
const divBoutonSupprimer = document.getElementById("divBoutonSupprimer");

/* Fonction permettant de remplir le tableau avec les clienst récupérés de la base de données */
function remplirTableau() {

    /* Vide le tableau */
    tableauClients.innerHTML = `
        <tr>
            <th>Nom du client</th>
            <th>Nb prêts actifs</th>
            <th>Montant dû</th>
            <th>Sélection</th>
        </tr>
    `;

    /* Pour chaque clients, rempli le tableau */
    clients.forEach((c) => {
        const rangee = document.createElement("tr");

        /* Créé une rangée du tableau pour chaque client */
        rangee.innerHTML = `
            <td>${c.nom}</td>
            <td>${c.nombreDePrets}</td>
            <td>${c.montantDu}</td>
            <td>
                <button class="selectionner button card-footer-item">Sélectionner</button>
            </td>
        `;

        /* Ajout au tableau */
        tableauClients.appendChild(rangee);

        /* Fonction lorsque l'utilisateur clique sur le bouton sélectionner d'un client du tableau */

        /* Fonction lorsque le bouton selectionner est cliqué */
        rangee.querySelector('.selectionner').addEventListener("click", (e) => {
            e.preventDefault();

            /* Assigne les valeurs dans les inputs */
            nomClient.value = c.nom;
            prenomClient.value = c.prenom;
            emailClient.value = c.email;
            telephoneClient.value = c.numeroDeTelephone;
            adresseClient.value = c.adresse;
            boutonEnregistrerClient.textContent = "Modifier et quitter la sélection";
            clientModifié = c;

            divBoutonSupprimer.innerHTML = `
                <button class="bouton-supprimer button is-primary">Supprimer et quitter la sélection</button>
            `;

            /* Supprime un client lorsque le bouton supprimer est cliqué */

            /* D'abord, on récupère le bouton */
            const boutonSupprimer = divBoutonSupprimer.querySelector('.bouton-supprimer');

            /* Fonction lorsque le bouton supprimer est cliqué */
            boutonSupprimer.addEventListener("click", async () => {

                /* Supprime le client de la liste clients */
                clients = clients.filter((client) => client.id !== c.id);

                /* Appelle de la requête qui supprime le client de la base de données */
                fetch(`/deleteClient/${c.id}`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' }
                });

                /* Message de confirmation */
                messageConfirmation.textContent = "Client supprimé avec succès!"; 

                /* Retire le bouton supprimer */
                divBoutonSupprimer.innerHTML = "";

                /* Réinitialise les champs pour ajouter un client */
                nomClient.value = "";
                prenomClient.value = "";
                emailClient.value = "";
                telephoneClient.value = "";
                adresseClient.value = "";

                /* Appel de la fonction loadClients() */                    
                loadClients();       
            });
        });


    });
};



/* Fonction qui appelle la requête addClient lorsqu'on clique sur le bouton enregistrer client */
formClient.addEventListener("submit", async (e)=> {
    e.preventDefault();

    /* Modifie un client dans la base de données et front-end */
    if (clientModifié) {

        /* Récupère la requête permettant de modifier un client */
        fetch(`/editClient/${clientModifié.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nom: nomClient.value,
                prenom: prenomClient.value,
                email: emailClient.value,
                numeroDeTelephone: telephoneClient.value,
                adresse: adresseClient.value
            })
        })
        .then(res => res.json())
        .then(data => {
        
            /* Messages de confirmation */
            console.log("Client modifié côté serveur", data);
            messageConfirmation.textContent = "Client modifié avec succès!";
             
            /* Réinitialise la variable clientModifié */
            clientModifié = null;

            /* Retire le bouton supprimer */
            divBoutonSupprimer.innerHTML = "";

            /* Change la valeur du bouton enregistrer client */
            boutonEnregistrerClient.textContent = "Enregister le nouveau client";

            /* Réinitialise les champs pour ajouter un client */
            nomClient.value = "";
            prenomClient.value = "";
            emailClient.value = "";
            telephoneClient.value = "";
            adresseClient.value = "";
            
            /* Appel de la fonction loadClients() */
            loadClients();
        });       

    } else {

        /* Ajoute un client normalement à la base de données */
        try {
            
            /* Récupère la requête afin d'ajouter un client à la base de données */
            const res = await fetch('/addClient', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nom: nomClient.value,
                    prenom: prenomClient.value,
                    email: emailClient.value,
                    numeroDeTelephone: telephoneClient.value,
                    adresse: adresseClient.value
                })
            });

            /* Indique, s'il y a le cas, l'erreur serveur */
            if (!res.ok) {
                const err = await res.text();
                console.error("Erreur serveur :", err);
                return;
            };

            /* Message de confirmation */
            messageConfirmation.textContent = "Client créé avec succès!";

            /* Appel de la fonction loadClients() */
            loadClients();

            /* Réinitialise les champs pour ajouter un client */
            nomClient.value = "";
            prenomClient.value = "";
            emailClient.value = "";
            telephoneClient.value = "";
            adresseClient.value = "";

        } catch (error) {
            console.error("Erreur réseau :", error);
        }
    }
});

