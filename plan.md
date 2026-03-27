# Plan de Mejoras del Bot de Trading "Antigravity AI"

Este documento detalla el plan paso a paso para mejorar la inteligencia del bot y corregir problemas de ejecución fuera de horario de mercado (evitando gasto innecesario de tokens de API).

## 1. Filtrado Inteligente de Horarios (NYC / NYSE)
El bot actual (`main.py` y `web/app.py` scheduler) se ejecuta sin validar si el mercado (Bolsa de Nueva York) está abierto o si es un día feriado, lo que consume llamadas a APIs limitadas (como Finnhub o Alpha Vantage) en vano.

**Acciones:**
- Integrar la librería `pandas_market_calendars` (o usar la API de Alpaca `get_clock()`) para saber con precisión si hoy es un día de operaciones válido en NYSE/NASDAQ.
- Añadir un control temprano (`early exit`) en las funciones de ejecución programada (`run_scheduled_job` y `run_scheduled`). Si el mercado está cerrado, el bot no realizará ninguna solicitud a las APIs de terceros.

## 2. Inyección de Inteligencia: Machine Learning (ML)
El bot actualmente usa pesos estáticos (40% Técnico, 35% Analistas, 25% Sentimiento). Vamos a añadir un modelo de Machine Learning (por ejemplo, Random Forest o Gradient Boosting básico usando `scikit-learn`) que actúe como una cuarta señal o un ponderador dinámico.

**Acciones:**
- Crear el módulo `analysis/ml.py` que:
  1. Descargue el historial reciente del activo (ej. últimos 2-5 años usando `yfinance`).
  2. Calcule *features* técnicos (RSI, MACD, Medias Móviles, Volatilidad ATR).
  3. Etiquete los datos (ej. `1` si el precio subió al día siguiente, `0` si bajó).
  4. Entrene un modelo `RandomForestClassifier` ligero y devuelva una probabilidad de subida (alcista).
- Integrar la señal de ML en `engine/decision.py`, re-distribuyendo los pesos:
  - Técnico Tradicional: 25%
  - Analistas: 25%
  - Sentimiento: 20%
  - **Predicción ML: 30%**

## 3. Gestión de Riesgos Avanzada (Risk Management)
El tamaño de la posición es actualmente un % estático del portafolio (`MAX_POSITION_SIZE = 0.05`).

**Acciones:**
- Implementar "Position Sizing" basado en volatilidad (ATR - Average True Range). Un activo muy volátil (ej. TSLA) tendrá un tamaño de posición menor en dólares que un activo poco volátil (ej. JNJ) para igualar el riesgo asumido (ej. arriesgar solo el 1% o 2% de la cuenta por *trade*).
- Modificar `engine/risk.py` para calcular este tamaño dinámico, solicitando el ATR a `analysis/technical.py`.
- En `execution/broker.py`, intentar usar órdenes de tipo `bracket` en Alpaca, añadiendo automáticamente un *Take Profit* y un *Stop Loss* basados en el ATR. (Ej. Take Profit = Precio + 2 * ATR; Stop Loss = Precio - 1 * ATR).

## 4. UI y Monitoreo (Opcional pero recomendado)
- Modificar el frontend (`web/templates/index.html` y `web/app.py`) para mostrar la confianza del modelo ML y el tamaño dinámico de la posición.
- Añadir `scikit-learn` y dependencias relevantes a `requirements.txt`.

## 5. Implementación Paso a Paso

1.  **Paso 1:** Añadir el doc `plan.md` y actualizar `requirements.txt`.
2.  **Paso 2:** Solucionar el horario de mercado en `main.py`, `app.py` y `engine/risk.py`. Usar la API del reloj de Alpaca o `pandas_market_calendars`.
3.  **Paso 3:** Desarrollar `analysis/ml.py` (Modelo predictivo con histórico).
4.  **Paso 4:** Actualizar `engine/decision.py` para usar la señal del ML.
5.  **Paso 5:** Desarrollar Risk Management basado en ATR en `analysis/technical.py` y `engine/risk.py`.
6.  **Paso 6:** Pruebas y validación.
