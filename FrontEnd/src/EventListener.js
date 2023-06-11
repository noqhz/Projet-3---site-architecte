import ApiDataProvider from "./ApiDataProvider.js";
import CardBuilder from "./CardBuilder.js";
import ModalBuilder from "./ModalBuilder.js";
import UserLogin from "./UserLogin.js";

export default class EvenListener {
  static listen() {
    this.listenClickOnButtonFilter();
    this.openModal();
    this.closeModal();
    this.removeProject();
    this.previewProject();
    this.saveProject();
    // addProject, saveProject
  }

  // Fonction pour faire jouer le filtre
  static listenClickOnButtonFilter() {
    // si je click sur la div contenant les filtres
    document
      .querySelector(".button-filter")
      .addEventListener("click", (event) => {
        const isButtonFilter =
          event.target.classList.contains("categorie-button");

        // si je click ailleurs qu'un bouton du filtre, je stop
        if (false === isButtonFilter) {
          return false;
        }

        //récupérer le dataset type
        const categoryId = event.target.dataset["type"];

        const promise =
          categoryId == "Tous"
            ? ApiDataProvider.getProjects()
            : ApiDataProvider.getProjectsByCategoryId(categoryId);

        promise.then((projects) => {
          CardBuilder.displayProjects(projects);
        });
      });
  }

  // évenement au click pour ouvrir la modale
  static openModal() {
    // ouvrir la modale gallery avec click sur bouton "modifier"
    document.getElementById("editBtn").addEventListener("click", () => {
      modalContainer.classList.remove("modal-container");
      modalContainer.classList.add("modal-containter-active");
      document.querySelector(".modalGallery").classList.remove("modal-hidden");
      document.getElementById("modalPicture").classList.add("modal-hidden");
    });

    // ouvrir la modale picture au click sur bouton "ajouter photo"
    document.getElementById("addPicture").addEventListener("click", () => {
      document.querySelector(".modalGallery").classList.add("modal-hidden");
      document.getElementById("modalPicture").classList.remove("modal-hidden");
    });

    // ouvrir la modal gallery au click sur la flèche retour
    document
      .querySelector(".return-modal-gallery")
      .addEventListener("click", () => {
        document
          .querySelector(".modalGallery")
          .classList.remove("modal-hidden");
        document.getElementById("modalPicture").classList.add("modal-hidden");
      });
  }

  // évènement au click pour fermer la modale
  static closeModal() {
    //cibler les éléments qui doivent fermer la modale
    const closeModales = document.querySelectorAll(".closeModal");

    closeModales.forEach((closure) => {
      closure.addEventListener("click", () => {
        modalContainer.classList.remove("modal-containter-active");
        modalContainer.classList.add("modal-container");
      });
    });
  }

  // // créer un évenement au "click" pour supprimer un projet
  static removeProject() {
    document
      .querySelector("#modalWrapper")
      .addEventListener("click", (event) => {
        const isDeleteButton = event.target.classList.contains(
          "modal-delete-project"
        );
        if (isDeleteButton) {
          const projectId = event.target.closest(".modal-figure-project")
            .dataset["id"];

          ApiDataProvider.deleteProjects(projectId);

          document.querySelector(".modal-contain-projects").innerHTML = "";

          ApiDataProvider.getProjects().then((projects) => {
            CardBuilder.displayProjects(projects);
            ModalBuilder.displayModalProjects(projects);
          });
        }
      });
    return false;
  }

  static previewProject() {
    // evenement pour prévisualiser et conserver la photo à ajouter
    const imageInput = document.getElementById("imageInput");
    const imagePreview = document.getElementById("imagePreview");
    const btnAddProject = document.getElementById("buttonAddProject");

    btnAddProject.addEventListener("click", (event) => {
      event.preventDefault();
      imageInput.click();
    });

    imageInput.addEventListener("change", () => {
      const [file] = imageInput.files;
      const reader = new FileReader();
      // console.log(file);
      if (file) {
        if (file.size > 4194304) {
          alert(
            "Votre photo dépasse les 4Mo autorisé, elle ne peut pas être ajouté à votre galerie"
          );
        }
        imagePreview.src = URL.createObjectURL(file);
        imagePreview.alt = file.name;
        // console.log(imagePreview); // src en blob
        // console.log(file);
        imagePreview.classList.remove("hidden");
        imageInput.classList.add("hidden");
        btnAddProject.classList.add("hidden");
        document.querySelector(".iconePreview").classList.add("hidden");
        document.querySelector(".textPreview").classList.add("hidden");

        reader.addEventListener(
          "load",
          () => {
            // On convertit l'image en chaine de caractère
            imagePreview.src = reader.result;
          },
          false
        );
        reader.readAsDataURL(file);
        console.log(imagePreview); // src est en database64
      }
    });
  }

  // evenement pour sauvegarder l'ajout du projet au submit
  static saveProject() {
    // s'assurer que tous les inputs sont renseignés et colorer le bouton submit
    const inputImage = document.getElementById("imageInput");
    const inputTitle = document.getElementById("title-picture");
    const inputCategory = document.getElementById("categorie-picture");
    const allInputs = [inputImage, inputTitle, inputCategory];

    allInputs.forEach((input) => {
      input.addEventListener("input", () => {
        const allInputsFlled = allInputs.every((input) => input.value !== "");
        if (allInputsFlled) {
          document.querySelector("#submitPicture").disabled = false;
          document.getElementById("submitPicture").style.cursor = "pointer";
        }
      });
    });

    // evenenement submit pour récupérer les données du formulaire et l'envoyer à l'api
    const pictureForm = document.querySelector(".formSubmit");
    pictureForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const formData = new FormData();
      formData.append("image", inputImage.files[0]);
      formData.append("title", inputTitle.value);
      formData.append("category", inputCategory.value);

      ApiDataProvider.addNewProjects(formData);

      // remettre à blanc la modale "ajout photo"
      pictureForm.reset();
      imagePreview.src = "#";
      imagePreview.alt = "";
      document.getElementById("buttonAddProject").classList.remove("hidden");
      document.querySelector(".iconePreview").classList.remove("hidden");
      document.querySelector(".textPreview").classList.remove("hidden");
      document.getElementById("imagePreview").classList.add("hidden");

      document.querySelector(".modal-contain-projects").innerHTML = "";

      ApiDataProvider.getProjects().then((projects) => {
        CardBuilder.displayProjects(projects);
        ModalBuilder.displayModalProjects(projects);
      });
    });
  }
}