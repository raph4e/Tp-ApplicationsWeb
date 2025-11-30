/* D'abord, on récupère les éléments */
const selectDropDownMenuPrets = document.getElementById("selectDropDownMenuPrets")
const montantPaye = document.getElementById("montantPaye")
const datePaiement = document.getElementById("datePaiement")
const modePaiement = document.getElementById("modePaiement")
const notePaiement = document.getElementById("notePaiement")
const savePaiement = document.getElementById("savePaiement")
const messageConfirmation = document.getElementById("messageConfirmation")
const tableauPaiements = document.getElementById("tableauPaiements")

/* Permet de mettre les prêts existants dans le drop-down menu */
async function loadPrets() {
    try {

        /* Vide le dropdown menu */
        selectDropDownMenuPrets.innerHTML = "";

        /* Récupère les prêts */
        const resultat = await fetch('/getPrets')

        /* Envoie une erreur serveur si c'est le cas */
        if (!resultat.ok) {
            throw new Error("Erreur côté serveur")
        }

        /* Store les prêts dans une liste */
        listePrets = await resultat.json()

        /* Pour chaque prêt, ajoute une option dans le drop-down menu */
        listePrets.forEach(async (pret)=>{

            /* Récupère les informations du client via une requête */
            const response = await fetch(`/getNomPrets/${pret.idClient}`)
            const infoClient = await response.json()

            /* Rajoute une option HTML */
            const option = document.createElement('option')

            /* Assigne le id du prêt à la valeur de l'option */
            option.value = pret.idPret

            console.log("infoClient reçu :", infoClient)

            /* Affiche le prénom, nom et l'id du prêt dans le boîte de texte de l'option */
            option.textContent = `${infoClient[0].prenom} ${infoClient[0].nom} (#${pret.idPret})`

            /* Rajoute l'option au drop-down menu dans HTML */
            selectDropDownMenuPrets.appendChild(option)

        })
    }

    /* Envoie une erreur si c'est le cas */
    catch(err) {
        console.error(err)
        alert("Impossible d'afficher les clients")
    }
};

loadPrets();

savePaiement.addEventListener('click', async ()=> {

    /* Ajoute un paiement à la base de données */
    try {

        /* Récupère la requête afin d'ajouter un client à la base de données */
        const res = await fetch('/addPaiement', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                idPret : selectDropDownMenuPrets.value,
                montantPaye : montantPaye.value,
                datePaiement : datePaiement.value,
                modePaiement : modePaiement.value,
                notePaiement : notePaiement.value
            })
        });

        /* Indique, si c'est le cas, l'erreur survenu */
        if (!res.ok) {

            const err = await res.text();
            console.error("Erreur serveur :", err);

            /* L'indique au client */
            messageConfirmation.textContent = "Une erreur est survenu lors de l'ajout du paiement, veuillez réessayer"

            /* Réinitialise les champs */
            montantPaye.value = ""
            datePaiement.value = ""
            modePaiement.value = ""
            notePaiement.value = ""

            /* Arrête le bloc de code */
            return;
        };

        /* Indique au client que le paiement a été ajouté avec succès */
        messageConfirmation.textContent = "Paiement créé avec succès"

        /* Appel de la fonction loadPaiements() */
        loadPaiements();

        /* Appel de la fonction loadPrets() */
        loadPrets();

        /* Réinitialise les champs */
        montantPaye.value = ""
        datePaiement.value = ""
        modePaiement.value = ""
        notePaiement.value = ""        

    }
    catch (error) {

        /* Envoie une erreur si c'est le cas */
        console.error("Erreur fetch /addPeiment", err)
        res.status(500).json({ error: "Erreur serveur." })

    }
})

/* Créé une liste de paiements vide au départ */
let paiements = [];

/* Charge les paiements depuis le serveur */
async function loadPaiements() {
    const res = await fetch('http://localhost:3000/getPaiements');
    paiements = await res.json();
    remplirTableau();
};

/* Appel de la fonction, ajoute les clients au tableau côté front-end */
loadPaiements();

/* Fonction permettant de remplir le tableau avec les clienst récupérés de la base de données */
function remplirTableau() {

    /* Vide le tableau */
    tableauPaiements.innerHTML = `
        <tr>
            <th>Id du prêt</th>
            <th>Montant payé</th>
            <th>Date du paiement</th>
            <th>Mode de paiement</th>
        </tr>
    `;

    /* Pour chaque clients, rempli le tableau */
    paiements.forEach((p) => {
        const rangee = document.createElement("tr");

        /* Créé une rangée du tableau pour chaque client */
        rangee.innerHTML = `
            <td>${p.idPrêt}</td>
            <td>${p.montantPaye}</td>
            <td>${p.datePaiement}</td>
            <td>${p.modePaiement}</td>
        `;

        /* Ajout au tableau */
        tableauPaiements.appendChild(rangee);
    })
}