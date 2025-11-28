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
        listePrets.forEach((pret)=>{
            const option = document.createElement('option')
            option.value = pret.idPret
            option.textContent = `Prêt numéro ${pret.idPret}`
            selectDropDownMenuPrets.appendChild(option)
        })
    }

    /* Envoie une erreur si c'est le cas */
    catch(err) {
        console.error(err)
        alert("Impossible d'afficher les clients")
    }
}

loadPrets();