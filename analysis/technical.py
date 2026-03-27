"""
analysis/technical.py
Technical indicator calculations using pandas-ta.
Returns normalized signals in [-1, +1] with confidence levels.
"""
from __future__ import annotations
import pandas as pd
import numpy as np
from typing import NamedTuple
from data.fetcher import get_price_history
from utils.logger import get_logger

log = get_logger("technical")


class Signal(NamedTuple):
    value: float       # [-1.0, +1.0]  negative=bearish, positive=bullish
    confidence: float  # [0.0,  1.0]
    source: str


def _clamp(v: float, lo: float = -1.0, hi: float = 1.0) -> float:
    return max(lo, min(hi, v))


def _rsi_signal(rsi: float) -> Signal:
    """RSI: >70 overbought (SELL), <30 oversold (BUY)."""
    if rsi >= 80:
        return Signal(-1.0, 0.9, "RSI")
    if rsi >= 70:
        return Signal(-0.7, 0.7, "RSI")
    if rsi <= 20:
        return Signal(1.0, 0.9, "RSI")
    if rsi <= 30:
        return Signal(0.7, 0.7, "RSI")
    # Neutral zone: linear interpolation between 30-70
    val = _clamp(-(rsi - 50) / 20)  # center around 50, invert
    return Signal(round(val, 3), 0.4, "RSI")


def _macd_signal(macd: float, signal_line: float, hist: float) -> Signal:
    """MACD: positive histogram = bullish, negative = bearish."""
    if abs(hist) < 0.001:
        return Signal(0.0, 0.3, "MACD")
    direction = 1.0 if hist > 0 else -1.0
    magnitude = min(abs(hist) / max(abs(macd), 0.001), 1.0)
    return Signal(round(_clamp(direction * magnitude), 3), 0.6, "MACD")


def _bollinger_signal(close: float, upper: float, lower: float, mid: float) -> Signal:
    """Bollinger Bands: near lower band = BUY, near upper = SELL."""
    band_width = upper - lower
    if band_width < 0.001:
        return Signal(0.0, 0.2, "Bollinger")
    pos = (close - lower) / band_width  # 0=lower, 0.5=mid, 1=upper
    val = _clamp(-(pos - 0.5) * 2)      # invert: low pos → positive signal
    conf = min(abs(pos - 0.5) * 2, 1.0)
    return Signal(round(val, 3), round(conf, 3), "Bollinger")


def _sma_signal(close: float, sma20: float, sma50: float) -> Signal:
    """Golden cross / death cross: price above SMAs = bullish."""
    if sma20 > sma50:  # Short MA above long MA = bullish
        diff = (close - sma50) / sma50
        return Signal(_clamp(diff * 10), 0.6, "SMA")
    else:
        diff = (sma50 - close) / sma50
        return Signal(_clamp(-diff * 10), 0.6, "SMA")


def get_atr(symbol: str, period: int = 14) -> float | None:
    """Fetch Average True Range (ATR) for position sizing/risk management."""
    try:
        df = get_price_history(symbol, period="3mo", interval="1d")
        if df is None or len(df) < period + 1:
            return None

        import pandas_ta as ta
        atr = ta.atr(df["High"], df["Low"], df["Close"], length=period)
        if atr is not None and not atr.empty:
            return float(atr.iloc[-1])
        return None
    except Exception as e:
        log.error(f"[{symbol}] Error calculating ATR: {e}")
        return None


def compute_technical_signal(symbol: str) -> tuple[float, float]:
    """
    Compute aggregated technical signal for symbol.
    Returns (signal_value, confidence) both in [0, 1] / [-1, +1].
    """
    df = get_price_history(symbol, period="90d", interval="1d")
    if df is None or len(df) < 30:
        log.warning(f"[{symbol}] Insufficient price data for technical analysis.")
        return 0.0, 0.0

    try:
        import pandas_ta as ta  # type: ignore

        close = df["Close"]

        # RSI (14)
        rsi_series = ta.rsi(close, length=14)
        rsi_val = float(rsi_series.iloc[-1]) if rsi_series is not None and not rsi_series.empty else 50.0

        # MACD (12, 26, 9)
        macd_df = ta.macd(close, fast=12, slow=26, signal=9)
        if macd_df is not None and not macd_df.empty:
            macd_val = float(macd_df.iloc[-1, 0])       # MACD line
            macd_sig = float(macd_df.iloc[-1, 1])       # Signal line
            macd_hist = float(macd_df.iloc[-1, 2])      # Histogram
        else:
            macd_val = macd_sig = macd_hist = 0.0

        # Bollinger Bands (20, 2)
        bb_df = ta.bbands(close, length=20, std=2)
        if bb_df is not None and not bb_df.empty:
            bb_lower = float(bb_df.iloc[-1, 0])
            bb_mid   = float(bb_df.iloc[-1, 1])
            bb_upper = float(bb_df.iloc[-1, 2])
        else:
            bb_lower = bb_mid = bb_upper = float(close.iloc[-1])

        # SMA 20, 50
        sma20 = float(ta.sma(close, length=20).iloc[-1])
        sma50 = float(ta.sma(close, length=50).iloc[-1])
        current_close = float(close.iloc[-1])

        # Individual signals
        signals = [
            _rsi_signal(rsi_val),
            _macd_signal(macd_val, macd_sig, macd_hist),
            _bollinger_signal(current_close, bb_upper, bb_lower, bb_mid),
            _sma_signal(current_close, sma20, sma50),
        ]

        # Weighted average by confidence
        total_conf = sum(s.confidence for s in signals)
        if total_conf == 0:
            return 0.0, 0.0

        agg_signal = sum(s.value * s.confidence for s in signals) / total_conf
        agg_conf = total_conf / len(signals)

        log.info(
            f"[{symbol}] Technical → RSI={rsi_val:.1f} MACD_hist={macd_hist:.3f} "
            f"BB_pos={(current_close-bb_lower)/(bb_upper-bb_lower+1e-9):.2f} "
            f"| signal={agg_signal:.3f} conf={agg_conf:.3f}"
        )
        return round(agg_signal, 4), round(min(agg_conf, 1.0), 4)

    except Exception as exc:
        log.error(f"[{symbol}] Technical analysis error: {exc}")
        return 0.0, 0.0
