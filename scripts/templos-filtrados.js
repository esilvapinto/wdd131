const templos = [
  {
    nomeDoTemplo: "Aba Nigeria",
    localizacao: "Aba, Nigéria",
    consagracao: "2005, 7 de agosto",
    area: 11500,
    urlDaImagem: "https://content.churchofjesuschrist.org/templesldsorg/bc/Temples/photo-galleries/aba-nigeria/400x250/aba-nigeria-temple-lds-273999-wallpaper.jpg"
  },
  {
    nomeDoTemplo: "Manti Utah",
    localizacao: "Manti, Utah, Estados Unidos",
    consagracao: "1888, 21 de maio",
    area: 74792,
    urlDaImagem: "https://content.churchofjesuschrist.org/templesldsorg/bc/Temples/photo-galleries/manti-utah/400x250/manti-temple-768192-wallpaper.jpg"
  },
  {
    nomeDoTemplo: "Payson Utah",
    localizacao: "Payson, Utah, Estados Unidos",
    consagracao: "2015, 7 de junho",
    area: 96630,
    urlDaImagem: "https://content.churchofjesuschrist.org/templesldsorg/bc/Temples/photo-galleries/payson-utah/400x225/payson-utah-temple-exterior-1416671-wallpaper.jpg"
  },
  {
    nomeDoTemplo: "Yigo Guam",
    localizacao: "Yigo, Guam",
    consagracao: "2020, 2 de maio",
    area: 6861,
    urlDaImagem: "https://content.churchofjesuschrist.org/templesldsorg/bc/Temples/photo-galleries/yigo-guam/400x250/yigo_guam_temple_2.jpg"
  },
  {
    nomeDoTemplo: "Washington D.C.",
    localizacao: "Kensington, Maryland, Estados Unidos",
    consagracao: "1974, 19 de novembro",
    area: 156558,
    urlDaImagem: "https://content.churchofjesuschrist.org/templesldsorg/bc/Temples/photo-galleries/washington-dc/400x250/washington_dc_temple-exterior-2.jpeg"
  },
  {
    nomeDoTemplo: "Lima Peru",
    localizacao: "Lima, Peru",
    consagracao: "1986, 10 de janeiro",
    area: 9600,
    urlDaImagem: "https://content.churchofjesuschrist.org/templesldsorg/bc/Temples/photo-galleries/lima-peru/400x250/lima-peru-temple-evening-1075606-wallpaper.jpg"
  },
  {
    nomeDoTemplo: "Cidade do México, México",
    localizacao: "Cidade do México, México",
    consagracao: "1983, 2 de dezembro",
    area: 116642,
    urlDaImagem: "https://content.churchofjesuschrist.org/templesldsorg/bc/Temples/photo-galleries/mexico-city-mexico/400x250/mexico-city-temple-exterior-1518361-wallpaper.jpg"
  },
  {
    nomeDoTemplo: "São Paulo Brasil",
    localizacao: "São Paulo, Brasil",
    consagracao: "1978, 30 de outubro",
    area: 59246,
    urlDaImagem: "https://esilvapinto.github.io/wdd131/imagens/templo-sao-paulo.jpeg"
  },
  {
    nomeDoTemplo: "Recife Brasil",
    localizacao: "Recife, Brasil",
    consagracao: "2000, 15 de dezembro",
    area: 37200,
    urlDaImagem: "https://esilvapinto.github.io/wdd131/imagens/recife_brazil_temple_lds.jpeg"
  },
  {
    nomeDoTemplo: "Curitiba Brasil",
    localizacao: "Curitiba, Brasil",
    consagracao: "2008, 1 de junho",
    area: 27850,
    urlDaImagem: "https://esilvapinto.github.io/wdd131/imagens/curitiba_brazil_temple.jpeg"
  }
];

const menuButton = document.querySelector("#menu");
const navigation = document.querySelector("#navegacao");
const gallery = document.querySelector("#galeria");
const heading = document.querySelector("#titulo-galeria");
const areaFormat = new Intl.NumberFormat("pt-BR");

function criarCartao(templo) {
  const card = document.createElement("figure");
  const title = document.createElement("h2");
  title.textContent = templo.nomeDoTemplo;

  const details = document.createElement("div");
  details.className = "detalhes";
  for (const [label, value] of [
    ["Localização", templo.localizacao],
    ["Consagração", templo.consagracao],
    ["Área", `${areaFormat.format(templo.area)} pés quadrados`]
  ]) {
    const row = document.createElement("p");
    const strong = document.createElement("strong");
    strong.textContent = `${label}: `;
    row.append(strong, document.createTextNode(value));
    details.append(row);
  }

  const image = document.createElement("img");
  image.src = templo.urlDaImagem;
  image.alt = `Templo de ${templo.nomeDoTemplo}`;
  image.width = 400;
  image.height = 250;
  image.loading = "lazy";
  image.decoding = "async";
  card.append(title, details, image);
  return card;
}

const filtros = {
  inicio: () => templos,
  antigos: () => templos.filter((templo) => Number.parseInt(templo.consagracao, 10) < 1900),
  novos: () => templos.filter((templo) => Number.parseInt(templo.consagracao, 10) > 2000),
  grandes: () => templos.filter((templo) => templo.area > 90000),
  pequenos: () => templos.filter((templo) => templo.area < 10000)
};

function mostrarTemplos(filtro, label) {
  heading.textContent = label;
  gallery.replaceChildren(...filtros[filtro]().map(criarCartao));
  navigation.querySelectorAll("a").forEach((link) => {
    if (link.dataset.filtro === filtro) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function fecharMenu() {
  menuButton.classList.remove("open");
  navigation.classList.remove("open");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Abrir menu de navegação");
}

menuButton.addEventListener("click", () => {
  const aberto = navigation.classList.toggle("open");
  menuButton.classList.toggle("open", aberto);
  menuButton.setAttribute("aria-expanded", String(aberto));
  menuButton.setAttribute("aria-label", aberto ? "Fechar menu de navegação" : "Abrir menu de navegação");
});

navigation.addEventListener("click", (event) => {
  const link = event.target.closest("a[data-filtro]");
  if (!link) return;
  event.preventDefault();
  mostrarTemplos(link.dataset.filtro, link.textContent);
  fecharMenu();
});

document.querySelector("#currentyear").textContent = new Date().getFullYear();
document.querySelector("#lastModified").textContent = `Última modificação: ${document.lastModified}`;
mostrarTemplos("inicio", "Todos os templos");
