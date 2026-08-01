# NexERP Setup Guide

## 1. Backend (Spring Boot — SQL Server)

### Database setup:
1. Create SQL Server database: `NexERP`
2. Create login: `nexerp_user` with password `NexErp@123`
3. Run the full schema: `script.sql` (in backend resources/db/)
4. Run the admin seed: `ADMIN_SEED.sql` (in this folder)

### Run backend:
```bash
cd "ERP- BE"
./mvnw spring-boot:run
# or: mvn spring-boot:run
```
Backend starts at: http://localhost:8080

---

## 2. Frontend (Next.js)

### Install dependencies:
```bash
npm install
```

### Environment:
`.env.local` already set:
```
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### Run:
```bash
npm run dev
```
Frontend at: http://localhost:3000

---

## 3. Login
- URL: http://localhost:3000/login
- Username: **admin**
- Password: **admin123**

---

## Project Structure
```
src/
├── stores/          ← Redux store (auth, loading, layout)
│   ├── index.ts
│   ├── hooks.ts     ← useAppDispatch, useAppSelector
│   └── reducers/
│       ├── auth.ts
│       ├── loading.ts
│       └── layout.ts
├── services/api/    ← APIConfig objects (no axios!)
├── schemas/         ← Zod validation schemas
├── hooks/
│   ├── useQuery/    ← Generic fetch hook (Redux-aware)
│   ├── useMutation/ ← Generic mutation hook (Redux-aware)
│   └── useFormHandler/
├── utils/api/       ← fetchClientSide (axios core)
├── modules/         ← ALL screens as modules
│   ├── auth/login/
│   ├── dashboard/
│   ├── finance/{invoices,clients,products}/
│   ├── hr/{employees,attendance,payroll}/
│   ├── inventory/{stock,movements,orders}/
│   ├── crm/{leads,followups,activities}/
│   └── admin/{users,roles,companies,entitlements}/
└── app/             ← Next.js App Router (3-line pages only)
    ├── (auth)/login/page.tsx
    └── (erp)/
        ├── dashboard/page.tsx
        ├── finance/*/page.tsx
        ├── hr/*/page.tsx
        ├── inventory/*/page.tsx
        ├── crm/*/page.tsx
        └── admin/*/page.tsx
```

## Adding a new screen:
See `HOW_TO_ADD_NEW_SCREEN.md`
