"""
engine/risk.py
Risk management: validates orders before execution.
"""
from __future__ import annotations
from datetime import datetime, time
import pytz
import pandas_market_calendars as mcal
from config.settings import MAX_POSITION_SIZE
from utils.logger import get_logger

log = get_logger("risk")

ET = pytz.timezone("America/New_York")


def is_market_open(check_time: datetime | None = None) -> bool:
    """Return True if US equities market is currently open based on NYSE calendar."""
    now_et = (check_time or datetime.now(ET)).astimezone(ET)

    # Check if it's a weekend
    if now_et.weekday() >= 5:  # Saturday=5, Sunday=6
        return False

    nyse = mcal.get_calendar('NYSE')
    # Get schedule for today
    today_str = now_et.strftime('%Y-%m-%d')
    schedule = nyse.schedule(start_date=today_str, end_date=today_str)

    if schedule.empty:
        # Today is a market holiday
        return False

    market_open = schedule.iloc[0]['market_open'].astimezone(ET)
    market_close = schedule.iloc[0]['market_close'].astimezone(ET)

    return market_open <= now_et < market_close


def validate_order(
    symbol: str,
    action: str,
    portfolio_value: float,
    current_price: float,
) -> tuple[bool, float, str]:
    """
    Validate and size an order.
    Uses ATR for dynamic position sizing if available.

    Returns (is_valid, quantity, reason).
    quantity is 0 if invalid.
    """
    if action not in ("BUY", "SELL"):
        return False, 0, f"Action '{action}' does not require order execution."

    if current_price <= 0:
        return False, 0, "Invalid current price (≤ 0)."

    if portfolio_value <= 0:
        return False, 0, "Portfolio value is zero or negative."

    from analysis.technical import get_atr
    atr = get_atr(symbol)

    # Calculate target risk in dollars (e.g., risk 1% of portfolio per trade)
    # This is different from MAX_POSITION_SIZE which is total exposure.
    # If a stock moves 1 ATR against us, we want to lose exactly TARGET_RISK_PCT of our portfolio
    TARGET_RISK_PCT = 0.01
    risk_dollars = portfolio_value * TARGET_RISK_PCT

    if atr and atr > 0:
        # Stop loss distance = 1.5 * ATR (typical standard)
        stop_loss_dist = atr * 1.5

        # Position size = (Risk $) / (Risk per share $)
        dynamic_qty = risk_dollars / stop_loss_dist

        # Calculate cost
        dynamic_cost = dynamic_qty * current_price

        # Cap the dynamic cost at our MAX_POSITION_SIZE to avoid putting too much capital in one trade
        # even if it's "low volatility"
        max_allowed_cost = portfolio_value * MAX_POSITION_SIZE

        if dynamic_cost > max_allowed_cost:
            cost = max_allowed_cost
            quantity = cost / current_price
            sizing_method = "CAP"
        else:
            quantity = dynamic_qty
            cost = dynamic_cost
            sizing_method = f"ATR({atr:.2f})"
    else:
        # Fallback to static sizing if ATR fails
        cost = portfolio_value * MAX_POSITION_SIZE
        quantity = cost / current_price
        sizing_method = "STATIC"

    # Fractional shares allowed on Alpaca, minimum 1 cent value
    if cost < 0.01:
        return False, 0, f"Position too small (${cost:.4f} < $0.01)."

    log.info(
        f"[{symbol}] Order validated: {action} {quantity:.4f} shares "
        f"@ ${current_price:.2f} = ${cost:.2f} "
        f"(Method: {sizing_method})"
    )
    return True, round(quantity, 4), "OK"
