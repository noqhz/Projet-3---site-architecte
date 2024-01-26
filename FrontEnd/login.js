

// gestion du login
function loginGestion(){
    let login = document.querySelector("#loginForm");
    login.addEventListener("submit", (event) =>{
        event.preventDefault();
        try{
            let email = document.getElementById("email").value;
            let password = document.getElementById("password").value;
            console.log(email, password);
            validerId(email, password);
            messageErreur("");
            //ici redirection vers index avec ajout bouton
            RedirectionJavascript();
        } catch (erreur) {
            messageErreur(erreur.message);
        }  
    });
}

/**
 * Vérification de l'email et mot de passe
 * @param {string} email 
 * @param {string} password
 * @throw {error} 
 */
function validerId(email, password){
    if (email !== "sophie.bluel@test.tld" || password !== "S0phie"){
        throw new Error("L'email ou le mot de passe n'est pas valide.");
    }
}
/**
 * Afficher une seule fois un message d'erreur
 * @param {string} message 
 */
function messageErreur(message) {
    let spanErreurMessage = document.getElementById("erreurMessage");
    if (!spanErreurMessage){
        let popup = document.querySelector("#login h2");
        spanErreurMessage = document.createElement("p");
        spanErreurMessage.id = "erreurMessage";
        popup.append(spanErreurMessage);
    }
    spanErreurMessage.innerText = message;
}


//redirection
function Redirection(){
    document.location.href="index.html";
    let boutonModifier = document.querySelector(".gallery h2");
    boutonModifier = document.createElement("p");
    boutonModifier.innerHTML="Modifier";
}


//email: sophie.bluel@test.tld
//password: S0phie 