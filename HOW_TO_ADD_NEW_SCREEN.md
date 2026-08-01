# NexERP — How to Add a New Screen

## இந்த structure follow பண்ணா, எல்லா screen-உம் same pattern-ல இருக்கும்.

## Example: Finance > Receipts screen add பண்ண

---

### Step 1 — Service API Config
`src/services/api/finance.ts` open பண்ணு, add பண்ணு:

```ts
export const getReceipts:    APIConfig = { endPoint:'/finance/receipts',      keys:['receipts'],        method:'GET',    accessToken:true };
export const postReceipt:    APIConfig = { endPoint:'/finance/receipts',      keys:['receipt-create'],  method:'POST',   accessToken:true };
export const putReceipt:     APIConfig = { endPoint:'/finance/receipts/{id}', keys:['receipt-update'],  method:'PUT',    accessToken:true };
export const deleteReceipt:  APIConfig = { endPoint:'/finance/receipts/{id}', keys:['receipt-delete'],  method:'DELETE', accessToken:true };
```

---

### Step 2 — Zod Schema
`src/schemas/finance/request.ts` → Add ReceiptSchema
`src/schemas/finance/response.ts` → Add ReceiptsRes, TReceipt

---

### Step 3 — Module Folder
Create: `src/modules/finance/receipts/`

```
receipts/
  declaration.ts          ← Local types  
  constants.ts            ← Loading key, enum values
  hooks/
    useLogic.ts           ← useQuery + useMutation + handlers
    useFormHandle.ts      ← useFormHandler + Zod schema  (if form)
  components/
    receiptForm.tsx        ← Pure UI component (props only)
  index.tsx               ← Orchestrator (no direct API calls)
```

**declaration.ts:**
```ts
export type TReceiptFilter = { status: string; page: number; };
```

**constants.ts:**
```ts
export const RECEIPTS_KEY = 'receipts-loading';
```

**hooks/useLogic.ts:**
```ts
'use client';
import { useQuery } from '@/hooks/useQuery';
import { useMutation } from '@/hooks/useMutation';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import { loadingAction } from '@/stores/reducers/loading';
import { selectCan } from '@/stores/reducers/auth';
import { ReceiptsRes } from '@/schemas/finance/response';
import { getReceipts, deleteReceipt } from '@/services/api/finance';

export const useReceiptsLogic = () => {
  const dispatch  = useAppDispatch();
  const canCreate = useAppSelector(selectCan('FINANCE_RECEIPTS', 'create'));

  const { data, isLoading } = useQuery({
    apiConfig:      getReceipts,
    responseSchema: ReceiptsRes,
    loadingKey:     RECEIPTS_KEY,    // dispatches loading action automatically
  });

  // ...mutations, handlers

  return { receipts: data?.data?.content ?? [], canCreate, isLoading };
};
```

**index.tsx:**
```ts
'use client';
import { useReceiptsLogic } from './hooks/useLogic';
import { AccessDenied, PageHeader, DataTable } from '@/components/shared';
import { useAppSelector } from '@/stores/hooks';
import { selectCan } from '@/stores/reducers/auth';

export default function ReceiptsModule() {
  const canRead = useAppSelector(selectCan('FINANCE_RECEIPTS', 'read'));
  const { receipts, isLoading } = useReceiptsLogic();

  if (!canRead) return <AccessDenied />;
  return (
    <div>
      <PageHeader title="Receipts" crumbs={[{label:'Finance'},{label:'Receipts'}]} />
      <DataTable data={receipts} columns={columns} loading={isLoading} />
    </div>
  );
}
```

---

### Step 4 — Thin page.tsx (3 lines only!)
`src/app/(erp)/finance/receipts/page.tsx`:
```ts
import ReceiptsModule from '@/modules/finance/receipts';
export default function Page() { return <ReceiptsModule />; }
```

---

## Data Flow Summary

```
page.tsx (3 lines)
  ↓ imports
modules/finance/receipts/index.tsx  (UI only)
  ↓ calls
hooks/useLogic.ts  (business logic)
  ↓ uses
hooks/useQuery + useMutation (generic hooks — Redux dispatch built-in)
  ↓ uses
utils/api/fetchClientSide.ts  (axios — token from Redux store)
  ↓ calls
services/api/finance.ts  (APIConfig objects — no axios here!)
  ↓
Backend API
```

## Redux dispatch pattern:
```ts
// useQuery and useMutation automatically dispatch:
// loadingAction.setLoading(loadingKey)     ← before API call
// loadingAction.destroyLoading(loadingKey) ← after API call

// Check loading in any component:
const isLoading = useAppSelector(selectIsLoading('receipts-loading'));

// Check permissions:
const canCreate = useAppSelector(selectCan('FINANCE_RECEIPTS', 'create'));

// Dispatch auth actions:
const dispatch = useAppDispatch();
dispatch(authAction.setActiveModule('FINANCE'));
dispatch(authAction.logout());
dispatch(layoutAction.toggleTheme());
```
