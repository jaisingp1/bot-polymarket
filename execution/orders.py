"""
execution/orders.py
Order management: validate, execute, and record orders.
"""
from __future__ import annotations
from engine.decision import DecisionResult
from engine.risk import validate_order, is_market_open
from execution.broker import BrokerClient
from data.fetcher import get_current_price
from data.cache import log_trade
from utils.logger import get_logger
from utils.notifications import notify

log = get_logger("orders")


def execute_decision(
    result: DecisionResult,
    broker: BrokerClient,
    dry_run: bool = False,
) -> dict:
    """
    Execute a trading decision.

    dry_run=True → skip actual order, just log & notify.
    Returns a summary dict.
    """
    symbol = result.symbol
    action = result.action

    summary = {
        "symbol": symbol,
        "action": action,
        "signal": result.signal,
        "confidence": result.confidence,
        "executed": False,
        "qty": 0.0,
        "price": 0.0,
        "reason": result.reason,
        "dry_run": dry_run,
    }

    # ── HOLD: nothing to execute ──────────────────────────────────
    if action == "HOLD":
        log.info(f"[{symbol}] HOLD — no order placed. Reason: {result.reason}")
        log_trade(symbol, "HOLD", result.signal, result.confidence, dry_run=dry_run)
        notify("HOLD", f"{symbol}: {result.reason}")
        return summary

    # ── Market hours check ────────────────────────────────────────
    if not is_market_open() and not dry_run:
        log.warning(f"[{symbol}] Market is closed. Order deferred.")
        summary["reason"] = "Market closed"
        return summary

    # ── Get current price ─────────────────────────────────────────
    price = get_current_price(symbol)
    if price is None:
        log.error(f"[{symbol}] Cannot get current price. Aborting.")
        summary["reason"] = "Price unavailable"
        return summary

    summary["price"] = price

    # ── Risk / sizing validation ──────────────────────────────────
    portfolio_value = broker.get_portfolio_value()
    is_valid, qty, risk_reason = validate_order(symbol, action, portfolio_value, price)
    if not is_valid:
        log.warning(f"[{symbol}] Order rejected by risk manager: {risk_reason}")
        summary["reason"] = risk_reason
        return summary

    summary["qty"] = qty

    # ── Dry run: log but skip execution ───────────────────────────
    if dry_run:
        log.info(
            f"[DRY RUN] Would {action} {qty:.4f} {symbol} @ ${price:.2f} "
            f"= ${qty*price:.2f} | signal={result.signal:.3f} conf={result.confidence:.3f}"
        )
        log_trade(symbol, action, result.signal, result.confidence, qty, price, dry_run=True)
        notify(
            f"[DRY RUN] {action} {symbol}",
            f"Qty: {qty:.4f} @ ${price:.2f}\nSignal: {result.signal:.3f} | Conf: {result.confidence:.3f}\n{result.reason}",
        )
        summary["executed"] = True
        return summary

    # ── Live / paper execution ────────────────────────────────────
    try:
        side = "buy" if action == "BUY" else "sell"
        order = broker.submit_market_order(symbol, side, qty)
        summary["executed"] = True
        summary["order_id"] = order.get("id")
        log_trade(symbol, action, result.signal, result.confidence, qty, price, dry_run=False, notes=str(order.get("id")))
        notify(
            f"{'🟢 BUY' if action=='BUY' else '🔴 SELL'} {symbol}",
            f"Qty: {qty:.4f} @ ~${price:.2f} = ${qty*price:.2f}\n"
            f"Signal: {result.signal:.3f} | Confidence: {result.confidence:.3f}\n"
            f"Order ID: {order.get('id')}",
        )
        log.info(f"[{symbol}] {action} order executed successfully.")
    except Exception as exc:
        log.error(f"[{symbol}] Order execution failed: {exc}")
        summary["reason"] = str(exc)

    return summary
