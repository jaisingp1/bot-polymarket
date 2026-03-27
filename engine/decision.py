"""
engine/decision.py
Decision engine implementing the weighted signal aggregation formula:
    Signal_Final = Σ(Wi × Si × Ci) / Σ(Wi × Ci)

Thresholds (configurable in settings.py):
    Signal_Final >  0.6 with confidence > 0.7 → BUY
    Signal_Final < -0.6 with confidence > 0.7 → SELL
    Otherwise                                  → HOLD
"""
from __future__ import annotations
from dataclasses import dataclass
from config.settings import (
    WEIGHT_TECHNICAL, WEIGHT_RECOMMENDATIONS, WEIGHT_SENTIMENT, WEIGHT_ML,
    BUY_THRESHOLD, SELL_THRESHOLD, CONFIDENCE_THRESHOLD,
)
from analysis.technical import compute_technical_signal
from analysis.recommendations import compute_recommendation_signal
from analysis.sentiment import compute_sentiment_signal
from analysis.ml import predict_signal
from utils.logger import get_logger

log = get_logger("decision")


@dataclass
class DecisionResult:
    symbol: str
    action: str          # "BUY" | "SELL" | "HOLD"
    signal: float        # [-1, +1]
    confidence: float    # [0, 1]
    tech_signal: float
    tech_conf: float
    rec_signal: float
    rec_conf: float
    sent_signal: float
    sent_conf: float
    ml_signal: float     # New ML signal
    ml_conf: float       # New ML confidence
    reason: str


def decide(symbol: str) -> DecisionResult:
    """
    Run the full decision pipeline for a symbol and return a DecisionResult.
    """
    log.info(f"[{symbol}] Starting decision pipeline...")

    # ── Gather signals ────────────────────────────────────────────
    tech_signal, tech_conf     = compute_technical_signal(symbol)
    rec_signal,  rec_conf      = compute_recommendation_signal(symbol)
    sent_signal, sent_conf     = compute_sentiment_signal(symbol)
    ml_signal, ml_conf         = predict_signal(symbol)

    # ── Weighted aggregation ──────────────────────────────────────
    # Using weights imported from settings
    sources = [
        (WEIGHT_TECHNICAL,       tech_signal, tech_conf,  "Technical"),
        (WEIGHT_RECOMMENDATIONS, rec_signal,  rec_conf,   "Recommendations"),
        (WEIGHT_SENTIMENT,       sent_signal, sent_conf,  "Sentiment"),
        (WEIGHT_ML,              ml_signal,   ml_conf,    "MachineLearning"),
    ]

    numerator   = sum(w * s * c for w, s, c, _ in sources)
    denominator = sum(w * c     for w, _, c, _ in sources)

    if denominator == 0:
        log.warning(f"[{symbol}] All signal confidences are 0 → HOLD")
        return DecisionResult(
            symbol=symbol, action="HOLD", signal=0.0, confidence=0.0,
            tech_signal=tech_signal, tech_conf=tech_conf,
            rec_signal=rec_signal, rec_conf=rec_conf,
            sent_signal=sent_signal, sent_conf=sent_conf,
            ml_signal=0.0, ml_conf=0.0,
            reason="No data available from any signal source.",
        )

    final_signal = round(numerator / denominator, 4)
    # Confidence = weighted average of individual confidences
    total_weight = WEIGHT_TECHNICAL + WEIGHT_RECOMMENDATIONS + WEIGHT_SENTIMENT + WEIGHT_ML
    final_conf   = round(
        (WEIGHT_TECHNICAL * tech_conf + WEIGHT_RECOMMENDATIONS * rec_conf + WEIGHT_SENTIMENT * sent_conf + WEIGHT_ML * ml_conf)
        / total_weight, 4
    )

    # ── Decision logic ───────────────────────────────────────────
    if final_signal >= BUY_THRESHOLD and final_conf >= CONFIDENCE_THRESHOLD:
        action = "BUY"
        reason = (
            f"Signal {final_signal:.3f} ≥ {BUY_THRESHOLD} "
            f"with confidence {final_conf:.3f} ≥ {CONFIDENCE_THRESHOLD}"
        )
    elif final_signal <= SELL_THRESHOLD and final_conf >= CONFIDENCE_THRESHOLD:
        action = "SELL"
        reason = (
            f"Signal {final_signal:.3f} ≤ {SELL_THRESHOLD} "
            f"with confidence {final_conf:.3f} ≥ {CONFIDENCE_THRESHOLD}"
        )
    else:
        action = "HOLD"
        if final_conf < CONFIDENCE_THRESHOLD:
            reason = f"Confidence {final_conf:.3f} below threshold {CONFIDENCE_THRESHOLD}"
        else:
            reason = f"Signal {final_signal:.3f} in neutral zone ({SELL_THRESHOLD}, {BUY_THRESHOLD})"

    log.info(
        f"[{symbol}] Decision: {action} | "
        f"signal={final_signal:.4f} conf={final_conf:.4f} | {reason}"
    )

    return DecisionResult(
        symbol=symbol, action=action,
        signal=final_signal, confidence=final_conf,
        tech_signal=tech_signal, tech_conf=tech_conf,
        rec_signal=rec_signal, rec_conf=rec_conf,
        sent_signal=sent_signal, sent_conf=sent_conf,
        ml_signal=ml_signal, ml_conf=ml_conf,
        reason=reason,
    )
