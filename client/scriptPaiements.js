/* D'abord, on récupère les éléments */
const selectDropDownMenuPrets = document.getElementById("selectDropDownMenuPrets")

/* Permet de mettre les prêts existants dans le drop-down menu */
async function loadPrets() {
    try {

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