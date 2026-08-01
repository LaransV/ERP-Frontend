# ERP Frontend — Restructuring Guide
## Frontend-SampleCode Pattern Implementation

---

## 1. பழைய Structure vs புதிய Structure (Before vs After)

### ERP-FrontEnd (பழையது — Before)
```
src/
├── lib/
│   └── api/
│       ├── client.ts          ← Axios instance (direct)
│       └── services.ts        ← ALL API calls ஒரே file-ல (monolith)
├── hooks/
│   └── useApi.ts              ← ALL hooks ஒரே file-ல (monolith)
├── store/
│   ├── authStore.ts           ← Zustand
│   └── themeStore.ts
├── app/
│   ├── (auth)/login/page.tsx  ← Business logic INSIDE page component
│   └── (erp)/finance/invoices/page.tsx  ← 150+ line page with logic
└── types/
    └── index.ts
```

### ERP-FrontEnd (புதியது — After, Sample Pattern)
```
src/
├── types/
│   └── api.ts                 ← APIConfig type (config object pattern)
│
├── services/api/              ← Pure API config objects (no axios calls)
│   ├── auth.ts
│   ├── finance.ts
│   ├── hr.ts
│   ├── inventory.ts
│   ├── crm.ts
│   └── admin.ts
│
├── schemas/                   ← Zod validation schemas
│   ├── template/response.ts   ← Base TResponse shape
│   ├── auth/
│   │   ├── request.ts
│   │   └── response.ts
│   ├── finance/
│   │   ├── request.ts
│   │   └── response.ts
│   ├── hr/
│   │   ├── request.ts
│   │   └── response.ts
│   ├── inventory/
│   │   ├── request.ts
│   │   └── response.ts
│   └── crm/
│       ├── request.ts
│       └── response.ts
│
├── hooks/                     ← Generic reusable hooks
│   ├── useQuery/
│   │   ├── index.ts           ← Generic GET hook
│   │   └── declaration.ts
│   ├── useMutation/
│   │   ├── index.ts           ← Generic POST/PUT/DELETE hook
│   │   └── declaration.ts
│   └── useFormHandler/
│       └── index.ts           ← react-hook-form + zod wrapper
│
├── utils/
│   ├── apiEndpointParser.ts   ← /invoices/{id} → /invoices/42
│   └── api/
│       ├── fetchClientSide.ts ← Core axios fetcher (shared by hooks)
│       └── declaration.ts
│
├── modules/                   ← Feature modules (main UI logic)
│   ├── auth/login/
│   │   ├── index.tsx          ← Page component (thin, no logic)
│   │   ├── components/
│   │   │   └── loginForm.tsx
│   │   ├── hooks/
│   │   │   ├── useLogic.ts    ← API calls, navigation, callbacks
│   │   │   └── useFormHandle.ts ← Form state, validation
│   │   ├── declaration.ts     ← Module-local types
│   │   └── constants.ts       ← Loading keys, enums
│   ├── finance/invoices/      ← Same structure ↑
│   ├── hr/employees/          ← Same structure ↑
│   ├── inventory/stock/       ← Same structure ↑
│   └── crm/leads/             ← Same structure ↑
│
└── app/                       ← Next.js App Router (thin wrappers only)
    ├── (auth)/login/page.tsx  ← import LoginModule; return <LoginModule />
    └── (erp)/finance/invoices/page.tsx  ← import InvoicesModule; return <InvoicesModule />
```

---

## 2. Core Pattern — Data Flow

```
User Action
    ↓
Module index.tsx          (presentation only — no direct API calls)
    ↓
hooks/useLogic.ts         (business logic — calls useQuery/useMutation)
    ↓
hooks/useQuery.ts or      (generic hooks — schema validation, token, logout)
hooks/useMutation.ts
    ↓
utils/api/fetchClientSide.ts  (axios call — parses through Zod response schema)
    ↓
services/api/finance.ts   (APIConfig object — endPoint, method, keys, accessToken)
    ↓
Backend API
```

---

## 3. 3 Key Rules — Sample Pattern

### Rule 1: services/api/ = Config Objects Only (No Axios)

**❌ பழைய ERP pattern (services.ts):**
```typescript
// lib/api/services.ts — axios call நேரடியா
export const invoicesApi = {
  list: (p?: object) => api.get<ApiResponse<PagedData<Invoice>>>('/finance/invoices', { params: p }),
  create: (d: Partial<Invoice>) => api.post<ApiResponse<Invoice>>('/finance/invoices', d),
};
```

**✅ புதிய Sample pattern (services/api/finance.ts):**
```typescript
// services/api/finance.ts — plain config object மட்டும்
export const getInvoices: APIConfig = {
  endPoint: '/finance/invoices',
  keys: ['finance-invoices'],    // React Query cache key
  method: 'GET',
  accessToken: true,
};

export const postInvoice: APIConfig = {
  endPoint: '/finance/invoices',
  keys: ['finance-invoice-create'],
  method: 'POST',
  accessToken: true,
};

export const putInvoice: APIConfig = {
  endPoint: '/finance/invoices/{id}',   // {id} → parseApiEndpoint replaces
  keys: ['finance-invoice-update'],
  method: 'PUT',
  accessToken: true,
};
```

### Rule 2: schemas/ = Zod Validation (Request + Response)

**❌ பழைய ERP pattern:**
```typescript
// types/index.ts — plain TypeScript types, no runtime validation
export interface Invoice {
  invoiceId: number;
  invoiceNumber: string;
  // ...
}
```

**✅ புதிய Sample pattern (schemas/finance/response.ts):**
```typescript
// Runtime validation — backend data automatically validated
const InvoiceSchema = z.object({
  invoiceId: z.number(),
  invoiceNumber: z.string(),
  grandTotal: z.number(),
  status: z.string(),
  // ...
});

export const InvoicesRes = BaseResponse.extend({
  data: PagedSchema(InvoiceSchema).nullable().optional()
});

export type TInvoice = z.infer<typeof InvoiceSchema>;  // Type auto-generated
```

### Rule 3: Module = index + components/ + hooks/ + declaration + constants

**❌ பழைய ERP pattern:**
```typescript
// app/(erp)/finance/invoices/page.tsx — everything in one file
'use client';
export default function InvoicesPage() {
  const [statusFilter, setStatus] = useState('');           // state
  const { data, isLoading } = useInvoices({ ... });         // API call
  const deleteMutation = useDeleteInvoice();                 // mutation
  const columns: ColumnDef<Invoice>[] = [ ... ];            // columns
  const handleDelete = async (id, e) => { ... };            // handlers
  return ( ... );                                            // JSX
}
```

**✅ புதிய Sample pattern:**
```typescript
// modules/finance/invoices/hooks/useLogic.ts — business logic
export const useInvoicesLogic = () => {
  const { data } = useQuery({ apiConfig: getInvoices, responseSchema: InvoicesRes });
  const { mutate } = useMutation({ apiConfig: deleteInvoice, ... });
  // handlers, navigation, state
  return { invoices, handleDelete, handleNavigateNew, ... };
};

// modules/finance/invoices/index.tsx — pure presentation
export default function InvoicesModule() {
  const { invoices, handleDelete, ... } = useInvoicesLogic();  // only this hook
  return ( ... );  // JSX only
}

// app/(erp)/finance/invoices/page.tsx — 3 lines
import InvoicesModule from '@/modules/finance/invoices';
export default function Page() { return <InvoicesModule />; }
```

---

## 4. APIConfig Type

```typescript
// src/types/api.ts
export type APIConfig = {
  keys: string[];                              // React Query cache key
  endPoint: string;                            // '/finance/invoices/{id}'
  method: 'GET' | 'PUT' | 'POST' | 'DELETE' | 'PATCH';
  accessToken?: boolean;                       // true = Bearer token attach
  headers?: Record<string, string>;            // Extra headers
};
```

---

## 5. Generic Hooks Usage

### useQuery — Data Fetching
```typescript
// Module-level usage inside useLogic.ts
const { data, isLoading } = useQuery({
  apiConfig: getInvoices,          // APIConfig object
  requestSchema: InvoiceListReq,   // Zod schema for query params
  responseSchema: InvoicesRes,     // Zod schema for response
  payload: { status: 'DRAFT', size: 50 },  // query params
  onSuccess: (res) => console.log(res.data),
  onError: (res) => toast.error(res.message),
});
```

### useMutation — Create / Update / Delete
```typescript
const { mutate, isPending } = useMutation({
  apiConfig: postInvoice,          // APIConfig object
  requestSchema: InvoiceReq,       // Zod schema validates payload
  responseSchema: InvoiceRes,      // Zod schema validates response
  parameters: { id: invoiceId },   // For {id} in endPoint
  onSuccess: (res) => {
    queryClient.invalidateQueries({ queryKey: getInvoices.keys });
    toast.success('Invoice created');
  },
  onError: (res) => toast.error(res.message),
});

// Usage
mutate({ clientId: 1, invoiceDate: '2026-01-01', items: [...] });
```

### useFormHandler — Form with Zod Validation
```typescript
// hooks/useFormHandle.ts inside a module
export const useFormInvoice = () => {
  const { control, handleSubmit, setError, formState: { errors } } =
    useFormHandler<TInvoiceReq>({ validationSchema: InvoiceSchema });

  return { control, handleSubmit, errors, setError };
};
```

---

## 6. URL Parameter Handling

```typescript
// services/api/finance.ts
export const putInvoice: APIConfig = {
  endPoint: '/finance/invoices/{id}',   // {id} placeholder
  keys: ['finance-invoice-update'],
  method: 'PUT',
  accessToken: true,
};

// hooks/useLogic.ts
const { mutate } = useMutation({
  apiConfig: putInvoice,
  parameters: { id: invoiceId },        // {id} → 42 → /finance/invoices/42
  requestSchema: InvoiceReq,
  responseSchema: InvoiceRes,
});
```

---

## 7. New Module Create பண்ண — Step-by-Step Checklist

புதுசா ஒரு feature add பண்ண (e.g., `finance/receipts`):

```
Step 1: services/api/finance.ts ல் APIConfig add பண்ணு
        → getReceipts, postReceipt, putReceipt, deleteReceipt

Step 2: schemas/finance/request.ts ல் Zod request schema add பண்ணு
        → ReceiptSchema, ReceiptReq, TReceiptReq

Step 3: schemas/finance/response.ts ல் Zod response schema add பண்ணு
        → ReceiptRes, ReceiptsRes, TReceipt

Step 4: modules/finance/receipts/ folder create பண்ணு
        ├── declaration.ts     (local types)
        ├── constants.ts       (loading keys, filter options)
        ├── hooks/
        │   ├── useLogic.ts    (useQuery, useMutation, handlers)
        │   └── useFormHandle.ts (useFormHandler + ReceiptSchema)
        ├── components/
        │   └── receiptForm.tsx (pure UI, props only)
        └── index.tsx          (wires hooks, returns JSX)

Step 5: app/(erp)/finance/receipts/page.tsx — 3 lines
        import ReceiptsModule from '@/modules/finance/receipts';
        export default function Page() { return <ReceiptsModule />; }
```

---

## 8. File Naming Convention

| File | Purpose |
|------|---------|
| `declaration.ts` | Module-local TypeScript types |
| `constants.ts` | Loading keys, enum values, label maps |
| `hooks/useLogic.ts` | API calls, navigation, state, handlers |
| `hooks/useFormHandle.ts` | Form state + validation only |
| `components/*.tsx` | Pure presentational components (props in, JSX out) |
| `index.tsx` | Orchestrator — wires hooks + components |
| `schemas/*/request.ts` | Zod schemas for API request payloads |
| `schemas/*/response.ts` | Zod schemas for API response data |
| `services/api/*.ts` | APIConfig objects — no axios, no logic |

---

## 9. இல்லாத Files — Keep As Is (No Change Needed)

These existing ERP files are **fine to keep unchanged**:
- `src/store/authStore.ts` — Zustand auth store ✅
- `src/store/themeStore.ts` — Zustand theme store ✅
- `src/components/shared/` — Shared UI components ✅
- `src/components/layout/` — Layout components ✅
- `src/middleware.ts` — Auth middleware ✅
- `src/app/globals.css` — Global styles ✅
- `tailwind.config.js` ✅

---

## 10. Delete / Replace These Files

After migration complete, இந்த files remove பண்ணலாம்:

```
❌ src/lib/api/client.ts       → utils/api/fetchClientSide.ts-ல் merge ஆச்சு
❌ src/lib/api/services.ts     → services/api/*.ts files-ல் split ஆச்சு
❌ src/hooks/useApi.ts         → hooks/useQuery + hooks/useMutation replace பண்ணிடுச்சு
```

---

## 11. Package Dependencies (புதுசா வேண்டியவை)

```bash
npm install zod @hookform/resolvers react-hook-form
# (these may already be installed — verify in package.json)
```

Existing packages that stay:
- `@tanstack/react-query` ✅ (useQuery / useMutation இன்னும் use பண்றோம்)
- `axios` ✅ (fetchClientSide.ts-ல் use பண்றோம்)
- `zustand` ✅ (authStore, themeStore)
- `sonner` ✅ (toast notifications)
