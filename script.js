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
