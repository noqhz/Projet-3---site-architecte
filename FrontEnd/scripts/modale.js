// modale.js - creation boite modale : ajout et suppression de travaux //


async function modeEdition() {

    const response = await fetch('http://localhost:5678/api/works');
    const getworks = await response.json();

    if (token) {

        bandeauEdition();
        lienModifier();
        filtresOff();
        logout();
        modaleHtml();
        
        /// ouverture boite modale au clic
        let modal = null;
        const focusableSelector= "button, a, p, input, select";
        let focusables = [];
        let previouslyFocusedElement = null;

        const openModal = function (e) { // ouverture modale
            e.preventDefault();
            modal = document.querySelector(e.target.getAttribute("href"));
            focusables = Array.from(modal.querySelectorAll(focusableSelector));
            previouslyFocusedElement = document.querySelector(":focus");
            modal.classList.remove("modal-hidden");
            // modal.style.display = null;
            focusables[0].focus();
            modal.removeAttribute("aria-hidden");
            modal.setAttribute("aria-modal", "true");
            modal.addEventListener("click", closeModal);
            modal.querySelector(".js-modal-close").addEventListener("click", closeModal);
            modal.querySelector(".js-modal-stop").addEventListener("click", stopPropagation);
        }

        const closeModal = async function (e) { //fermeture modale
            if (modal === null) return;
            if (previouslyFocusedElement !== null) previouslyFocusedElement.focus();
            e.preventDefault();
            window.setTimeout(function () {
                modal.classList.add("modal-hidden");
                // modal.style.display = "none";
                modal = null;
            }, 500)
            modal.setAttribute("aria-hidden", "true");
            modal.removeAttribute("aria-modal");
            modal.removeEventListener("click", closeModal);
            modal.querySelector(".js-modal-close").removeEventListener("click", closeModal);
            modal.querySelector(".js-modal-stop").removeEventListener("click", stopPropagation);
        }

        const stopPropagation = function (e) { // stopPropagation sur div modal-wrapper = bloque closeModal sur ce div
            e.stopPropagation();
        }

        const focusInModal = function (e) { // place le focus de Tab sur la boite modale
            e.preventDefault();
            let index = focusables.findIndex(f => f === modal.querySelector(":focus"));
            if (e.shiftKey === true) { // shift + Tab = retour sur le focus précédent
                index--;
            } else {
                index++;
            }
            if (index >= focusables.length) {
                index = 0;
            }
            if (index < 0) {
                index = focusables.length - 1;
            }
            focusables[index].focus(); // press Tab = déplace focus sur élément suivant dans le tableau focusables
        }

        document.querySelectorAll(".lien-modale").forEach(a => { // querySelectorAll avec forEach 
            a.addEventListener("click", openModal) // au clic sur un élément avec classe lien-modale, fonction openModal appelée
        })

        window.addEventListener("keydown", function (e) { // fermeture boite modale avec touche échap
            if (e.key === "Escape" || e.key === "Esc") {
                closeModal(e);
            }
            if (e.key === "Tab" && modal !== null) {
                focusInModal(e);
            }
        })

        // affichage travaux modale
        const worksJS = await import('./works.js');
        worksJS.afficherImages(getworks, ".modal-gallery");
        attacherEvenementsSuppression(getworks);
        
        // événement de suppression sur chaque bouton
        function attacherEvenementsSuppression(getworks) {
            const boutonDelete = document.querySelectorAll(".delete-button");
            boutonDelete.forEach((button) => {
                button.addEventListener("click", async (event) => {
                    event.preventDefault();
                    const figureDeleteId = button.getAttribute("id"); // id de get/works lié au bouton
                    if (confirm("Confirmer la suppression")) {
                        await supprimerTravaux(figureDeleteId, getworks);
                    }
                });
            });
        }

        // supprimer travaux depuis modale
        async function supprimerTravaux(figureDeleteId) {
            try {
                const response = await fetch(`http://localhost:5678/api/works/${figureDeleteId}`, {
                    method: "DELETE",
                    headers: {
                        accept: "*/*",
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (!response.ok) {
                    throw new Error(`Erreur lors de la suppression : ${response.statusText}`);
                }

                // mise à jour affichage
                document.querySelector(`#work-${figureDeleteId}`)?.remove();
                const updateTravaux = getworks.filter(work => work.id != figureDeleteId);
                worksJS.afficherImages(updateTravaux, ".modal-gallery");
                worksJS.afficherImages(updateTravaux, ".gallery");
                
                // reset événement de suppression
                attacherEvenementsSuppression(updateTravaux); 

            } catch (error) {
                console.error("Erreur :", error);
                alert("Erreur lors de la suppression. Veuillez réessayer.");
            }
        }

        // form select -> options depuis categories de l'API
        async function categoriesSelect() {
            const selectElement = document.getElementById("choixCategorie");
            selectElement.innerHTML = ""; // reset options existantes

            const optionVide = document.createElement("option");
            optionVide.value = "";
            optionVide.textContent = "";
            selectElement.appendChild(optionVide);
                
            try {
                const response = await fetch("http://localhost:5678/api/categories");
                const categories = await response.json();
        
                categories.forEach((category) => {
                    const option = document.createElement("option");
                    option.value = category.id;
                    option.textContent = category.name;
                    selectElement.appendChild(option);
                });
            } catch (error) {
                console.error("Erreur :", error);
            }
        }
        categoriesSelect();

        // ajout travaux depuis modale
            const form = document.getElementById("formAjout");
            form.addEventListener("submit", async (event) => {
            event.preventDefault();

            // récupération des données
            const fileInput = document.getElementById("ajoutPhoto");
            const titreInput = document.getElementById("titreImg");
            const categorieInput = document.getElementById("choixCategorie");

            const file = fileInput.files[0];
            let titre = titreInput.value;
            const categorie = categorieInput.value;

            if (!file || !titre || !categorie) {
                let messageErreur = document.querySelector(".error-message");
                if (!messageErreur) { // si messageErreur existe, son contenu est mis à jour
                    messageErreur = document.createElement("p");
                    messageErreur.classList.add("error-message");
                    const wrapper2HR = document.querySelector("form hr");
                    wrapper2HR.after(messageErreur);
                }
                messageErreur.textContent = "Veuillez remplir tous les champs";
                messageErreur.style.display = "block";
                return;
            }

            messageErreur = document.querySelector(".error-message");
            if (messageErreur) {
                messageErreur.style.display = "none";
            }

            // regex titre
            let titreRegex = titre.replace(/[-\d]+/g, " ").trim().replace(/\b\w/g, (char) => char.toUpperCase());
            titre = titreRegex;

            // préparation des données pour l'envoi
            const formData = new FormData();
            formData.append("image", file);
            formData.append("title", titre);
            formData.append("category", parseInt(categorie));

            try {
                const response = await fetch("http://localhost:5678/api/works", {
                    method: "POST",
                    headers: {
                        Accept : "application/json",
                        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
                    },
                    body: formData,
                });

                if (response.ok) {

                    const newWork = await response.json(); // récupére objet ajouté
                    getworks.push(newWork); // ajoute nouvel envoi à getworks
                    // mise à jour affichage
                    worksJS.afficherImages(getworks, ".gallery");
                    worksJS.afficherImages(getworks, ".modal-gallery");
                    form.reset(); // reset formulaire après envoi
                    previewImg.style.display = "none";
                    const wrapper2Icon = document.querySelector(".fa-image");
                    const uploadPhoto = document.querySelector(".ajout-photo button");
                    const descPhoto = document.querySelector(".ajout-photo p");
                    wrapper2Icon.style.display = "block";
                    uploadPhoto.style.display = "block";
                    descPhoto.style.display = "block";
                } else {
                    const errorData = await response.json();
                    console.error("Erreur lors de l'ajout :", errorData);
                    alert("Erreur lors de l'ajout : " + errorData.message);
                }
            } catch (error) {
                console.error("Erreur :", error);
                alert("Une erreur est survenue. Veuillez réessayer.");
            }

        });
    }
}

// bandeau noir "Mode Édition"
function bandeauEdition() {
    const header = document.querySelector("header");
    header.classList.add("header-plus");
    const bandeauDiv = document.createElement("div");
    bandeauDiv.classList.add("bandeau-edition");
    const bandeauIcon = document.createElement("i");
    bandeauIcon.classList.add("fa-solid", "fa-pen-to-square");
    const bandeauPar = document.createElement("p");
    bandeauPar.textContent = "Mode Édition";
    
    bandeauDiv.appendChild(bandeauIcon);
    bandeauDiv.appendChild(bandeauPar);
    document.body.prepend(bandeauDiv);
}

// lien "modifier" : ouvrir boite modale
function lienModifier() {
    const titreMesProjets = document.querySelector("#portfolio h2");
    titreMesProjets.classList.add("h2-plus");
    const lienModale = document.createElement("a");
    lienModale.classList.add("lien-modale");
    lienModale.href = "#boitemodale";
    lienModale.textContent = "modifier";
    const lienModaleIcon = document.createElement("i");
    lienModaleIcon.classList.add("fa-solid", "fa-pen-to-square");
    
    titreMesProjets.appendChild(lienModale);
    lienModale.prepend(lienModaleIcon);
}

// masquer filtres
function filtresOff() {
    const divFiltres = document.querySelector(".filtres");
    divFiltres.classList.add("filtres-off");
}

// bouton "logout"
function logout() {
    const boutonlogin = document.getElementById("loginout");
    boutonlogin.href = "#"; // change href pour éviter redirection vers login.html quand on est déjà connecté
    boutonlogin.textContent = "logout";
    
    boutonlogin.addEventListener("click", function () { // clic sur "logout" = supprime token et recharge la page
        sessionStorage.removeItem("token"); 
        window.location.reload();
    });
}

function modaleHtml() {

    // boite modale wrapper1 = suppression de travaux
    const wrapper1Div = document.createElement("div");
    wrapper1Div.classList.add("modal-wrapper1", "js-modal-stop");
    const wrappper1Icons = document.createElement("div");
    wrappper1Icons.classList.add("wrappper1Icons");
    const wrapper1Close = document.createElement("button");
    wrapper1Close.classList.add("js-modal-close");
    const wrapper1Span = document.createElement("span");
    wrapper1Span.textContent = "Fermeture Modale";
    const wrapper1Icon = document.createElement("i");
    wrapper1Icon.classList.add("fa-solid", "fa-xmark", "fa-lg");
    const wrapper1Title = document.createElement("h3");
    wrapper1Title.classList.add("titlemodal");
    wrapper1Title.textContent = "Galerie photo";
    const wrapper1GalleryDiv = document.createElement("div");
    wrapper1GalleryDiv.classList.add("modal-gallery");
    const wrapper1HR = document.createElement("hr");
    const wrapper1Button = document.createElement("input");
    wrapper1Button.classList.add("goto-wrapper2");
    wrapper1Button.type = "button";
    wrapper1Button.value = "Ajouter une photo";
    
    const aside = document.querySelector("#boitemodale");
    aside.appendChild(wrapper1Div);
    wrapper1Div.appendChild(wrappper1Icons);
    wrapper1Div.appendChild(wrapper1Title);
    wrapper1Div.appendChild(wrapper1GalleryDiv);
    wrapper1Div.appendChild(wrapper1HR);
    wrapper1Div.appendChild(wrapper1Button);
    wrappper1Icons.appendChild(wrapper1Close);
    wrapper1Close.appendChild(wrapper1Span);
    wrapper1Close.appendChild(wrapper1Icon);

// boite modale wrapper2 = form pour ajout de travaux
    const wrapper2Retour = document.createElement("button");
    wrapper2Retour.classList.add("goto-wrapper1");
    const wrapper2Span = document.createElement("span");
    wrapper2Span.textContent = "retour Galerie Photo";
    const wrapper2Arrow = document.createElement("i");
    wrapper2Arrow.classList.add("fa-solid", "fa-arrow-left", "fa-lg");
    const wrapper2Form = document.createElement("form");
    wrapper2Form.action = "#url.fr";
    wrapper2Form.method = "post";
    wrapper2Form.id = "formAjout";
    const wrapper2DivPhoto = document.createElement("div");
    wrapper2DivPhoto.classList.add("ajout-photo");
    const wrapper2Icon = document.createElement("i");
    wrapper2Icon.classList.add("fa-regular", "fa-image");
    const wrapper2Img = document.createElement("img");
    wrapper2Img.id = "previewImg";
    wrapper2Img.src = "";
    wrapper2Img.alt = "aperçu de l'image";
    wrapper2Img.style.display = "none";
    const uploadPhoto = document.createElement("button");
    uploadPhoto.id = "btn-upload";
    uploadPhoto.textContent = "+ Ajouter photo";
    const inputPhoto = document.createElement("input");
    inputPhoto.type = "file";
    inputPhoto.name = "photo";
    inputPhoto.id = "ajoutPhoto";
    inputPhoto.accept = "image/jpeg, image/png";
    const descPhoto = document.createElement("p");
    descPhoto.textContent = "jpg, png : 4mo max";
    const labelTitre = document.createElement("label");
    labelTitre.for = "titreImg";
    labelTitre.textContent = "Titre";
    const inputTitre = document.createElement("input");
    inputTitre.type = "text";
    inputTitre.name = "titre";
    inputTitre.id = "titreImg";
    const labelCategorie = document.createElement("label");
    labelCategorie.for = "choixCategorie";
    labelCategorie.textContent = "Catégorie";
    const selectCategorie = document.createElement("select");
    selectCategorie.name = "categorie";
    selectCategorie.id = "choixCategorie";
    const wrapper2HR = document.createElement("hr");
    const inputValider = document.createElement("input");
    inputValider.type = "submit";
    inputValider.value = "Valider";
    inputValider.id = "inputValider";

    wrapper1Div.prepend(wrapper2Retour);
    wrapper1Div.appendChild(wrapper2Form);
    wrappper1Icons.appendChild(wrapper2Retour);
    wrapper2Retour.appendChild(wrapper2Span);
    wrapper2Retour.appendChild(wrapper2Arrow);
    wrapper2Form.appendChild(wrapper2DivPhoto);
    wrapper2Form.appendChild(labelTitre);
    wrapper2Form.appendChild(inputTitre);
    wrapper2Form.appendChild(labelCategorie);
    wrapper2Form.appendChild(selectCategorie);
    wrapper2Form.appendChild(wrapper2HR);
    wrapper2Form.appendChild(inputValider);
    wrapper2DivPhoto.appendChild(wrapper2Icon);
    wrapper2DivPhoto.appendChild(wrapper2Img);
    wrapper2DivPhoto.appendChild(uploadPhoto);
    wrapper2DivPhoto.appendChild(inputPhoto);
    wrapper2DivPhoto.appendChild(descPhoto);
    wrapper2Retour.style.display = "none";
    wrapper2Form.style.display = "none";
    inputPhoto.style.display = "none";

    // switch modal-wrapper1 à modal-wrapper2
    const gotowrapper2 = document.querySelector(".goto-wrapper2");
    gotowrapper2.addEventListener("click", function () {
           wrapper1GalleryDiv.style.display = "none";
           wrapper1HR.style.display = "none";
           wrapper1Button.style.display = "none";
           wrapper1Title.textContent = "Ajout photo";
           wrapper2Form.style.display = null;
           wrapper2Retour.style.display = null;
           });

    // switch modal-wrapper2 à modal-wrapper1
    const gotowrapper1 = document.querySelector(".goto-wrapper1");
    gotowrapper1.addEventListener("click", function () {
           wrapper1GalleryDiv.style.display = null;
           wrapper1HR.style.display = null;
           wrapper1Button.style.display = null;
           wrapper1Title.textContent = "Galerie Photo";
           wrapper2Form.style.display = "none";
           wrapper2Retour.style.display = "none";
           });

    // événement bouton upload = ouverture du input type="file"
    document.getElementById("btn-upload").addEventListener("click", function() {
    document.getElementById("ajoutPhoto").click();
    });

    //preview image uploadée
    const ajoutPhotoInput = document.getElementById("ajoutPhoto");
    const previewImg = document.getElementById("previewImg");

    ajoutPhotoInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
            previewImg.src = URL.createObjectURL(file);
            previewImg.style.display = "block";
            wrapper2Icon.style.display = "none";
            uploadPhoto.style.display = "none";
            descPhoto.style.display = "none";
        } else {
            previewImg.style.display = "none";
        }
    });

}

// initialiser fonction principale
modeEdition();
    