/* =========================================================
   DASHBOARD — PROGRAMA MULTIPLICADORES
   BASE REAL VIA JSONP
========================================================= */


/* =========================================================
   API
========================================================= */

const API_URL =
  "https://script.google.com/a/macros/mercadolivre.com/s/AKfycbzortEzdw4UOxFqaqGIuxLC6sT-mf0yG5aMJbbCFHPk4ldG7HvX0PzlO178bNAZ_vySqg/exec";


/* =========================================================
   BASE
========================================================= */

let multiplicadores =
  [];


/* =========================================================
   ESTADOS DOS FILTROS
========================================================= */

let turnoSelecionado =
  "todos";

let turnoLiderancaSelecionado =
  "todos";

let turnoConsultaSelecionado =
  "todos";

let statusSelecionado =
  "principal";

let termoBusca =
  "";


/* =========================================================
   NORMALIZA TEXTO
========================================================= */

function normalizarTexto(
  texto
) {

  return String(
    texto || ""
  )

    .normalize(
      "NFD"
    )

    .replace(
      /[\u0300-\u036f]/g,
      ""
    )

    .replace(
      /\s+/g,
      " "
    )

    .toLowerCase()

    .trim();

}


/* =========================================================
   MAPA DA BASE
========================================================= */

function transformarRegistro(
  item
) {

  return {

    nome:
      item[
        "Nome do Representante"
      ] || "",

    teamLeader:
      item[
        "Team Leader"
      ] || "",

    statusBaseHC:
      item[
        "Status Base HC"
      ] || "",

    statusPrograma:
      item[
        "Status Treinamento"
      ] || "",

    turno:
      item[
        "Turno"
      ] || "",

    cargo:
      item[
        "Cargo"
      ] || "",

    ldap:
      item[
        "LDAP"
      ] || "",

    areaMacro:
      item[
        "Área Macro"
      ] || "",

    subArea:
      item[
        "Sub Área"
      ] || "",

    processo:
      item[
        "Processo Ajustado"
      ] || "",

    escala:
      item[
        "ESCALA"
      ] || "",

    decola:
      item[
        "Decola"
      ] || "",

    bolhaMulti:
      item[
        "Tem bolha de Multi"
      ] || "",

    dataFormacao:
      item[
        "Data de Formação"
      ] || "",

    motivo:
      item[
        "Motivo"
      ] || ""

  };

}


/* =========================================================
   CARREGA DADOS VIA JSONP
========================================================= */

function carregarDados() {

  mostrarCarregamento();


  const callbackName =
    "receberDadosMultiplicadores";


  const scriptAnterior =
    document.getElementById(
      "api-multiplicadores"
    );


  if (
    scriptAnterior
  ) {

    scriptAnterior.remove();

  }


  const timeout =
    setTimeout(

      () => {

        mostrarErro(
          "A conexão com a planilha demorou mais que o esperado."
        );

      },

      20000

    );


  window[
    callbackName
  ] = function (
    retorno
  ) {

    clearTimeout(
      timeout
    );


    try {

      if (
        !retorno
        ||
        !retorno.sucesso
      ) {

        throw new Error(

          retorno?.erro
          ||
          "A API não retornou os dados corretamente."

        );

      }


      multiplicadores =

        retorno.dados

          .map(
            transformarRegistro
          )

          .filter(

            pessoa =>

              String(
                pessoa.nome || ""
              ).trim() !== ""

          );


      atualizarData();

      atualizarDashboard();

    }


    catch (
      erro
    ) {

      console.error(
        erro
      );


      mostrarErro(
        erro.message
      );

    }


    finally {

      delete window[
        callbackName
      ];


      const scriptAPI =
        document.getElementById(
          "api-multiplicadores"
        );


      if (
        scriptAPI
      ) {

        scriptAPI.remove();

      }

    }

  };


  const script =
    document.createElement(
      "script"
    );


  script.id =
    "api-multiplicadores";


  script.src =

    API_URL

    +

    "?callback="

    +

    callbackName

    +

    "&t="

    +

    Date.now();


  script.onerror =
    function () {

      clearTimeout(
        timeout
      );


      mostrarErro(

        "O navegador não conseguiu acessar a API da planilha."

      );

    };


  document.body.appendChild(
    script
  );

}


/* =========================================================
   STATUS
========================================================= */

function statusPrograma(
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

    statusPrograma(
      pessoa
    ) ===
    "ativo"

  );

}


function estaAtivoEscola(
  pessoa
) {

  const status =
    statusPrograma(
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


function estaNaConsultaInativos(
  pessoa
) {

  const status =
    statusPrograma(
      pessoa
    );


  return (

    status ===
      "inativo"

    ||

    status ===
      "desistencia"

    ||

    status ===
      "multi loss"

    ||

    status ===
      "training"

  );

}


/* =========================================================
   TURNO
========================================================= */

function normalizarTurno(
  turno
) {

  const valor =
    normalizarTexto(
      turno
    );


  if (valor === "t1") {
    return "T1";
  }

  if (valor === "t2") {
    return "T2";
  }

  if (valor === "t3") {
    return "T3";
  }

  if (valor === "t4") {
    return "T4";
  }

  if (valor === "t5") {
    return "T5";
  }


  return String(
    turno || ""
  ).trim();

}


/* =========================================================
   FILTRO GENÉRICO POR TURNO
========================================================= */

function filtrarListaPorTurno(
  lista,
  turno
) {

  if (
    turno ===
    "todos"
  ) {

    return lista;

  }


  return lista.filter(

    pessoa =>

      normalizarTurno(
        pessoa.turno
      ) ===
      turno

  );

}


/* =========================================================
   INDICADORES
========================================================= */

function atualizarIndicadores() {

  const baseTurno =

    filtrarListaPorTurno(

      multiplicadores,

      turnoSelecionado

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


  const lideres =

    new Set(

      principal

        .map(

          pessoa =>

            normalizarTexto(
              pessoa.teamLeader
            )

        )

        .filter(
          Boolean
        )

    );


  const totalLideres =
    lideres.size;


  const ratio =

    totalLideres > 0

      ? principal.length
        /
        totalLideres

      : 0;


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

document.getElementById(
  "ratioGeral"
).textContent =

  totalLideres > 0

    ? ratio
        .toFixed(2)
        .replace(".", ",")

    : "-";


  document.getElementById(
    "ratioDetalhe"
  ).textContent =

    totalLideres > 0

      ? `${principal.length} multis ÷ ${totalLideres} líderes`

      : "Sem líderes disponíveis";

}


/* =========================================================
   COMPARATIVO POR TURNO
========================================================= */

function atualizarTurnos() {

  [
    "T1",
    "T2",
    "T3",
    "T4",
    "T5"
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
   TABELA DE LIDERANÇA
========================================================= */

function atualizarTabelaLideranca() {

  const corpoTabela =
    document.getElementById(
      "tabelaLideranca"
    );


  let base =

    filtrarListaPorTurno(

      multiplicadores,

      turnoLiderancaSelecionado

    );


  base =
    base.filter(
      estaNaVisaoPrincipal
    );


  const mapa =
    new Map();


  base.forEach(

    pessoa => {


      const nomeLider =

        String(
          pessoa.teamLeader || ""
        ).trim();


      if (
        !nomeLider
      ) {

        return;

      }


      const chave =

        normalizarTexto(
          nomeLider
        );


      if (
        !mapa.has(
          chave
        )
      ) {

        mapa.set(

          chave,

          {

            nome:
              nomeLider,

            total:
              0,

            ativos:
              0,

            escola:
              0

          }

        );

      }


      const lider =
        mapa.get(
          chave
        );


      lider.total +=
        1;


      if (
        estaAtivo(
          pessoa
        )
      ) {

        lider.ativos +=
          1;

      }


      if (
        estaAtivoEscola(
          pessoa
        )
      ) {

        lider.escola +=
          1;

      }

    }

  );


  const lideres =

    Array
      .from(
        mapa.values()
      )

      .sort(

        (
          a,
          b
        ) =>

          b.total
          -
          a.total

      );


  if (
    lideres.length ===
    0
  ) {

    corpoTabela.innerHTML = `

      <tr class="sem-dados">

        <td colspan="5">

          Nenhum líder encontrado.

        </td>

      </tr>

    `;


    return;

  }


  corpoTabela.innerHTML =

    lideres.map(

      (
        lider,
        indice
      ) => `

        <tr>

          <td>

            <div class="posicao-ranking">

              ${indice + 1}

            </div>

          </td>


          <td>

            <strong>

              ${
                escapeHtml(
                  lider.nome
                )
              }

            </strong>

          </td>


          <td>

            <span class="numero-lideranca">

              ${lider.total}

            </span>

          </td>


          <td>

            <span class="badge ativo">

              ${lider.ativos}

            </span>

          </td>


          <td>

            <span class="badge escola">

              ${lider.escola}

            </span>

          </td>

        </tr>

      `

    ).join("");

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
    "ativo"
  ) {

    return lista.filter(
      estaAtivo
    );

  }


  if (
    statusSelecionado ===
    "ativo-escola"
  ) {

    return lista.filter(
      estaAtivoEscola
    );

  }


  if (
    statusSelecionado ===
    "inativos"
  ) {

    return lista.filter(
      estaNaConsultaInativos
    );

  }


  return lista;

}


/* =========================================================
   MOTIVO
========================================================= */

function obterMotivo(
  pessoa
) {

  const motivo =

    String(
      pessoa.motivo || ""
    ).trim();


  if (
    motivo
  ) {

    return motivo;

  }


  const status =
    statusPrograma(
      pessoa
    );


  if (
    status ===
      "multi loss"

    ||

    status ===
      "training"
  ) {

    return "Movimentação de área";

  }


  return "-";

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHtml(
  texto
) {

  return String(
    texto || ""
  )

    .replace(
      /&/g,
      "&amp;"
    )

    .replace(
      /</g,
      "&lt;"
    )

    .replace(
      />/g,
      "&gt;"
    )

    .replace(
      /"/g,
      "&quot;"
    )

    .replace(
      /'/g,
      "&#039;"
    );

}


/* =========================================================
   BADGES
========================================================= */

function criarBadgeStatusPrograma(
  pessoa
) {

  const statusOriginal =
    String(
      pessoa.statusPrograma || "-"
    ).trim();


  const status =
    statusPrograma(
      pessoa
    );


  let classe =
    "";


  if (
    estaAtivo(
      pessoa
    )
  ) {

    classe =
      "ativo";

  }

  else if (
    estaAtivoEscola(
      pessoa
    )
  ) {

    classe =
      "escola";

  }

  else if (
    status ===
      "desistencia"
  ) {

    classe =
      "desistencia";

  }

  else if (
    status ===
      "multi loss"

    ||

    status ===
      "training"
  ) {

    classe =
      "movimentacao";

  }

  else {

    classe =
      "inativo";

  }


  return `

    <span class="badge ${classe}">

      ${
        escapeHtml(
          statusOriginal
        )
      }

    </span>

  `;

}


function criarBadgeStatusHC(
  statusBase
) {

  const original =
    String(
      statusBase || "-"
    ).trim();


  const status =
    normalizarTexto(
      original
    );


  let classe =
    "hc-outro";


  if (
    status ===
      "ativo"
  ) {

    classe =
      "hc-ativo";

  }

  else if (
    status ===
      "inativo"
  ) {

    classe =
      "hc-inativo";

  }

  else if (
    status.includes(
      "ferias"
    )
  ) {

    classe =
      "hc-ferias";

  }


  return `

    <span class="badge ${classe}">

      ${
        escapeHtml(
          original
        )
      }

    </span>

  `;

}


function ehSim(
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
      "s"

    ||

    texto ===
      "yes"

    ||

    texto ===
      "1"

    ||

    texto ===
      "true"

  );

}


function criarBadgeSimNao(
  valor
) {

  const positivo =
    ehSim(
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
   TABELA DE CONSULTA
========================================================= */

function atualizarTabela() {

  const corpoTabela =
    document.getElementById(
      "tabelaMultiplicadores"
    );


  let dados =

    filtrarListaPorTurno(

      multiplicadores,

      turnoConsultaSelecionado

    );


  dados =
    filtrarPorStatus(
      dados
    );


  if (
    termoBusca
  ) {

    dados =

      dados.filter(

        pessoa => {


          const texto =

            normalizarTexto(

              `
              ${pessoa.nome}
              ${pessoa.teamLeader}
              ${pessoa.ldap}
              ${pessoa.areaMacro}
              ${pessoa.subArea}
              ${pessoa.processo}
              ${pessoa.turno}
              ${pessoa.statusBaseHC}
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


  dados.sort(

    (
      a,
      b
    ) =>

      String(
        a.nome
      ).localeCompare(

        String(
          b.nome
        ),

        "pt-BR"

      )

  );


  if (
    dados.length ===
    0
  ) {

    corpoTabela.innerHTML = `

      <tr class="sem-dados">

        <td colspan="15">

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
                escapeHtml(
                  pessoa.nome || "-"
                )
              }

            </strong>

          </td>


          <td>

            ${
              escapeHtml(
                pessoa.teamLeader || "-"
              )
            }

          </td>


          <td>

            ${
              criarBadgeStatusHC(
                pessoa.statusBaseHC
              )
            }

          </td>


          <td>

            ${
              criarBadgeStatusPrograma(
                pessoa
              )
            }

          </td>


          <td>

            <span class="badge-turno">

              ${
                escapeHtml(
                  normalizarTurno(
                    pessoa.turno
                  )
                  ||
                  "-"
                )
              }

            </span>

          </td>


          <td>

            ${
              escapeHtml(
                pessoa.cargo || "-"
              )
            }

          </td>


          <td>

            ${
              escapeHtml(
                pessoa.ldap || "-"
              )
            }

          </td>


          <td>

            ${
              escapeHtml(
                pessoa.areaMacro || "-"
              )
            }

          </td>


          <td>

            ${
              escapeHtml(
                pessoa.subArea || "-"
              )
            }

          </td>


          <td>

            ${
              escapeHtml(
                pessoa.processo || "-"
              )
            }

          </td>


          <td>

            ${
              escapeHtml(
                pessoa.escala || "-"
              )
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
              escapeHtml(
                pessoa.dataFormacao || "-"
              )
            }

          </td>


          <td>

            ${
              escapeHtml(
                obterMotivo(
                  pessoa
                )
              )
            }

          </td>

        </tr>

      `

    ).join("");

}


/* =========================================================
   ABAS
========================================================= */

function configurarAbas() {

  document

    .querySelectorAll(
      ".aba-dashboard"
    )

    .forEach(

      botao => {


        botao.addEventListener(

          "click",

          () => {


            const aba =
              botao.dataset.aba;


            document

              .querySelectorAll(
                ".aba-dashboard"
              )

              .forEach(

                item =>

                  item.classList.remove(
                    "ativa"
                  )

              );


            document

              .querySelectorAll(
                ".conteudo-aba"
              )

              .forEach(

                item =>

                  item.classList.remove(
                    "ativo"
                  )

              );


            botao.classList.add(
              "ativa"
            );


            document

              .getElementById(
                `aba-${aba}`
              )

              .classList.add(
                "ativo"
              );

          }

        );

      }

    );

}


/* =========================================================
   FILTROS
========================================================= */

function configurarFiltrosTurno() {

  document

    .querySelectorAll(
      ".botao-turno"
    )

    .forEach(

      botao => {


        botao.addEventListener(

          "click",

          () => {


            turnoSelecionado =
              botao.dataset.turno;


            document

              .querySelectorAll(
                ".botao-turno"
              )

              .forEach(

                item =>

                  item.classList.remove(
                    "ativo"
                  )

              );


            botao.classList.add(
              "ativo"
            );


            atualizarIndicadores();

          }

        );

      }

    );

}


function configurarFiltrosLideranca() {

  document

    .querySelectorAll(
      ".botao-turno-lideranca"
    )

    .forEach(

      botao => {


        botao.addEventListener(

          "click",

          () => {


            turnoLiderancaSelecionado =
              botao.dataset.turnoLideranca;


            document

              .querySelectorAll(
                ".botao-turno-lideranca"
              )

              .forEach(

                item =>

                  item.classList.remove(
                    "ativo"
                  )

              );


            botao.classList.add(
              "ativo"
            );


            atualizarTabelaLideranca();

          }

        );

      }

    );

}


function configurarFiltrosConsulta() {

  document

    .querySelectorAll(
      ".botao-turno-consulta"
    )

    .forEach(

      botao => {


        botao.addEventListener(

          "click",

          () => {


            turnoConsultaSelecionado =
              botao.dataset.turnoConsulta;


            document

              .querySelectorAll(
                ".botao-turno-consulta"
              )

              .forEach(

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


function configurarFiltrosStatus() {

  document

    .querySelectorAll(
      ".botao-status"
    )

    .forEach(

      botao => {


        botao.addEventListener(

          "click",

          () => {


            statusSelecionado =
              botao.dataset.status;


            document

              .querySelectorAll(
                ".botao-status"
              )

              .forEach(

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

  document

    .getElementById(
      "campoBusca"
    )

    .addEventListener(

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
   CARREGAMENTO E ERRO
========================================================= */

function mostrarCarregamento() {

  document.getElementById(
    "tabelaMultiplicadores"
  ).innerHTML = `

    <tr class="sem-dados">

      <td colspan="15">

        Carregando dados da planilha...

      </td>

    </tr>

  `;

}


function mostrarErro(
  mensagem
) {

  document.getElementById(
    "tabelaMultiplicadores"
  ).innerHTML = `

    <tr class="sem-dados">

      <td colspan="15">

        Não foi possível carregar os dados.

        <br><br>

        <small>

          ${
            escapeHtml(
              mensagem
            )
          }

        </small>

      </td>

    </tr>

  `;

}


/* =========================================================
   DATA
========================================================= */

function atualizarData() {

  document.getElementById(
    "ultimaAtualizacao"
  ).textContent =

    new Date().toLocaleString(

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

  atualizarTabelaLideranca();

  atualizarTabela();

}


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

document.addEventListener(

  "DOMContentLoaded",

  () => {


    configurarAbas();

    configurarFiltrosTurno();

    configurarFiltrosLideranca();

    configurarFiltrosConsulta();

    configurarFiltrosStatus();

    configurarBusca();

    carregarDados();

  }

);
