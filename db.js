// ============================================================
// NetSim — Модуль базы данных v2.0
// Хранение: MySQL через Backend API (server.js)
// Fallback: localStorage (если сервер недоступен)
// ============================================================

const API = 'http://localhost:3000/api';

const DB = {
    // ─────────────────────────────────────────
    // Вспомогательный метод для API-запросов
    // ─────────────────────────────────────────
    async _request(method, endpoint, body = null) {
        try {
            const options = {
                method,
                headers: { 'Content-Type': 'application/json' }
            };
            if (body) options.body = JSON.stringify(body);
            const res = await fetch(`${API}${endpoint}`, options);
            return await res.json();
        } catch (err) {
            console.warn('⚠️ Сервер недоступен, использую localStorage:', err.message);
            return null; // null = сервер недоступен
        }
    },

    // ─────────────────────────────────────────
    // Хеширование паролей (Web Crypto API)
    // ─────────────────────────────────────────
    async hashPassword(password) {
        const encoder = new TextEncoder();
        const data    = encoder.encode(password);
        const hashBuf = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(hashBuf))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    },

    // ─────────────────────────────────────────
    // ПОЛЬЗОВАТЕЛИ
    // ─────────────────────────────────────────

    // Регистрация
    async register(name, login, password) {
        const result = await this._request('POST', '/register', { name, login, password });
        if (result !== null) return result; // ответ от сервера

        // Fallback: localStorage
        const users = this.getUsers();
        if (users.find(u => u.login === login)) return { ok: false, msg: 'Этот логин уже занят' };
        const passwordHash = await this.hashPassword(password);
        const user = {
            id: this._nextId(users), name, login,
            password: passwordHash,
            lessons_done: 0, last_lesson: '—', errors: 0,
            registered: new Date().toLocaleDateString('ru-RU')
        };
        users.push(user);
        this._saveLocal('users', users);
        return { ok: true, user };
    },

    // Вход
    async loginUser(login, password) {
        const result = await this._request('POST', '/login', { login, password });
        if (result !== null) return result; // ответ от сервера

        // Fallback: localStorage
        const passwordHash = await this.hashPassword(password);
        const user = this.getUsers().find(u => u.login === login && u.password === passwordHash);
        if (!user) return { ok: false, msg: 'Неверный логин или пароль' };
        return { ok: true, user };
    },

    // Получить всех пользователей
    async getUsersAsync() {
        const result = await this._request('GET', '/users');
        if (result !== null) return result;
        return this.getUsers();
    },

    // Удалить пользователя
    async deleteUserAsync(id) {
        const result = await this._request('DELETE', `/users/${id}`);
        if (result !== null) return result;
        // Fallback
        const list = this.getUsers().filter(u => u.id !== id);
        this._saveLocal('users', list);
        return { ok: true };
    },

    // Обновить прогресс
    async updateProgress(login, lessonName, isSuccess) {
        const user = this.getCurrentUser();

        // Серверный вариант
        if (user && user.id) {
            const lessonMap = {
                'Урок 1.1: Соединение двух ПК': 1,
                'Урок 1.2: Поиск ошибки в локальной сети': 2,
                'Урок 1.3: Основной шлюз': 3,
                'Урок 1.4: Разбиение сети': 4,
                'Урок 2.1: Настройка DHCP-сервера': 5,
                'Урок 2.2: Безопасность Wi-Fi сети': 6,
                'Урок 3.1: Работа с утилитой Ping': 7,
                'Урок 3.2: Просмотр сетевых настроек (ipconfig)': 8,
                'Урок 4.1: Настройка DNS': 9,
                'Урок 4.2: Утилита nslookup': 10,
                'Урок 5.1: Настройка ACL (Access Control List)': 11,
                'Урок 5.2: Протокол ARP': 12,
                'Урок 5.3: Настройка статического NAT': 13,
                'Урок 5.4: Работа с tracert / traceroute': 14,
                'Урок 5.5: Диагностика: команда netstat': 15
            };
            const lessonId = lessonMap[lessonName] || 1;
            await this._request('POST', '/progress', { userId: user.id, lessonId, isSuccess });
        }

        // Fallback: localStorage
        const users = this.getUsers();
        const u = users.find(u => u.login === login);
        if (!u) return;
        if (isSuccess) {
            u.lessons_done = Math.min(15, (u.lessons_done || 0) + 1);
            u.last_lesson  = lessonName;
        } else {
            u.errors = (u.errors || 0) + 1;
        }
        this._saveLocal('users', users);
    },

    // ─────────────────────────────────────────
    // УСТРОЙСТВА
    // ─────────────────────────────────────────

    async getDevicesAsync() {
        const result = await this._request('GET', '/devices');
        if (result !== null) return result;
        return this.getDevices();
    },

    async addDeviceAsync(dev) {
        const result = await this._request('POST', '/devices', dev);
        if (result !== null) return result;
        return { ok: true, ...this.addDevice(dev) };
    },

    async deleteDeviceAsync(id) {
        const result = await this._request('DELETE', `/devices/${id}`);
        if (result !== null) return result;
        this.deleteDevice(id);
        return { ok: true };
    },

    // ─────────────────────────────────────────
    // ТИКЕТЫ
    // ─────────────────────────────────────────

    async getTicketsAsync() {
        const result = await this._request('GET', '/tickets');
        if (result !== null) return result;
        return this.getTickets();
    },

    async addTicketAsync(ticket) {
        const user = this.getCurrentUser();
        const result = await this._request('POST', '/tickets', {
            userId: user?.id || 1,
            subject: ticket.problem || ticket.subject,
            message: ticket.problem || ticket.message || ''
        });
        if (result !== null) return result;
        return { ok: true };
    },

    async closeTicketAsync(id) {
        const result = await this._request('PATCH', `/tickets/${id}/close`);
        if (result !== null) return result;
        this.closeTicket(id);
        return { ok: true };
    },

    async deleteTicketAsync(id) {
        const result = await this._request('DELETE', `/tickets/${id}`);
        if (result !== null) return result;
        this.deleteTicket(id);
        return { ok: true };
    },

    // ─────────────────────────────────────────
    // DHCP
    // ─────────────────────────────────────────

    async getDHCPAsync() {
        const result = await this._request('GET', '/dhcp');
        if (result !== null) return result;
        return this.getDHCP();
    },

    // ─────────────────────────────────────────
    // СЕССИЯ (localStorage — только для браузера)
    // ─────────────────────────────────────────

    getCurrentUser() {
        try {
            const raw = localStorage.getItem('netsim_current_user');
            if (!raw) return null;
            const { user, expires } = JSON.parse(raw);
            if (expires && Date.now() > expires) {
                localStorage.removeItem('netsim_current_user');
                return null;
            }
            return user;
        } catch(e) { return null; }
    },
    setCurrentUser(user) {
        const expires = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 дней
        localStorage.setItem('netsim_current_user', JSON.stringify({ user, expires }));
    },
    logout() { localStorage.removeItem('netsim_current_user'); },

    // ─────────────────────────────────────────
    // FALLBACK: localStorage методы
    // ─────────────────────────────────────────

    KEYS: {
        devices: 'netsim_devices',
        users:   'netsim_users',
        tickets: 'netsim_tickets',
        dhcp:    'netsim_dhcp'
    },

    defaults: {
        devices: [
            { id:1, name:'Router-Main',   mac:'B8:27:EB:AA:BB:CC', ip:'192.168.1.1',   type:'Роутер',      status:'online'  },
            { id:2, name:'Switch-Core',   mac:'A4:C3:F0:11:22:33', ip:'192.168.1.2',   type:'Коммутатор',  status:'online'  },
            { id:3, name:'PC-User-01',    mac:'DC:A6:32:12:34:56', ip:'192.168.1.101', type:'ПК',          status:'online'  },
            { id:4, name:'PC-User-02',    mac:'E4:5F:01:AB:CD:EF', ip:'192.168.1.102', type:'ПК',          status:'online'  },
            { id:5, name:'PC-Lab-03',     mac:'F0:18:98:78:56:34', ip:'192.168.1.103', type:'ПК',          status:'offline' },
            { id:6, name:'Server-DNS',    mac:'00:50:56:C0:00:08', ip:'192.168.1.10',  type:'Сервер',      status:'online'  }
        ],
        users: [],
        tickets: [
            { id:1, user:'admin', problem:'Тест системы тикетов', status:'open', date:'02.05.2026', resolution:'', resolvedDate:'' }
        ],
        dhcp: {
            enabled: true, start: '192.168.1.100', end: '192.168.1.199',
            gateway: '192.168.1.1', dns: '8.8.8.8', lease: '24'
        }
    },

    _loadLocal(key) {
        try {
            const d = localStorage.getItem(this.KEYS[key]);
            return d ? JSON.parse(d) : null;
        } catch(e) { return null; }
    },
    _saveLocal(key, data) { localStorage.setItem(this.KEYS[key], JSON.stringify(data)); },
    _nextId(arr) { return arr.length ? Math.max(...arr.map(x => x.id)) + 1 : 1; },

    getUsers()       { return this._loadLocal('users') || JSON.parse(JSON.stringify(this.defaults.users)); },
    getDevices()     { return this._loadLocal('devices') || JSON.parse(JSON.stringify(this.defaults.devices)); },
    saveDevices(d)   { this._saveLocal('devices', d); },
    addDevice(dev)   {
        const list = this.getDevices(); dev.id = this._nextId(list);
        list.push(dev); this.saveDevices(list); return list;
    },
    deleteDevice(id) {
        const list = this.getDevices().filter(d => d.id !== id);
        this.saveDevices(list); return list;
    },
    getTickets()     { return this._loadLocal('tickets') || JSON.parse(JSON.stringify(this.defaults.tickets)); },
    saveTickets(d)   { this._saveLocal('tickets', d); },
    addTicket(t)     {
        const list = this.getTickets(); t.id = this._nextId(list);
        t.date = new Date().toLocaleDateString('ru-RU'); t.status = 'open';
        list.push(t); this.saveTickets(list); return list;
    },
    closeTicket(id, resolution = '') {
        const list = this.getTickets();
        const t = list.find(t => t.id === id);
        if (t) {
            t.status = 'closed';
            t.resolution = resolution;
            t.resolvedDate = new Date().toLocaleDateString('ru-RU');
        }
        this.saveTickets(list);
        return list;
    },
    deleteTicket(id) {
        const list = this.getTickets().filter(t => t.id !== id);
        this.saveTickets(list); return list;
    },
    getDHCP()        { return this._loadLocal('dhcp') || JSON.parse(JSON.stringify(this.defaults.dhcp)); },
    saveDHCP(d)      { this._saveLocal('dhcp', d); },

    // ─────────────────────────────────────────
    // EXCEL ЭКСПОРТ (SheetJS)
    // ─────────────────────────────────────────
    exportToExcel(data, filename, sheetName = 'Данные') {
        if (typeof XLSX === 'undefined') { alert('Библиотека SheetJS не загружена'); return; }
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
        XLSX.writeFile(wb, filename);
    },

    importFromExcel(file, callback) {
        if (typeof XLSX === 'undefined') { alert('Библиотека SheetJS не загружена'); return; }
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const wb   = XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
                const ws   = wb.Sheets[wb.SheetNames[0]];
                const json = XLSX.utils.sheet_to_json(ws);
                callback(null, json);
            } catch(err) { callback(err, null); }
        };
        reader.readAsArrayBuffer(file);
    }
};
