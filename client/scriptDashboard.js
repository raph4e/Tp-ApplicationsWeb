const actifs = document.getElementById('nbreActifs')
const rembourse = document.getElementById('nbreRembourse')
const retards = document.getElementById('nbreRetards')
const totalPrets = document.getElementById('nbrePrete')
const totalRembourse = document.getElementById('totalRembourse')
const tableRetards = document.getElementById('tableRetards')

async function loadDashboard() {
    //récupère les routes
    const resultatActifs = await fetch('/getPretsActifs')
    const resultatRembourse = await fetch('/getPretsRetards')
    const resultatRetards = await fetch('/getPretsPaye')
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
    totalPrets.textContent = prets.reduce((sum, item) => sum + item.montant, 0).toFixed(0);

    const resultatPayements = await fetch('/getPaiements')
    if (!resultatPayements.ok) { throw new Error("Erreur du côté serveur") }
    //transforme yet again en json
    const paiements = await resultatPayements.json()
    console.log(paiements)
    totalRembourse.textContent = paiements.reduce((sum, item) => sum + item.montantPaye, 0).toFixed(0)
}

async function loadTable() {
    
}



window.addEventListener('DOMContentLoaded', async () => {
    // Récupère l'admin connecté si c'est le cas 
    const res = await fetch('/getAdminConnecte')
    // Vérifie qu'il existe 
    if (res.status === 200) {
        // Store l'admin connecté dans une variable format Json 
        const adminConnecte = await res.json();
        if (!adminConnecte) {
            // S'il n'y a pas d'admin, redirection 
            window.location.href = 'connexion-inscription.html';
        }
    }
    else {
        // Sinon, redirige vers la page de connexion 
        window.location.href = 'connexion-inscription.html';
    }
})


loadDashboard()