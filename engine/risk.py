"""
engine/risk.py
Risk management: validates orders before execution.
"""
from __future__ import annotations
from datetime import datetime, time
import pytz
from config.settings import MAX_POSITION_SIZE
from utils.logger import get_logger

log = get_logger("risk")

ET = pytz.timezone("America/New_York")

# NYSE/NASDAQ regular hours: 9:30 AM – 4:00 PM ET, Mon–Fri
MARKET_OPEN  = time(9, 30)
MARKET_CLOSE = time(16, 0)


def is_market_open(check_time: datetime | None = None) -> bool:
    """Return True if US equities market is currently open."""
    now_et = (check_time or datetime.now(ET)).astimezone(ET)
    if now_et.weekday() >= 5:  # Saturday=5, Sunday=6
        return False
    current = now_et.time()
    return MARKET_OPEN <= current < MARKET_CLOSE


def validate_order(
    symbol: str,
    action: str,
    portfolio_value: float,
    current_price: float,
) -> tuple[bool, float, str]:
    """
    Validate and size an order.

    Returns (is_valid, quantity, reason).
    quantity is 0 if invalid.
    """
    if action not in ("BUY", "SELL"):
        return False, 0, f"Action '{action}' does not require order execution."

    if current_price <= 0:
        return False, 0, "Invalid current price (≤ 0)."

    if portfolio_value <= 0:
        return False, 0, "Portfolio value is zero or negative."

    max_dollars = portfolio_value * MAX_POSITION_SIZE
    quantity    = max_dollars / current_price

    # Fractional shares allowed on Alpaca, minimum 1 cent value
    if max_dollars < 0.01:
        return False, 0, f"Position too small (${max_dollars:.4f} < $0.01)."

    log.info(
        f"[{symbol}] Order validated: {action} {quantity:.4f} shares "
        f"@ ${current_price:.2f} = ${quantity*current_price:.2f} "
        f"({MAX_POSITION_SIZE*100:.1f}% of ${portfolio_value:.2f})"
    )
    return True, round(quantity, 4), "OK"
