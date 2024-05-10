# Gemini Help Desk 🤖

## Objetivo 🎯

Este projeto utiliza o poder do Google AI Gemini para analisar chamados de TI inputados via formulário (Google Forms) e categorizá-los automaticamente. Através do Apps Script, as informações processadas pela IA são adicionadas a uma base de dados (Google Sheets), que alimenta um dashboard web em tempo real. 📈

Link Dashboard exemplo: https://docs.google.com/spreadsheets/d/e/2PACX-1vSylMv4BoXm5haaH1DQV8Fo2v-tNk0syV4UpYBfjCV6tf12uTki01HRJNseWQr_BzNFNXfHzywigkEg/pubhtml?gid=1217744822&single=true

Link Google Forms abertura de chamados: https://forms.gle/rN41VQt4S2dkB9rC7

## Classificação dos Chamados

Os chamados são classificados em três categorias:

* Natureza: 💻 Software, 🖥️ Hardware, 🌐 Rede, ⚙️ Sistema Operacional, 👥 Gerência de Usuários, etc.
* Disponibilidade: ❌ Indisponível, ⚠️ Parcialmente Disponível, ✅ Não se Aplica.
* Prioridade: 🔺 Alta, 🔶 Média, 🔷 Baixa.
  
## Replicação do Projeto 🔨

Atenção: As instruções abaixo podem ser alteradas em versões futuras do projeto.

1- Crie um Google Forms: Utilize o mesmo título das perguntas deste formulário como base, porém a ordem das perguntas pode ser alterada: https://forms.gle/VH3wEYi3cfzmCSJg6

2 - Crie um projeto Apps Script: Na planilha que recebe as respostas do formulário, crie um projeto Apps Script.

3 - Copie o código: Copie todo o código do arquivo "codigo.gs" deste repositório e cole no "Código.gs" do seu novo projeto.

4 - Configure a API Key: Em "Configurações do Projeto" > "Propriedades do script", crie uma nova propriedade chamada "API_KEY" e cole sua chave de API do Gemini como valor. Salve as alterações.

5 - Crie um acionador: Em "Acionadores", crie um novo acionador. Selecione a função "principal", a origem do evento como "Da planilha" e o tipo de evento como "Ao enviar o formulário". Salve o acionador.

6 - Crie uma nova aba: Na planilha, crie uma nova aba e utilize seu ID no código para que o Gemini preencha com as informações processadas.

7 - Crie um Dashboard: Crie um dashboard com base nas informações da nova aba.

## Contato 🤝

LinkedIn: https://www.linkedin.com/in/joao-pereira-paiva

Email: paivaseven@gmail.com
