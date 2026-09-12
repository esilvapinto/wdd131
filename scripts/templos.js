const menuButton = document.querySelector("#menu");
const navigation = document.querySelector("nav");
const currentYear = document.querySelector("#currentyear");
const lastModified = document.querySelector("#lastModified");

menuButton.addEventListener("click", () => {
  menuButton.classList.toggle("open");
  navigation.classList.toggle("open");

  const menuIsOpen = navigation.classList.contains("open");

  menuButton.setAttribute("aria-expanded", menuIsOpen);

  if (menuIsOpen) {
    menuButton.setAttribute("aria-label", "Fechar menu de navegação");
  } else {
    menuButton.setAttribute("aria-label", "Abrir menu de navegação");
  }
});

currentYear.textContent = new Date().getFullYear();

lastModified.textContent = `Última modificação: ${document.lastModified}`;
