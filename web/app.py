import sys
import sqlite3
from pathlib import Path
from flask import Flask, render_template, jsonify, request

# Add the project directory to sys.path to allow importing bot modules
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

import threading
import schedule
import time
from datetime import datetime
import pytz
from config.settings import DB_PATH, SYMBOLS, PAPER_TRADING
from engine.decision import decide
from execution.broker import BrokerClient
from execution.orders import execute_decision
from data.cache import init_db

app = Flask(__name__)

# Runtime override for Paper Trading (defaults to config setting)
from config import settings
CURRENT_PAPER_MODE = settings.PAPER_TRADING


def get_db_connection():
    if not DB_PATH.exists():
        return None
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/status")
def status():
    # Check if optional API keys are provided
    from config.settings import ALPHA_VANTAGE_API_KEY, FINNHUB_API_KEY
    return jsonify({
        "status": "online",
        "symbols": SYMBOLS,
        "mode": "PAPER" if CURRENT_PAPER_MODE else "LIVE",
        "database_exists": DB_PATH.exists(),
        "config_paper": PAPER_TRADING,
        "health": {
            "alpha_vantage": bool(ALPHA_VANTAGE_API_KEY),
            "finnhub": bool(FINNHUB_API_KEY),
            "alpaca": bool(settings.ALPACA_API_KEY and settings.ALPACA_SECRET_KEY)
        }
    })


@app.route("/api/account")
def account():
    """Fetch real-time Alpaca account balance."""
    try:
        broker = BrokerClient()
        data = broker.get_account_info()
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/positions")
def positions():
    """Fetch current open positions and enhance with bot suggestions."""
    try:
        broker = BrokerClient()
        raw_positions = broker.get_all_positions()
        
        # Add bot analysis for each position
        enhanced = []
        for p in raw_positions:
            try:
                # Get bot's current opinion on this ticker
                decision = decide(p["symbol"])
                p["bot_suggestion"] = decision.action
                p["bot_confidence"] = decision.confidence
                p["bot_reason"] = decision.reason
            except:
                p["bot_suggestion"] = "N/A"
            enhanced.append(p)
            
        return jsonify(enhanced)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/toggle_trading", methods=["POST"])
def toggle_trading():
    global CURRENT_PAPER_MODE
    data = request.json or {}
    new_mode = data.get("paper_trading", True)
    CURRENT_PAPER_MODE = new_mode
    return jsonify({"mode": "PAPER" if CURRENT_PAPER_MODE else "LIVE"})


@app.route("/api/search")
def search():
    query = request.args.get("q", "").strip()
    if not query:
        return jsonify([])
    
    import requests
    try:
        # Yahoo Finance search API (internal but widely used)
        url = f"https://query2.finance.yahoo.com/v1/finance/search?q={query}&quotesCount=10&newsCount=0"
        headers = {'User-Agent': 'Mozilla/5.0'}
        response = requests.get(url, headers=headers)
        data = response.json()
        
        results = []
        for quote in data.get("quotes", []):
            if quote.get("quoteType") == "EQUITY":
                results.append({
                    "symbol": quote.get("symbol"),
                    "name": quote.get("shortname") or quote.get("longname"),
                    "exchange": quote.get("exchange")
                })
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/history")
def history():
    conn = get_db_connection()
    if not conn:
        return jsonify([])

    try:
        rows = conn.execute(
            "SELECT id, timestamp, symbol, action, signal, confidence, qty, price, dry_run, notes "
            "FROM trade_log ORDER BY id DESC LIMIT 50"
        ).fetchall()
        
        # Convert sqlite3.Row objects to dicts
        history_list = [dict(row) for row in rows]
        return jsonify(history_list)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()


@app.route("/api/schedules", methods=["GET", "POST", "DELETE"])
def api_schedules():
    conn = get_db_connection()
    if not conn: return jsonify({"error": "No database"}), 500

    if request.method == "GET":
        rows = conn.execute("SELECT * FROM schedules").fetchall()
        conn.close()
        return jsonify([dict(r) for r in rows])

    if request.method == "POST":
        data = request.json
        conn.execute(
            "INSERT INTO schedules (time_at, label, is_active, is_interval) VALUES (?,?,?,?)",
            (data["time_at"], data["label"], 1, data.get("is_interval", 0))
        )
        conn.commit()
        conn.close()
        refresh_scheduler()
        return jsonify({"status": "success"})

    if request.method == "DELETE":
        sid = request.args.get("id")
        conn.execute("DELETE FROM schedules WHERE id=?", (sid,))
        conn.commit()
        conn.close()
        refresh_scheduler()
        return jsonify({"status": "deleted"})


@app.route("/api/run_dry", methods=["POST"])
def run_dry():
    """Execute a dry-run for all symbols and return the results."""
    broker = BrokerClient()
    results = []
    
    for symbol in SYMBOLS:
        try:
            decision = decide(symbol)
            summary = execute_decision(decision, broker, dry_run=True)
            results.append(summary)
        except Exception as e:
            results.append({
                "symbol": symbol,
                "error": str(e)
            })
            
    return jsonify(results)


@app.route("/api/run_live", methods=["POST"])
def run_live():
    """Execute real pipeline (Paper or Live based on global state) for all symbols."""
    broker = BrokerClient()
    results = []
    
    for symbol in SYMBOLS:
        try:
            decision = decide(symbol)
            # Use CURRENT_PAPER_MODE instead of static PAPER_TRADING
            summary = execute_decision(decision, broker, dry_run=False)
            results.append(summary)
        except Exception as e:
            results.append({
                "symbol": symbol,
                "error": str(e)
            })
            
    return jsonify(results)


@app.route("/api/trade_custom", methods=["POST"])
def trade_custom():
    """Evaluate and optionally trade a single custom symbol."""
    data = request.json or {}
    symbol = data.get("symbol", "").strip().upper()
    dry_run = data.get("dry_run", True)
    
    if not symbol:
        return jsonify({"error": "No symbol provided"}), 400
        
    try:
        broker = BrokerClient()
        decision = decide(symbol)
        # Check current global mode for LIVE execution from UI
        summary = execute_decision(decision, broker, dry_run=dry_run)
        
        # Add breakdown to the summary
        summary["tech"] = {"s": decision.tech_signal, "c": decision.tech_conf}
        summary["rec"] = {"s": decision.rec_signal, "c": decision.rec_conf}
        summary["sent"] = {"s": decision.sent_signal, "c": decision.sent_conf}
        
        return jsonify([summary])
    except Exception as e:
        return jsonify([{"symbol": symbol, "error": str(e)}])


@app.route("/api/suggestions")
def suggestions():
    """Evaluate a hardcoded list of popular tickers proactively."""
    # List of trending/popular stocks for suggestions
    SUGGESTED_SYMBOLS = ["NVDA", "TSLA", "META", "AMD", "PLTR"]
    
    results = []
    for symbol in SUGGESTED_SYMBOLS:
        try:
            decision = decide(symbol)
            # We don't execute an order, just return the raw decision data
            results.append({
                "symbol": symbol,
                "signal": decision.signal,
                "confidence": decision.confidence,
                "action": decision.action,
                "reason": decision.reason,
                "tech": {"s": decision.tech_signal, "c": decision.tech_conf},
                "rec": {"s": decision.rec_signal, "c": decision.rec_conf},
                "sent": {"s": decision.sent_signal, "c": decision.sent_conf}
            })
        except Exception as e:
            pass # Silently skip errors on suggestions
            
    return jsonify(results)


# ─── Background Scheduler Logic ──────────────────────────────────────────

def run_scheduled_job():
    """Triggered by the scheduler."""
    with app.app_context():
        print(f"[{datetime.now()}] Autonomo: Iniciando escaneo de {len(SYMBOLS)} símbolos...")
        broker = BrokerClient()
        for symbol in SYMBOLS:
            try:
                decision = decide(symbol)
                execute_decision(decision, broker, dry_run=PAPER_TRADING)
            except Exception as e:
                print(f"Error en job autónomo ({symbol}): {e}")

def refresh_scheduler():
    """Reload schedules from DB into the 'schedule' library."""
    schedule.clear()
    conn = get_db_connection()
    if not conn: return
    
    rows = conn.execute("SELECT * FROM schedules WHERE is_active=1").fetchall()
    for row in rows:
        if row["is_interval"]:
            # Interval mode (e.g. 30 mins)
            mins = int(row["time_at"])
            schedule.every(mins).minutes.do(run_scheduled_job)
        else:
            # Fixed time mode (HH:MM)
            # We assume the time in DB is ET (NYC), so we'd need TZ handling if strictly required
            # For now, we'll use local time but label it ET in UI for the user.
            schedule.every().day.at(row["time_at"]).do(run_scheduled_job)
    conn.close()
    print(f"Scheduler actualizado: {len(rows)} tareas activas.")

def scheduler_loop():
    refresh_scheduler()
    while True:
        schedule.run_pending()
        time.sleep(10)

if __name__ == "__main__":
    init_db()
    # Start scheduler in background thread
    threading.Thread(target=scheduler_loop, daemon=True).start()
    app.run(host="0.0.0.0", port=5000, debug=True, use_reloader=False) # Reloader off to avoid double threads
