/* =========================================================
   DASHBOARD — PROGRAMA MULTIPLICADORES
========================================================= */

const API_URL =
  "https://script.google.com/a/macros/mercadolivre.com/s/AKfycbzortEzdw4UOxFqaqGIuxLC6sT-mf0yG5aMJbbCFHPk4ldG7HvX0PzlO178bNAZ_vySqg/exec";


/* =========================================================
   BASES
========================================================= */

let multiplicadores = [];
let multiplicadoresOficial = [];
let tlsSemMultis = [];
let registrosValidacao = [];


/* =========================================================
   ESTADO
========================================================= */

let turnoSelecionado = "todos";
let turnoLiderancaSelecionado = "todos";
let turnoConsultaSelecionado = "todos";

let statusSelecionado = "principal";

let termoBusca = "";

let filtroValidacao = "todos";
let termoBuscaValidacao = "";

let areaSelecionadaHC = "";


/* =========================================================
   TEXTO
========================================================= */

function normalizarTexto(texto) {

  return String(texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .toLowerCase()
    .trim();

}


function textoMaiusculo(texto) {

  const valor =
    String(texto || "").trim();

  return valor
    ? valor.toLocaleUpperCase("pt-BR")
    : "-";

}


function escapeHtml(texto) {

  return String(texto || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


function definirTexto(id, valor) {

  const elemento =
    document.getElementById(id);

  if (elemento) {
    elemento.textContent = valor;
  }

}


/* =========================================================
   TRANSFORMA BASE
========================================================= */

function transformarRegistro(item) {

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


function transformarRegistroOficial(item) {

  return {

    cad:
      item["CAD_LIDER"] || "",

    teamLeader:
      item["TEAM LEADER"] || "",

    ldap:
      item["LDAP_USER"] || "",

    nome:
      item["NOMBRE_MULTIPLICADOR"] || "",

    turno:
      item["LAST_TURNO"] || "",

    area:
      item["AREA_MADRE"] || "",

    multiplicadores:
      item["MULTIPLICADORES"] || ""

  };

}


function transformarTlSemMulti(item) {

  return {

    cad:
      item["CAD"] || "",

    teamLeader:
      item["TEAM LEADER"] || "",

    area:
      item["AREA_MADRE"] || "",

    totalEquipe:
      item["TOTAL_EQUIPO"] || "",

    totalMultis:
      item["TOTAL_MULTIPLICADORES"] || ""

  };

}


/* =========================================================
   CALLBACK
========================================================= */

window.receberDadosMultiplicadores =
  function(retorno) {

    try {

      if (
        !retorno ||
        !retorno.sucesso
      ) {

        throw new Error(
          retorno?.erro ||
          "A API não retornou os dados corretamente."
        );

      }


      multiplicadores =

        Array.isArray(
          retorno.dados
        )

          ?

          retorno.dados
            .map(
              transformarRegistro
            )
            .filter(
              pessoa =>
                String(
                  pessoa.nome || ""
                ).trim() !== ""
            )

          :

          [];


      multiplicadoresOficial =

        Array.isArray(
          retorno.dadosOficial
        )

          ?

          retorno.dadosOficial
            .map(
              transformarRegistroOficial
            )
            .filter(
              pessoa =>
                String(
                  pessoa.ldap || ""
                ).trim() !== ""
            )

          :

          [];


      tlsSemMultis =

        Array.isArray(
          retorno.tlsSemMultis
        )

          ?

          retorno.tlsSemMultis
            .map(
              transformarTlSemMulti
            )

          :

          [];


      atualizarData();

      atualizarDashboard();

    }

    catch (erro) {

      mostrarErro(
        erro.message
      );

    }

  };


/* =========================================================
   CARREGA API
========================================================= */

function carregarDados() {

  const anterior =
    document.getElementById(
      "api-multiplicadores"
    );


  if (anterior) {
    anterior.remove();
  }


  const script =
    document.createElement(
      "script"
    );


  script.id =
    "api-multiplicadores";


  script.src =
    API_URL +
    "?callback=receberDadosMultiplicadores" +
    "&t=" +
    Date.now();


  script.onerror =
    function() {

      mostrarErro(
        "Não foi possível conectar com a API da planilha."
      );

    };


  document.body.appendChild(
    script
  );

}


/* =========================================================
   STATUS
========================================================= */

function statusPrograma(pessoa) {

  return normalizarTexto(
    pessoa.statusPrograma
  );

}


function estaAtivo(pessoa) {

  return (
    statusPrograma(pessoa)
    ===
    "ativo"
  );

}


function estaAtivoEscola(pessoa) {

  const status =
    statusPrograma(pessoa);


  return (

    status === "ativo escola" ||

    status === "ativo para escola" ||

    status ===
    "ativo para escola de maquina"

  );

}


function estaNaVisaoPrincipal(pessoa) {

  return (
    estaAtivo(pessoa) ||
    estaAtivoEscola(pessoa)
  );

}


function statusHcAtivo(pessoa) {

  return (

    normalizarTexto(
      pessoa.statusBaseHC
    )

    ===

    "ativo"

  );

}


function estaNaConsultaInativos(pessoa) {

  const status =
    statusPrograma(pessoa);


  return (

    status === "inativo" ||

    status === "desistencia" ||

    status === "multi loss" ||

    status === "training"

  );

}


/* =========================================================
   TURNO
========================================================= */

function normalizarTurno(turno) {

  const valor =
    normalizarTexto(turno);


  if (
    valor === "t1" ||
    valor === "1" ||
    valor === "1 turno" ||
    valor === "1º turno" ||
    valor === "1o turno"
  ) {
    return "T1";
  }


  if (
    valor === "t2" ||
    valor === "2" ||
    valor === "2 turno" ||
    valor === "2º turno" ||
    valor === "2o turno"
  ) {
    return "T2";
  }


  if (
    valor === "t3" ||
    valor === "3" ||
    valor === "3 turno" ||
    valor === "3º turno" ||
    valor === "3o turno"
  ) {
    return "T3";
  }


  if (
    valor === "t4" ||
    valor === "4" ||
    valor === "4 turno" ||
    valor === "4º turno" ||
    valor === "4o turno"
  ) {
    return "T4";
  }


  if (
    valor === "t5" ||
    valor === "5" ||
    valor === "5 turno" ||
    valor === "5º turno" ||
    valor === "5o turno"
  ) {
    return "T5";
  }


  return String(
    turno || ""
  ).trim();

}


function filtrarListaPorTurno(
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

      normalizarTurno(
        pessoa.turno
      )

      ===

      turno

  );

}


/* =========================================================
   INDICADORES
========================================================= */

function atualizarIndicadores() {

  const baseInterna =

    filtrarListaPorTurno(

      multiplicadores,

      turnoSelecionado

    );


  const principal =

    baseInterna.filter(
      estaNaVisaoPrincipal
    );


  definirTexto(
    "totalMultiplicadores",
    principal.length
  );


  definirTexto(

    "totalAtivos",

    principal.filter(
      estaAtivo
    ).length

  );


  definirTexto(

    "totalEscola",

    principal.filter(
      estaAtivoEscola
    ).length

  );


  atualizarRatioOficial();

  atualizarDistribuicaoAreasHC();

}


/* =========================================================
   RATIO OFICIAL
========================================================= */

function atualizarRatioOficial() {

  const baseOficial =

    filtrarListaPorTurno(

      multiplicadoresOficial,

      turnoSelecionado

    );


  const multis =

    new Set(

      baseOficial
        .map(
          pessoa =>
            normalizarTexto(
              pessoa.ldap
            )
        )
        .filter(Boolean)

    );


  const lideres =

    new Set(

      baseOficial
        .map(
          pessoa =>
            normalizarTexto(
              pessoa.teamLeader
            )
        )
        .filter(Boolean)

    );


  const ratio =

    lideres.size > 0

      ?

      multis.size /
      lideres.size

      :

      0;


  definirTexto(

    "ratioGeral",

    lideres.size > 0

      ?

      ratio
        .toFixed(2)
        .replace(".", ",")

      :

      "-"

  );


  definirTexto(

    "ratioDetalhe",

    lideres.size > 0

      ?

      `${multis.size} multis oficiais ÷ ${lideres.size} líderes`

      :

      "Sem dados oficiais disponíveis"

  );

}


/* =========================================================
   BASE ATIVA HC
========================================================= */

function obterBaseAtivaHC() {

  return filtrarListaPorTurno(

    multiplicadores,

    turnoSelecionado

  ).filter(

    pessoa =>

      estaNaVisaoPrincipal(
        pessoa
      )

      &&

      statusHcAtivo(
        pessoa
      )

  );

}


/* =========================================================
   DISTRIBUIÇÃO ÁREAS
========================================================= */

function atualizarDistribuicaoAreasHC() {

  const container =
    document.getElementById(
      "cardsAreasHC"
    );


  if (!container) {
    return;
  }


  const ativosNoHC =
    obterBaseAtivaHC();


  definirTexto(

    "totalMultisAtivosHC",

    ativosNoHC.length

  );


  const mapa =
    new Map();


  ativosNoHC.forEach(

    pessoa => {

      const area =
        String(
          pessoa.areaMacro ||
          "SEM ÁREA"
        ).trim();


      const chave =
        normalizarTexto(area);


      if (!mapa.has(chave)) {

        mapa.set(

          chave,

          {

            nome:
              textoMaiusculo(area),

            total:
              0

          }

        );

      }


      mapa.get(chave).total++;

    }

  );


  const areas =

    Array
      .from(
        mapa.values()
      )
      .sort(
        (a, b) =>
          b.total - a.total
      );


  container.innerHTML =

    areas
      .map(

        area => `

          <article
            class="card-area-hc ${
              normalizarTexto(
                area.nome
              )
              ===
              normalizarTexto(
                areaSelecionadaHC
              )
                ?
                "selecionado"
                :
                ""
            }"
            data-area="${
              escapeHtml(
                area.nome
              )
            }"
          >

            <span>
              ${
                escapeHtml(
                  area.nome
                )
              }
            </span>


            <strong>
              ${area.total}
            </strong>


            <small>
              Clique para detalhar os processos
            </small>

          </article>

        `

      )
      .join("");


  configurarCliqueAreas();


  if (
    areaSelecionadaHC
  ) {

    atualizarDetalhamentoProcessos(
      areaSelecionadaHC
    );

  }

}


/* =========================================================
   CLIQUE NOS CARDS DE ÁREA
========================================================= */

function configurarCliqueAreas() {

  document
    .querySelectorAll(
      ".card-area-hc[data-area]"
    )
    .forEach(

      card => {

        card.addEventListener(

          "click",

          () => {

            areaSelecionadaHC =
              card.dataset.area;


            atualizarDistribuicaoAreasHC();

          }

        );

      }

    );

}


/* =========================================================
   DETALHAMENTO POR PROCESSO
========================================================= */

function atualizarDetalhamentoProcessos(
  area
) {

  const bloco =
    document.getElementById(
      "detalhamentoProcessos"
    );


  const container =
    document.getElementById(
      "cardsProcessosArea"
    );


  if (
    !bloco ||
    !container
  ) {
    return;
  }


  const base =

    obterBaseAtivaHC()

      .filter(

        pessoa =>

          normalizarTexto(
            pessoa.areaMacro
          )

          ===

          normalizarTexto(
            area
          )

      );


  const mapa =
    new Map();


  base.forEach(

    pessoa => {

      const processo =
        String(
          pessoa.processo ||
          "SEM PROCESSO"
        ).trim();


      const chave =
        normalizarTexto(
          processo
        );


      if (!mapa.has(chave)) {

        mapa.set(

          chave,

          {

            nome:
              textoMaiusculo(
                processo
              ),

            total:
              0

          }

        );

      }


      mapa.get(
        chave
      ).total++;

    }

  );


  const processos =

    Array
      .from(
        mapa.values()
      )
      .sort(
        (a, b) =>
          b.total - a.total
      );


  definirTexto(

    "tituloDetalhamentoArea",

    textoMaiusculo(area)

  );


  container.innerHTML =

    processos
      .map(

        processo => `

          <article class="card-processo-area">

            <span>

              ${
                escapeHtml(
                  processo.nome
                )
              }

            </span>


            <strong>

              ${processo.total}

            </strong>

          </article>

        `

      )
      .join("");


  bloco.hidden =
    false;

}


/* =========================================================
   FECHAR DETALHAMENTO
========================================================= */

function configurarFecharDetalhamento() {

  const botao =

    document.getElementById(
      "fecharDetalhamentoProcessos"
    );


  if (!botao) {
    return;
  }


  botao.addEventListener(

    "click",

    () => {

      areaSelecionadaHC =
        "";


      const bloco =

        document.getElementById(
          "detalhamentoProcessos"
        );


      if (bloco) {
        bloco.hidden = true;
      }


      atualizarDistribuicaoAreasHC();

    }

  );

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
              )

              ===

              turno

          )

          .filter(
            estaNaVisaoPrincipal
          );


      definirTexto(

        `total${turno}`,

        base.length

      );


      definirTexto(

        `ativos${turno}`,

        base.filter(
          estaAtivo
        ).length

      );


      definirTexto(

        `escola${turno}`,

        base.filter(
          estaAtivoEscola
        ).length

      );

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


  if (!corpo) {
    return;
  }


  let base =

    filtrarListaPorTurno(

      multiplicadores,

      turnoLiderancaSelecionado

    ).filter(
      estaNaVisaoPrincipal
    );


  const mapa =
    new Map();


  base.forEach(

    pessoa => {

      const nome =
        String(
          pessoa.teamLeader || ""
        ).trim();


      if (!nome) {
        return;
      }


      const chave =
        normalizarTexto(nome);


      if (!mapa.has(chave)) {

        mapa.set(

          chave,

          {

            nome:
              textoMaiusculo(nome),

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
        mapa.get(chave);


      lider.total++;


      if (estaAtivo(pessoa)) {
        lider.ativos++;
      }


      if (
        estaAtivoEscola(pessoa)
      ) {
        lider.escola++;
      }

    }

  );


  const lideres =

    Array
      .from(
        mapa.values()
      )
      .sort(
        (a, b) =>
          b.total - a.total
      );


  corpo.innerHTML =

    lideres
      .map(

        (
          lider,
          indice
        ) => `

          <tr>

            <td>
              ${indice + 1}
            </td>

            <td>
              ${
                escapeHtml(
                  lider.nome
                )
              }
            </td>

            <td>
              ${lider.total}
            </td>

            <td>
              ${lider.ativos}
            </td>

            <td>
              ${lider.escola}
            </td>

          </tr>

        `

      )
      .join("");

}


/* =========================================================
   TLS SEM MULTIS
========================================================= */

function atualizarTlsSemMultis() {

  const corpo =
    document.getElementById(
      "tabelaTlsSemMultis"
    );


  if (!corpo) {
    return;
  }


  const lista =

    tlsSemMultis.filter(

      item =>

        Number(
          String(
            item.totalMultis || "0"
          ).replace(",", ".")
        )

        ===

        0

    );


  definirTexto(

    "totalTlsSemMultis",

    lista.length

  );


  corpo.innerHTML =

    lista
      .map(

        item => `

          <tr>

            <td>
              ${
                escapeHtml(
                  textoMaiusculo(
                    item.teamLeader
                  )
                )
              }
            </td>

            <td>
              ${
                escapeHtml(
                  textoMaiusculo(
                    item.area
                  )
                )
              }
            </td>

            <td>
              ${
                escapeHtml(
                  item.totalEquipe || "0"
                )
              }
            </td>

            <td>
              0
            </td>

          </tr>

        `

      )
      .join("");

}


/* =========================================================
   VALIDAÇÃO
========================================================= */

function construirValidacao() {

  const base =
    new Map();


  multiplicadores
    .filter(
      estaNaVisaoPrincipal
    )
    .forEach(

      pessoa => {

        const ldap =
          normalizarTexto(
            pessoa.ldap
          );


        if (ldap) {
          base.set(
            ldap,
            pessoa
          );
        }

      }

    );


  const oficial =
    new Map();


  multiplicadoresOficial
    .forEach(

      pessoa => {

        const ldap =
          normalizarTexto(
            pessoa.ldap
          );


        if (ldap) {
          oficial.set(
            ldap,
            pessoa
          );
        }

      }

    );


  const ldaps =

    new Set([

      ...base.keys(),

      ...oficial.keys()

    ]);


  registrosValidacao =

    Array
      .from(
        ldaps
      )
      .map(

        ldap => {

          const b =
            base.get(ldap);


          const o =
            oficial.get(ldap);


          let tipo =
            "alinhado";


          if (
            b &&
            !o
          ) {
            tipo =
              "base-sem-oficial";
          }


          if (
            !b &&
            o
          ) {
            tipo =
              "oficial-sem-base";
          }


          return {

            tipo,

            nome:
              b?.nome ||
              o?.nome ||
              "-",

            ldap:
              b?.ldap ||
              o?.ldap ||
              "-",

            statusBase:
              b?.statusPrograma ||
              "FORA DOS ATIVOS",

            statusCad:
              b?.statusBaseHC ||
              "-",

            noOficial:
              o
                ?
                "SIM"
                :
                "NÃO",

            teamLeaderBase:
              b?.teamLeader ||
              "-",

            turnoBase:
              b?.turno ||
              "-",

            teamLeaderOficial:
              o?.teamLeader ||
              "-",

            areaOficial:
              o?.area ||
              "-"

          };

        }

      );

}


/* =========================================================
   ATUALIZA VALIDAÇÃO
========================================================= */

function atualizarValidacao() {

  construirValidacao();


  definirTexto(

    "validacaoTotalBase",

    new Set(

      multiplicadores
        .filter(
          estaNaVisaoPrincipal
        )
        .map(
          pessoa =>
            normalizarTexto(
              pessoa.ldap
            )
        )
        .filter(Boolean)

    ).size

  );


  definirTexto(

    "validacaoTotalOficial",

    new Set(

      multiplicadoresOficial
        .map(
          pessoa =>
            normalizarTexto(
              pessoa.ldap
            )
        )
        .filter(Boolean)

    ).size

  );


  definirTexto(

    "validacaoTotalAlinhados",

    registrosValidacao
      .filter(
        item =>
          item.tipo ===
          "alinhado"
      )
      .length

  );


  definirTexto(

    "validacaoTotalDivergencias",

    registrosValidacao
      .filter(
        item =>
          item.tipo !==
          "alinhado"
      )
      .length

  );


  atualizarTabelaValidacao();

}


/* =========================================================
   TABELA VALIDAÇÃO
========================================================= */

function atualizarTabelaValidacao() {

  const corpo =
    document.getElementById(
      "corpoTabelaValidacao"
    );


  if (!corpo) {
    return;
  }


  let dados =
    [...registrosValidacao];


  if (
    filtroValidacao !==
    "todos"
  ) {

    dados =
      dados.filter(

        item =>
          item.tipo ===
          filtroValidacao

      );

  }


  if (
    termoBuscaValidacao
  ) {

    dados =
      dados.filter(

        item =>

          normalizarTexto(

            `
            ${item.nome}
            ${item.ldap}
            ${item.teamLeaderBase}
            ${item.teamLeaderOficial}
            ${item.statusBase}
            ${item.statusCad}
            ${item.areaOficial}
            `

          ).includes(
            termoBuscaValidacao
          )

      );

  }


  corpo.innerHTML =

    dados
      .map(

        item => `

          <tr>

            <td>
              ${
                criarBadgeValidacao(
                  item
                )
              }
            </td>

            <td>
              ${
                escapeHtml(
                  textoMaiusculo(
                    item.nome
                  )
                )
              }
            </td>

            <td>
              ${
                escapeHtml(
                  textoMaiusculo(
                    item.ldap
                  )
                )
              }
            </td>

            <td>
              ${
                escapeHtml(
                  textoMaiusculo(
                    item.statusBase
                  )
                )
              }
            </td>

            <td>
              ${
                criarBadgeStatusHC(
                  item.statusCad
                )
              }
            </td>

            <td>
              ${
                item.noOficial
              }
            </td>

            <td>
              ${
                escapeHtml(
                  textoMaiusculo(
                    item.teamLeaderBase
                  )
                )
              }
            </td>

            <td>
              ${
                escapeHtml(
                  normalizarTurno(
                    item.turnoBase
                  )
                )
              }
            </td>

            <td>
              ${
                escapeHtml(
                  textoMaiusculo(
                    item.teamLeaderOficial
                  )
                )
              }
            </td>

            <td>
              ${
                escapeHtml(
                  textoMaiusculo(
                    item.areaOficial
                  )
                )
              }
            </td>

          </tr>

        `

      )
      .join("");

}


/* =========================================================
   BADGES
========================================================= */

function criarBadgeValidacao(
  item
) {

  let texto =
    "✓ ALINHADO";


  if (
    item.tipo ===
    "base-sem-oficial"
  ) {
    texto =
      "⚠ ATIVO SEM OFICIAL";
  }


  if (
    item.tipo ===
    "oficial-sem-base"
  ) {
    texto =
      "✕ OFICIAL FORA DOS ATIVOS";
  }


  return `

    <span class="badge-validacao ${item.tipo}">

      ${texto}

    </span>

  `;

}


function criarBadgeStatusHC(
  valor
) {

  const status =
    normalizarTexto(valor);


  let classe =
    "hc-outro";


  if (
    status === "ativo"
  ) {
    classe =
      "hc-ativo";
  }


  if (
    status === "inativo"
  ) {
    classe =
      "hc-inativo";
  }


  if (
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


function criarBadgeStatusPrograma(
  pessoa
) {

  let classe =
    "inativo";


  if (
    estaAtivo(pessoa)
  ) {
    classe =
      "ativo";
  }


  if (
    estaAtivoEscola(pessoa)
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


function criarBadgeSimNao(
  valor
) {

  const sim =

    normalizarTexto(
      valor
    )

    ===

    "sim";


  return `

    <span class="badge ${
      sim
        ?
        "sim"
        :
        "nao"
    }">

      ${
        sim
          ?
          "SIM"
          :
          "NÃO"
      }

    </span>

  `;

}


/* =========================================================
   CONSULTA
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


function obterMotivo(
  pessoa
) {

  if (
    String(
      pessoa.motivo || ""
    ).trim()
  ) {

    return pessoa.motivo;

  }


  if (

    statusPrograma(pessoa) ===
    "multi loss"

    ||

    statusPrograma(pessoa) ===
    "training"

  ) {

    return "MOVIMENTAÇÃO DE ÁREA";

  }


  return "-";

}


function atualizarTabela() {

  const corpo =
    document.getElementById(
      "tabelaMultiplicadores"
    );


  if (!corpo) {
    return;
  }


  let dados =

    filtrarListaPorTurno(

      multiplicadores,

      turnoConsultaSelecionado

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
            ${pessoa.statusBaseHC}
            ${pessoa.statusPrograma}
            ${pessoa.cargo}
            ${pessoa.escala}
            ${pessoa.dataFormacao}
            ${pessoa.motivo}
            `

          ).includes(
            termoBusca
          )

      );

  }

  else {

    dados =
      filtrarPorStatus(
        dados
      );

  }


  corpo.innerHTML =

    dados
      .map(

        pessoa => `

          <tr>

            <td>
              ${
                escapeHtml(
                  textoMaiusculo(
                    pessoa.nome
                  )
                )
              }
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
              ${
                normalizarTurno(
                  pessoa.turno
                )
              }
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
                  pessoa.dataFormacao ||
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

      )
      .join("");

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


            const conteudo =

              document.getElementById(

                `aba-${aba}`

              );


            if (conteudo) {

              conteudo.classList.add(
                "ativo"
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
              botao.dataset
                .turnoLideranca;


            atualizarTabelaLideranca();

          }

        );

      }

    );


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
              botao.dataset
                .turnoConsulta;


            atualizarTabela();

          }

        );

      }

    );


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


            atualizarTabela();

          }

        );

      }

    );


  document
    .querySelectorAll(
      ".botao-validacao"
    )
    .forEach(

      botao => {

        botao.addEventListener(

          "click",

          () => {

            filtroValidacao =
              botao.dataset.validacao;


            atualizarTabelaValidacao();

          }

        );

      }

    );

}


/* =========================================================
   BUSCAS
========================================================= */

function configurarBusca() {

  const campo =

    document.getElementById(
      "campoBusca"
    );


  if (campo) {

    campo.addEventListener(

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


  const campoValidacao =

    document.getElementById(
      "campoBuscaValidacao"
    );


  if (campoValidacao) {

    campoValidacao.addEventListener(

      "input",

      evento => {

        termoBuscaValidacao =
          normalizarTexto(
            evento.target.value
          );


        atualizarTabelaValidacao();

      }

    );

  }

}


/* =========================================================
   CALENDÁRIO
========================================================= */

function configurarCalendario() {

  const imagem =

    document.getElementById(
      "imagemCalendarioFolgas"
    );


  const erro =

    document.getElementById(
      "erroCalendario"
    );


  if (!imagem) {
    return;
  }


  imagem.addEventListener(

    "error",

    () => {

      imagem.style.display =
        "none";


      if (erro) {

        erro.hidden =
          false;

      }

    }

  );

}


/* =========================================================
   DATA
========================================================= */

function atualizarData() {

  definirTexto(

    "ultimaAtualizacao",

    new Date()
      .toLocaleString(
        "pt-BR"
      )

  );

}


/* =========================================================
   DASHBOARD
========================================================= */

function atualizarDashboard() {

  atualizarIndicadores();

  atualizarTurnos();

  atualizarTabelaLideranca();

  atualizarTlsSemMultis();

  atualizarValidacao();

  atualizarTabela();

}


/* =========================================================
   ERRO
========================================================= */

function mostrarErro(
  mensagem
) {

  console.error(
    mensagem
  );


  definirTexto(

    "ultimaAtualizacao",

    "Erro ao carregar"

  );

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

    configurarCalendario();

    configurarFecharDetalhamento();

    carregarDados();

  }

);
