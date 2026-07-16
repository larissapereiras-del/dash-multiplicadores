/* =========================================================
   DASHBOARD — PROGRAMA MULTIPLICADORES
   SCRIPT.JS COMPLETO
========================================================= */


/* =========================================================
   API
========================================================= */

const API_URL =
  "https://script.google.com/a/macros/mercadolivre.com/s/AKfycbzortEzdw4UOxFqaqGIuxLC6sT-mf0yG5aMJbbCFHPk4ldG7HvX0PzlO178bNAZ_vySqg/exec";


/* =========================================================
   BASE
========================================================= */

let multiplicadores = [];


/* =========================================================
   ESTADO DOS FILTROS
========================================================= */

let turnoSelecionado = "todos";

let turnoLiderancaSelecionado = "todos";

let turnoConsultaSelecionado = "todos";

let statusSelecionado = "principal";

let termoBusca = "";


/* =========================================================
   FUNÇÕES DE TEXTO
========================================================= */

function normalizarTexto(texto) {

  return String(texto || "")

    .normalize("NFD")

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


function textoMaiusculo(texto) {

  const valor =
    String(
      texto || ""
    ).trim();


  return valor

    ? valor.toLocaleUpperCase(
        "pt-BR"
      )

    : "-";

}


function escapeHtml(texto) {

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
   TRANSFORMAÇÃO DOS DADOS DA PLANILHA
========================================================= */

function transformarRegistro(item) {

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
   CALLBACK GLOBAL JSONP
========================================================= */

window.receberDadosMultiplicadores =
  function(retorno) {

    try {

      console.log(
        "Resposta recebida da API:",
        retorno
      );


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


      if (
        !Array.isArray(
          retorno.dados
        )
      ) {

        throw new Error(

          "O campo 'dados' retornado pela API não é uma lista."

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

    catch (erro) {

      console.error(

        "Erro ao processar os dados da API:",

        erro

      );


      mostrarErro(
        erro.message
      );

    }

  };


/* =========================================================
   CARREGAMENTO DA API
========================================================= */

function carregarDados() {

  console.log(
    "Iniciando carregamento da API..."
  );


  const scriptAnterior =

    document.getElementById(
      "api-multiplicadores"
    );


  if (
    scriptAnterior
  ) {

    scriptAnterior.remove();

  }


  const script =

    document.createElement(
      "script"
    );


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


  console.log(

    "URL chamada:",

    script.src

  );


  script.onload =
    function() {

      console.log(

        "Arquivo da API carregado pelo navegador."

      );

    };


  script.onerror =
    function(erro) {

      console.error(

        "Erro ao carregar a API:",

        erro

      );


      mostrarErro(

        "Não foi possível conectar com a API da planilha."

      );

    };


  document.body.appendChild(
    script
  );

}


/* =========================================================
   STATUS DO PROGRAMA
========================================================= */

function statusPrograma(pessoa) {

  return normalizarTexto(

    pessoa.statusPrograma

  );

}


/* =========================================================
   ATIVO
========================================================= */

function estaAtivo(pessoa) {

  return (

    statusPrograma(
      pessoa
    )

    ===

    "ativo"

  );

}


/* =========================================================
   ATIVO ESCOLA
========================================================= */

function estaAtivoEscola(pessoa) {

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


/* =========================================================
   VISÃO PRINCIPAL
========================================================= */

function estaNaVisaoPrincipal(pessoa) {

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


/* =========================================================
   INATIVOS
========================================================= */

function estaNaConsultaInativos(pessoa) {

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
   NORMALIZAÇÃO DO TURNO
========================================================= */

function normalizarTurno(turno) {

  const valor =

    normalizarTexto(
      turno
    );


  if (
    valor === "t1"
    ||
    valor === "1"
    ||
    valor === "1 turno"
    ||
    valor === "1º turno"
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
      )

      ===

      turno

  );

}


/* =========================================================
   INDICADORES DA VISÃO GERAL
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

      ?

      principal.length
      /
      totalLideres

      :

      0;


  const elementoTotal =

    document.getElementById(
      "totalMultiplicadores"
    );


  const elementoAtivos =

    document.getElementById(
      "totalAtivos"
    );


  const elementoEscola =

    document.getElementById(
      "totalEscola"
    );


  const elementoRatio =

    document.getElementById(
      "ratioGeral"
    );


  const elementoDetalhe =

    document.getElementById(
      "ratioDetalhe"
    );


  if (
    elementoTotal
  ) {

    elementoTotal.textContent =

      principal.length;

  }


  if (
    elementoAtivos
  ) {

    elementoAtivos.textContent =

      ativos.length;

  }


  if (
    elementoEscola
  ) {

    elementoEscola.textContent =

      escola.length;

  }


  if (
    elementoRatio
  ) {

    elementoRatio.textContent =

      totalLideres > 0

        ?

        ratio

          .toFixed(2)

          .replace(
            ".",
            ","
          )

        :

        "-";

  }


  if (
    elementoDetalhe
  ) {

    elementoDetalhe.textContent =

      totalLideres > 0

        ?

        `${principal.length} multis ÷ ${totalLideres} líderes`

        :

        "Sem líderes disponíveis";

  }

}


/* =========================================================
   COMPARATIVO DOS TURNOS
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


      const ativos =

        base.filter(
          estaAtivo
        );


      const escola =

        base.filter(
          estaAtivoEscola
        );


      const elementoTotal =

        document.getElementById(

          `total${turno}`

        );


      const elementoAtivos =

        document.getElementById(

          `ativos${turno}`

        );


      const elementoEscola =

        document.getElementById(

          `escola${turno}`

        );


      if (
        elementoTotal
      ) {

        elementoTotal.textContent =

          base.length;

      }


      if (
        elementoAtivos
      ) {

        elementoAtivos.textContent =

          ativos.length;

      }


      if (
        elementoEscola
      ) {

        elementoEscola.textContent =

          escola.length;

      }

    }

  );

}


/* =========================================================
   TABELA DE LIDERANÇA
========================================================= */

function atualizarTabelaLideranca() {

  const corpo =

    document.getElementById(
      "tabelaLideranca"
    );


  if (
    !corpo
  ) {

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

    lideres

      .map(

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

      )

      .join("");

}


/* =========================================================
   FILTRO POR STATUS
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
   MOTIVO DO INATIVO
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

    return "MOVIMENTAÇÃO DE ÁREA";

  }


  return "-";

}


/* =========================================================
   BADGE STATUS DO PROGRAMA
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
    status ===
    "multi loss"

    ||

    status ===
    "training"
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
   BADGE STATUS HC
========================================================= */

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


/* =========================================================
   BADGE SIM / NÃO
========================================================= */

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
   TABELA DE CONSULTA
========================================================= */

function atualizarTabela() {

  const corpo =

    document.getElementById(
      "tabelaMultiplicadores"
    );


  if (
    !corpo
  ) {

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

            `

          ).includes(
            termoBusca
          )

      );

  }


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

    dados

      .map(

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

      )

      .join("");

}


/* =========================================================
   CONFIGURAÇÃO DAS ABAS
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


            if (
              conteudo
            ) {

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


  /* =======================================================
     VISÃO GERAL
  ======================================================= */

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


  /* =======================================================
     LIDERANÇA
  ======================================================= */

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


  /* =======================================================
     CONSULTA — TURNO
  ======================================================= */

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


  /* =======================================================
     CONSULTA — STATUS
  ======================================================= */

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

  const campo =

    document.getElementById(
      "campoBusca"
    );


  if (
    !campo
  ) {

    return;

  }


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


/* =========================================================
   ÚLTIMA ATUALIZAÇÃO
========================================================= */

function atualizarData() {

  const elemento =

    document.getElementById(
      "ultimaAtualizacao"
    );


  if (
    !elemento
  ) {

    return;

  }


  elemento.textContent =

    new Date()

      .toLocaleString(
        "pt-BR"
      );

}


/* =========================================================
   ATUALIZA TODO O DASHBOARD
========================================================= */

function atualizarDashboard() {

  atualizarIndicadores();

  atualizarTurnos();

  atualizarTabelaLideranca();

  atualizarTabela();

}


/* =========================================================
   MOSTRA ERRO
========================================================= */

function mostrarErro(
  mensagem
) {

  console.error(
    mensagem
  );


  const ultimaAtualizacao =

    document.getElementById(
      "ultimaAtualizacao"
    );


  if (
    ultimaAtualizacao
  ) {

    ultimaAtualizacao.textContent =

      "Erro ao carregar";

  }


  const tabela =

    document.getElementById(
      "tabelaMultiplicadores"
    );


  if (
    tabela
  ) {

    tabela.innerHTML = `

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

}


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

document.addEventListener(

  "DOMContentLoaded",

  () => {

    console.log(
      "Dashboard iniciado."
    );


    configurarAbas();

    configurarFiltros();

    configurarBusca();

    carregarDados();

  }

);
