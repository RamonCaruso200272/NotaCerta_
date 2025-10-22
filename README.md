NotaCerta_
NotaCerta é um Sistema Acadêmico front-end completo, projetado para ajudar estudantes a gerenciar e acompanhar seu desempenho acadêmico. A aplicação permite que cada usuário crie sua própria conta, onde pode registrar suas matérias, notas e faltas de forma privada e organizada.

O principal diferencial deste projeto é que ele funciona inteiramente no navegador, sem a necessidade de um back-end. Todos os dados do usuário são salvos de forma persistente no localStorage do navegador, garantindo que as informações de cada conta sejam isoladas e seguras.

🚀 Proposta do Projeto
A proposta é oferecer uma ferramenta leve, rápida e acessível para que estudantes possam centralizar suas informações acadêmicas. Em vez de depender de planilhas complexas ou anotações dispersas, o NotaCerta oferece uma interface limpa e reativa para gerenciar:

Matérias: Controle de quais disciplinas estão sendo cursadas, quem são os professores, etc.

Notas: Registro detalhado de cada avaliação (provas, trabalhos) com seus respectivos pesos e notas.

Faltas: Um controle de presença para monitorar ausências e evitar reprovação por frequência.

Tudo isso é apresentado em um dashboard visual que facilita a rápida compreensão do progresso do aluno.

✨ Funcionalidades Principais
Sistema de Contas Multi-usuário:

Registro: Novos usuários podem se cadastrar com nome, e-mail e senha. O sistema impede o cadastro de e-mails duplicados.

Login: Autenticação de usuários para acessar seus dados privados.

Isolamento de Dados: Os dados de um usuário (matérias, notas, faltas) são completamente separados e inacessíveis por outras contas.

Dashboard Visual:

Exibição de estatísticas-chave: Média Geral, Taxa de Presença e Total de Matérias.

Gráficos (via Chart.js) que ilustram a Média por Matéria e a distribuição de Faltas.

Gerenciamento CRUD Completo (Criar, Ler, Editar, Excluir):

Matérias: Funcionalidade completa para adicionar, editar e excluir disciplinas do semestre.

Faltas: Permite registrar aulas (como presente ou falta), inserir justificativas, editar registros e excluí-los.

Notas: Permite registrar notas de atividades, definindo a matéria, nome da atividade, peso, nota obtida e nota máxima. Todos os campos são editáveis e os registros podem ser excluídos.

Persistência de Dados:

Todas as informações e alterações são salvas automaticamente no localStorage do navegador.

O login é persistido, permitindo que o usuário feche e reabra o navegador sem perder a sessão.

Interface Limpa:

Um design moderno e simples, focado na usabilidade, com componentes como cards, badges e tabelas organizadas.

🛠️ Tecnologias Utilizadas
HTML5: Estrutura semântica das páginas (index.html).

CSS3: Estilização moderna e responsiva, utilizando variáveis CSS para o tema (style.css).

JavaScript (ES6+): Toda a lógica da aplicação (script.js), incluindo:

Renderização dinâmica de componentes (SPA - Single Page Application).

Manipulação do DOM.

Gerenciamento de estado (autenticação e dados do usuário).

Lógica CRUD completa e persistência no localStorage.

Chart.js: Biblioteca externa para a criação dos gráficos do dashboard.