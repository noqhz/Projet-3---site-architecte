// récupération des images & infos dans GET/works

const works = await fetch('http://localhost:5678/api/works');
const gallerieImg = await works.json();
console.log(gallerieImg);

// affichage dynamique des images depuis le backend

function afficherImages(gallerieImg) {

    // container html pour afficher les travaux
    const divGallery = document.querySelector(".gallery");
    divGallery.innerHTML = '';

    for (let i = 0; i < gallerieImg.length; i++) {

        const figure = gallerieImg[i];
        // balise figure pour l'image et sa description
        const travauxElement = document.createElement("figure");
        // balises img et figcaption pour contenu de figure
        const imgElement = document.createElement("img");
        imgElement.src = figure.imageUrl;
        imgElement.alt = figure.title;
        const captionElement = document.createElement("figcaption");
        captionElement.innerText = figure.title;

        // déclaration élément parent dans DOM (div gallery > figure)
        divGallery.appendChild(travauxElement);
        // déclaration élément parent dans DOM (figure > img + caption)
        travauxElement.appendChild(imgElement);
        travauxElement.appendChild(captionElement);

    }

}

afficherImages(gallerieImg);

// filtrer travaux par catégories

function filtreCategorie(categorie) {
    const recherche = gallerieImg.filter(function (filtre) {
        return filtre.category.name === categorie;
    });
    console.log(recherche);
    afficherImages(recherche);
}

const filtreTous = document.querySelector(".btn-tous");
const filtreObjets = document.querySelector(".btn-objets");
const filtreApparts = document.querySelector(".btn-apparts");
const filtreHotels = document.querySelector(".btn-hotels");

filtreTous.addEventListener("click", function () {
    afficherImages(gallerieImg);
    console.log(gallerieImg);
});

filtreObjets.addEventListener("click", function () {
    filtreCategorie("Objets");
});

filtreApparts.addEventListener("click", function () {
    filtreCategorie("Appartements");
});

filtreHotels.addEventListener("click", function () {
    filtreCategorie("Hotels & restaurants");
});

// catégories uniques

const categoriesUniques2 = new Set();

for (let i = 0; i < gallerieImg.length; i++) {
    categoriesUniques2.add(gallerieImg[i].category.name);
}
console.log(categoriesUniques2);
