-- ============================================================
-- NetSim — полная база данных (MySQL)
-- Дипломный проект
--
-- Как запустить в MySQL Workbench:
-- 1. Подключитесь к серверу (не unconnected)
-- 2. Вставьте весь этот файл
-- 3. Нажмите Execute (молния)
-- ============================================================

DROP DATABASE IF EXISTS netsim_db;
CREATE DATABASE netsim_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE netsim_db;

-- ============================================================
-- 1. Роли
-- ============================================================
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO roles (role_name) VALUES
('admin'),
('student');

-- ============================================================
-- 2. Пользователи
-- ============================================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_id INT NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- ============================================================
-- 3. Уроки
-- ============================================================
CREATE TABLE lessons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'easy'
);

INSERT INTO lessons (title, description, difficulty) VALUES
('1.1: Соединение двух ПК', 'Базовая настройка IP и проверка связи', 'easy'),
('1.2: Поиск ошибки', 'Диагностика проблем в локальной сети', 'medium'),
('1.3: Основной шлюз', 'Настройка выхода во внешнюю сеть', 'medium'),
('4.1: Настройка DNS', 'Работа с доменными именами', 'hard');

-- ============================================================
-- 4. Прогресс пользователей
-- ============================================================
CREATE TABLE user_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    lesson_id INT NOT NULL,
    status ENUM('not_started', 'in_progress', 'completed') DEFAULT 'not_started',
    completion_date DATETIME NULL,
    errors_count INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
    UNIQUE KEY uq_user_lesson (user_id, lesson_id)
);

-- ============================================================
-- 5. Типы устройств
-- ============================================================
CREATE TABLE device_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type_name VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO device_types (type_name) VALUES
('Router'),
('Switch'),
('PC'),
('Server');

-- ============================================================
-- 6. Устройства
-- ============================================================
CREATE TABLE devices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    mac_address VARCHAR(17) UNIQUE,
    status ENUM('online', 'offline', 'maintenance') DEFAULT 'online',
    FOREIGN KEY (type_id) REFERENCES device_types(id)
);

-- ============================================================
-- 7. Конфигурации устройств
-- ============================================================
CREATE TABLE device_configs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    device_id INT NOT NULL UNIQUE,
    ip_address VARCHAR(15),
    subnet_mask VARCHAR(15),
    gateway VARCHAR(15),
    dns_server VARCHAR(15),
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
);

-- ============================================================
-- 8. Топологии
-- ============================================================
CREATE TABLE topologies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- 9. Элементы топологии
-- ============================================================
CREATE TABLE topology_elements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    topology_id INT NOT NULL,
    device_id INT NOT NULL,
    x_pos INT DEFAULT 0,
    y_pos INT DEFAULT 0,
    FOREIGN KEY (topology_id) REFERENCES topologies(id) ON DELETE CASCADE,
    FOREIGN KEY (device_id) REFERENCES devices(id)
);

-- ============================================================
-- 10. Соединения между устройствами
-- ============================================================
CREATE TABLE connections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    topology_id INT NOT NULL,
    from_device_id INT NOT NULL,
    to_device_id INT NOT NULL,
    connection_type VARCHAR(50),
    FOREIGN KEY (topology_id) REFERENCES topologies(id) ON DELETE CASCADE,
    FOREIGN KEY (from_device_id) REFERENCES devices(id),
    FOREIGN KEY (to_device_id) REFERENCES devices(id)
);

-- ============================================================
-- 11. Тикеты поддержки
-- ============================================================
CREATE TABLE tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status ENUM('open', 'in_progress', 'closed') DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- 12. База знаний (статьи)
-- ============================================================
CREATE TABLE articles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO articles (title, category, description, content) VALUES
(
    'Настройка статической маршрутизации',
    'Маршрутизация',
    'Пошаговая инструкция по настройке статических маршрутов на маршрутизаторе',
    'Статическая маршрутизация — это метод, при котором администратор вручную задаёт маршруты в таблице маршрутизации.\n\nШаги настройки:\n1. Определите целевую сеть и маску подсети (например, 192.168.2.0/24)\n2. Определите адрес следующего хопа (next-hop) или выходной интерфейс\n3. На маршрутизаторе Cisco введите команду:\n   ip route 192.168.2.0 255.255.255.0 192.168.1.1\n4. Проверьте маршрут командой: show ip route\n5. Протестируйте связь командой ping\n\nПреимущества: низкая нагрузка на процессор, безопасность, предсказуемость.\nНедостатки: не масштабируется, требует ручного обновления.'
),
(
    'Основы IP-адресации и подсетей',
    'IP-адресация',
    'Разбор классов IP-адресов, масок подсети и CIDR-нотации',
    'IP-адрес состоит из 4 октетов (32 бита) и делится на сетевую и хостовую части.\n\nКлассы IP-адресов:\n• Класс A: 1.0.0.0 – 126.255.255.255 (маска /8)\n• Класс B: 128.0.0.0 – 191.255.255.255 (маска /16)\n• Класс C: 192.0.0.0 – 223.255.255.255 (маска /24)\n\nЧастные диапазоны (RFC 1918):\n• 10.0.0.0/8\n• 172.16.0.0/12\n• 192.168.0.0/16\n\nПример разбиения сети 192.168.1.0/24 на 4 подсети:\n• 192.168.1.0/26 (хосты: .1–.62)\n• 192.168.1.64/26 (хосты: .65–.126)\n• 192.168.1.128/26 (хосты: .129–.190)\n• 192.168.1.192/26 (хосты: .193–.254)'
),
(
    'Настройка DNS-сервера',
    'DNS',
    'Конфигурация прямой и обратной зоны DNS',
    'DNS (Domain Name System) преобразует доменные имена в IP-адреса.\n\nОсновные типы записей:\n• A — соответствие имени и IPv4-адреса\n• AAAA — соответствие имени и IPv6-адреса\n• CNAME — псевдоним для другого имени\n• MX — почтовый сервер домена\n• NS — авторитетный DNS-сервер\n• PTR — обратная запись (IP → имя)\n\nНастройка DNS на Cisco:\n  ip name-server 8.8.8.8\n  ip domain-lookup\n\nДиагностика:\n  nslookup example.com\n  dig example.com\n  ipconfig /displaydns'
),
(
    'Безопасность Wi-Fi: WPA2 и WPA3',
    'Безопасность',
    'Сравнение протоколов безопасности беспроводных сетей',
    'Протоколы безопасности Wi-Fi:\n\nWEP (устарел) — легко взламывается, не рекомендуется.\n\nWPA2 (рекомендуется):\n• Шифрование AES-CCMP\n• Режимы: Personal (PSK) и Enterprise (802.1X)\n• Длина ключа: минимум 8 символов\n• Уязвим к атаке KRACK\n\nWPA3 (новейший):\n• SAE (Simultaneous Authentication of Equals) вместо PSK\n• Защита от офлайн-атак перебором\n• Forward Secrecy — компрометация ключа не раскроет прошлый трафик\n• 192-битное шифрование в Enterprise режиме\n\nРекомендации:\n1. Используйте WPA3, если оборудование поддерживает\n2. Пароль не менее 12 символов\n3. Отключите WPS\n4. Скрыть SSID (опционально)'
),
(
    'Настройка VLAN на коммутаторе',
    'Коммутация',
    'Создание и настройка виртуальных локальных сетей',
    'VLAN (Virtual LAN) разделяет коммутатор на логические сегменты.\n\nСоздание VLAN на Cisco:\n  vlan 10\n  name OFFICE\n  vlan 20\n  name SERVERS\n\nНазначение порта в VLAN:\n  interface fa0/1\n  switchport mode access\n  switchport access vlan 10\n\nНастройка транкового порта:\n  interface fa0/24\n  switchport mode trunk\n  switchport trunk allowed vlan 10,20\n\nМежVLAN маршрутизация (Router-on-a-Stick):\n  interface fa0/0.10\n  encapsulation dot1Q 10\n  ip address 192.168.10.1 255.255.255.0'
),
(
    'Мониторинг сети с помощью SNMP',
    'Мониторинг',
    'Использование протокола SNMP для мониторинга сетевых устройств',
    'SNMP (Simple Network Management Protocol) позволяет собирать данные с устройств.\n\nВерсии:\n• SNMPv1 — базовый, без шифрования\n• SNMPv2c — улучшенный, community strings\n• SNMPv3 — аутентификация и шифрование\n\nКомпоненты:\n• Manager (NMS) — сервер мониторинга\n• Agent — процесс на устройстве\n• MIB — база данных объектов\n\nНастройка на Cisco:\n  snmp-server community public RO\n  snmp-server community private RW\n  snmp-server host 192.168.1.100 public\n\nОсновные OID:\n• 1.3.6.1.2.1.1.1 — описание системы\n• 1.3.6.1.2.1.2.2 — интерфейсы\n• 1.3.6.1.2.1.1.3 — uptime'
),
(
    'Настройка VPN-туннеля',
    'VPN',
    'Создание защищённого VPN-соединения между двумя офисами',
    'VPN (Virtual Private Network) создаёт зашифрованный туннель через публичную сеть.\n\nТипы VPN:\n• Site-to-Site — соединение двух офисов\n• Remote Access — подключение удалённого сотрудника\n• SSL VPN — через браузер\n\nIPSec Site-to-Site (фазы IKE):\n\nФаза 1 (ISAKMP):\n  crypto isakmp policy 10\n  encryption aes 256\n  hash sha256\n  authentication pre-share\n  group 14\n  crypto isakmp key MySecret address 203.0.113.1\n\nФаза 2 (IPSec):\n  crypto ipsec transform-set MYSET esp-aes 256 esp-sha256-hmac\n  crypto map MYMAP 10 ipsec-isakmp\n  set peer 203.0.113.1\n  set transform-set MYSET\n  match address 101\n\nПроверка: show crypto ipsec sa'
);

-- ============================================================
-- Проверка
-- ============================================================
SELECT 'roles' AS table_name, COUNT(*) AS rows_count FROM roles
UNION ALL SELECT 'lessons', COUNT(*) FROM lessons
UNION ALL SELECT 'device_types', COUNT(*) FROM device_types
UNION ALL SELECT 'articles', COUNT(*) FROM articles;

SELECT id, title, category FROM articles ORDER BY id;
