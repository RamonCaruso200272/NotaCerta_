// Aguarda o carregamento completo do DOM antes de executar o código
document.addEventListener('DOMContentLoaded', () => {

    // --- DADOS MOCK (FICTÍCIOS) PARA TESTES ---
    // Usados apenas para NOVOS usuários registrados
    const mockSubjects = [
        { id: '1', name: 'Engenharia de Software', code: 'CS401', professor: 'Dr. Ana', credits: 4, schedule: 'Seg 10:00-12:00' },
        { id: '2', name: 'Banco de Dados', code: 'CS305', professor: 'Prof. Beto', credits: 4, schedule: 'Qua 14:00-16:00' },
    ];
    const mockAttendance = [
        { id: '1', subjectId: '1', date: '2024-01-15', present: true, justification: '' },
        { id: '2', subjectId: '1', date: '2024-01-17', present: false, justification: 'Consulta médica' },
    ];
    const mockGrades = [
        { id: '1', subjectId: '1', activityName: 'Prova 1', weight: 3, score: 8.5, maxScore: 10, date: '2024-01-20' },
        { id: '2', subjectId: '2', activityName: 'Projeto Final', weight: 4, score: 9.5, maxScore: 10, date: '2024-01-30' },
    ];

    // --- GERENCIAMENTO DE ESTADO DA APLICAÇÃO ---
    
    // Objeto que armazena todos os usuários, carregado do localStorage
    let appUsersDB = {}; 

    // Objeto que armazena o estado global da aplicação
    let state = {
        isAuthenticated: false,
        currentView: 'dashboard',
        user: null // Armazenará os dados do usuário logado: { name, email, avatar, subjects, attendance, grades }
    };

    // --- SELEÇÃO DE ELEMENTOS DO DOM ---
    const loginView = document.getElementById('login-view');
    const registerView = document.getElementById('register-view');
    const mainView = document.getElementById('main-view');
    
    const sidebarContainer = document.getElementById('sidebar-container');
    const mainContentContainer = document.getElementById('main-content-container');
    
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const registerForm = document.getElementById('register-form');
    const registerError = document.getElementById('register-error');

    const showRegisterBtn = document.getElementById('show-register');
    const showLoginBtn = document.getElementById('show-login');

    // --- FUNÇÕES DE PERSISTÊNCIA (localStorage) ---

    // Salva o "banco de dados" completo de usuários no localStorage
    function saveDB() {
        try {
            localStorage.setItem('appUsersDB', JSON.stringify(appUsersDB));
        } catch (error) {
            console.error("Erro ao salvar DB de usuários no localStorage:", error);
        }
    }

    // Carrega o "banco de dados" completo de usuários
    function loadDB() {
        try {
            appUsersDB = JSON.parse(localStorage.getItem('appUsersDB') || '{}');
            
            // Adiciona o usuário admin@exemplo.com se ele não existir (para testes)
            if (!appUsersDB['admin@exemplo.com']) {
                appUsersDB['admin@exemplo.com'] = {
                    name: 'João Silva (Admin)',
                    email: 'admin@exemplo.com',
                    password: '123456',
                    avatar: 'https://github.com/shadcn.png',
                    subjects: mockSubjects,
                    attendance: mockAttendance,
                    grades: mockGrades
                };
                saveDB();
            }

        } catch (error) {
            console.error("Erro ao carregar DB de usuários:", error);
            appUsersDB = {};
        }
    }

    // Salva os dados acadêmicos (subjects, attendance, grades) DO USUÁRIO ATUAL de volta no DB
    function saveData() {
        if (!state.user || !state.user.email) return; // Não salva se não houver usuário logado
        
        try {
            // Atualiza os dados do usuário logado dentro do DB principal
            appUsersDB[state.user.email] = state.user;
            saveDB(); // Salva o DB principal atualizado
        } catch (error)
        {
            console.error("Erro ao salvar dados do usuário:", error);
        }
    }

    // Salva o status de autenticação (quem está logado)
    function saveAuth() {
        try {
            localStorage.setItem('authState', JSON.stringify({
                isAuthenticated: state.isAuthenticated,
                userEmail: state.user ? state.user.email : null
            }));
        } catch (error) {
            console.error("Erro ao salvar autenticação no localStorage:", error);
        }
    }

    // Carrega o estado de autenticação e os dados do usuário logado
    function loadState() {
        loadDB(); // Garante que o DB de usuários esteja carregado
        
        const savedAuth = localStorage.getItem('authState');
        if (savedAuth) {
            const parsedAuth = JSON.parse(savedAuth);
            // Se estava logado e o email existe
            if (parsedAuth.isAuthenticated && parsedAuth.userEmail && appUsersDB[parsedAuth.userEmail]) {
                state.isAuthenticated = true;
                // Carrega os dados do usuário do DB para o estado
                state.user = appUsersDB[parsedAuth.userEmail];
            }
        }
    }

    // --- CONTROLE DE VIEWS (Login/Registro) ---

    function showLoginView() {
        loginView.classList.add('active');
        registerView.classList.remove('active');
        mainView.classList.remove('active');
        loginError.textContent = '';
        registerError.textContent = '';
    }

    function showRegisterView() {
        loginView.classList.remove('active');
        registerView.classList.add('active');
        mainView.classList.remove('active');
        loginError.textContent = '';
        registerError.textContent = '';
    }

    // --- SISTEMA DE AUTENTICAÇÃO ---

    function register(name, email, password, confirmPassword) {
        if (!name || !email || !password || !confirmPassword) {
            registerError.textContent = 'Por favor, preencha todos os campos.';
            return;
        }
        if (password !== confirmPassword) {
            registerError.textContent = 'As senhas não coincidem.';
            return;
        }
        // Verifica se o email já existe no DB
        if (appUsersDB[email]) {
            registerError.textContent = 'Este email já está cadastrado.';
            return;
        }

        // Cria novo usuário
        const newUser = {
            name,
            email,
            password, // Em um app real, isso deve ser "hasheado"
            avatar: 'https://github.com/shadcn.png', // Avatar padrão
            subjects: [], // Começa com dados vazios
            attendance: [],
            grades: []
        };

        // Salva o novo usuário no DB
        appUsersDB[email] = newUser;
        saveDB();

        alert('Conta registrada com sucesso! Por favor, faça o login.');
        showLoginView();
    }


    function login(email, password) {
        const userFromDB = appUsersDB[email];

        // Verifica se usuário existe e se a senha está correta
        if (!userFromDB || userFromDB.password !== password) {
            loginError.textContent = 'Email ou senha incorretos.';
            return;
        }
        
        // Sucesso no login
        state.isAuthenticated = true;
        state.user = userFromDB; // Carrega dados do usuário no estado
        saveAuth(); // Salva o status de login
        renderApp();
    }

    function logout() {
        state.isAuthenticated = false;
        state.user = null;
        localStorage.removeItem('authState');
        showLoginView(); // Mostra a tela de login ao sair
    }

    // --- SISTEMA DE RENDERIZAÇÃO DA INTERFACE ---

    function renderApp() {
        if (state.isAuthenticated && state.user) {
            // Se autenticado, mostra a aplicação principal
            loginView.classList.remove('active');
            registerView.classList.remove('active');
            mainView.classList.add('active');
            renderSidebar();
            renderMainContent();
        } else {
            // Se não autenticado, mostra tela de login
            showLoginView();
        }
    }

    function renderSidebar() {
        // Agora lê dados de 'state.user'
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

        document.getElementById('logout-btn').addEventListener('click', logout);
    }

    function renderMainContent() {
        mainContentContainer.innerHTML = '';
        switch (state.currentView) {
            case 'dashboard': renderDashboard(); break;
            case 'subjects': renderSubjectsManager(); break;
            case 'attendance': renderAttendanceManager(); break;
            case 'grades': renderGradesManager(); break;
            case 'reports': renderReports(); break;
            case 'settings': renderSettings(); break;
        }
        // Adiciona event listeners globais para botões de ação (deleção)
        addGlobalEventListeners();
    }

    // Adiciona listeners para botões que são re-renderizados (como delete e edit)
    function addGlobalEventListeners() {
        // Listeners de Exclusão
        document.querySelectorAll('.btn-delete-subject').forEach(btn => {
            btn.addEventListener('click', () => deleteSubject(btn.dataset.id));
        });
        document.querySelectorAll('.btn-delete-attendance').forEach(btn => {
            btn.addEventListener('click', () => deleteAttendance(btn.dataset.id));
        });
        document.querySelectorAll('.btn-delete-grade').forEach(btn => {
            btn.addEventListener('click', () => deleteGrade(btn.dataset.id));
        });

        // Listeners de Edição
        document.querySelectorAll('.btn-edit-subject').forEach(btn => {
            btn.addEventListener('click', () => openSubjectForm(btn.dataset.id));
        });
        document.querySelectorAll('.btn-edit-attendance').forEach(btn => {
            btn.addEventListener('click', () => openAttendanceForm(btn.dataset.id));
        });
         document.querySelectorAll('.btn-edit-grade').forEach(btn => {
            btn.addEventListener('click', () => openGradeForm(btn.dataset.id));
        });
    }

    // --- DASHBOARD ---
    // Modificado para ler de 'state.user.*'
    function renderDashboard() {
        const totalSubjects = state.user.subjects.length;
        const totalClasses = state.user.attendance.length;
        const presentClasses = state.user.attendance.filter(a => a.present).length;
        const attendanceRate = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0;
        
        const subjectAverages = state.user.subjects.map(subject => {
            const subjectGrades = state.user.grades.filter(g => g.subjectId === subject.id);
            if (subjectGrades.length === 0) return { name: subject.name, average: 0 };
            const weightedSum = subjectGrades.reduce((sum, grade) => sum + (grade.score * grade.weight), 0);
            const totalWeight = subjectGrades.reduce((sum, grade) => sum + grade.weight, 0);
            return { 
                name: subject.name, 
                average: totalWeight > 0 ? (weightedSum / totalWeight).toFixed(1) : 0 
            };
        });

        const overallAverage = subjectAverages.length > 0 ? (subjectAverages.reduce((sum, s) => sum + parseFloat(s.average), 0) / subjectAverages.length).toFixed(1) : "0.0";

        mainContentContainer.innerHTML = `
            <div class="header">
                <h1>Dashboard</h1>
                <p>Visão geral do seu desempenho acadêmico</p>
            </div>
            <div class="grid-4">
                <div class="card">
                    <div class="card-header"><h3 class="card-title-sm">Total de Matérias</h3></div>
                    <div class="card-content">
                        <div class="stat-value">${totalSubjects}</div>
                        <p class="stat-desc">Semestre atual</p>
                    </div>
                </div>
                 <div class="card">
                    <div class="card-header"><h3 class="card-title-sm">Taxa de Presença</h3></div>
                    <div class="card-content">
                        <div class="stat-value">${attendanceRate}%</div>
                        <div class="progress-bar"><div style="width: ${attendanceRate}%"></div></div>
                    </div>
                </div>
                 <div class="card">
                    <div class="card-header"><h3 class="card-title-sm">Média Geral</h3></div>
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
        
        try {
            const absencesCtx = document.getElementById('absencesChart').getContext('2d');
            const gradesCtx = document.getElementById('gradesChart').getContext('2d');

            const absencesData = state.user.subjects.map(s => ({
                name: s.name,
                absences: state.user.attendance.filter(a => a.subjectId === s.id && !a.present).length
            }));

            new Chart(absencesCtx, {
                type: 'pie',
                data: {
                    labels: absencesData.map(d => d.name),
                    datasets: [{
                        label: 'Faltas',
                        data: absencesData.map(d => d.absences),
                        backgroundColor: ['#3b82f6', '#ef4444', '#f59e0b', '#22c55e', '#6366f1', '#ec4899'],
                    }]
                }
            });

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
                options: { scales: { y: { beginAtZero: true, max: 10 } } }
            });
        } catch(e) {
            console.warn("Chart.js não carregado ou erro ao renderizar gráficos.", e);
        }
    }

    // --- GERENCIADOR DE MATÉRIAS (CRUD) ---
    // Modificado para ler de 'state.user.subjects'
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
                    <div id="subject-form-wrapper" style="margin-top:1rem; display:none;"></div>
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
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${state.user.subjects.map(s => `
                                <tr>
                                    <td>${s.name}</td>
                                    <td><span class="badge">${s.code}</span></td>
                                    <td>${s.professor}</td>
                                    <td>${s.credits}</td>
                                    <td>${s.schedule}</td>
                                    <td class="actions-cell">
                                        <button class="btn-sm btn-edit btn-edit-subject" data-id="${s.id}">Editar</button>
                                        <button class="btn-sm btn-danger-outline btn-delete-subject" data-id="${s.id}">Excluir</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        document.getElementById('btn-open-add-subject').addEventListener('click', () => {
            openSubjectForm(); // Abre formulário para "Criar" (sem ID)
        });
    }

    function openSubjectForm(id = null) {
        const isEditing = id !== null;
        const subject = isEditing ? state.user.subjects.find(s => s.id === id) : {};
        if (isEditing && !subject) {
            console.error("Matéria não encontrada para edição");
            return;
        }

        const formWrapper = document.getElementById('subject-form-wrapper');
        formWrapper.innerHTML = `
            <div class="card" style="padding:0.75rem;">
                <div class="card-content">
                    <input type="hidden" id="subject-id" value="${isEditing ? subject.id : ''}">
                    <div class="form-group">
                        <label for="nomeMateria">Nome da Matéria</label>
                        <input type="text" id="nomeMateria" placeholder="Ex: Matemática" value="${isEditing ? subject.name : ''}">
                    </div>
                    <div class="form-group">
                        <label for="cadCodigo">Código da Matéria</label>
                        <input type="text" id="cadCodigo" placeholder="Ex: MAT101" value="${isEditing ? subject.code : ''}">
                    </div>
                    <div class="form-group">
                        <label for="cadProfessor">Nome do Professor</label>
                        <input type="text" id="cadProfessor" placeholder="Ex: Dr. Silva" value="${isEditing ? subject.professor : ''}">
                    </div>
                    <div class="form-group">
                        <label for="cadCreditos">Créditos</label>
                        <input type="number" id="cadCreditos" min="1" placeholder="Ex: 4" value="${isEditing ? subject.credits : ''}">
                    </div>
                    <div class="form-group">
                        <label for="cadHorario">Horário</label>
                        <input type="text" id="cadHorario" placeholder="Ex: Seg 10:00-12:00" value="${isEditing ? subject.schedule : ''}">
                    </div>
                    <div style="display:flex;gap:0.5rem;">
                        <button id="btn-save-materia" class="btn btn-primary">${isEditing ? 'Salvar Alterações' : 'Adicionar'}</button>
                        <button id="btn-cancelar-materia" class="btn">Cancelar</button>
                    </div>
                </div>
            </div>
        `;
        formWrapper.style.display = 'block';

        document.getElementById('btn-cancelar-materia').addEventListener('click', () => {
            formWrapper.style.display = 'none';
            formWrapper.innerHTML = '';
        });

        document.getElementById('btn-save-materia').addEventListener('click', () => {
            saveSubject();
        });
    }

    // Modificado para salvar em 'state.user.subjects'
    function saveSubject() {
        const id = document.getElementById('subject-id').value;
        const isEditing = id !== '';

        const name = document.getElementById('nomeMateria').value;
        const code = document.getElementById('cadCodigo').value;
        const professor = document.getElementById('cadProfessor').value;
        const credits = document.getElementById('cadCreditos').value;
        const schedule = document.getElementById('cadHorario').value;

        if (!name || !code || !professor || !credits || !schedule) {
            alert('Por favor, preencha todos os campos.');
            return;
        }

        if (isEditing) {
            // Atualizar (Update)
            const subjectIndex = state.user.subjects.findIndex(s => s.id === id);
            if (subjectIndex > -1) {
                state.user.subjects[subjectIndex] = { ...state.user.subjects[subjectIndex], name, code, professor, credits: parseInt(credits), schedule };
            }
        } else {
            // Criar (Create)
            const newSubject = {
                id: String(Date.now()), // ID único
                name,
                code,
                professor,
                credits: parseInt(credits),
                schedule
            };
            state.user.subjects.push(newSubject);
        }

        saveData(); // Salva dados do usuário no localStorage
        renderApp(); // Re-renderiza a aplicação
    }

    // Modificado para deletar de 'state.user.*'
    function deleteSubject(id) {
        if (confirm('Tem certeza que deseja excluir esta matéria? Isso também excluirá faltas e notas associadas.')) {
            state.user.subjects = state.user.subjects.filter(s => s.id !== id);
            // Opcional: Excluir dados associados
            state.user.attendance = state.user.attendance.filter(a => a.subjectId !== id);
            state.user.grades = state.user.grades.filter(g => g.subjectId !== id);
            
            saveData();
            renderApp();
        }
    }

    // --- GERENCIADOR DE FALTAS (CRUD) ---
    // Modificado para ler de 'state.user.attendance' e 'state.user.subjects'
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
                    <button id="btn-add-attendance" class="btn btn-primary">+ Adicionar registro de aula</button>
                    <div id="attendance-form-wrapper" style="margin-top:1rem; display:none;"></div>
                </div>
            </div>
            <div class="card">
                <div class="card-content">
                    <table class="data-table" id="attendance-table">
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Matéria</th>
                                <th>Status</th>
                                <th>Justificativa</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${state.user.attendance.sort((a,b) => new Date(b.date) - new Date(a.date)).map(a => `
                                <tr>
                                    <td>${new Date(a.date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</td>
                                    <td>${state.user.subjects.find(s => s.id === a.subjectId)?.name || 'Matéria não encontrada'}</td>
                                    <td>
                                        <span class="badge ${a.present ? 'badge-success' : 'badge-danger'}">
                                            ${a.present ? 'Presente' : 'Falta'}
                                        </span>
                                    </td>
                                    <td>${a.justification || '-'}</td>
                                    <td class="actions-cell">
                                        <button class="btn-sm btn-edit btn-edit-attendance" data-id="${a.id}">Editar</button>
                                        <button class="btn-sm btn-danger-outline btn-delete-attendance" data-id="${a.id}">Excluir</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        document.getElementById('btn-add-attendance').addEventListener('click', () => {
            openAttendanceForm(); // Abre para "Criar"
        });
    }

    function openAttendanceForm(id = null) {
        const isEditing = id !== null;
        const record = isEditing ? state.user.attendance.find(a => a.id === id) : {};
        if (isEditing && !record) return;

        const wrapper = document.getElementById('attendance-form-wrapper');
        wrapper.innerHTML = `
            <div class="card" style="padding:0.75rem;">
                <div class="card-content">
                    <input type="hidden" id="attendance-id" value="${isEditing ? record.id : ''}">
                    <div class="form-group">
                        <label for="attendance-subject">Matéria</label>
                        <select id="attendance-subject">
                            ${state.user.subjects.map(s => `<option value="${s.id}" ${isEditing && s.id === record.subjectId ? 'selected' : ''}>${s.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="attendance-date">Data</label>
                        <input type="date" id="attendance-date" value="${isEditing ? record.date : new Date().toISOString().slice(0,10)}">
                    </div>
                    <div class="form-group">
                        <label for="attendance-status">Status</label>
                        <select id="attendance-status">
                            <option value="present" ${isEditing && record.present ? 'selected' : ''}>Presente</option>
                            <option value="absent" ${isEditing && !record.present ? 'selected' : ''}>Falta</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="attendance-justification">Justificativa (opcional)</label>
                        <input type="text" id="attendance-justification" placeholder="Ex: Consulta médica" value="${isEditing ? record.justification || '' : ''}">
                    </div>
                    <div style="display:flex;gap:0.5rem;">
                        <button id="attendance-save" class="btn btn-primary">${isEditing ? 'Salvar Alterações' : 'Salvar'}</button>
                        <button id="attendance-cancel" class="btn">Cancelar</button>
                    </div>
                </div>
            </div>
        `;
        wrapper.style.display = 'block';

        document.getElementById('attendance-cancel').addEventListener('click', () => {
            wrapper.style.display = 'none';
            wrapper.innerHTML = '';
        });

        document.getElementById('attendance-save').addEventListener('click', () => {
            saveAttendance();
        });
    }

    // Modificado para salvar em 'state.user.attendance'
    function saveAttendance() {
        const id = document.getElementById('attendance-id').value;
        const isEditing = id !== '';

        const subjectId = document.getElementById('attendance-subject').value;
        const date = document.getElementById('attendance-date').value;
        const status = document.getElementById('attendance-status').value;
        const justification = document.getElementById('attendance-justification').value.trim();

        if (!subjectId || !date) {
            alert('Preencha a matéria e a data.');
            return;
        }

        if (isEditing) {
            // Atualizar (Update)
            const recordIndex = state.user.attendance.findIndex(a => a.id === id);
            if (recordIndex > -1) {
                state.user.attendance[recordIndex] = { ...state.user.attendance[recordIndex], subjectId, date, present: status === 'present', justification: justification || '' };
            }
        } else {
            // Criar (Create)
            const newRecord = {
                id: String(Date.now()),
                subjectId,
                date,
                present: status === 'present',
                justification: justification || ''
            };
            state.user.attendance.push(newRecord);
        }
        
        saveData();
        renderApp();
    }

    function deleteAttendance(id) {
         if (confirm('Tem certeza que deseja excluir este registro de presença?')) {
            state.user.attendance = state.user.attendance.filter(a => a.id !== id);
            saveData();
            renderApp();
         }
    }

    // --- GERENCIADOR DE NOTAS (CRUD) ---
    // Modificado para ler de 'state.user.grades'
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
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${state.user.grades.sort((a,b) => new Date(b.date) - new Date(a.date)).map(g => {
                                const convertedGrade = ((g.score / g.maxScore) * 10).toFixed(1);
                                return `
                                    <tr>
                                        <td>${new Date(g.date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</td>
                                        <td>${state.user.subjects.find(s => s.id === g.subjectId)?.name || 'Matéria não encontrada'}</td>
                                        <td>${g.activityName}</td>
                                        <td>${g.weight}</td>
                                        <td>${g.score} / ${g.maxScore}</td>
                                        <td><span class="badge ${convertedGrade >= 7 ? 'badge-success' : 'badge-danger'}">${convertedGrade}</span></td>
                                        <td class="actions-cell">
                                            <button class="btn-sm btn-edit btn-edit-grade" data-id="${g.id}">Editar</button>
                                            <button class="btn-sm btn-danger-outline btn-delete-grade" data-id="${g.id}">Excluir</button>
                                        </td>
                                    </tr>
                                `
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        document.getElementById('btn-add-grade').addEventListener('click', () => {
            openGradeForm(); // Abre para "Criar"
        });
    }
    
    function openGradeForm(id = null) {
        const isEditing = id !== null;
        const grade = isEditing ? state.user.grades.find(g => g.id === id) : {};
        if (isEditing && !grade) return;

        const wrapper = document.getElementById('grade-form-wrapper');
        wrapper.innerHTML = `
            <div class="card" style="padding:0.75rem;">
                <div class="card-content">
                    <input type="hidden" id="grade-id" value="${isEditing ? grade.id : ''}">
                    <div class="form-group">
                        <label for="grade-subject">Matéria</label>
                        <select id="grade-subject">
                            ${state.user.subjects.map(s => `<option value="${s.id}" ${isEditing && s.id === grade.subjectId ? 'selected' : ''}>${s.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="grade-activity">Atividade</label>
                        <input type="text" id="grade-activity" placeholder="Ex: Prova 2" value="${isEditing ? grade.activityName : ''}">
                    </div>
                    <div class="form-group">
                        <label for="grade-weight">Peso</label>
                        <input type="number" id="grade-weight" min="0" value="${isEditing ? grade.weight : '1'}">
                    </div>
                    <div class="form-group">
                        <label for="grade-score">Nota obtida</label>
                        <input type="number" id="grade-score" step="0.01" min="0" value="${isEditing ? grade.score : '0'}">
                    </div>
                    <div class="form-group">
                        <label for="grade-maxscore">Nota máxima</label>
                        <input type="number" id="grade-maxscore" step="0.01" min="0.01" value="${isEditing ? grade.maxScore : '10'}">
                    </div>
                    <div class="form-group">
                        <label for="grade-date">Data</label>
                        <input type="date" id="grade-date" value="${isEditing ? grade.date : new Date().toISOString().slice(0,10)}">
                    </div>
                    <div style="display:flex;gap:0.5rem;">
                        <button id="grade-save" class="btn btn-primary">${isEditing ? 'Salvar Alterações' : 'Salvar'}</button>
                        <button id="grade-cancel" class="btn">Cancelar</button>
                    </div>
                </div>
            </div>
        `;
        wrapper.style.display = 'block';

        document.getElementById('grade-cancel').addEventListener('click', () => {
            wrapper.style.display = 'none';
            wrapper.innerHTML = '';
        });

        document.getElementById('grade-save').addEventListener('click', () => {
            saveGrade();
        });
    }

    // Modificado para salvar em 'state.user.grades'
    function saveGrade() {
        const id = document.getElementById('grade-id').value;
        const isEditing = id !== '';

        const subjectId = document.getElementById('grade-subject').value;
        const activityName = document.getElementById('grade-activity').value.trim();
        const weight = Number(document.getElementById('grade-weight').value);
        const score = Number(document.getElementById('grade-score').value);
        const maxScore = Number(document.getElementById('grade-maxscore').value);
        const date = document.getElementById('grade-date').value;

        if (!subjectId || !activityName || !date || maxScore <= 0) {
            alert('Preencha os campos obrigatórios corretamente (Matéria, Atividade, Data, Nota Máx > 0).');
            return;
        }
        
        const newGradeData = {
            subjectId,
            activityName,
            weight: isNaN(weight) ? 1 : weight,
            score: isNaN(score) ? 0 : score,
            maxScore: isNaN(maxScore) ? 10 : maxScore,
            date
        };

        if (isEditing) {
            // Atualizar (Update)
            const gradeIndex = state.user.grades.findIndex(g => g.id === id);
            if(gradeIndex > -1) {
                state.user.grades[gradeIndex] = { ...state.user.grades[gradeIndex], ...newGradeData };
            }
        } else {
            // Criar (Create)
            state.user.grades.push({
                id: String(Date.now()),
                ...newGradeData
            });
        }

        saveData();
        renderApp();
    }
    
    function deleteGrade(id) {
        if (confirm('Tem certeza que deseja excluir este registro de nota?')) {
            state.user.grades = state.user.grades.filter(g => g.id !== id);
            saveData();
            renderApp();
         }
    }


    // --- TELAS ESTÁTICAS (Relatórios, Configurações) ---

    function renderReports() {
        mainContentContainer.innerHTML = `
            <div class="header">
                <h1>Relatórios</h1>
                <p>Análise detalhada do seu desempenho acadêmico</p>
            </div>
            <div class="card">
                <div class="card-header"><h3 class="card-title">Gerar Relatórios</h3></div>
                <div class="card-content">
                    <p>Esta funcionalidade pode ser implementada futuramente para gerar PDFs ou CSVs com base nos dados salvos.</p>
                    <button class="btn" onclick="alert('Funcionalidade de PDF não implementada.')">Exportar PDF Completo</button>
                </div>
            </div>
        `;
    }

    // Modificado para editar 'state.user' e limpar dados do usuário
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
                        <input type="email" id="email-setting" value="${state.user.email}" readonly>
                         <small>O email não pode ser alterado.</small>
                    </div>
                    <button id="btn-save-profile" class="btn btn-primary">Salvar Alterações de Perfil</button>
                </div>
            </div>
             <div class="card">
                <div class="card-header"><h3 class="card-title">Perigo</h3></div>
                <div class="card-content">
                     <p>Isto apagará permanentemente todas as suas matérias, faltas e notas.</p>
                    <button id="btn-clear-data" class="btn btn-danger-outline">Apagar Todos os Meus Dados</button>
                </div>
            </div>
        `;

        // Salvar alterações de perfil (nome)
        document.getElementById('btn-save-profile').addEventListener('click', () => {
            const newName = document.getElementById('name-setting').value;
            if (newName && newName.trim() !== '') {
                state.user.name = newName.trim();
                saveData(); // Salva o nome atualizado no DB
                renderSidebar(); // Atualiza a sidebar para mostrar o novo nome
                alert('Nome atualizado com sucesso!');
            } else {
                alert('O nome não pode ficar em branco.');
            }
        });

        // Apagar dados do USUÁRIO ATUAL
        document.getElementById('btn-clear-data').addEventListener('click', () => {
            if(confirm('ATENÇÃO! Você tem certeza que deseja apagar TODOS os seus dados acadêmicos (matérias, faltas, notas)? Esta ação não pode ser desfeita.')) {
                if(confirm('Confirmação final: APAGAR TUDO?')) {
                    // Limpa os dados apenas do usuário logado
                    state.user.subjects = [];
                    state.user.attendance = [];
                    state.user.grades = [];
                    
                    saveData(); // Salva o estado "limpo" do usuário
                    renderApp(); // Re-renderiza tudo
                    alert('Todos os seus dados foram apagados.');
                }
            }
        });
    }

    // --- CONFIGURAÇÃO DE EVENT LISTENERS ---

    // Alternar para view de Registro
    showRegisterBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showRegisterView();
    });

    // Alternar para view de Login
    showLoginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showLoginView();
    });

    // Submit do formulário de Login
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        login(email, password);
    });

    // Submit do formulário de Registro
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;
        register(name, email, password, confirmPassword);
    });

    // --- INICIALIZAÇÃO DA APLICAÇÃO ---
    
    loadState(); // Carrega dados do localStorage (DB de usuários e status de auth)
    renderApp(); // Renderiza a aplicação (mostra login ou app principal)
});