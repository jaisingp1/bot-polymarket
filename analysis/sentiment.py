"""
analysis/sentiment.py
News sentiment signal from Finnhub, normalized to [-1, +1].
"""
from __future__ import annotations
from data.fetcher import get_news_sentiment
from utils.logger import get_logger

log = get_logger("sentiment")


def compute_sentiment_signal(symbol: str) -> tuple[float, float]:
    """
    Returns (signal, confidence) from Finnhub news sentiment.
    Signal is already in [-1, +1] from the fetcher.
    Confidence is fixed at 0.5 because sentiment is inherently noisy.
    """
    score = get_news_sentiment(symbol)
    if score is None:
        log.warning(f"[{symbol}] No news sentiment data available.")
        return 0.0, 0.0

    # Confidence scales with signal strength (stronger signal → more confident)
    confidence = min(abs(score) * 1.5, 0.8)  # cap at 0.8 — sentiment is noisy

    log.info(f"[{symbol}] Sentiment → score={score:.3f} conf={confidence:.3f}")
    return round(score, 4), round(confidence, 4)
