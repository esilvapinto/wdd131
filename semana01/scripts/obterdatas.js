const anoAtual = document.querySelector("#anoatual");
const ultimaModificacao = document.querySelector("#ultimaModificacao");

anoAtual.textContent = new Date().getFullYear();
ultimaModificacao.textContent = `Última modificação: ${document.lastModified}`;
