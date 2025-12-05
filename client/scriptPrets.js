// Récupère les éléments par leurs id sur gestionClients.html 
const dropDownMenuNomClients = document.getElementById("selectDropDownMenuNomsClients")
const montantPret = document.getElementById("montantPret")
const interet = document.getElementById("interet")
const dureePret = document.getElementById("dureePret")
const dateDebut = document.getElementById("dateDebut")
const bouttonSave = document.getElementById("savePret")
const formulairePret = document.getElementById("form")
const tableauPrets = document.getElementById("tableauPrets")
const bouttonDelete = document.getElementById("bouttonSupprimer")
const bouttonQuit = document.getElementById("bouttonQuitter")
const messageConfirmation = document.getElementById("msgConfirmation")
const idPretHidden = document.getElementById('idPret')

var prets = []

async function loadPrets() {
    const res = await fetch('http://localhost:3000/getPrets');
    prets = await res.json();
}

function clearForm() {
    dropDownMenuNomClients.value = "0"
    montantPret.value = ""
    interet.value = ""
    dureePret.value = ""
    dateDebut.value = ""
}

function calculateLoan(montantRestant, interet, nbreMois) {
    var i = interet / 100 / 12
    var payement = ((i * montantRestant) / (1 - Math.pow(1 + i, -nbreMois)))
    return payement
}

const filterButton = document.getElementById('buttonTrierPrets')
const statusFilter = document.getElementById('satut')
const nameFilter = document.getElementById('nomClient')

filterButton.addEventListener('click', async () => {
    if (filterButton.textContent == "Rechercher") {
        filterButton.textContent = "Réinitialiser la liste"
        if (statusFilter.checked) {
            prets.sort((a, b) => a.statut.localeCompare(b.statut))
        }
        else if (nameFilter.checked) {
            prets.sort((a, b) => b.prenom.localeCompare(a.prenom))
        }
        load()
    }
    // pourrait juste mettre un else mais juste pour etre sur
    else if (filterButton.textContent == "Réinitialiser la liste") {
        load()
        filterButton.textContent = "Rechercher"
        statusFilter.checked = false
        nameFilter.checked = false
    }
})

// ajout du pret dans la bd lorsqu'on clique enregistrer
bouttonSave.addEventListener('click', async () => {
    // si le boutton est normal, effectue ses actions de base
    if (bouttonSave.textContent == "Enregistrer le prêt") {
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
        load()
    }
    // si non, il est en "mode edit" et on change ses actions
    else {
        const mod = await fetch(`/updatePret/${idPretHidden.value}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                idClient: dropDownMenuNomClients.value,
                montantPret: parseFloat(montantPret.value),
                interet: parseFloat(interet.value),
                duree: parseInt(dureePret.value),
                dateDebut: dateDebut.value
            })
        })
        if (!mod.ok) {
            throw new Error("Erreur du côté serveur")
        }
        load()
        montantPret.focus()

    }
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
                                <th>Nom du client</th>
                                <th>Intérêts totaux</th>
                                <th>Solde restant</th>
                                <th>Prochain paiement</th>
                                <th>Statut</th>
                              </tr>`

    try {
        prets.forEach(async (p) => {
            //update du statut du pret (ACTIF, RETARD, REMBOURSÉ)
            const updateRetard = await fetch(`/updateRetard/${p.idPret}`, { method: 'PUT' })
            if (!updateRetard.ok) {
                throw new Error("Erreur côté serveur")
            }
            const row = document.createElement("tr")
            row.innerHTML = `
            <td>${p.idPret}</td>
            <td>${p.prenom}</td>
            <td>${(calculateLoan(p.montant, p.interet, p.duree) * p.duree - p.montantInitial).toFixed(2)}$</td>
            <td>${(calculateLoan(p.montant, p.interet, p.duree) * p.duree).toFixed(2)}$</td>
            <td>${(calculateLoan(p.montant, p.interet, p.duree)).toFixed(2)}$</td>
            <td>${p.statut}
            <td>
                <button class="selectionner button card-footer-item">Sélectionner</button>
            </td>
            `
            // ajoute la rangée au tableau
            tableauPrets.appendChild(row)

            // fonctionalité pour le boutton de selection du prêt
            row.querySelector('.selectionner').addEventListener("click", (e) => {
                e.preventDefault();
                // Retire le message de confirmation 
                messageConfirmation.textContent = "";
                // Assigne les valeurs dans les inputs 
                dropDownMenuNomClients.value = p.idClient
                montantPret.value = p.montantInitial
                interet.value = p.interet
                dureePret.value = p.duree
                dateDebut.value = p.dateDebut
                idPretHidden.value = p.idPret

                bouttonSave.textContent = "Modifier et quitter la sélection";
                pretModifie = p
                bouttonDelete.innerHTML = '<button class="bouton-supprimer button is-primary">Supprimer et quitter la sélection</button>'
                bouttonQuit.innerHTML = '<button class="bouton-quitter button is-primary">Quitter la sélection</button>'
                // Supprime un pret lorsque le bouton supprimer est cliqué 
                // D'abord, on récupère les boutons 
                const boutonSupprimer = bouttonDelete.querySelector('.bouton-supprimer');
                const boutonQuitter = bouttonQuit.querySelector('.bouton-quitter')
                // Fonction lorsque le bouton supprimer est cliqué 
                boutonSupprimer.addEventListener("click", async (event) => {
                    // Empêche le comportement de base du bouton 
                    event.preventDefault()
                    event.stopPropagation()

                    // Appelle de la requête qui supprime le pret de la base de données 
                    const res = await fetch(`/deletePret/${pretModifie.idPret}`, { method: 'DELETE' })
                    // Envoie une erreur si le pret n'a pas été supprimé correctement 
                    if (!res.ok) { throw new Error("Erreur lors de la suppression") }
                    // Message de confirmation côté serveur 
                    const data = await res.json();
                    console.log("Prêt supprimé côté serveur: ", data.pretSupprime)
                    // Message de confirmation 
                    messageConfirmation.textContent = "Client supprimé avec succès!";
                    // Change la valeur du bouton enregistrer pret 
                    bouttonSave.textContent = "Enregistrer le prêt";
                    // Retire le bouton supprimer et le bouton quitter 
                    bouttonDelete.innerHTML = "";
                    bouttonQuit.innerHTML = "";
                    // Réinitialise les champs pour le prochain pret
                    clearForm()
                    // reload des infos                     
                    load()

                    // Vide le message de confirmation après 2 secondes 
                    setTimeout(() => {
                        messageConfirmation.textContent = "";
                    }, 2000);
                });

                // Fonction lorsque le bouton quitté est cliqué 
                boutonQuitter.addEventListener('click', (event) => {
                    // Empêche le comportement de base du bouton 
                    event.preventDefault();
                    event.stopPropagation();
                    // Change la valeur du bouton enregistrer client 
                    bouttonSave.textContent = "Enregistrer le prêt";
                    // Retire le bouton supprimer et le bouton quitter 
                    bouttonDelete.innerHTML = "";
                    bouttonQuit.innerHTML = "";
                    // Réinitialise les champs pour le prochain pret
                    clearForm()
                })
            }
            )
        })
    }
    catch (err) {
        console.error(err)
        alert("Impossible d'afficher les prêts")
    }
}


async function load() {
    await loadPrets()
    await loadClients()
    await loadTable()
}

load()