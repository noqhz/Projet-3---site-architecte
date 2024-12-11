/////// connecter utilisateur depuis login.html ///////


// déclaration éléments du DOM

const form = document.querySelector("form");
const saisieEmail = document.querySelector("#logmail");
const saisiePassword = document.querySelector("#pass");
const messageErreur = document.createElement("p");

messageErreur.classList.add("login-error");
saisiePassword.after(messageErreur); // placement du message d'erreur après le champ du mot de passe


// écoute de l'événement de soumission du formulaire
// async pour fonction asynchrone = peut utiliser await à l'intérieur (permet des requêtes réseau comme fetch)

form.addEventListener("submit", async (event) => {
    event.preventDefault(); // évite le rechargement de la page lorsqu'on clique sur submit
    messageErreur.textContent = ""; // réinitialise le message d'erreur

    const email = saisieEmail.value.trim();
    const password = saisiePassword.value.trim();
    // trim pour enlever les espaces au début et à la fin d'une chaîne
    // (évite erreurs de saisies dans le formulaire de login)
    console.log("mail saisi : ", email);
    console.log("password saisi : ", password);

    if (!email || !password) { // vérifie si l'une des deux variables est absente
        messageErreur.textContent = "Veuillez remplir tous les champs";
        return;
    }

    try {
        const response = await fetch("http://localhost:5678/api/users/login", {
            method: "POST", // requête avec POST utilisant fetch, pour envoyer les valeurs des entrées du formulaire
            headers: {
                "Content-Type": "application/json" // le contenu envoyé est de type JSON
            },
            body: JSON.stringify({ email, password }) // transforme objet JavaScript en chaîne JSON (ici l'e-mail et le mot de passe)
        });

        if (response.ok) { // succès (codes de statut compris entre 200 et 299)
            const element = await response.json();
            sessionStorage.setItem("token", element.token); // stocke le token dans le sessionStorage
            window.location.href = "./index.html"; // redirection vers la page d'accueil
            console.log("utilisateur authentifié, token stocké dans sessionStorage");
        } else { // else en cas d'erreur 401 = Unauthorized ou 404 = User not found
            messageErreur.textContent = "Erreur dans l'identifiant ou le mot de passe";
        }
    } catch (error) { // pour gérer une erreur si une exception se produit dans le bloc try
        messageErreur.textContent = "Erreur connexion"; // erreur réseau/serveur/configuration url
        console.error("Détail erreur :", error); // détails techniques de l'erreur
    }
});

// sessionStorage : données conservées tant que l'onglet est ouvert
// données temporaires spécifiques à une session utilisateur sans risque de persistance
// protection des données contre l'accès dans d'autres onglets

// localStorage : données stockées après fermeture onglet/navigateur (supprimées qmanuellement ou via le code)
// pour données persistantes à réutiliser, comme des préférences utilisateur