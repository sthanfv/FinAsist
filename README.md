
# Informe Técnico del Proyecto: FinAssist

## 1. Descripción General

**FinAssist** es una aplicación web moderna e inteligente para la gestión de finanzas personales. Su objetivo es empoderar a los usuarios para que tomen el control de su bienestar financiero a través de un conjunto de herramientas intuitivas y potentes.

El proyecto está diseñado para ser funcional tanto para **usuarios registrados** (con persistencia de datos en la nube a través de Firebase) como para **usuarios invitados** (con persistencia de datos en el `localStorage` del navegador), ofreciendo una experiencia fluida desde la primera visita.

### 1.1. Características Principales

*   **Gestión de Transacciones**: Registro, edición y eliminación de ingresos y gastos.
*   **Metas de Ahorro**: Creación y seguimiento de objetivos financieros.
*   **Asistente con IA**: Recomendaciones financieras personalizadas (simples y avanzadas) basadas en los datos del usuario.
*   **Dashboard Interactivo**: Visualización rápida del balance, gastos por categoría y estado de las metas.
*   **Simulador Bancario**: Un conjunto de calculadoras profesionales para simular productos como CDTs, préstamos, tarjetas de crédito e inversiones.
*   **Modo Invitado**: Funcionalidad completa sin necesidad de registro, ideal para la primera experiencia.
*   **Autenticación Segura**: Sistema de registro e inicio de sesión con Firebase.
*   **Interfaz Moderna**: Diseño limpio, responsivo y con modo oscuro/claro, construido con las mejores prácticas de UI/UX.

---

## 2. Arquitectura Tecnológica

| Categoría              | Tecnología                                                               | Propósito                                                 |
| ---------------------- | ------------------------------------------------------------------------ | --------------------------------------------------------- |
| **Framework Principal**  | [Next.js 15 (App Router)](https://nextjs.org/)                             | Renderizado híbrido, optimización y estructura de rutas.  |
| **Lenguaje**           | [TypeScript](https://www.typescriptlang.org/)                            | Tipado estático para robustez y escalabilidad.          |
| **Estilos**            | [Tailwind CSS](https://tailwindcss.com/)                                 | Framework CSS utility-first para diseño rápido.           |
| **Componentes de UI**    | [shadcn/ui](https://ui.shadcn.com/)                                      | Componentes accesibles, personalizables y reutilizables.  |
| **Animaciones**        | [Framer Motion](https://www.framer.com/motion/)                          | Animaciones fluidas para una mejor experiencia de usuario.  |
| **Backend & Base de Datos** | [Firebase (Firestore & Authentication)](https://firebase.google.com/) | Autenticación de usuarios y base de datos NoSQL en tiempo real. |
| **Inteligencia Artificial** | [Genkit (Google AI)](https://firebase.google.com/docs/genkit)      | Orquestación de flujos de IA generativa.                  |
| **Gestión de Estado**    | [Zustand](https://github.com/pmndrs/zustand)                             | Gestor de estado global simple, rápido y escalable.       |
| **Lógica de Negocio**  | **Motores Propios (`BankingEngine`, `FinancialEngine`)**                 | Encapsulación de cálculos complejos y análisis.         |

---

## 3. Diagrama de Flujo de Datos

Este diagrama ilustra cómo fluye la información a través de la aplicación, desde la interacción del usuario hasta la actualización de la UI.

```mermaid
graph TD
    subgraph "Usuario"
        A[Interactúa con la UI]
    end
    subgraph "Frontend (React / Next.js)"
        B(Componentes de UI)
        C{useAppStore (Zustand)}
        D[Layout / Páginas]
    end
    subgraph "Lógica de Negocio"
        E[BankingEngine.ts]
        F[FinancialEngine.ts]
        G[Acciones de Zustand]
    end
    subgraph "Backend & Servicios"
        H(Firebase Auth)
        I(Firestore DB)
        J(Genkit Flows / Google AI)
        K[LocalStorage]
    end
    A --> B
    B --> G
    G --> C
    C --> D
    D --> B
    G -- Llama a --> J
    J -- Devuelve a --> B
    G -- Llama a --> E
    G -- Llama a --> F
    E -- Devuelve a --> B
    F -- Devuelve a --> B
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
│   ├── calculators/      # Nueva sección de calculadoras
│   └── (otras rutas...)
├── components/           # Componentes reutilizables
│   ├── auth/
│   ├── assistant/
│   ├── calculators/      # Componentes para cada calculadora
│   └── ui/               # Componentes base de shadcn/ui
├── store/                # Gestor de estado global
│   └── useAppStore.ts    # Hook y lógica de Zustand
├── engine/               # Lógica de negocio pura (sin dependencias de UI)
│   ├── BankingEngine.ts  # Cálculos para productos bancarios
│   └── FinancialEngine.ts# Análisis y proyecciones financieras
├── ai/                   # Lógica de IA (Genkit)
│   ├── flows/            # Flujos que interactúan con LLMs
│   └── genkit.ts         # Configuración de Genkit
└── lib/                  # Utilidades y configuración de servicios
    ├── firebase.ts
    └── utils.ts
```

### 4.2. Gestión de Estado Global (`useAppStore` con Zustand)

El estado global de la aplicación se gestiona de manera centralizada en `src/store/useAppStore.ts`. Zustand fue elegido por su simplicidad y rendimiento. El *store* es el corazón de la lógica de la aplicación.

**Responsabilidades Clave:**

1.  **Fuente Única de Verdad**: Mantiene el estado de `user`, `transactions`, `goals` y `balance`.
2.  **Abstracción de Persistencia**: Contiene toda la lógica para decidir si los datos se guardan en **Firestore** (para usuarios registrados) o en **LocalStorage** (para invitados). Esto es transparente para los componentes de la UI.
3.  **Acciones de Datos**: Proporciona funciones asíncronas (`addTransaction`, `addGoal`, etc.) que los componentes llaman para modificar el estado. Estas funciones manejan la comunicación con el backend.
4.  **Sincronización en Tiempo Real**: Utiliza `onSnapshot` de Firebase para escuchar cambios en la base de datos y actualizar el estado de Zustand automáticamente, lo que a su vez actualiza la UI de forma reactiva.
5.  **Inicialización de la App**: Maneja el flujo de carga inicial, comprobando el estado de autenticación y cargando los datos correspondientes antes de renderizar la aplicación principal.

**Fragmento clave de `useAppStore.ts`:**

```typescript
// src/store/useAppStore.ts
export const useAppStore = create<AppState>()(
  subscribeWithSelector(
    persist(
      immer((set, get) => ({
        // ... estado inicial ...
        
        addTransaction: async (transactionData) => {
          const { user } = get();
          // ...
          if (user) {
            // Lógica para guardar en Firestore
            await addDoc(collection(db, 'users', user.uid, 'transactions'), newTransaction);
          } else {
            // Lógica para guardar en el estado y luego en LocalStorage
            set((state) => {
              state.transactions.push({ ...newTransaction, id: `${Date.now()}` });
            });
            get().saveGuestData();
          }
          get().calculateBalance();
        },

        initializeApp: () => {
          const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            get().setUser(user);
            if (user) {
              // Si hay usuario, nos suscribimos a los datos de Firestore
              const unsubscribeData = get().subscribeToUserData();
              // ...
            } else {
              // Si no, cargamos del LocalStorage
              get().loadGuestData();
              // ...
            }
          });
          return unsubscribeAuth;
        },

        // ... otras acciones y lógica ...
      })),
      // ... configuración de persistencia ...
    )
  )
);
```

### 4.3. Sistema de Componentes y UI

*   **Base**: `shadcn/ui` proporciona un conjunto de componentes base (Botones, Inputs, Cards, etc.) que son accesibles y totalmente personalizables. No se importan como una librería, sino que el código de cada componente reside en `src/components/ui`, permitiendo una modificación directa.
*   **Estilo y Tema**:
    *   **Variables CSS**: El archivo `src/app/globals.css` define las variables de color HSL para los modos claro y oscuro. La personalización del tema se realiza aquí.
    *   **Tailwind CSS**: Se utiliza para todo el estilizado. Las clases de utilidad permiten construir interfaces complejas de forma rápida y mantenible.
    *   **Sombras y Bordes**: Se utilizan sombras suaves (`shadow-soft`) y bordes redondeados (`rounded-xl`) de manera consistente para dar a la UI un aspecto moderno y limpio.
*   **Componentes Reutilizables**: Componentes como `TransactionTable` o `GoalCard` se han diseñado para ser modulares y recibir datos a través de props, desacoplándolos de la lógica de obtención de datos.
*   **Layout Principal (`layout.tsx`)**: Es el componente que envuelve todas las páginas. Contiene la barra lateral de navegación (sidebar), la cabecera superior (header) y gestiona su visibilidad y comportamiento en dispositivos móviles y de escritorio.

---

## 5. Lógica de Negocio: Los Motores Financieros

Para mantener el código limpio y separar las responsabilidades, toda la lógica de cálculo y análisis financiero complejo se ha encapsulado en "motores" de TypeScript. Son clases puras, sin dependencias de React o de la UI.

### 5.1. `BankingEngine.ts`

Este motor contiene toda la matemática financiera necesaria para las calculadoras. Proporciona métodos para simular productos bancarios complejos.

*   `calculateCDT()`: Calcula el rendimiento de un CDT, incluyendo la tasa efectiva anual.
*   `calculateLoan()`: No solo calcula la cuota mensual de un préstamo, sino que genera una **tabla de amortización completa** (sistema francés), detallando qué parte de cada pago va a capital e interés.
*   `simulateCreditCard()`: Compara **tres escenarios de pago** (mínimo, personalizado y completo) para demostrar el impacto devastador de los intereses y el beneficio de pagar más del mínimo.
*   `calculateInvestment()`: Proyecta el crecimiento de una inversión con aportes mensuales, mostrando el poder del **interés compuesto** año a año.
*   `calculateFinancialFreedom()`: Utiliza la **"Regla del 4%"** para estimar el capital necesario para la independencia financiera y el tiempo que tomará alcanzarlo.

### 5.2. `FinancialEngine.ts`

Este motor se enfoca en analizar los datos propios del usuario (transacciones y metas) para ofrecer información valiosa. *Actualmente está definido pero su integración completa es un próximo paso.*

*   `calculateFinancialMetrics()`: Calcula KPIs como el flujo neto, la tasa de ahorro y el "burn rate" (meses de supervivencia con los ahorros actuales).
*   `analyzeTrends()`: Utiliza **regresión lineal** para detectar si los ingresos o gastos están creciendo y calcula la volatilidad de los gastos.
*   `assessRiskProfile()`: Genera un **puntaje de salud financiera (0-100)** y un nivel de riesgo (Bajo, Medio, Alto, Crítico) basado en la tasa de ahorro y el fondo de emergencia.

---

## 6. Backend y Servicios

### 6.1. Firebase

*   **Authentication**: Gestiona el registro e inicio de sesión de usuarios con correo y contraseña.
*   **Firestore**: Es la base de datos NoSQL. La estructura de datos es escalable y eficiente:
    *   `users/{userId}/transactions`: Subcolección con las transacciones del usuario.
    *   `users/{userId}/goals`: Subcolección con las metas de ahorro.

### 6.2. Inteligencia Artificial con Genkit

La IA se gestiona a través de Genkit, que orquesta las llamadas a los modelos de Google AI.

*   **`src/ai/genkit.ts`**: Configura e inicializa Genkit, especificando el modelo a usar (ej. `gemini-2.5-flash`).
*   **`src/ai/flows/*.ts`**: Cada archivo define un "flujo", que es una función del lado del servidor invocada desde el cliente como una Server Action.
    *   **`recommendationFlow.ts`**: Genera un consejo rápido y conciso.
    *   **`advancedRecommendationFlow.ts`**: Toma transacciones, metas y balance para generar un análisis más profundo y una lista de recomendaciones.

**Ejemplo de un flujo (`recommendationFlow.ts`):**

```typescript
'use server';
// ... (imports y schemas de Zod)

export async function getFinancialRecommendation(input: RecommendationInput): Promise<RecommendationOutput> {
  return recommendationFlow(input);
}

// Define el prompt que se enviará al LLM
const prompt = ai.definePrompt({
  name: 'recommendationPrompt',
  input: { schema: RecommendationInputSchema },
  output: { schema: RecommendationOutputSchema },
  prompt: `Eres un asistente financiero experto. Analiza los datos y da una recomendación corta.
  Saldo: {{{balance}}}
  Transacciones:
  {{#each transactions}}
  - Categoría: {{{category}}}, Monto: {{{amount}}}, Tipo: {{{type}}}
  {{/each}}
  `,
});

// Define el flujo que se ejecuta en el servidor
const recommendationFlow = ai.defineFlow(
  {
    name: 'recommendationFlow',
    inputSchema: RecommendationInputSchema,
    outputSchema: RecommendationOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
```

---

## 7. Próximos Pasos y Mejoras

*   **Integrar `FinancialEngine`**: Conectar el motor de análisis a un nuevo componente en el Dashboard para mostrar el score de salud financiera y las proyecciones.
*   **Expandir Asistente de IA**:
    *   **Categorización automática**: Sugerir una categoría al crear una transacción.
    *   **Chatbot conversacional**: Permitir al usuario hacer preguntas en lenguaje natural sobre sus finanzas.
*   **Reportes Avanzados**: Añadir más gráficos (líneas de tiempo, tendencias) y filtros por rangos de fechas.
*   **Pruebas (Testing)**: Implementar tests unitarios (con Jest) para los motores y componentes, y tests E2E (con Playwright) para los flujos críticos.
*   **Notificaciones**: Utilizar Firebase Cloud Messaging para alertar sobre facturas próximas o hitos de metas.

    