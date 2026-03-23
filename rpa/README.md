# RPA: Автоматическая подача обращений в ГИБДД

## Установка на VPS

```bash
# 1. Установить зависимости
pip install -r requirements.txt

# 2. Установить браузер Chromium
playwright install chromium
playwright install-deps chromium
```

## Использование

### Одиночная отправка (JSON-строка)
```bash
python gibdd_submit.py --data '{"lastName":"Иванов","firstName":"Иван",...}'
```

### Одиночная отправка (JSON-файл)
```bash
python gibdd_submit.py --file example_application.json
```

### Режим очереди (автоматический)
```bash
# Запускается постоянно, проверяет queue.json каждые 30 сек
python gibdd_submit.py --watch

# С кастомным интервалом (60 сек)
python gibdd_submit.py --watch --interval 60
```

### Отладка (видимый браузер)
```bash
# Браузер будет виден на экране — нужен X11 или VNC на VPS
python gibdd_submit.py --file example_application.json --no-headless
```

## Формат queue.json

```json
[
  {
    "id": "ГАИ-2026-001",
    "status": "pending",
    "data": {
      "region": "Москва",
      "lastName": "Иванов",
      "firstName": "Иван",
      "middleName": "Иванович",
      "birthDate": "1990-05-15",
      "passportSeries": "1234",
      "passportNumber": "567890",
      "phone": "+7 (900) 000-00-00",
      "email": "ivanov@example.ru",
      "vehiclePlate": "А123ВС77",
      "vehicleVin": "WBAXXXXXXXX000000",
      "description": "Прошу поставить ТС на учёт."
    }
  }
]
```

После обработки статус меняется на `done` или `error`, добавляется `result` и `processed_at`.

## Автозапуск через systemd

```ini
# /etc/systemd/system/gibdd-rpa.service
[Unit]
Description=GIBDD RPA Worker
After=network.target

[Service]
WorkingDirectory=/opt/gibdd-rpa
ExecStart=/usr/bin/python3 gibdd_submit.py --watch --interval 30
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
systemctl enable gibdd-rpa
systemctl start gibdd-rpa
systemctl status gibdd-rpa
```

## Важные замечания

- **CAPTCHA**: если сайт показывает капчу, запустите с `--no-headless` и решите вручную
- **Скриншоты**: сохраняются в папку `screenshots/` — всегда проверяйте результат
- **Логи**: пишутся в `gibdd_rpa.log` и в консоль
- **Структура формы**: сайт ГИБДД может изменить вёрстку — при сбоях проверяйте скриншоты и обновляйте селекторы в `_fill()`
