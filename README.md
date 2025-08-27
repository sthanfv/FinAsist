# Informe Técnico del Proyecto: FinAssist

## 1. Descripción General

**FinAssist** es una aplicación web moderna para la gestión de finanzas personales. Permite a los usuarios llevar un control de sus ingresos y gastos, establecer metas de ahorro y recibir recomendaciones financieras inteligentes a través de un asistente de IA.

El proyecto está diseñado para ser funcional tanto para **usuarios registrados** (con persistencia de datos en la nube a través de Firebase) como para **usuarios invitados** (con persistencia de datos en el `localStorage` del navegador), ofreciendo una experiencia de usuario fluida desde la primera visita.

---

## 2. Arquitectura Tecnológica

La aplicación se basa en un stack moderno de JavaScript, priorizando el rendimiento, la escalabilidad y una experiencia de desarrollo ágil.

-   **Framework Principal**: [Next.js 15 (App Router)](https://nextjs.org/)
-   **Lenguaje**: [TypeScript](https://www.typescriptlang.org/)
-   **Estilos**: [Tailwind CSS](https://tailwindcss.com/)
-   **Componentes de UI**: [shadcn/ui](https://ui.shadcn.com/)
-   **Animaciones**: [Framer Motion](https://www.framer.com/motion/)
-   **Backend & Base de Datos**: [Firebase (Firestore & Authentication)](https://firebase.google.com/)
-   **Inteligencia Artificial**: [Genkit (Google AI)](https://firebase.google.com/docs/genkit)
-   **Gestión de Estado**: React Context API

---

## 3. Arquitectura del Frontend

El frontend está estructurado siguiendo las convenciones del App Router de Next.js, lo que permite una organización clara basada en rutas y favorece el uso de Componentes de Servidor.

### 3.1. Estructura de Directorios Clave

```
src/
├── app/                # Rutas de la aplicación (App Router)
│   ├── dashboard/
│   ├── goals/
│   ├── login/
│   ├── register/
│   ├── reports/
│   └── transactions/
├── components/         # Componentes reutilizables
│   ├── auth/
│   ├── assistant/
│   ├── dashboard/
│   ├── goals/
│   ├── reports/
│   ├── transactions/
│   └── ui/             # Componentes base de shadcn/ui
├── context/            # Gestor de estado global
│   └── AppContext.tsx
├── ai/                 # Lógica de IA (Genkit)
│   ├── flows/
│   └── genkit.ts
├── lib/                # Utilidades y configuración
│   ├── firebase.ts
│   └── utils.ts
└── hooks/              # Hooks reutilizables
    └── use-toast.ts
```

### 3.2. Gestión de Estado Global (`AppContext`)

El corazón de la lógica del cliente reside en `src/context/AppContext.tsx`. Este proveedor de contexto es responsable de:

1.  **Autenticación de Usuario**: Maneja el estado de sesión con `onAuthStateChanged` de Firebase.
2.  **Gestión de Datos**: Abstrae toda la lógica de lectura y escritura (CRUD) de transacciones y metas.
3.  **Modo Invitado vs. Registrado**: De forma transparente, decide si usar `localStorage` (para invitados) o `Firestore` (para usuarios registrados) para persistir los datos.

**Fragmento clave de `AppContext.tsx`:**

```tsx
// src/context/AppContext.tsx

// ... (imports)

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactionsState] = useState<Transaction[]>([]);
  const [goals, setGoalsState] = useState<Goal[]>([]);
  // ...

  useEffect(() => {
    // Se suscribe a los cambios de autenticación de Firebase
    const unsubscribeFromAuth = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        // Usuario registrado: Carga datos desde Firestore en tiempo real
        setUser(user);
        const transRef = collection(db, 'users', user.uid, 'transactions');
        const q = query(transRef);
        onSnapshot(q, (snapshot) => {
            const fetchedTransactions = snapshot.docs.map(doc => doc.data() as Transaction);
            setTransactionsState(fetchedTransactions);
        });
        // ... (carga de metas y balance)
      } else {
        // Usuario invitado: Carga datos desde localStorage
        setUser(null);
        try {
            const localData = localStorage.getItem(GUEST_DATA_KEY);
            const guestData = localData ? JSON.parse(localData) : defaultGuestData;
            setTransactionsState(guestData.transactions || []);
            setGoalsState(guestData.goals || []);
        } catch (error) {
            // ...
        }
      }
      setLoading(false);
    });
    // ...
  }, []);

  // ... (Funciones CRUD como addTransaction, deleteTransaction, addGoal, etc.)
};
```

### 3.3. Sistema de Componentes y UI

La interfaz de usuario se construye sobre `shadcn/ui`, lo que proporciona un conjunto de componentes accesibles y personalizables.

-   **Estilo Base**: `src/app/globals.css` contiene las variables de color y estilos base de Tailwind CSS. Es el punto de partida para cualquier ajuste de tema (dark/light mode).
-   **Componentes Reutilizables**: Componentes como `BalanceCard`, `TransactionTable` o `GoalCard` se encuentran en `src/components/` y están diseñados para ser modulares.
-   **Animaciones**: `framer-motion` se utiliza para animaciones de página y microinteracciones en botones y tarjetas, mejorando la experiencia de usuario. Todas las páginas principales están envueltas en un componente `motion.div`.

---

## 4. Arquitectura del Backend (Lógica del Servidor)

El "backend" de esta aplicación es _serverless_ y se apoya completamente en los servicios de Firebase y Genkit.

### 4.1. Firebase

-   **Authentication**: Gestiona el registro e inicio de sesión de usuarios con correo y contraseña.
-   **Firestore**: Es nuestra base de datos NoSQL. La estructura de datos es la siguiente:
    -   `users/{userId}`: Documento principal de cada usuario. Almacena su email, balance y la subcolección de metas.
    -   `users/{userId}/transactions`: Una subcolección donde cada documento representa una única transacción. Este modelo es escalable y permite consultas en tiempo real de manera eficiente.

**Ejemplo de la configuración de Firebase en `src/lib/firebase.ts`:**
```ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  // ... otras claves
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
```

### 4.2. Inteligencia Artificial con Genkit

Utilizamos Genkit para integrar funcionalidades de IA generativa, como las recomendaciones financieras. La lógica está aislada en el directorio `src/ai`.

-   **`src/ai/genkit.ts`**: Inicializa y configura Genkit con el modelo de IA a utilizar (ej: `gemini-2.5-flash`).
-   **`src/ai/flows/*.ts`**: Cada archivo define un "flujo" (`flow`), que es una función del lado del servidor que puede ser llamada desde el cliente. Estos flujos encapsulan la lógica de interactuar con el modelo de lenguaje (LLM).

**Ejemplo de un flujo de recomendación (`recommendationFlow.ts`):**

```ts
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
  prompt: `Eres un asistente financiero experto. Tu objetivo es dar una recomendación corta y útil...
  Saldo actual: {{{balance}}}
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
Los componentes del cliente, como `UnifiedAssistant.tsx`, importan y llaman a `getFinancialRecommendation` directamente. Next.js se encarga de gestionar esta llamada como una Server Action.

---

## 5. Flujo de Datos e Interacción

1.  **Inicio de la App**: `RootLayout` renderiza el `AppProvider`.
2.  **`AppProvider`**: Detecta si hay un usuario de Firebase autenticado.
    -   **Si hay usuario**: Se suscribe a los datos de Firestore en tiempo real.
    -   **Si no hay usuario (invitado)**: Carga los datos desde `localStorage`.
3.  **Componentes**: Consumen los datos (`balance`, `transactions`, `goals`) y las acciones (`addTransaction`, `logout`) desde `useAppContext()`.
4.  **Acciones del Usuario**: Al añadir una transacción, se llama a la función correspondiente de `AppContext`. Esta función actualiza el estado en Firestore o `localStorage` y, gracias a la reactividad, la UI se actualiza automáticamente.
5.  **Interacción con IA**: Un componente de cliente (ej: `UnifiedAssistant`) llama a una función de un flujo de Genkit (ej: `getAdvancedRecommendation`). Next.js ejecuta esta función en el servidor, que a su vez llama a la API de Google AI y devuelve el resultado al cliente.

---

## 6. Posibles Mejoras y Próximos Pasos

Este proyecto tiene una base sólida, pero aquí hay algunas áreas donde se podría mejorar o expandir:

-   **Refinar UI/UX de Reportes**: La página de reportes es funcional pero podría beneficiarse de más tipos de gráficos (líneas de tiempo, etc.) y filtros más avanzados (por fecha, por cuenta).
-   **Notificaciones Push**: Implementar notificaciones (usando Firebase Cloud Messaging) para alertar a los usuarios sobre facturas próximas o cuando se acercan a los límites de su presupuesto.
-   **Tests Unitarios e Integración**: Añadir un framework de testing como Jest o Playwright para asegurar la calidad y estabilidad del código a medida que crece.
-   **Optimización de Carga**: Aunque Next.js hace un gran trabajo, se podría analizar el `bundle` de la aplicación y optimizar la carga de componentes pesados con `React.lazy`.
-   **Más Funcionalidades de IA**:
    -   **Categorización Automática**: Un flujo de Genkit que sugiera una categoría al crear una transacción basándose en la descripción.
    -   **Análisis Predictivo**: Usar IA para predecir gastos futuros o el progreso de las metas de ahorro.
    -   **Chatbot Financiero**: Expandir el asistente a una interfaz conversacional completa.
