/* =========================================================
   DASHBOARD — PROGRAMA MULTIPLICADORES
========================================================= */

const API_URL =
  "https://script.google.com/a/macros/mercadolivre.com/s/AKfycbzortEzdw4UOxFqaqGIuxLC6sT-mf0yG5aMJbbCFHPk4ldG7HvX0PzlO178bNAZ_vySqg/exec";


let multiplicadores =
  [];

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
   TEXTO
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


function textoMaiusculo(
  texto
) {

  return String(
    texto || "-"
  )

    .trim()

    .toLocaleUpperCase(
      "pt-BR"
    );

}


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
   MAPA
========================================================= */

function transformarRegistro(
  item
) {

  return {

    nome:
      item["Nome do Representante"] || "",

    teamLeader:
      item["Team Leader"] || "",

    statusBaseHC:
      item["Status Base HC"] || "",

    statusPrograma:
      item["Status Treinamento"] || "",

    turno:
      item["Turno"] || "",

    cargo:
      item["Cargo"] || "",

    ldap:
      item["LDAP"] || "",

    areaMacro:
      item["Área Macro"] || "",

    subArea:
      item["Sub Área"] || "",

    processo:
      item["Processo Ajustado"] || "",

    escala:
      item["ESCALA"] || "",

    decola:
      item["Decola"] || "",

    bolhaMulti:
      item["Tem bolha de Multi"] || "",

    dataFormacao:
      item["Data de Formação"] || "",

    motivo:
      item["Motivo"] || ""

  };

}


/* =========================================================
   JSONP
========================================================= */

function carregarDados() {

  const callbackName =
    "receberDadosMultiplicadores";


  window[
    callbackName
  ] = function (
    retorno
  ) {

    if (
      !retorno
      ||
      !retorno.sucesso
    ) {

      mostrarErro(
        "Não foi possível carregar a base."
      );

      return;

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


    setTimeout(

      configurarScrollSincronizado,

      100

    );

  };


  const script =
    document.createElement(
      "script"
    );


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

  return (
    statusPrograma(
      pessoa
    ) ===
    "ativo escola"
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


  if (valor === "t1") return "T1";
  if (valor === "t2") return "T2";
  if (valor === "t3") return "T3";
  if (valor === "t4") return "T4";
  if (valor === "t5") return "T5";


  return String(
    turno || ""
  ).trim();

}


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

  const base =

    filtrarListaPorTurno(

      multiplicadores,

      turnoSelecionado

    );


  const principal =

    base.filter(
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
   TURNOS
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


      const base =

        multiplicadores

          .filter(

            pessoa =>

              normalizarTurno(
                pessoa.turno
              ) ===
              turno

          )

          .filter(
            estaNaVisaoPrincipal
          );


      const ativos =
        base.filter(
          estaAtivo
        );


      const escola =
        base.filter(
          estaAtivoEscola
        );


      document.getElementById(
        `total${turno}`
      ).textContent =
        base.length;


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
   LIDERANÇA
========================================================= */

function atualizarTabelaLideranca() {

  const corpo =
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

        textoMaiusculo(
          pessoa.teamLeader
        );


      if (
        !pessoa.teamLeader
      ) {

        return;

      }


      const chave =
        normalizarTexto(
          pessoa.teamLeader
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


      lider.total++;


      if (
        estaAtivo(
          pessoa
        )
      ) {

        lider.ativos++;

      }


      if (
        estaAtivoEscola(
          pessoa
        )
      ) {

        lider.escola++;

      }

    }

  );


  const lideres =

    Array.from(
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


  corpo.innerHTML =

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

            <strong>

              ${lider.total}

            </strong>

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
   STATUS
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

  if (
    pessoa.motivo
  ) {

    return pessoa.motivo;

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

    return "MOVIMENTAÇÃO DE ÁREA";

  }


  return "-";

}


/* =========================================================
   BADGES
========================================================= */

function criarBadgeStatusPrograma(
  pessoa
) {

  let classe =
    "inativo";


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


  return `

    <span class="badge ${classe}">

      ${
        escapeHtml(
          textoMaiusculo(
            pessoa.statusPrograma
          )
        )
      }

    </span>

  `;

}


function criarBadgeStatusHC(
  valor
) {

  const status =
    normalizarTexto(
      valor
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
          textoMaiusculo(
            valor
          )
        )
      }

    </span>

  `;

}


function criarBadgeSimNao(
  valor
) {

  const sim =

    normalizarTexto(
      valor
    ) ===
    "sim";


  return `

    <span class="badge ${
      sim
        ? "sim"
        : "nao"
    }">

      ${
        sim
          ? "SIM"
          : "NÃO"
      }

    </span>

  `;

}


/* =========================================================
   CONSULTA
========================================================= */

function atualizarTabela() {

  const corpo =
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

        pessoa =>

          normalizarTexto(

            `
            ${pessoa.nome}
            ${pessoa.teamLeader}
            ${pessoa.ldap}
            ${pessoa.areaMacro}
            ${pessoa.subArea}
            ${pessoa.processo}
            `

          ).includes(
            termoBusca
          )

      );

  }


  corpo.innerHTML =

    dados.map(

      pessoa => `

        <tr>


          <td>

            <strong>

              ${
                escapeHtml(
                  textoMaiusculo(
                    pessoa.nome
                  )
                )
              }

            </strong>

          </td>


          <td>

            ${
              escapeHtml(
                textoMaiusculo(
                  pessoa.teamLeader
                )
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
                normalizarTurno(
                  pessoa.turno
                )
              }

            </span>

          </td>


          <td>

            ${
              escapeHtml(
                textoMaiusculo(
                  pessoa.cargo
                )
              )
            }

          </td>


          <td>

            ${
              escapeHtml(
                textoMaiusculo(
                  pessoa.ldap
                )
              )
            }

          </td>


          <td>

            ${
              escapeHtml(
                textoMaiusculo(
                  pessoa.areaMacro
                )
              )
            }

          </td>


          <td>

            ${
              escapeHtml(
                textoMaiusculo(
                  pessoa.subArea
                )
              )
            }

          </td>


          <td>

            ${
              escapeHtml(
                textoMaiusculo(
                  pessoa.processo
                )
              )
            }

          </td>


          <td>

            ${
              escapeHtml(
                textoMaiusculo(
                  pessoa.escala
                )
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
                pessoa.dataFormacao
                ||
                "-"
              )
            }

          </td>


          <td>

            ${
              escapeHtml(
                textoMaiusculo(
                  obterMotivo(
                    pessoa
                  )
                )
              )
            }

          </td>


        </tr>

      `

    ).join("");


  setTimeout(

    atualizarLarguraScrollSuperior,

    50

  );

}


/* =========================================================
   SCROLL SINCRONIZADO
========================================================= */

function configurarScrollSincronizado() {

  const superior =
    document.getElementById(
      "scrollSuperior"
    );


  const tabela =
    document.getElementById(
      "tabelaScroll"
    );


  if (
    !superior
    ||
    !tabela
  ) {

    return;

  }


  let sincronizandoSuperior =
    false;

  let sincronizandoTabela =
    false;


  superior.addEventListener(

    "scroll",

    () => {


      if (
        sincronizandoTabela
      ) {

        sincronizandoTabela =
          false;

        return;

      }


      sincronizandoSuperior =
        true;


      tabela.scrollLeft =
        superior.scrollLeft;

    }

  );


  tabela.addEventListener(

    "scroll",

    () => {


      if (
        sincronizandoSuperior
      ) {

        sincronizandoSuperior =
          false;

        return;

      }


      sincronizandoTabela =
        true;


      superior.scrollLeft =
        tabela.scrollLeft;

    }

  );


  atualizarLarguraScrollSuperior();

}


/* =========================================================
   LARGURA DO SCROLL SUPERIOR
========================================================= */

function atualizarLarguraScrollSuperior() {

  const tabela =
    document.getElementById(
      "tabelaConsulta"
    );


  const conteudo =
    document.getElementById(
      "scrollSuperiorConteudo"
    );


  if (
    !tabela
    ||
    !conteudo
  ) {

    return;

  }


  conteudo.style.width =

    tabela.scrollWidth
    +
    "px";

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


            if (
              aba ===
              "consulta"
            ) {

              setTimeout(

                atualizarLarguraScrollSuperior,

                100

              );

            }

          }

        );

      }

    );

}


/* =========================================================
   FILTROS
========================================================= */

function configurarFiltros() {

  document

    .querySelectorAll(
      ".botao-turno"
    )

    .forEach(

      botao =>

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

        )

    );


  document

    .querySelectorAll(
      ".botao-turno-lideranca"
    )

    .forEach(

      botao =>

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

        )

    );


  document

    .querySelectorAll(
      ".botao-turno-consulta"
    )

    .forEach(

      botao =>

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

        )

    );


  document

    .querySelectorAll(
      ".botao-status"
    )

    .forEach(

      botao =>

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

        )

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
   DATA
========================================================= */

function atualizarData() {

  document.getElementById(
    "ultimaAtualizacao"
  ).textContent =

    new Date().toLocaleString(
      "pt-BR"
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
   ERRO
========================================================= */

function mostrarErro(
  mensagem
) {

  document.getElementById(
    "tabelaMultiplicadores"
  ).innerHTML = `

    <tr class="sem-dados">

      <td colspan="15">

        ${
          escapeHtml(
            mensagem
          )
        }

      </td>

    </tr>

  `;

}


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

document.addEventListener(

  "DOMContentLoaded",

  () => {


    configurarAbas();

    configurarFiltros();

    configurarBusca();

    configurarScrollSincronizado();

    carregarDados();


    window.addEventListener(

      "resize",

      atualizarLarguraScrollSuperior

    );

  }

);
