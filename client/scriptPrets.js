/* Récupère les éléments par leurs id sur gestionClients.html */
const dropDownMenuNomClients = document.getElementById("selectDropDownMenuNomsClients")
const montantPret = document.getElementById("montantPret")
const interet = document.getElementById("interet")
const dureePret = document.getElementById("dureePret")
const dateDebut = document.getElementById("dateDebut")
const bouttonSave = document.getElementById("savePret")
const formulairePret = document.getElementById("form")

async function loadPrets() {
    const res = await fetch('http://localhost:3000/getPrets');
    clients = await res.json();
}

function clearForm() {
    dropDownMenuNomClients.value = "0"
    montantPret.value = ""
    interet.value = ""
    dureePret.value = ""
    dateDebut.value = ""
}

// for some reason dans bd, idPret = NULL & dateDebut = la date d'aujourd'hui

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
        listeNomsClients.forEach((client)=>{
            const option = document.createElement('option')
            option.value = client.id
            option.textContent = `${client.prenom} ${client.nom}`
            dropDownMenuNomClients.appendChild(option)
        })
    }
    catch(err) {
        console.error(err)
        alert("Impossible d'afficher les clients")
    }
}





loadPrets()
loadClients()