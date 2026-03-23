"""
RPA-скрипт для автоматической подачи обращений на госавтоинспекция.рф/request_main
Требования: pip install playwright && playwright install chromium

Запуск:
  python gibdd_submit.py --data '{"lastName":"Иванов",...}'
  python gibdd_submit.py --file application.json
  python gibdd_submit.py --watch   # режим очереди из queue.json
"""

import argparse
import json
import sys
import time
import logging
from pathlib import Path
from datetime import datetime

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("gibdd_rpa.log", encoding="utf-8"),
    ],
)
log = logging.getLogger(__name__)

URL = "https://xn--90adear.xn--p1ai/request_main"

REGION_MAP = {
    "Москва": "45",
    "Санкт-Петербург": "78",
    "Московская область": "50",
}


def submit_application(data: dict, headless: bool = True) -> dict:
    """
    Заполняет и отправляет форму обращения на сайте ГИБДД.
    Возвращает словарь с результатом: success, number, screenshot, error.
    """
    from playwright.sync_api import sync_playwright, TimeoutError as PWTimeout

    result = {"success": False, "number": None, "screenshot": None, "error": None}

    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=headless,
            args=["--no-sandbox", "--disable-dev-shm-usage"],
        )
        context = browser.new_context(
            locale="ru-RU",
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/122.0.0.0 Safari/537.36"
            ),
        )
        page = context.new_page()
        page.set_default_timeout(30_000)

        try:
            log.info("Открываю страницу ГИБДД...")
            page.goto(URL, wait_until="networkidle")
            page.wait_for_load_state("domcontentloaded")
            time.sleep(2)

            # --- Шаг 1: Выбор региона ---
            log.info("Выбираю регион...")
            region_value = REGION_MAP.get(data.get("region", "Москва"), "45")
            region_select = page.locator("select[name='region'], #region, select.region")
            if region_select.count() > 0:
                region_select.first.select_option(value=region_value)
                time.sleep(1)

            # --- Шаг 2: Тип обращения ---
            log.info("Выбираю тип обращения...")
            appeal_type = page.locator(
                "select[name='appeal_type'], #appeal_type, select[name='type']"
            )
            if appeal_type.count() > 0:
                appeal_type.first.select_option(index=1)
                time.sleep(1)

            # --- Шаг 3: Персональные данные ---
            log.info("Заполняю персональные данные...")

            _fill(page, ["#lastName", "input[name='lastName']", "input[placeholder*='Фамилия']"], data.get("lastName", ""))
            _fill(page, ["#firstName", "input[name='firstName']", "input[placeholder*='Имя']"], data.get("firstName", ""))
            _fill(page, ["#middleName", "input[name='middleName']", "input[placeholder*='Отчество']"], data.get("middleName", ""))

            # Дата рождения
            dob = data.get("birthDate", "")
            if dob:
                _fill(page, ["#birthDate", "input[name='birthDate']", "input[type='date']"], dob)

            # --- Шаг 4: Паспортные данные ---
            log.info("Заполняю паспортные данные...")
            _fill(page, ["#passportSeries", "input[name='passportSeries']"], data.get("passportSeries", ""))
            _fill(page, ["#passportNumber", "input[name='passportNumber']"], data.get("passportNumber", ""))

            # --- Шаг 5: Контакты ---
            log.info("Заполняю контактные данные...")
            _fill(page, ["#email", "input[name='email']", "input[type='email']"], data.get("email", ""))
            _fill(page, ["#phone", "input[name='phone']", "input[type='tel']"], data.get("phone", ""))

            # --- Шаг 6: Транспортное средство ---
            plate = data.get("vehiclePlate", "")
            if plate:
                log.info("Заполняю данные ТС...")
                _fill(page, ["#vehiclePlate", "input[name='vehiclePlate']", "input[name='grz']"], plate)

            vin = data.get("vehicleVin", "")
            if vin:
                _fill(page, ["#vehicleVin", "input[name='vehicleVin']", "input[name='vin']"], vin)

            # --- Шаг 7: Текст обращения ---
            log.info("Заполняю текст обращения...")
            description = data.get("description", data.get("applicationType", "Обращение"))
            _fill(
                page,
                ["#text", "textarea[name='text']", "textarea[name='description']", "textarea"],
                description,
            )

            # --- Скриншот перед отправкой ---
            ts = datetime.now().strftime("%Y%m%d_%H%M%S")
            screenshot_path = f"screenshots/before_submit_{ts}.png"
            Path("screenshots").mkdir(exist_ok=True)
            page.screenshot(path=screenshot_path, full_page=True)
            log.info(f"Скриншот сохранён: {screenshot_path}")
            result["screenshot"] = screenshot_path

            # --- CAPTCHA ---
            captcha = page.locator(".captcha, #captcha, img[src*='captcha']")
            if captcha.count() > 0:
                log.warning(
                    "ОБНАРУЖЕНА CAPTCHA — требуется ручное решение. "
                    "Запустите скрипт с --no-headless и решите капчу вручную."
                )
                if headless:
                    result["error"] = "captcha_required"
                    return result
                else:
                    log.info("Жду решения капчи (до 120 сек)...")
                    page.wait_for_selector(".captcha", state="hidden", timeout=120_000)

            # --- Шаг 8: Отправка ---
            log.info("Нажимаю кнопку отправки...")
            submit_btn = page.locator(
                "button[type='submit'], input[type='submit'], "
                "button:has-text('Отправить'), button:has-text('Подать')"
            )
            if submit_btn.count() == 0:
                raise Exception("Кнопка отправки не найдена")

            submit_btn.first.click()
            time.sleep(3)

            # --- Шаг 9: Читаем номер обращения ---
            page.wait_for_load_state("networkidle", timeout=15_000)
            success_screenshot = f"screenshots/after_submit_{ts}.png"
            page.screenshot(path=success_screenshot, full_page=True)

            number_locators = [
                ".appeal-number", "#appealNumber", "[class*='number']",
                "text=/№\\s*\\d+/", "text=/обращени/i",
            ]
            for loc in number_locators:
                el = page.locator(loc)
                if el.count() > 0:
                    result["number"] = el.first.inner_text().strip()
                    break

            result["success"] = True
            result["screenshot"] = success_screenshot
            log.info(f"Успешно отправлено! Номер: {result['number']}")

        except PWTimeout as e:
            log.error(f"Таймаут: {e}")
            result["error"] = f"timeout: {str(e)}"
            page.screenshot(path=f"screenshots/error_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png")

        except Exception as e:
            log.error(f"Ошибка: {e}")
            result["error"] = str(e)
            try:
                page.screenshot(path=f"screenshots/error_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png")
            except Exception:
                pass

        finally:
            browser.close()

    return result


def _fill(page, selectors: list, value: str):
    """Пробует заполнить поле по списку селекторов. Пропускает если поле не найдено."""
    if not value:
        return
    for sel in selectors:
        try:
            el = page.locator(sel)
            if el.count() > 0:
                el.first.scroll_into_view_if_needed()
                el.first.fill(value)
                return
        except Exception:
            continue
    log.debug(f"Поле не найдено ни по одному селектору: {selectors}")


def watch_queue(queue_file: str = "queue.json", interval: int = 30):
    """
    Режим очереди: читает queue.json, обрабатывает заявления со статусом 'pending'.
    Формат queue.json:
    [
      {"id": "ГАИ-2026-001", "status": "pending", "data": {...}},
      ...
    ]
    """
    log.info(f"Запуск в режиме очереди. Файл: {queue_file}, интервал: {interval}с")
    path = Path(queue_file)

    while True:
        if not path.exists():
            log.warning(f"Файл очереди не найден: {queue_file}")
            time.sleep(interval)
            continue

        queue = json.loads(path.read_text(encoding="utf-8"))
        pending = [item for item in queue if item.get("status") == "pending"]

        if not pending:
            log.info("Нет новых заявлений в очереди.")
        else:
            log.info(f"Найдено заявлений: {len(pending)}")
            for item in pending:
                log.info(f"Обрабатываю: {item['id']}")
                result = submit_application(item["data"])

                for q in queue:
                    if q["id"] == item["id"]:
                        q["status"] = "done" if result["success"] else "error"
                        q["result"] = result
                        q["processed_at"] = datetime.now().isoformat()

                path.write_text(json.dumps(queue, ensure_ascii=False, indent=2), encoding="utf-8")
                time.sleep(5)

        time.sleep(interval)


def main():
    parser = argparse.ArgumentParser(description="RPA: подача обращений на сайт ГИБДД")
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--data", help="JSON-строка с данными заявления")
    group.add_argument("--file", help="Путь к JSON-файлу с данными заявления")
    group.add_argument("--watch", action="store_true", help="Режим очереди (queue.json)")

    parser.add_argument("--no-headless", action="store_true", help="Показать браузер (для отладки/капчи)")
    parser.add_argument("--queue-file", default="queue.json", help="Файл очереди для --watch")
    parser.add_argument("--interval", type=int, default=30, help="Интервал проверки очереди (сек)")

    args = parser.parse_args()

    if args.watch:
        watch_queue(args.queue_file, args.interval)
        return

    if args.data:
        data = json.loads(args.data)
    else:
        data = json.loads(Path(args.file).read_text(encoding="utf-8"))

    result = submit_application(data, headless=not args.no_headless)
    print(json.dumps(result, ensure_ascii=False, indent=2))
    sys.exit(0 if result["success"] else 1)


if __name__ == "__main__":
    main()
