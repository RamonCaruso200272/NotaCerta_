// Aguarda o carregamento completo do DOM antes de executar o código
document.addEventListener('DOMContentLoaded', () => {
    let Materia = []; // Array para armazenar as matérias cadastradas

    // FUNÇÃO PARA CADASTRAR NOVA MATÉRIA
    function CadastrarMateria() {
        // Obtém valores dos campos do formulário
        const nomeMateria = document.getElementById('nomeMateria').value;
        const cadCodigo = document.getElementById('cadCodigo').value;
        const cadProfessor = document.getElementById('cadProfessor').value;
        const cadCreditos = document.getElementById('cadCreditos').value;
        const cadHorario = document.getElementById('cadHorario').value;

        // Valida se todos os campos foram preenchidos
        if (nomeMateria && cadCodigo && cadProfessor && cadCreditos && cadHorario) {
            // Cria novo objeto de matéria
            const newSubject = {
                id: (state.subjects.length + 1).toString(), // Gera ID sequencial
                name: nomeMateria,
                code: cadCodigo,
                professor: cadProfessor,
                credits: parseInt(cadCreditos),
                schedule: cadHorario
            };

            // Adiciona a nova matéria ao estado global e ao array local
            state.subjects.push(newSubject);
            Materia.push(newSubject);

            // Limpa os campos do formulário após cadastro
            document.getElementById('nomeMateria').value = '';
            document.getElementById('cadCodigo').value = '';
            document.getElementById('cadProfessor').value = '';
            document.getElementById('cadCreditos').value = '';
            document.getElementById('cadHorario').value = '';
        } else {
            // Alerta se algum campo estiver vazio
            alert('Por favor, preencha todos os campos.');
        }

        // Exibe no console para debug (pode ser removido em produção)
        console.log('Materias cadastradas: ', Materia);
    }

    // DADOS MOCK (FICTÍCIOS) PARA TESTES

    // Array de registros de presença fictícios
    const mockAttendance = [
        { id: '1', subjectId: '1', date: '2024-01-15', present: true },
        { id: '2', subjectId: '1', date: '2024-01-17', present: false, justification: 'Consulta médica' },
        { id: '3', subjectId: '2', date: '2024-01-16', present: true },
        { id: '4', subjectId: '2', date: '2024-01-18', present: true },
        { id: '5', subjectId: '3', date: '2024-01-19', present: false },
        { id: '6', subjectId: '4', date: '2024-01-15', present: true },
    ];

    // Array de notas fictícias
    const mockGrades = [
        { id: '1', subjectId: '1', activityName: 'Prova 1', weight: 3, score: 8.5, maxScore: 10, date: '2024-01-20' },
        { id: '2', subjectId: '1', activityName: 'Trabalho 1', weight: 2, score: 9.0, maxScore: 10, date: '2024-01-25' },
        { id: '3', subjectId: '2', activityName: 'Projeto Final', weight: 4, score: 9.5, maxScore: 10, date: '2024-01-30' },
        { id: '4', subjectId: '2', activityName: 'Prova Teórica', weight: 3, score: 7.8, maxScore: 10, date: '2024-02-05' },
        { id: '5', subjectId: '3', activityName: 'Modelagem ER', weight: 2, score: 8.2, maxScore: 10, date: '2024-02-10' }
    ];

    // --- GERENCIAMENTO DE ESTADO DA APLICAÇÃO ---

    // Objeto que armazena o estado global da aplicação
    let state = {
        isAuthenticated: false, // Controla se usuário está autenticado
        currentView: 'dashboard', // Tela atual sendo exibida
        user: null, // Dados do usuário logado
        subjects: Materia, // Lista de disciplinas
        attendance: mockAttendance, // Registros de presença
        grades: mockGrades // Notas do usuário
    };

    // --- SELEÇÃO DE ELEMENTOS DO DOM ---

    // Seleciona os elementos principais da interface
    const loginView = document.getElementById('login-view');
    const mainView = document.getElementById('main-view');
    const sidebarContainer = document.getElementById('sidebar-container');
    const mainContentContainer = document.getElementById('main-content-container');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');

    // --- SISTEMA DE AUTENTICAÇÃO ---

    // Função para realizar login
    function login(email, password) {
        // Verifica credenciais fixas (em sistema real, viria de backend)
        if (email === 'admin@exemplo.com' && password === '123456') {
            state.isAuthenticated = true;
            state.user = { 
                name: 'João Silva', 
                email: 'admin@exemplo.com', 
                avatar: 'https://github.com/shadcn.png' 
            };
            // Salva estado no localStorage para persistência
            localStorage.setItem('authState', JSON.stringify(state));
            renderApp();
        } else {
            // Exibe mensagem de erro para credenciais inválidas
            loginError.textContent = 'Email ou senha incorretos.';
        }
    }

    // Função para realizar logout
    function logout() {
        state.isAuthenticated = false;
        state.user = null;
        // Remove dados de autenticação do localStorage
        localStorage.removeItem('authState');
        renderApp();
    }

    // --- SISTEMA DE RENDERIZAÇÃO DA INTERFACE ---

    // Função principal que controla o que é exibido na tela
    function renderApp() {
        if (state.isAuthenticated) {
            // Se autenticado, mostra a aplicação principal
            loginView.classList.remove('active');
            mainView.classList.add('active');
            renderSidebar();
            renderMainContent();
        } else {
            // Se não autenticado, mostra tela de login
            loginView.classList.add('active');
            mainView.classList.remove('active');
        }
    }

    // Renderiza a barra lateral com menu de navegação
    function renderSidebar() {
        sidebarContainer.innerHTML = `
            <div class="sidebar-header">
                <div class="logo">
                   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-graduation-cap"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                </div>
                <div>
                    <h2>Sistema</h2>
                    <p>Acadêmico</p>
                </div>
            </div>
            <div class="user-info">
                <img src="${state.user.avatar}" alt="Avatar" class="avatar">
                <div>
                    <p class="user-name">${state.user.name}</p>
                    <p class="user-email">${state.user.email}</p>
                </div>
            </div>
            <nav class="sidebar-nav">
                <button data-view="dashboard" class="nav-btn ${state.currentView === 'dashboard' ? 'active' : ''}">Dashboard</button>
                <button data-view="subjects" class="nav-btn ${state.currentView === 'subjects' ? 'active' : ''}">Matérias</button>
                <button data-view="attendance" class="nav-btn ${state.currentView === 'attendance' ? 'active' : ''}">Faltas</button>
                <button data-view="grades" class="nav-btn ${state.currentView === 'grades' ? 'active' : ''}">Notas</button>
                <button data-view="reports" class="nav-btn ${state.currentView === 'reports' ? 'active' : ''}">Relatórios</button>
                <button data-view="settings" class="nav-btn ${state.currentView === 'settings' ? 'active' : ''}">Configurações</button>
            </nav>
            <button id="logout-btn" class="btn btn-logout">Sair</button>
        `;

        // Adiciona event listeners aos botões de navegação
        sidebarContainer.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                state.currentView = btn.dataset.view;
                renderApp();
            });
        });

        // Adiciona event listener ao botão de logout
        document.getElementById('logout-btn').addEventListener('click', logout);
    }

    // Renderiza o conteúdo principal baseado na view atual
    function renderMainContent() {
        mainContentContainer.innerHTML = '';
        
        // Switch para determinar qual tela renderizar baseado na view atual
        switch (state.currentView) {
            case 'dashboard':
                renderDashboard();
                break;
            case 'subjects':
                renderSubjectsManager();
                break;
            case 'attendance':
                renderAttendanceManager();
                break;
            case 'grades':
                renderGradesManager();
                break;
            case 'reports':
                renderReports();
                break;
            case 'settings':
                renderSettings();
                break;
        }
    }

    // Renderiza o dashboard com estatísticas e gráficos
    function renderDashboard() {
        // Calcula estatísticas para exibir no dashboard
        const totalSubjects = state.subjects.length;
        const totalClasses = state.attendance.length;
        const presentClasses = state.attendance.filter(a => a.present).length;
        const attendanceRate = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0;
        
        // Calcula médias por disciplina
        const subjectAverages = state.subjects.map(subject => {
            const subjectGrades = state.grades.filter(g => g.subjectId === subject.id);
            if (subjectGrades.length === 0) return { name: subject.name, average: 0 };
            const weightedSum = subjectGrades.reduce((sum, grade) => sum + (grade.score * grade.weight), 0);
            const totalWeight = subjectGrades.reduce((sum, grade) => sum + grade.weight, 0);
            return { 
                name: subject.name, 
                average: totalWeight > 0 ? (weightedSum / totalWeight).toFixed(1) : 0 
            };
        });

        // Calcula média geral de todas as disciplinas
        const overallAverage = (subjectAverages.reduce((sum, s) => sum + parseFloat(s.average), 0) / subjectAverages.length).toFixed(1);

        // Gera HTML do dashboard
        mainContentContainer.innerHTML = `
            <div class="header">
                <h1>Dashboard</h1>
                <p>Visão geral do seu desempenho acadêmico</p>
            </div>
            <div class="grid-4">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title-sm">Total de Matérias</h3>
                    </div>
                    <div class="card-content">
                        <div class="stat-value">${totalSubjects}</div>
                        <p class="stat-desc">Semestre atual</p>
                    </div>
                </div>
                 <div class="card">
                    <div class="card-header">
                        <h3 class="card-title-sm">Taxa de Presença</h3>
                    </div>
                    <div class="card-content">
                        <div class="stat-value">${attendanceRate}%</div>
                        <div class="progress-bar"><div style="width: ${attendanceRate}%"></div></div>
                    </div>
                </div>
                 <div class="card">
                    <div class="card-header">
                        <h3 class="card-title-sm">Média Geral</h3>
                    </div>
                    <div class="card-content">
                        <div class="stat-value">${overallAverage}</div>
                        <p class="stat-desc">Em todas as matérias</p>
                    </div>
                </div>
            </div>
            <div class="grid-2">
                <div class="card">
                    <div class="card-header"><h3 class="card-title">Faltas por Matéria</h3></div>
                    <div class="card-content"><canvas id="absencesChart"></canvas></div>
                </div>
                <div class="card">
                    <div class="card-header"><h3 class="card-title">Média por Matéria</h3></div>
                    <div class="card-content"><canvas id="gradesChart"></canvas></div>
                </div>
            </div>
        `;
        
        // Renderização de gráficos usando Chart.js
        const absencesCtx = document.getElementById('absencesChart').getContext('2d');
        const gradesCtx = document.getElementById('gradesChart').getContext('2d');

        // Prepara dados para gráfico de faltas
        const absencesData = state.subjects.map(s => ({
            name: s.name,
            absences: state.attendance.filter(a => a.subjectId === s.id && !a.present).length
        }));

        // Gráfico de pizza para mostrar distribuição de faltas por matéria
        new Chart(absencesCtx, {
            type: 'pie',
            data: {
                labels: absencesData.map(d => d.name),
                datasets: [{
                    label: 'Faltas',
                    data: absencesData.map(d => d.absences),
                    backgroundColor: ['#3b82f6', '#ef4444', '#f59e0b', '#22c55e'],
                }]
            }
        });

        // Gráfico de barras para mostrar médias por matéria
        new Chart(gradesCtx, {
            type: 'bar',
            data: {
                labels: subjectAverages.map(s => s.name),
                datasets: [{
                    label: 'Média',
                    data: subjectAverages.map(s => s.average),
                    backgroundColor: '#3b82f6',
                }]
            },
            options: {
                scales: { 
                    y: { 
                        beginAtZero: true, 
                        max: 10 // Escala de 0 a 10 para notas
                    } 
                }
            }
        });
    }

    // Renderiza o gerenciador de disciplinas
    function renderSubjectsManager() {
        mainContentContainer.innerHTML = `
            <div class="header">
                <h1>Matérias</h1>
                <p>Gerencie suas disciplinas do semestre</p>
            </div>
             <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Adicionar Matéria</h3>
                </div>
                <div class="card-content" id="add-subject-form">
                    <button id="btn-open-add-subject" class="btn btn-primary">+ Nova Matéria</button>
                    <div id="add-subject-form-wrapper" style="margin-top:1rem; display:none;">
                </div>

            </div>
        
            <div class="card">
                <div class="card-content">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Código</th>
                                <th>Professor</th>
                                <th>Créditos</th>
                                <th>Horário</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${state.subjects.map(s => `
                                <tr>
                                    <td>${s.name}</td>
                                    <td><span class="badge">${s.code}</span></td>
                                    <td>${s.professor}</td>
                                    <td>${s.credits}</td>
                                    <td>${s.schedule}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        // Adiciona event listener ao botão de abrir formulário
        document.getElementById('btn-open-add-subject').addEventListener('click', () => {
            abreformulario();
            // Adiciona event listener ao botão de adicionar matéria
            document.getElementById('btn-adicionar-materia').addEventListener('click', () => {
                CadastrarMateria();
                renderApp(); // Re-renderiza a aplicação para atualizar a lista de matérias
            });
        });
    }

    function abreformulario() {
        const formWrapper = document.getElementById('add-subject-form-wrapper');
        formWrapper.innerHTML = `
            <div class="card" style="padding:0.75rem;">
                <div class="card-content">
                    <div class="form-group">
                        <label for="nomeMateria">Nome da Matéria</label>
                        <input type="text" id="nomeMateria" placeholder="Ex: Matemática">
                    </div>
                    <div class="form-group">
                        <label for="cadCodigo">Código da Matéria</label>
                        <input type="text" id="cadCodigo" placeholder="Ex: MAT101">
                    </div>
                    <div class="form-group">
                        <label for="cadProfessor">Nome do Professor</label>
                        <input type="text" id="cadProfessor" placeholder="Ex: Dr. Silva">
                    </div>
                    <div class="form-group">
                        <label for="cadCreditos">Créditos</label>
                        <input type="number" id="cadCreditos" min="1" placeholder="Ex: 4">
                    </div>
                    <div class="form-group">
                        <label for="cadHorario">Horário</label>
                        <input type="text" id="cadHorario" placeholder="Ex: Seg 10:00-12:00">
                    </div>
                    <div style="display:flex;gap:0.5rem;">
                        <button id="btn-adicionar-materia" class="btn btn-primary">Adicionar</button>
                        <button id="btn-cancelar-materia" class="btn">Cancelar</button>
                    </div>
                </div>
            </div>
        `;
        formWrapper.style.display = 'block'; // Mostra o formulário

        // Event listener para cancelar
        document.getElementById('btn-cancelar-materia').addEventListener('click', () => {
            formWrapper.style.display = 'none';
            formWrapper.innerHTML = '';
        });
        
    }

    

    // Renderiza o gerenciador de presenças
    function renderAttendanceManager() {
        mainContentContainer.innerHTML = `
            <div class="header">
                <h1>Controle de Faltas</h1>
                <p>Gerencie sua presença nas aulas</p>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Registrar Presença / Falta</h3>
                </div>
                <div class="card-content" id="attendance-actions">
                    <button id="btn-add-attendance" class="btn btn-primary">+ Adicionar aula</button>
                    <div id="attendance-form-wrapper" style="margin-top:1rem; display:none;"></div>
                </div>
            </div>CadrMateria

            <div class="card">
                <div class="card-content">
                    <table class="data-table" id="attendance-table">
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Matéria</th>
                                <th>Status</th>
                                <th>Justificativa</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${state.attendance.sort((a,b) => new Date(b.date) - new Date(a.date)).map(a => `
                                <tr>
                                    <td>${new Date(a.date).toLocaleDateString('pt-BR')}</td>
                                    <td>${state.subjects.find(s => s.id === a.subjectId)?.name || ''}</td>
                                    <td>
                                        <span class="badge ${a.present ? 'badge-success' : 'badge-danger'}">
                                            ${a.present ? 'Presente' : 'Falta'}
                                        </span>
                                    </td>
                                    <td>${a.justification || '-'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        // Adiciona event listener ao botão de adicionar presença
        document.getElementById('btn-add-attendance').addEventListener('click', () => {
            openAttendanceForm();
        });
    }

    // Abre o formulário para adicionar novo registro de presença
    function openAttendanceForm() {
        const wrapper = document.getElementById('attendance-form-wrapper');
        
        // HTML do formulário de presença
        wrapper.innerHTML = `
            <div class="card" style="padding:0.75rem;">
                <div class="card-content">
                    <div class="form-group">
                        <label for="attendance-subject">Matéria</label>
                        <select id="attendance-subject">
                            ${state.subjects.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="attendance-date">Data</label>
                        <input type="date" id="attendance-date" value="${new Date().toISOString().slice(0,10)}">
                    </div>
                    <div class="form-group">
                        <label for="attendance-status">Status</label>
                        <select id="attendance-status">
                            <option value="present">Presente</option>
                            <option value="absent">Falta</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="attendance-justification">Justificativa (opcional)</label>
                        <input type="text" id="attendance-justification" placeholder="Ex: Consulta médica">
                    </div>
                    <div style="display:flex;gap:0.5rem;">
                        <button id="attendance-save" class="btn btn-primary">Salvar</button>
                        <button id="attendance-cancel" class="btn">Cancelar</button>
                    </div>
                </div>
            </div>
        `;
        wrapper.style.display = 'block'; // Mostra o formulário

        // Event listener para cancelar
        document.getElementById('attendance-cancel').addEventListener('click', () => {
            wrapper.style.display = 'none';
            wrapper.innerHTML = '';
        });

        // Event listener para salvar
        document.getElementById('attendance-save').addEventListener('click', () => {
            const subjectId = document.getElementById('attendance-subject').value;
            const date = document.getElementById('attendance-date').value;
            const status = document.getElementById('attendance-status').value;
            const justification = document.getElementById('attendance-justification').value.trim();

            // Validação dos campos obrigatórios
            if (!subjectId || !date) {
                alert('Preencha a matéria e a data.');
                return;
            }

            // Cria novo registro de presença
            const newRecord = {
                id: String(Date.now()), // ID baseado no timestamp
                subjectId,
                date,
                present: status === 'present',
                justification: justification || undefined
            };

            // Adiciona ao estado e renderiza novamente
            state.attendance.push(newRecord);
            renderApp();
        });
    }

    // Renderiza o gerenciador de notas
    function renderGradesManager() {
         mainContentContainer.innerHTML = `
            <div class="header">
                <h1>Controle de Notas</h1>
                <p>Gerencie suas notas e acompanhe seu desempenho</p>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Registrar Nota</h3>
                </div>
                <div class="card-content" id="grades-actions">
                    <button id="btn-add-grade" class="btn btn-primary">+ Adicionar nota</button>
                    <div id="grade-form-wrapper" style="margin-top:1rem; display:none;"></div>
                </div>
            </div>

            <div class="card">
                <div class="card-content">
                    <table class="data-table" id="grades-table">
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Matéria</th>
                                <th>Atividade</th>
                                <th>Peso</th>
                                <th>Nota</th>
                                <th>Nota Convertida (0-10)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${state.grades.sort((a,b) => new Date(b.date) - new Date(a.date)).map(g => {
                                // Converte a nota para escala 0-10
                                const convertedGrade = ((g.score / g.maxScore) * 10).toFixed(1);
                                return `
                                    <tr>
                                        <td>${new Date(g.date).toLocaleDateString('pt-BR')}</td>
                                        <td>${state.subjects.find(s => s.id === g.subjectId)?.name || ''}</td>
                                        <td>${g.activityName}</td>
                                        <td>${g.weight}</td>
                                        <td>${g.score} / ${g.maxScore}</td>
                                        <td><span class="badge ${convertedGrade >= 7 ? 'badge-success' : 'badge-danger'}">${convertedGrade}</span></td>
                                    </tr>
                                `
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        // Adiciona event listener ao botão de adicionar nota
        document.getElementById('btn-add-grade').addEventListener('click', () => {
            openGradeForm();
        });
    }

    // Abre o formulário para adicionar nova nota
    function openGradeForm() {
        const wrapper = document.getElementById('grade-form-wrapper');
        wrapper.innerHTML = `
            <div class="card" style="padding:0.75rem;">
                <div class="card-content">
                    <div class="form-group">
                        <label for="grade-subject">Matéria</label>
                        <select id="grade-subject">
                            ${state.subjects.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="grade-activity">Atividade</label>
                        <input type="text" id="grade-activity" placeholder="Ex: Prova 2">
                    </div>
                    <div class="form-group">
                        <label for="grade-weight">Peso</label>
                        <input type="number" id="grade-weight" min="0" value="1">
                    </div>
                    <div class="form-group">
                        <label for="grade-score">Nota obtida</label>
                        <input type="number" id="grade-score" step="0.01" min="0" value="0">
                    </div>
                    <div class="form-group">
                        <label for="grade-maxscore">Nota máxima</label>
                        <input type="number" id="grade-maxscore" step="0.01" min="0.01" value="10">
                    </div>
                    <div class="form-group">
                        <label for="grade-date">Data</label>
                        <input type="date" id="grade-date" value="${new Date().toISOString().slice(0,10)}">
                    </div>
                    <div style="display:flex;gap:0.5rem;">
                        <button id="grade-save" class="btn btn-primary">Salvar</button>
                        <button id="grade-cancel" class="btn">Cancelar</button>
                    </div>
                </div>
            </div>
        `;
        wrapper.style.display = 'block'; // Mostra o formulário

        // Event listener para cancelar
        document.getElementById('grade-cancel').addEventListener('click', () => {
            wrapper.style.display = 'none';
            wrapper.innerHTML = '';
        });

        // Event listener para salvar
        document.getElementById('grade-save').addEventListener('click', () => {
            const subjectId = document.getElementById('grade-subject').value;
            const activityName = document.getElementById('grade-activity').value.trim();
            const weight = Number(document.getElementById('grade-weight').value);
            const score = Number(document.getElementById('grade-score').value);
            const maxScore = Number(document.getElementById('grade-maxscore').value);
            const date = document.getElementById('grade-date').value;

            // Validação dos campos obrigatórios
            if (!subjectId || !activityName || !date || !maxScore || maxScore <= 0) {
                alert('Preencha os campos obrigatórios corretamente.');
                return;
            }

            // Cria novo objeto de nota
            const newGrade = {
                id: String(Date.now()), // ID baseado no timestamp
                subjectId,
                activityName,
                weight: isNaN(weight) ? 1 : weight,
                score: isNaN(score) ? 0 : score,
                maxScore: isNaN(maxScore) ? 10 : maxScore,
                date
            };

            // Adiciona ao estado e renderiza novamente
            state.grades.push(newGrade);
            renderApp();
        });
    }

    // Renderiza a tela de relatórios
    function renderReports() {
        mainContentContainer.innerHTML = `
            <div class="header">
                <h1>Relatórios</h1>
                <p>Análise detalhada do seu desempenho acadêmico</p>
            </div>
            <div class="card">
                <div class="card-header"><h3 class="card-title">Gerar Relatórios</h3></div>
                <div class="card-content">
                    <button class="btn" onclick="alert('Funcionalidade de PDF não implementada.')">Exportar PDF Completo</button>
                    <button class="btn" onclick="alert('Funcionalidade de PDF não implementada.')">Exportar Resumo</button>
                </div>
            </div>
        `;
    }

    // Renderiza a tela de configurações
    function renderSettings() {
        mainContentContainer.innerHTML = `
            <div class="header">
                <h1>Configurações</h1>
                <p>Gerencie suas preferências</p>
            </div>
            <div class="card">
                <div class="card-header"><h3 class="card-title">Perfil</h3></div>
                <div class="card-content">
                    <div class="form-group">
                        <label for="name-setting">Nome</label>
                        <input type="text" id="name-setting" value="${state.user.name}">
                    </div>
                     <div class="form-group">
                        <label for="email-setting">Email</label>
                        <input type="email" id="email-setting" value="${state.user.email}">
                    </div>
                    <button class="btn" onclick="alert('Funcionalidade não implementada.')">Salvar Alterações</button>
                </div>
            </div>
             <div class="card">
                <div class="card-header"><h3 class="card-title">Aparência</h3></div>
                <div class="card-content">
                    <p>Tema (Não implementado)</p>
                </div>
            </div>
        `;
    }

    // --- CONFIGURAÇÃO DE EVENT LISTENERS ---

    // Event listener para o formulário de login
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Previne comportamento padrão do formulário
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        login(email, password); // Chama função de login
    });

    // --- INICIALIZAÇÃO DA APLICAÇÃO ---

    // Verifica se há estado salvo no localStorage (persistência de login)
    const savedState = localStorage.getItem('authState');
    if (savedState) {
        const parsedState = JSON.parse(savedState);
        if (parsedState.isAuthenticated) {
            state = parsedState; // Restaura estado salvo
        }
    }
    
    // Renderiza a aplicação pela primeira vez
    renderApp();
});