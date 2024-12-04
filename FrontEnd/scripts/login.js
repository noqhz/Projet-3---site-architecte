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

    if (!email || !password) { // vérifie si l'une des deux variables est fausse
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

        if (response.ok) {
            const element = await response.json();
            localStorage.setItem("token", element.token); // stocke le token dans le localStorage
            window.location.href = "./index.html"; // redirection vers la page d'accueil
            console.log("utilisateur authentifié, token stocké dans localStorage");
        } else if (response.status === 401) { // else if pour vérifier la condition spécifique response.status === 401
            messageErreur.textContent = "Erreur dans l'identifiant ou le mot de passe";
        } else { // else pour tous les cas qui ne correspondent pas à la condition précédente (ni 200 = succès, ni 401 = Unauthorized)
            messageErreur.textContent = "Une erreur est survenue. Veuillez réessayer";
        }
    } catch (error) { // pour gérer une erreur si une exception se produit dans le bloc try
        messageErreur.textContent = "Erreur connexion serveur."; // erreur réseau/serveur/configuration url
        console.error("Détail erreur :", error); // détails techniques de l'erreur
    }
});


// test token dans localStorage (temporaire)

const token = localStorage.getItem("token");

if (token) {
console.log("Le token est présent :", token);
} else {
console.log("Pas de token d'authentification");
}
