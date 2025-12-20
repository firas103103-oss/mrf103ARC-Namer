# ARC Intelligence Framework - Design Guidelines

## Design Approach

**System Selection:** Fluent Design + U.S. Web Design System (USWDS) fusion, customized for security operations center aesthetics. This SOC command center requires governmental authority, mission-critical clarity, and real-time situational awareness.

**Design Philosophy:** Professional cyber defense command center - think NOAA Emergency Operations meets NSA Cyber Ops. Authoritative yet accessible, structured yet dynamic. Every element reinforces security, trust, and operational readiness.

---

## Typography System

**Font Stack:**
- **Headers/Titles:** Inter (Google Fonts) - weights 600, 700, 800
- **Body/Interface:** Public Sans (web-safe USWDS font) - weights 400, 500, 600
- **Code/Data:** Roboto Mono - weight 400, 500

**Hierarchy:**
- H1: Inter 800, 2.25rem (dashboard title, threat levels)
- H2: Inter 700, 1.5rem (section headers, agent names)
- H3: Public Sans 600, 1.125rem (subsections, panel titles)
- Body: Public Sans 400, 0.9375rem (metrics, descriptions)
- Small: Public Sans 400, 0.8125rem (timestamps, metadata)
- Code: Roboto Mono 400, 0.875rem (IP addresses, hashes, logs)

---

## Color Implementation

**Base Palette:**
- Background Primary: #0B1120 (deep navy command center)
- Background Secondary: #141B2E (elevated surfaces, panels)
- Background Tertiary: #1A2540 (cards, data containers)
- Text Primary: #F0F4F8 (crisp white for readability)
- Text Secondary: #8A96AC (muted labels, secondary info)
- Accent Primary: #0066CC (authoritative gov blue - primary actions)
- Accent Alert: #DC3545 (critical alerts, threats)
- Accent Success: #10B981 (secure status, successful operations)
- Accent Warning: #F59E0B (warnings, medium threats)
- Border: #2D3E5F (panel separation, grid lines)

**Usage Rules:**
- Blue (#0066CC): Primary CTAs, active agent status, main interactions
- Red (#DC3545): High-priority alerts, critical threats, danger zones
- Green (#10B981): Secure statuses, successful scans, protected assets
- Amber (#F59E0B): Medium alerts, pending actions, caution states
- Background: Subtle radial gradient from primary (#0B1120) to slightly lighter navy at edges
- Grid overlay: 1px opacity 3-5% grid pattern across main background

---

## Layout System

**Spacing Primitives:** Tailwind units: 2, 4, 6, 8, 12, 16, 20, 24

**Grid Structure:**
- Top Command Bar: h-14 fixed, full-width status bar (threat level, system status, alerts)
- Left Sidebar: 300px fixed (agent fleet, navigation, quick actions)
- Main Dashboard: flex-1 (monitoring panels, real-time feeds)
- Right Panel: 360px (event log, threat intelligence feed)
- Use 3-column layout for desktop, collapse to single column on mobile

**Container Widths:**
- Full viewport application (edge-to-edge)
- Dashboard panels: within grid columns, no max-width
- Modals: max-w-3xl for incident reports

**Vertical Rhythm:**
- Panel padding: p-6
- Component spacing: gap-4 to gap-6
- Section separation: mb-8

---

## Component Library

### Navigation & Layout
**Command Bar:** Fixed top bar showing: ARC logo left, current threat level (color-coded badge), active incidents counter, system health status, user profile right. Background secondary with subtle bottom border. h-14.

**Sidebar:** Agent monitoring grid with status indicators. Each agent card 80px height with icon, name, current task, status dot. Collapsible sections for "Active Agents," "Standby," "Maintenance."

**Dashboard Panels:** 
- Grid layout with responsive columns (2-3 columns desktop)
- Panel types: Real-time metrics, threat map, event timeline, agent activity
- Each panel: background tertiary, subtle border, header with icon + title
- Include mini charts, progress indicators, live counters

### Security Components
**Alert Cards:**
- High: Red left border-l-4, red badge, bold title
- Medium: Amber left border, amber badge
- Low: Blue left border
- Include: severity badge, timestamp, affected system, quick action button
- Hover: subtle scale and shadow elevation

**Status Indicators:**
- Secure/Active: Green dot with pulse ring
- Alert: Red dot pulsing
- Warning: Amber dot
- Offline: Gray dot
- Size: 10px circles, positioned top-right of agent cards

**Metric Tiles:**
- Large number display (Inter 700, 2.5rem)
- Label below in small text
- Optional trend indicator (arrow up/down with percentage)
- Background tertiary, p-6, rounded corners
- Grid layout: 4 tiles across on desktop

### Data Display
**Event Log:**
- Reverse chronological list with timestamp, event type icon, description, severity tag
- Alternating subtle background on hover
- Compact spacing (p-3 per entry)
- Scrollable container with custom thin scrollbar (blue track)

**Threat Map:** 
- Central visual showing geographic threat distribution
- Use placeholder for map component with pin clusters
- Legend showing threat levels with color codes
- Background dark with glowing data points

**Agent Activity Timeline:**
- Horizontal timeline showing agent tasks over time
- Color-coded bars for each agent
- Time markers, task labels on hover
- Compact view showing last 24 hours

### Forms & Controls
**Buttons:**
- Primary: Blue background (#0066CC), white text, rounded-md, font-medium
- Danger: Red background, white text (for critical actions)
- Secondary: Transparent with blue border, blue text
- Ghost: No background, blue text hover state
- Icon buttons: 40px square, centered icons with blue hover background

**Inputs & Filters:**
- Dark background (#1A2540), blue focus ring (2px)
- Search bars prominent in panels for filtering
- Dropdown selectors for time ranges, threat levels
- Toggle switches for real-time updates

### Overlays
**Incident Modals:**
- Centered, background secondary with border
- Backdrop blur (backdrop-blur-md) with dark overlay
- Header: Incident ID, severity badge, timestamp
- Body: Structured data, affected systems, recommended actions
- Footer: Action buttons (Acknowledge, Escalate, Dismiss)

**Agent Detail Drawer:**
- Slide-in from right (360px width)
- Agent profile, current mission, performance metrics, control panel
- Close button top-right, semi-transparent backdrop

---

## Images

**Dashboard Application:** No hero section. This is a full-screen operational dashboard requiring immediate access to monitoring tools.

**Agent Icons:**
- Use shield, radar, satellite, lock, key, network node, database, firewall, scanner, sentinel icons
- 48px circular frames for sidebar, 32px in compact views
- Minimalist line-art style with subtle blue glow effect
- Each agent gets unique security-themed icon

**Background Elements:**
- Subtle topographic/grid pattern overlay (2-3% opacity) across main background
- Optional: Abstract circuit board pattern in command bar (very subtle, 5% opacity)
- No decorative images - functional dashboard only

---

## Animations

**Purposeful Only:**
- Alert appearance: fade-in + slight shake for high-priority (200ms)
- Panel updates: subtle pulse on border when data refreshes
- Status changes: color transition (300ms)
- Live counters: number increment animation
- Loading: skeleton screens with shimmer for data panels
- NO scroll animations or complex transitions

---

## Responsive Strategy

**Desktop (lg+):** Full 3-column layout with persistent sidebar and event log
**Tablet (md):** 2-column, collapsible sidebar as drawer, event log as bottom sheet
**Mobile (base):** Single column stack, hamburger menu, critical metrics prioritized

**Breakpoint Behavior:**
- Dashboard panels stack vertically on mobile
- Maintain alert visibility at all sizes
- Command bar remains fixed with condensed status indicators

---

## Accessibility

- WCAG AA contrast ratios enforced (light text on dark backgrounds)
- Keyboard navigation for all controls and panels
- Screen reader labels for all status indicators and icons
- Focus indicators: blue outline (2px solid #0066CC)
- Color-blind safe: Never rely on color alone for threat levels (use icons + text)
- High-contrast mode support for metric displays