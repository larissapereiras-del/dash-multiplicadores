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
   FILTROS
========================================================= */

let turnoSelecionado = "todos";
let turnoLiderancaSelecionado = "todos";
let turnoConsultaSelecionado = "todos";
let statusSelecionado = "principal";
let termoBusca = "";
let filtroValidacao = "todos";
let termoBuscaValidacao = "";


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
   TRANSFORMA BASE VALIDADOS
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


/* =========================================================
   TRANSFORMA DASH OFICIAL
========================================================= */

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


/* =========================================================
   TRANSFORMA TL SEM MULTI
========================================================= */

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
   CALLBACK JSONP
========================================================= */

window.receberDadosMultiplicadores =
  function(retorno) {

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

        Array.isArray(retorno.dados)

          ? retorno.dados
              .map(transformarRegistro)
              .filter(
                pessoa =>
                  String(pessoa.nome || "").trim() !== ""
              )

          : [];


      multiplicadoresOficial =

        Array.isArray(retorno.dadosOficial)

          ? retorno.dadosOficial
              .map(transformarRegistroOficial)
              .filter(
                pessoa =>
                  String(pessoa.ldap || "").trim() !== ""
              )

          : [];


      tlsSemMultis =

        Array.isArray(retorno.tlsSemMultis)

          ? retorno.tlsSemMultis
              .map(transformarTlSemMulti)

          : [];


      atualizarData();
      atualizarDashboard();

    }

    catch (erro) {

      console.error(erro);

      mostrarErro(
        erro.message
      );

    }

  };


/* =========================================================
   CARREGA API
========================================================= */

function carregarDados() {

  const scriptAnterior =
    document.getElementById(
      "api-multiplicadores"
    );


  if (scriptAnterior) {
    scriptAnterior.remove();
  }


  const script =
    document.createElement("script");


  script.id =
    "api-multiplicadores";


  script.src =
    API_URL
    +
    "?callback=receberDadosMultiplicadores"
    +
    "&t="
    +
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
    status === "ativo escola"
    ||
    status === "ativo para escola"
    ||
    status === "ativo para escola de maquina"
  );

}


function estaNaVisaoPrincipal(pessoa) {

  return (
    estaAtivo(pessoa)
    ||
    estaAtivoEscola(pessoa)
  );

}


function estaNaConsultaInativos(pessoa) {

  const status =
    statusPrograma(pessoa);


  return (
    status === "inativo"
    ||
    status === "desistencia"
    ||
    status === "multi loss"
    ||
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
    valor === "t1"
    ||
    valor === "1"
    ||
    valor === "1 turno"
    ||
    valor === "1º turno"
    ||
    valor === "1o turno"
  ) {
    return "T1";
  }


  if (
    valor === "t2"
    ||
    valor === "2"
    ||
    valor === "2 turno"
    ||
    valor === "2º turno"
    ||
    valor === "2o turno"
  ) {
    return "T2";
  }


  if (
    valor === "t3"
    ||
    valor === "3"
    ||
    valor === "3 turno"
    ||
    valor === "3º turno"
    ||
    valor === "3o turno"
  ) {
    return "T3";
  }


  if (
    valor === "t4"
    ||
    valor === "4"
    ||
    valor === "4 turno"
    ||
    valor === "4º turno"
    ||
    valor === "4o turno"
  ) {
    return "T4";
  }


  if (
    valor === "t5"
    ||
    valor === "5"
    ||
    valor === "5 turno"
    ||
    valor === "5º turno"
    ||
    valor === "5o turno"
  ) {
    return "T5";
  }


  return String(
    turno || ""
  ).trim();

}


/* =========================================================
   FILTRO POR TURNO
========================================================= */

function filtrarListaPorTurno(
  lista,
  turno
) {

  if (turno === "todos") {
    return lista;
  }


  return lista.filter(

    pessoa =>
      normalizarTurno(
        pessoa.turno
      ) === turno

  );

}


/* =========================================================
   VISÃO GERAL
========================================================= */

function atualizarIndicadores() {

  /* =======================================================
     CARDS DA NOSSA BASE
  ======================================================= */

  const baseInterna =

    filtrarListaPorTurno(

      multiplicadores,

      turnoSelecionado

    );


  const principal =

    baseInterna.filter(
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


  definirTexto(
    "totalMultiplicadores",
    principal.length
  );


  definirTexto(
    "totalAtivos",
    ativos.length
  );


  definirTexto(
    "totalEscola",
    escola.length
  );


  /* =======================================================
     RATIO — SOMENTE DASH OFICIAL
  ======================================================= */

  const baseOficialFiltrada =

    filtrarListaPorTurno(

      multiplicadoresOficial,

      turnoSelecionado

    );


  /*
    Um LDAP representa um multiplicador oficial.

    O Set evita contar duas vezes o mesmo LDAP
    caso a exportação tenha duplicidade.
  */

  const ldapsOficiais =

    new Set(

      baseOficialFiltrada

        .map(

          pessoa =>
            normalizarTexto(
              pessoa.ldap
            )

        )

        .filter(Boolean)

    );


  /*
    Aqui contamos os Team Leaders únicos
    diretamente da exportação oficial.
  */

  const lideresOficiais =

    new Set(

      baseOficialFiltrada

        .map(

          pessoa =>
            normalizarTexto(
              pessoa.teamLeader
            )

        )

        .filter(Boolean)

    );


  const totalMultisOficiais =
    ldapsOficiais.size;


  const totalLideresOficiais =
    lideresOficiais.size;


  const ratioOficial =

    totalLideresOficiais > 0

      ? totalMultisOficiais
        /
        totalLideresOficiais

      : 0;


  definirTexto(

    "ratioGeral",

    totalLideresOficiais > 0

      ? ratioOficial
          .toFixed(2)
          .replace(".", ",")

      : "-"

  );


  definirTexto(

    "ratioDetalhe",

    totalLideresOficiais > 0

      ? `${totalMultisOficiais} multis oficiais ÷ ${totalLideresOficiais} líderes`

      : "Sem dados oficiais disponíveis"

  );

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

      const base =

        multiplicadores

          .filter(

            pessoa =>
              normalizarTurno(
                pessoa.turno
              ) === turno

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


      definirTexto(
        `total${turno}`,
        base.length
      );


      definirTexto(
        `ativos${turno}`,
        ativos.length
      );


      definirTexto(
        `escola${turno}`,
        escola.length
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


      if (!nomeLider) {
        return;
      }


      const chave =
        normalizarTexto(
          nomeLider
        );


      if (!mapa.has(chave)) {

        mapa.set(

          chave,

          {

            nome:
              textoMaiusculo(
                nomeLider
              ),

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


      if (estaAtivoEscola(pessoa)) {
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


  if (
    lideres.length === 0
  ) {

    corpo.innerHTML = `

      <tr class="sem-dados">

        <td colspan="5">

          Nenhum líder encontrado.

        </td>

      </tr>

    `;

    return;

  }


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
   TLs SEM MULTIS
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

    tlsSemMultis

      .filter(

        item => {

          const total =

            Number(

              String(
                item.totalMultis || "0"
              )

                .replace(
                  ",",
                  "."
                )

            );


          return total === 0;

        }

      )

      .sort(

        (
          a,
          b
        ) =>

          String(
            a.teamLeader
          )

            .localeCompare(

              String(
                b.teamLeader
              ),

              "pt-BR"

            )

      );


  definirTexto(
    "totalTlsSemMultis",
    lista.length
  );


  if (
    lista.length === 0
  ) {

    corpo.innerHTML = `

      <tr class="sem-dados">

        <td colspan="4">

          Nenhum TL sem multiplicadores.

        </td>

      </tr>

    `;

    return;

  }


  corpo.innerHTML =

    lista.map(

      item => `

        <tr>

          <td>

            <strong>

              ${
                escapeHtml(

                  textoMaiusculo(
                    item.teamLeader
                  )

                )
              }

            </strong>

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

            <strong>

              ${
                escapeHtml(

                  String(
                    item.totalEquipe
                    ||
                    "0"
                  )

                )
              }

            </strong>

          </td>


          <td>

            <span class="badge inativo">

              0

            </span>

          </td>

        </tr>

      `

    ).join("");

}


/* =========================================================
   CONSTRÓI VALIDAÇÃO
========================================================= */

function construirValidacao() {

  const ativosBase =

    multiplicadores.filter(
      estaNaVisaoPrincipal
    );


  const mapaBase =
    new Map();


  ativosBase.forEach(

    pessoa => {

      const ldap =
        normalizarTexto(
          pessoa.ldap
        );


      if (!ldap) {
        return;
      }


      if (!mapaBase.has(ldap)) {

        mapaBase.set(
          ldap,
          pessoa
        );

      }

    }

  );


  const mapaOficial =
    new Map();


  multiplicadoresOficial.forEach(

    pessoa => {

      const ldap =
        normalizarTexto(
          pessoa.ldap
        );


      if (!ldap) {
        return;
      }


      if (!mapaOficial.has(ldap)) {

        mapaOficial.set(
          ldap,
          pessoa
        );

      }

    }

  );


  const todosLdaps =

    new Set([

      ...mapaBase.keys(),

      ...mapaOficial.keys()

    ]);


  const resultado = [];


  todosLdaps.forEach(

    ldap => {

      const base =
        mapaBase.get(ldap);


      const oficial =
        mapaOficial.get(ldap);


      let tipo = "";
      let descricao = "";


      if (
        base
        &&
        oficial
      ) {

        tipo =
          "alinhado";

        descricao =
          "ALINHADO";

      }

      else if (base) {

        tipo =
          "base-sem-oficial";

        descricao =
          "ATIVO SEM OFICIAL";

      }

      else {

        tipo =
          "oficial-sem-base";

        descricao =
          "OFICIAL FORA DOS ATIVOS";

      }


      resultado.push({

        tipo:
          tipo,

        resultado:
          descricao,

        nome:
          base?.nome
          ||
          oficial?.nome
          ||
          "-",

        ldap:
          base?.ldap
          ||
          oficial?.ldap
          ||
          "-",

        statusBase:
          base?.statusPrograma
          ||
          "FORA DOS ATIVOS",

        statusCad:
          base?.statusBaseHC
          ||
          "-",

        noOficial:
          oficial
            ? "SIM"
            : "NÃO",

        teamLeaderBase:
          base?.teamLeader
          ||
          "-",

        turnoBase:
          base?.turno
          ||
          "-",

        teamLeaderOficial:
          oficial?.teamLeader
          ||
          "-",

        areaOficial:
          oficial?.area
          ||
          "-"

      });

    }

  );


  const ordem = {

    "base-sem-oficial":
      1,

    "oficial-sem-base":
      2,

    "alinhado":
      3

  };


  resultado.sort(

    (
      a,
      b
    ) => {

      const diferenca =

        ordem[a.tipo]
        -
        ordem[b.tipo];


      if (diferenca !== 0) {
        return diferenca;
      }


      return String(
        a.nome
      ).localeCompare(

        String(
          b.nome
        ),

        "pt-BR"

      );

    }

  );


  return {

    registros:
      resultado,

    totalBase:
      mapaBase.size,

    totalOficial:
      mapaOficial.size,

    alinhados:

      resultado.filter(

        item =>
          item.tipo ===
          "alinhado"

      ).length,

    divergencias:

      resultado.filter(

        item =>
          item.tipo !==
          "alinhado"

      ).length

  };

}


/* =========================================================
   ATUALIZA VALIDAÇÃO
========================================================= */

function atualizarValidacao() {

  const validacao =
    construirValidacao();


  registrosValidacao =
    validacao.registros;


  definirTexto(
    "validacaoTotalBase",
    validacao.totalBase
  );


  definirTexto(
    "validacaoTotalOficial",
    validacao.totalOficial
  );


  definirTexto(
    "validacaoTotalAlinhados",
    validacao.alinhados
  );


  definirTexto(
    "validacaoTotalDivergencias",
    validacao.divergencias
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

        item => {

          const texto =

            normalizarTexto(

              `
              ${item.nome}
              ${item.ldap}
              ${item.resultado}
              ${item.statusBase}
              ${item.statusCad}
              ${item.noOficial}
              ${item.teamLeaderBase}
              ${item.turnoBase}
              ${item.teamLeaderOficial}
              ${item.areaOficial}
              `

            );


          return texto.includes(
            termoBuscaValidacao
          );

        }

      );

  }


  if (
    dados.length === 0
  ) {

    corpo.innerHTML = `

      <tr class="sem-dados">

        <td colspan="10">

          Nenhum registro encontrado.

        </td>

      </tr>

    `;

    return;

  }


  corpo.innerHTML =

    dados.map(

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

            <strong>

              ${
                escapeHtml(

                  textoMaiusculo(
                    item.nome
                  )

                )
              }

            </strong>

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
              item.noOficial ===
              "SIM"

                ? `<span class="badge sim">SIM</span>`

                : `<span class="badge nao">NÃO</span>`
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

            <span class="badge-turno">

              ${
                escapeHtml(

                  normalizarTurno(
                    item.turnoBase
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

    ).join("");

}


/* =========================================================
   BADGE VALIDAÇÃO
========================================================= */

function criarBadgeValidacao(item) {

  let texto = "";


  if (
    item.tipo ===
    "alinhado"
  ) {

    texto =
      "✓ ALINHADO";

  }

  else if (
    item.tipo ===
    "base-sem-oficial"
  ) {

    texto =
      "⚠ ATIVO SEM OFICIAL";

  }

  else {

    texto =
      "✕ OFICIAL FORA DOS ATIVOS";

  }


  return `

    <span class="badge-validacao ${item.tipo}">

      ${texto}

    </span>

  `;

}


/* =========================================================
   FILTRO STATUS CONSULTA
========================================================= */

function filtrarPorStatus(lista) {

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

function obterMotivo(pessoa) {

  const motivo =
    String(
      pessoa.motivo || ""
    ).trim();


  if (motivo) {
    return motivo;
  }


  const status =
    statusPrograma(pessoa);


  if (
    status === "multi loss"
    ||
    status === "training"
  ) {

    return "MOVIMENTAÇÃO DE ÁREA";

  }


  return "-";

}


/* =========================================================
   BADGE STATUS PROGRAMA
========================================================= */

function criarBadgeStatusPrograma(
  pessoa
) {

  const status =
    statusPrograma(
      pessoa
    );


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

  else if (
    status ===
    "desistencia"
  ) {

    classe =
      "desistencia";

  }

  else if (
    status === "multi loss"
    ||
    status === "training"
  ) {

    classe =
      "movimentacao";

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


/* =========================================================
   BADGE STATUS CAD
========================================================= */

function criarBadgeStatusHC(valor) {

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


/* =========================================================
   BADGE SIM NÃO
========================================================= */

function criarBadgeSimNao(valor) {

  const sim =
    normalizarTexto(
      valor
    ) === "sim";


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
   TABELA CONSULTA
========================================================= */

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
              ${pessoa.statusBaseHC}
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


  dados.sort(

    (
      a,
      b
    ) =>

      String(
        a.nome
      )

        .localeCompare(

          String(
            b.nome
          ),

          "pt-BR"

        )

  );


  if (
    dados.length === 0
  ) {

    corpo.innerHTML = `

      <tr class="sem-dados">

        <td colspan="15">

          Nenhum registro encontrado.

        </td>

      </tr>

    `;

    return;

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

  /* VISÃO GERAL */

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


  /* LIDERANÇA */

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


  /* CONSULTA TURNO */

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


  /* CONSULTA STATUS */

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


  /* VALIDAÇÃO */

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


            document
              .querySelectorAll(
                ".botao-validacao"
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
   DATA
========================================================= */

function atualizarData() {

  definirTexto(

    "ultimaAtualizacao",

    new Date()
      .toLocaleString(

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

function mostrarErro(mensagem) {

  console.error(
    mensagem
  );


  definirTexto(
    "ultimaAtualizacao",
    "Erro ao carregar"
  );


  const tabelas = [

    {
      id:
        "tabelaMultiplicadores",

      colspan:
        15
    },

    {
      id:
        "tabelaLideranca",

      colspan:
        5
    },

    {
      id:
        "tabelaTlsSemMultis",

      colspan:
        4
    },

    {
      id:
        "corpoTabelaValidacao",

      colspan:
        10
    }

  ];


  tabelas.forEach(

    item => {

      const tabela =
        document.getElementById(
          item.id
        );


      if (tabela) {

        tabela.innerHTML = `

          <tr class="sem-dados">

            <td colspan="${item.colspan}">

              ${
                escapeHtml(
                  mensagem
                )
              }

            </td>

          </tr>

        `;

      }

    }

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

    carregarDados();

  }

);
