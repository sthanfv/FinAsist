# Informe Técnico del Proyecto: FinAssist

## 1. Descripción General

**FinAssist** es una aplicación web moderna e inteligente para la gestión de finanzas personales. Su objetivo es empoderar a los usuarios para que tomen el control de su bienestar financiero a través de un conjunto de herramientas intuitivas, potentes y optimizadas para un rendimiento excepcional.

El proyecto está diseñado para ser funcional tanto para **usuarios registrados** (con persistencia de datos en la nube a través de Firebase) como para **usuarios invitados** (con persistencia de datos en el `localStorage` del navegador), ofreciendo una experiencia fluida y reactiva desde la primera visita.

### 1.1. Características Principales

*   **Gestión de Transacciones**: Registro, edición y eliminación de ingresos y gastos, con una interfaz virtualizada para manejar grandes volúmenes de datos sin pérdida de rendimiento.
*   **Metas de Ahorro**: Creación y seguimiento de objetivos financieros.
*   **Asistente con IA**: Recomendaciones financieras personalizadas y contextuales basadas en el estado financiero del usuario.
*   **Sistema de Alertas Proactivo**: Detecta gastos anómalos y metas en riesgo, notificando al usuario a través de alertas en el dashboard.
*   **Dashboard Interactivo**: Visualización rápida del balance, gastos por categoría y estado de las metas.
*   **Simulador Bancario**: Un conjunto de calculadoras profesionales para simular productos como CDTs, préstamos, tarjetas de crédito e inversiones.
*   **Navegación Profesional**: Un panel lateral colapsable que maximiza el espacio de contenido y ofrece una experiencia de usuario moderna.
*   **Modo Invitado**: Funcionalidad completa sin necesidad de registro.
*   **Autenticación Segura**: Sistema de registro e inicio de sesión con Firebase.
*   **Interfaz Moderna y Optimizada**: Diseño limpio, responsivo y con modo oscuro/claro, construido con las mejores prácticas de UI/UX.

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
| **Inteligencia Artificial** | [Genkit (Google AI)](https://firebase.google.com/docs/genkit)      | Orquestación de flujos de IA generativa.        |
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
        E[Hooks Personalizados<br/>(useFinancialAnalysis, useSmartCategorization)]
        F[FinancialEngine / BankingEngine]
        G[Acciones de Zustand]
    end

    subgraph "Backend & Servicios"
        H(Firebase Auth)
        I(Firestore DB)
        J[Flujos de IA (Genkit)]
        K[LocalStorage]
    end

    A --> B
    B --> E
    B --> G
    C --> D
    D --> B
    E --> J
    E --> F
    J -- Devuelve a --> E
    F -- Devuelve a --> E
    E -- Actualiza Estado --> G
    G --> C
    
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
│   ├── calculators/
│   ├── goals/
│   ├── budgets/
│   └── transactions/
├── components/           # Componentes reutilizables
│   ├── auth/
│   ├── assistant/
│   ├── dashboard/
│   ├── layout/           # Nuevo ModernLayout
│   └── ui/               # Componentes base de shadcn/ui
├── store/                # Gestor de estado global
│   ├── useAppStore.ts
│   └── selectors.ts
├── engine/               # Lógica de negocio pura (Cálculos)
│   ├── FinancialEngine.ts
│   └── BankingEngine.ts
├── hooks/                # Hooks reutilizables para lógica de UI
│   ├── useFinancialAnalysis.ts
│   └── useSmartCategorization.ts
├── ai/                   # Lógica de IA (Genkit)
│   ├── flows/            # Contienen la lógica de los flujos de IA
│   ├── genkit.ts         # Configuración de Genkit
│   └── schemas.ts        # Schemas de Zod y tipos para IA
└── lib/                  # Utilidades y configuración de servicios
    ├── firebase.ts
    └── utils.ts
```

### 4.2. Gestión de Estado Global Optimizada (`useAppStore` y `selectors`)

El estado global, gestionado con Zustand, ha sido optimizado para evitar re-renders innecesarios, que es uno de los mayores cuellos de botella en aplicaciones React complejas.

**Estrategias de Optimización Clave:**

1.  **Selectores con `shallow`**: En `src/store/selectors.ts`, hemos creado hooks específicos como `useTransactions` o `useGoals`. Estos hooks utilizan el comparador `shallow` de Zustand. Esto significa que un componente que use `useTransactions` solo se volverá a renderizar si el array de transacciones en sí cambia (se añade o elimina un elemento), pero no si cambia otra parte del estado como `user` o `goals`.
2.  **Cálculo Derivado y Centralizado**: El balance del usuario se calcula dinámicamente (`deriva`) a partir de la lista de transacciones usando el hook `useBalance`. Esto elimina la necesidad de sincronizar el balance y previene errores de estado inconsistente.

### 4.3. Optimización de Renderizado en la UI

*   **Virtualización de Listas (`@tanstack/react-virtual`)**: Para la tabla de transacciones, que puede crecer indefinidamente, se implementó la virtualización. Solo se renderizan las filas visibles en pantalla, manteniendo la aplicación fluida incluso con un historial de transacciones enorme.
*   **Panel Lateral Colapsable**: El layout principal (`ModernLayout`) ahora cuenta con un panel de navegación lateral que puede colapsarse para mostrar solo íconos, maximizando el espacio disponible para el contenido y ofreciendo una experiencia de usuario limpia y moderna.
*   **Memoización (`React.memo` y `useMemo`)**: Componentes costosos como los gráficos están envueltos en `React.memo`. Los cálculos complejos dentro de los componentes se envuelven en el hook `useMemo` para cachear sus resultados.
*   **Error Boundaries**: El Dashboard está envuelto en un `ErrorBoundary` personalizado. Si ocurre un error de renderizado, la aplicación no se bloquea y muestra un mensaje amigable.

---

## 5. Lógica de Negocio: El Motor Financiero (`FinancialEngine`)

Toda la inteligencia financiera está encapsulada en `src/engine/FinancialEngine.ts`. Es una clase pura de TypeScript con métodos estáticos que se encargan de analizar los datos del usuario.

**Responsabilidades Clave:**

*   **`runCompleteAnalysis()`**: Orquesta todos los análisis para generar una visión completa del estado financiero.
*   **`calculateFinancialMetrics()`**: Calcula KPIs esenciales como el flujo neto, la tasa de ahorro y el "burn rate" (meses de supervivencia con los ahorros actuales).
*   **`analyzeTrends()`**: Utiliza regresión lineal simple para detectar si los ingresos o gastos tienen una tendencia al alza o a la baja y calcula la volatilidad de los gastos.
*   **`assessRiskProfile()`**: Genera un puntaje de salud financiera (0-100) y un nivel de riesgo (Bajo, Medio, Alto, Crítico).
*   **`detectAnomalousTransactions()`**: Utiliza la desviación estándar para identificar transacciones de gastos que son inusualmente altas.
*   **`generateAlerts()`**: Basado en todas las métricas, genera un array de alertas proactivas (ej. "Gasto Inusual Detectado", "Meta en Riesgo") que se muestran en el Dashboard.

---

## 6. Backend y Servicios

### 6.1. Firebase

*   **Authentication**: Gestiona el registro e inicio de sesión de usuarios con correo y contraseña.
*   **Firestore**: Base de datos NoSQL con una estructura escalable y reglas de seguridad robustas que garantizan que un usuario solo puede acceder a sus propios datos.

### 6.2. IA con Genkit y Next.js Server Actions

El asistente de IA utiliza flujos de Genkit para interactuar con modelos de lenguaje de Google. Para cumplir con las estrictas reglas de los Server Actions de Next.js (`"use server"`), la arquitectura de IA ha sido refactorizada:

1.  **`src/ai/schemas.ts`**: Un archivo central que contiene todos los esquemas de Zod y las definiciones de tipos de TypeScript. Este archivo **no** usa `"use server"`, por lo que puede exportar tipos y objetos libremente.
2.  **`src/ai/flows/*.ts`**: Cada archivo de flujo (ej. `categorizationFlow.ts`) contiene la directiva `"use server"` y exporta **únicamente una función asíncrona** que envuelve la definición y ejecución del flujo de Genkit. Esto resuelve los errores de compilación de Next.js.
3.  **`src/hooks/useSmartCategorization.ts`**: Un hook de cliente que llama a la función de flujo del servidor para obtener sugerencias de IA, desacoplando la UI de la lógica de backend.

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
    *   **Chatbot conversacional**: Permitir al usuario hacer preguntas en lenguaje natural sobre sus finanzas ("¿Cuánto gasté en comida el mes pasado?").
*   **Notificaciones Push**: Utilizar Firebase Cloud Messaging para enviar alertas importantes incluso cuando el usuario no está en la aplicación.
*   **Pruebas (Testing)**: Implementar tests unitarios (con Jest/Vitest) para el `FinancialEngine` y tests E2E (con Playwright/Cypress) para los flujos críticos.
*   **Internacionalización (i18n)**: Adaptar la aplicación para soportar múltiples idiomas y monedas.
