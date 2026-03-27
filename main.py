"""
main.py — Bot de Trading Polymarket/US Markets
=============================================
Orchestrates the daily trading pipeline:
  1. Fetch market data (yfinance, Alpha Vantage, Finnhub)
  2. Compute signals (technical, analyst recs, sentiment)
  3. Decide (BUY / SELL / HOLD) via weighted aggregation
  4. Execute order via Alpaca (or simulate locally)
  5. Log and notify via Telegram

Usage:
  # Run once immediately (dry-run, no real orders):
  python main.py --dry-run --symbol AAPL

  # Run once for real (paper or live depending on .env):
  python main.py --symbol AAPL

  # Run on schedule daily at 09:35 ET (paper trading mode):
  python main.py --schedule

  # Run scheduled with custom symbols:
  python main.py --schedule --symbol AAPL MSFT GOOGL

  # Show recent trade history:
  python main.py --history
"""
from __future__ import annotations
import argparse
import sys
import time
import schedule
from datetime import datetime
from typing import Sequence

from config.settings import SYMBOLS, EXECUTION_TIME_ET, PAPER_TRADING
from data.cache import init_db, log_trade
from engine.decision import decide
from execution.broker import BrokerClient
from execution.orders import execute_decision
from utils.logger import get_logger
from utils.notifications import notify

log = get_logger("main")


# ─── Single run ──────────────────────────────────────────────────────────────

def run_once(symbols: list[str], dry_run: bool = False) -> None:
    """Run the full trading pipeline once for all symbols."""
    log.info("=" * 60)
    log.info(f"Trading Bot — {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    mode_tag = "[DRY RUN] " if dry_run else ("[PAPER] " if PAPER_TRADING else "[LIVE] ")
    log.info(f"Mode: {mode_tag.strip()} | Symbols: {', '.join(symbols)}")
    log.info("=" * 60)

    broker = BrokerClient()

    for symbol in symbols:
        log.info(f"\n{'─'*50}\nProcessing: {symbol}\n{'─'*50}")
        try:
            result = decide(symbol)
            summary = execute_decision(result, broker, dry_run=dry_run)

            # Pretty print to console
            print(
                f"\n{'='*50}\n"
                f"  Symbol     : {summary['symbol']}\n"
                f"  Decision   : {summary['action']}\n"
                f"  Signal     : {summary['signal']:+.4f}\n"
                f"  Confidence : {summary['confidence']:.4f}\n"
                f"  Reason     : {summary['reason']}\n"
                f"  Executed   : {summary['executed']}\n"
                f"  Qty        : {summary['qty']:.4f}\n"
                f"  Price      : ${summary.get('price', 0):.2f}\n"
                f"{'='*50}"
            )

        except Exception as exc:
            log.error(f"[{symbol}] Pipeline error: {exc}", exc_info=True)
            notify(f"❌ Error — {symbol}", str(exc))

    log.info("Trading session complete.")


# ─── Scheduler ───────────────────────────────────────────────────────────────

def run_scheduled_wrapper(symbols: list[str], dry_run: bool) -> None:
    """Wrapper to check market open status before running the pipeline."""
    from engine.risk import is_market_open
    if not is_market_open() and not dry_run:
        log.info("Market is closed today. Skipping scheduled run to save API tokens.")
        return
    run_once(symbols, dry_run=dry_run)

def run_scheduled(symbols: list[str]) -> None:
    """
    Schedule the bot to run every weekday at EXECUTION_TIME_ET (ET).
    Blocks until interrupted.
    """
    log.info(
        f"Scheduler started. Will run at {EXECUTION_TIME_ET} ET on weekdays. "
        f"Symbols: {', '.join(symbols)}"
    )

    # schedule library uses local time — warn if not ET
    # Changed to use wrapper function to save tokens
    from config.settings import PAPER_TRADING
    schedule.every().monday.at(EXECUTION_TIME_ET).do(run_scheduled_wrapper, symbols=symbols, dry_run=PAPER_TRADING)
    schedule.every().tuesday.at(EXECUTION_TIME_ET).do(run_scheduled_wrapper, symbols=symbols, dry_run=PAPER_TRADING)
    schedule.every().wednesday.at(EXECUTION_TIME_ET).do(run_scheduled_wrapper, symbols=symbols, dry_run=PAPER_TRADING)
    schedule.every().thursday.at(EXECUTION_TIME_ET).do(run_scheduled_wrapper, symbols=symbols, dry_run=PAPER_TRADING)
    schedule.every().friday.at(EXECUTION_TIME_ET).do(run_scheduled_wrapper, symbols=symbols, dry_run=PAPER_TRADING)

    notify("🤖 Bot started", f"Scheduled at {EXECUTION_TIME_ET} ET | Symbols: {', '.join(symbols)}")

    while True:
        schedule.run_pending()
        time.sleep(30)


# ─── History viewer ──────────────────────────────────────────────────────────

def show_history(n: int = 20) -> None:
    """Print the last N trades from the SQLite trade log."""
    import sqlite3
    from config.settings import DB_PATH

    if not DB_PATH.exists():
        print("No trade history found. Run the bot first.")
        return

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    rows = conn.execute(
        f"SELECT * FROM trade_log ORDER BY id DESC LIMIT {n}"
    ).fetchall()
    conn.close()

    if not rows:
        print("Trade log is empty.")
        return

    print(f"\n{'─'*80}")
    print(f"{'ID':>4}  {'Timestamp':<20}  {'Symbol':<6}  {'Action':<5}  "
          f"{'Signal':>8}  {'Conf':>6}  {'Qty':>8}  {'Price':>8}  {'DryRun'}")
    print(f"{'─'*80}")
    for r in rows:
        print(
            f"{r['id']:>4}  {r['timestamp'][:19]:<20}  {r['symbol']:<6}  "
            f"{r['action']:<5}  {r['signal']:>8.4f}  {r['confidence']:>6.3f}  "
            f"{r['qty']:>8.4f}  {r['price']:>8.2f}  {'Yes' if r['dry_run'] else 'No'}"
        )
    print(f"{'─'*80}\n")


# ─── Entry point ─────────────────────────────────────────────────────────────

def main(argv: Sequence[str] | None = None) -> None:
    parser = argparse.ArgumentParser(
        description="Polymarket/US Trading Bot — automated daily trader"
    )
    parser.add_argument(
        "--symbol", nargs="+", default=None,
        help="Symbol(s) to trade (default: from SYMBOLS in .env)"
    )
    parser.add_argument(
        "--dry-run", action="store_true",
        help="Run pipeline without sending real orders"
    )
    parser.add_argument(
        "--schedule", action="store_true",
        help="Run on daily schedule at EXECUTION_TIME_ET"
    )
    parser.add_argument(
        "--history", action="store_true",
        help="Show recent trade history from DB"
    )

    args = parser.parse_args(argv)

    # Initialise database
    init_db()

    # Resolve symbols
    symbols = args.symbol if args.symbol else SYMBOLS
    symbols = [s.upper() for s in symbols]

    if args.history:
        show_history()
        return

    if args.schedule:
        run_scheduled(symbols)
    else:
        run_once(symbols, dry_run=args.dry_run)


if __name__ == "__main__":
    main()
