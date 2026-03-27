# Guía Paso a Paso: Cómo poner en marcha tu Bot de Trading

Esta guía te explica cómo configurar las "Keys" (llaves/contraseñas de las APIs) y ejecutar el bot en tu computadora.

---

## 1. ¿Qué son las "Keys"?
Las Keys son como nombres de usuario y contraseñas largas que permiten que el bot hable con los servicios de datos financieros y con el broker para realizar operaciones. **Son secretas y no debes compartirlas con nadie.**

## 2. Dónde obtener tus Keys (Paso a Paso)

### A. Alpaca (El Broker para operar)
*Es fundamental para que el bot pueda simular o realizar compras y ventas.*
1. Ve a [Alpaca Markets](https://app.alpaca.markets/signup) y crea una cuenta.
2. Una vez dentro, asegúrate de estar en el modo **"Paper Trading"** (es dinero ficticio, para pruebas).
3. En el panel lateral, busca **"API Keys"**.
4. Haz clic en **"Generate New Key"**.
5. Copia la **API Key ID** y el **Secret Key**.

### B. Alpha Vantage (Para indicadores técnicos)
1. Ve a [Alpha Vantage Claim Key](https://www.alphavantage.co/support/#api-key).
2. Rellena el formulario (puedes decir que eres estudiante/desarrollador).
3. Te darán una clave gratuita al instante.

### C. Finnhub (Para recomendaciones y noticias)
1. Ve a [Finnhub.io Register](https://finnhub.io/register).
2. Crea tu cuenta gratuita.
3. Al entrar, verás tu **API Key** en el "Dashboard".

---

## 3. Configuración del archivo `.env`

He creado un archivo llamado `.env` en la carpeta `bot-polymarket`. Debes abrirlo con un editor de texto (como Notepad o VS Code) y reemplazar el texto de ejemplo con tus llaves reales:

```env
ALPHA_VANTAGE_API_KEY=tu_clave_aqui
FINNHUB_API_KEY=tu_clave_aqui
ALPACA_API_KEY=tu_clave_id_de_alpaca
ALPACA_SECRET_KEY=tu_clave_secreta_de_alpaca
```

---

## 4. Cómo ejecutar el Bot

Abre una terminal (PowerShell o CMD) en la carpeta del proyecto y sigue estos comandos:

### Paso 1: Instala lo necesario (si no lo has hecho)
```bash
pip install -r requirements.txt
```

### Paso 2: Prueba que todo funcione (Dry Run)
Este comando simula todo pero **NO** envía órdenes reales ni al Paper Trading:
```bash
python main.py --dry-run --symbol AAPL
```

### Paso 3: Ejecutar en modo automático (Schedule)
Si quieres que el bot se quede encendido y opere automáticamente todos los días a las 9:35 AM ET:
```bash
python main.py --schedule
```

### Paso 4: Ver el historial de lo que ha hecho el bot
```bash
python main.py --history
```

---

## 📄 Notas Importantes
* **Horario:** El mercado de EE.UU. abre a las 9:30 AM hora de Nueva York. El bot está programado para correr a las 9:35 AM.
* **Capital Local:** Por ahora el bot corre en tu compu, por lo que debe estar encendida para que el "Schedule" funcione.
