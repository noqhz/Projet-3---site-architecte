/////// boite modale : ajout et suppression de travaux ///////


// panneau admin : bandeau édition, bouton logout, lien modifier + boite modale

async function modeEdition() {

    const token = sessionStorage.getItem("token");
    const response = await fetch('http://localhost:5678/api/works');
    const getworks = await response.json();

    if (token) { // mode édition seulement si le token existe

        const { afficherImages } = await import('./works.js');
        
        const header = document.querySelector("header");
        header.classList.add("header-plus");

        const bandeau = `
            <div class="bandeau-edition">
            <i class="fa-solid fa-pen-to-square"></i>
            <p>Mode Édition</p>
            </div>
        `;

        document.body.insertAdjacentHTML("afterbegin", bandeau);
        // insertAdjacentHTML pour ajouter HTML sans remplacer le contenu existant
        // afterbegin place le contenu juste après l'ouverture de la balise <body>

        ///

        // Transformer le bouton "login" en "logout"
        const boutonlogin = document.getElementById("loginout");

        boutonlogin.textContent = "logout";
        boutonlogin.href = "#"; // change le href pour éviter la redirection vers login.html lorsqu'on est déjà connecté
        boutonlogin.addEventListener("click", function () {
        sessionStorage.removeItem("token"); // au clic sur "logout", supprime le token et recharge la page
        window.location.reload();
        });

        // lien "modifier" pour accéder à la boite modale

        const boutonModale = `
            <a href="#modal1" class="lien-modale">
            <i class="fa-solid fa-pen-to-square"></i>
            modifier
            </a>
        `;

        const mesProjets = document.querySelector("#portfolio h2");
        mesProjets.insertAdjacentHTML("beforeend", boutonModale);
        mesProjets.classList.add("h2-plus");

        // ajout d'une classe à la div filtres pour la masquer via le css
        const divFiltres = document.querySelector(".filtres");
        divFiltres.classList.add("filtres-off");

        ///// boite modale /////

        // création de la boite modale dans le DOM
        // style="display:none;"
        const modal1 = `
            <aside id="modal1" class="modal modal-hidden" aria-hidden="true" role="dialog" aria-labelledby="titlemodal"> 
            <div class="modal-wrapper1 js-modal-stop">
                <button class="js-modal-close"><span>fermeture modale</span><i class="fa-solid fa-xmark fa-lg"></i></button>
                <h3 id="titlemodal">Galerie photo</h3>
                <div class="modal-gallery">

                </div>
                <input type="button" value="Ajouter une photo">
            </div>
            </aside>
        `;
        const aside = document.querySelector("#portfolio");
        aside.insertAdjacentHTML('beforeend', modal1);
        // beforeend insère contenu à la fin de #portfolio, avant sa fermeture, sans écraser son contenu actuel
        
       
        const modalGalleryContainer = ".modal-gallery"; // Sélecteur du conteneur dans la modale
        afficherImages(getworks, modalGalleryContainer); // Affiche les images dans la modale

        /// ouverture boite modale au clic

        let modal = null;
        const focusableSelector= "button, a, input";
        let focusables = [];
        let previouslyFocusedElement = null;

        const openModal = function (e) { // ouverture modale
            e.preventDefault();
            modal = document.querySelector(e.target.getAttribute("href"));
            focusables = Array.from(modal.querySelectorAll(focusableSelector));
            previouslyFocusedElement = document.querySelector(":focus");
            modal.classList.remove("modal-hidden"); // modal.style.display = null;
            focusables[0].focus();
            modal.removeAttribute("aria-hidden");
            modal.setAttribute("aria-modal", "true");
            modal.addEventListener("click", closeModal);
            modal.querySelector(".js-modal-close").addEventListener("click", closeModal);
            modal.querySelector(".js-modal-stop").addEventListener("click", stopPropagation);
            console.log(getworks);
        }

        const closeModal = function (e) { //fermeture modale
            if (modal === null) return;
            if (previouslyFocusedElement !== null) previouslyFocusedElement.focus();
            e.preventDefault();
            window.setTimeout(function () {
                modal.classList.add("modal-hidden"); // modal.style.display = "none";
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
            // console.log(focusables); // press Tab = affiche les éléments focusables dans la modale
            let index = focusables.findIndex(f => f === modal.querySelector(":focus"));
            // console.log(index); // indique l'ordre des éléements focus dans la modale
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
            // sélectionne éléments avec la classe lien-modale
            a.addEventListener("click", openModal) // au clic sur un élément avec classe lien-modale, fonction openModal appelée
        })

        window.addEventListener("keydown", function (e) { // fermeture boite modale avec tocuhe échap
            // console.log(e.key);
            if (e.key === "Escape" || e.key === "Esc") {
                closeModal(e);
            }
            if (e.key === "Tab" && modal !== null) {
                focusInModal(e);
            }
        })

        // événement de suppression sur chaque bouton

            const boutonDelete = document.querySelectorAll(".delete-button");
            boutonDelete.forEach((button) => {
            button.addEventListener("click", (event) => {
            event.preventDefault();
            const figureDeleteId = button.getAttribute("id"); // id de get/works lié au bouton
            // if (confirm("Confirmer la suppression")) {
            // supprimerTravaux(figureDeleteId);
            // }
            supprimerTravaux(figureDeleteId);
            });
            });


        /// fonction supression images dans modale avec gestion des erreurs

            async function supprimerTravaux(figureDeleteId) {
                try {
                    const response = await fetch(`http://localhost:5678/api/works/${figureDeleteId}`, {
                        method: "DELETE",
                        headers: {
                            accept: "*/*",
                            Authorization: `Bearer ${token}`,
                        },
                    });
            
                    if (response.ok) {
                        work = getworks.filter ((work) => work.id != figureDeleteId );
                        afficherImages(work);
                        // const figureDeleteModal = document.querySelector(`#work-${figureDeleteId}`); // sélectionne de l'élément à supprimer
                        // if (figureDeleteModal) {
                        //     figureDeleteModal.remove(); // suppression de l'élément
                        // } else {
                        //     console.error("Élément introuvable dans le DOM.");
                        // }
                    } else {
                        console.error("Erreur lors de la suppression :", response.statusText);
                    }
                } catch (error) {
                    console.error("Une erreur est survenue :", error);
                }
            }

            ///
       
            ///////
    }

}


// appel de la fonction sur login.html (fonctions admin sur cette page)
modeEdition();
