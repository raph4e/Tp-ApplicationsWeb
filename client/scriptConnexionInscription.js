/* S'éxécute lorsque le contenu de la page est chargé */
window.addEventListener('DOMContentLoaded', async () => {

    /* Récupère les éléments du DOM une fois la page chargée */
    const titreConnexionInscription = document.getElementById('titreConnexionInscription');
    const nomAdmin = document.getElementById('nomAdmin');
    const motDePasseAdmin = document.getElementById('motDePasseAdmin');
    const submitBtn = document.getElementById('submitBtn');
    const dejaUnCompteBtn = document.getElementById('dejaUnCompteBtn')
    const messageErreur = document.getElementById('messageErreur');

    /* Appel de la fonction qui charge les données avec les cookies */
    chargerDonneesDepuisCookies();

    /* Change la valeur du titre */
    titreConnexionInscription.textContent = 'Connexion';

    /* Change le texte du bouton de soumission */
    submitBtn.textContent = 'Se connecter';

    /* Change le texte du bouton pour indiquer au client qu'il peut s'inscrire si il n'a pas de compte */
    dejaUnCompteBtn.textContent = "Pas de compte? S'inscrire"

    /* S'éxécute lorsque l'utilisateur clique sur le bouton pas de compte */
    dejaUnCompteBtn.addEventListener('click', (e) => {

        /* Préviens le comportement par défaut du bouton */
        e.preventDefault()

        if (dejaUnCompteBtn.textContent === "Pas de compte? S'inscrire") {

            /* Change la valeur du titre */
            titreConnexionInscription.textContent = "Inscription";

            /* Change le texte du bouton de soumission */
            submitBtn.textContent = "S'inscrire";

            /* Change le texte du bouton pour indiquer au client qu'il peut se connecter si il a déjà un compte */
            dejaUnCompteBtn.textContent = "Déjà un compte? Se connecter"

            /* Vide les inputs */
            nomAdmin.value = "";
            motDePasseAdmin.value = "";

            /* Retire la classe input-filled des inputs */
            nomAdmin.classList.remove('input-filled');
            motDePasseAdmin.classList.remove('input-filled');

        } else {

            /* Change la valeur du titre */
            titreConnexionInscription.textContent = 'Connexion';

            /* Change le texte du bouton de soumission */
            submitBtn.textContent = 'Se connecter';

            /* Rappel de la fonction qui charge les données avec les cookies */
            chargerDonneesDepuisCookies();

            /* Change le texte du bouton pour indiquer au client qu'il peut s'inscrire si il n'a pas de compte */
            dejaUnCompteBtn.textContent = "Pas de compte? S'inscrire"
        }
    });    

    /* S'éxécute lorsque le bouton connexion / inscription est cliqué */
    submitBtn.addEventListener('click', async (e) => {

        /* Préviens le comportement par défaut du bouton */
        e.preventDefault();

        try {
            /* S'éxécute si le bouton affiche inscription */
            if (submitBtn.textContent === "S'inscrire") {

                /* Store les infos entrées dans un cookie */
                document.cookie = `nomAdmin=${encodeURIComponent(nomAdmin.value)}; path=/`;
                document.cookie = `motDePasseAdmin=${encodeURIComponent(motDePasseAdmin.value)}; path=/`;
                
                /* Récupère la requête permettant d'ajouter un client */
                const res = await fetch('/addAdmin', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        nomAdmin: nomAdmin.value,
                        motDePasseAdmin: motDePasseAdmin.value,
                    })
                });  

                /* S'éxécute si il y a une erreur */
                if (!res.ok) {

                    /* Indique l'erreur dans la console */
                    const err = await res.text();
                    console.error("Erreur côté serveur lors de l'ajout du nouvel admin: ", err);

                    /* L'indique à l'utilisateur */
                    messageErreur.textContent = "Une erreur est survenu, veuillez réessayer";

                    /* Change la couleur du message d'erreur */
                    messageErreur.style.color = "red";

                    /* Réinitialise les inputs */
                    nomAdmin.value = "";
                    motDePasseAdmin.value = "";
                };

                /* Indique à l'utilisateur que la création de son compte admin a été effectué avec succès */
                messageErreur.textContent = "Compte admin créé avec succès"

                /* Change la couleur du message d'erreur */
                messageErreur.style.color = "green";

            } else {

                /* Créé une liste vide pour les admins */
                let admins = []

                /* Création d'une variable si la connexion a été réussi */
                let connexionReussie = false;

                /* Vérifie si les champs rentrés correspond a un admin dans la table admin */
                admins = await (await (fetch('/getAdmins'))).json()

                /* Parcoure la liste admins */
                for (const a of admins) {

                    /* Vérifie si les champs correspondent aux valeurs entrées */
                    if (a.nomAdmin === nomAdmin.value && a.motDePasseAdmin === motDePasseAdmin.value) {

                        /* Créé une variable qui indique si la connexion est réussi */
                        connexionReussie = true

                        /* Indique au client si c'est le cas */
                        messageErreur.textContent = "Connexion réussie! Redirection..."

                        /* Change la couleur du message d'erreur */
                        messageErreur.style.color = "green";

                        /* Vide la table adminConnecte */
                        await fetch('/delAdminConnecte')

                        /* Ajoute l'admin à la table admin connecté */
                        await fetch('/addAdminConnecte', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                idAdminConnecte: a.idAdmin,
                                nomAdminConnecte: nomAdmin.value,
                                motDePasseAdmin: motDePasseAdmin.value,
                            })
                        });  

                        /* Redirige le client vers dashboard.html */
                        setTimeout(() => {
                            window.location.href = "/dashboard.html";
                        }, 2000);

                        /* Arrête la boucle */
                        break;
                    }
                }

                /* Indique au client si la connexion n'est pas réussi */
                if (!connexionReussie) {

                    /* Indique l'erreur à l'utilisateur */
                    messageErreur.textContent = "Nom d'utilisateur ou mot de passe incorrect";

                    /* Change la couleur du message d'erreur */
                    messageErreur.style.color = "red";

                    /* Réinitialise les inputs */
                    nomAdmin.value = "";
                    motDePasseAdmin.value = "";
                }

                
            }
        } catch (error) {

            /* Indique l'erreur s,il y a le cas */
            console.error("Erreur serveur: ", error);            
        }
    })
});

function chargerDonneesDepuisCookies() {
    /* Récupère les cookies et les divise en paires clé-valeur */
    const cookies = document.cookie.split('; ');

    /* Parcoure chaque cookie et remplit les champs de formulaire correspondants */
    cookies.forEach(cookie => {

        /* Divise chaque cookie en clé et valeur */
        const [clé, valeur] = cookie.split('=');

        /* Remplit les champs de formulaire correspondants */
        const input = document.getElementById(clé);

        /* Vérifie si l'input existe avant de lui assigner une valeur */
        if (input) {

            /* Décode la valeur et l'assigne à l'input */
            input.value = decodeURIComponent(valeur);

            /* Ajoute une classe pour indiquer que l'input est rempli */
            input.classList.add('input-filled');
        }
    });
}