/* =========================================================
   DASHBOARD — PROGRAMA MULTIPLICADORES
   Dados fictícios para validação visual
========================================================= */

const multiplicadores = [

  {
    nome: "Ana Souza",
    repAtivo: "Sim",
    statusPrograma: "Ativo",
    turno: "T1",
    cargo: "Representante",
    ldap: "anasouza",
    areaMacro: "Outbound",
    processo: "Picking",
    escala: "6x1",
    decola: "Sim",
    bolhaMulti: "Sim",
    dataFormacao: "12/02/2026",
    motivo: ""
  },

  {
    nome: "Bruno Silva",
    repAtivo: "Sim",
    statusPrograma: "Ativo Escola",
    turno: "T1",
    cargo: "Representante",
    ldap: "brunosilva",
    areaMacro: "Outbound",
    processo: "Packing",
    escala: "6x1",
    decola: "Não",
    bolhaMulti: "Não",
    dataFormacao: "",
    motivo: ""
  },

  {
    nome: "Carlos Santos",
    repAtivo: "Sim",
    statusPrograma: "Training",
    turno: "T2",
    cargo: "Representante",
    ldap: "carlossantos",
    areaMacro: "Inbound",
    processo: "Receiving",
    escala: "5x2",
    decola: "Sim",
    bolhaMulti: "Não",
    dataFormacao: "",
    motivo: ""
  },

  {
    nome: "Daniela Oliveira",
    repAtivo: "Sim",
    statusPrograma: "Multi LOSS",
    turno: "T2",
    cargo: "Representante",
    ldap: "danielaoliveira",
    areaMacro: "Outbound",
    processo: "P2S",
    escala: "6x1",
    decola: "Sim",
    bolhaMulti: "Sim",
    dataFormacao: "08/11/2025",
    motivo: "Indicadores abaixo dos critérios"
  },

  {
    nome: "Eduardo Lima",
    repAtivo: "Sim",
    statusPrograma: "Ativo",
    turno: "T3",
    cargo: "Representante",
    ldap: "eduardolima",
    areaMacro: "Outbound",
    processo: "Packing",
    escala: "6x1",
    decola: "Sim",
    bolhaMulti: "Sim",
    dataFormacao: "19/03/2026",
    motivo: ""
  },

  {
    nome: "Fernanda Costa",
    repAtivo: "Não",
    statusPrograma: "Inativo",
    turno: "T3",
    cargo: "Representante",
    ldap: "fernandacosta",
    areaMacro: "Outbound",
    processo: "Picking",
    escala: "6x1",
    decola: "Sim",
    bolhaMulti: "Não",
    dataFormacao: "05/09/2025",
    motivo: "Transferência de área"
  },

  {
    nome: "Gabriel Rocha",
    repAtivo: "Sim",
    statusPrograma: "Desistência",
    turno: "T3",
    cargo: "Representante",
    ldap: "gabrielrocha",
    areaMacro: "Inbound",
    processo: "Putaway",
    escala: "5x2",
    decola: "Não",
    bolhaMulti: "Não",
    dataFormacao: "",
    motivo: "Desistência voluntária do programa"
  },

  {
    nome: "Helena Martins",
    repAtivo: "Sim",
    statusPrograma: "Ativo Escola",
    turno: "T3",
    cargo: "Representante",
    ldap: "helenamartins",
    areaMacro: "Outbound",
    processo: "Picking",
    escala: "6x1",
    decola: "Sim",
    bolhaMulti: "Não",
    dataFormacao: "",
    motivo: ""
  }

];


/* =========================================================
   VARIÁVEIS
========================================================= */

let turnoSelecionado =
  "todos";

let statusSelecionado =
  "principal";

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
   REGRAS
========================================================= */

function statusNormalizado(pessoa) {

  return normalizarTexto(
    pessoa.statusPrograma
  );

}


function estaAtivo(pessoa) {

  return (
    statusNormalizado(pessoa) ===
    "ativo"
  );

}


function estaAtivoEscola(pessoa) {

  return (
    statusNormalizado(pessoa) ===
    "ativo escola"
  );

}


function estaNaVisaoPrincipal(pessoa) {

  return (
    estaAtivo(pessoa)
    ||
    estaAtivoEscola(pessoa)
  );

}


function estaInativoOuDesistencia(pessoa) {

  const status =
    statusNormalizado(pessoa);


  return (

    status === "inativo"

    ||

    status === "desistencia"

  );

}


/* =========================================================
   FILTRO DE TURNO
========================================================= */

function filtrarPorTurno(
  lista
) {

  if (
    turnoSelecionado === "todos"
  ) {

    return lista;

  }


  return lista.filter(

    pessoa =>
      pessoa.turno ===
      turnoSelecionado

  );

}


/* =========================================================
   INDICADORES
========================================================= */

function atualizarIndicadores() {

  const baseTurno =
    filtrarPorTurno(
      multiplicadores
    );


  const principal =
    baseTurno.filter(
      estaNaVisaoPrincipal
    );


  const ativos =
    principal.filter(
      estaAtivo
    );


  const escola =
    principal.filter(
      estaAtivoEscola
    );


  document.getElementById(
    "totalMultiplicadores"
  ).textContent =
    principal.length;


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


      const baseTurno =
        multiplicadores.filter(

          pessoa =>
            pessoa.turno === turno

        );


      const principal =
        baseTurno.filter(
          estaNaVisaoPrincipal
        );


      const ativos =
        principal.filter(
          estaAtivo
        );


      const escola =
        principal.filter(
          estaAtivoEscola
        );


      document.getElementById(
        `total${turno}`
      ).textContent =
        principal.length;


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
   FILTRO DE STATUS
========================================================= */

function filtrarPorStatus(
  lista
) {

  if (
    statusSelecionado ===
    "principal"
  ) {

    return lista.filter(
      estaNaVisaoPrincipal
    );

  }


  if (
    statusSelecionado ===
    "inativos"
  ) {

    return lista.filter(
      estaInativoOuDesistencia
    );

  }


  return lista.filter(

    pessoa =>
      statusNormalizado(pessoa) ===
      statusSelecionado

  );

}


/* =========================================================
   BADGES
========================================================= */

function criarBadgeStatus(
  status
) {

  const valor =
    normalizarTexto(status);


  let classe =
    "";


  if (
    valor === "ativo"
  ) {

    classe =
      "ativo";

  }


  else if (
    valor === "ativo escola"
  ) {

    classe =
      "escola";

  }


  else if (
    valor === "training"
  ) {

    classe =
      "training";

  }


  else if (
    valor === "multi loss"
  ) {

    classe =
      "loss";

  }


  else if (
    valor === "inativo"
  ) {

    classe =
      "inativo";

  }


  else if (
    valor === "desistencia"
  ) {

    classe =
      "desistencia";

  }


  return `

    <span class="badge ${classe}">

      ${status}

    </span>

  `;

}


function criarBadgeSimNao(
  valor
) {

  const positivo =

    normalizarTexto(valor) ===
    "sim";


  return `

    <span class="badge ${
      positivo
        ? "sim"
        : "nao"
    }">

      ${
        positivo
          ? "✓ Sim"
          : "Não"
      }

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
      multiplicadores
    );


  dados =

    filtrarPorStatus(
      dados
    );


  if (
    termoBusca
  ) {

    dados = dados.filter(

      pessoa => {


        const texto =

          normalizarTexto(

            `
            ${pessoa.nome}
            ${pessoa.ldap}
            ${pessoa.areaMacro}
            ${pessoa.processo}
            ${pessoa.turno}
            ${pessoa.statusPrograma}
            ${pessoa.cargo}
            ${pessoa.escala}
            `

          );


        return texto.includes(
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

        <td colspan="13">

          Nenhum registro encontrado.

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

            ${
              criarBadgeSimNao(
                pessoa.repAtivo
              )
            }

          </td>


          <td>

            ${
              criarBadgeStatus(
                pessoa.statusPrograma
              )
            }

          </td>


          <td>

            <span class="badge-turno">

              ${pessoa.turno}

            </span>

          </td>


          <td>

            ${pessoa.cargo || "-"}

          </td>


          <td>

            ${pessoa.ldap || "-"}

          </td>


          <td>

            ${pessoa.areaMacro || "-"}

          </td>


          <td>

            ${pessoa.processo || "-"}

          </td>


          <td>

            ${pessoa.escala || "-"}

          </td>


          <td>

            ${
              criarBadgeSimNao(
                pessoa.decola
              )
            }

          </td>


          <td>

            ${
              criarBadgeSimNao(
                pessoa.bolhaMulti
              )
            }

          </td>


          <td>

            ${
              pessoa.dataFormacao
              ||
              "-"
            }

          </td>


          <td>

            ${
              pessoa.motivo
              ||
              "-"
            }

          </td>


        </tr>

      `

    ).join("");

}


/* =========================================================
   BOTÕES DE TURNO
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
   BOTÕES DE STATUS
========================================================= */

function configurarFiltrosStatus() {

  const botoes =

    document.querySelectorAll(
      ".botao-status"
    );


  botoes.forEach(

    botao => {


      botao.addEventListener(

        "click",

        () => {


          statusSelecionado =

            botao.dataset.status;


          botoes.forEach(

            item =>

              item.classList.remove(
                "ativo"
              )

          );


          botao.classList.add(
            "ativo"
          );


          atualizarTabela();

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
   DATA
========================================================= */

function atualizarData() {

  const agora =
    new Date();


  document.getElementById(
    "ultimaAtualizacao"
  ).textContent =

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

}


/* =========================================================
   DASHBOARD
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

    configurarFiltrosStatus();

    configurarBusca();

    atualizarData();

    atualizarDashboard();

  }

);
