const actifs = document.getElementById('nbreActifs')
const rembourse = document.getElementById('nbreRembourse')
const retards = document.getElementById('nbreRetards')
const totalPrets = document.getElementById('nbrePrete')
const totalRembourse = document.getElementById('totalRembourse')
const tableRetards = document.getElementById('tableRetards')
const btnReload = document.getElementById('refresh')

btnReload.addEventListener('click', async () => {
    const updateRetard = await fetch('/updateRetard', { method: 'PUT' })
    if (!updateRetard.ok) {
        throw new Error("Erreur côté serveur")
    }
    load()
    console.log("la page à été rafraichie")
    location.reload()
})

async function loadDashboard() {
    //récupère les routes
    const resultatActifs = await fetch('/getPretsActifs')
    const resultatRembourse = await fetch('/getPretsPaye')
    const resultatRetards = await fetch('/getPretsRetards')
    //si erreur dans une 
    if (!resultatActifs.ok || !resultatRembourse.ok || !resultatRetards.ok) {
        throw new Error("Erreur du côté serveur")
    }
    //les transfère en json
    const actifsJson = await resultatActifs.json()
    const rembourseJson = await resultatRembourse.json()
    const retardsJson = await resultatRetards.json()
    //change la valeur des cases
    actifs.textContent = actifsJson.length
    rembourse.textContent = rembourseJson.length
    retards.textContent = retardsJson.length

    //pour les totaux 
    const resultat = await fetch('/getPrets')
    if (!resultat.ok) { throw new Error("Erreur du côté serveur") }
    //transforme en json
    const prets = await resultat.json()
    //remplis la case du total prêté, aucunes virgules pck si tu compte les sous sur 20k+ t bs 
    totalPrets.textContent = prets.reduce((sum, item) => sum + item.montant, 0).toFixed(0)

    const resultatPayements = await fetch('/getPaiements')
    if (!resultatPayements.ok) { throw new Error("Erreur du côté serveur") }
    //transforme yet again en json
    const paiements = await resultatPayements.json()
    totalRembourse.textContent = paiements.reduce((sum, item) => sum + item.montantPaye, 0).toFixed(0)
}

async function loadTable() {
    // vider le tableau en premier
    tableRetards.innerHTML = `<tr>
                                <th>Nom du client</th>
                                <th>ID du prêt</th>
                                <th>Jours de retard</th>
                              </tr>`
    try {
        const res = await fetch('/getRetards')
        if (!res.ok) { throw new Error("Erreur du côté serveur") }
        const retards = await res.json()

        for (const r of retards) {
            // crée chaque ligne
            const rangee = document.createElement("tr")
            rangee.innerHTML = `<td>${r.prenom} ${r.nom}</td>
                                <td>${r.idPret}</td>
                                <td>${r.joursRetard}</td>`
            //l'ajoute au tableau
            tableRetards.appendChild(rangee)
        }
    }
    catch (err) {
        console.error(err)
        alert("Impossible d'afficher les retards")
    }
}

async function load() {
    await loadDashboard()
    await loadTable()
}

load()


window.addEventListener('DOMContentLoaded', async () => {
    // Récupère l'admin connecté si c'est le cas 
    const res = await fetch('/getAdminConnecte')
    // Vérifie qu'il existe 
    if (res.status === 200) {
        // Store l'admin connecté dans une variable format Json 
        const adminConnecte = await res.json()
        if (!adminConnecte) {
            // S'il n'y a pas d'admin, redirection 
            window.location.href = 'connexion-inscription.html'
        }
    }
    else {
        // Sinon, redirige vers la page de connexion 
        window.location.href = 'connexion-inscription.html'
    }
})

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
