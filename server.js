// ============================================================
// NetSim — Backend Server (Node.js + Express + MySQL)
// ============================================================

const express  = require('express');
const mysql    = require('mysql2/promise');
const cors     = require('cors');
const bcrypt   = require('bcryptjs');
const path     = require('path');
require('dotenv').config();

const app = express();

// Разрешаем все запросы с браузера (CORS)
app.use(cors());
app.use(express.json());

// Отдаём статические HTML-файлы из текущей папки
app.use(express.static(path.join(__dirname)));

// ──────────────────────────────────────────────
// Подключение к MySQL
// ──────────────────────────────────────────────
const pool = mysql.createPool({
    host:            process.env.DB_HOST     || 'localhost',
    user:            process.env.DB_USER     || 'root',
    password:        process.env.DB_PASSWORD || '',
    database:        process.env.DB_NAME     || 'netsim_db',
    waitForConnections: true,
    connectionLimit: 10
});

// Проверяем соединение при старте
(async () => {
    try {
        const conn = await pool.getConnection();
        console.log('✅ Подключение к MySQL успешно!');
        conn.release();
    } catch (err) {
        console.error('❌ Ошибка подключения к MySQL:', err.message);
        console.error('   Проверь .env файл и убедись, что MySQL запущен.');
    }
})();

// ──────────────────────────────────────────────
// МАРШРУТЫ: ПОЛЬЗОВАТЕЛИ
// ──────────────────────────────────────────────

// Получить всех пользователей (для админ-панели)
app.get('/api/users', async (req, res) => {
    try {
        const [rows] = await pool.execute(
            `SELECT u.id, u.username, u.full_name, u.registered_at, r.role_name,
                    COUNT(p.id) AS lessons_done,
                    SUM(p.errors_count) AS total_errors
             FROM users u
             JOIN roles r ON u.role_id = r.id
             LEFT JOIN user_progress p ON u.id = p.user_id AND p.status = 'completed'
             GROUP BY u.id`
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ ok: false, msg: 'Ошибка сервера при получении пользователей' });
    }
});

// Удалить пользователя
app.delete('/api/users/:id', async (req, res) => {
    try {
        await pool.execute('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ ok: false, msg: 'Ошибка удаления' });
    }
});

// ──────────────────────────────────────────────
// МАРШРУТЫ: АВТОРИЗАЦИЯ
// ──────────────────────────────────────────────

// Регистрация нового пользователя
app.post('/api/register', async (req, res) => {
    try {
        const { name, login, password } = req.body;

        if (!name || !login || !password) {
            return res.status(400).json({ ok: false, msg: 'Заполните все поля' });
        }

        // Проверяем, не занят ли логин
        const [existing] = await pool.execute(
            'SELECT id FROM users WHERE username = ?', [login]
        );
        if (existing.length > 0) {
            return res.status(409).json({ ok: false, msg: 'Этот логин уже занят' });
        }

        // Хэшируем пароль
        const passwordHash = await bcrypt.hash(password, 10);

        // Создаём пользователя с ролью "student" (role_id = 2)
        const [result] = await pool.execute(
            'INSERT INTO users (role_id, username, password_hash, full_name) VALUES (2, ?, ?, ?)',
            [login, passwordHash, name]
        );

        const user = {
            id:    result.insertId,
            login: login,
            name:  name,
            role:  'student'
        };

        res.json({ ok: true, user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ ok: false, msg: 'Ошибка сервера при регистрации' });
    }
});

// Вход в аккаунт
app.post('/api/login', async (req, res) => {
    try {
        const { login, password } = req.body;

        const [rows] = await pool.execute(
            `SELECT u.*, r.role_name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.username = ?`,
            [login]
        );

        if (rows.length === 0) {
            return res.status(401).json({ ok: false, msg: 'Неверный логин или пароль' });
        }

        const user = rows[0];
        const passwordMatch = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatch) {
            return res.status(401).json({ ok: false, msg: 'Неверный логин или пароль' });
        }

        res.json({
            ok: true,
            user: {
                id:           user.id,
                login:        user.username,
                name:         user.full_name,
                role:         user.role_name,
                lessons_done: 0
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ ok: false, msg: 'Ошибка сервера при входе' });
    }
});

// ──────────────────────────────────────────────
// МАРШРУТЫ: ПРОГРЕСС
// ──────────────────────────────────────────────

// Получить прогресс пользователя
app.get('/api/progress/:userId', async (req, res) => {
    try {
        const [rows] = await pool.execute(
            `SELECT p.*, l.title FROM user_progress p
             JOIN lessons l ON p.lesson_id = l.id
             WHERE p.user_id = ?`,
            [req.params.userId]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ ok: false });
    }
});

// Сохранить прогресс (успех или ошибка)
app.post('/api/progress', async (req, res) => {
    try {
        const { userId, lessonId, isSuccess } = req.body;

        const [existing] = await pool.execute(
            'SELECT id, errors_count FROM user_progress WHERE user_id = ? AND lesson_id = ?',
            [userId, lessonId]
        );

        if (existing.length > 0) {
            // Обновляем существующую запись
            if (isSuccess) {
                await pool.execute(
                    'UPDATE user_progress SET status = "completed", completion_date = NOW() WHERE user_id = ? AND lesson_id = ?',
                    [userId, lessonId]
                );
            } else {
                await pool.execute(
                    'UPDATE user_progress SET errors_count = errors_count + 1 WHERE user_id = ? AND lesson_id = ?',
                    [userId, lessonId]
                );
            }
        } else {
            // Создаём новую запись
            await pool.execute(
                `INSERT INTO user_progress (user_id, lesson_id, status, completion_date, errors_count)
                 VALUES (?, ?, ?, ?, ?)`,
                [userId, lessonId,
                 isSuccess ? 'completed' : 'in_progress',
                 isSuccess ? new Date() : null,
                 isSuccess ? 0 : 1]
            );
        }

        res.json({ ok: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ ok: false });
    }
});

// ──────────────────────────────────────────────
// МАРШРУТЫ: УСТРОЙСТВА
// ──────────────────────────────────────────────

// Получить все устройства
app.get('/api/devices', async (req, res) => {
    try {
        const [rows] = await pool.execute(
            `SELECT d.id, d.name, d.mac_address, d.status,
                    dt.type_name AS type,
                    c.ip_address AS ip, c.subnet_mask AS mask,
                    c.gateway, c.dns_server AS dns
             FROM devices d
             JOIN device_types dt ON d.type_id = dt.id
             LEFT JOIN device_configs c ON d.id = c.device_id`
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ ok: false });
    }
});

// Добавить устройство
app.post('/api/devices', async (req, res) => {
    try {
        const { name, mac, type, status, ip, mask, gateway, dns } = req.body;

        // Ищем type_id по названию
        const [typeRows] = await pool.execute(
            'SELECT id FROM device_types WHERE type_name = ?', [type]
        );
        const typeId = typeRows.length > 0 ? typeRows[0].id : 3; // 3 = PC по умолчанию

        const [result] = await pool.execute(
            'INSERT INTO devices (type_id, name, mac_address, status) VALUES (?, ?, ?, ?)',
            [typeId, name, mac || null, status || 'online']
        );
        const deviceId = result.insertId;

        // Сохраняем конфигурацию сети
        if (ip || mask || gateway || dns) {
            await pool.execute(
                'INSERT INTO device_configs (device_id, ip_address, subnet_mask, gateway, dns_server) VALUES (?, ?, ?, ?, ?)',
                [deviceId, ip || null, mask || null, gateway || null, dns || null]
            );
        }

        res.json({ ok: true, id: deviceId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ ok: false, msg: 'Ошибка добавления устройства' });
    }
});

// Удалить устройство
app.delete('/api/devices/:id', async (req, res) => {
    try {
        await pool.execute('DELETE FROM devices WHERE id = ?', [req.params.id]);
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ ok: false });
    }
});

// ──────────────────────────────────────────────
// МАРШРУТЫ: ТИКЕТЫ
// ──────────────────────────────────────────────

// Получить все тикеты
app.get('/api/tickets', async (req, res) => {
    try {
        const [rows] = await pool.execute(
            `SELECT t.*, u.username AS user FROM tickets t JOIN users u ON t.user_id = u.id ORDER BY t.created_at DESC`
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ ok: false });
    }
});

// Создать тикет
app.post('/api/tickets', async (req, res) => {
    try {
        const { userId, subject, message } = req.body;
        const [result] = await pool.execute(
            'INSERT INTO tickets (user_id, subject, message) VALUES (?, ?, ?)',
            [userId, subject, message]
        );
        res.json({ ok: true, id: result.insertId });
    } catch (err) {
        res.status(500).json({ ok: false });
    }
});

// Закрыть тикет
app.patch('/api/tickets/:id/close', async (req, res) => {
    try {
        await pool.execute('UPDATE tickets SET status = "closed" WHERE id = ?', [req.params.id]);
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ ok: false });
    }
});

// Удалить тикет
app.delete('/api/tickets/:id', async (req, res) => {
    try {
        await pool.execute('DELETE FROM tickets WHERE id = ?', [req.params.id]);
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ ok: false });
    }
});

// ──────────────────────────────────────────────
// МАРШРУТЫ: DHCP
// ──────────────────────────────────────────────

// Получить настройки DHCP
app.get('/api/dhcp', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM dhcp_pools LIMIT 1');
        if (rows.length === 0) {
            return res.json({ enabled: false, start_ip: '', end_ip: '', lease_time: 24 });
        }
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ ok: false });
    }
});

// Сохранить настройки DHCP
app.post('/api/dhcp', async (req, res) => {
    try {
        const { deviceId, startIp, endIp, leaseTime } = req.body;
        await pool.execute(
            `INSERT INTO dhcp_pools (device_id, start_ip, end_ip, lease_time) VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE start_ip = VALUES(start_ip), end_ip = VALUES(end_ip), lease_time = VALUES(lease_time)`,
            [deviceId || 1, startIp, endIp, leaseTime || 24]
        );
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ ok: false });
    }
});

// ──────────────────────────────────────────────
// Главная страница
// ──────────────────────────────────────────────
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ──────────────────────────────────────────────
// Запуск сервера
// ──────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`\n🚀 Сервер запущен: http://localhost:${PORT}`);
    console.log(`📂 Открой в браузере: http://localhost:${PORT}/index.html`);
    console.log(`   Для остановки нажми Ctrl+C\n`);
});
