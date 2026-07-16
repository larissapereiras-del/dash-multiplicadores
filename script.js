/* =========================================================
   DASHBOARD — PROGRAMA MULTIPLICADORES
   Dados temporários para desenvolvimento
========================================================= */

const multiplicadores = [

  {
    nome: "Ana Souza",
    turno: "T1",
    status: "Ativo",
    gestao: "Gestão A"
  },

  {
    nome: "Bruno Silva",
    turno: "T1",
    status: "Ativo para Escola de Máquina",
    gestao: "Gestão B"
  },

  {
    nome: "Carlos Santos",
    turno: "T2",
    status: "Ativo",
    gestao: "Gestão C"
  },

  {
    nome: "Daniela Oliveira",
    turno: "T2",
    status: "Ativo para Escola de Máquina",
    gestao: "Gestão A"
  },

  {
    nome: "Eduardo Lima",
    turno: "T3",
    status: "Ativo",
    gestao: "Gestão B"
  },

  {
    nome: "Fernanda Costa",
    turno: "T3",
    status: "Ativo",
    gestao: "Gestão C"
  },

  {
    nome: "Gabriel Rocha",
    turno: "T3",
    status: "Ativo para Escola de Máquina",
    gestao: "Gestão A"
  }

];


/* =========================================================
   VARIÁVEIS
========================================================= */

let turnoSelecionado =
  "todos";

let termoBusca =
  "";


/* =========================================================
   NORMALIZAÇÃO
========================================================= */

function normalizarTexto(texto) {

  return String(texto || "")

    .normalize("NFD")

    .replace(
      /[\u0300-\u036f]/g,
      ""
    )

    .toLowerCase()

    .trim();

}


/* =========================================================
   REGRAS DE STATUS
========================================================= */

function estaAtivo(pessoa) {

  return (
    normalizarTexto(
      pessoa.status
    ) === "ativo"
  );

}


function estaAtivoParaEscola(pessoa) {

  const status =
    normalizarTexto(
      pessoa.status
    );


  return (

    status ===
      "ativo para escola"

    ||

    status ===
      "ativo para escola de maquina"

  );

}


/* =========================================================
   FILTRO POR TURNO
========================================================= */

function filtrarPorTurno(
  lista,
  turno
) {

  if (
    turno === "todos"
  ) {

    return lista;

  }


  return lista.filter(

    pessoa =>
      pessoa.turno === turno

  );

}


/* =========================================================
   INDICADORES PRINCIPAIS
========================================================= */

function atualizarIndicadores() {

  const dadosFiltrados =

    filtrarPorTurno(

      multiplicadores,

      turnoSelecionado

    );


  const ativos =

    dadosFiltrados.filter(

      estaAtivo

    );


  const escola =

    dadosFiltrados.filter(

      estaAtivoParaEscola

    );


  document.getElementById(
    "totalMultiplicadores"
  ).textContent =
    dadosFiltrados.length;


  document.getElementById(
    "totalAtivos"
  ).textContent =
    ativos.length;


  document.getElementById(
    "totalEscola"
  ).textContent =
    escola.length;

}


/* =========================================================
   VISÃO POR TURNO
========================================================= */

function atualizarTurnos() {

  [
    "T1",
    "T2",
    "T3"
  ].forEach(

    turno => {


      const pessoasTurno =

        multiplicadores.filter(

          pessoa =>
            pessoa.turno === turno

        );


      const ativos =

        pessoasTurno.filter(

          estaAtivo

        );


      const escola =

        pessoasTurno.filter(

          estaAtivoParaEscola

        );


      document.getElementById(
        `total${turno}`
      ).textContent =
        pessoasTurno.length;


      document.getElementById(
        `ativos${turno}`
      ).textContent =
        ativos.length;


      document.getElementById(
        `escola${turno}`
      ).textContent =
        escola.length;

    }

  );

}


/* =========================================================
   BADGE DE STATUS
========================================================= */

function criarBadgeStatus(status) {

  if (
    estaAtivo({
      status
    })
  ) {

    return `
      <span class="badge-status ativo">
        ● Ativo
      </span>
    `;

  }


  if (
    estaAtivoParaEscola({
      status
    })
  ) {

    return `
      <span class="badge-status escola">
        🎓 Ativo para Escola de Máquina
      </span>
    `;

  }


  return `
    <span class="badge-status">
      ${status}
    </span>
  `;

}


/* =========================================================
   TABELA
========================================================= */

function atualizarTabela() {

  const corpoTabela =

    document.getElementById(
      "tabelaMultiplicadores"
    );


  let dados =

    filtrarPorTurno(

      multiplicadores,

      turnoSelecionado

    );


  if (
    termoBusca
  ) {

    dados = dados.filter(

      pessoa => {


        const textoPessoa =

          normalizarTexto(

            `
            ${pessoa.nome}
            ${pessoa.turno}
            ${pessoa.status}
            ${pessoa.gestao}
            `

          );


        return textoPessoa.includes(

          termoBusca

        );

      }

    );

  }


  if (
    dados.length === 0
  ) {

    corpoTabela.innerHTML = `

      <tr class="sem-dados">

        <td colspan="4">

          Nenhum multiplicador encontrado.

        </td>

      </tr>

    `;


    return;

  }


  corpoTabela.innerHTML =

    dados.map(

      pessoa => `

        <tr>


          <td>

            <strong>

              ${pessoa.nome}

            </strong>

          </td>


          <td>

            <span class="badge-turno">

              ${pessoa.turno}

            </span>

          </td>


          <td>

            ${criarBadgeStatus(
              pessoa.status
            )}

          </td>


          <td>

            ${pessoa.gestao}

          </td>


        </tr>

      `

    ).join("");

}


/* =========================================================
   FILTROS DE TURNO
========================================================= */

function configurarFiltrosTurno() {

  const botoes =

    document.querySelectorAll(
      ".botao-turno"
    );


  botoes.forEach(

    botao => {


      botao.addEventListener(

        "click",

        () => {


          turnoSelecionado =

            botao.dataset.turno;


          botoes.forEach(

            item =>

              item.classList.remove(
                "ativo"
              )

          );


          botao.classList.add(
            "ativo"
          );


          atualizarDashboard();

        }

      );

    }

  );

}


/* =========================================================
   BUSCA
========================================================= */

function configurarBusca() {

  const campoBusca =

    document.getElementById(
      "campoBusca"
    );


  campoBusca.addEventListener(

    "input",

    evento => {


      termoBusca =

        normalizarTexto(

          evento.target.value

        );


      atualizarTabela();

    }

  );

}


/* =========================================================
   DATA DE ATUALIZAÇÃO
========================================================= */

function atualizarData() {

  const agora =

    new Date();


  const dataFormatada =

    agora.toLocaleString(

      "pt-BR",

      {

        day:
          "2-digit",

        month:
          "2-digit",

        year:
          "numeric",

        hour:
          "2-digit",

        minute:
          "2-digit"

      }

    );


  document.getElementById(
    "ultimaAtualizacao"
  ).textContent =
    dataFormatada;

}


/* =========================================================
   ATUALIZA DASHBOARD
========================================================= */

function atualizarDashboard() {

  atualizarIndicadores();

  atualizarTurnos();

  atualizarTabela();

}


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

document.addEventListener(

  "DOMContentLoaded",

  () => {


    configurarFiltrosTurno();

    configurarBusca();

    atualizarData();

    atualizarDashboard();

  }

);
