// works.js - récupération travaux depuis le back-end + boutons filtres //


// récupération de get/works (travaux) depuis l'API
const response = await fetch('http://localhost:5678/api/works');
const getworks = await response.json();

// liste des catégories sans doublons
function tableauCategories(works) {
    const categoriesUniques = new Set();
    works.forEach(element => { // vérifie chaque élément de works
        categoriesUniques.add(element.category.name); // ajout de chaque catégorie au Set
    });
    return Array.from(categoriesUniques); // convertit le Set en tableau et le retourne + élimine les doublons
}

// filtrer les travaux selon la catégorie
function filtreCategorie(categorie) {
    const recherche = getworks.filter(element => element.category.name === categorie);
    afficherImages(recherche, ".gallery");
}

// définir un bouton comme actif
function boutonActif(activeButton) {
    const buttons = document.querySelectorAll(".filtres button"); // sélection de tous les boutons
    buttons.forEach(button => button.classList.remove("active")); // retirer la classe "active" de tous les boutons
    activeButton.classList.add("active"); // ajoute la classe "active" au clic
}

// boutons de filtres
function ajoutBoutonFiltre(btnFiltre) {
    const divFiltres = document.querySelector(".filtres");
    divFiltres.innerHTML = ""; // vide le contenu en cas d'ajout ou de suppression de filtres (évite multiplication des boutons)

    const btnTous = document.createElement("button");
    btnTous.classList.add("btn-tous", "active");
    btnTous.textContent = "Tous";
    divFiltres.appendChild(btnTous);

    btnTous.addEventListener("click", function () { // au clic, bouton "Tous" = bouton actif et affiche tous les travaux
        boutonActif(btnTous);
        afficherImages(getworks, ".gallery");
    });

    // création de bouton pour chaque catégorie unique
    btnFiltre.forEach(categorie => {
        const bouton = document.createElement("button");
        bouton.className = `btn-${categorie.toLowerCase().replace(/\s+/g, '-')}`; // nom de classe pour le css via regex
        bouton.textContent = categorie; // le nom du bouton vient de get/works category.name

        bouton.addEventListener("click", function () { // au clic, bouton de categorie = actif et affiche les travaux selon la categorie
            boutonActif(bouton);
            filtreCategorie(categorie);
        });

        divFiltres.appendChild(bouton);
    });
}

// affichage dynamique des images depuis le backend
export function afficherImages(getworks, containerSelector) { // export pour utiliser "afficherImages" dans modale.js

    const contenuTravaux = document.querySelector(containerSelector); // container html pour afficher les travaux
    contenuTravaux.innerHTML = ""; // vide le contenu (ici la gallerie d'images) pour éviter d'afficher les images plusieurs fois

    getworks.forEach(figure => {
        
        const travauxElement = document.createElement("figure");
        travauxElement.id = `work-${figure.id}`; // ex: "work-4"
        const imgElement = document.createElement("img");
        imgElement.src = figure.imageUrl;
        imgElement.alt = figure.title;

        contenuTravaux.appendChild(travauxElement);
        travauxElement.appendChild(imgElement);

        if (containerSelector === ".gallery") {
            const captionElement = document.createElement("figcaption");
            captionElement.textContent = figure.title;

            travauxElement.appendChild(captionElement);
        }
        if (containerSelector === ".modal-gallery") {
            const deleteDiv = document.createElement("div");
            deleteDiv.classList.add("delete-div");
            const deleteButton = document.createElement("button");
            deleteButton.classList.add("delete-button");
            deleteButton.id = figure.id; // id de get/works lié à chaque bouton delete
            const deleteIcon = document.createElement("i");
            deleteIcon.classList.add("fa-solid", "fa-trash-can");
            
            travauxElement.appendChild(deleteDiv);
            deleteDiv.appendChild(deleteButton);
            deleteButton.appendChild(deleteIcon);
        } 
    });
}

// affichage filtres + travaux
const categories = tableauCategories(getworks); // liste des catégories uniques
ajoutBoutonFiltre(categories); // crée les boutons de filtres
afficherImages(getworks, ".gallery"); // affiche les travaux dans div gallery
