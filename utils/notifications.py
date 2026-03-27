"""
utils/notifications.py
Optional Telegram notifications. Gracefully skips if no token configured.
"""
from __future__ import annotations
from utils.logger import get_logger

log = get_logger("notifications")


def send_telegram(message: str) -> bool:
    """
    Send a message via Telegram bot. Returns True on success.
    Silently skips if TELEGRAM_BOT_TOKEN is not configured.
    """
    from config.settings import TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID

    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        log.debug("Telegram not configured — skipping notification.")
        return False

    try:
        import requests  # type: ignore

        url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
        payload = {
            "chat_id": TELEGRAM_CHAT_ID,
            "text": message,
            "parse_mode": "HTML",
        }
        resp = requests.post(url, json=payload, timeout=10)
        resp.raise_for_status()
        log.info("Telegram notification sent.")
        return True
    except Exception as exc:
        log.warning(f"Telegram notification failed: {exc}")
        return False


def notify(subject: str, body: str) -> None:
    """High-level notify — currently routes to Telegram."""
    full_message = f"<b>🤖 Trading Bot</b>\n<b>{subject}</b>\n\n{body}"
    send_telegram(full_message)
