# Sidhivinayak Waters FactoryOS

## Current State
The app has 14 pages including an AI Panel with 5 AI agents (Manager, Analyst, CA, Legal, Operations) that auto-respond. Navigation is via Sidebar. There is no Owner-only section; all pages are accessible to anyone.

## Requested Changes (Diff)

### Add
- New page: `OwnerAI.tsx` — Owner-Only AI Command Center with a PIN lock (owner sets a PIN on first access, stored in localStorage). Once unlocked, the Owner gets:
  1. **RANA JI AI** — A supreme AI chat interface with ultra-powerful persona (atomic to cosmic level thinking). Responses are deeply analytical, multi-dimensional, and reference both micro and macro perspectives. Branded as "⚡ Created by Rana Ji". Has typewriter effect, neural pulse animations, confidence score bars, cosmic background particle effects.
  2. **App Customizer** — Owner can type commands to change the live app: rename nav labels, change accent color (neon color tokens), hide/show pages from sidebar, set a custom dashboard greeting, set a daily "Owner Directive" that shows as a banner. All changes persist via localStorage and apply instantly across the app via a React Context.
  3. **Owner Directives Board** — List of saved directives/notes that show as glowing banners on the Dashboard.
  4. **Power Stats** — Shows AI power level (cosmic scale), interaction count, XP, uptime.
- New context: `OwnerContext.tsx` — stores app customization state (accent color, hidden pages, custom labels, owner directives), reads/writes localStorage, provides it to the whole app.
- New nav item in Sidebar: `owner-ai` labeled "Owner AI" with a crown/infinity icon, in the Intelligence section, with a glowing neon gold color when active.

### Modify
- `App.tsx`: Add `OwnerAIPage` import and route; wrap app with `OwnerContextProvider`.
- `Sidebar.tsx`: Add `owner-ai` nav item with special styling (gold/amber glow for owner-only distinction). Use customization context to apply custom labels and hide pages as set by Owner.
- `Dashboard.tsx`: Show Owner Directives banner if directives exist (read from OwnerContext).

### Remove
- Nothing removed.

## Implementation Plan
1. Create `src/frontend/src/context/OwnerContext.tsx` with customization state.
2. Create `src/frontend/src/pages/OwnerAI.tsx` — PIN lock screen + AI chat + App Customizer tabs.
3. Update `App.tsx` to add OwnerContextProvider and owner-ai route.
4. Update `Sidebar.tsx` to add owner-ai nav item with gold styling, read custom labels/hidden pages from OwnerContext.
5. Update `Dashboard.tsx` to show Owner Directives banner strip.
