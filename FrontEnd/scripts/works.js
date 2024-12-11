/////// récupération travaux depuis le back-end + boutons filtres ///////


// récupération de get/works (images) depuis l'API

const response = await fetch('http://localhost:5678/api/works');
const getworks = await response.json();
console.log("contenu de get/works :", getworks);


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
    afficherImages(recherche);
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
    divFiltres.innerHTML = ''; // vide le contenu en cas d'ajout ou de suppression de filtres (évite la multiplication de boutons)

    const btnTous = document.createElement("button"); // crée un bouton "Tous" permanent
    btnTous.className = "btn-tous active";
    btnTous.textContent = "Tous";
    divFiltres.appendChild(btnTous); // localise le bouton créé dans le DOM, ici dans le div .filtres

    btnTous.addEventListener("click", function () { // au clic, le bouton "Tous" devient bouton actif et affiche l'ensemble des travaux depuis get/works
        boutonActif(btnTous);
        afficherImages(getworks);
    });

    // création de bouton pour chaque catégorie unique

    btnFiltre.forEach(categorie => {
        const bouton = document.createElement("button");
        bouton.className = `btn-${categorie.toLowerCase().replace(/\s+/g, '-')}`;
        // nom de classe unique pour le css
        // (texte en minuscules, espace devient tiret, l'ensemble est placé dans une chaîne de caractères)
        bouton.textContent = categorie; // le nom du bouton vient de get/works category.name

        bouton.addEventListener("click", function () { // idem que pour btnTous mais selon la categorie
            boutonActif(bouton);
            filtreCategorie(categorie);
        });

        divFiltres.appendChild(bouton);
    });
}


// affichage dynamique des images depuis le backend

export function afficherImages(getworks, containerSelector) {

    const contenuTravaux = document.querySelector(containerSelector); // container html pour afficher les travaux
    contenuTravaux.innerHTML = ''; // vide le contenu (ici la gallerie d'images) pour éviter d'afficher les images plusieurs fois

    getworks.forEach(figure => {
        // créer les éléments HTML
        const travauxElement = document.createElement("figure"); // balise figure pour l'image et sa description
        travauxElement.id = `work-${figure.id}`; // ex: "work-1"
        const imgElement = document.createElement("img"); // balise img = contenu img de figure
        imgElement.src = figure.imageUrl;
        imgElement.alt = figure.title;

        // déclaration élément parent dans DOM (div gallery > figure)
        contenuTravaux.appendChild(travauxElement);
        // déclaration élément parent dans DOM (figure > img)
        travauxElement.appendChild(imgElement);

        if (containerSelector === ".gallery") {
            const captionElement = document.createElement("figcaption"); // balise figcaption = contenu texte de figure
            captionElement.innerText = figure.title;
            travauxElement.appendChild(captionElement); // déclaration élément parent dans DOM (figure > caption)
        }
        if (containerSelector === ".modal-gallery") {
            const deleteDiv = document.createElement("div");
            deleteDiv.classList.add("delete-div");
            travauxElement.appendChild(deleteDiv);
            const deleteButton = document.createElement("button");
            deleteButton.classList.add("delete-button");
            deleteButton.setAttribute("id", figure.id); // id de get/works lié à chaque bouton delete
            deleteDiv.appendChild(deleteButton);
            const deleteIcon = document.createElement("i");
            deleteIcon.classList.add("fa-solid", "fa-trash-can");
            deleteButton.appendChild(deleteIcon);
        } 
    });
}


// initialisation de l'affichage des filtres + images 

const categories = tableauCategories(getworks); // liste des catégories uniques
ajoutBoutonFiltre(categories); // crée les boutons de filtres
const galleryContainer = ".gallery";
afficherImages(getworks, galleryContainer); // affiche toutes les images par défaut
console.log("catégories uniques :", categories); // tableau Set avec catégories uniques
