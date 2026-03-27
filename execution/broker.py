"""
execution/broker.py
Alpaca broker wrapper. Defaults to paper trading.
Falls back to DRY_RUN simulation if no API keys are configured.
"""
from __future__ import annotations
from config.settings import (
    ALPACA_API_KEY, ALPACA_SECRET_KEY, ALPACA_BASE_URL, PAPER_TRADING
)
from utils.logger import get_logger

log = get_logger("broker")


class BrokerClient:
    """
    Thin wrapper around the Alpaca trading API.
    If API keys are missing, operates in local simulation mode.
    """

    def __init__(self) -> None:
        self._client = None
        self._simulation = False

        if not ALPACA_API_KEY or not ALPACA_SECRET_KEY:
            log.warning(
                "Alpaca API keys not configured. Running in LOCAL SIMULATION mode. "
                "Set ALPACA_API_KEY and ALPACA_SECRET_KEY in .env to connect to Alpaca."
            )
            self._simulation = True
            return

        try:
            from alpaca.trading.client import TradingClient  # type: ignore

            self._client = TradingClient(
                api_key=ALPACA_API_KEY,
                secret_key=ALPACA_SECRET_KEY,
                paper=PAPER_TRADING,
            )
            mode = "PAPER" if PAPER_TRADING else "LIVE"
            log.info(f"Alpaca broker connected ({mode} trading).")
        except ImportError:
            log.error("alpaca-py not installed. Run: pip install alpaca-py")
            self._simulation = True
        except Exception as exc:
            log.error(f"Alpaca connection failed: {exc}")
            self._simulation = True

    @property
    def api(self):
        """Expose the underlying Alpaca client."""
        return self._client

    @property
    def is_simulation(self) -> bool:
        return self._simulation

    def get_portfolio_value(self) -> float:
        """Return total portfolio equity value in USD."""
        if self._simulation:
            log.info("[SIM] Portfolio value: $10,000.00")
            return 10_000.0

        try:
            account = self._client.get_account()
            equity = float(account.equity)
            log.info(f"Alpaca portfolio equity: ${equity:,.2f}")
            return equity
        except Exception as exc:
            log.error(f"Failed to fetch portfolio value: {exc}")
            return 0.0

    def get_position(self, symbol: str) -> float:
        """Return current position quantity (0 if none)."""
        if self._simulation:
            return 0.0

        try:
            position = self._client.get_open_position(symbol)
            return float(position.qty)
        except Exception:
            return 0.0

    def get_all_positions(self) -> list:
        """Return a list of all open positions."""
        if self._simulation:
            return []
        try:
            positions = self._client.get_all_positions()
            return [
                {
                    "symbol": p.symbol,
                    "qty": float(p.qty),
                    "market_value": float(p.market_value),
                    "current_price": float(p.current_price),
                    "unrealized_pl": float(p.unrealized_pl),
                    "change_today": float(p.change_today) if p.change_today else 0.0
                }
                for p in positions
            ]
        except Exception as e:
            log.error(f"Failed to fetch positions: {e}")
            return []

    def get_account_info(self) -> dict:
        """Fetch full account details."""
        if self._simulation:
            return {
                "equity": 10000.0,
                "cash": 10000.0,
                "buying_power": 20000.0,
                "currency": "USD",
                "status": "SIMULATED"
            }
        try:
            acc = self._client.get_account()
            return {
                "equity": float(acc.equity),
                "cash": float(acc.cash),
                "buying_power": float(acc.buying_power),
                "currency": acc.currency,
                "status": acc.status
            }
        except Exception as e:
            log.error(f"Failed to fetch account info: {e}")
            return {}

    def submit_market_order(
        self, symbol: str, side: str, qty: float
    ) -> dict:
        """
        Submit a market order.
        side: "buy" or "sell"
        Returns order dict or simulation result.
        """
        if self._simulation:
            sim_result = {
                "id": "SIM-ORDER",
                "symbol": symbol,
                "side": side,
                "qty": qty,
                "status": "simulated",
            }
            log.info(f"[SIM] Order: {side.upper()} {qty:.4f} {symbol}")
            return sim_result

        try:
            from alpaca.trading.requests import MarketOrderRequest  # type: ignore
            from alpaca.trading.enums import OrderSide, TimeInForce  # type: ignore

            order_side = OrderSide.BUY if side.lower() == "buy" else OrderSide.SELL
            request = MarketOrderRequest(
                symbol=symbol,
                qty=qty,
                side=order_side,
                time_in_force=TimeInForce.DAY,
            )
            order = self._client.submit_order(request)
            log.info(
                f"Order submitted: {side.upper()} {qty:.4f} {symbol} | ID={order.id}"
            )
            return {
                "id": str(order.id),
                "symbol": symbol,
                "side": side,
                "qty": qty,
                "status": str(order.status),
            }
        except Exception as exc:
            log.error(f"Order submission failed for {symbol}: {exc}")
            raise
