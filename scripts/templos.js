const menuButton = document.querySelector("#menu");
const navigation = document.querySelector(".navigation");
const currentYear = document.querySelector("#currentyear");
const lastModified = document.querySelector("#lastModified");

menuButton.addEventListener("click", () => {
  menuButton.classList.toggle("open");
  navigation.classList.toggle("open");

  const menuIsOpen = navigation.classList.contains("open");

  menuButton.setAttribute("aria-expanded", menuIsOpen);
  menuButton.setAttribute(
    "aria-label",
    menuIsOpen ? "Fechar menu de navegação" : "Abrir menu de navegação",
  );
});

currentYear.textContent = new Date().getFullYear();
lastModified.textContent = `Última modificação: ${document.lastModified}`;
