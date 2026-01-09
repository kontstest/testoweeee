# Wedding Event Management Platform

Kompleksowa platforma do zarządzania wydarzeniami weselnymi z panelem administracyjnym, klienckim i dostępem dla gości. System wykorzystuje Next.js 15, React 19, TypeScript, Tailwind CSS 4 oraz Supabase jako backend.

## 📋 Spis treści

- [Przegląd projektu](#przegląd-projektu)
- [Funkcjonalności](#funkcjonalności)
- [Architektura](#architektura)
- [Struktura projektu](#struktura-projektu)
- [Instalacja i uruchomienie](#instalacja-i-uruchomienie)
- [Zmienne środowiskowe](#zmienne-środowiskowe)
- [API Endpoints](#api-endpoints)
- [Baza danych](#baza-danych)
- [Moduły](#moduły)
- [Stack technologiczny](#stack-technologiczny)

---

## 🎯 Przegląd projektu

Platforma umożliwia kompleksowe zarządzanie wydarzeniami weselnymi poprzez trzy główne interfejsy:

1. **Panel Super Admina** - Zarządzanie wszystkimi eventami i użytkownikami
2. **Panel Klienta** - Tworzenie i konfiguracja własnych eventów
3. **Strona Gościa** - Dostęp do informacji o evencie poprzez unikalny QR kod

---

## ✨ Funkcjonalności

### Super Admin
- Przeglądanie wszystkich eventów w systemie
- Zarządzanie statusem eventów (draft/active/completed/archived)
- Filtrowanie eventów po module
- Edycja ustawień eventów
- Zarządzanie użytkownikami

### Klient (Organizator)
- Tworzenie nowych eventów weselnych
- Personalizacja wyglądu (kolory, hero image, background)
- Wybór szablonu strony gościa (Classic/Minimal/Elegant/Colorful)
- Konfiguracja modułów:
  - 📸 **Galeria zdjęć** - Goście mogą przesyłać zdjęcia
  - 📸 **Zdjęcia z nakładką** - Zdjęcia z grafiką eventu
  - 📅 **Harmonogram** - Plan dnia wesela
  - 🍽️ **Menu** - Karta dań (przystawki, dania główne, desery, napoje)
  - 📋 **Ankiety** - Zbieranie opinii gości
  - 🎯 **Bingo** - Interaktywna gra dla gości
  - 🏢 **Vendors** - Lista dostawców (fotograf, DJ, catering, etc.)
- Generowanie QR kodów z różnymi stylami
- Podgląd odpowiedzi na ankiety i bingo
- Zarządzanie widocznością modułów

### Gość
- Dostęp do eventu poprzez QR kod lub bezpośredni link
- Przeglądanie harmonogramu, menu, galerii
- Przesyłanie własnych zdjęć
- Wypełnianie ankiet
- Gra w bingo
- Przeglądanie listy vendorów
- Wielojęzyczność (PL/EN)

---

## 🏗️ Architektura

### Frontend
- **Next.js 15** (App Router) - Framework React z SSR
- **React 19** - Biblioteka UI
- **TypeScript** - Typowanie statyczne
- **Tailwind CSS 4** - Framework CSS utility-first
- **shadcn/ui** - Komponenty UI
- **Zustand** - State management
- **React Hook Form + Zod** - Walidacja formularzy

### Backend
- **Next.js API Routes** - RESTful API
- **Własna warstwa abstrakcji** (`/lib/db/client.ts`) - Umożliwia łatwą migrację z Supabase na dowolny PostgreSQL
- **Supabase** (obecnie) - Backend-as-a-Service:
  - PostgreSQL - Baza danych
  - Auth - Autentykacja użytkowników
  - Storage - Przechowywanie zdjęć
  - Row Level Security (RLS) - Bezpieczeństwo na poziomie bazy

### Architektura API
Wszystkie komponenty komunikują się z backendem przez własne API endpointy (`/app/api/**`), które używają warstwy abstrakcji (`query()` z `/lib/db/client.ts`). To podejście umożliwia:
- Łatwą migrację z Supabase na inny PostgreSQL host
- Centralizację logiki biznesowej
- Lepszą kontrolę nad autoryzacją i walidacją
- Łatwiejsze testowanie

---

## 📁 Struktura projektu

```
wedding-app/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes (Backend)
│   │   ├── auth/                 # Autentykacja gości
│   │   │   ├── guest-login/      # Login gościa do eventu
│   │   │   └── guest-verify/     # Weryfikacja statusu eventu
│   │   └── events/               # CRUD operacje na eventach
│   │       ├── route.ts          # GET (lista) / POST (nowy event)
│   │       └── [eventId]/        # Operacje na konkretnym evencie
│   │           ├── route.ts      # GET/PUT/DELETE eventu
│   │           ├── bingo/        # Karty bingo
│   │           ├── bingo-responses/ # Odpowiedzi bingo
│   │           ├── menu/         # Pozycje menu
│   │           ├── photos/       # Galeria zdjęć
│   │           ├── schedule/     # Harmonogram
│   │           ├── surveys/      # Ankiety
│   │           ├── survey-responses/ # Odpowiedzi ankiet
│   │           └── vendors/      # Vendorzy
│   ├── admin/                    # Panel Super Admina
│   │   ├── page.tsx              # Dashboard admina
│   │   └── event/[id]/page.tsx   # Szczegóły eventu
│   ├── client/                   # Panel Klienta
│   │   └── page.tsx              # Dashboard klienta
│   ├── auth/                     # Strony autentykacji
│   │   ├── login/                # Logowanie
│   │   ├── sign-up/              # Rejestracja
│   │   └── sign-up-success/      # Potwierdzenie rejestracji
│   ├── event/[id]/               # Strona gościa
│   │   └── page.tsx              # Główna strona eventu dla gości
│   ├── dostep/                   # Strona dostępu do eventu
│   ├── privacy-policy/           # Polityka prywatności
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Strona główna (landing)
│   └── globals.css               # Globalne style
│
├── components/                   # Komponenty React
│   ├── admin/                    # Komponenty panelu admina
│   │   ├── admin-dashboard.tsx   # Dashboard admina
│   │   ├── create-event-dialog.tsx # Dialog tworzenia eventu
│   │   ├── event-details-page.tsx # Szczegóły eventu
│   │   ├── events-table.tsx      # Tabela eventów
│   │   └── module-selector.tsx   # Filtr po modułach
│   ├── client/                   # Komponenty panelu klienta
│   │   ├── client-dashboard.tsx  # Dashboard klienta
│   │   ├── client-dashboard-sidebar.tsx # Sidebar
│   │   ├── customization-tab.tsx # Zakładka personalizacji
│   │   ├── template-selector-tab.tsx # Wybór szablonu
│   │   ├── modules-visibility-tab.tsx # Widoczność modułów
│   │   ├── advanced-settings-tab.tsx # Zaawansowane ustawienia
│   │   ├── qr-template-generator.tsx # Generator QR kodów
│   │   ├── survey-tab.tsx        # Zarządzanie ankietami
│   │   ├── survey-responses-tab.tsx # Odpowiedzi ankiet
│   │   ├── bingo-tab.tsx         # Zarządzanie bingo
│   │   ├── bingo-responses-tab.tsx # Odpowiedzi bingo
│   │   ├── menu-tab.tsx          # Zarządzanie menu
│   │   ├── schedule-tab.tsx      # Zarządzanie harmonogramem
│   │   ├── vendors-tab.tsx       # Zarządzanie vendorami
│   │   ├── photo-library-tab.tsx # Biblioteka zdjęć
│   │   ├── photo-overlay-tab.tsx # Nakładka na zdjęcia
│   │   └── wedding-planning-tab.tsx # Planowanie wesela
│   ├── guest/                    # Komponenty strony gościa
│   │   ├── guest-event-page.tsx  # Wrapper strony gościa
│   │   ├── guest-auth-dialog.tsx # Dialog logowania gościa
│   │   ├── templates/            # Szablony stron
│   │   │   ├── guest-event-page-classic.tsx
│   │   │   ├── guest-event-page-minimal.tsx
│   │   │   ├── guest-event-page-elegant.tsx
│   │   │   └── guest-event-page-colorful.tsx
│   │   └── modules/              # Moduły funkcjonalne
│   │       ├── survey-module.tsx
│   │       ├── bingo-module.tsx
│   │       ├── menu-module.tsx
│   │       ├── schedule-module.tsx
│   │       ├── vendors-module.tsx
│   │       ├── photo-gallery-module.tsx
│   │       └── photo-overlay-module.tsx
│   ├── ui/                       # Komponenty UI (shadcn/ui)
│   └── theme-provider.tsx        # Provider motywu
│
├── lib/                          # Biblioteki pomocnicze
│   ├── api/                      # Helpery API
│   │   └── auth-utils.ts         # Autoryzacja i uwierzytelnianie
│   ├── db/                       # Warstwa abstrakcji bazy danych
│   │   └── client.ts             # Query abstraction layer
│   ├── hooks/                    # Custom React hooks
│   │   ├── use-guest-auth.ts     # Hook autentykacji gościa
│   │   └── use-language.ts       # Hook przełączania języka
│   ├── i18n/                     # Internacjonalizacja
│   │   └── translations.ts       # Tłumaczenia PL/EN
│   ├── supabase/                 # Klienty Supabase
│   │   ├── client.ts             # Client-side Supabase
│   │   ├── server.ts             # Server-side Supabase
│   │   ├── admin.ts              # Admin Supabase (service role)
│   │   └── middleware.ts         # Middleware Supabase
│   ├── types/                    # TypeScript types
│   │   └── database.ts           # Typy bazy danych
│   ├── utils/                    # Utility functions
│   │   └── qr-code.ts            # Generator QR kodów
│   └── utils.ts                  # Ogólne utility (cn, etc.)
│
├── scripts/                      # Skrypty SQL
│   ├── 001_create_base_tables.sql    # Tworzenie tabel
│   ├── 002_create_rls_policies.sql   # Polityki RLS
│   ├── 003_create_functions_and_triggers.sql # Funkcje i triggery
│   └── 004_seed_super_admin.sql      # Seed super admina
│
├── middleware.ts                 # Next.js middleware (auth)
├── next.config.mjs               # Konfiguracja Next.js
├── tailwind.config.ts            # Konfiguracja Tailwind
├── tsconfig.json                 # Konfiguracja TypeScript
└── package.json                  # Zależności projektu
```

---

## 🚀 Instalacja i uruchomienie

### Wymagania
- **Node.js** >= 18.x
- **pnpm** (lub npm/yarn)
- **Konto Supabase** (dla bazy danych i auth)

### Krok 1: Klonowanie repozytorium
```bash
git clone <repository-url>
cd wedding-app
```

### Krok 2: Instalacja zależności
```bash
pnpm install
```

### Krok 3: Konfiguracja zmiennych środowiskowych
Utwórz plik `.env.local` w głównym katalogu:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# App URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/auth/callback

# Database (automatycznie przez Supabase integration)
POSTGRES_URL=your_postgres_connection_string
POSTGRES_PRISMA_URL=your_postgres_prisma_url
POSTGRES_URL_NON_POOLING=your_postgres_non_pooling_url
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_DATABASE=postgres
POSTGRES_HOST=your_host
```

### Krok 4: Inicjalizacja bazy danych
Uruchom skrypty SQL w Supabase SQL Editor w kolejności:
```bash
1. scripts/001_create_base_tables.sql
2. scripts/002_create_rls_policies.sql
3. scripts/003_create_functions_and_triggers.sql
4. scripts/004_seed_super_admin.sql
```

Lub użyj v0 do wykonania skryptów bezpośrednio.

### Krok 5: Uruchomienie serwera deweloperskiego
```bash
pnpm dev
```

Aplikacja będzie dostępna pod adresem: `http://localhost:3000`

### Krok 6: Build produkcyjny
```bash
pnpm build
pnpm start
```

---

## 🔐 Zmienne środowiskowe

| Zmienna | Opis | Wymagana |
|---------|------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL projektu Supabase | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Publiczny klucz Supabase | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (admin) | ✅ |
| `NEXT_PUBLIC_APP_URL` | URL aplikacji | ✅ |
| `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` | URL przekierowania po auth (dev) | ⚠️ |
| `POSTGRES_URL` | Connection string PostgreSQL | ✅ |
| `POSTGRES_PRISMA_URL` | Prisma connection string | ✅ |
| `POSTGRES_URL_NON_POOLING` | Non-pooling connection | ✅ |
| `POSTGRES_USER` | Użytkownik bazy danych | ✅ |
| `POSTGRES_PASSWORD` | Hasło do bazy | ✅ |
| `POSTGRES_DATABASE` | Nazwa bazy danych | ✅ |
| `POSTGRES_HOST` | Host bazy danych | ✅ |

---

## 🔌 API Endpoints

Wszystkie endpointy używają warstwy abstrakcji (`query()` z `/lib/db/client.ts`) zamiast bezpośredniego Supabase client.

### Authentication
```
POST   /api/auth/guest-login      # Login gościa do eventu
POST   /api/auth/guest-verify     # Weryfikacja statusu eventu
```

### Events
```
GET    /api/events                # Lista eventów (admin/klient)
POST   /api/events                # Tworzenie nowego eventu
GET    /api/events/[eventId]      # Szczegóły eventu
PUT    /api/events/[eventId]      # Aktualizacja eventu
DELETE /api/events/[eventId]      # Usunięcie eventu
```

### Surveys (Ankiety)
```
GET    /api/events/[eventId]/surveys              # Lista ankiet
POST   /api/events/[eventId]/surveys              # Dodanie ankiety
PUT    /api/events/[eventId]/surveys/[cardId]     # Edycja ankiety
DELETE /api/events/[eventId]/surveys/[cardId]     # Usunięcie ankiety
GET    /api/events/[eventId]/survey-responses     # Odpowiedzi (owner)
```

### Bingo
```
GET    /api/events/[eventId]/bingo                # Lista kart bingo
POST   /api/events/[eventId]/bingo                # Dodanie karty
PUT    /api/events/[eventId]/bingo/[cardId]       # Edycja karty
DELETE /api/events/[eventId]/bingo/[cardId]       # Usunięcie karty
GET    /api/events/[eventId]/bingo-responses      # Postępy gości (owner)
```

### Menu
```
GET    /api/events/[eventId]/menu                 # Lista pozycji menu
POST   /api/events/[eventId]/menu                 # Dodanie pozycji
PUT    /api/events/[eventId]/menu/[itemId]        # Edycja pozycji
DELETE /api/events/[eventId]/menu/[itemId]        # Usunięcie pozycji
```

### Schedule (Harmonogram)
```
GET    /api/events/[eventId]/schedule             # Lista punktów harmonogramu
POST   /api/events/[eventId]/schedule             # Dodanie punktu
PUT    /api/events/[eventId]/schedule/[itemId]    # Edycja punktu
DELETE /api/events/[eventId]/schedule/[itemId]    # Usunięcie punktu
```

### Vendors
```
GET    /api/events/[eventId]/vendors              # Lista vendorów
POST   /api/events/[eventId]/vendors              # Dodanie vendora
PUT    /api/events/[eventId]/vendors/[vendorId]   # Edycja vendora
DELETE /api/events/[eventId]/vendors/[vendorId]   # Usunięcie vendora
```

### Photos (Galeria)
```
GET    /api/events/[eventId]/photos               # Lista zdjęć
POST   /api/events/[eventId]/photos               # Upload zdjęcia
DELETE /api/events/[eventId]/photos/[photoId]     # Usunięcie zdjęcia
```

### Autoryzacja API
Wszystkie endpointy wymagają autoryzacji poprzez Supabase Auth. Endpointy sprawdzają:
- **Owner** - czy użytkownik jest właścicielem eventu
- **Admin** - czy użytkownik ma rolę `super_admin`
- **Public** - eventy z statusem `active` są dostępne publicznie (tylko GET)

---

## 🗄️ Baza danych

### Schemat

#### Tabele główne

**profiles** - Profile użytkowników
```sql
- id (uuid, PK)
- email (text)
- role (enum: 'super_admin' | 'client' | 'guest')
- first_name (text)
- last_name (text)
- created_at, updated_at
```

**events** - Wydarzenia
```sql
- id (uuid, PK)
- name (text)
- event_date (date)
- status (enum: 'draft' | 'active' | 'completed' | 'archived')
- client_id (uuid, FK -> profiles)
- qr_code (text)
- primary_color, secondary_color (text)
- hero_image_url, background_image_url (text)
- template (text: 'classic' | 'minimal' | 'elegant' | 'colorful')
- event_module_* (boolean) - flagi modułów
- created_at, updated_at
```

**photos** - Galeria zdjęć
```sql
- id (uuid, PK)
- event_id (uuid, FK -> events)
- uploaded_by (uuid, FK -> profiles)
- image_url (text)
- caption (text)
- created_at
```

**schedule_items** - Harmonogram
```sql
- id (uuid, PK)
- event_id (uuid, FK -> events)
- time (time)
- title, description (text)
- order_index (integer)
- created_at
```

**menu_items** - Menu
```sql
- id (uuid, PK)
- event_id (uuid, FK -> events)
- category (text: 'appetizer' | 'main' | 'dessert' | 'drink')
- name, description (text)
- order_index (integer)
- created_at
```

**survey_cards** - Karty ankiet
```sql
- id (uuid, PK)
- event_id (uuid, FK -> events)
- title, description (text)
- questions (jsonb)
- created_at
```

**survey_responses** - Odpowiedzi na ankiety
```sql
- id (uuid, PK)
- survey_card_id (uuid, FK -> survey_cards)
- guest_name (text)
- responses (jsonb)
- created_at
```

**bingo_cards** - Karty bingo
```sql
- id (uuid, PK)
- event_id (uuid, FK -> events)
- title, description (text)
- image_url (text)
- items (jsonb) - tablica zadań
- created_at
```

**bingo_progress** - Postęp gości w bingo
```sql
- id (uuid, PK)
- bingo_card_id (uuid, FK -> bingo_cards)
- guest_name (text)
- completed_items (jsonb)
- is_completed (boolean)
- created_at
```

**vendors** - Lista vendorów
```sql
- id (uuid, PK)
- event_id (uuid, FK -> events)
- name, description, contact (text)
- category (text: 'photographer' | 'dj' | 'catering' | etc.)
- created_at
```

### Row Level Security (RLS)
Wszystkie tabele mają włączone RLS z politykami:
- **Super Admin** - pełny dostęp do wszystkich rekordów
- **Client** - dostęp do własnych eventów
- **Guest** - dostęp read-only do eventów ze statusem `active`

---

## 📦 Moduły

### 1. Survey (Ankiety)
**Lokalizacja:**
- Admin/Client: `components/client/survey-tab.tsx`
- Guest: `components/guest/modules/survey-module.tsx`
- API: `/api/events/[eventId]/surveys`

**Funkcjonalność:**
- Tworzenie kart ankiet z pytaniami
- Walidacja odpowiedzi gości
- Podgląd statystyk odpowiedzi
- Eksport odpowiedzi (przyszła funkcja)

### 2. Bingo
**Lokalizacja:**
- Admin/Client: `components/client/bingo-tab.tsx`
- Guest: `components/guest/modules/bingo-module.tsx`
- API: `/api/events/[eventId]/bingo`

**Funkcjonalność:**
- Tworzenie kart bingo z zadaniami
- Dodawanie opisów i obrazków do każdego zadania
- Śledzenie postępu gości
- Oznaczanie zwycięzców

### 3. Menu
**Lokalizacja:**
- Admin/Client: `components/client/menu-tab.tsx`
- Guest: `components/guest/modules/menu-module.tsx`
- API: `/api/events/[eventId]/menu`

**Funkcjonalność:**
- Dodawanie pozycji menu (przystawki, dania główne, desery, napoje)
- Grupowanie po kategoriach
- Edycja kolejności wyświetlania

### 4. Schedule (Harmonogram)
**Lokalizacja:**
- Admin/Client: `components/client/schedule-tab.tsx`
- Guest: `components/guest/modules/schedule-module.tsx`
- API: `/api/events/[eventId]/schedule`

**Funkcjonalność:**
- Dodawanie punktów harmonogramu z czasem
- Opisy każdego punktu
- Edycja kolejności

### 5. Photo Gallery (Galeria)
**Lokalizacja:**
- Admin/Client: `components/client/photo-library-tab.tsx`
- Guest: `components/guest/modules/photo-gallery-module.tsx`
- API: `/api/events/[eventId]/photos`

**Funkcjonalność:**
- Upload zdjęć przez gości
- Przeglądanie galerii
- Usuwanie zdjęć (tylko przez osoby które je dodały)
- Supabase Storage integration

### 6. Photo Overlay (Zdjęcia z nakładką)
**Lokalizacja:**
- Admin/Client: `components/client/photo-overlay-tab.tsx`
- Guest: `components/guest/modules/photo-overlay-module.tsx`

**Funkcjonalność:**
- Zdjęcia z nakładką graficzną eventu
- Możliwość dostosowania nakładki
- Download zdjęć z nakładką

### 7. Vendors (Dostawcy)
**Lokalizacja:**
- Admin/Client: `components/client/vendors-tab.tsx`
- Guest: `components/guest/modules/vendors-module.tsx`
- API: `/api/events/[eventId]/vendors`

**Funkcjonalność:**
- Lista dostawców (fotograf, DJ, catering, etc.)
- Kontakt do każdego vendora
- Kategoryzacja vendorów

---

## 🛠️ Stack technologiczny

### Frontend
- **Next.js 15.5.9** - React framework z App Router
- **React 19.1.0** - Biblioteka UI
- **TypeScript 5** - Typowanie statyczne
- **Tailwind CSS 4.1.9** - Utility-first CSS
- **shadcn/ui** - Komponenty UI (Radix UI + Tailwind)
- **Framer Motion** - Animacje
- **Zustand 5.0.8** - State management
- **React Hook Form 7.60.0** - Zarządzanie formularzami
- **Zod 3.25.76** - Walidacja schematów
- **QRCode 1.5.4** - Generator QR kodów
- **React Dropzone 14.3.8** - Upload plików
- **Lucide React** - Ikony

### Backend
- **Next.js API Routes** - RESTful API
- **Supabase 2.75.0** - Backend-as-a-Service
  - PostgreSQL - Relacyjna baza danych
  - Auth - Autentykacja
  - Storage - Przechowywanie plików
  - RLS - Row Level Security
- **Custom DB Abstraction Layer** - Łatwa migracja do innego PostgreSQL

### DevOps
- **Vercel** - Deployment i hosting
- **pnpm** - Package manager
- **ESLint** - Linting
- **PostCSS** - CSS processing

---

## 🔄 Migracja z Supabase na inny PostgreSQL

Projekt został zaprojektowany z myślą o łatwej migracji z Supabase na dowolny PostgreSQL host:

1. Wszystkie komponenty używają API endpointów zamiast bezpośredniego Supabase client
2. API endpointy używają warstwy abstrakcji (`query()` z `/lib/db/client.ts`)
3. Aby zmienić backend, wystarczy:
   - Zaktualizować `/lib/db/client.ts` aby używać np. `pg`, `postgres.js` lub innego drivera
   - Zmienić zmienne środowiskowe na nowy host PostgreSQL
   - Storage (zdjęcia) wymaga osobnego rozwiązania (np. AWS S3, Cloudinary)

Przykład migracji w `/lib/db/client.ts`:
```typescript
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL
})

export async function query(text: string, params?: any[]) {
  const result = await pool.query(text, params)
  return { data: result.rows, error: null }
}
```

---

## 📝 Licencja

Projekt prywatny - wszystkie prawa zastrzeżone.

---

## 🤝 Wsparcie

W przypadku pytań lub problemów, skontaktuj się z developerem projektu.

---

**Projekt stworzony z ❤️ dla zarządzania wydarzeniami weselnymi**
