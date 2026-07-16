/* =========================================================
   DASHBOARD — PROGRAMA MULTIPLICADORES
   BASE REAL
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
   CARREGA DADOS
========================================================= */

async function carregarDados() {

  mostrarCarregamento();


  try {

    const resposta =
      await fetch(

        API_URL,

        {

          cache:
            "no-store"

        }

      );


    if (
      !resposta.ok
    ) {

      throw new Error(
        `Erro HTTP ${resposta.status}`
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
        "Erro ao carregar os dados."

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
              pessoa.nome
            ).trim() !== ""

        );


    atualizarData();

    atualizarDashboard();


    console.log(

      "Base carregada:",

      multiplicadores.length,

      "registros"

    );

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


/* =========================================================
   ATIVO
========================================================= */

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


/* =========================================================
   ATIVO ESCOLA
========================================================= */

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


/* =========================================================
   VISÃO PRINCIPAL
========================================================= */

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


/* =========================================================
   CONSULTA DE INATIVOS
========================================================= */

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
   NORMALIZA TURNO
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
      pessoa.motivo
      ||
      ""
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
   BADGE STATUS PROGRAMA
========================================================= */

function criarBadgeStatusPrograma(
  pessoa
) {

  const statusOriginal =

    String(
      pessoa.statusPrograma
      ||
      "-"
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

      ${statusOriginal}

    </span>

  `;

}


/* =========================================================
   BADGE STATUS BASE HC
========================================================= */

function criarBadgeStatusHC(
  statusBase
) {

  const original =

    String(
      statusBase
      ||
      "-"
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

      ${original}

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


/* =========================================================
   BADGE SIM / NÃO
========================================================= */

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

        <td colspan="14">

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

            ${
              pessoa.subArea
              ||
              "-"
            }

          </td>


          <td>

            ${
              pessoa.processo
              ||
              "-"
            }

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
              obterMotivo(
                pessoa
              )
            }

          </td>


        </tr>

      `

    ).join("");

}


/* =========================================================
   CARREGAMENTO
========================================================= */

function mostrarCarregamento() {

  document.getElementById(
    "tabelaMultiplicadores"
  ).innerHTML = `

    <tr class="sem-dados">

      <td colspan="14">

        Carregando dados da planilha...

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

      <td colspan="14">

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
