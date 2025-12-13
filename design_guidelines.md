# X-BioAI Enterprise Virtual Office - Design Guidelines

## Design Approach

**System Selection:** Fluent Design (Microsoft) + Material Dark Theme patterns, heavily customized for command center aesthetics. This enterprise productivity application requires efficiency and clarity while maintaining a sophisticated, futuristic visual identity.

**Design Philosophy:** Premium mission control interface - think Bloomberg Terminal meets sci-fi command center. Information-dense yet organized, professional yet futuristic. Every element reinforces capability and precision.

---

## Typography System

**Font Stack:**
- **Headers/Titles:** Oxanium (Google Fonts) - weights 600, 700
- **Body/Interface:** IBM Plex Sans - weights 400, 500, 600
- **Code/Data:** JetBrains Mono - weight 400, 500

**Hierarchy:**
- H1: Oxanium 700, 2.5rem (main dashboard title)
- H2: Oxanium 600, 1.75rem (agent names, section headers)
- H3: IBM Plex Sans 600, 1.25rem (subsections)
- Body: IBM Plex Sans 400, 0.95rem (chat messages, descriptions)
- Small: IBM Plex Sans 400, 0.85rem (timestamps, metadata)
- Code: JetBrains Mono 400, 0.9rem (technical output, data)

---

## Color Implementation

**Base Palette:**
- Background Primary: #0A0E1A (deep space navy)
- Background Secondary: #151B2D (elevated surfaces)
- Background Tertiary: #1E2742 (cards, panels)
- Text Primary: #E8ECFA (high contrast white-blue)
- Text Secondary: #8B92B0 (muted labels)
- Accent Primary: #00FF88 (hacker green - CTAs, active states)
- Accent Secondary: #00C2FF (robotech blue - highlights, links)
- Border: #2A3550 (subtle separation)
- Danger: #FF4466 (errors, warnings)

**Usage Rules:**
- Green (#00FF88): Primary actions, agent status indicators, send buttons, active selections
- Blue (#00C2FF): Interactive elements, hyperlinks, secondary highlights, pulse effects
- Never use both accents equally - green dominates as primary brand color
- Background gradients: Subtle radial gradients from primary to secondary backgrounds behind main content areas

---

## Layout System

**Spacing Primitives:** Tailwind units: 2, 4, 6, 8, 12, 16, 24 (p-2, m-4, gap-6, etc.)

**Grid Structure:**
- Sidebar: 280px fixed width (agent selection + controls)
- Main chat area: flex-1 (occupies remaining space)
- Right panel (optional): 320px (conversation history, agent details)
- Use 3-column layout for desktop, collapse to single column on mobile

**Container Widths:**
- Full viewport application (no max-width constraints)
- Chat messages: max-w-4xl for readability
- Modals/overlays: max-w-2xl

**Vertical Rhythm:**
- Section padding: py-6 to py-8
- Component spacing: gap-4 to gap-6
- Message bubbles: p-4

---

## Component Library

### Navigation & Layout
**Top Bar:** Fixed header with logo, global search, user profile, settings icon. Height: h-16, backdrop blur effect.

**Sidebar:** Agent selection grid/list with avatar icons, status indicators (green dot for active), agent names. Sticky positioning.

**Main Panel:** Chat interface with message history, input area fixed at bottom.

### Chat Components
**Message Bubbles:**
- User messages: Right-aligned, background tertiary with blue border-l-2
- AI messages: Left-aligned, background secondary with green border-l-2
- Include agent avatar (32px circle), timestamp, message content
- Code blocks use JetBrains Mono with syntax highlighting on dark background

**Input Area:**
- Multi-line textarea with send button (green accent)
- Voice input button (microphone icon, blue when recording)
- Language toggle (AR/EN) as pill buttons
- Character count, voice indicator status

**Agent Cards:**
- 120px x 140px cards in grid layout
- Agent icon/avatar at top
- Name in Oxanium
- Subtitle/role in small text
- Hover: subtle green glow border, scale transform
- Selected: green border-2, elevated shadow

### Data Display
**Conversation History:** List view with conversation titles, timestamps, participant agents. Hover highlights with blue accent.

**Status Indicators:** 
- Online/Active: green dot
- Processing: blue pulsing ring
- Error: red dot
- Use 8px circles

### Forms & Controls
**Buttons:**
- Primary: Green background, dark text, rounded-md
- Secondary: Transparent with green border, green text
- Ghost: No background, blue text on hover
- Icon buttons: 40px square, centered icons

**Inputs:**
- Dark background (#1E2742), blue focus ring
- Rounded borders, 1px solid border color
- Placeholder text in secondary color

### Overlays
**Modals:** Centered, dark background with subtle border, backdrop blur with opacity. Header in Oxanium, close button top-right.

**Dropdowns:** Dark panels with blue hover states, subtle shadow elevation.

---

## Images

**Hero Section:** NOT APPLICABLE - This is a full-viewport dashboard application with immediate functionality. No landing page hero.

**Agent Avatars:** 
- Use abstract geometric icons or minimalist representations for each of the 10 agents
- Circular frames, 32px in chat, 64px in agent selection
- Each agent gets unique icon with consistent style
- Icons should suggest their role (e.g., briefcase for Executive, scales for Legal, microscope for Research)

**Background Textures:**
- Subtle grid pattern overlay on main background (low opacity, 2-5%)
- Optional: Abstract circuit-board-like pattern in header/sidebar backgrounds (very subtle)

---

## Animations

**Minimal, Purposeful Only:**
- Message appearance: fade-in + slide-up (150ms)
- Agent selection: scale transform on hover (200ms)
- Voice recording: pulsing blue ring animation
- Loading states: subtle shimmer or skeleton screens
- NO complex scroll animations or parallax effects

---

## Responsive Strategy

**Desktop (lg+):** Full 3-column layout with persistent sidebar and optional right panel
**Tablet (md):** 2-column, collapsible sidebar as drawer
**Mobile (base):** Single column, hamburger menu for agent selection, bottom-sheet for history

**Breakpoint Behavior:**
- Maintain chat functionality at all sizes
- Priority: Input area always visible and accessible
- Agent selection becomes overlay/modal on mobile

---

## Accessibility

- WCAG AA contrast ratios (already met with chosen colors against dark backgrounds)
- Keyboard navigation for all interactive elements
- Screen reader labels for icons and status indicators
- Focus indicators using blue accent with 2px outline
- RTL support for Arabic language mode