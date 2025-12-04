/* Récupère les éléments du DOM une fois la page chargée */
const titreConnexionInscription = document.getElementById('titreConnexionInscription');
const nomAdmin = document.getElementById('nomAdmin');
const motDePasseAdmin = document.getElementById('motDePasseAdmin');
const submitBtn = document.getElementById('submitBtn');
const messageErreur = document.getElementById('messageErreur');

// /* S'éxécute lorsque le contenu de la page est chargé */
// window.addEventListener('DOMContentLoaded', async () => {

//     /* Récupère l'admin connecté si c'est le cas */
//     const response = await fetch ('/getAdminConnecte')
//     const adminConnecte = response.json();

//     /* Met à jour l'interface en fonction de l'état de connexion de l'admin */
//     if (response.status === 200 && adminConnecte) {

//         /* Change la valeur du titre */
//         titreConnexionInscription.textContent = 'Connexion';

//         /* Préremplit le champ du nom */
//         nomAdmin.value = adminConnecte.nomAdmin;

//         /* Change la couleur de fond des champs pour indiquer qu'ils sont préremplis */
//         nomAdmin.style.backgroundColor = '#6f9dc9ff';

//         /* Préremplit le champ du mot de passe */
//         motDePasseAdmin.value = adminConnecte.motDePasseAdmin;

//         /* Change la couleur de fond des champs pour indiquer qu'ils sont préremplis */
//         motDePasseAdmin.style.backgroundColor = '#6f9dc9ff';

//         /* Change le texte du bouton de soumission */
//         submitBtn.textContent = 'Se connecter';

//     } else {

//         /* Change la valeur du titre */
//         titreConnexionInscription.textContent = "Inscription";

//         /* Change le texte du bouton de soumission */
//         submitBtn.textContent = "S'inscrire";
//     }

// })

