const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
    Header, Footer, AlignmentType, LevelFormat, HeadingLevel, BorderStyle,
    WidthType, ShadingType, VerticalAlign, PageNumber, PageBreak } = require('docx');
const fs = require('fs');

// Colors - Midnight Code palette (tech-focused)
const colors = {
    primary: "020617",      // Midnight Black - Titles
    body: "1E293B",         // Deep Slate Blue - Body
    secondary: "64748B",    // Cool Blue-Gray - Subtitles
    accent: "94A3B8",       // Steady Silver - Accent
    tableBg: "F8FAFC",      // Glacial Blue-White - Table background
    tableHeader: "E2E8F0"   // Lighter shade for headers
};

// Table borders
const tableBorder = { style: BorderStyle.SINGLE, size: 1, color: colors.accent };
const cellBorders = { top: tableBorder, bottom: tableBorder, left: tableBorder, right: tableBorder };

// Create document
const doc = new Document({
    styles: {
        default: { document: { run: { font: "Times New Roman", size: 24 } } },
        paragraphStyles: [
            {
                id: "Title", name: "Title", basedOn: "Normal",
                run: { size: 56, bold: true, color: colors.primary, font: "Times New Roman" },
                paragraph: { spacing: { before: 240, after: 120 }, alignment: AlignmentType.CENTER }
            },
            {
                id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
                run: { size: 32, bold: true, color: colors.primary, font: "Times New Roman" },
                paragraph: { spacing: { before: 400, after: 200 }, outlineLevel: 0 }
            },
            {
                id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
                run: { size: 28, bold: true, color: colors.secondary, font: "Times New Roman" },
                paragraph: { spacing: { before: 300, after: 150 }, outlineLevel: 1 }
            },
            {
                id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
                run: { size: 24, bold: true, color: colors.body, font: "Times New Roman" },
                paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 2 }
            }
        ]
    },
    numbering: {
        config: [
            {
                reference: "bullet-list",
                levels: [{
                    level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
                    style: { paragraph: { indent: { left: 720, hanging: 360 } } }
                }]
            },
            {
                reference: "numbered-list-1",
                levels: [{
                    level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
                    style: { paragraph: { indent: { left: 720, hanging: 360 } } }
                }]
            },
            {
                reference: "numbered-list-2",
                levels: [{
                    level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
                    style: { paragraph: { indent: { left: 720, hanging: 360 } } }
                }]
            },
            {
                reference: "numbered-list-3",
                levels: [{
                    level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
                    style: { paragraph: { indent: { left: 720, hanging: 360 } } }
                }]
            },
            {
                reference: "numbered-list-4",
                levels: [{
                    level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
                    style: { paragraph: { indent: { left: 720, hanging: 360 } } }
                }]
            }
        ]
    },
    sections: [
        // Cover Page Section
        {
            properties: {
                page: { margin: { top: 0, right: 0, bottom: 0, left: 0 } }
            },
            children: [
                new Paragraph({ spacing: { before: 3000 }, children: [] }),
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 400 },
                    children: [new TextRun({ text: "ESPECIFICACIONES TÉCNICAS", size: 48, bold: true, color: colors.secondary, font: "Times New Roman" })]
                }),
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 200 },
                    children: [new TextRun({ text: "BOT DE TRADING PARA POLYMARKET", size: 72, bold: true, color: colors.primary, font: "Times New Roman" })]
                }),
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 600 },
                    children: [new TextRun({ text: "Sistema Automatizado de Decisiones Financieras", size: 28, color: colors.secondary, font: "Times New Roman" })]
                }),
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 1500, after: 200 },
                    children: [new TextRun({ text: "Desarrollado en Python", size: 32, bold: true, color: colors.body, font: "Times New Roman" })]
                }),
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: "Arquitectura de APIs Gratuitas y de Bajo Costo", size: 24, color: colors.secondary, font: "Times New Roman" })]
                }),
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 2000 },
                    children: [new TextRun({ text: "Fecha: Marzo 2026", size: 22, color: colors.accent, font: "Times New Roman" })]
                })
            ]
        },
        // Main Content Section
        {
            properties: {
                page: { margin: { top: 1800, right: 1440, bottom: 1440, left: 1440 } }
            },
            headers: {
                default: new Header({
                    children: [new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [new TextRun({ text: "Bot de Trading Polymarket - Especificaciones Técnicas", size: 18, color: colors.accent, font: "Times New Roman" })]
                    })]
                })
            },
            footers: {
                default: new Footer({
                    children: [new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: "Página ", size: 18, font: "Times New Roman" }), new TextRun({ children: [PageNumber.CURRENT], size: 18, font: "Times New Roman" }), new TextRun({ text: " de ", size: 18, font: "Times New Roman" }), new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18, font: "Times New Roman" })]
                    })]
                })
            },
            children: [
                // Section 1: Introduction
                new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("1. Introducción y Objetivos")] }),
                new Paragraph({
                    spacing: { after: 200 },
                    children: [new TextRun({ text: "Este documento presenta las especificaciones técnicas completas para el desarrollo de un bot de trading automatizado orientado a mercados financieros estadounidenses. El sistema está diseñado para operar en el entorno de Polymarket, una plataforma de predicción descentralizada que permite a los usuarios apostar en resultados de eventos del mundo real. La arquitectura propuesta utiliza exclusivamente Python como lenguaje de programación principal, aprovechando su extenso ecosistema de bibliotecas financieras y su facilidad para el prototipado rápido de algoritmos de trading.", color: colors.body, font: "Times New Roman" })]
                }),
                new Paragraph({
                    spacing: { after: 200 },
                    children: [new TextRun({ text: "El objetivo principal del bot es ejecutar una única operación diaria (compra o venta) basada en análisis de datos de mercado obtenidos a través de APIs gratuitas o de muy bajo costo. El sistema implementa un motor de decisiones que evalúa múltiples indicadores técnicos y recomendaciones de terceros para determinar la acción óptima: comprar, vender o mantener posición (hold). Esta limitación de una operación diaria reduce significativamente los riesgos asociados al overtrading y minimiza los costos de transacción, al tiempo que permite capturar movimientos significativos del mercado.", color: colors.body, font: "Times New Roman" })]
                }),
                new Paragraph({
                    spacing: { after: 200 },
                    children: [new TextRun({ text: "Los mercados objetivo incluyen acciones de la bolsa estadounidense (NYSE, NASDAQ), pares de divisas Forex (EUR/USD, GBP/USD, USD/JPY), y contratos de opciones sobre índices y acciones individuales. El sistema incorpora mecanismos de gestión de riesgo, registro de operaciones (logging), y notificaciones en tiempo real para mantener al usuario informado sobre las decisiones del bot sin requerir supervisión constante.", color: colors.body, font: "Times New Roman" })]
                }),

                // Section 2: System Architecture
                new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("2. Arquitectura del Sistema")] }),
                new Paragraph({
                    spacing: { after: 200 },
                    children: [new TextRun({ text: "La arquitectura del bot sigue un patrón modular de microservicios que separa claramente las responsabilidades de cada componente. Esta separación permite actualizaciones independientes, testing aislado, y facilita la sustitución de proveedores de datos sin afectar la lógica central de negociación. El diseño contempla cuatro capas principales: adquisición de datos, procesamiento y análisis, motor de decisiones, y ejecución de operaciones.", color: colors.body, font: "Times New Roman" })]
                }),
                new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("2.1 Diagrama de Componentes")] }),
                new Paragraph({
                    spacing: { after: 200 },
                    children: [new TextRun({ text: "El flujo de datos inicia con el módulo de adquisición, que se conecta a múltiples APIs externas para obtener cotizaciones en tiempo real, datos históricos, indicadores técnicos precalculados, y recomendaciones de analistas. Esta información se normaliza y almacena en una base de datos SQLite local para análisis posterior y auditoría. El motor de procesamiento aplica filtros de calidad de datos y calcula indicadores técnicos adicionales si es necesario.", color: colors.body, font: "Times New Roman" })]
                }),
                new Paragraph({
                    spacing: { after: 200 },
                    children: [new TextRun({ text: "El motor de decisiones implementa una estrategia híbrida que combina análisis técnico cuantitativo con señales de sentimiento de mercado obtenidas de APIs de recomendaciones. Cada señal se pondera según su historial de precisión y se agregan para producir una señal final con nivel de confianza. Si la confianza supera umbrales predefinidos, se genera una orden que el módulo de ejecución envía a la API del broker. Todo el proceso se registra con timestamps y metadatos para análisis de rendimiento.", color: colors.body, font: "Times New Roman" })]
                }),

                // Architecture Table
                new Table({
                    columnWidths: [2500, 6860],
                    margins: { top: 100, bottom: 100, left: 180, right: 180 },
                    rows: [
                        new TableRow({
                            tableHeader: true,
                            children: [
                                new TableCell({
                                    borders: cellBorders,
                                    shading: { fill: colors.tableHeader, type: ShadingType.CLEAR },
                                    verticalAlign: VerticalAlign.CENTER,
                                    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Componente", bold: true, size: 22, font: "Times New Roman" })] })]
                                }),
                                new TableCell({
                                    borders: cellBorders,
                                    shading: { fill: colors.tableHeader, type: ShadingType.CLEAR },
                                    verticalAlign: VerticalAlign.CENTER,
                                    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Responsabilidad Principal", bold: true, size: 22, font: "Times New Roman" })] })]
                                })
                            ]
                        }),
                        new TableRow({
                            children: [
                                new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Data Fetcher", bold: true, font: "Times New Roman" })] })] }),
                                new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Conexión a APIs externas, normalización de datos, cache local", font: "Times New Roman" })] })] })
                            ]
                        }),
                        new TableRow({
                            children: [
                                new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Technical Analyzer", bold: true, font: "Times New Roman" })] })] }),
                                new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Cálculo de indicadores técnicos (RSI, MACD, SMA, Bollinger)", font: "Times New Roman" })] })] })
                            ]
                        }),
                        new TableRow({
                            children: [
                                new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Signal Aggregator", bold: true, font: "Times New Roman" })] })] }),
                                new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Consolida señales de múltiples fuentes con ponderación", font: "Times New Roman" })] })] })
                            ]
                        }),
                        new TableRow({
                            children: [
                                new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Decision Engine", bold: true, font: "Times New Roman" })] })] }),
                                new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Evalúa condiciones y genera decisión final (BUY/SELL/HOLD)", font: "Times New Roman" })] })] })
                            ]
                        }),
                        new TableRow({
                            children: [
                                new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Order Executor", bold: true, font: "Times New Roman" })] })] }),
                                new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Envía órdenes a broker API, confirma ejecución", font: "Times New Roman" })] })] })
                            ]
                        }),
                        new TableRow({
                            children: [
                                new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Logger & Monitor", bold: true, font: "Times New Roman" })] })] }),
                                new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Registro de operaciones, alertas, métricas de rendimiento", font: "Times New Roman" })] })] })
                            ]
                        })
                    ]
                }),
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 100, after: 300 },
                    children: [new TextRun({ text: "Tabla 1: Componentes principales del sistema de trading", size: 20, italics: true, color: colors.secondary, font: "Times New Roman" })]
                }),

                // Section 3: Financial APIs
                new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("3. APIs de Datos Financieros (Gratuitas/Bajo Costo)")] }),
                new Paragraph({
                    spacing: { after: 200 },
                    children: [new TextRun({ text: "La selección de APIs de datos financieros constituye el componente crítico del sistema, ya que la calidad y frescura de los datos determinan directamente la efectividad de las decisiones de trading. Se han identificado múltiples proveedores que ofrecen planes gratuitos generosos o costos extremadamente bajos, permitiendo operar el bot sin inversiones significativas en infraestructura de datos. A continuación se detallan las opciones más viables.", color: colors.body, font: "Times New Roman" })]
                }),

                new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("3.1 Alpha Vantage (Recomendado Principal)")] }),
                new Paragraph({
                    spacing: { after: 200 },
                    children: [new TextRun({ text: "Alpha Vantage ofrece una de las APIs más completas disponibles gratuitamente para desarrolladores individuales. El plan gratuito permite hasta 25 solicitudes por día y 500 solicitudes por mes, lo cual es suficiente para un bot que ejecuta una operación diaria. La API proporciona datos de acciones, Forex, criptomonedas, indicadores técnicos precalculados, y datos fundamentales. Los datos se entregan en formato JSON o CSV con timestamps precisos y cobertura de mercados globales.", color: colors.body, font: "Times New Roman" })]
                }),
                new Paragraph({
                    numbering: { reference: "bullet-list", level: 0 },
                    children: [new TextRun({ text: "Endpoint de acciones: TIME_SERIES_DAILY, TIME_SERIES_INTRADAY", font: "Times New Roman" })]
                }),
                new Paragraph({
                    numbering: { reference: "bullet-list", level: 0 },
                    children: [new TextRun({ text: "Endpoint de Forex: CURRENCY_EXCHANGE_RATE, FX_INTRADAY", font: "Times New Roman" })]
                }),
                new Paragraph({
                    numbering: { reference: "bullet-list", level: 0 },
                    children: [new TextRun({ text: "Indicadores técnicos: RSI, MACD, SMA, EMA, Bollinger Bands", font: "Times New Roman" })]
                }),
                new Paragraph({
                    numbering: { reference: "bullet-list", level: 0 },
                    spacing: { after: 200 },
                    children: [new TextRun({ text: "Costo: Gratuito (25 req/día) o $49.99/mes (600 req/día)", font: "Times New Roman" })]
                }),

                new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("3.2 Yahoo Finance (yfinance)")] }),
                new Paragraph({
                    spacing: { after: 200 },
                    children: [new TextRun({ text: "La biblioteca yfinance de Python proporciona acceso no oficial pero muy confiable a los datos de Yahoo Finance, uno de los repositorios de datos financieros más completos del mundo. A diferencia de las APIs REST tradicionales, yfinance opera como una biblioteca Python que extrae datos directamente del sitio web de Yahoo Finance, evitando limitaciones de rate limiting de la API oficial (que fue descontinuada). Esta solución es completamente gratuita y no requiere registro de API key.", color: colors.body, font: "Times New Roman" })]
                }),
                new Paragraph({
                    spacing: { after: 200 },
                    children: [new TextRun({ text: "La biblioteca ofrece acceso a datos históricos de precios, dividendos, splits, información fundamental (P/E, market cap, earnings), y datos de opciones con caducidad y strikes. Aunque no tiene un endpoint dedicado para Forex, se pueden obtener datos de divisas a través de tickers específicos como EURUSD=X. La principal limitación es la ausencia de soporte oficial, aunque la comunidad de desarrolladores mantiene activamente el proyecto.", color: colors.body, font: "Times New Roman" })]
                }),

                new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("3.3 Finnhub")] }),
                new Paragraph({
                    spacing: { after: 200 },
                    children: [new TextRun({ text: "Finnhub.io ofrece una API moderna con plan gratuito que incluye 60 llamadas por minuto para datos de mercado estadounidenses. Destaca por su endpoint de recomendaciones de analistas que proporciona consenso de compra/venta de instituciones financieras profesionales. También ofrece sentimiento de noticias, earnings surprises, y datos fundamentales. El plan gratuito es generoso para uso individual, y los planes pagos comienzan en $9.99/mes.", color: colors.body, font: "Times New Roman" })]
                }),

                new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("3.4 Twelve Data")] }),
                new Paragraph({
                    spacing: { after: 200 },
                    children: [new TextRun({ text: "Twelve Data proporciona una API REST con plan gratuito de 800 llamadas diarias y 8 créditos por minuto. Ofrece datos de acciones, Forex, ETFs, índices, y criptomonedas con cobertura de más de 60 exchanges globales. Su punto fuerte es la consistencia de datos y la disponibilidad de WebSocket para datos en tiempo real en planes pagos. La API incluye endpoints para indicadores técnicos calculados del lado del servidor, reduciendo la carga computacional del bot.", color: colors.body, font: "Times New Roman" })]
                }),

                // API Comparison Table
                new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("3.5 Comparativa de APIs")] }),
                new Table({
                    columnWidths: [2000, 2200, 2200, 2960],
                    margins: { top: 100, bottom: 100, left: 180, right: 180 },
                    rows: [
                        new TableRow({
                            tableHeader: true,
                            children: [
                                new TableCell({ borders: cellBorders, shading: { fill: colors.tableHeader, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "API", bold: true, size: 20, font: "Times New Roman" })] })] }),
                                new TableCell({ borders: cellBorders, shading: { fill: colors.tableHeader, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Límite Gratuito", bold: true, size: 20, font: "Times New Roman" })] })] }),
                                new TableCell({ borders: cellBorders, shading: { fill: colors.tableHeader, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Plan Básico", bold: true, size: 20, font: "Times New Roman" })] })] }),
                                new TableCell({ borders: cellBorders, shading: { fill: colors.tableHeader, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Características Clave", bold: true, size: 20, font: "Times New Roman" })] })] })
                            ]
                        }),
                        new TableRow({
                            children: [
                                new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Alpha Vantage", size: 20, font: "Times New Roman" })] })] }),
                                new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "25 req/día", size: 20, font: "Times New Roman" })] })] }),
                                new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "$49.99/mes", size: 20, font: "Times New Roman" })] })] }),
                                new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Indicadores técnicos, Forex", size: 20, font: "Times New Roman" })] })] })
                            ]
                        }),
                        new TableRow({
                            children: [
                                new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Yahoo Finance", size: 20, font: "Times New Roman" })] })] }),
                                new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Ilimitado*", size: 20, font: "Times New Roman" })] })] }),
                                new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Gratuito", size: 20, font: "Times New Roman" })] })] }),
                                new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Datos fundamentales, Opciones", size: 20, font: "Times New Roman" })] })] })
                            ]
                        }),
                        new TableRow({
                            children: [
                                new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Finnhub", size: 20, font: "Times New Roman" })] })] }),
                                new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "60 req/min", size: 20, font: "Times New Roman" })] })] }),
                                new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "$9.99/mes", size: 20, font: "Times New Roman" })] })] }),
                                new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Recomendaciones, Sentimiento", size: 20, font: "Times New Roman" })] })] })
                            ]
                        }),
                        new TableRow({
                            children: [
                                new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Twelve Data", size: 20, font: "Times New Roman" })] })] }),
                                new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "800 req/día", size: 20, font: "Times New Roman" })] })] }),
                                new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "$19/mes", size: 20, font: "Times New Roman" })] })] }),
                                new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "WebSocket, 60+ exchanges", size: 20, font: "Times New Roman" })] })] })
                            ]
                        }),
                        new TableRow({
                            children: [
                                new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Polygon.io", size: 20, font: "Times New Roman" })] })] }),
                                new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "5 req/min", size: 20, font: "Times New Roman" })] })] }),
                                new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "$199/mes", size: 20, font: "Times New Roman" })] })] }),
                                new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Datos en tiempo real, Opciones", size: 20, font: "Times New Roman" })] })] })
                            ]
                        })
                    ]
                }),
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 100, after: 300 },
                    children: [new TextRun({ text: "Tabla 2: Comparativa de APIs de datos financieros (*sujeto a cambios sin aviso)", size: 20, italics: true, color: colors.secondary, font: "Times New Roman" })]
                }),

                // Section 4: Broker APIs
                new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("4. APIs de Brokers para Ejecución")] }),
                new Paragraph({
                    spacing: { after: 200 },
                    children: [new TextRun({ text: "Para la ejecución real de operaciones, es necesario integrar el bot con una API de broker que permita trading programático. Las opciones seleccionadas ofrecen SDKs de Python maduros, documentación extensa, y costos de transacción competitivos. La elección del broker depende del tipo de instrumento a negociar: acciones, Forex, u opciones. Algunos brokers como Interactive Brokers soportan múltiples clases de activos.", color: colors.body, font: "Times New Roman" })]
                }),

                new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("4.1 Alpaca (Recomendado para Acciones)")] }),
                new Paragraph({
                    spacing: { after: 200 },
                    children: [new TextRun({ text: "Alpaca es un broker-dealer regulado por FINRA y SEC que ofrece trading de acciones y ETFs con cero comisiones. Su API REST y streaming son particularmente amigables para desarrolladores, con un SDK de Python oficial bien mantenido. El plan de paper trading es completamente gratuito e ilimitado, ideal para desarrollo y testing. Para trading real, no hay comisiones por operación ni mínimos de cuenta.", color: colors.body, font: "Times New Roman" })]
                }),
                new Paragraph({
                    numbering: { reference: "bullet-list", level: 0 },
                    children: [new TextRun({ text: "Comisiones: $0 por operación en acciones y ETFs estadounidenses", font: "Times New Roman" })]
                }),
                new Paragraph({
                    numbering: { reference: "bullet-list", level: 0 },
                    children: [new TextRun({ text: "Mínimo de cuenta: $0 para paper trading, sin mínimo obligatorio para live", font: "Times New Roman" })]
                }),
                new Paragraph({
                    numbering: { reference: "bullet-list", level: 0 },
                    children: [new TextRun({ text: "SDK: alpaca-trade-api (pip install alpaca-trade-api)", font: "Times New Roman" })]
                }),
                new Paragraph({
                    numbering: { reference: "bullet-list", level: 0 },
                    spacing: { after: 200 },
                    children: [new TextRun({ text: "Características: Trading fraccionario, datos de mercado en tiempo real, webhooks", font: "Times New Roman" })]
                }),

                new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("4.2 Interactive Brokers (Multi-Asset)")] }),
                new Paragraph({
                    spacing: { after: 200 },
                    children: [new TextRun({ text: "Interactive Brokers (IBKR) es uno de los brokers más establecidos para trading algorítmico, ofreciendo acceso a más de 135 mercados en 33 países. Soporta acciones, opciones, futuros, Forex, bonos, y fondos. Su API nativa (TWS API) es compleja pero extremadamente potente. Para Python, la biblioteca ib_insync proporciona una interfaz más amigable con soporte async/await nativo.", color: colors.body, font: "Times New Roman" })]
                }),
                new Paragraph({
                    numbering: { reference: "bullet-list", level: 0 },
                    children: [new TextRun({ text: "Comisiones: Desde $0.005/acción (mínimo $1) para acciones de EE.UU.", font: "Times New Roman" })]
                }),
                new Paragraph({
                    numbering: { reference: "bullet-list", level: 0 },
                    children: [new TextRun({ text: "Opciones: $0.15-$0.65 por contrato según volumen", font: "Times New Roman" })]
                }),
                new Paragraph({
                    numbering: { reference: "bullet-list", level: 0 },
                    children: [new TextRun({ text: "Forex: Spreads competitivos, sin comisiones adicionales", font: "Times New Roman" })]
                }),
                new Paragraph({
                    numbering: { reference: "bullet-list", level: 0 },
                    spacing: { after: 200 },
                    children: [new TextRun({ text: "SDK: ibapi (oficial) o ib_insync (recomendado)", font: "Times New Roman" })]
                }),

                new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("4.3 OANDA (Recomendado para Forex)")] }),
                new Paragraph({
                    spacing: { after: 200 },
                    children: [new TextRun({ text: "OANDA es un broker especializado en Forex y CFDs con presencia global y regulación en múltiples jurisdicciones. Su API REST (v20) es utilizada ampliamente por traders algorítmicos de divisas. Ofrece spreads competitivos sin comisiones adicionales, y su cuenta demo es gratuita e ilimitada. La biblioteca oandapyV20 proporciona una interfaz Python limpia para todas las operaciones.", color: colors.body, font: "Times New Roman" })]
                }),
                new Paragraph({
                    numbering: { reference: "bullet-list", level: 0 },
                    children: [new TextRun({ text: "Spreads: Desde 0.6 pips en EUR/USD (cuenta Core)", font: "Times New Roman" })]
                }),
                new Paragraph({
                    numbering: { reference: "bullet-list", level: 0 },
                    children: [new TextRun({ text: "Sin comisiones: El costo está incorporado en el spread", font: "Times New Roman" })]
                }),
                new Paragraph({
                    numbering: { reference: "bullet-list", level: 0 },
                    children: [new TextRun({ text: "SDK: oandapyV20 (pip install oandapyV20)", font: "Times New Roman" })]
                }),
                new Paragraph({
                    numbering: { reference: "bullet-list", level: 0 },
                    spacing: { after: 200 },
                    children: [new TextRun({ text: "Características: 70+ pares de divisas, órdenes avanzadas, streaming de precios", font: "Times New Roman" })]
                }),

                // Section 5: Python Tech Stack
                new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("5. Stack Tecnológico Python")] }),
                new Paragraph({
                    spacing: { after: 200 },
                    children: [new TextRun({ text: "El ecosistema de Python para finanzas cuantitativas es extenso y maduro, con bibliotecas especializadas para cada aspecto del proceso de trading. La selección de bibliotecas presentada a continuación prioriza estabilidad, documentación completa, y comunidad activa. Todas las bibliotecas listadas son de código abierto y gratuitas, reduciendo los costos de desarrollo a cero.", color: colors.body, font: "Times New Roman" })]
                }),

                new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("5.1 Bibliotecas Principales")] }),
                new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("Manipulación de Datos")] }),
                new Paragraph({
                    numbering: { reference: "bullet-list", level: 0 },
                    children: [new TextRun({ text: "pandas (2.0+): Estructuras DataFrame para series temporales financieras, operaciones vectorizadas eficientes", font: "Times New Roman" })]
                }),
                new Paragraph({
                    numbering: { reference: "bullet-list", level: 0 },
                    children: [new TextRun({ text: "numpy (1.24+): Operaciones matemáticas de alto rendimiento, cálculos matriciales", font: "Times New Roman" })]
                }),
                new Paragraph({
                    numbering: { reference: "bullet-list", level: 0 },
                    spacing: { after: 200 },
                    children: [new TextRun({ text: "polars (opcional): Alternativa más rápida a pandas para datasets grandes", font: "Times New Roman" })]
                }),

                new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("Análisis Técnico")] }),
                new Paragraph({
                    numbering: { reference: "bullet-list", level: 0 },
                    children: [new TextRun({ text: "ta-lib: Biblioteca estándar de análisis técnico con 150+ indicadores (requiere instalación separada)", font: "Times New Roman" })]
                }),
                new Paragraph({
                    numbering: { reference: "bullet-list", level: 0 },
                    children: [new TextRun({ text: "pandas-ta: Alternativa pura Python con interfaz pandas, más fácil de instalar", font: "Times New Roman" })]
                }),
                new Paragraph({
                    numbering: { reference: "bullet-list", level: 0 },
                    spacing: { after: 200 },
                    children: [new TextRun({ text: "ta (Technical Analysis Library): Indicadores comunes con interfaz simple", font: "Times New Roman" })]
                }),

                new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("Conectividad y APIs")] }),
                new Paragraph({
                    numbering: { reference: "bullet-list", level: 0 },
                    children: [new TextRun({ text: "requests: Cliente HTTP para APIs REST, manejo de sesiones y autenticación", font: "Times New Roman" })]
                }),
                new Paragraph({
                    numbering: { reference: "bullet-list", level: 0 },
                    children: [new TextRun({ text: "websockets: Conexiones en tiempo real para streaming de datos", font: "Times New Roman" })]
                }),
                new Paragraph({
                    numbering: { reference: "bullet-list", level: 0 },
                    spacing: { after: 200 },
                    children: [new TextRun({ text: "httpx: Cliente HTTP asíncrono moderno, alternativa a requests", font: "Times New Roman" })]
                }),

                new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("Persistencia y Logging")] }),
                new Paragraph({
                    numbering: { reference: "bullet-list", level: 0 },
                    children: [new TextRun({ text: "sqlite3 (built-in): Base de datos local para historial de operaciones y cache", font: "Times New Roman" })]
                }),
                new Paragraph({
                    numbering: { reference: "bullet-list", level: 0 },
                    children: [new TextRun({ text: "logging (built-in): Sistema de registro configurable con niveles y rotación", font: "Times New Roman" })]
                }),
                new Paragraph({
                    numbering: { reference: "bullet-list", level: 0 },
                    spacing: { after: 200 },
                    children: [new TextRun({ text: "sqlalchemy: ORM avanzado si se requiere migración a PostgreSQL/MySQL", font: "Times New Roman" })]
                }),

                // Tech Stack Table
                new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("5.2 Resumen de Dependencias")] }),
                new Table({
                    columnWidths: [2500, 2500, 4360],
                    margins: { top: 100, bottom: 100, left: 180, right: 180 },
                    rows: [
                        new TableRow({
                            tableHeader: true,
                            children: [
                                new TableCell({ borders: cellBorders, shading: { fill: colors.tableHeader, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Categoría", bold: true, size: 20, font: "Times New Roman" })] })] }),
                                new TableCell({ borders: cellBorders, shading: { fill: colors.tableHeader, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Biblioteca", bold: true, size: 20, font: "Times New Roman" })] })] }),
                                new TableCell({ borders: cellBorders, shading: { fill: colors.tableHeader, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Uso Principal", bold: true, size: 20, font: "Times New Roman" })] })] })
                            ]
                        }),
                        new TableRow({
                            children: [
                                new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Datos", size: 20, font: "Times New Roman" })] })] }),
                                new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "pandas, numpy", size: 20, font: "Times New Roman" })] })] }),
                                new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "DataFrames, cálculos vectorizados", size: 20, font: "Times New Roman" })] })] })
                            ]
                        }),
                        new TableRow({
                            children: [
                                new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Análisis Técnico", size: 20, font: "Times New Roman" })] })] }),
                                new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "pandas-ta, ta", size: 20, font: "Times New Roman" })] })] }),
                                new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "RSI, MACD, SMA, Bollinger Bands", size: 20, font: "Times New Roman" })] })] })
                            ]
                        }),
                        new TableRow({
                            children: [
                                new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "APIs Externas", size: 20, font: "Times New Roman" })] })] }),
                                new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "yfinance, requests", size: 20, font: "Times New Roman" })] })] }),
                                new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Datos de mercado, recomendaciones", size: 20, font: "Times New Roman" })] })] })
                            ]
                        }),
                        new TableRow({
                            children: [
                                new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Broker APIs", size: 20, font: "Times New Roman" })] })] }),
                                new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "alpaca-trade-api", size: 20, font: "Times New Roman" })] })] }),
                                new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Ejecución de órdenes, datos en tiempo real", size: 20, font: "Times New Roman" })] })] })
                            ]
                        }),
                        new TableRow({
                            children: [
                                new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Scheduling", size: 20, font: "Times New Roman" })] })] }),
                                new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "schedule, APScheduler", size: 20, font: "Times New Roman" })] })] }),
                                new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Ejecución programada diaria", size: 20, font: "Times New Roman" })] })] })
                            ]
                        }),
                        new TableRow({
                            children: [
                                new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Notificaciones", size: 20, font: "Times New Roman" })] })] }),
                                new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "python-telegram-bot", size: 20, font: "Times New Roman" })] })] }),
                                new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Alertas por Telegram (gratuito)", size: 20, font: "Times New Roman" })] })] })
                            ]
                        })
                    ]
                }),
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 100, after: 300 },
                    children: [new TextRun({ text: "Tabla 3: Dependencias Python del sistema de trading", size: 20, italics: true, color: colors.secondary, font: "Times New Roman" })]
                }),

                // Section 6: Decision Logic
                new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("6. Lógica de Decisiones (BUY/SELL/HOLD)")] }),
                new Paragraph({
                    spacing: { after: 200 },
                    children: [new TextRun({ text: "El motor de decisiones implementa una estrategia híbrida que combina múltiples fuentes de señal para determinar la acción óptima. Cada fuente genera una señal independiente (-1 a +1) con un nivel de confianza (0 a 1). Las señales se ponderan según la calidad histórica de cada fuente y se agregan para producir una decisión final. El sistema solo ejecuta una operación si la señal agregada supera umbrales de confianza predefinidos.", color: colors.body, font: "Times New Roman" })]
                }),

                new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("6.1 Fuentes de Señales")] }),
                new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("Señales Técnicas (Peso: 40%)")] }),
                new Paragraph({
                    spacing: { after: 200 },
                    children: [new TextRun({ text: "Las señales técnicas se derivan de indicadores clásicos de análisis técnico. El RSI (Relative Strength Index) genera señales de sobrecompra (>70) o sobreventa (<30). El MACD (Moving Average Convergence Divergence) identifica cambios de momentum a través de cruces de línea de señal. Las Bandas de Bollinger detectan condiciones de sobrecompra/sobreventa relativa. Las medias móviles (SMA/EMA) determinan la dirección de la tendencia subyacente.", color: colors.body, font: "Times New Roman" })]
                }),
                new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("Señales de Recomendaciones (Peso: 35%)")] }),
                new Paragraph({
                    spacing: { after: 200 },
                    children: [new TextRun({ text: "Las APIs de Finnhub y otros proveedores ofrecen consensos de analistas profesionales que agregan recomendaciones de compra, venta, o mantener de instituciones financieras. Estas señales se normalizan a una escala de -1 (strong sell) a +1 (strong buy). El histórico de precisión de los analistas para cada activo se utiliza como factor de ponderación adicional.", color: colors.body, font: "Times New Roman" })]
                }),
                new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("Señales de Sentimiento (Peso: 25%)")] }),
                new Paragraph({
                    spacing: { after: 200 },
                    children: [new TextRun({ text: "El sentimiento de mercado se obtiene de noticias financieras y redes sociales a través de APIs como Finnhub News Sentiment o análisis propio de titulares. Este componente captura factores cualitativos que los indicadores técnicos no reflejan, como eventos geopolíticos, anuncios de earnings, o cambios regulatorios. El análisis se realiza mediante técnicas de procesamiento de lenguaje natural (NLP) o consumo de APIs pre-calculadas.", color: colors.body, font: "Times New Roman" })]
                }),

                new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("6.2 Algoritmo de Decisión")] }),
                new Paragraph({
                    spacing: { after: 200 },
                    children: [new TextRun({ text: "El algoritmo procesa las señales en tres etapas: normalización, ponderación, y agregación. La señal final se compara contra umbrales configurables para determinar la acción. El sistema mantiene un registro de señales históricas y resultados para aprendizaje adaptativo.", color: colors.body, font: "Times New Roman" })]
                }),
                new Paragraph({
                    spacing: { after: 100 },
                    children: [new TextRun({ text: "Fórmula de agregación:", bold: true, font: "Times New Roman" })]
                }),
                new Paragraph({
                    spacing: { after: 200 },
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: "Signal_Final = Σ(Wi × Si × Ci) / Σ(Wi × Ci)", italics: true, font: "Times New Roman" })]
                }),
                new Paragraph({
                    spacing: { after: 200 },
                    children: [new TextRun({ text: "Donde Wi es el peso de la fuente i, Si es la señal normalizada (-1 a +1), y Ci es el nivel de confianza. La decisión se toma según los siguientes umbrales:", font: "Times New Roman" })]
                }),
                new Paragraph({
                    numbering: { reference: "bullet-list", level: 0 },
                    children: [new TextRun({ text: "Signal_Final > 0.6 con confianza > 0.7 → BUY", font: "Times New Roman" })]
                }),
                new Paragraph({
                    numbering: { reference: "bullet-list", level: 0 },
                    children: [new TextRun({ text: "Signal_Final < -0.6 con confianza > 0.7 → SELL", font: "Times New Roman" })]
                }),
                new Paragraph({
                    numbering: { reference: "bullet-list", level: 0 },
                    spacing: { after: 200 },
                    children: [new TextRun({ text: "En cualquier otro caso → HOLD", font: "Times New Roman" })]
                }),

                // Section 7: Code Structure
                new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("7. Estructura del Código")] }),
                new Paragraph({
                    spacing: { after: 200 },
                    children: [new TextRun({ text: "La organización del proyecto sigue las mejores prácticas de Python, con separación clara de configuración, lógica de negocio, y utilidades. Se recomienda utilizar un entorno virtual (venv o conda) para aislar las dependencias del proyecto del sistema global. La estructura modular facilita testing unitario y permite sustituir componentes sin afectar el resto del sistema.", color: colors.body, font: "Times New Roman" })]
                }),
                new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("7.1 Estructura de Directorios")] }),
                new Paragraph({
                    spacing: { after: 200 },
                    children: [new TextRun({ text: "El proyecto se organiza con la siguiente jerarquía de directorios que separa responsabilidades y facilita el mantenimiento:", font: "Times New Roman" })]
                }),
                new Paragraph({
                    spacing: { after: 200 },
                    shading: { fill: colors.tableBg, type: ShadingType.CLEAR },
                    children: [new TextRun({ text: "trading_bot/\n├── config/\n│   ├── __init__.py\n│   ├── settings.py      # Configuración centralizada\n│   └── secrets.py        # API keys (no commitear)\n├── data/\n│   ├── __init__.py\n│   ├── fetcher.py        # Conexión a APIs de datos\n│   └── cache.py          # Sistema de cache local\n├── analysis/\n│   ├── __init__.py\n│   ├── technical.py      # Indicadores técnicos\n│   ├── sentiment.py      # Análisis de sentimiento\n│   └── recommendations.py # Recomendaciones de analistas\n├── engine/\n│   ├── __init__.py\n│   ├── decision.py       # Motor de decisiones\n│   └── risk.py           # Gestión de riesgo\n├── execution/\n│   ├── __init__.py\n│   ├── broker.py         # Interface con broker\n│   └── orders.py         # Gestión de órdenes\n├── utils/\n│   ├── __init__.py\n│   ├── logger.py         # Sistema de logging\n│   └── notifications.py  # Alertas Telegram/Email\n├── tests/                # Tests unitarios\n├── main.py               # Punto de entrada\n└── requirements.txt      # Dependencias", font: "SarasaMonoSC", size: 18 })]
                }),

                new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("7.2 Módulo Principal (main.py)")] }),
                new Paragraph({
                    spacing: { after: 200 },
                    children: [new TextRun({ text: "El módulo principal orquesta el flujo completo de ejecución: inicializa conexiones, obtiene datos, procesa señales, toma decisiones, y ejecuta operaciones si corresponde. Implementa manejo de errores robusto y logging detallado para auditoría.", font: "Times New Roman" })]
                }),

                new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("7.3 Archivo de Requisitos (requirements.txt)")] }),
                new Paragraph({
                    spacing: { after: 200 },
                    children: [new TextRun({ text: "Las dependencias se especifican con versiones fijas para garantizar reproducibilidad. Se recomienda actualizar periódicamente tras verificar compatibilidad:", font: "Times New Roman" })]
                }),
                new Paragraph({
                    spacing: { after: 200 },
                    shading: { fill: colors.tableBg, type: ShadingType.CLEAR },
                    children: [new TextRun({ text: "pandas==2.1.4\nnumpy==1.26.2\nyfinance==0.2.32\npandas-ta==0.3.14b\nalpaca-trade-api==3.0.2\nrequests==2.31.0\nschedule==1.2.0\npython-telegram-bot==20.7\npython-dotenv==1.0.0", font: "SarasaMonoSC", size: 18 })]
                }),

                // Section 8: Security
                new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("8. Consideraciones de Seguridad")] }),
                new Paragraph({
                    spacing: { after: 200 },
                    children: [new TextRun({ text: "La seguridad es crítica en sistemas de trading automatizado debido a la exposición de credenciales financieras y la posibilidad de pérdidas económicas por vulnerabilidades. Se deben implementar múltiples capas de protección para mitigar riesgos de acceso no autorizado, robo de API keys, y errores de ejecución.", color: colors.body, font: "Times New Roman" })]
                }),

                new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("8.1 Gestión de Credenciales")] }),
                new Paragraph({
                    spacing: { after: 200 },
                    children: [new TextRun({ text: "Todas las API keys, tokens, y secretos deben almacenarse fuera del código fuente, preferiblemente en variables de entorno o archivos de configuración excluidos del control de versiones. La biblioteca python-dotenv permite cargar variables desde un archivo .env que nunca se commitea al repositorio. En producción, se recomienda usar servicios de gestión de secretos como AWS Secrets Manager o HashiCorp Vault.", color: colors.body, font: "Times New Roman" })]
                }),

                new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("8.2 Validación de Órdenes")] }),
                new Paragraph({
                    spacing: { after: 200 },
                    children: [new TextRun({ text: "Antes de ejecutar cualquier operación, el sistema debe validar la orden contra múltiples criterios de seguridad: tamaño máximo de posición, límites de exposición por activo, horarios de mercado válidos, y saldo disponible. Se deben implementar circuit breakers que detengan el trading ante comportamientos anómalos como pérdidas excesivas o señales contradictorias.", color: colors.body, font: "Times New Roman" })]
                }),

                new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("8.3 Modo Paper Trading")] }),
                new Paragraph({
                    spacing: { after: 200 },
                    children: [new TextRun({ text: "Se recomienda operar en modo paper trading (simulación) durante al menos 30-60 días antes de activar trading real con capital. Esto permite validar la lógica de decisiones, identificar bugs, y calibrar parámetros sin riesgo financiero. La mayoría de brokers (Alpaca, Interactive Brokers) ofrecen cuentas de demostración gratuitas con datos de mercado reales.", color: colors.body, font: "Times New Roman" })]
                }),

                // Section 9: Estimated Costs
                new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("9. Estimación de Costos")] }),
                new Paragraph({
                    spacing: { after: 200 },
                    children: [new TextRun({ text: "Uno de los objetivos principales del proyecto es minimizar los costos operativos. Con las selecciones propuestas, es posible operar el bot con costos marginales o completamente gratuito durante la fase de desarrollo y testing. A continuación se presenta un desglose de costos estimados para diferentes escenarios de operación.", color: colors.body, font: "Times New Roman" })]
                }),

                new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("9.1 Escenario Gratuito (Paper Trading)")] }),
                new Paragraph({
                    spacing: { after: 200 },
                    children: [new TextRun({ text: "Para desarrollo y pruebas, todos los componentes pueden operar sin costo alguno. Las APIs de datos gratuitas (Alpha Vantage, Yahoo Finance, Finnhub) proporcionan suficientes solicitudes diarias para un bot que ejecuta una operación por día. Los brokers ofrecen cuentas demo ilimitadas con datos de mercado diferidos o en tiempo real sin costo.", color: colors.body, font: "Times New Roman" })]
                }),
                new Paragraph({
                    numbering: { reference: "bullet-list", level: 0 },
                    children: [new TextRun({ text: "APIs de datos: $0 (planes gratuitos combinados)", font: "Times New Roman" })]
                }),
                new Paragraph({
                    numbering: { reference: "bullet-list", level: 0 },
                    children: [new TextRun({ text: "Broker (paper trading): $0", font: "Times New Roman" })]
                }),
                new Paragraph({
                    numbering: { reference: "bullet-list", level: 0 },
                    children: [new TextRun({ text: "Hosting local: $0", font: "Times New Roman" })]
                }),
                new Paragraph({
                    numbering: { reference: "bullet-list", level: 0 },
                    spacing: { after: 200 },
                    children: [new TextRun({ text: "Total mensual: $0", bold: true, font: "Times New Roman" })]
                }),

                new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("9.2 Escenario de Bajo Costo (Trading Real)")] }),
                new Paragraph({
                    spacing: { after: 200 },
                    children: [new TextRun({ text: "Para trading real con capital modesto, los costos permanecen bajos. Alpaca no cobra comisiones en acciones estadounidenses. Si se requiere mayor frecuencia de datos o características premium, los planes básicos de APIs cuestan entre $10-50 mensuales. Un VPS para hosting 24/7 cuesta aproximadamente $5-10/mes.", color: colors.body, font: "Times New Roman" })]
                }),
                new Paragraph({
                    numbering: { reference: "bullet-list", level: 0 },
                    children: [new TextRun({ text: "APIs de datos (opcional upgrade): $0-50/mes", font: "Times New Roman" })]
                }),
                new Paragraph({
                    numbering: { reference: "bullet-list", level: 0 },
                    children: [new TextRun({ text: "Comisiones de trading (Alpaca): $0/operación", font: "Times New Roman" })]
                }),
                new Paragraph({
                    numbering: { reference: "bullet-list", level: 0 },
                    children: [new TextRun({ text: "VPS para hosting 24/7: $5-10/mes", font: "Times New Roman" })]
                }),
                new Paragraph({
                    numbering: { reference: "bullet-list", level: 0 },
                    spacing: { after: 200 },
                    children: [new TextRun({ text: "Total mensual estimado: $5-60", bold: true, font: "Times New Roman" })]
                }),

                // Cost Summary Table
                new Table({
                    columnWidths: [3500, 2920, 2940],
                    margins: { top: 100, bottom: 100, left: 180, right: 180 },
                    rows: [
                        new TableRow({
                            tableHeader: true,
                            children: [
                                new TableCell({ borders: cellBorders, shading: { fill: colors.tableHeader, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Componente", bold: true, size: 20, font: "Times New Roman" })] })] }),
                                new TableCell({ borders: cellBorders, shading: { fill: colors.tableHeader, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Gratuito", bold: true, size: 20, font: "Times New Roman" })] })] }),
                                new TableCell({ borders: cellBorders, shading: { fill: colors.tableHeader, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Bajo Costo", bold: true, size: 20, font: "Times New Roman" })] })] })
                            ]
                        }),
                        new TableRow({
                            children: [
                                new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "APIs de datos financieros", size: 20, font: "Times New Roman" })] })] }),
                                new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "$0", size: 20, font: "Times New Roman" })] })] }),
                                new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "$10-50/mes", size: 20, font: "Times New Roman" })] })] })
                            ]
                        }),
                        new TableRow({
                            children: [
                                new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Broker (comisiones)", size: 20, font: "Times New Roman" })] })] }),
                                new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "$0 (paper)", size: 20, font: "Times New Roman" })] })] }),
                                new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "$0 (Alpaca)", size: 20, font: "Times New Roman" })] })] })
                            ]
                        }),
                        new TableRow({
                            children: [
                                new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Notificaciones (Telegram)", size: 20, font: "Times New Roman" })] })] }),
                                new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "$0", size: 20, font: "Times New Roman" })] })] }),
                                new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "$0", size: 20, font: "Times New Roman" })] })] })
                            ]
                        }),
                        new TableRow({
                            children: [
                                new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Hosting/Servidor", size: 20, font: "Times New Roman" })] })] }),
                                new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "$0 (local)", size: 20, font: "Times New Roman" })] })] }),
                                new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "$5-10/mes (VPS)", size: 20, font: "Times New Roman" })] })] })
                            ]
                        }),
                        new TableRow({
                            children: [
                                new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "TOTAL MENSUAL", bold: true, size: 20, font: "Times New Roman" })] })] }),
                                new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "$0", bold: true, size: 20, font: "Times New Roman" })] })] }),
                                new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "$15-60/mes", bold: true, size: 20, font: "Times New Roman" })] })] })
                            ]
                        })
                    ]
                }),
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 100, after: 300 },
                    children: [new TextRun({ text: "Tabla 4: Resumen de costos operativos mensuales", size: 20, italics: true, color: colors.secondary, font: "Times New Roman" })]
                }),

                // Section 10: Implementation Roadmap
                new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("10. Hoja de Ruta de Implementación")] }),
                new Paragraph({
                    spacing: { after: 200 },
                    children: [new TextRun({ text: "El desarrollo del bot se estructura en fases incrementales que permiten validar cada componente antes de integrar el siguiente. Este enfoque reduce riesgos y facilita la identificación temprana de problemas. Se recomienda seguir el orden propuesto para maximizar el aprendizaje y minimizar el tiempo de debugging.", color: colors.body, font: "Times New Roman" })]
                }),

                new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Fase 1: Infraestructura Base (Semana 1-2)")] }),
                new Paragraph({
                    numbering: { reference: "numbered-list-1", level: 0 },
                    children: [new TextRun({ text: "Configurar entorno de desarrollo (Python 3.11+, venv)", font: "Times New Roman" })]
                }),
                new Paragraph({
                    numbering: { reference: "numbered-list-1", level: 0 },
                    children: [new TextRun({ text: "Instalar dependencias y crear estructura de directorios", font: "Times New Roman" })]
                }),
                new Paragraph({
                    numbering: { reference: "numbered-list-1", level: 0 },
                    children: [new TextRun({ text: "Implementar sistema de logging y configuración", font: "Times New Roman" })]
                }),
                new Paragraph({
                    numbering: { reference: "numbered-list-1", level: 0 },
                    spacing: { after: 200 },
                    children: [new TextRun({ text: "Crear cuentas en APIs (Alpha Vantage, Finnhub) y obtener keys", font: "Times New Roman" })]
                }),

                new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Fase 2: Adquisición de Datos (Semana 2-3)")] }),
                new Paragraph({
                    numbering: { reference: "numbered-list-2", level: 0 },
                    children: [new TextRun({ text: "Implementar módulo de conexión a Yahoo Finance (yfinance)", font: "Times New Roman" })]
                }),
                new Paragraph({
                    numbering: { reference: "numbered-list-2", level: 0 },
                    children: [new TextRun({ text: "Implementar módulo de conexión a Alpha Vantage", font: "Times New Roman" })]
                }),
                new Paragraph({
                    numbering: { reference: "numbered-list-2", level: 0 },
                    children: [new TextRun({ text: "Implementar módulo de recomendaciones (Finnhub)", font: "Times New Roman" })]
                }),
                new Paragraph({
                    numbering: { reference: "numbered-list-2", level: 0 },
                    spacing: { after: 200 },
                    children: [new TextRun({ text: "Crear sistema de cache local (SQLite)", font: "Times New Roman" })]
                }),

                new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Fase 3: Análisis y Decisiones (Semana 3-4)")] }),
                new Paragraph({
                    numbering: { reference: "numbered-list-3", level: 0 },
                    children: [new TextRun({ text: "Implementar cálculo de indicadores técnicos (RSI, MACD, SMA)", font: "Times New Roman" })]
                }),
                new Paragraph({
                    numbering: { reference: "numbered-list-3", level: 0 },
                    children: [new TextRun({ text: "Desarrollar motor de agregación de señales", font: "Times New Roman" })]
                }),
                new Paragraph({
                    numbering: { reference: "numbered-list-3", level: 0 },
                    children: [new TextRun({ text: "Implementar lógica de decisión (BUY/SELL/HOLD)", font: "Times New Roman" })]
                }),
                new Paragraph({
                    numbering: { reference: "numbered-list-3", level: 0 },
                    spacing: { after: 200 },
                    children: [new TextRun({ text: "Crear tests unitarios para cada componente", font: "Times New Roman" })]
                }),

                new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Fase 4: Integración con Broker (Semana 4-5)")] }),
                new Paragraph({
                    numbering: { reference: "numbered-list-4", level: 0 },
                    children: [new TextRun({ text: "Crear cuenta de paper trading en Alpaca", font: "Times New Roman" })]
                }),
                new Paragraph({
                    numbering: { reference: "numbered-list-4", level: 0 },
                    children: [new TextRun({ text: "Implementar módulo de conexión con Alpaca API", font: "Times New Roman" })]
                }),
                new Paragraph({
                    numbering: { reference: "numbered-list-4", level: 0 },
                    children: [new TextRun({ text: "Desarrollar sistema de ejecución de órdenes", font: "Times New Roman" })]
                }),
                new Paragraph({
                    numbering: { reference: "numbered-list-4", level: 0 },
                    spacing: { after: 200 },
                    children: [new TextRun({ text: "Integrar notificaciones (Telegram bot)", font: "Times New Roman" })]
                }),

                // Final Notes
                new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("11. Notas Finales y Advertencias")] }),
                new Paragraph({
                    spacing: { after: 200 },
                    children: [new TextRun({ text: "El trading algorítmico conlleva riesgos significativos de pérdida de capital. Este documento proporciona especificaciones técnicas para desarrollo educativo y de investigación. No constituye asesoramiento financiero ni garantiza resultados de trading. Los mercados financieros son inherentemente impredecibles, y ningún sistema automatizado puede garantizar ganancias consistentes.", color: colors.body, font: "Times New Roman" })]
                }),
                new Paragraph({
                    spacing: { after: 200 },
                    children: [new TextRun({ text: "Se recomienda encarecidamente operar en modo paper trading durante un período extenso (mínimo 2-3 meses) antes de comprometer capital real. Durante este período, se debe monitorear el rendimiento del bot, analizar las decisiones tomadas, y ajustar los parámetros según los resultados observados. La restricción de una operación diaria es intencional para limitar la exposición y permitir un análisis detallado de cada decisión.", color: colors.body, font: "Times New Roman" })]
                }),
                new Paragraph({
                    spacing: { after: 200 },
                    children: [new TextRun({ text: "Las APIs gratuitas tienen limitaciones que pueden afectar la disponibilidad de datos en momentos críticos. Se recomienda implementar manejo de errores robusto y notificaciones cuando las fuentes de datos no estén disponibles. Nunca se debe invertir más capital del que se está dispuesto a perder completamente.", color: colors.body, font: "Times New Roman" })]
                })
            ]
        }
    ]
});

// Save document
Packer.toBuffer(doc).then(buffer => {
    fs.writeFileSync("/home/z/my-project/download/bot_trading_polymarket_especificaciones.docx", buffer);
    console.log("Documento generado exitosamente: /home/z/my-project/download/bot_trading_polymarket_especificaciones.docx");
});