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
   FILTROS
========================================================= */

let turnoSelecionado =
  "todos";

let statusSelecionado =
  "principal";

let termoBusca =
  "";

let liderSelecionado =
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


      console.log(

        "Base carregada:",

        multiplicadores.length,

        "registros"

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


  if (
    valor === "t1"
    ||
    valor.includes(
      "1 turno"
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
  ) {

    return "T2";

  }


  if (
    valor === "t3"
    ||
    valor.includes(
      "3 turno"
    )
  ) {

    return "T3";

  }


  if (
    valor === "t4"
    ||
    valor.includes(
      "4 turno"
    )
  ) {

    return "T4";

  }


  if (
    valor === "t5"
    ||
    valor.includes(
      "5 turno"
    )
  ) {

    return "T5";

  }


  return String(
    turno || ""
  ).trim();

}


/* =========================================================
   FILTRO DE TURNO
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
   FILTRO DE LÍDER
========================================================= */

function filtrarPorLider(
  lista
) {

  if (
    !liderSelecionado
  ) {

    return lista;

  }


  return lista.filter(

    pessoa =>

      normalizarTexto(
        pessoa.teamLeader
      ) ===
      normalizarTexto(
        liderSelecionado
      )

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


  const lideresValidos =
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
    lideresValidos.size;


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

      ? `1:${ratio.toFixed(2).replace(".", ",")}`

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
   DISTRIBUIÇÃO POR LIDERANÇA
========================================================= */

function atualizarLideres() {

  const container =
    document.getElementById(
      "listaLideres"
    );


  let base =
    filtrarPorTurno(
      multiplicadores
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


      const registro =
        mapa.get(
          chave
        );


      registro.total +=
        1;


      if (
        estaAtivo(
          pessoa
        )
      ) {

        registro.ativos +=
          1;

      }


      if (
        estaAtivoEscola(
          pessoa
        )
      ) {

        registro.escola +=
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

    container.innerHTML = `

      <div class="estado-carregando">

        Nenhum líder encontrado.

      </div>

    `;


    return;

  }


  container.innerHTML =

    lideres.map(

      lider => {


        const selecionado =

          normalizarTexto(
            lider.nome
          ) ===

          normalizarTexto(
            liderSelecionado
          );


        return `

          <article

            class="
              card-lider
              ${
                selecionado
                  ? "selecionado"
                  : ""
              }
            "

            data-lider="
              ${escapeHtml(
                lider.nome
              )}
            "

          >


            <div class="lider-topo">


              <div class="lider-nome">

                ${
                  escapeHtml(
                    lider.nome
                  )
                }

              </div>


              <div class="lider-total">

                ${lider.total}

              </div>


            </div>


            <div class="lider-detalhes">


              <div class="lider-detalhe">

                <span>
                  Ativos
                </span>

                <strong>

                  ${lider.ativos}

                </strong>

              </div>


              <div class="lider-detalhe">

                <span>
                  Ativo Escola
                </span>

                <strong>

                  ${lider.escola}

                </strong>

              </div>


            </div>


          </article>

        `;

      }

    ).join("");


  configurarCliqueLider();

}


/* =========================================================
   CLIQUE NO LÍDER
========================================================= */

function configurarCliqueLider() {

  document

    .querySelectorAll(
      ".card-lider"
    )

    .forEach(

      card => {


        card.addEventListener(

          "click",

          () => {


            const lider =
              card.dataset.lider;


            if (

              normalizarTexto(
                liderSelecionado
              ) ===

              normalizarTexto(
                lider
              )

            ) {

              liderSelecionado =
                "";

            }

            else {

              liderSelecionado =
                lider;

            }


            atualizarLideres();

            atualizarTabela();

            atualizarBotaoLimparLider();

          }

        );

      }

    );

}


/* =========================================================
   BOTÃO LIMPAR LÍDER
========================================================= */

function atualizarBotaoLimparLider() {

  const botao =
    document.getElementById(
      "limparFiltroLider"
    );


  if (
    liderSelecionado
  ) {

    botao.classList.remove(
      "oculto"
    );

  }

  else {

    botao.classList.add(
      "oculto"
    );

  }

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
   BADGE STATUS PROGRAMA
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


/* =========================================================
   BADGE STATUS HC
========================================================= */

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


/* =========================================================
   SIM / NÃO
========================================================= */

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
    filtrarPorLider(
      dados
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
   CARREGAMENTO / ERRO
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
   FILTRO TURNO
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


            liderSelecionado =
              "";


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


            atualizarDashboard();

          }

        );

      }

    );

}


/* =========================================================
   FILTRO STATUS
========================================================= */

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
   LIMPAR LÍDER
========================================================= */

function configurarLimparLider() {

  document

    .getElementById(
      "limparFiltroLider"
    )

    .addEventListener(

      "click",

      () => {


        liderSelecionado =
          "";


        atualizarLideres();

        atualizarTabela();

        atualizarBotaoLimparLider();

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

  atualizarLideres();

  atualizarTabela();

  atualizarBotaoLimparLider();

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

    configurarLimparLider();

    carregarDados();

  }

);
