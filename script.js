let currentLesson = 1;

// ── Трекинг прогресса в БД ───────────────────────────────────
function trackSuccess(lessonName) {
    if (typeof DB !== 'undefined') {
        const user = DB.getCurrentUser();
        if (user) DB.updateProgress(user.login, lessonName, true);
    }
}
function trackError() {
    if (typeof DB !== 'undefined') {
        const user = DB.getCurrentUser();
        if (user) {
            const name = document.getElementById('lesson-title')?.innerText || 'Урок';
            DB.updateProgress(user.login, name, false);
        }
    }
}

let l1Config = { ip: '', mask: '', gateway: '', dns: '' };
let l2Config = { ip: '192.169.0.12', mask: '255.255.255.0', gateway: '', dns: '' };
let l3Config = { ip: '192.168.1.15', mask: '255.255.255.0', gateway: '', dns: '' };
let l4Config = { ip: '', mask: '', gateway: '', dns: '' };
let l9Config = { ip: '192.168.1.10', mask: '255.255.255.0', gateway: '192.168.1.1', dns: '' };

const modal = document.getElementById('settings-modal');

function closeSettingsOverlay(e) {
    if(e.target === modal) closeSettings();
}

function openSettings(lessonRef) {
    modal.classList.add('active');
    modal.setAttribute('data-lesson', lessonRef);
    
    let cfg = {};
    if (lessonRef === 'l1') cfg = l1Config;
    if (lessonRef === 'l2') cfg = l2Config;
    if (lessonRef === 'l3') cfg = l3Config;
    if (lessonRef === 'l4') cfg = l4Config;
    if (lessonRef === 'l9') cfg = l9Config;

    document.getElementById('modal-ip').value = cfg.ip;
    document.getElementById('modal-mask').value = cfg.mask;
    document.getElementById('modal-gateway').value = cfg.gateway;
    document.getElementById('modal-dns').value = cfg.dns || '';
}

function closeSettings() {
    modal.classList.remove('active');
}

function saveSettings() {
    const lessonRef = modal.getAttribute('data-lesson');
    const ip = document.getElementById('modal-ip').value.trim();
    const mask = document.getElementById('modal-mask').value.trim();
    const gateway = document.getElementById('modal-gateway').value.trim();
    const dns = document.getElementById('modal-dns').value.trim();

    if (lessonRef === 'l1') {
        l1Config = {ip, mask, gateway};
        if(ip) {
            document.getElementById('pc2-display-ip').innerHTML = `IP: ${ip}<br>Маска: ${mask}`;
            document.getElementById('pc2-display-ip').style.color = '#1e293b';
            document.getElementById('pc2-display-ip').style.backgroundColor = 'rgba(67,97,238,0.08)';
            document.getElementById('pc2').style.borderColor = '#94a3b8';
            document.getElementById('pc2').style.animation = 'none';
        }
        document.getElementById('result-message-1').style.display = 'none';
    } 
    else if (lessonRef === 'l2') {
        l2Config = {ip, mask, gateway};
        document.getElementById('l2-pc3-display-ip').innerHTML = `IP: ${ip}<br>Маска: ${mask}`;
        document.getElementById('l2-pc3-display-ip').style.color = '#1e293b';
        document.getElementById('l2-pc3-display-ip').style.backgroundColor = 'rgba(67,97,238,0.08)';
        document.getElementById('result-message-2').style.display = 'none';
        document.getElementById('l2-pc3').style.borderColor = 'var(--primary)';
        document.getElementById('l2-pc3').style.animation = 'none';
        document.getElementById('l2-cable3').style.backgroundColor = 'var(--border)';
        document.getElementById('l2-cable1').style.backgroundColor = 'var(--border)';
    }
    else if (lessonRef === 'l3') {
        l3Config = {ip, mask, gateway};
        document.getElementById('l3-pc1-display-ip').innerHTML = `IP: ${ip}<br>Маска: ${mask}<br>Шлюз: ${gateway || '---'}`;
        document.getElementById('l3-pc1-display-ip').style.color = '#1e293b';
        document.getElementById('l3-pc1-display-ip').style.backgroundColor = 'rgba(67,97,238,0.08)';
        document.getElementById('result-message-3').style.display = 'none';
        document.getElementById('l3-pc1').style.borderColor = 'var(--primary)';
        document.getElementById('l3-pc1').style.animation = 'none';
    }
    else if (lessonRef === 'l4') {
        l4Config = {ip, mask, gateway};
        document.getElementById('l4-hr-display-ip').innerHTML = `IP: ${ip}<br>Маска: ${mask}`;
        document.getElementById('l4-hr-display-ip').style.color = '#1e293b';
        document.getElementById('l4-hr-display-ip').style.backgroundColor = 'rgba(67,97,238,0.08)';
        document.getElementById('result-message-4').style.display = 'none';
        document.getElementById('l4-pc-hr').style.borderColor = 'var(--primary)';
        document.getElementById('l4-pc-hr').style.animation = 'none';
    }
    else if (lessonRef === 'l9') {
        l9Config = {ip, mask, gateway, dns};
        document.getElementById('l9-pc1-display-ip').innerHTML = `IP: ${ip}<br>DNS: ${dns || '---'}`;
        document.getElementById('l9-pc1-display-ip').style.color = '#1e293b';
        document.getElementById('l9-pc1-display-ip').style.backgroundColor = 'rgba(67,97,238,0.08)';
        document.getElementById('result-message-9').style.display = 'none';
        if(dns) {
            document.getElementById('l9-pc1').style.borderColor = 'var(--primary)';
            document.getElementById('l9-pc1').style.animation = 'none';
        }
    }
    closeSettings();
}

function loadLesson(num) {
    if (num > 15) {
        alert("Этот модуль пока в разработке!");
        return;
    }
    currentLesson = num;
    for(let i=1; i<=15; i++) {
        const navItem = document.getElementById('nav-l'+i);
        if(navItem) navItem.classList.remove('active');
        const lessonWrap = document.getElementById('lesson-'+i+'-wrapper');
        if(lessonWrap) lessonWrap.style.display = 'none';
    }
    
    const currNav = document.getElementById('nav-l'+num);
    if(currNav) currNav.classList.add('active');
    
    const currWrap = document.getElementById('lesson-'+num+'-wrapper');
    if(currWrap) currWrap.style.display = 'flex';
    
    const titleObj = document.getElementById('lesson-title');
    if(num===1) titleObj.innerText = "Урок 1.1: Соединение двух ПК";
    if(num===2) titleObj.innerText = "Урок 1.2: Поиск ошибки в локальной сети";
    if(num===3) titleObj.innerText = "Урок 1.3: Основной шлюз (Выход в Интернет)";
    if(num===4) titleObj.innerText = "Урок 1.4: Разбиение сети (Безопасность/VLSM)";
    if(num===5) titleObj.innerText = "Урок 2.1: Настройка DHCP-сервера";
    if(num===6) titleObj.innerText = "Урок 2.2: Безопасность домашней Wi-Fi сети";
    if(num===7) titleObj.innerText = "Урок 3.1: Работа с утилитой Ping";
    if(num===8) titleObj.innerText = "Урок 3.2: Просмотр сетевых настроек (ipconfig)";
    if(num===9) titleObj.innerText = "Урок 4.1: Настройка DNS";
    if(num===10) titleObj.innerText = "Урок 4.2: Утилита nslookup";
    if(num===11) titleObj.innerText = "Урок 5.1: Настройка ACL (Access Control List)";
    if(num===12) titleObj.innerText = "Урок 5.2: Протокол ARP";
    if(num===13) titleObj.innerText = "Урок 5.3: Настройка статического NAT";
    if(num===14) titleObj.innerText = "Урок 5.4: Работа с tracert / traceroute";
    if(num===15) titleObj.innerText = "Урок 5.5: Диагностика: команда netstat";
}

function showResult(el, isSuccess, msg) {
    el.className = 'result-message ' + (isSuccess ? 'result-success' : 'result-error');
    el.innerText = msg;
    el.style.display = 'block';
}

function checkLesson1() {
    const ip = l1Config.ip;
    const mask = l1Config.mask;
    const cable = document.getElementById('l1-cable');
    const pc2Node = document.getElementById('pc2');
    const resMsg = document.getElementById('result-message-1');
    
    cable.classList.add('animating');
    cable.style.backgroundColor = 'var(--primary)';
    showResult(resMsg, false, 'Отправка ICMP-пакетов (Ping)...');
    resMsg.className = 'result-message';

    setTimeout(() => {
        cable.classList.remove('animating');
        if (!ip || !mask) return showResult(resMsg, false, "Настройки не заданы.");
        const ipParts = ip.split('.');
        if (ipParts.length !== 4) return showResult(resMsg, false, "Неверный формат IP.");

        if (ipParts[0] === '192' && ipParts[1] === '168' && ipParts[2] === '1') {
            const last = parseInt(ipParts[3]);
            if (last === 5) return showResult(resMsg, false, "Ошибка: конфликт IP-адресов. Адрес .5 занят.");
            if (last === 0 || last === 255) return showResult(resMsg, false, "Ошибка: адреса .0 и .255 зарезервированы.");
            if (mask === '255.255.255.0') {
                cable.style.backgroundColor = 'var(--success)';
                pc2Node.style.borderColor = 'var(--success)';
                showResult(resMsg, true, `Успех! Reply from ${ip}: bytes=32 time<1ms. Задание выполнено!`);
                trackSuccess('Урок 1.1: Соединение двух ПК');
            } else { trackError(); return showResult(resMsg, false, "Ошибка: неверная маска подсети."); }
        } else { trackError(); return showResult(resMsg, false, "Ошибка: IP-адрес в другой подсети. Ожидается: 192.168.1.*"); }
    }, 2000);
}

function checkLesson2() {
    const cable1 = document.getElementById('l2-cable1');
    const cable3 = document.getElementById('l2-cable3');
    const resMsg = document.getElementById('result-message-2');
    
    cable3.classList.add('animating-up');
    cable1.classList.add('animating-reverse');
    cable3.style.backgroundColor = 'var(--primary)';
    cable1.style.backgroundColor = 'var(--primary)';
    
    showResult(resMsg, false, 'Ожидание ответа...');
    resMsg.className = 'result-message';

    setTimeout(() => {
        cable3.classList.remove('animating-up');
        cable1.classList.remove('animating-reverse');
        
        if (l2Config.ip === '192.169.0.12') {
            cable3.style.backgroundColor = 'var(--danger)';
            cable1.style.backgroundColor = 'var(--border)';
            return showResult(resMsg, false, "Сбой Ping: ПК 3 все еще в сети 192.169.x.x");
        }

        const ipParts = l2Config.ip.split('.');
        if (ipParts[0] === '192' && ipParts[1] === '168' && ipParts[2] === '0') {
            const lastOctet = parseInt(ipParts[3]);
            if (lastOctet === 10 || lastOctet === 11) {
                cable3.style.backgroundColor = 'var(--danger)';
                cable1.style.backgroundColor = 'var(--border)';
                return showResult(resMsg, false, "Ошибка: Конфликт IP! Адрес изменен, но он занят ПК 1 или ПК 2.");
            } else if (l2Config.mask === '255.255.255.0') {
                cable3.style.backgroundColor = 'var(--success)';
                cable1.style.backgroundColor = 'var(--success)';
                document.getElementById('l2-pc3').style.borderColor = 'var(--success)';
                showResult(resMsg, true, "Успех! Ошибка исправлена. Узел снова в правильной сети.");
                trackSuccess('Урок 1.2: Поиск ошибки в локальной сети');
            } else {
                cable3.style.backgroundColor = 'var(--danger)';
                cable1.style.backgroundColor = 'var(--border)';
                showResult(resMsg, false, "Ошибка в маске подсети.");
            }
        } else {
            cable3.style.backgroundColor = 'var(--danger)';
            cable1.style.backgroundColor = 'var(--border)';
            showResult(resMsg, false, "Ошибка: Вы ввели адрес из другой подсети.");
        }
    }, 2000);
}

function checkLesson3() {
    const resMsg = document.getElementById('result-message-3');
    const cable1 = document.getElementById('l3-cable1');
    const cable2 = document.getElementById('l3-cable2');
    
    cable1.classList.add('animating');
    setTimeout(() => { cable2.classList.add('animating'); }, 800);
    
    showResult(resMsg, false, 'Отправка пакетов до Роутера...');
    resMsg.className = 'result-message';

    setTimeout(() => {
        cable1.classList.remove('animating');
        cable2.classList.remove('animating');
        
        if (l3Config.ip !== '192.168.1.15' || l3Config.mask !== '255.255.255.0') {
            return showResult(resMsg, false, "Ошибка: вы изменили IP или маску. Роутер потерян.");
        }
        
        if (!l3Config.gateway) {
            return showResult(resMsg, false, "Сбой: Заданный узел недоступен. Пакет не знает, куда идти дальше роутера.");
        }
        
        if (l3Config.gateway === '192.168.1.1') {
            cable1.style.backgroundColor = 'var(--success)';
            document.getElementById('l3-pc1').style.borderColor = 'var(--success)';
            showResult(resMsg, true, "Отлично! Указан верный шлюз. Пакет успешно доставлен в Интернет до 8.8.8.8!");
            trackSuccess('Урок 1.3: Основной шлюз');
        } else {
            trackError();
            showResult(resMsg, false, `Ошибка: Шлюз ${l3Config.gateway} не отвечает. Вы указали неверный IP-адрес роутера.`);
        }
    }, 2500);
}

function checkLesson4() {
    const resMsg = document.getElementById('result-message-4');
    const cable2 = document.getElementById('l4-cable2');
    
    cable2.classList.add('animating');
    showResult(resMsg, false, 'Установка соединения с VLAN-коммутатором...');
    resMsg.className = 'result-message';

    setTimeout(() => {
        cable2.classList.remove('animating');
        
        if (!l4Config.ip || !l4Config.mask) return showResult(resMsg, false, "Настройки не заданы.");
        
        const ipParts = l4Config.ip.split('.');
        if (ipParts[0] === '10' && ipParts[1] === '0' && ipParts[2] === '0') {
            const last = parseInt(ipParts[3]);
            
            if (last < 128) {
                cable2.style.backgroundColor = 'var(--danger)';
                return showResult(resMsg, false, "КРИТИЧЕСКАЯ ОШИБКА: Вы назначили IP из диапазона сети Финансов (10.0.0.0-127)!");
            }
            if (last === 128 || last === 255) {
                cable2.style.backgroundColor = 'var(--danger)';
                return showResult(resMsg, false, `Ошибка: .${last} является системным адресом в этой подсети.`);
            }
            
            if (l4Config.mask === '255.255.255.128') {
                cable2.style.backgroundColor = 'var(--success)';
                document.getElementById('l4-pc-hr').style.borderColor = 'var(--success)';
                showResult(resMsg, true, "Супер! /25 маска успешно применена. Отдел Кадров изолирован.");
                trackSuccess('Урок 1.4: Разбиение сети');
            } else if (l4Config.mask === '255.255.255.0') {
                cable2.style.backgroundColor = 'var(--danger)';
                showResult(resMsg, false, "УЯЗВИМОСТЬ: При маске 255.255.255.0 ваш компьютер всё ещё в общей сети!");
            } else {
                cable2.style.backgroundColor = 'var(--danger)';
                showResult(resMsg, false, "Маска подсети неверна!");
            }
        } else {
            showResult(resMsg, false, "IP-адрес вне диапазона 10.0.0.x");
        }
    }, 2500);
}

function checkLesson5() {
    const resMsg = document.getElementById('result-message-5');
    const isEnabled = document.getElementById('dhcp-enable').checked;
    const startIp = document.getElementById('dhcp-start').value.trim();
    const endIp = document.getElementById('dhcp-end').value.trim();
    
    showResult(resMsg, false, 'Применение настроек в роутере...');
    resMsg.className = 'result-message';

    setTimeout(() => {
        if (!isEnabled) {
            return showResult(resMsg, false, "Ошибка: Служба DHCP Server отключена (Disable). Включите ее.");
        }
        if (!startIp || !endIp) {
            return showResult(resMsg, false, "Ошибка: Укажите начальный и конечный IP-адреса пула.");
        }
        
        if (startIp === '192.168.1.100' && endIp === '192.168.1.199') {
            showResult(resMsg, true, "Отлично! Теперь новые устройства при подключении будут автоматически получать адреса из вашего пула и выходить в интернет.");
            trackSuccess('Урок 2.1: Настройка DHCP-сервера');
        } else {
            trackError();
            showResult(resMsg, false, "Ошибка: Диапазон задан не по заданию. В задании указано от 192.168.1.100 до 192.168.1.199.");
        }
    }, 1500);
}

function checkLesson6() {
    const resMsg = document.getElementById('result-message-6');
    const ssid = document.getElementById('wifi-ssid').value.trim();
    const isWep = document.getElementById('sec-wep').checked;
    const isWpa2 = document.getElementById('sec-wpa2').checked;
    const isNone = document.getElementById('sec-none').checked;
    const pass = document.getElementById('wifi-pass').value.trim();
    
    showResult(resMsg, false, 'Сохранение параметров и перезапуск радиомодуля Wi-Fi...');
    resMsg.className = 'result-message';

    setTimeout(() => {
        if (ssid === 'TP-Link_DEFAULT' || !ssid) {
            return showResult(resMsg, false, "Ошибка: Замените оригинальное имя сети на уникальное.");
        }
        if (isNone) {
            return showResult(resMsg, false, "Внимание: Вы оставили сеть открытой! (Disable Security). Кто угодно может подключиться.");
        }
        if (isWep) {
            return showResult(resMsg, false, "Внимание: Протокол WEP слишком старый, он взламывается за считанные минуты. Выберите WPA2.");
        }
        if (isWpa2) {
            if (pass.length < 8) {
                return showResult(resMsg, false, "Ошибка пароля: По стандарту WPA2 длина ключа (пароля) должна быть не менее 8 символов.");
            }
            showResult(resMsg, true, `Успех! Новая защита активирована! Имя Wi-Fi: ${ssid}, Шифрование: WPA2-PSK.`);
            trackSuccess('Урок 2.2: Безопасность Wi-Fi сети');
        }
    }, 1500);
}

// УРОК 7 (PING CONSOLE)
let pingProgress = { router: false, internet: false };
function handleConsole7(e) {
    if (e.key === 'Enter') {
        const inputObj = document.getElementById('console-7-input');
        const cmd = inputObj.value.trim().toLowerCase();
        const outObj = document.getElementById('console-7-output');
        outObj.innerHTML += `C:\\Users\\Student&gt; ${cmd}<br>`;
        inputObj.value = '';
        inputObj.disabled = true;
        let response = '';
        if (cmd === 'ping 192.168.1.1') {
            pingProgress.router = true;
            response = `<br>Обмен пакетами с 192.168.1.1 по с 32 байтами данных:<br>Ответ от 192.168.1.1: число байт=32 время=1мс TTL=64<br>Ответ от 192.168.1.1: число байт=32 время<1мс TTL=64<br>Ответ от 192.168.1.1: число байт=32 время=2мс TTL=64<br>Ответ от 192.168.1.1: число байт=32 время=1мс TTL=64<br><br>Статистика Ping для 192.168.1.1:<br>    Пакетов: отправлено = 4, получено = 4, потеряно = 0<br><br>`;
        } else if (cmd === 'ping 8.8.8.8') {
            pingProgress.internet = true;
            response = `<br>Обмен пакетами с 8.8.8.8 по с 32 байтами данных:<br>Превышен интервал ожидания для запроса.<br>Превышен интервал ожидания для запроса.<br>Превышен интервал ожидания для запроса.<br>Превышен интервал ожидания для запроса.<br><br>Статистика Ping для 8.8.8.8:<br>    Пакетов: отправлено = 4, получено = 0, потеряно = 4 (100% потерь)<br><br>`;
        } else if (cmd === '') {
            inputObj.disabled = false;
            document.getElementById('console-7-input').focus();
            return;
        } else {
            response = `"${cmd}" не является внутренней или внешней командой, исполняемой программой или пакетным файлом.<br><br>`;
        }
        setTimeout(() => {
            outObj.innerHTML += response;
            inputObj.disabled = false;
            document.getElementById('console-7-input').focus();
            outObj.parentElement.scrollTop = outObj.parentElement.scrollHeight;
            checkLesson7();
        }, 800);
    }
}
function checkLesson7() {
    if (pingProgress.router && pingProgress.internet) {
        const resMsg = document.getElementById('result-message-7');
        showResult(resMsg, true, "Отлично! Вы проверили оба узла. Мы выяснили, что локальный роутер доступен (работает), а проблема находится за его пределами (Интернет-провайдер). Задание выполнено!");
        trackSuccess('Урок 3.1: Работа с утилитой Ping');
    }
}

// УРОК 8 (IPCONFIG)
let ipconfigRun = false;
function handleConsole8(e) {
    if (e.key === 'Enter') {
        const inputObj = document.getElementById('console-8-input');
        const cmd = inputObj.value.trim().toLowerCase();
        const outObj = document.getElementById('console-8-output');
        outObj.innerHTML += `C:\\Users\\Student&gt; ${cmd}<br>`;
        inputObj.value = '';
        inputObj.disabled = true;
        let response = '';
        if (cmd === 'ipconfig') {
            ipconfigRun = true;
            response = `<br>Настройка протокола IP для Windows<br><br>Адаптер Ethernet Ethernet:<br><br>   DNS-суффикс подключения . . . . . :<br>   Локальный IPv6-адрес канала . . . : fe80::d4a8:6435:d2d8<br>   IPv4-адрес. . . . . . . . . . . . : 192.168.0.105<br>   Маска подсети . . . . . . . . . . : 255.255.255.0<br>   Основной шлюз . . . . . . . . . . : 192.168.0.1<br><br>`;
        } else if (cmd === '') {
            inputObj.disabled = false;
            document.getElementById('console-8-input').focus();
            return;
        } else {
            response = `"${cmd}" не является внутренней или внешней командой.<br><br>`;
        }
        setTimeout(() => {
            outObj.innerHTML += response;
            inputObj.disabled = false;
            document.getElementById('console-8-input').focus();
            outObj.parentElement.scrollTop = outObj.parentElement.scrollHeight;
        }, 500);
    }
}
function checkLesson8() {
    const ans = document.getElementById('l8-answer').value.trim();
    const resMsg = document.getElementById('result-message-8');
    if (!ipconfigRun) return showResult(resMsg, false, "Сначала введите 'ipconfig' в черной консоли выше и нажмите Enter, чтобы увидеть адрес компьютера.");
    if (ans === '192.168.0.105') {
        showResult(resMsg, true, "Верно! Вы успешно воспользовались консольной утилитой ipconfig и нашли свой IP-адрес.");
        trackSuccess('Урок 3.2: Просмотр сетевых настроек (ipconfig)');
    } else {
        trackError();
        showResult(resMsg, false, "Неправильный IP-адрес. Посмотрите внимательно на строку 'IPv4-адрес' в выводе черного экрана.");
    }
}

function checkLesson9() {
    const resMsg = document.getElementById('result-message-9');
    const cable1 = document.getElementById('l9-cable1');
    cable1.classList.add('animating');
    
    showResult(resMsg, false, 'Попытка найти сайт google.com...');
    resMsg.className = 'result-message';
    
    setTimeout(() => {
        cable1.classList.remove('animating');
        if (l9Config.dns === '8.8.8.8') {
            showResult(resMsg, true, "Отлично! Ваш ПК обратился к DNS-серверу 8.8.8.8, узнал IP-адрес сайта, и страница успешно загрузилась! 🎉");
            document.getElementById('l9-pc1').style.borderColor = 'var(--success)';
            cable1.style.backgroundColor = 'var(--success)';
            trackSuccess('Урок 4.1: Настройка DNS');
        } else if (!l9Config.dns) {
             showResult(resMsg, false, "Ошибка: 'DNS_PROBE_FINISHED_NXDOMAIN'. Компьютер не знает, как перевести имя google.com в IP-адрес. Настройте DNS.");
        } else {
             showResult(resMsg, false, "Ошибка: Указан неверный адрес DNS-сервера. Сервер не отвечает.");
             cable1.style.backgroundColor = 'var(--danger)';
        }
    }, 2000);
}

let nslookupRun = false;
function handleConsole10(e) {
    if (e.key === 'Enter') {
        const inputObj = document.getElementById('console-10-input');
        const cmd = inputObj.value.trim().toLowerCase();
        const outObj = document.getElementById('console-10-output');
        outObj.innerHTML += `C:\\Users\\Student&gt; ${cmd}<br>`;
        inputObj.value = '';
        inputObj.disabled = true;
        let response = '';
        
        if (cmd === 'nslookup yandex.ru') {
            nslookupRun = true;
            response = `Server:  dns.google<br>Address:  8.8.8.8<br><br>Non-authoritative answer:<br>Name:    yandex.ru<br>Addresses:  2a02:6b8::2:242<br>          5.255.255.242<br>          77.88.55.242<br><br>`;
        } else if (cmd === '') {
            inputObj.disabled = false;
            document.getElementById('console-10-input').focus();
            return;
        } else {
            response = `Unrecognized command.<br><br>`;
        }
        
        setTimeout(() => {
            outObj.innerHTML += response;
            inputObj.disabled = false;
            document.getElementById('console-10-input').focus();
            outObj.parentElement.scrollTop = outObj.parentElement.scrollHeight;
        }, 600);
    }
}

function checkLesson10() {
    const ans = document.getElementById('l10-answer').value.trim();
    const resMsg = document.getElementById('result-message-10');
    if (!nslookupRun) return showResult(resMsg, false, "Сначала введите 'nslookup yandex.ru' в консоли.");
    if (ans === '5.255.255.242' || ans === '77.88.55.242') {
        showResult(resMsg, true, "Верно! Вы успешно воспользовались утилитой nslookup и перевели доменное имя в IP-адрес вручную. Задание выполнено!");
        trackSuccess('Урок 4.2: Утилита nslookup');
    } else {
        trackError();
        showResult(resMsg, false, "Неверный IP-адрес браузера yandex.ru. Ищите в секции 'Addresses'.");
    }
}

// УРОК 11 (ACL)
function checkLesson11() {
    const resMsg = document.getElementById('result-message-11');
    const ip = document.getElementById('acl-ip').value.trim();
    const isDeny = document.getElementById('acl-deny').checked;
    
    showResult(resMsg, false, 'Применение правила ACL...');
    resMsg.className = 'result-message';

    setTimeout(() => {
        if (ip === '192.168.1.50' && isDeny) {
            showResult(resMsg, true, "Правило успешно применено! Доступ для 192.168.1.50 запрещен.");
            trackSuccess('Урок 5.1: Настройка ACL (Access Control List)');
        } else {
            trackError();
            if (ip !== '192.168.1.50') {
                showResult(resMsg, false, "Ошибка: неверный Target IP. Ожидается 192.168.1.50.");
            } else {
                showResult(resMsg, false, "Ошибка: выбрано действие Permit вместо Deny.");
            }
        }
    }, 1500);
}

// УРОК 12 (ARP)
let arpRun = false;
function handleConsole12(e) {
    if (e.key === 'Enter') {
        const inputObj = document.getElementById('console-12-input');
        const cmd = inputObj.value.trim().toLowerCase();
        const outObj = document.getElementById('console-12-output');
        outObj.innerHTML += `C:\\Users\\Student&gt; ${cmd}<br>`;
        inputObj.value = '';
        inputObj.disabled = true;
        let response = '';
        if (cmd === 'arp -a') {
            arpRun = true;
            response = `<br>Интерфейс: 192.168.1.10 --- 0x4<br>  Адрес в Интернете      Физический адрес      Тип<br>  192.168.1.1           c4-ea-1d-55-66-77     динамический<br>  192.168.1.255         ff-ff-ff-ff-ff-ff     статический<br>  224.0.0.22            01-00-5e-00-00-16     статический<br><br>`;
        } else if (cmd === '') {
            inputObj.disabled = false;
            document.getElementById('console-12-input').focus();
            return;
        } else {
            response = `"${cmd}" не является внутренней или внешней командой.<br><br>`;
        }
        setTimeout(() => {
            outObj.innerHTML += response;
            inputObj.disabled = false;
            document.getElementById('console-12-input').focus();
            outObj.parentElement.scrollTop = outObj.parentElement.scrollHeight;
        }, 500);
    }
}
function checkLesson12() {
    const ans = document.getElementById('l12-answer').value.trim().toLowerCase();
    const resMsg = document.getElementById('result-message-12');
    if (!arpRun) return showResult(resMsg, false, "Сначала введите 'arp -a' в консоли.");
    if (ans === 'c4-ea-1d-55-66-77' || ans === 'c4:ea:1d:55:66:77') {
        showResult(resMsg, true, "Верно! Вы нашли физический (MAC) адрес маршрутизатора в ARP-таблице.");
        trackSuccess('Урок 5.2: Протокол ARP');
    } else {
        trackError();
        showResult(resMsg, false, "Неверный MAC-адрес. Ищите строку для 192.168.1.1.");
    }
}

// УРОК 13 (NAT)
function checkLesson13() {
    const resMsg = document.getElementById('result-message-13');
    const internal = document.getElementById('nat-internal').value.trim();
    const external = document.getElementById('nat-external').value.trim();
    
    showResult(resMsg, false, 'Сохранение правил NAT...');
    resMsg.className = 'result-message';

    setTimeout(() => {
        if (internal === '192.168.1.100' && external === '203.0.113.10') {
            showResult(resMsg, true, "Успех! Статический NAT настроен корректно.");
            trackSuccess('Урок 5.3: Настройка статического NAT');
        } else {
            trackError();
            showResult(resMsg, false, "Ошибка: неверно указан внутренний или внешний IP-адрес.");
        }
    }, 1500);
}

// УРОК 14 (TRACERT)
let tracertRun = false;
function handleConsole14(e) {
    if (e.key === 'Enter') {
        const inputObj = document.getElementById('console-14-input');
        const cmd = inputObj.value.trim().toLowerCase();
        const outObj = document.getElementById('console-14-output');
        outObj.innerHTML += `C:\\Users\\Student&gt; ${cmd}<br>`;
        inputObj.value = '';
        inputObj.disabled = true;
        let response = '';
        if (cmd === 'tracert 8.8.8.8') {
            tracertRun = true;
            response = `<br>Трассировка маршрута к 8.8.8.8 с максимальным числом прыжков 30:<br><br>  1    <1 мс    <1 мс    <1 мс  192.168.1.1<br>  2     5 мс     4 мс     5 мс  10.20.30.1<br>  3     8 мс     8 мс     9 мс  172.16.0.1<br>  4    12 мс    11 мс    11 мс  8.8.8.8<br><br>Трассировка завершена.<br><br>`;
        } else if (cmd === '') {
            inputObj.disabled = false;
            document.getElementById('console-14-input').focus();
            return;
        } else {
            response = `"${cmd}" не является внутренней или внешней командой.<br><br>`;
        }
        setTimeout(() => {
            outObj.innerHTML += response;
            inputObj.disabled = false;
            document.getElementById('console-14-input').focus();
            outObj.parentElement.scrollTop = outObj.parentElement.scrollHeight;
        }, 1200);
    }
}
function checkLesson14() {
    const ans = document.getElementById('l14-answer').value.trim();
    const resMsg = document.getElementById('result-message-14');
    if (!tracertRun) return showResult(resMsg, false, "Сначала выполните команду tracert.");
    if (ans === '192.168.1.1') {
        showResult(resMsg, true, "Верно! Вы определили IP-адрес шлюза.");
        trackSuccess('Урок 5.4: Работа с tracert / traceroute');
    } else {
        trackError();
        showResult(resMsg, false, "Неверный IP. Обратите внимание на первый hop в выводе трассировки.");
    }
}

// УРОК 15 (NETSTAT)
let netstatRun = false;
function handleConsole15(e) {
    if (e.key === 'Enter') {
        const inputObj = document.getElementById('console-15-input');
        const cmd = inputObj.value.trim().toLowerCase();
        const outObj = document.getElementById('console-15-output');
        outObj.innerHTML += `C:\\Users\\Student&gt; ${cmd}<br>`;
        inputObj.value = '';
        inputObj.disabled = true;
        let response = '';
        if (cmd === 'netstat -an' || cmd === 'netstat -a -n') {
            netstatRun = true;
            response = `<br>Активные подключения<br><br>  Имя    Локальный адрес        Внешний адрес          Состояние<br>  TCP    0.0.0.0:80             0.0.0.0:0              LISTENING<br>  TCP    0.0.0.0:135            0.0.0.0:0              LISTENING<br>  TCP    192.168.1.10:49215     8.8.8.8:443            ESTABLISHED<br>  UDP    0.0.0.0:5353           *:*                    <br><br>`;
        } else if (cmd === '') {
            inputObj.disabled = false;
            document.getElementById('console-15-input').focus();
            return;
        } else {
            response = `"${cmd}" не является внутренней или внешней командой.<br><br>`;
        }
        setTimeout(() => {
            outObj.innerHTML += response;
            inputObj.disabled = false;
            document.getElementById('console-15-input').focus();
            outObj.parentElement.scrollTop = outObj.parentElement.scrollHeight;
        }, 800);
    }
}
function checkLesson15() {
    const ans = document.getElementById('l15-answer').value.trim();
    const resMsg = document.getElementById('result-message-15');
    if (!netstatRun) return showResult(resMsg, false, "Сначала выполните команду netstat -an.");
    if (ans === '80') {
        showResult(resMsg, true, "Верно! Порт 80 открыт и прослушивается (LISTENING). Задание выполнено!");
        trackSuccess('Урок 5.5: Диагностика: команда netstat');
    } else {
        trackError();
        showResult(resMsg, false, "Неверный порт. Найдите строку с состоянием LISTENING и посмотрите порт после двоеточия локального адреса.");
    }
}
