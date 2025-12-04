// Récupère les éléments par leurs id sur gestionClients.html 
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

function calculateLoan(montantRestant, interet, nbreMois) {
    var i = interet / 100 / 12
    var payement = ((i * montantRestant) / (1 - Math.pow(1 + i, -nbreMois)))
    return payement
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
                                <th>Intérêts totaux</th>
                                <th>Solde restant</th>
                                <th>Prochain paiement</th>
                                <th>Statut</th>
                              </tr>`

    try {
        const prets = await fetch('/getPrets')
        if (!prets.ok) {
            throw new Error("Erreur côté serveur")
        }
        const listePrets = await prets.json()
        listePrets.forEach(async (p) => {
            //update du statut du pret (ACTIF, RETARD, REMBOURSÉ)
            const updateRetard = await fetch(`/updateRetard/${p.idPret}`, { method: 'PUT' })
            if (!updateRetard.ok) {
                throw new Error("Erreur côté serveur")
            }
            const row = document.createElement("tr")
            row.innerHTML = `
            <td>${p.idPret}</td>
            <td>${(calculateLoan(p.montant, p.interet, p.duree) * p.duree - p.montantInitial).toFixed(2)}$</td>
            <td>${p.montant.toFixed(2)}$</td>
            <td>${(calculateLoan(p.montant, p.interet, p.duree)).toFixed(2)}$</td>
            <td>${p.statut}
            <td>
                <button class="selectionner button card-footer-item">Sélectionner</button>
            </td>
            `
            // ajoute la rangée au tableau
            tableauPrets.appendChild(row)
            
            // fonctionalité pour le boutton de selection du prêt
            rangee.querySelector('.selectionner').addEventListener("click", (e) => {
                e.preventDefault();
                // Retire le message de confirmation 
                messageConfirmation.textContent = "";
                // Assigne les valeurs dans les inputs 
                nomClient.value = c.nom;
                prenomClient.value = c.prenom;
                emailClient.value = c.email;
                telephoneClient.value = c.numeroDeTelephone;
                adresseClient.value = c.adresse;
                boutonEnregistrerClient.textContent = "Modifier et quitter la sélection";
                clientModifié = c;
                divBoutonSupprimer.innerHTML = `<button class="bouton-supprimer button is-primary">Supprimer et quitter la sélection</button>`;
                divBoutonQuitter.innerHTML = `<button class="bouton-quitter button is-primary">Quitter la sélection</button>`
                // Supprime un client lorsque le bouton supprimer est cliqué 
                // D'abord, on récupère les boutons 
                const boutonSupprimer = divBoutonSupprimer.querySelector('.bouton-supprimer');
                const boutonQuitter = divBoutonQuitter.querySelector('.bouton-quitter')
                // Fonction lorsque le bouton supprimer est cliqué 
                boutonSupprimer.addEventListener("click", async (event) => {
                    // Empêche le comportement de base du bouton 
                    event.preventDefault();
                    event.stopPropagation();
                    // Supprime le client de la liste clients 
                    clients = clients.filter((client) => client.id !== c.id);
                    // Appelle de la requête qui supprime le client de la base de données 
                    const res = await fetch(`/deleteClient/${c.id}`, {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' }
                    });
                    // Envoie une erreur si le client n'a pas été supprimé correctement 
                    if (!res.ok) throw new Error("Erreur lors de la suppression");
                    // Message de confirmation côté serveur 
                    const data = await res.json();
                    console.log("Client supprimé côté serveur: ", data.deletedClient)
                    // Message de confirmation 
                    messageConfirmation.textContent = "Client supprimé avec succès!";
                    // Change la valeur du bouton enregistrer client 
                    boutonEnregistrerClient.textContent = "Enregister le nouveau client";
                    // Retire le bouton supprimer et le bouton quitter 
                    divBoutonSupprimer.innerHTML = "";
                    divBoutonQuitter.innerHTML = "";
                    // Réinitialise les champs pour ajouter un client 
                    nomClient.value = "";
                    prenomClient.value = "";
                    emailClient.value = "";
                    telephoneClient.value = "";
                    adresseClient.value = "";
                    // Appel de la fonction loadClients()                     
                    loadClients();
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
                    boutonEnregistrerClient.textContent = "Enregister le nouveau client";
                    // Retire le bouton supprimer et le bouton quitter 
                    divBoutonSupprimer.innerHTML = "";
                    divBoutonQuitter.innerHTML = "";
                    // Réinitialise les champs pour ajouter un client 
                    nomClient.value = "";
                    prenomClient.value = "";
                    emailClient.value = "";
                    telephoneClient.value = "";
                    adresseClient.value = "";
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




loadPrets()
loadClients()
loadTable()