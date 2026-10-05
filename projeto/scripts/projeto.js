"use strict";

// ESP Consulting — S06 V3. JavaScript puro, sem dependências externas.

const WHATSAPP_NUMERO = `5548991358422`;
const LIMITE_LINK_WHATSAPP = 3000; // caracteres da URL completa; acima disso o texto é resumido
const CHAVE_AREA = `esp-area`;
const CHAVE_CONTADOR = `esp-contador`;
const CHAVE_ULTIMO_TOKEN = `esp-ultimo-token`;
const CHAVE_SESSAO = `esp-confirmacao`;
const FORMATO_TOKEN = /^[a-z0-9-]{16,64}$/i;

const areas = { "supply-chain": `Supply Chain`, ia: `Inteligência Artificial`, gestao: `Gestão empresarial` };

const servicos = [
  { id: `diagnostico`, area: `supply-chain`, titulo: `Diagnóstico da cadeia de suprimentos`, descricao: `Uma visão integrada dos fluxos de compras, recebimento, estoque e distribuição para identificar os pontos que precisam de atenção.`, entregas: [`Mapa dos processos atuais`, `Identificação de gargalos`, `Prioridades de melhoria`] },
  { id: `estoques`, area: `supply-chain`, titulo: `Estoques e planejamento`, descricao: `Organização das informações e rotinas que apoiam o equilíbrio entre disponibilidade de produtos e recursos investidos em estoque.`, entregas: [`Análise de itens e movimentações`, `Indicadores de estoque e atendimento`, `Rotina de revisão da demanda`] },
  { id: `fornecedores`, area: `supply-chain`, titulo: `Compras e fornecedores`, descricao: `Estruturação de critérios e rotinas para acompanhar fornecedores, organizar compras e melhorar a previsibilidade do abastecimento.`, entregas: [`Critérios de avaliação`, `Fluxo de compras documentado`, `Acompanhamento de prazos e entregas`] },
  { id: `oportunidades-ia`, area: `ia`, titulo: `Mapeamento de oportunidades com IA`, descricao: `Identificação de atividades em que a inteligência artificial pode apoiar a equipe, considerando os dados disponíveis e a necessidade de revisão humana.`, entregas: [`Inventário de tarefas repetitivas`, `Priorização de casos de uso`, `Critérios para testar os resultados`] },
  { id: `piloto-ia`, area: `ia`, titulo: `Piloto de IA aplicada`, descricao: `Desenvolvimento de um experimento com escopo definido, como apoio à organização de informações, preparação de relatórios ou análise inicial de dados.`, entregas: [`Objetivo e limites do piloto`, `Fluxo de uso e revisão`, `Avaliação antes de ampliar o uso`] },
  { id: `gestao`, area: `gestao`, titulo: `Plano de ação e indicadores`, descricao: `Transformação do diagnóstico em ações organizadas, com responsáveis, prazos e uma rotina de acompanhamento compreensível para a equipe.`, entregas: [`Plano de ação por prioridade`, `Definição de indicadores`, `Reuniões de acompanhamento`] }
];

/* ---------- Utilitários ---------- */

function areaValida(valor) {
  return typeof valor === `string` && Object.hasOwn(areas, valor);
}

// localStorage: somente preferência de área, contador e o último token contado (sem dados pessoais).
function lerArmazenamento(chave) {
  try { return localStorage.getItem(chave); } catch { return null; }
}

function salvarArmazenamento(chave, valor) {
  try { localStorage.setItem(chave, valor); return true; } catch { return false; }
}

// sessionStorage: dados do formulário, restritos à aba atual.
function lerSessao() {
  try {
    const envio = JSON.parse(sessionStorage.getItem(CHAVE_SESSAO));
    return envioValido(envio) ? envio : null;
  } catch {
    return null;
  }
}

function salvarSessao(envio) {
  try { sessionStorage.setItem(CHAVE_SESSAO, JSON.stringify(envio)); return true; } catch { return false; }
}

function removerSessao() {
  try { sessionStorage.removeItem(CHAVE_SESSAO); return true; } catch { return false; }
}

function envioValido(envio) {
  if (!envio || typeof envio !== `object`) return false;
  const textos = [envio.token, envio.nome, envio.email, envio.empresa, envio.mensagem];
  if (!textos.every((texto) => typeof texto === `string`)) return false;
  return FORMATO_TOKEN.test(envio.token) && areaValida(envio.area) && envio.nome.length > 0
    && envio.mensagem.length >= 10 && envio.mensagem.length <= 2000;
}

function gerarToken() {
  const cripto = window.crypto;
  if (cripto && typeof cripto.randomUUID === `function`) return cripto.randomUUID();
  if (cripto && typeof cripto.getRandomValues === `function`) {
    const bytes = cripto.getRandomValues(new Uint8Array(16));
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, `0`)).join(``);
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

function lerContador() {
  const valor = Number(lerArmazenamento(CHAVE_CONTADOR));
  return Number.isSafeInteger(valor) && valor >= 0 ? valor : 0;
}

function montarMensagem(envio, desafio) {
  return `Olá, Elias! Meu nome é ${envio.nome}.\nE-mail: ${envio.email}\nEmpresa: ${envio.empresa || `Não informada`}\nÁrea de interesse: ${areas[envio.area]}\n\nMeu desafio: ${desafio}`;
}

function linkWhatsApp(texto) {
  return `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(texto)}`;
}

// Mantém o link dentro de um tamanho seguro; mensagens longas recebem uma versão resumida.
function prepararLinkWhatsApp(envio) {
  const completo = montarMensagem(envio, envio.mensagem);
  let link = linkWhatsApp(completo);
  if (link.length <= LIMITE_LINK_WHATSAPP) return { completo, link, resumido: false };
  let desafio = envio.mensagem;
  while (link.length > LIMITE_LINK_WHATSAPP && desafio.length > 50) {
    desafio = desafio.slice(0, Math.floor(desafio.length * 0.9)).trimEnd();
    link = linkWhatsApp(montarMensagem(envio, `${desafio}… (texto resumido; envio a mensagem completa em seguida)`));
  }
  return { completo, link, resumido: true };
}

function formatarData(data) {
  if (Number.isNaN(data.getTime())) return ``;
  return data.toLocaleDateString(`pt-BR`, { day: `2-digit`, month: `long`, year: `numeric` });
}

/* ---------- Componentes comuns ---------- */

function iniciarRodape() {
  document.querySelector(`#ano`).textContent = `${new Date().getFullYear()}`;
  const data = formatarData(new Date(document.lastModified));
  if (data) document.querySelector(`#ultima-atualizacao`).textContent = `Última atualização: ${data}`;
}

function iniciarMenu() {
  const botao = document.querySelector(`.menu-toggle`);
  const rotulo = document.querySelector(`.menu-label`);
  const nav = document.querySelector(`#navegacao`);
  const media = window.matchMedia(`(max-width: 759px)`);
  document.body.classList.add(`js-ready`);

  function definirAberto(aberto) {
    nav.hidden = !aberto;
    botao.setAttribute(`aria-expanded`, `${aberto}`);
    rotulo.textContent = aberto ? `Fechar` : `Menu`;
  }

  function adaptar() {
    botao.hidden = !media.matches;
    if (media.matches) {
      definirAberto(false);
    } else {
      nav.hidden = false;
      botao.setAttribute(`aria-expanded`, `false`);
      rotulo.textContent = `Menu`;
    }
  }

  botao.addEventListener(`click`, () => {
    definirAberto(botao.getAttribute(`aria-expanded`) !== `true`);
  });
  document.addEventListener(`keydown`, (evento) => {
    if (evento.key === `Escape` && media.matches && !nav.hidden) {
      definirAberto(false);
      botao.focus();
    }
  });
  media.addEventListener(`change`, adaptar);
  adaptar();
}

/* ---------- Serviços ---------- */

function renderizarServicos(area) {
  const lista = document.querySelector(`#lista-servicos`);
  const filtrados = servicos.filter((servico) => area === `todos` || servico.area === area);
  lista.innerHTML = filtrados.map((servico) => `
    <article class="service-card" id="${servico.id}">
      <p class="service-tag ${servico.area}">${areas[servico.area]}</p>
      <h2>${servico.titulo}</h2>
      <p>${servico.descricao}</p>
      <h3>O que o trabalho pode incluir</h3>
      <ul>${servico.entregas.map((item) => `<li>${item}</li>`).join(``)}</ul>
      <a href="contato.html?area=${servico.area}">Conversar sobre este serviço <span aria-hidden="true">→</span></a>
    </article>`).join(``);
  const plural = filtrados.length === 1 ? `serviço exibido` : `serviços exibidos`;
  const contexto = area === `todos` ? `em todas as áreas` : `em ${areas[area]}`;
  document.querySelector(`#resultado-filtro`).textContent = `${filtrados.length} ${plural} ${contexto}.`;
}

function iniciarFiltro() {
  const filtro = document.querySelector(`#filtro-area`);
  if (!filtro) return;
  // Parâmetro da URL tem prioridade; valor inválido mostra todas as áreas.
  const param = new URLSearchParams(window.location.search).get(`area`);
  const preferida = param !== null ? param : lerArmazenamento(CHAVE_AREA);
  filtro.value = areaValida(preferida) ? preferida : `todos`;
  renderizarServicos(filtro.value);
  filtro.addEventListener(`change`, () => {
    renderizarServicos(filtro.value);
    salvarArmazenamento(CHAVE_AREA, filtro.value);
  });
}

/* ---------- Formulário de contato ---------- */

function iniciarFormulario() {
  const form = document.querySelector(`#form-contato`);
  if (!form) return;
  const campos = form.elements;
  const status = document.querySelector(`#form-status`);
  const contagem = document.querySelector(`#mensagem-contagem`);

  // Sem JavaScript o fieldset permanece desabilitado: nenhum dado sai pela URL.
  document.querySelector(`#campos-contato`).disabled = false;

  const param = new URLSearchParams(window.location.search).get(`area`);
  const salva = lerArmazenamento(CHAVE_AREA);
  if (areaValida(param)) campos.area.value = param;
  else if (areaValida(salva)) campos.area.value = salva;

  function atualizarContagem() {
    contagem.textContent = `${campos.mensagem.value.length}/2000`;
  }

  [campos.nome, campos.mensagem].forEach((campo) => {
    campo.addEventListener(`input`, () => campo.setCustomValidity(``));
  });
  campos.mensagem.addEventListener(`input`, atualizarContagem);
  atualizarContagem();

  form.addEventListener(`submit`, (evento) => {
    evento.preventDefault();
    status.textContent = ``;
    const nome = campos.nome.value.trim();
    const mensagem = campos.mensagem.value.trim();
    // Entradas compostas apenas por espaços não passam pela validação.
    campos.nome.setCustomValidity(nome ? `` : `Informe seu nome.`);
    campos.mensagem.setCustomValidity(mensagem.length >= 10 ? `` : `Descreva o desafio com pelo menos 10 caracteres, sem contar espaços nas extremidades.`);
    if (!form.reportValidity()) return;

    const envio = {
      token: gerarToken(),
      area: campos.area.value,
      nome: nome.slice(0, 100),
      email: campos.email.value.trim().slice(0, 180),
      empresa: campos.empresa.value.trim().slice(0, 120),
      mensagem: mensagem.slice(0, 2000),
      contado: false
    };
    if (!salvarSessao(envio)) {
      status.textContent = `Não foi possível guardar a mensagem temporariamente porque o armazenamento do navegador está bloqueado. Use o e-mail ou o WhatsApp em “Contato direto com Elias”.`;
      return;
    }
    salvarArmazenamento(CHAVE_AREA, envio.area);
    window.location.assign(`confirmacao.html?token=${encodeURIComponent(envio.token)}`);
  });
}

/* ---------- Confirmação ---------- */

function iniciarConfirmacao() {
  const contador = document.querySelector(`#contador`);
  if (!contador) return;
  const titulo = document.querySelector(`#confirmacao-titulo`);
  const texto = document.querySelector(`#confirmacao-texto`);
  const chipArea = document.querySelector(`#confirmacao-area`);
  const preview = document.querySelector(`#preview-container`);
  const aviso = document.querySelector(`#armazenamento-aviso`);
  const acaoStatus = document.querySelector(`#acao-status`);
  const etapas = document.querySelector(`#etapas-contato`);
  const token = new URLSearchParams(window.location.search).get(`token`);
  const envio = lerSessao();
  let total = lerContador();

  function mostrarEstado(novoTitulo, novoTexto) {
    titulo.textContent = novoTitulo;
    texto.textContent = novoTexto;
    preview.hidden = true;
  }

  // Com token: precisa corresponder à sessão. Sem token (recarregamento): mostra a prévia já contada.
  const correspondente = envio && (token !== null ? envio.token === token : envio.contado === true);

  if (correspondente) {
    const jaContado = envio.contado || lerArmazenamento(CHAVE_ULTIMO_TOKEN) === envio.token;
    if (!jaContado) {
      total += 1;
      const salvo = salvarArmazenamento(CHAVE_CONTADOR, `${total}`) && salvarArmazenamento(CHAVE_ULTIMO_TOKEN, envio.token);
      if (!salvo) aviso.textContent = `O contador não pôde ser salvo neste navegador.`;
    }
    envio.contado = true;
    salvarSessao(envio);
    if (token !== null) history.replaceState(null, ``, `confirmacao.html`);

    const preparado = prepararLinkWhatsApp(envio);
    titulo.textContent = `Sua mensagem está pronta.`;
    texto.textContent = `Confira o texto abaixo e abra o WhatsApp para revisar e confirmar o envio a Elias.`;
    chipArea.textContent = `Área: ${areas[envio.area]}`;
    const passos = etapas.querySelectorAll(`li`);
    passos[0].classList.add(`done`);
    passos[1].classList.add(`current`);
    document.querySelector(`#preview-mensagem`).textContent = preparado.completo;
    document.querySelector(`#enviar-whatsapp`).href = preparado.link;
    const avisoTamanho = document.querySelector(`#aviso-tamanho`);
    avisoTamanho.hidden = !preparado.resumido;
    if (preparado.resumido) {
      avisoTamanho.textContent = `Sua mensagem é longa. O WhatsApp abrirá com uma versão resumida; use “Copiar mensagem” para colar o texto completo na conversa.`;
    }
    preview.hidden = false;

    document.querySelector(`#copiar-mensagem`).addEventListener(`click`, async () => {
      try {
        await navigator.clipboard.writeText(preparado.completo);
        acaoStatus.textContent = `Mensagem copiada. Cole no WhatsApp ou no e-mail, se preferir.`;
      } catch {
        const selecao = window.getSelection();
        const intervalo = document.createRange();
        intervalo.selectNodeContents(document.querySelector(`#preview-mensagem`));
        selecao.removeAllRanges();
        selecao.addRange(intervalo);
        acaoStatus.textContent = `Não foi possível copiar automaticamente. O texto foi selecionado: use Ctrl+C (ou Cmd+C) para copiar.`;
      }
    });

    document.querySelector(`#descartar-mensagem`).addEventListener(`click`, () => {
      removerSessao();
      mostrarEstado(`Mensagem descartada.`, `Os dados preenchidos foram removidos desta aba. Volte ao formulário se quiser preparar uma nova mensagem.`);
      titulo.focus();
    });
  } else if (token !== null) {
    if (token) history.replaceState(null, ``, `confirmacao.html`);
    mostrarEstado(`Este link de confirmação não está mais disponível.`, `A mensagem pode ter sido descartada, preparada em outra aba ou a aba pode ter sido fechada. Volte ao formulário para prepará-la novamente ou use os contatos diretos no rodapé.`);
  } else {
    mostrarEstado(`Nenhuma mensagem preparada.`, `Volte ao formulário para preparar uma mensagem ou use os contatos diretos no rodapé.`); // mesmo texto do HTML inicial
  }
  contador.textContent = `${total}`;
}

iniciarRodape();
iniciarMenu();
iniciarFiltro();
iniciarFormulario();
iniciarConfirmacao();
