"""
config/settings.py
Centralized configuration. Loads from .env file.
"""
import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from project root
load_dotenv(Path(__file__).parent.parent / ".env")


# ─── API Keys ────────────────────────────────────────────────────────────────
ALPHA_VANTAGE_API_KEY: str = os.getenv("ALPHA_VANTAGE_API_KEY", "")
FINNHUB_API_KEY: str = os.getenv("FINNHUB_API_KEY", "")

ALPACA_API_KEY: str = os.getenv("ALPACA_API_KEY", "")
ALPACA_SECRET_KEY: str = os.getenv("ALPACA_SECRET_KEY", "")
PAPER_TRADING: bool = os.getenv("PAPER_TRADING", "true").lower() != "false"

TELEGRAM_BOT_TOKEN: str = os.getenv("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_CHAT_ID: str = os.getenv("TELEGRAM_CHAT_ID", "")

# ─── Trading Settings ────────────────────────────────────────────────────────
_symbols_raw = os.getenv("SYMBOLS", "AAPL")
SYMBOLS: list[str] = [s.strip().upper() for s in _symbols_raw.split(",") if s.strip()]

# Max position size as fraction of portfolio (e.g. 0.05 = 5%)
MAX_POSITION_SIZE: float = float(os.getenv("MAX_POSITION_SIZE", "0.05"))

# Daily execution time in ET (e.g. "09:35")
EXECUTION_TIME_ET: str = os.getenv("EXECUTION_TIME_ET", "09:35")

# ─── Decision Engine Thresholds ──────────────────────────────────────────────
# Signal weights must sum to 1.0
WEIGHT_TECHNICAL: float = 0.40
WEIGHT_RECOMMENDATIONS: float = 0.35
WEIGHT_SENTIMENT: float = 0.25

# Thresholds for BUY/SELL decision
BUY_THRESHOLD: float = 0.6
SELL_THRESHOLD: float = -0.6
CONFIDENCE_THRESHOLD: float = 0.7

# ─── Paths ───────────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).parent.parent
LOG_DIR = BASE_DIR / "logs"
DATA_DIR = BASE_DIR / "data_store"
DB_PATH = DATA_DIR / "trading_bot.db"

LOG_DIR.mkdir(exist_ok=True)
DATA_DIR.mkdir(exist_ok=True)

# ─── Alpaca Endpoints ────────────────────────────────────────────────────────
ALPACA_BASE_URL = (
    "https://paper-api.alpaca.markets"
    if PAPER_TRADING
    else "https://api.alpaca.markets"
)
