"""
analysis/ml.py
Machine Learning model for price prediction based on technical features.
"""
from __future__ import annotations
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from data.fetcher import get_price_history
from utils.logger import get_logger
import os
import joblib

log = get_logger("ml")

MODEL_PATH = "data_store/rf_model.joblib"

def calculate_features(df: pd.DataFrame) -> pd.DataFrame:
    """Calculate technical features for the ML model."""
    import pandas_ta as ta

    df = df.copy()

    # Feature 1: RSI
    df['rsi'] = ta.rsi(df['Close'], length=14)

    # Feature 2: MACD Histogram
    macd = ta.macd(df['Close'], fast=12, slow=26, signal=9)
    if macd is not None:
        # MACD_12_26_9, MACDh_12_26_9, MACDs_12_26_9
        col = [c for c in macd.columns if 'MACDh' in c]
        if col:
            df['macd_hist'] = macd[col[0]]

    # Feature 3: Bollinger Bands Position
    bbands = ta.bbands(df['Close'], length=20, std=2)
    if bbands is not None:
        lower_col = [c for c in bbands.columns if 'BBL' in c][0]
        upper_col = [c for c in bbands.columns if 'BBU' in c][0]

        band_width = bbands[upper_col] - bbands[lower_col]
        # Avoid division by zero
        band_width = band_width.replace(0, 1e-9)

        df['bb_pos'] = (df['Close'] - bbands[lower_col]) / band_width

    # Feature 4: SMA Distance
    df['sma20'] = ta.sma(df['Close'], length=20)
    df['sma50'] = ta.sma(df['Close'], length=50)
    df['sma_dist'] = (df['sma20'] - df['sma50']) / df['sma50']

    # Feature 5: Volatility (ATR)
    df['atr'] = ta.atr(df['High'], df['Low'], df['Close'], length=14)
    df['atr_pct'] = df['atr'] / df['Close']

    # Daily Returns
    df['return_1d'] = df['Close'].pct_change()

    # Target: 1 if next day closes higher, 0 otherwise
    df['target'] = (df['Close'].shift(-1) > df['Close']).astype(int)

    # Drop rows with NaN (due to indicators lookback and shift)
    df.dropna(inplace=True)

    return df

def train_model(symbol: str = "SPY", period: str = "5y") -> bool:
    """Train a simple Random Forest model."""
    log.info(f"Training ML model using {symbol} data over {period}...")
    df = get_price_history(symbol, period=period)
    if df is None or len(df) < 100:
        log.error("Insufficient data to train ML model.")
        return False

    df = calculate_features(df)

    features = ['rsi', 'macd_hist', 'bb_pos', 'sma_dist', 'atr_pct', 'return_1d']

    # Check if we have all features
    missing = [f for f in features if f not in df.columns]
    if missing:
        log.error(f"Missing features for ML: {missing}")
        return False

    X = df[features]
    y = df['target']

    # Basic Train/Test split (e.g., last 20% is test)
    split_idx = int(len(X) * 0.8)
    X_train, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
    y_train, y_test = y.iloc[:split_idx], y.iloc[split_idx:]

    model = RandomForestClassifier(n_estimators=100, max_depth=5, random_state=42)
    model.fit(X_train, y_train)

    accuracy = model.score(X_test, y_test)
    log.info(f"Model trained successfully. Test Accuracy: {accuracy:.4f}")

    # Ensure directory exists
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    return True

def predict_signal(symbol: str) -> tuple[float, float]:
    """
    Use ML model to predict signal for the symbol.
    Returns (signal_value, confidence) where signal is [-1, 1].
    """
    if not os.path.exists(MODEL_PATH):
        log.info("ML model not found. Training a generic model on SPY...")
        success = train_model("SPY")
        if not success:
            return 0.0, 0.0

    try:
        model = joblib.load(MODEL_PATH)
        df = get_price_history(symbol, period="1y")

        if df is None or len(df) < 60:
            return 0.0, 0.0

        df = calculate_features(df)

        if df.empty:
            return 0.0, 0.0

        features = ['rsi', 'macd_hist', 'bb_pos', 'sma_dist', 'atr_pct', 'return_1d']
        X = df[features].iloc[[-1]] # Take the last row

        # predict_proba returns [[prob_0, prob_1]]
        prob_up = model.predict_proba(X)[0][1]

        # Convert prob [0, 1] to signal [-1, 1]
        signal = (prob_up * 2) - 1.0

        # Confidence is how far the probability is from 0.5
        confidence = abs(prob_up - 0.5) * 2.0

        log.info(f"[{symbol}] ML Prediction → Prob Up: {prob_up:.3f} | Signal: {signal:.3f} | Conf: {confidence:.3f}")
        return round(signal, 4), round(confidence, 4)

    except Exception as e:
        log.error(f"[{symbol}] ML prediction error: {e}")
        return 0.0, 0.0
