// login.js - connexion utilisateur depuis login.html //


// récupération éléments du DOM
const form = document.querySelector("form");
const saisieEmail = document.querySelector("#logmail");
const saisiePassword = document.querySelector("#pass");
const messageErreur = document.createElement("p");

messageErreur.classList.add("error-message");
saisiePassword.after(messageErreur);

// fonction asynchrone = peut utiliser await à l'intérieur (permet requête réseau comme fetch)
form.addEventListener("submit", async (event) => {
    event.preventDefault();
    messageErreur.textContent = ""; // réinitialise le message d'erreur

    const email = saisieEmail.value.trim();
    const password = saisiePassword.value.trim();
    // trim pour enlever les espaces au début et à la fin d'une chaîne (évite erreurs de saisies dans le formulaire de login)

    if (!email || !password) { // vérifie si l'une des deux variables est absente
        messageErreur.textContent = "Veuillez remplir tous les champs";
        return;
    }

    try {
        const response = await fetch("http://localhost:5678/api/users/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password }) // transforme objet JavaScript en chaîne JSON (ici l'e-mail et le mot de passe)
        });

        if (response.ok) { // succès (codes de statut compris entre 200 et 299)
            const element = await response.json();
            sessionStorage.setItem("token", element.token); // stocke token dans sessionStorage
            window.location.href = "./index.html"; // redirection vers page d'accueil
            console.log("utilisateur authentifié, token stocké dans sessionStorage");
        } else { // else en cas d'erreur 401 = Unauthorized ou 404 = User not found
            messageErreur.textContent = "Erreur dans l'identifiant ou le mot de passe";
        }
    } catch (error) { // pour gérer une erreur si une exception se produit dans le bloc try
        messageErreur.textContent = "Erreur connexion";
        console.error("Détail erreur :", error);
    }
});

const token = sessionStorage.getItem("token");
if (token) {
    console.log("token login : présent");
} else {
    console.log("token login : absent");
}
