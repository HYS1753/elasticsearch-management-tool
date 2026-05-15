# Frontend UI Architecture (`management_ui`)

This document outlines the specific architectural guidelines, technology stack, and directory structure constraints for the Next.js Frontend UI. Agents and developers modifying the frontend MUST adhere to these rules.

## 1. Technology Stack
- **Framework:** Next.js 15 (App Router)
- **Library:** React 19
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI primitives / shadcn/ui style
- **Language:** TypeScript

## 2. Directory Structure Constraints

The UI strictly adheres to the Next.js App Router conventions combined with a component-driven architecture.

```text
management_ui/
├── package.json           # Defines dependencies and npm scripts
├── app/                   # Next.js App Router (Pages, Layouts, API routes)
│   ├── api/               # Next.js Serverless API routes (if used as BFF)
│   ├── globals.css        # Global CSS and Tailwind directives
│   └── [route_folders]/   # Route segments (e.g., /cluster-information)
├── components/            # Reusable UI components
│   ├── ui/                # Base UI primitives (buttons, inputs, dialogs)
│   └── [feature]/         # Feature-specific composite components
├── lib/                   # Utility functions, API client wrappers, and generic helpers
├── hooks/                 # Custom React hooks
└── types/                 # TypeScript interfaces mirroring backend schemas
```

## 3. Design and Component Rules

To ensure a highly responsive and maintainable frontend, the following rules apply:

- **Server vs. Client Components:**
  - **Default to Server Components:** Next.js 15 App Router defaults to Server Components. Use them for data fetching and static rendering.
  - **Use `"use client"` sparingly:** Only add `"use client"` at the top of files that require browser APIs (e.g., `window`), React state (`useState`, `useReducer`), or lifecycle hooks (`useEffect`). Push client boundaries down the component tree as far as possible.

- **Data Fetching:**
  - Fetch data primarily in Server Components (`page.tsx`) and pass it down as props.
  - For complex client-side mutations or polling, use specialized hooks or lightweight data-fetching libraries if introduced later, but avoid bloated global state managers unless absolutely necessary.

- **Styling (Tailwind CSS):**
  - Use Tailwind utility classes for all styling.
  - Use `clsx` and `tailwind-merge` (typically provided in `lib/utils.ts`) when merging conditional Tailwind classes in components.

- **Type Safety:**
  - Strict TypeScript enforcement. 
  - Ensure all API responses are typed properly in the `types/` directory. These types MUST stay in sync with the `management_api` Pydantic schemas.

## 4. Execution Protocol

- **Dependency Management:** Run `npm install` for dependency updates.
- **Development Server:** Run `npm run dev` to start the local Next.js server.
- **Context:** Always ensure you are in the `management_ui` directory before running any Next.js/npm commands.
