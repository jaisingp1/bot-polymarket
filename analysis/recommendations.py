"""
analysis/recommendations.py
Analyst recommendation consensus from Finnhub, normalized to [-1, +1].
"""
from __future__ import annotations
from data.fetcher import get_analyst_recommendations
from utils.logger import get_logger

log = get_logger("recommendations")


def compute_recommendation_signal(symbol: str) -> tuple[float, float]:
    """
    Compute a normalized signal from analyst consensus.
    Returns (signal, confidence) where signal ∈ [-1, +1].

    Scoring:
        strongBuy  → +1.0
        buy        → +0.5
        hold       →  0.0
        sell       → -0.5
        strongSell → -1.0

    Confidence increases with total analyst count.
    """
    rec = get_analyst_recommendations(symbol)
    if rec is None:
        log.warning(f"[{symbol}] No analyst recommendations available.")
        return 0.0, 0.0

    strong_buy  = rec.get("strongBuy", 0)
    buy         = rec.get("buy", 0)
    hold        = rec.get("hold", 0)
    sell        = rec.get("sell", 0)
    strong_sell = rec.get("strongSell", 0)

    total = strong_buy + buy + hold + sell + strong_sell
    if total == 0:
        return 0.0, 0.0

    weighted_sum = (
        strong_buy  * 1.0
        + buy       * 0.5
        + hold      * 0.0
        + sell      * -0.5
        + strong_sell * -1.0
    )

    signal = weighted_sum / total  # Normalized [-1, +1]

    # Confidence: more analysts → higher confidence (caps at 1.0 with 20+ analysts)
    confidence = min(total / 20, 1.0)

    log.info(
        f"[{symbol}] Recommendations → strongBuy={strong_buy} buy={buy} "
        f"hold={hold} sell={sell} strongSell={strong_sell} "
        f"| signal={signal:.3f} conf={confidence:.3f}"
    )
    return round(signal, 4), round(confidence, 4)
