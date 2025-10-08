document.addEventListener('DOMContentLoaded', () => {
    // --- MOCK DATA ---
    const mockSubjects = [
        { id: '1', name: 'Matemática Aplicada', code: 'MAT001', professor: 'Prof. Ana Santos', credits: 4, schedule: 'Seg/Qua 14:00-16:00' },
        { id: '2', name: 'Programação Web', code: 'PRG002', professor: 'Prof. Carlos Lima', credits: 6, schedule: 'Ter/Qui 08:00-10:00' },
        { id: '3', name: 'Banco de Dados', code: 'BDD003', professor: 'Prof. Maria Silva', credits: 4, schedule: 'Sex 14:00-18:00' },
        { id: '4', name: 'Engenharia de Software', code: 'ENG004', professor: 'Prof. João Oliveira', credits: 5, schedule: 'Seg/Qua 08:00-10:00' }
    ];

    const mockAttendance = [
        { id: '1', subjectId: '1', date: '2024-01-15', present: true },
        { id: '2', subjectId: '1', date: '2024-01-17', present: false, justification: 'Consulta médica' },
        { id: '3', subjectId: '2', date: '2024-01-16', present: true },
        { id: '4', subjectId: '2', date: '2024-01-18', present: true },
        { id: '5', subjectId: '3', date: '2024-01-19', present: false },
        { id: '6', subjectId: '4', date: '2024-01-15', present: true },
    ];

    const mockGrades = [
        { id: '1', subjectId: '1', activityName: 'Prova 1', weight: 3, score: 8.5, maxScore: 10, date: '2024-01-20' },
        { id: '2', subjectId: '1', activityName: 'Trabalho 1', weight: 2, score: 9.0, maxScore: 10, date: '2024-01-25' },
        { id: '3', subjectId: '2', activityName: 'Projeto Final', weight: 4, score: 9.5, maxScore: 10, date: '2024-01-30' },
        { id: '4', subjectId: '2', activityName: 'Prova Teórica', weight: 3, score: 7.8, maxScore: 10, date: '2024-02-05' },
        { id: '5', subjectId: '3', activityName: 'Modelagem ER', weight: 2, score: 8.2, maxScore: 10, date: '2024-02-10' }
    ];

    // --- STATE MANAGEMENT ---
    let state = {
        isAuthenticated: false,
        currentView: 'dashboard',
        user: null,
        subjects: mockSubjects,
        attendance: mockAttendance,
        grades: mockGrades
    };

    // --- DOM ELEMENTS ---
    const loginView = document.getElementById('login-view');
    const mainView = document.getElementById('main-view');
    const sidebarContainer = document.getElementById('sidebar-container');
    const mainContentContainer = document.getElementById('main-content-container');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');

    // --- AUTHENTICATION ---
    function login(email, password) {
        if (email === 'admin@exemplo.com' && password === '123456') {
            state.isAuthenticated = true;
            state.user = { name: 'João Silva', email: 'admin@exemplo.com', avatar: 'https://github.com/shadcn.png' };
            localStorage.setItem('authState', JSON.stringify(state));
            renderApp();
        } else {
            loginError.textContent = 'Email ou senha incorretos.';
        }
    }

    function logout() {
        state.isAuthenticated = false;
        state.user = null;
        localStorage.removeItem('authState');
        renderApp();
    }
    
    // --- RENDERING ---
    function renderApp() {
        if (state.isAuthenticated) {
            loginView.classList.remove('active');
            mainView.classList.add('active');
            renderSidebar();
            renderMainContent();
        } else {
            loginView.classList.add('active');
            mainView.classList.remove('active');
        }
    }

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

    function renderDashboard() {
        const totalSubjects = state.subjects.length;
        const totalClasses = state.attendance.length;
        const presentClasses = state.attendance.filter(a => a.present).length;
        const attendanceRate = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0;
        
        const subjectAverages = state.subjects.map(subject => {
            const subjectGrades = state.grades.filter(g => g.subjectId === subject.id);
            if (subjectGrades.length === 0) return { name: subject.name, average: 0 };
            const weightedSum = subjectGrades.reduce((sum, grade) => sum + (grade.score * grade.weight), 0);
            const totalWeight = subjectGrades.reduce((sum, grade) => sum + grade.weight, 0);
            return { name: subject.name, average: totalWeight > 0 ? (weightedSum / totalWeight).toFixed(1) : 0 };
        });

        const overallAverage = (subjectAverages.reduce((sum, s) => sum + parseFloat(s.average), 0) / subjectAverages.length).toFixed(1);

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
        
        // Chart rendering
        const absencesCtx = document.getElementById('absencesChart').getContext('2d');
        const gradesCtx = document.getElementById('gradesChart').getContext('2d');

        const absencesData = state.subjects.map(s => ({
            name: s.name,
            absences: state.attendance.filter(a => a.subjectId === s.id && !a.present).length
        }));

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
                scales: { y: { beginAtZero: true, max: 10 } }
            }
        });
    }

    function renderSubjectsManager() {
        mainContentContainer.innerHTML = `
            <div class="header">
                <h1>Matérias</h1>
                <p>Gerencie suas disciplinas do semestre</p>
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
    }

    function renderAttendanceManager() {
        mainContentContainer.innerHTML = `
            <div class="header">
                <h1>Controle de Faltas</h1>
                <p>Gerencie sua presença nas aulas</p>
            </div>
            <div class="card">
                <div class="card-content">
                    <table class="data-table">
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
    }

    function renderGradesManager() {
         mainContentContainer.innerHTML = `
            <div class="header">
                <h1>Controle de Notas</h1>
                <p>Gerencie suas notas e acompanhe seu desempenho</p>
            </div>
            <div class="card">
                <div class="card-content">
                    <table class="data-table">
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
    }

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

    // --- EVENT LISTENERS ---
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        login(email, password);
    });

    // --- INITIALIZATION ---
    const savedState = localStorage.getItem('authState');
    if (savedState) {
        const parsedState = JSON.parse(savedState);
        if (parsedState.isAuthenticated) {
            state = parsedState;
        }
    }
    renderApp();
});