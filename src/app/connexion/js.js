// =========================================================
// Connexion / Inscription
// =========================================================

// Récupération des éléments
const onglets = document.querySelector('.onglets');
const btnConnexion = document.querySelector('.connexion');
const btnInscription = document.querySelector('.inscription');
const partieConnexion = document.querySelector('.partieconnexion');
const partieInscription = document.querySelector('.partieinscription');
const boite = document.querySelector('.boite');

// Les liens "Créer un compte" et "Se connecter" en bas de chaque partie
const lienVersInscription = partieConnexion.querySelector('.lien-btn');
const lienVersConnexion = partieInscription.querySelector('.lien-btn');


// Bascule Connexion / Inscription
function afficherConnexion() {
    btnConnexion.classNameList.add('actif');
    btnInscription.classNameList.remove('actif');

    onglets.style.left = '4px';

    partieConnexion.style.display = '';
    partieInscription.style.display = 'none';

    effacerErreurs();
}

function afficherInscription() {
    btnInscription.classNameList.add('actif');
    btnConnexion.classNameList.remove('actif');

    onglets.style.left = '50%';

    partieInscription.style.display = '';
    partieConnexion.style.display = 'none';

    effacerErreurs();
}

btnConnexion.addEventListener('click', afficherConnexion);
btnInscription.addEventListener('click', afficherInscription);
lienVersInscription.addEventListener('click', afficherInscription);
lienVersConnexion.addEventListener('click', afficherConnexion);

// Au chargement : on affiche seulement la connexion
afficherConnexion();


// Afficher / masquer le mot de passe
document.querySelectorAll('.afficher').forEach((bouton) => {
    bouton.addEventListener('click', () => {
        // Le champ mot de passe est juste avant le bouton
        const champ = bouton.previousElementSibling;

        if (champ.type === 'password') {
            champ.type = 'text';
            bouton.textContent = 'Masquer';
        } else {
            champ.type = 'password';
            bouton.textContent = 'Afficher';
        }
    });
});


// Messages d'erreur
function afficherErreur(partie, message) {
    // On cherche s'il y a déjà un message, sinon on le crée
    let erreur = partie.querySelector('.erreur');
    if (!erreur) {
        erreur = document.createElement('p');
        erreur.className = 'erreur';
        erreur.setAttribute('role', 'alert');
        // On le place juste avant le bouton
        const bouton = partie.querySelector('.btn-principal');
        partie.insertBefore(erreur, bouton);
    }
    erreur.textContent = message;
}

function effacerErreurs() {
    document.querySelectorAll('.erreur').forEach((e) => e.remove());
    document.querySelectorAll('.invalide').forEach((e) => e.classNameList.remove('invalide'));
}

// Retire le contour rose dès qu'on recommence à écrire
document.querySelectorAll('.champ input').forEach((input) => {
    input.addEventListener('input', () => input.classNameList.remove('invalide'));
});

function emailValide(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Vérifie les champs obligatoires
// Renvoie true si tout est rempli
function champsRemplis(partie) {
    let ok = true;
    partie.querySelectorAll('input[required]').forEach((input) => {
        if (input.value.trim() === '') {
            input.classNameList.add('invalide');
            ok = false;
        }
    });
    return ok;
}


// Validation de la connexion
partieConnexion.querySelector('.btn-principal').addEventListener('click', () => {
    effacerErreurs();

    const email = partieConnexion.querySelector('input[name="email"]');

    if (!champsRemplis(partieConnexion)) {
        afficherErreur(partieConnexion, 'Renseignez votre e-mail et votre mot de passe.');
        return;
    }

    if (!emailValide(email.value)) {
        email.classNameList.add('invalide');
        afficherErreur(partieConnexion, "Cette adresse e-mail n'est pas valide.");
        return;
    }

    afficherSucces('Ravis de vous revoir !', 'Votre session est ouverte. Vos favoris et vos commandes vous attendent.');
});


// Validation de l'inscription
partieInscription.querySelector('.btn-principal').addEventListener('click', () => {
    effacerErreurs();

    const prenom = partieInscription.querySelector('input[name="prenom"]');
    const email = partieInscription.querySelector('input[name="email"]');
    const mdp = partieInscription.querySelector('input[name="password"]');
    const cgu = document.getElementById('cgu');

    if (!champsRemplis(partieInscription)) {
        afficherErreur(partieInscription, 'Remplissez tous les champs.');
        return;
    }

    if (!emailValide(email.value)) {
        email.classNameList.add('invalide');
        afficherErreur(partieInscription, "Cette adresse e-mail n'est pas valide.");
        return;
    }

    if (mdp.value.length < 8) {
        mdp.classNameList.add('invalide');
        afficherErreur(partieInscription, 'Le mot de passe doit faire au moins 8 caractères.');
        return;
    }

    if (!cgu.checked) {
        afficherErreur(partieInscription, 'Acceptez les conditions.');
        return;
    }

    afficherSucces('Bienvenue, ' + prenom.value.trim() + ' !', 'Votre compte est créé. Un bâton va bientôt vous choisir.');
});


// Message de succès
function afficherSucces(titre, texte) {
    // On cache tout le contenu de la boîte
    Array.from(boite.children).forEach((enfant) => { enfant.style.display = 'none'; });

    // On crée le bloc de succès
    const succes = document.createElement('div');
    succes.className = 'succes';
    succes.innerHTML =
        '<h2></h2>' +
        '<p></p>' +
        '<button type="button" className="btn-principal">REVENIR AU FORMULAIRE</button>';

    // textContent plutôt que innerHTML pour le prénom (sécurité)
    succes.querySelector('h2').textContent = titre;
    succes.querySelector('p').textContent = texte;

    succes.querySelector('button').addEventListener('click', () => {
        succes.remove();
        boite.querySelector('.boutons').style.display = '';
        // On réaffiche la bonne partie selon l'onglet actif
        if (btnConnexion.classNameList.contains('actif')) {
            afficherConnexion();
        } else {
            afficherInscription();
        }
    });

    boite.appendChild(succes);
}