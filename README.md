# Informe Técnico del Proyecto: FinAssist

## 1. Descripción General

**FinAssist** es una aplicación web moderna e inteligente para la gestión de finanzas personales. Su objetivo es empoderar a los usuarios para que tomen el control de su bienestar financiero a través de un conjunto de herramientas intuitivas, potentes y optimizadas para un rendimiento excepcional.

El proyecto está diseñado para ser funcional tanto para **usuarios registrados** (con persistencia de datos en la nube a través de Firebase) como para **usuarios invitados** (con persistencia de datos en el `localStorage` del navegador), ofreciendo una experiencia fluida y reactiva desde la primera visita.

### 1.1. Características Principales

*   **Gestión de Transacciones**: Registro, edición y eliminación de ingresos y gastos, con una interfaz virtualizada para manejar grandes volúmenes de datos sin pérdida de rendimiento.
*   **Metas de Ahorro Interactivas**: Creación, edición, eliminación y abono a metas financieras, con descuentos automáticos del balance principal para mantener la consistencia contable.
*   **Asistente con IA**: Recomendaciones financieras personalizadas y categorización automática de transacciones.
*   **Sistema de Alertas Proactivo**: Detecta gastos anómalos y metas en riesgo, notificando al usuario a través de alertas en el dashboard.
*   **Dashboard Interactivo y Moderno**: Visualización en tiempo real del balance, gastos por categoría y estado de las metas con un diseño de "efecto cristal" (glassmorphism).
*   **Simulador Bancario**: Un conjunto de calculadoras profesionales para simular productos como CDTs, préstamos, tarjetas de crédito e inversiones.
*   **Navegación Profesional**: Un panel lateral colapsable y un menú de acciones rápidas que ofrecen una experiencia de usuario moderna y eficiente.
*   **Autenticación Segura y Verificación de Email**: Un flujo de autenticación de nivel "Enterprise" con registro, inicio de sesión, recuperación de contraseña y verificación de email obligatoria para garantizar la máxima seguridad de los datos del usuario.
*   **Modo Invitado Robusto**: Funcionalidad completa sin registro, con persistencia de datos local.
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
| **Configuración** | **`next.config.ts` & `firestore.rules`** | Cabeceras de seguridad, reglas de BBDD y variables de entorno. |

---

## 3. Diagrama de Flujo de Datos

Este diagrama ilustra cómo fluye la información a través de la aplicación, desde la interacción del usuario hasta la actualización de la UI.

```mermaid
graph TD
    subgraph "Usuario"
        A[Interactúa con la UI]
    end

    subgraph "Frontend (React / Next.js)"
        B(Componentes Reactivos)
        C{Hooks Selectores Optimizados<br/>(useTransactions, useBalance, etc.)}
        D[Layout / Páginas]
    end

    subgraph "Gestión de Estado (Zustand)"
        G[useAppStore]
        H(Acciones del Store<br/>addTransaction, updateGoal)
    end
    
    subgraph "Lógica de Negocio (Frontend)"
        E[Hooks Personalizados<br/>(useFinancialAnalysis, useSmartCategorization)]
    end
    
    subgraph "Lógica de Negocio (Backend)"
        F[FinancialEngine / BankingEngine]
        J[Flujos de IA (Genkit)]
    end

    subgraph "Persistencia de Datos"
        I(Firebase: Auth, Firestore)
        K[LocalStorage (Modo Invitado)]
    end
    
    A --> B
    B -- Dispara Acción --> H
    H -- Modifica Estado --> G
    C -- Lee Estado --> G
    C -- Provee Datos --> D & B
    B -- Usa Hooks --> E
    E -- Llama a Flujo de Servidor --> J
    J -- Ejecuta lógica de backend y devuelve --> E
    
    subgraph "Cálculos y Análisis"
        E -- Usa FinancialEngine --> F
        F -- Devuelve Análisis --> E
    end
    
    subgraph "Persistencia"
        H -- Si usuario está logueado --> I
        H -- Si usuario es invitado --> K
        G <.-> I
        G <.-> K
    end

    style A fill:#f9f,stroke:#333,stroke-width:2px
    style J fill:#bbf,stroke:#333,stroke-width:2px
    style C fill:#9f9,stroke:#333,stroke-width:2px
    style H fill:#f99,stroke:#333,stroke-width:2px
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
│   ├── transactions/
│   └── login/ & register/ # Páginas de autenticación
├── components/           # Componentes reutilizables
│   ├── auth/
│   │   └── AuthPanel.tsx # Panel UNIFICADO para login y registro
│   ├── assistant/
│   ├── dashboard/        
│   ├── layout/           # ModernLayout flotante y responsivo
│   └── ui/               # Componentes base de shadcn/ui
├── store/                # Gestor de estado global
│   ├── useAppStore.ts    # Cerebro de la aplicación (lógica y estado)
│   └── selectors.ts      # Hooks optimizados para acceder al estado
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

### 4.2. Gestión de Estado Global Optimizada (`useAppStore` y `selectors.ts`)

El estado global, gestionado con Zustand, ha sido refactorizado para máxima eficiencia y para prevenir re-renders innecesarios, uno de los mayores cuellos de botella en aplicaciones React.

**Estrategias de Optimización Clave:**

1.  **Inicialización Robusta:** Se ha implementado un `initializeAuthListener` en el `store` que se ejecuta una sola vez al cargar la aplicación. Este método resuelve de forma segura si el usuario está autenticado o es un invitado **antes** de renderizar cualquier página, eliminando condiciones de carrera y bucles de carga infinitos.
2.  **Selectores Optimizados con `shallow`**: Un archivo dedicado `src/store/selectors.ts` exporta hooks específicos como `useTransactions`. Estos hooks utilizan el comparador `shallow` de Zustand, asegurando que los componentes solo se re-rendericen cuando la porción específica del estado que consumen realmente cambia.
3.  **Cálculo de Balance Centralizado**: El balance se calcula y actualiza directamente en el `store` (`useAppStore.ts`) cada vez que una transacción es modificada, garantizando una única fuente de verdad (`single source of truth`).
4.  **Lógica Robusta en Acciones**: Todas las acciones del store (ej. `addTransaction`) son `async` y manejan la lógica para usuarios registrados (operaciones con Firebase) y para invitados (operaciones con `localStorage`), además de incluir notificaciones `toast` para el feedback al usuario.

### 4.3. Lógica de Negocio y Reglas Financieras

#### `FinancialEngine`
Toda la inteligencia de análisis financiero está encapsulada en `src/engine/FinancialEngine.ts`. Es una clase pura de TypeScript con métodos estáticos que se encargan de analizar los datos del usuario para generar métricas, tendencias, alertas y proyecciones.

**Responsabilidades Clave:**

*   **`runCompleteAnalysis()`**: Orquesta todos los análisis para generar una visión completa del estado financiero.
*   **`calculateFinancialMetrics()`**: Calcula KPIs esenciales como el flujo neto y la tasa de ahorro.
*   **`analyzeTrends()`**: Utiliza regresión lineal simple para detectar tendencias en ingresos o gastos.
*   **`detectAnomalousTransactions()`**: Identifica transacciones de gastos inusualmente altas.
*   **`generateAlerts()`**: Genera un array de alertas proactivas que se muestran en el Dashboard.

#### Lógica de Negocio en el Store y Componentes
Aunque el `FinancialEngine` hace el análisis, las **reglas de negocio transaccionales** se aplican directamente donde ocurren las acciones para garantizar la integridad de los datos.

**Ejemplo Crítico: Abono a Metas**
Se corrigió un fallo crítico que permitía a los usuarios abonar a una meta sin tener saldo suficiente. La función `handleAddFunds` en `src/app/goals/page.tsx` ahora implementa una **regla de negocio estricta**: verifica el balance antes de crear la transacción de gasto, garantizando la consistencia contable del sistema.

---

## 5. Backend y Seguridad "Enterprise"

### 5.1. Firebase
*   **Authentication**: Gestiona el registro, inicio y cierre de sesión de usuarios. El estado de autenticación se sincroniza en tiempo real con el store de Zustand.
*   **Firestore**: Base de datos NoSQL con una estructura escalable.

### 5.2. Arquitectura de Autenticación y Seguridad
Se ha implementado un sistema de seguridad de nivel empresarial para proteger los datos de los usuarios.

1.  **Reglas de Seguridad de Firestore (`firestore.rules`)**:
    *   Se han definido reglas estrictas en el backend. Un usuario **debe estar autenticado y tener su email verificado** para poder leer o escribir en su propia colección de datos.
    *   Cualquier intento de acceso por parte de un usuario no autenticado, no verificado o que intente acceder a datos de otro usuario es **bloqueado a nivel de servidor**.

2.  **Flujo de Verificación de Email Obligatorio (`AuthPanel.tsx`):**
    *   Al registrarse, el usuario recibe un correo de verificación.
    *   La aplicación **no permite el inicio de sesión** si el correo no ha sido verificado, mostrando un mensaje informativo y ofreciendo reenviar el correo.
    *   Se ha implementado un sistema de **auto-detección** que comprueba periódicamente si el usuario ha verificado su correo en otra pestaña, redirigiéndolo automáticamente al dashboard para una experiencia sin fricciones.

3.  **Lógica de Suscripción Segura (`useAppStore.ts`):**
    *   Se corrigió un error crítico donde la aplicación intentaba suscribirse a los datos de Firestore antes de confirmar que el email del usuario estaba verificado.
    *   Ahora, la lógica de `subscribeToUserData` **primero comprueba el estado `emailVerified`** del token de autenticación. Solo si es `true`, procede a establecer la escucha en tiempo real con Firestore, evitando así cualquier error de "permisos insuficientes".

### 5.3. Arquitectura de IA Segura con Genkit
Toda la lógica que interactúa con las APIs de IA (ej. `categorizeTransaction`) reside en los flujos de Genkit (`src/ai/flows/*.ts`). Estos archivos se ejecutan **únicamente en el servidor**, asegurando que las claves de API nunca se expongan al navegador. El frontend llama a estos flujos de forma segura a través de Server Actions de Next.js.

---

## 6. Configuración del Proyecto y Calidad de Código

*   **Cabeceras de Seguridad**: El archivo `next.config.ts` implementa cabeceras HTTP como `X-Frame-Options` y `X-Content-Type-Options` para proteger la aplicación contra ataques comunes.
*   **Scripts Optimizados**: Los scripts en `package.json` han sido optimizados para incluir herramientas de `linting`, formateo y chequeo de tipos, mejorando la calidad del código y la productividad.

---

## 7. Próximos Pasos y Mejoras

*   **Expandir Asistente de IA**:
    *   **Chatbot conversacional**: Permitir al usuario hacer preguntas en lenguaje natural sobre sus finanzas.
*   **Notificaciones Push**: Utilizar Firebase Cloud Messaging para enviar alertas importantes.
*   **Pruebas (Testing)**: Implementar tests unitarios (con Jest/Vitest) para el `FinancialEngine` y `BankingEngine`, y tests E2E (con Playwright/Cypress) para los flujos críticos.
*   **Internacionalización (i18n)**: Adaptar la aplicación para soportar múltiples idiomas y monedas.
