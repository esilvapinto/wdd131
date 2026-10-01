"use strict";
const produtos = [
  { id: "fc-1888", nome: "capacitor de fluxo", classificacaomedia: 4.5 },
  { id: "fc-2050", nome: "fios elétricos", classificacaomedia: 4.7 },
  { id: "fs-1987", nome: "circuitos de tempo", classificacaomedia: 3.5 },
  { id: "ac-2000", nome: "reator de baixa tensão", classificacaomedia: 3.9 },
  { id: "jj-1969", nome: "equalizador de distorção", classificacaomedia: 5.0 }
];
document.querySelector("#currentyear").textContent = new Date().getFullYear();
document.querySelector("#lastModified").textContent = `Última atualização: ${document.lastModified}`;
const select = document.querySelector("#produto");
if (select) {
  produtos.forEach((produto) => {
    const option = document.createElement("option");
    option.value = produto.id;
    option.textContent = produto.nome;
    select.append(option);
  });
}
const countElement = document.querySelector("#review-count");
if (countElement) {
  const params = new URLSearchParams(window.location.search);
  const produto = produtos.find((item) => item.id === params.get("produto"));
  const nota = params.get("classificacao");
  const data = params.get("data-instalacao") || "";
  // Check the required fields before counting a confirmation-page load.
  const dateTest = document.createElement("input");
  dateTest.type = "date";
  dateTest.value = data;
  const valid = Boolean(produto && /^[1-5]$/.test(nota || "") && data && dateTest.value === data);
  let count = 0;
  try {
    const saved = Number(localStorage.getItem("avaliacoesConcluidas"));
    count = Number.isSafeInteger(saved) && saved >= 0 ? saved : 0;
    if (valid) {
      count += 1;
      localStorage.setItem("avaliacoesConcluidas", String(count));
    }
  } catch {
    document.querySelector("#storage-message").textContent = "O armazenamento está indisponível. O total não poderá ser mantido entre visitas.";
  }
  countElement.textContent = String(count);
  document.querySelector("#confirmation-title").textContent = valid ? "Obrigado por avaliar!" : "Nenhuma avaliação recebida";
  document.querySelector("#confirmation-message").textContent = valid ? "Seu formulário foi concluído com sucesso." : "Preencha e envie o formulário para registrar uma avaliação.";
  if (valid) {
    document.querySelector("#review-summary").textContent = `Produto: ${produto.nome}. Classificação: ${nota} de 5.`;
  }
}
