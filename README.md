# Informe Técnico del Proyecto: FinAssist

## 1. Descripción General

**FinAssist** es una aplicación web moderna e inteligente para la gestión de finanzas personales. Su objetivo es empoderar a los usuarios para que tomen el control de su bienestar financiero a través de un conjunto de herramientas intuitivas, potentes y optimizadas para un rendimiento excepcional.

El proyecto está diseñado para ser funcional tanto para **usuarios registrados** (con persistencia de datos en la nube a través de Firebase) como para **usuarios invitados** (con persistencia de datos en el `localStorage` del navegador), ofreciendo una experiencia fluida y reactiva desde la primera visita.

### 1.1. Características Principales

*   **Gestión de Transacciones**: Registro, edición y eliminación de ingresos y gastos, con una interfaz virtualizada para manejar grandes volúmenes de datos sin pérdida de rendimiento.
*   **Metas de Ahorro**: Creación y seguimiento de objetivos financieros.
*   **Asistente con IA Avanzado**: Recomendaciones financieras personalizadas y contextuales, con un sistema de caché inteligente para respuestas rápidas y eficientes.
*   **Sistema de Alertas Proactivo**: Detecta gastos anómalos, metas en riesgo y oportunidades de inversión, notificando al usuario a través de alertas en el dashboard y notificaciones toast.
*   **Dashboard Interactivo**: Visualización rápida del balance, gastos por categoría y estado de las metas, enriquecido con componentes animados y de carga profesional.
*   **Simulador Bancario**: Un conjunto de calculadoras profesionales para simular productos como CDTs, préstamos, tarjetas de crédito e inversiones.
*   **Modo Invitado**: Funcionalidad completa sin necesidad de registro, ideal para la primera experiencia.
*   **Autenticación Segura**: Sistema de registro e inicio de sesión con Firebase.
*   **Interfaz Moderna y Optimizada**: Diseño limpio, responsivo y con modo oscuro/claro, construido con las mejores prácticas de UI/UX, animaciones fluidas y optimización de rendimiento.

---

## 2. Arquitectura Tecnológica

| Categoría                 | Tecnología                                                               | Propósito                                                          |
| ------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| **Framework Principal**     | [Next.js 15 (App Router)](https://nextjs.org/)                             | Renderizado híbrido, optimización (Turbopack) y estructura de rutas. |
| **Lenguaje**              | [TypeScript](https://www.typescriptlang.org/)                            | Tipado estático para robustez y escalabilidad.                   |
| **Estilos**               | [Tailwind CSS](https://tailwindcss.com/)                                 | Framework CSS utility-first para diseño rápido.                    |
| **Componentes de UI**       | [shadcn/ui](https://ui.shadcn.com/)                                      | Componentes accesibles, personalizables y reutilizables.           |
| **Animaciones**           | [Framer Motion](https://www.framer.com/motion/)                          | Animaciones fluidas para una mejor experiencia de usuario.         |
| **Backend & Base de Datos** | [Firebase (Firestore & Authentication)](https://firebase.google.com/) | Autenticación de usuarios y base de datos NoSQL en tiempo real.  |
| **Inteligencia Artificial** | [Genkit (Google AI)](https://firebase.google.com/docs/genkit)      | Orquestación de flujos de IA generativa con sistema de caché.        |
| **Gestión de Estado**       | [Zustand](https://github.com/pmndrs/zustand)                             | Gestor de estado global optimizado con selectores `shallow`.       |
| **Lógica de Negocio**     | **Motor Financiero (`FinancialEngine`)**                                 | Encapsulación de cálculos complejos, proyecciones y alertas.     |
| **Optimización Frontend** | **`@tanstack/react-virtual` & `React.memo`**                             | Virtualización de listas y memoización para alto rendimiento.    |

---

## 3. Diagrama de Flujo de Datos

Este diagrama ilustra cómo fluye la información a través de la aplicación, desde la interacción del usuario hasta la actualización de la UI.

```mermaid
graph TD
    subgraph "Usuario"
        A[Interactúa con la UI]
    end
    subgraph "Frontend (React / Next.js)"
        B(Componentes de UI Optimizados)
        C{useAppStore (Zustand) con Selectores}
        D[Layout / Páginas]
    end
    subgraph "Lógica de Negocio"
        F[FinancialEngine.ts]
        G[Acciones de Zustand]
    end
    subgraph "Backend & Servicios"
        H(Firebase Auth)
        I(Firestore DB)
        J(Genkit Flows / Google AI con Caché)
        K[LocalStorage]
    end
    A --> B
    B --> G
    G --> C
    C --> D
    D --> B
    G -- Llama a --> J
    J -- Devuelve a --> B
    G -- Dispara Análisis --> F
    F -- Actualiza --> B
    subgraph "Persistencia de Datos"
        G -- Si usuario está logueado --> I
        G -- Si usuario es invitado --> K
        H <--> C
        I <.-> C
        K <.-> C
    end
    style A fill:#f9f,stroke:#333,stroke-width:2px
    style J fill:#bbf,stroke:#333,stroke-width:2px
    style C fill:#9f9,stroke:#333,stroke-width:2px
```

---

## 4. Arquitectura del Frontend

### 4.1. Estructura de Directorios Clave

```
src/
├── app/                  # Rutas de la aplicación (App Router)
│   ├── dashboard/
│   ├── calculators/      # Sección de calculadoras
│   └── (otras rutas...)
├── components/           # Componentes reutilizables
│   ├── auth/
│   ├── assistant/
│   ├── dashboard/        # Componentes del dashboard principal
│   └── ui/               # Componentes base de shadcn/ui
├── store/                # Gestor de estado global
│   ├── useAppStore.ts    # Hook y lógica de Zustand optimizada
│   └── selectors.ts      # Selectores con `shallow` para evitar re-renders
├── engine/               # Lógica de negocio pura (sin dependencias de UI)
│   └── FinancialEngine.ts# Análisis, proyecciones, alertas y métricas
├── hooks/                # Hooks reutilizables
│   └── useFinancialAnalysis.ts # Hook para consumir el motor financiero
├── ai/                   # Lógica de IA (Genkit)
│   ├── flows/            # Flujos que interactúan con LLMs (con caché)
│   └── genkit.ts         # Configuración de Genkit
└── lib/                  # Utilidades y configuración de servicios
    ├── firebase.ts
    └── utils.ts
```

### 4.2. Gestión de Estado Global Optimizada (`useAppStore` y `selectors`)

El estado global, gestionado con Zustand, ha sido **críticamente optimizado** para evitar re-renders innecesarios, que es uno de los mayores cuellos de botella en aplicaciones React complejas.

**Estrategias de Optimización Clave:**

1.  **Selectores con `shallow`**: En `src/store/selectors.ts`, hemos creado hooks específicos como `useTransactions` o `useGoals`. Estos hooks utilizan el comparador `shallow` de Zustand. Esto significa que un componente que use `useTransactions` solo se volverá a renderizar si el array de transacciones en sí cambia (se añade o elimina un elemento), pero no si cambia otra parte del estado como `user` o `goals`.
2.  **Cálculo Derivado y Centralizado**: El balance del usuario ya no se almacena como un estado separado. En su lugar, el hook `useBalance` lo calcula dinámicamente (`deriva`) a partir de la lista de transacciones. Esto elimina la necesidad de sincronizar el balance y previene errores de estado inconsistente.
3.  **Acciones con `debounce`**: Las acciones que modifican datos, como `addTransaction`, están envueltas en una función `debounce`. Esto agrupa múltiples llamadas rápidas en una sola ejecución, previniendo escrituras excesivas a la base de datos y mejorando la performance percibida.

**Ejemplo de Selector (`selectors.ts`):**
```typescript
// src/store/selectors.ts
import { useAppStore } from './useAppStore';
import { shallow } from 'zustand/shallow';

// Este selector solo notificará al componente si el array de transacciones cambia.
export const useTransactions = () => 
  useAppStore(state => state.transactions, shallow);

// Este selector deriva el estado, es eficiente y siempre está actualizado.
export const useBalance = () => 
  useAppStore(state => state.transactions.reduce((sum, t) => 
    sum + (t.type === 'income' ? t.amount : -t.amount), 0
  ));
```

### 4.3. Optimización de Renderizado en la UI

*   **Virtualización de Listas (`@tanstack/react-virtual`)**: Para la tabla de transacciones, que puede crecer indefinidamente, se implementó la virtualización. En lugar de renderizar miles de filas en el DOM, solo se renderizan las que son visibles en pantalla (más un pequeño buffer). Esto mantiene la aplicación fluida y rápida, incluso con un historial de transacciones enorme.
*   **Memoización (`React.memo` y `useMemo`)**: Componentes costosos como los gráficos (`ChartComponent`) están envueltos en `React.memo`. Esto le dice a React que no vuelva a renderizar el componente si sus propiedades (props) no han cambiado. Además, los cálculos complejos dentro de los componentes se envuelven en el hook `useMemo` para cachear sus resultados.
*   **Estados de Carga Profesionales**: Se han reemplazado los spinners genéricos por componentes de esqueleto (`Skeleton`) que imitan la forma de la UI final. Esto mejora la experiencia de carga percibida por el usuario.
*   **Error Boundaries**: El Dashboard está envuelto en un `ErrorBoundary` personalizado. Si ocurre un error de renderizado en uno de los componentes hijos, la aplicación no se bloquea. En su lugar, muestra un mensaje de error amigable con la opción de reintentar, aumentando la robustez de la aplicación.

---

## 5. Lógica de Negocio: El Motor Financiero (`FinancialEngine`)

Toda la inteligencia financiera de la aplicación está encapsulada en `src/engine/FinancialEngine.ts`. Es una clase pura de TypeScript, sin dependencias de UI, que se encarga de analizar los datos del usuario.

**Responsabilidades Clave:**

*   **`calculateFinancialMetrics()`**: Calcula KPIs esenciales como el flujo neto, la tasa de ahorro y el **"burn rate"** (meses de supervivencia con los ahorros actuales).
*   **`analyzeTrends()`**: Utiliza regresión lineal simple para detectar si los ingresos o gastos tienen una tendencia al alza o a la baja y calcula la **volatilidad** de los gastos.
*   **`assessRiskProfile()`**: Genera un **puntaje de salud financiera (0-100)** y un nivel de riesgo (Bajo, Medio, Alto, Crítico) basado en la tasa de ahorro y el fondo de emergencia.
*   **`detectAnomalousTransactions()`**: Utiliza la desviación estándar para identificar transacciones de gastos que son inusualmente altas en comparación con el patrón normal del usuario.
*   **`generateAlerts()`**: Basado en todas las métricas, genera un array de alertas proactivas (ej. "Gasto Inusual Detectado", "Meta en Riesgo", "Oportunidad de Inversión") que se muestran en el Dashboard.

---

## 6. Backend y Servicios

### 6.1. Firebase

*   **Authentication**: Gestiona el registro e inicio de sesión de usuarios con correo y contraseña.
*   **Firestore**: Base de datos NoSQL con una estructura escalable y reglas de seguridad robustas que garantizan que un usuario solo puede acceder a sus propios datos.

### 6.2. IA con Genkit y Caché Inteligente

El asistente de IA se ha optimizado para ser más potente y eficiente.

*   **`src/ai/flows/advancedRecommendationFlow.ts`**: Este flujo de Genkit ahora recibe un contexto mucho más rico, incluyendo las métricas y el perfil de riesgo del `FinancialEngine`. El prompt enviado al LLM es mucho más detallado, lo que resulta en recomendaciones más profundas y personalizadas.
*   **Sistema de Caché**: Se ha implementado un **caché en memoria** para las recomendaciones de IA.
    1.  Se genera una clave de caché (`cacheKey`) a partir de un resumen del estado financiero del usuario (conteo de transacciones, progreso de metas, etc.).
    2.  Si la clave existe en el caché y no ha expirado (30 minutos), se devuelve la recomendación guardada **sin llamar al LLM**.
    3.  Si no, se genera una nueva recomendación, se guarda en el caché y se devuelve al usuario.
    
    Esta estrategia reduce costos de API, disminuye la latencia y mejora significativamente la velocidad de respuesta del asistente.

**Ejemplo del prompt avanzado:**
```handlebars
Eres un asistente financiero experto. Analiza los datos y da una lista de recomendaciones cortas y útiles.

Saldo actual: {{{balance}}}

Transacciones Recientes:
{{#each transactions}}
- Categoría: {{{category}}}, Monto: {{{amount}}}, Tipo: {{{type}}}
{{/each}}

Metas de Ahorro:
{{#each goals}}
- Meta: "{{{name}}}", Progreso: {{progress}}%
{{/each}}

Tu análisis inicial indica una tasa de ahorro del {{analysis.metrics.savingsRate}}% y un nivel de riesgo {{analysis.riskProfile.level}}.

Basado en TODO esto, genera una lista de 2 a 4 recomendaciones clave.
```

---

## 7. Próximos Pasos y Mejoras

*   **Expandir Asistente de IA**:
    *   **Categorización automática**: Sugerir una categoría al crear una transacción usando un flujo de Genkit.
    *   **Chatbot conversacional**: Permitir al usuario hacer preguntas en lenguaje natural sobre sus finanzas ("¿Cuánto gasté en comida el mes pasado?").
*   **Notificaciones Push**: Utilizar Firebase Cloud Messaging para enviar alertas importantes (facturas próximas, metas alcanzadas) incluso cuando el usuario no está en la aplicación.
*   **Pruebas (Testing)**: Implementar tests unitarios (con Jest/Vitest) para el `FinancialEngine` y tests E2E (con Playwright/Cypress) para los flujos críticos de la aplicación.
*   **Internacionalización (i18n)**: Adaptar la aplicación para soportar múltiples idiomas y monedas.
