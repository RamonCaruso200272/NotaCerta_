document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURAÇÃO DA API ---
    // Endpoint apontando para o seu EC2
    const API_BASE_URL = 'http://54.197.1.2:3000/api'; 

    let state = {
        isAuthenticated: false,
        currentView: 'dashboard',
        user: null // Estrutura: { id, name, email, subjects: [], attendance: [], grades: [] }
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

    // --- FUNÇÕES AUXILIARES DE DADOS (API) ---

    // Busca dados atualizados do backend e atualiza o estado local
    async function refreshUserData() {
        if (!state.user || !state.user.id) return;
        try {
            const userId = state.user.id;
            
            // Busca Matérias, Faltas e Notas em paralelo
            const [subjectsRes, attendanceRes, gradesRes] = await Promise.all([
                fetch(`${API_BASE_URL}/subjects/${userId}`),
                fetch(`${API_BASE_URL}/attendance/${userId}`),
                fetch(`${API_BASE_URL}/grades/${userId}`)
            ]);

            const subjects = await subjectsRes.json();
            const attendance = await attendanceRes.json();
            const grades = await gradesRes.json();

            // Atualiza estado
            state.user.subjects = subjects;
            
            // Mapeia snake_case (banco) para camelCase (frontend) se necessário
            state.user.attendance = attendance.map(a => ({
                id: a.id,
                subjectId: a.subject_id,
                date: a.date, 
                present: Boolean(a.present),
                justification: a.justification
            }));

            state.user.grades = grades.map(g => ({
                id: g.id,
                subjectId: g.subject_id,
                activityName: g.activity_name,
                weight: Number(g.weight),
                score: Number(g.score),
                maxScore: Number(g.max_score),
                date: g.date
            }));

            renderApp();
        } catch (error) {
            console.error("Erro ao carregar dados:", error);
            alert("Erro de conexão com o servidor. Verifique se a API está rodando.");
        }
    }

    // --- SISTEMA DE AUTENTICAÇÃO ---

    async function login(email, password) {
        try {
            const res = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Erro no login');
            }

            const userData = await res.json(); // Retorna { id, name, email }
            
            state.isAuthenticated = true;
            state.user = {
                id: userData.id,
                name: userData.name,
                email: userData.email,
                avatar: 'https://github.com/shadcn.png', // Placeholder
                subjects: [], attendance: [], grades: []
            };

            // Salva sessão básica no localStorage para persistir F5
            localStorage.setItem('userSession', JSON.stringify({
                id: userData.id,
                name: userData.name,
                email: userData.email
            }));

            await refreshUserData();
        } catch (error) {
            loginError.textContent = error.message;
        }
    }

    async function register(name, email, password, confirmPassword) {
        if (password !== confirmPassword) {
            registerError.textContent = 'As senhas não coincidem.';
            return;
        }
        try {
            const res = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Erro ao registrar');
            }

            alert('Conta registrada com sucesso! Faça o login.');
            showLoginView();
        } catch (error) {
            registerError.textContent = error.message;
        }
    }

    function logout() {
        state.isAuthenticated = false;
        state.user = null;
        localStorage.removeItem('userSession');
        showLoginView();
    }

    function loadState() {
        const session = localStorage.getItem('userSession');
        if (session) {
            const parsed = JSON.parse(session);
            state.user = { 
                ...parsed, 
                avatar: 'https://github.com/shadcn.png',
                subjects: [], attendance: [], grades: []
            };
            state.isAuthenticated = true;
            refreshUserData(); // Carrega os dados reais do banco
        } else {
            showLoginView();
        }
    }

    // --- CONTROLE DE VIEWS ---

    function showLoginView() {
        loginView.classList.add('active');
        registerView.classList.remove('active');
        mainView.classList.remove('active');
        loginError.textContent = '';
    }

    function showRegisterView() {
        loginView.classList.remove('active');
        registerView.classList.add('active');
        mainView.classList.remove('active');
        registerError.textContent = '';
    }

    function renderApp() {
        if (state.isAuthenticated && state.user) {
            loginView.classList.remove('active');
            registerView.classList.remove('active');
            mainView.classList.add('active');
            renderSidebar();
            renderMainContent();
        } else {
            showLoginView();
        }
    }

    function renderSidebar() {
        sidebarContainer.innerHTML = `
            <div class="sidebar-header">
                <div class="logo">
                   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
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
            case 'dashboard': renderDashboard(); break;
            case 'subjects': renderSubjectsManager(); break;
            case 'attendance': renderAttendanceManager(); break;
            case 'grades': renderGradesManager(); break;
            case 'reports': renderReports(); break;
            case 'settings': renderSettings(); break;
        }
        addGlobalEventListeners();
    }

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
            btn.addEventListener('click', () => openSubjectForm(Number(btn.dataset.id)));
        });
        document.querySelectorAll('.btn-edit-attendance').forEach(btn => {
            btn.addEventListener('click', () => openAttendanceForm(Number(btn.dataset.id)));
        });
         document.querySelectorAll('.btn-edit-grade').forEach(btn => {
            btn.addEventListener('click', () => openGradeForm(Number(btn.dataset.id)));
        });
    }

    // --- DASHBOARD ---
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
            console.warn("Chart.js não carregado.", e);
        }
    }

    // --- GERENCIADOR DE MATÉRIAS (CRUD) ---
    function renderSubjectsManager() {
        mainContentContainer.innerHTML = `
            <div class="header">
                <h1>Matérias</h1>
                <p>Gerencie suas disciplinas</p>
            </div>
             <div class="card">
                <div class="card-header"><h3 class="card-title">Adicionar Matéria</h3></div>
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
        document.getElementById('btn-open-add-subject').addEventListener('click', () => openSubjectForm());
    }

    function openSubjectForm(id = null) {
        const isEditing = id !== null;
        const subject = isEditing ? state.user.subjects.find(s => s.id === id) : {};
        if (isEditing && !subject) return;

        const formWrapper = document.getElementById('subject-form-wrapper');
        formWrapper.innerHTML = `
            <div class="card" style="padding:0.75rem;">
                <div class="card-content">
                    <input type="hidden" id="subject-id" value="${isEditing ? subject.id : ''}">
                    <div class="form-group"><label>Nome</label><input type="text" id="nomeMateria" value="${isEditing ? subject.name : ''}"></div>
                    <div class="form-group"><label>Código</label><input type="text" id="cadCodigo" value="${isEditing ? subject.code : ''}"></div>
                    <div class="form-group"><label>Professor</label><input type="text" id="cadProfessor" value="${isEditing ? subject.professor : ''}"></div>
                    <div class="form-group"><label>Créditos</label><input type="number" id="cadCreditos" value="${isEditing ? subject.credits : ''}"></div>
                    <div class="form-group"><label>Horário</label><input type="text" id="cadHorario" value="${isEditing ? subject.schedule : ''}"></div>
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
        document.getElementById('btn-save-materia').addEventListener('click', saveSubject);
    }

    async function saveSubject() {
        const id = document.getElementById('subject-id').value;
        const isEditing = id !== '';
        
        const payload = {
            user_id: state.user.id,
            name: document.getElementById('nomeMateria').value,
            code: document.getElementById('cadCodigo').value,
            professor: document.getElementById('cadProfessor').value,
            credits: document.getElementById('cadCreditos').value,
            schedule: document.getElementById('cadHorario').value
        };

        if(!payload.name) return alert("Preencha o nome");

        const url = isEditing ? `${API_BASE_URL}/subjects/${id}` : `${API_BASE_URL}/subjects`;
        const method = isEditing ? 'PUT' : 'POST';

        await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        await refreshUserData();
    }

    async function deleteSubject(id) {
        if (!confirm('Excluir matéria?')) return;
        await fetch(`${API_BASE_URL}/subjects/${id}`, { method: 'DELETE' });
        await refreshUserData();
    }

    // --- GERENCIADOR DE FALTAS (CRUD) ---
    function renderAttendanceManager() {
        mainContentContainer.innerHTML = `
            <div class="header"><h1>Controle de Faltas</h1><p>Gerencie sua presença</p></div>
            <div class="card">
                <div class="card-header"><h3 class="card-title">Registrar</h3></div>
                <div class="card-content" id="attendance-actions">
                    <button id="btn-add-attendance" class="btn btn-primary">+ Novo registro</button>
                    <div id="attendance-form-wrapper" style="margin-top:1rem; display:none;"></div>
                </div>
            </div>
            <div class="card">
                <div class="card-content">
                    <table class="data-table">
                        <thead><tr><th>Data</th><th>Matéria</th><th>Status</th><th>Justificativa</th><th>Ações</th></tr></thead>
                        <tbody>
                            ${state.user.attendance.map(a => `
                                <tr>
                                    <td>${new Date(a.date).toLocaleDateString()}</td>
                                    <td>${state.user.subjects.find(s => s.id === a.subjectId)?.name || '-'}</td>
                                    <td>${a.present ? '<span class="badge badge-success">Presente</span>' : '<span class="badge badge-danger">Falta</span>'}</td>
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
        document.getElementById('btn-add-attendance').addEventListener('click', () => openAttendanceForm());
    }

    function openAttendanceForm(id = null) {
        const isEditing = id !== null;
        const record = isEditing ? state.user.attendance.find(a => a.id === id) : {};
        // Formata data para o input date (YYYY-MM-DD)
        const dateVal = record.date ? new Date(record.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

        const wrapper = document.getElementById('attendance-form-wrapper');
        wrapper.innerHTML = `
            <div class="card" style="padding:0.75rem;">
                <div class="card-content">
                    <input type="hidden" id="attendance-id" value="${isEditing ? record.id : ''}">
                    <div class="form-group">
                        <label>Matéria</label>
                        <select id="attendance-subject">
                            ${state.user.subjects.map(s => `<option value="${s.id}" ${isEditing && s.id === record.subjectId ? 'selected' : ''}>${s.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group"><label>Data</label><input type="date" id="attendance-date" value="${dateVal}"></div>
                    <div class="form-group"><label>Status</label>
                        <select id="attendance-status">
                            <option value="present" ${isEditing && record.present ? 'selected' : ''}>Presente</option>
                            <option value="absent" ${isEditing && !record.present ? 'selected' : ''}>Falta</option>
                        </select>
                    </div>
                    <div class="form-group"><label>Justificativa</label><input type="text" id="attendance-justification" value="${record.justification || ''}"></div>
                    <div style="display:flex;gap:0.5rem;">
                        <button id="attendance-save" class="btn btn-primary">Salvar</button>
                        <button id="attendance-cancel" class="btn">Cancelar</button>
                    </div>
                </div>
            </div>
        `;
        wrapper.style.display = 'block';
        document.getElementById('attendance-cancel').addEventListener('click', () => { wrapper.style.display = 'none'; wrapper.innerHTML = ''; });
        document.getElementById('attendance-save').addEventListener('click', saveAttendance);
    }

    async function saveAttendance() {
        const id = document.getElementById('attendance-id').value;
        const isEditing = id !== '';
        const payload = {
            user_id: state.user.id,
            subject_id: document.getElementById('attendance-subject').value,
            date: document.getElementById('attendance-date').value,
            present: document.getElementById('attendance-status').value === 'present',
            justification: document.getElementById('attendance-justification').value
        };

        const url = isEditing ? `${API_BASE_URL}/attendance/${id}` : `${API_BASE_URL}/attendance`;
        const method = isEditing ? 'PUT' : 'POST';

        await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        await refreshUserData();
    }

    async function deleteAttendance(id) {
        if (!confirm('Excluir?')) return;
        await fetch(`${API_BASE_URL}/attendance/${id}`, { method: 'DELETE' });
        await refreshUserData();
    }

    // --- GERENCIADOR DE NOTAS (CRUD) ---
    function renderGradesManager() {
         mainContentContainer.innerHTML = `
            <div class="header"><h1>Notas</h1><p>Gerencie suas avaliações</p></div>
            <div class="card">
                <div class="card-header"><h3 class="card-title">Registrar Nota</h3></div>
                <div class="card-content" id="grades-actions">
                    <button id="btn-add-grade" class="btn btn-primary">+ Adicionar nota</button>
                    <div id="grade-form-wrapper" style="margin-top:1rem; display:none;"></div>
                </div>
            </div>
            <div class="card">
                <div class="card-content">
                    <table class="data-table">
                        <thead><tr><th>Matéria</th><th>Atividade</th><th>Nota</th><th>Peso</th><th>Ações</th></tr></thead>
                        <tbody>
                            ${state.user.grades.map(g => `
                                <tr>
                                    <td>${state.user.subjects.find(s => s.id === g.subjectId)?.name || '-'}</td>
                                    <td>${g.activityName}</td>
                                    <td>${g.score}/${g.maxScore}</td>
                                    <td>${g.weight}</td>
                                    <td class="actions-cell">
                                        <button class="btn-sm btn-edit btn-edit-grade" data-id="${g.id}">Editar</button>
                                        <button class="btn-sm btn-danger-outline btn-delete-grade" data-id="${g.id}">Excluir</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        document.getElementById('btn-add-grade').addEventListener('click', () => openGradeForm());
    }
    
    function openGradeForm(id = null) {
        const isEditing = id !== null;
        const grade = isEditing ? state.user.grades.find(g => g.id === id) : {};
        const dateVal = grade.date ? new Date(grade.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

        const wrapper = document.getElementById('grade-form-wrapper');
        wrapper.innerHTML = `
            <div class="card" style="padding:0.75rem;">
                <div class="card-content">
                    <input type="hidden" id="grade-id" value="${isEditing ? grade.id : ''}">
                    <div class="form-group"><label>Matéria</label>
                        <select id="grade-subject">
                            ${state.user.subjects.map(s => `<option value="${s.id}" ${isEditing && s.id === grade.subjectId ? 'selected' : ''}>${s.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group"><label>Atividade</label><input type="text" id="grade-activity" value="${isEditing ? grade.activityName : ''}"></div>
                    <div class="form-group"><label>Peso</label><input type="number" id="grade-weight" value="${isEditing ? grade.weight : '1'}"></div>
                    <div class="form-group"><label>Nota</label><input type="number" id="grade-score" step="0.1" value="${isEditing ? grade.score : ''}"></div>
                    <div class="form-group"><label>Máximo</label><input type="number" id="grade-maxscore" value="${isEditing ? grade.maxScore : '10'}"></div>
                    <div class="form-group"><label>Data</label><input type="date" id="grade-date" value="${dateVal}"></div>
                    <div style="display:flex;gap:0.5rem;">
                        <button id="grade-save" class="btn btn-primary">Salvar</button>
                        <button id="grade-cancel" class="btn">Cancelar</button>
                    </div>
                </div>
            </div>
        `;
        wrapper.style.display = 'block';
        document.getElementById('grade-cancel').addEventListener('click', () => { wrapper.style.display = 'none'; wrapper.innerHTML = ''; });
        document.getElementById('grade-save').addEventListener('click', saveGrade);
    }

    async function saveGrade() {
        const id = document.getElementById('grade-id').value;
        const isEditing = id !== '';
        const payload = {
            user_id: state.user.id,
            subject_id: document.getElementById('grade-subject').value,
            activity_name: document.getElementById('grade-activity').value,
            weight: document.getElementById('grade-weight').value,
            score: document.getElementById('grade-score').value,
            max_score: document.getElementById('grade-maxscore').value,
            date: document.getElementById('grade-date').value
        };

        const url = isEditing ? `${API_BASE_URL}/grades/${id}` : `${API_BASE_URL}/grades`;
        const method = isEditing ? 'PUT' : 'POST';

        await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        await refreshUserData();
    }
    
    async function deleteGrade(id) {
        if (!confirm('Excluir nota?')) return;
        await fetch(`${API_BASE_URL}/grades/${id}`, { method: 'DELETE' });
        await refreshUserData();
    }

    // --- TELAS ESTÁTICAS ---
    function renderReports() {
        mainContentContainer.innerHTML = `
            <div class="header"><h1>Relatórios</h1></div>
            <div class="card">
                <div class="card-content"><p>Funcionalidade em desenvolvimento.</p></div>
            </div>
        `;
    }

    function renderSettings() {
        mainContentContainer.innerHTML = `
            <div class="header"><h1>Configurações</h1></div>
            <div class="card">
                <div class="card-header"><h3 class="card-title">Perfil</h3></div>
                <div class="card-content">
                    <p><strong>Nome:</strong> ${state.user.name}</p>
                    <p><strong>Email:</strong> ${state.user.email}</p>
                </div>
            </div>
        `;
    }

    // --- EVENT LISTENERS GERAIS ---
    showRegisterBtn.addEventListener('click', (e) => { e.preventDefault(); showRegisterView(); });
    showLoginBtn.addEventListener('click', (e) => { e.preventDefault(); showLoginView(); });

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        login(document.getElementById('email').value, document.getElementById('password').value);
    });

    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        register(
            document.getElementById('register-name').value,
            document.getElementById('register-email').value,
            document.getElementById('register-password').value,
            document.getElementById('register-confirm-password').value
        );
    });

    // Inicialização
    loadState();
});