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
const divBoutonQuitter = document.getElementById("divBoutonQuitter")

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

            /* Retire le message de confirmation */
            messageConfirmation.textContent = "";

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

            divBoutonQuitter.innerHTML = `
                <button class="bouton-quitter button is-primary">Quitter la sélection</button>
            `

            /* Supprime un client lorsque le bouton supprimer est cliqué */

            /* D'abord, on récupère les boutons */
            const boutonSupprimer = divBoutonSupprimer.querySelector('.bouton-supprimer');
            const boutonQuitter =   divBoutonQuitter.querySelector('.bouton-quitter')

            /* Fonction lorsque le bouton supprimer est cliqué */
            boutonSupprimer.addEventListener("click", async (event) => {

                /* Empêche le comportement de base du bouton */
                event.preventDefault();
                event.stopPropagation();

                /* Supprime le client de la liste clients */
                clients = clients.filter((client) => client.id !== c.id);

                /* Appelle de la requête qui supprime le client de la base de données */
                const res = await fetch(`/deleteClient/${c.id}`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' }
                });

                /* Envoie une erreur si le client n'a pas été supprimé correctement */
                if (!res.ok) throw new Error("Erreur lors de la suppression"); 

                /* Message de confirmation côté serveur */
                const data = await res.json();
                console.log("Client supprimé côté serveur: ", data.deletedClient)

                /* Message de confirmation */
                messageConfirmation.textContent = "Client supprimé avec succès!"; 

                /* Change la valeur du bouton enregistrer client */
                boutonEnregistrerClient.textContent = "Enregister le nouveau client";

                /* Retire le bouton supprimer et le bouton quitter */
                divBoutonSupprimer.innerHTML = "";
                divBoutonQuitter.innerHTML = "";

                /* Réinitialise les champs pour ajouter un client */
                nomClient.value = "";
                prenomClient.value = "";
                emailClient.value = "";
                telephoneClient.value = "";
                adresseClient.value = "";

                /* Appel de la fonction loadClients() */                    
                loadClients();     

                /* Vide le message de confirmation après 2 secondes */
                setTimeout(() => {
                    messageConfirmation.textContent = "";
                }, 2000);
            });

            /* Fonction lorsque le bouton quitté est cliqué */
            boutonQuitter.addEventListener('click', (event) => {

                /* Empêche le comportement de base du bouton */
                event.preventDefault();
                event.stopPropagation();

                /* Change la valeur du bouton enregistrer client */
                boutonEnregistrerClient.textContent = "Enregister le nouveau client";

                /* Retire le bouton supprimer et le bouton quitter */
                divBoutonSupprimer.innerHTML = "";
                divBoutonQuitter.innerHTML = "";

                /* Réinitialise les champs pour ajouter un client */
                nomClient.value = "";
                prenomClient.value = "";
                emailClient.value = "";
                telephoneClient.value = "";
                adresseClient.value = "";

            })
        });


    });
};



/* Fonction qui appelle la requête addClient lorsqu'on clique sur le bouton enregistrer client */
formClient.addEventListener("submit", async (e)=> {
    e.preventDefault();

    /* Modifie un client dans la base de données et front-end */
    if (boutonEnregistrerClient.textContent == "Modifier et quitter la sélection") {

        /* Récupère la requête permettant de modifier un client */
        const res = await fetch(`/editClient/${clientModifié.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nom: nomClient.value,
                prenom: prenomClient.value,
                email: emailClient.value,
                numeroDeTelephone: telephoneClient.value,
                adresse: adresseClient.value
            })
        });

        /* Message de confirmation côté serveur */
        let data;
        if (res.headers.get("content-length") !== "0") {
            data = await res.json();
        } else {
            data = {};
        }

        /* Indique si il y a une erreur */
        if (!res.ok) {
            console.error("Erreur serveur:", data);
            return;
        }

        console.log("Client modifié côté serveur", data);
        
        /* Message de confirmation */
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

        /* Vide le message de confirmation après 2 secondes */
        setTimeout(() => {
            messageConfirmation.textContent = "";
        }, 2000);    

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
                
                /* Affiche au client */
                messageConfirmation.textContent = "Une erreur est survenu, veuillez réessayer"

                /* Réinitialise les champs */
                nomClient.value = "";
                prenomClient.value = "";
                emailClient.value = "";
                telephoneClient.value = "";
                adresseClient.value = "";

                /* Arrête le bloc de code */
                return;
            };


            /* Message de confirmation */
            messageConfirmation.textContent = "Client créé avec succès!";

            /* Appel de la fonction loadClients() */
            loadClients();

            /* Vide le message de confirmation après 2 secondes */
            setTimeout(() => {
                messageConfirmation.textContent = "";
            }, 2000);

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

/* Script pour filtrer */
/* D'abord, on récupère les éléments */
const nomFiltrer = document.getElementById("nomFiltrer")
const buttonRechercheParNom = document.getElementById("buttonRechercheParNom")
const messageErreurFiltrer = document.getElementById("messageErreurFiltrer")

/* Évenement lorsque le bouton recherche par nom est cliqué */
buttonRechercheParNom.addEventListener("click", (e)=> {

    /* Préviens le comportement par défaut du bouton */
    e.preventDefault();

    /* Trouve le client correspondant au nom */
    const clientTrouve = clients.find(c => c.nom === nomFiltrer.value);

    /* S'éxécute lorsque le bouton affiche rechercher */
    if (buttonRechercheParNom.textContent === "Rechercher") {
        /* Vérifie si le input n'est pas vide */
        if (nomFiltrer.value === "") {

            /* Affiche au client un message d'erreur si ce n'est pas le cas */
            messageErreurFiltrer.innerHTML = `
                <span>Aucun nom entré. Veuillez entrer le nom du client à rechercher.</span>
            `

        /* Vérifie si le client existe */
        } else if (!clientTrouve) {

            /* Affiche au client un message d'erreur si ce n'est pas le cas */
            messageErreurFiltrer.innerHTML = `
            <span>Nom du client introuvable. Veuillez réessayer</span>
            `

        /* Tout va bien, on éxécute */
        } else {

            /* Vide le div message erreur */
            messageErreurFiltrer.innerHTML = ``

            /* Filtre le tableau pour garder seulement le client correspondant */
            clients = clients.filter((client) => client.nom == nomFiltrer.value);

            /* Rempli le tableau côté frontend par la suite */
            remplirTableau();

            /* Change la valeur du bouton */
            buttonRechercheParNom.textContent = "Réinitialiser la liste"
        }

    /* S'éxécute lorsque le bouton affiche réinitialiser la liste */
    } else if (buttonRechercheParNom.textContent === "Réinitialiser la liste") {

        /* Réinitialise le tableau et la liste frontend */
        loadClients();

        /* Change la valeur du bouton */
        buttonRechercheParNom.textContent = "Rechercher"

        /* Réinitialise le input */
        nomFiltrer.value = ""
    }
})

/* Script pour trier */
/* D'abord, on récupère les éléments */
const PlusHautMontantDu = document.getElementById("PlusHautMontantDu")
const PlusBasMontantDu = document.getElementById("PlusBasMontantDu")
const PlusPretsActifs = document.getElementById("PlusPretsActifs")
const MoinsPretsActifs = document.getElementById("MoinsPretsActifs")
const buttonTrier = document.getElementById("buttonTrier")
const messageErreurTrier = document.getElementById("buttonTrier")

buttonTrier.addEventListener("click", ()=> {

    /* S'éxécute lorsque le bouton affiche rechercher */
    if (buttonTrier.textContent === "Rechercher") {

        /* Change la valeur du bouton */
        buttonTrier.textContent = "Réinitialiser la liste"

        if (PlusHautMontantDu.checked) {
            
            /* Filtre le tableau pour que le plus haut montant dû soit en haut et le reste en ordre */
            clients.sort((a, b) => b.montantDu - a.montantDu);


            /* Rempli le tableau côté frontend par la suite */       
            remplirTableau();

            /* Rend la checkbox indisponible */
            PlusHautMontantDu.disabled = true;

        }  else if (PlusBasMontantDu.checked) {

            /* Filtre le tableau pour que le plus bas montant dû soit en haut et le reste en ordre */
            clients.sort((a, b) => a.montantDu - b.montantDu);

            /* Rempli le tableau côté frontend par la suite */
            remplirTableau();

            /* Rend la checkbox indisponible */
            PlusBasMontantDu.disabled = true;

        } else if (PlusPretsActifs.checked) {

            /* Filtre le tableau pour que le plus de prêts actifs soit en haut */
            clients.sort((a, b) => b.nombreDePrets - a.nombreDePrets);

            /* Rempli le tableau côté frontend par la suite */
            remplirTableau();

            /* Rend la checkbox indisponible */
            PlusPretsActifs.disabled = true;

        } else if (MoinsPretsActifs.checked) {

            /* Filtre le tableau pour que le plus de prêts actifs soit en haut */
            clients.sort((a, b) => a.nombreDePrets - b.nombreDePrets);

            /* Rempli le tableau côté frontend par la suite */
            remplirTableau();

            /* Rend la checkbox indisponible */
            MoinsPretsActifs.disabled = true;
            
        };

    /* S'éxécute lorsque le bouton affiche réinitialiser la liste */
    } else if (buttonTrier.textContent === "Réinitialiser la liste") {

        /* Réinitialise le tableau et la liste frontend */
        loadClients();

        /* Change la valeur du bouton */
        buttonTrier.textContent = "Rechercher"

        /* Change le focus pour l'option de base */
        PlusHautMontantDu.checked = true;

        /* Rend les checkbox disponibles */
        PlusHautMontantDu.disabled = false;
        PlusBasMontantDu.disabled = false;
        PlusPretsActifs.disabled = false;
        MoinsPretsActifs.disabled = false;

    };
});

/* S'éxécute lorsque le bouton déconnexion est cliqué */
const buttonDeconnexion = document.getElementById("buttonDeconnexion")

buttonDeconnexion.addEventListener('click', async () => {
    try {

        /* Vide la table adminConnecte */
        await fetch('/delAdminConnecte');

        /* Redirige vers la page de connexion */
        window.location.href = 'connexion-inscription.html';

    } catch (error) {

        /* Envoie une erreur si c'est le cas */
        console.error("Erreur lors de la déconnexion", error)

        /* L'indique côté client */
        messageConfirmation.textContent = "Erreur lors de la déconnexion de l'admin connecté";
    }
})