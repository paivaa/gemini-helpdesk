// A função principal que deve ser adicionada no Trigger
function principal(e) {

  try{
    //dados vindos do google forms
    
    console.log(JSON.stringify(e));
    
    let obj_response_forms = {
        cargo: e.namedValues["Cargo"][0],
        descricao_problema: e.namedValues["Descrição do chamado"][0],
        email: e.namedValues["Endereço de e-mail"][0],
        nome_completo: e.namedValues["Nome Completo"][0]
    }

    callGemini_(obj_response_forms);
    return;

  }catch(e){

    console.error({
      message: "BAD ROBOTO CATCH ERROR",
      errMsg: e.message,
      line: e.lineNumber,
      fileName: e.fileName,
      stackTrace: e.stack
    });

    return
  }
  
}

function callGemini_({ cargo, descricao_problema, email, nome_completo  }) {
  //usando a propriedade de serviço do apps script para obter a api key

  const script = PropertiesService.getScriptProperties();
  const API_KEY = script.getProperty("API_KEY");

  let url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${API_KEY}`
  
  //prompt pré-escrito para orientar o Gemini a uma resposta mais refinada possível com base em nosso contexto

  const data = {
    "contents": [
      {
        "parts": [
          {
            "text": "Abaixo uma lista de categorias de chamados é usada para definir qual o tipo será vinculado ao chamado:\n \nHardware e periféricos:quando a suspeita do problema em equipamento é física (queima, papel atolado, barulhos estranhos dentro de equipamentos de informática, periférico \nparou de funcionar);\n\nSoftware: instalação, problemas e desinstalação de algum programa e/aplicativo;\n\nRede: problemas em cabos de rede rompidos ou com mal contato, troca e habilitação de pontos de rede para telefone e computador, lentidão na internet. \n\nSistema Operacional: instalação de drivers, formatação do computador, backup de arquivos do computador, ativação do sistema operacional, limpeza contra vírus\n\nHelpdesk: dúvidas em geral \n\nGerenciamento de usuário: refere-se a modificação de senha, grupos (G:), requisição de login para acesso a sistemas, computadores e pastas de rede;\n\n\nCaso o problema esteja afetando algum serviço, aplicativo, programa ou computador e que \nimpossibilite integralmente ou parcialmente do colaborador de trabalhar; o chamado recebe também esse tipo de categoria quanto a disponibilidade do serviço:\n\nindisponível: computador ou dispositivo quebrou, programa não abre, sem acesso ao email, pasta de rede, sem acesso a internet\n\nparcialmente indisponível: computador ou dispositivo apresentando travamento, programa apresentando lentidão, demora em acessar pasta de rede e internet \n\nnão se aplica: quando o chamado for algo que não esteja afetando nada e não se encaixar nos acima descritos. \n\n\nCom base no cargo do colaborador, no tipo de chamado e na disponibilidade do serviço,\no chamado recebe também uma ordem de prioridade, descrito abaixo:\n\nbaixa: cargo nível de assistente para baixo e que estão com serviço parcialmente disponivel ou 'não se aplica' ou para todos os cargos que a disponibilidade do serviço é categorizada como 'não se aplica' exceto cargos altos.\n\nmédia: cargos médios entre analista e abaixo de coordenador com disponibilidade do serviço parcialmente indisponivel ou não se aplica. Cargos nível de assistente para baixo e que estão com serviço indisponivel.\n\nalta: cargos altos de diretor para cima com disponibilidade do serviço em indisponivel ou parcialmente indisponivel; cargos médios com disponibilidade do serviço em indisponivel\n\n\nExemplo:\n\nCargo: Gerente de Projetos\nProblema: A plataforma de gerenciamento de projetos online utilizada pela equipe está apresentando erro ao tentar anexar arquivos maiores que 10MB, impedindo o compartilhamento de documentos importantes.\nCategoria: Software\nDisponibilidade do serviço: parcialmente indisponível\nprioridade: média\n\n-----------------------------------------------------------\n\nCargo: Analista de Vendas\nProblema: O software de CRM utilizado pela equipe está apresentando lentidão e travamentos frequentes, dificultando o registro de atividades e o acompanhamento dos clientes.\nCategoria: Software\nDisponibilidade do serviço: parcialmente indisponível\nprioridade: média\n\n------------------------------------------------------------\n\nCargo: Estagiário de Marketing\nProblema: gostaria de trocar minha webcam pois a mesma esta dando intermitencia em calls\nDisponibilidade do serviço: parcialmente indisponível\nprioridade: baixa\n\n------------------------------------------------------------\n\nCargo: Diretor Financeiro\nProblema: dO sistema de gestão financeira da empresa (ERP) está apresentando inconsistências nos dados e relatórios gerados, impactando a tomada de decisões estratégicas.\nDisponibilidade do serviço: não se aplica\nprioridade: alta\n\n-------------------------------------------------------------\n\nResponda em formato JSON, e apenas nesse formato, no padrão: categoria, disponibilidade e prioridade\n\n___________________________________________________________\n\nCargo: " + cargo + "\nProblema: " + descricao_problema
          }
        ]
      }
    ]
  };

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    payload: JSON.stringify(data)
  };

  let res = UrlFetchApp.fetch(url, options);

  if (res.getResponseCode() != 200) {
    console.error("Response code: ", res.getResponseCode());
    let retorno = res.getContentText();
    console.log(retorno);
    return
  }

  let dados = res.getContentText()
  let dados_parse = JSON.parse(dados);
  let dados_tratados = JSON.parse(dados_parse.candidates[0].content.parts[0].text.replace("json", "").replaceAll("`", "").trim())
  Logger.log(dados_tratados);

  const ID_DA_ABA_PLANILHA_CONSOLIDADO_GEMINI = "INSIRA-O-ID-ABA-ONDE-OS-DADOS-DO-GEMINI-SERAO-ESCRITOS";

  let aba = getSheetById_(ID_DA_ABA_PLANILHA_CONSOLIDADO_GEMINI);
  
  //serviço do apps script pra nenhuma reqsuição se sobrepor caso tenha muita gente usando
  let lock = LockService.getScriptLock();

  lock.tryLock(3000);

  if (!lock.hasLock) {
    console.error("Servidor ocupado. Tente Novamente.");
    return
  }

//calculo do SLA e padronização do texto de acordo com a disponibilidade e/prioridade
  let sla = 0;
  
  if(dados_tratados.disponibilidade.includes("parcialmente") && dados_tratados.prioridade == "alta"){
    dados_tratados.disponibilidade = "parcialmente indisponível";
    sla = 4;
  }else if(dados_tratados.disponibilidade.includes("parcialmente") && dados_tratados.prioridade.includes("m")){
    dados_tratados.disponibilidade = "parcialmente indisponível";
    dados_tratados.prioridade = "média";
    sla = 8;
  }else if(dados_tratados.disponibilidade.includes("parcialmente") && dados_tratados.prioridade == "baixa"){
    dados_tratados.disponibilidade = "parcialmente indisponível"
    sla = 15;
  }else if(dados_tratados.disponibilidade.includes("aplica") && dados_tratados.prioridade == "alta"){
    sla = 3;
  }else if(dados_tratados.disponibilidade.includes("aplica") && dados_tratados.prioridade.includes("m")){
    dados_tratados.prioridade = "média";
    sla = 5;
  }else if(dados_tratados.disponibilidade.includes("aplica") && dados_tratados.prioridade == "baixa"){
    sla = 20;
  }else if(!dados_tratados.disponibilidade.includes("parcialmente") && dados_tratados.prioridade == "alta"){
    dados_tratados.disponibilidade = "indisponível"
    sla = 2;
  }else if(!dados_tratados.disponibilidade.includes("parcialmente") && dados_tratados.prioridade.includes("m")){
    dados_tratados.disponibilidade = "indisponível"
    dados_tratados.prioridade = "média";
    sla = 3;
  }else if(!dados_tratados.disponibilidade.includes("parcialmente")  && dados_tratados.prioridade == "baixa"){
    dados_tratados.disponibilidade = "indisponível"
    sla = 4;
  }

  let hoje = new Date()
  let data_final = new Date(new Date().setDate(new Date().getDate() + sla));
  let numero_ticket = getRandomInt_(1, 10000000)

  //escrita na planilha
    
  aba.appendRow([email, nome_completo, cargo, descricao_problema, dados_tratados.categoria, dados_tratados.disponibilidade, dados_tratados.prioridade, "Criado", hoje, sla, data_final, numero_ticket]);
  SpreadsheetApp.flush();

  //envia para o usuário uma notificação via email com o prazo do SLA do chamado
  GmailApp.sendEmail(email.toLowerCase().trim(),
    "CHAMADO ABERTO - TICKET #"+numero_ticket,
    "Saudações,\n\nSeu chamado foi aberto com sucesso!\n\nO prazo para resolução é de até " + sla + " dias utéis a partir da abertura do chamado. \n\nPara dúvidas e acompanhamento, entrar em contato com o suportehelpdesk@fakecompany.com enviando o número do ticket do chamado.\n\n\n\nEsta Mensagem é gerada automaticamente.", {
    name: 'Gemini Helpdesk',
    noReply: true
  });

  lock.releaseLock();
  
  return
}

//gera um numero inteiro aleatorio entre dois numeros
function getRandomInt_(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//retorna o objeto aba da planilha com base em seu id
function getSheetById_(idAba) {
  return SpreadsheetApp.getActiveSpreadsheet().getSheets().filter(
    function (s) { return s.getSheetId() === idAba; }
  )[0];
}
