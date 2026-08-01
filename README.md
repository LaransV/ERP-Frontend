# ERP Frontend — Refactored Architecture

> **Sample Code pattern-ku match aana pudhu structure.**  
> DB calling, API handling, data handling, folder & file structure — ellaame maathi irukku.

---

## 1. என்ன மாத்தோம்? (What Changed)

| Area | பழைய ERP (Before) | புது Pattern (After) |
|---|---|---|
| **API Config** | `src/lib/api/client.ts` — axios instance directly | `src/types/api.ts` → `APIConfig` objects |
| **API Services** | `src/lib/api/services.ts` — ஒரே file-la எல்லா API calls | `src/services/api/[module].ts` — per-module config files |
| **Hooks** | `src/hooks/useApi.ts` — ஒரே மகா file | `src/hooks/useQuery/` + `src/hooks/useMutation/` — generic typed hooks |
| **Form** | Direct `useState` + `useForm` in page | `src/hooks/useFormHandler/` + per-module `useFormHandle.ts` |
| **Schema Validation** | இல்லவே இல்ல | `src/schemas/[module]/request.ts` + `response.ts` — Zod |
| **Business Logic** | Pages-la direct | `src/modules/.../hooks/useLogic.ts` |
| **Pages** | Fat pages with everything | Thin wrappers — just imports module |
| **Types** | `src/types/index.ts` — one giant file | `src/schemas/[module]/response.ts` — Zod inferred types |

---

## 2. புது Folder Structure

```
src/
├── types/
│   └── api.ts                        ← APIConfig type definition
│
├── schemas/                          ← Zod schemas (validation + types)
│   ├── template/
│   │   └── response.ts               ← BaseResponse, PagedSchema
│   ├── auth/
│   │   ├── request.ts                ← LoginSchema, LoginReq
│   │   └── response.ts               ← LoginRes, TAuthUser
│   ├── finance/
│   │   ├── request.ts                ← InvoiceSchema, ClientSchema, ProductSchema
│   │   └── response.ts               ← InvoicesRes, TInvoice, TClient...
│   ├── hr/
│   │   ├── request.ts
│   │   └── response.ts
│   ├── inventory/
│   │   └── request.ts                ← (request + response combined ok)
│   └── crm/
│       └── request.ts
│
├── services/                         ← API Config objects ONLY (no axios calls)
│   └── api/
│       ├── auth.ts                   ← postLogin, getMe, getCompanies
│       ├── finance.ts                ← getInvoices, postInvoice, deleteInvoice...
│       ├── hr.ts                     ← getEmployees, postEmployee...
│       ├── inventory.ts              ← getStock, getPurchaseOrders...
│       ├── crm.ts                    ← getLeads, postLead...
│       └── admin.ts                  ← getUsers, getRoles, getModules...
│
├── utils/
│   ├── apiEndpointParser.ts          ← parseApiEndpoint({id} replacer)
│   └── api/
│       ├── declaration.ts            ← FetchClientSideProps type
│       └── fetchClientSide.ts        ← Core axios fetcher (ONE place)
│
├── hooks/                            ← Generic reusable hooks
│   ├── useMutation/
│   │   ├── index.ts                  ← Generic useMutation<Req, Res>
│   │   └── declaration.ts
│   ├── useQuery/
│   │   ├── index.ts                  ← Generic useQuery<Req, Res>
│   │   └── declaration.ts
│   └── useFormHandler/
│       └── index.ts                  ← useForm + zodResolver wrapper
│
├── modules/                          ← Feature modules (main UI logic lives here)
│   ├── auth/
│   │   └── login/
│   │       ├── index.tsx             ← Main component (orchestrator)
│   │       ├── declaration.ts        ← Module-local types
│   │       ├── constants.ts          ← LOADING_KEY, etc.
│   │       ├── components/
│   │       │   └── loginForm.tsx     ← Pure UI component
│   │       └── hooks/
│   │           ├── useFormHandle.ts  ← Form state + validation
│   │           └── useLogic.ts       ← API call + navigation logic
│   │
│   ├── finance/
│   │   ├── invoices/
│   │   │   ├── index.tsx
│   │   │   ├── declaration.ts
│   │   │   ├── constants.ts
│   │   │   ├── components/
│   │   │   └── hooks/
│   │   │       └── useLogic.ts
│   │   ├── clients/  (same pattern)
│   │   └── products/ (same pattern)
│   │
│   ├── hr/
│   │   ├── employees/
│   │   ├── attendance/
│   │   └── payroll/
│   │
│   ├── inventory/
│   │   ├── stock/
│   │   └── orders/
│   │
│   ├── crm/
│   │   ├── leads/
│   │   ├── followups/
│   │   └── activities/
│   │
│   └── admin/
│       ├── users/
│       ├── roles/
│       └── companies/
│
└── app/                              ← Next.js pages (THIN wrappers only)
    ├── (auth)/
    │   └── login/
    │       └── page.tsx              ← import LoginModule from '@/modules/auth/login'
    └── (erp)/
        ├── finance/
        │   └── invoices/
        │       └── page.tsx          ← import InvoicesModule from '@/modules/finance/invoices'
        ├── hr/employees/page.tsx
        ├── inventory/stock/page.tsx
        └── crm/leads/page.tsx
```

---

## 3. Data Flow (எப்படி வேலை செய்யுது)

```
User Action
    │
    ▼
module/[feature]/index.tsx          ← Thin orchestrator (just wires hooks)
    │
    ├── hooks/useFormHandle.ts      ← Form state (react-hook-form + Zod)
    │       └── useFormHandler()    ← src/hooks/useFormHandler/index.ts
    │
    └── hooks/useLogic.ts           ← Business logic
            │
            ├── useMutation()       ← src/hooks/useMutation/index.ts
            │   or useQuery()       ← src/hooks/useQuery/index.ts
            │       │
            │       ├── apiConfig   ← src/services/api/[module].ts  (just metadata)
            │       ├── requestSchema  ← src/schemas/[module]/request.ts  (Zod)
            │       └── responseSchema ← src/schemas/[module]/response.ts (Zod)
            │               │
            │               ▼
            │       fetchClientSide()   ← src/utils/api/fetchClientSide.ts
            │               │
            │               ├── parseApiEndpoint()   ← replaces {id} in URL
            │               ├── axiosClient.request() ← actual HTTP call
            │               └── responseSchema.parse() ← Zod validation
            │
            └── authStore / router / toast  ← side effects
```

---

## 4. ஒரு புது Feature எப்படி Add பண்றது?

**Example: CRM Contacts module**

### Step 1 — API Config (services/api/crm.ts-la add பண்ணு)
```typescript
export const getContacts: APIConfig = {
  endPoint: '/crm/contacts',
  keys: ['crm-contacts'],
  method: 'GET',
  accessToken: true,
};

export const postContact: APIConfig = {
  endPoint: '/crm/contacts',
  keys: ['crm-contact-create'],
  method: 'POST',
  accessToken: true,
};
```

### Step 2 — Zod Schema (schemas/crm/request.ts-la add பண்ணு)
```typescript
export const ContactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email(),
  phone: z.string().optional(),
  leadId: z.number().optional(),
});

export const ContactReq = ContactSchema;
export type TContactReq = z.infer<typeof ContactSchema>;
```

### Step 3 — Module Folder உருவாக்கு
```
src/modules/crm/contacts/
├── index.tsx          ← Main component
├── declaration.ts     ← TContactFilters, etc.
├── constants.ts       ← CONTACTS_LOADING_KEY
├── components/
│   └── contactForm.tsx
└── hooks/
    ├── useFormHandle.ts   ← useFormHandler({ validationSchema: ContactSchema })
    └── useLogic.ts        ← useQuery + useMutation
```

### Step 4 — useLogic.ts
```typescript
export const useContactsLogic = () => {
  const { data, isLoading } = useQuery({
    apiConfig: getContacts,
    responseSchema: ContactsRes,
  });

  const { mutate, isPending } = useMutation({
    apiConfig: postContact,
    requestSchema: ContactReq,
    responseSchema: ContactRes,
    onSuccess: () => toast.success('Contact created'),
  });

  return { contacts: data?.data?.content ?? [], isLoading, createContact: mutate, isPending };
};
```

### Step 5 — Page (thin wrapper)
```typescript
// src/app/(erp)/crm/contacts/page.tsx
import ContactsModule from '@/modules/crm/contacts';
export default function Page() { return <ContactsModule />; }
```

---

## 5. Key Rules (இந்த Rules follow பண்ணு)

| Rule | Details |
|---|---|
| **No axios in pages** | Only `fetchClientSide` (via hooks) touches axios |
| **No API calls in components** | Only in `hooks/useLogic.ts` |
| **No business logic in index.tsx** | Just wire hooks + render |
| **Schemas = Types** | `type TFoo = z.infer<typeof FooSchema>` — no separate interface files |
| **constants.ts per module** | LOADING_KEY, STATUS_OPTIONS — never hardcoded in JSX |
| **declaration.ts per module** | Only LOCAL types — shared types come from schemas/ |

---

## 6. Store (மாற்றல்)

`authStore.ts` and `themeStore.ts` (Zustand) — இரண்டும் same-a வச்சிருக்கோம்.  
Sample code Redux use பண்றது, ஆனா ERP-la Zustand சரியா வேலை செய்யுது — மாத்த தேவையில்ல.

---

## 7. Files நீக்கவேண்டியவை (Delete These)

```
src/lib/api/client.ts      → src/utils/api/fetchClientSide.ts-la merge ஆச்சு
src/lib/api/services.ts    → src/services/api/[module].ts files-a split ஆச்சு
src/hooks/useApi.ts        → src/hooks/useQuery/ + useMutation/-a split ஆச்சு
```
