window.addEventListener('DOMContentLoaded', async () => {

    /* Récupère l'admin connecté si c'est le cas */
    const res = await fetch('/getAdminConnecte')

    /* Vérifie qu'il existe */
    if (res.status === 200) {

        /* Store l'admin connecté dans une variable format Json */
        const adminConnecte = await res.json();

        if (!adminConnecte) {

            /* S'il n'y a pas d'admin, redirection */
            window.location.href = 'connexion-inscription.html';

        }

    } else {

        /* Sinon, redirige vers la page de connexion */
        window.location.href = 'connexion-inscription.html';

    }

})