# Informe Técnico del Proyecto: FinAssist

## 1. Descripción General

**FinAssist** es una aplicación web moderna e inteligente para la gestión de finanzas personales. Su objetivo es empoderar a los usuarios para que tomen el control de su bienestar financiero a través de un conjunto de herramientas intuitivas, potentes y optimizadas para un rendimiento excepcional.

El proyecto está diseñado para ser funcional tanto para **usuarios registrados** (con persistencia de datos en la nube a través de Firebase) como para **usuarios invitados** (con persistencia de datos en el `localStorage` del navegador), ofreciendo una experiencia fluida y reactiva desde la primera visita.

### 1.1. Características Principales

*   **Gestión de Transacciones**: Registro, edición y eliminación de ingresos y gastos, con una interfaz virtualizada para manejar grandes volúmenes de datos sin pérdida de rendimiento.
*   **Metas de Ahorro**: Creación y seguimiento de objetivos financieros.
*   **Asistente con IA**: Recomendaciones financieras personalizadas y categorización automática de transacciones.
*   **Sistema de Alertas Proactivo**: Detecta gastos anómalos y metas en riesgo, notificando al usuario a través de alertas en el dashboard.
*   **Dashboard Interactivo y Moderno**: Visualización rápida del balance, gastos por categoría y estado de las metas con un diseño de "efecto cristal" (glassmorphism).
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
| **Inteligencia Artificial** | [Genkit (Google AI)](https://firebase.google.com/docs/genkit)      | Orquestación de flujos de IA generativa del lado del servidor.        |
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

    subgraph "Lógica de Negocio (Frontend)"
        E[Hooks Personalizados<br/>(useFinancialAnalysis, useSmartCategorization)]
    end
    
    subgraph "Lógica de Negocio (Backend)"
        F[FinancialEngine / BankingEngine]
        J[Flujos de IA (Genkit)]
    end

    subgraph "Persistencia de Datos"
        H(Firebase Auth)
        I(Firestore DB)
        K[LocalStorage]
    end
    
    A --> B
    B --> E
    E -- Llama a Flujo de Servidor --> J
    J -- Ejecuta lógica de backend y devuelve --> E
    E -- Actualiza Estado --> G[Acciones de Zustand]
    G --> C
    C --> D
    D --> B
    
    subgraph "Cálculos"
        E --> F
        F -- Devuelve a --> E
    end
    
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
│   ├── dashboard/        # Componentes del dashboard rediseñado
│   ├── layout/           # Nuevo ModernLayout flotante y responsivo
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

### 4.3. Layout y Optimización de Renderizado en la UI

*   **Layout Moderno y Flotante**: Se ha implementado un `ModernLayout` con una cabecera flotante que utiliza efectos de desenfoque (`backdrop-blur`) para una apariencia moderna.
*   **Panel Lateral Responsivo**: El panel lateral es totalmente responsivo:
    *   **En Escritorio**: Se mantiene fijo a la izquierda, empujando el contenido principal.
    *   **En Móvil/Tablet**: Funciona como un `overlay` que se despliega desde la izquierda, con un botón animado de menú/cierre para una experiencia nativa.
*   **Virtualización de Listas (`@tanstack/react-virtual`)**: Para la tabla de transacciones, que puede crecer indefinidamente, se implementó la virtualización. Solo se renderizan las filas visibles en pantalla, manteniendo la aplicación fluida incluso con un historial de transacciones enorme.
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

### 6.2. Arquitectura de IA Segura con Genkit

La funcionalidad de IA, como la categorización automática de transacciones, se ha implementado siguiendo un patrón seguro y robusto del lado del servidor.

**Problema Resuelto**: Se eliminó un `anti-pattern` que intentaba usar la clave de API de IA en el lado del cliente, lo cual es un grave riesgo de seguridad y causaba errores en Next.js.

**Solución Arquitectónica:**

1.  **Flujos Exclusivos del Servidor**: Toda la lógica que interactúa con las APIs de IA reside en los flujos de Genkit (`src/ai/flows/*.ts`). Estos archivos se ejecutan **únicamente en el servidor de Next.js**.
2.  **Llamada Segura desde el Frontend**: El frontend (a través de hooks como `useSmartCategorization`) llama a estos flujos como si fueran endpoints de una API. Next.js gestiona esta comunicación de forma segura.
3.  **Seguridad de Claves**: Las claves de API (ej. `GEMINI_API_KEY`) se almacenan de forma segura como variables de entorno en el servidor y **nunca se exponen al navegador**.
4.  **Robustez con Zod**: Se utilizan esquemas de `Zod` (`src/ai/schemas.ts`) para validar las entradas y, más importante, para forzar a la IA a devolver los datos en un formato JSON estructurado y predecible.

**Ejemplo del prompt de categorización (`categorizationFlow.ts`):**
```handlebars
Analiza esta transacción y sugiere la categoría más apropiada:
      
Descripción: "{{description}}"
Monto: {{amount}}

Categorías disponibles: ${categories.join(', ')}

{{#if userHistory}}
Historial del usuario (últimas transacciones para dar contexto):
{{#each userHistory}}
- "{{this.description}}" fue categorizado como {{this.category}}
{{/each}}
{{/if}}

Basado en la descripción y el historial, proporciona la categoría, un nivel de confianza (confidence) de 0 a 1, y una razón (reason) corta para tu elección.
Si la descripción sugiere un ingreso (salario, pago, etc.), la categoría debe ser 'Ingreso'.
```

---

## 7. Próximos Pasos y Mejoras

*   **Expandir Asistente de IA**:
    *   **Chatbot conversacional**: Permitir al usuario hacer preguntas en lenguaje natural sobre sus finanzas ("¿Cuánto gasté en comida el mes pasado?").
*   **Notificaciones Push**: Utilizar Firebase Cloud Messaging para enviar alertas importantes incluso cuando el usuario no está en la aplicación.
*   **Pruebas (Testing)**: Implementar tests unitarios (con Jest/Vitest) para el `FinancialEngine` y tests E2E (con Playwright/Cypress) para los flujos críticos.
*   **Internacionalización (i18n)**: Adaptar la aplicación para soportar múltiples idiomas y monedas.
```