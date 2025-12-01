/* Récupère les éléments par leurs id sur gestionClients.html */
const dropDownMenuNomClients = document.getElementById("selectDropDownMenuNomsClients")
const montantPret = document.getElementById("montantPret")
const interet = document.getElementById("interet")
const dureePret = document.getElementById("dureePret")
const dateDebut = document.getElementById("dateDebut")
const bouttonSave = document.getElementById("savePret")
const formulairePret = document.getElementById("form")
const tableauPrets = document.getElementById("tableauPrets")

async function loadPrets() {
    const res = await fetch('http://localhost:3000/getPrets');
    const prets = await res.json();
}

function clearForm() {
    dropDownMenuNomClients.value = "0"
    montantPret.value = ""
    interet.value = ""
    dureePret.value = ""
    dateDebut.value = ""
}

// ajout du pret dans la bd lorsqu'on clique enregistrer
bouttonSave.addEventListener('click', async () => {
    const resultat = await fetch("/addPret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            idClient: dropDownMenuNomClients.value,
            montantPret: parseFloat(montantPret.value),
            interet: parseFloat(interet.value),
            duree: parseInt(dureePret.value),
            dateDebut: dateDebut.value
        })
    })
    if (!resultat.ok) {
        throw new Error("Erreur du côté serveur")
    }
    // reset tous les champs et focus le montant du pret, refresh aussi tous les prets
    clearForm()
    montantPret.focus()
    await loadPrets()
})

async function loadClients() {
    try {
        const resultat = await fetch('/getNomsClients')
        if (!resultat.ok) {
            throw new Error("Erreur côté serveur")
        }
        listeNomsClients = await resultat.json()
        listeNomsClients.forEach((client) => {
            const option = document.createElement('option')
            option.value = client.id
            option.textContent = `${client.prenom} ${client.nom}`
            dropDownMenuNomClients.appendChild(option)
        })
    }
    catch (err) {
        console.error(err)
        alert("Impossible d'afficher les clients")
    }
}

async function loadTable() {
    // vider le tableau en premier
    tableauPrets.innerHTML = `<tr>
                                <th>ID Prêt</th>
                                <th>Intérêts cumulés</th>
                                <th>Solde restant</th>
                                <th>Statut</th>
                              </tr>`

    try {
        const prets = await fetch('/getPrets')
        if (!prets.ok || !paiement.ok) {
            throw new Error("Erreur côté serveur")
        }
        
        prets.forEach((p) => {
            const paiement = await fetch(`/getSpecificPaiement/${p.id}`)
            // loop si le pret à été payé en plus qu'un payement
            var sommePayements = 0
            paiement.forEach((paye) => {
                sommePayements += paye.montantPaye
            })

            // calcul 
            const totalMontant = (p.interet / 100 + 1) * p.montant
            
            const d = new Date()
            // ajoute le nbre de mois du prets pour déterminer la date de fin du pret
            const datefinPret = new Date(p.dateDebut.setMonth(p.dateDebut.getMonth() + p.duree))
            const dateDiff = datefinPret.getTime() - d.getTime()
            
            // mets le statut en erreur de base comme ca 
            // s'il rentre pas somehow dans une des conditions on va le savoir
            var statut = "error"
            
            //checks pour le statut du pret (ACTIF, RETARD, REMBOURSÉ)
            // si sommePayements == montant total du pret => remboursé
            if (sommePayements == totalMontant){
                statut = "Remboursé"
            }
            else{
                // si la différence entre today et 
                if (dateDiff > 0) {
                    statut = "Retard"
                }
                else{
                    statut = "Actif"
                }
            }

            const row = document.createElement("tr")
            row.innerHTML = `
            <td>${p.idPret}</td>
            <td>${(p.interet / 100) * p.montant}</td>
            <td>${totalMontant - sommePayements}</td>
            <td>${statut}
            <td>
                <button class="selectionner button card-footer-item">Sélectionner</button>
            </td>
            `
            // ajoute la rangée au tableau
            tableauPrets.appendChild(row)

            //ajoute une fonction lorsque le boutton est cliqué
            row.querySelector('.selectionner').addEventListener('click', (e)=>{
                e.preventDefault()
            })
        })
    }
}




loadPrets()
loadClients()