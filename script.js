/* =========================================================
   DASHBOARD — PROGRAMA MULTIPLICADORES
   Conectado à base real via Google Apps Script
========================================================= */


/* =========================================================
   CONFIGURAÇÃO DA API
========================================================= */

const API_URL =
  "https://script.google.com/a/macros/mercadolivre.com/s/AKfycbzortEzdw4UOxFqaqGIuxLC6sT-mf0yG5aMJbbCFHPk4ldG7HvX0PzlO178bNAZ_vySqg/exec";


/* =========================================================
   BASE
========================================================= */

let multiplicadores = [];


/* =========================================================
   FILTROS
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

    .replace(
      /\s+/g,
      " "
    )

    .trim();

}


/* =========================================================
   BUSCA SEGURA DE COLUNA
========================================================= */

function pegarValor(
  objeto,
  nomesPossiveis
) {

  for (
    const nome
    of nomesPossiveis
  ) {

    if (
      objeto[nome] !== undefined
    ) {

      return String(
        objeto[nome] || ""
      ).trim();

    }

  }


  return "";

}


/* =========================================================
   CONVERTE LINHA DA PLANILHA
   PARA O FORMATO DO DASH
========================================================= */

function transformarRegistro(
  item
) {

  return {

    nome:
      pegarValor(
        item,
        [
          "Nome do Representante"
        ]
      ),

    repAtivo:
      pegarValor(
        item,
        [
          "Status Base HC"
        ]
      ),

    statusPrograma:
      pegarValor(
        item,
        [
          "Status Treinamento"
        ]
      ),

    turno:
      pegarValor(
        item,
        [
          "Turno"
        ]
      ),

    cargo:
      pegarValor(
        item,
        [
          "Cargo"
        ]
      ),

    ldap:
      pegarValor(
        item,
        [
          "LDAP"
        ]
      ),

    areaMacro:
      pegarValor(
        item,
        [
          "Área Macro",
          "Area Macro"
        ]
      ),

    subArea:
      pegarValor(
        item,
        [
          "Sub Área",
          "Sub Area"
        ]
      ),

    processo:
      pegarValor(
        item,
        [
          "Processo Ajustado"
        ]
      ),

    escala:
      pegarValor(
        item,
        [
          "ESCALA",
          "Escala"
        ]
      ),

    decola:
      pegarValor(
        item,
        [
          "Decola"
        ]
      ),

    bolhaMulti:
      pegarValor(
        item,
        [
          "Tem bolha de Multi"
        ]
      ),

    dataFormacao:
      pegarValor(
        item,
        [
          "Data de Formação",
          "Data de Formacao"
        ]
      ),

    motivo:
      pegarValor(
        item,
        [
          "Motivo"
        ]
      )

  };

}


/* =========================================================
   CARREGAMENTO DA API
========================================================= */

async function carregarDados() {

  try {

    mostrarCarregamento();


    const resposta =
      await fetch(
        API_URL,
        {
          method:
            "GET",

          cache:
            "no-store"
        }
      );


    if (
      !resposta.ok
    ) {

      throw new Error(
        `Erro HTTP: ${resposta.status}`
      );

    }


    const retorno =
      await resposta.json();


    if (
      !retorno.sucesso
    ) {

      throw new Error(
        retorno.erro
        ||
        "Erro ao carregar a base."
      );

    }


    multiplicadores =

      retorno.dados

        .map(
          transformarRegistro
        )

        .filter(
          pessoa =>
            pessoa.nome
        );


    atualizarData();

    atualizarDashboard();

  }

  catch (
    erro
  ) {

    console.error(
      "Erro ao carregar dados:",
      erro
    );


    mostrarErro(
      erro.message
    );

  }

}


/* =========================================================
   STATUS DO PROGRAMA
========================================================= */

function statusNormalizado(
  pessoa
) {

  return normalizarTexto(
    pessoa.statusPrograma
  );

}


function estaAtivo(
  pessoa
) {

  return (
    statusNormalizado(
      pessoa
    ) ===
    "ativo"
  );

}


function estaAtivoEscola(
  pessoa
) {

  const status =
    statusNormalizado(
      pessoa
    );


  return (

    status ===
      "ativo escola"

    ||

    status ===
      "ativo para escola"

    ||

    status ===
      "ativo para escola de maquina"

  );

}


function estaNaVisaoPrincipal(
  pessoa
) {

  return (

    estaAtivo(
      pessoa
    )

    ||

    estaAtivoEscola(
      pessoa
    )

  );

}


function estaInativoOuDesistencia(
  pessoa
) {

  const status =
    statusNormalizado(
      pessoa
    );


  return (

    status ===
      "inativo"

    ||

    status ===
      "desistencia"

  );

}


/* =========================================================
   NORMALIZAÇÃO DE TURNO
========================================================= */

function normalizarTurno(
  turno
) {

  const valor =
    normalizarTexto(
      turno
    );


  if (
    valor === "t1"
    ||
    valor.includes(
      "1 turno"
    )
    ||
    valor.includes(
      "1º turno"
    )
    ||
    valor.includes(
      "1° turno"
    )
  ) {

    return "T1";

  }


  if (
    valor === "t2"
    ||
    valor.includes(
      "2 turno"
    )
    ||
    valor.includes(
      "2º turno"
    )
    ||
    valor.includes(
      "2° turno"
    )
  ) {

    return "T2";

  }


  if (
    valor === "t3"
    ||
    valor.includes(
      "3 turno"
    )
    ||
    valor.includes(
      "3º turno"
    )
    ||
    valor.includes(
      "3° turno"
    )
  ) {

    return "T3";

  }


  return turno;

}


/* =========================================================
   FILTRO POR TURNO
========================================================= */

function filtrarPorTurno(
  lista
) {

  if (
    turnoSelecionado ===
    "todos"
  ) {

    return lista;

  }


  return lista.filter(

    pessoa =>
      normalizarTurno(
        pessoa.turno
      ) ===
      turnoSelecionado

  );

}


/* =========================================================
   INDICADORES PRINCIPAIS
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
            normalizarTurno(
              pessoa.turno
            ) ===
            turno

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
      statusNormalizado(
        pessoa
      ) ===
      statusSelecionado

  );

}


/* =========================================================
   STATUS DO REP NA BASE HC
========================================================= */

function repEstaAtivo(
  pessoa
) {

  const status =
    normalizarTexto(
      pessoa.repAtivo
    );


  return (

    status ===
      "ativo"

    ||

    status ===
      "sim"

  );

}


/* =========================================================
   SIM / NÃO
========================================================= */

function valorEhSim(
  valor
) {

  const texto =
    normalizarTexto(
      valor
    );


  return (

    texto ===
      "sim"

    ||

    texto ===
      "yes"

    ||

    texto ===
      "s"

    ||

    texto ===
      "1"

    ||

    texto ===
      "true"

  );

}


/* =========================================================
   BADGES
========================================================= */

function criarBadgeStatus(
  status
) {

  const valor =
    normalizarTexto(
      status
    );


  let classe =
    "";


  if (
    valor ===
    "ativo"
  ) {

    classe =
      "ativo";

  }


  else if (
    valor ===
      "ativo escola"

    ||

    valor ===
      "ativo para escola"

    ||

    valor ===
      "ativo para escola de maquina"
  ) {

    classe =
      "escola";

  }


  else if (
    valor ===
      "training"
  ) {

    classe =
      "training";

  }


  else if (
    valor ===
      "multi loss"
  ) {

    classe =
      "loss";

  }


  else if (
    valor ===
      "inativo"
  ) {

    classe =
      "inativo";

  }


  else if (
    valor ===
      "desistencia"
  ) {

    classe =
      "desistencia";

  }


  return `

    <span class="badge ${classe}">

      ${
        status
        ||
        "-"
      }

    </span>

  `;

}


/* =========================================================
   BADGE STATUS REP
========================================================= */

function criarBadgeRepAtivo(
  pessoa
) {

  const ativo =
    repEstaAtivo(
      pessoa
    );


  return `

    <span class="badge ${
      ativo
        ? "sim"
        : "nao"
    }">

      ${
        ativo
          ? "✓ Ativo"
          : "Inativo"
      }

    </span>

  `;

}


/* =========================================================
   BADGE SIM / NÃO
========================================================= */

function criarBadgeSimNao(
  valor
) {

  const positivo =
    valorEhSim(
      valor
    );


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
            ${pessoa.subArea}
            ${pessoa.processo}
            ${pessoa.turno}
            ${pessoa.statusPrograma}
            ${pessoa.cargo}
            ${pessoa.escala}
            ${pessoa.motivo}
            `

          );


        return texto.includes(
          termoBusca
        );

      }

    );

  }


  if (
    dados.length ===
    0
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

              ${
                pessoa.nome
                ||
                "-"
              }

            </strong>

          </td>


          <td>

            ${
              criarBadgeRepAtivo(
                pessoa
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

              ${
                normalizarTurno(
                  pessoa.turno
                )
                ||
                "-"
              }

            </span>

          </td>


          <td>

            ${
              pessoa.cargo
              ||
              "-"
            }

          </td>


          <td>

            ${
              pessoa.ldap
              ||
              "-"
            }

          </td>


          <td>

            ${
              pessoa.areaMacro
              ||
              "-"
            }

          </td>


          <td>

            <div>

              <strong>

                ${
                  pessoa.processo
                  ||
                  "-"
                }

              </strong>

              ${
                pessoa.subArea
                  ?

                  `
                  <div
                    style="
                      margin-top:4px;
                      font-size:10px;
                      color:#98a2b3;
                    "
                  >
                    ${pessoa.subArea}
                  </div>
                  `

                  :

                  ""
              }

            </div>

          </td>


          <td>

            ${
              pessoa.escala
              ||
              "-"
            }

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
   CARREGANDO
========================================================= */

function mostrarCarregamento() {

  const corpoTabela =

    document.getElementById(
      "tabelaMultiplicadores"
    );


  corpoTabela.innerHTML = `

    <tr class="sem-dados">

      <td colspan="13">

        Carregando dados da base...

      </td>

    </tr>

  `;

}


/* =========================================================
   ERRO
========================================================= */

function mostrarErro(
  mensagem
) {

  document.getElementById(
    "tabelaMultiplicadores"
  ).innerHTML = `

    <tr class="sem-dados">

      <td colspan="13">

        Não foi possível carregar os dados.

        <br><br>

        <small>

          ${mensagem}

        </small>

      </td>

    </tr>

  `;

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
   FILTROS DE STATUS
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

    carregarDados();

  }

);
