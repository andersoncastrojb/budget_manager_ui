# Budget Manager - Frontend UI

Aplicación para la gestión financiera personal, construida con Next.js (App Router), TypeScript, Tailwind CSS y React Query.

## 🚀 Inicio Rápido

### Requisitos Previos
- Node.js 18+ (preferiblemente v20 LTS)
- npm o yarn
- Una instancia en ejecución del backend de Budget Manager (Java Spring Boot)

### Instalación

1. **Clonar o navegar al proyecto**
```
cd budget_manager_ui
```

2. **Instalar dependencias**
```
npm install
```


3. **Configurar el entorno**
```
cp .env.example .env.local
```


Actualiza `.env.local` con la URL de tu API del backend:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```


4. **Iniciar el servidor de desarrollo**
```
npm run dev
```


La aplicación estará disponible en `http://localhost:3000`

## 📋 Estado Actual del Proyecto y Características

La aplicación cuenta actualmente con un panel de control (dashboard) totalmente interactivo, respaldado por React Query para una gestión de estado optimizada y operaciones CRUD fluidas.

### ✨ Panel Dinámico y Control de Períodos

* **Selector de Períodos Elegante:** Filtra métricas y listas dinámicamente eligiendo un mes y año de procesamiento específico (ej. Febrero 2026).
* **Métricas en Tiempo Real:** Cálculo instantáneo del **Balance Total**, **Ingresos Filtrados**, **Gastos Filtrados** y **Préstamos Activos** adaptados al período seleccionado.

### 🏦 Gestión Completa de Entidades (CRUD)

Una interfaz unificada basada en modales que permite crear, editar y eliminar entidades financieras nativamente desde el dashboard:

* **Cuentas (Accounts):** Gestiona múltiples saldos y tipos de cuentas (ej. Ahorros).
* **Control de Ingresos (Income):** Registra ingresos con categorización (Salario, Bono, Freelance, etc.) y fechas de depósito específicas.
* **Gastos Fijos (Fixed Expenses):** Administra gastos recurrentes con restricciones de límites de fechas (validación de Fecha de Inicio/Fin).
* **Seguimiento de Préstamos (Loans):** Rastrea prestamistas, montos totales, períodos de seguimiento y estado en tiempo real (Pendiente, Pagado).

### 🔒 Seguridad y Arquitectura

* **Integración con React Query:** Ciclos de vida de invalidación de consultas completos para garantizar que la interfaz refleje los cambios de la base de datos al instante.
* **Cargas con Tipado Seguro:** Uso extensivo de TypeScript aplicando interfaces estrictas (`EntityPayload`, `ModalState`) en todos los formularios.
* **Manejo de CSRF y Tokens:** Integración segura de tokens mediante cookies HttpOnly manejadas por la estructura del backend.
* **Límites de Errores (Error Boundaries):** Validaciones fluidas del lado del cliente y componentes de alerta de errores unificados que protegen la estabilidad de la interfaz de usuario.

## 🏗️ Estructura del Proyecto

```
src/
├── domain/                          # Lógica de negocio empresarial
│   ├── entities/                    # Interfaces del dominio central
│   │   └── index.ts                 # User, Account, Income, FixedExpense, Loan
│   └── repositories/                # Contratos de acceso a datos
├── application/                     # Capa de lógica de aplicación
│   ├── hooks/                       # Hooks de React Query (useUserData)
│   ├── schemas/                     # Esquemas de validación de Zod
│   └── context/                     # Proveedores de contexto (QueryClientProvider)
├── infrastructure/                  # Servicios externos
│   ├── api/                         # Cliente HTTP con interceptores
│   │   └── repositories/            # Implementación de repositorios de la API
│   └── mappers/                     # Definiciones de mapeo de errores
├── presentation/                    # Componentes de UI y páginas
│   ├── components/
│   │   ├── common/                  # Componentes de UI reutilizables (Botones, Modales)
│   │   ├── layout/                  # Layout general de la aplicación
│   │   └── dashboard/               # Panel principal con control de período activo
│   └── [routes]/                    # Páginas del App Router de Next.js
├── shared/                          # Utilidades compartidas
│   ├── utils/
│   │   └── formatters.ts            # Utilidades de formato (ej. Formato de moneda)
│   └── constants/
├── app/                             # Raíz del App Router de Next.js
```

## 🛠️ Tecnologías Utilizadas

* **Framework:** Next.js (React 18)
* **Estilos:** Tailwind CSS
* **Obtención de Datos:** `@tanstack/react-query` v5
* **Cliente HTTP:** Axios
