# Design System: PolitiTrack

## 1. Visual Theme & Atmosphere

PolitiTrack channels the aesthetic of a **late-night intelligence briefing** — dark, data-dense, and authoritative. The atmosphere is one of institutional seriousness softened by editorial warmth: a deep midnight canvas punctuated by crimson alerts and amber highlights. Subtle animated stars drift behind the content, evoking a sense of vast, open space — like staring into a night sky of data points.

The overall density is **moderate-to-high**: generous vertical padding between sections creates breathing room, while individual components (cards, stat blocks, code previews) pack information tightly. The design balances investigative gravitas with approachability — it feels like a tool built for journalists and researchers, not a government database.

**Key descriptors:** Dark institutional, editorially warm, data-forward, investigative, quietly cinematic.

## 2. Color Palette & Roles

### Backgrounds (Dark Spectrum)
| Name | Hex | Role |
|------|-----|------|
| Midnight Void | `#0b0e14` | Page background, deepest layer. The canvas everything floats on. |
| Dark Charcoal | `#141820` | Primary surface — cards, containers, nav dropdowns. One step above void. |
| Slate Charcoal | `#1c2130` | Secondary surface — hover states, nested containers, alternate card backgrounds. |
| Steel Border | `#2a3145` | All borders, dividers, and subtle structural lines. Barely visible separation. |

### Text Hierarchy
| Name | Hex | Role |
|------|-----|------|
| Soft Cloud White | `#f2f4f8` | Headlines, logo text, primary emphasis. Not pure white — gentler on dark backgrounds. |
| Muted Silver | `#cdd3e0` | Body text, descriptions, secondary content. The workhorse reading color. |
| Faded Graphite | `#7d879e` | Tertiary text, timestamps, labels, placeholder text. Deliberately quiet. |

### Accent Colors
| Name | Hex | Role |
|------|-----|------|
| Signal Red | `#e63946` | Primary brand accent. Active nav items, section labels, CTAs, the "TRACK" in logo. Signals urgency and importance. |
| Deep Crimson | `#c1121f` | Red gradient endpoint. Used in button gradients (`135deg` from Signal Red to Deep Crimson). Adds depth to CTAs. |
| Signal Red Wash | `rgba(230,57,70,0.12)` | Red background tint for active states, selected items, and hover highlights. |
| Institutional Navy | `#1d3557` | Background radial glow behind hero sections. Evokes government/political gravitas. |
| Navy Highlight | `#2b4a7a` | Source badges, secondary data highlights. Lighter navy for contrast. |
| Congressional Blue | `#5a9fd4` | Data labels, source indicators, Democratic party color, tertiary accent. |
| Archive Gold | `#e4b84d` | Emphasis in headlines ("4 steps", "API", "everything"), Pro tier badges, lobbying data highlights. Connotes value and importance. |
| Archive Gold Wash | `rgba(228,184,77,0.12)` | Gold background tint for gold-tagged elements and warnings. |

### Functional Colors
| Name | Hex | Role |
|------|-----|------|
| Terminal Green | `#28c840` | Success indicators, "online" dot in code preview chrome. |
| Legislation Green | `#22c55e` | Spending/budget data accent. |
| Alert Red | `#ef4444` | Cost-of-living increases, negative change indicators. |
| Warm Orange | `#e07040` | Step indicators, progress markers, secondary action color. |

## 3. Typography Rules

### Font Stack
| Role | Family | Fallbacks |
|------|--------|-----------|
| **Display / Headlines** | `'Libre Baskerville'` | `Georgia, serif` |
| **Body / Editorial** | `'Source Serif 4'` | `Georgia, serif` |
| **UI / Labels / Code** | `'Source Code Pro'` | `monospace` |

### Usage Patterns

**Headlines (Libre Baskerville):**
- Hero h1: `clamp(34px, 5.5vw, 68px)`, weight 700, line-height 1.12 — dramatic, responsive scaling
- Section h2: 30-36px, weight 700 — section anchors
- Card h3: 16px, weight 700 — compact but authoritative
- Italicized `<em>` spans in gold (`#e4b84d`) for editorial emphasis within headlines

**Body (Source Serif 4):**
- Body paragraphs: 16px, line-height 1.75 — relaxed, editorial reading rhythm
- Used sparingly — only for longer descriptive text and hero subtitles

**UI / Labels (Source Code Pro):**
- Section labels: 15px, letter-spacing 3-4px, uppercase, monospace — the signature "kicker" pattern
- Nav items: 15-16px, weight 400 (inactive) / 600 (active)
- Stat labels: 11px, letter-spacing 2-3px, uppercase — quiet, utilitarian
- Data timestamps: 11px — smallest text in the system
- Code blocks: 14px, line-height 1.85

**Weight Scale:** 400 (body/inactive), 600 (semi-bold/active), 700 (headlines/emphasis). No light weights used.

## 4. Component Stylings

### Buttons

* **Primary CTA:** Pill-like with subtly rounded corners (border-radius 10px). Filled with a 135-degree gradient from Signal Red to Deep Crimson. White text, weight 600, monospace. On hover: lifts 2px upward with a warm crimson glow shadow (`0 12px 40px rgba(230,57,70,0.25)`). Padding: 16px 36px.
* **Secondary / Ghost:** Transparent background with Steel Border outline. Muted Silver text in monospace. On hover: border brightens toward red. Same border-radius (10px) and padding as primary.
* **Nav Buttons:** Transparent with invisible border. Faded Graphite text. Active state: Signal Red Wash background, faint red border (`rgba(230,57,70,0.25)`), red text, weight 600. Border-radius 8px.
* **Pill Tabs (Cycle Selector):** Small (8px 20px), border-radius 8px. Toggle between transparent/inactive and red-wash/active states.

### Cards & Containers

* **Standard Card:** Dark Charcoal (`#141820`) background, 1px Steel Border, border-radius 12px. No shadow — depth is communicated through color layering, not elevation.
* **Feature Card:** Slate Charcoal (`#1c2130`) background with a colored top border accent (3px solid, color varies by category, at 40% opacity). Border-radius 10px. On hover: lifts 4px, top border becomes fully opaque, background shifts to `#242a3a`.
* **Code Preview (Terminal):** Dark Charcoal with border-radius 16px. Includes a macOS-style window chrome header with three dots (red, gold, green, each 12px circles). Monospace content inside.
* **Expanded Detail Panel:** Dark Charcoal background, border-radius 16px, 1px Steel Border. Contains nested content areas.
* **Stat Block Row:** Horizontal flex layout inside a bordered container (border-radius 12px). Individual stats separated by 1px vertical dividers in Steel Border color.

### Inputs & Forms

* **Search Input:** Dark Charcoal background, 1px Steel Border, border-radius 10px. Padding 16px 20px. White text in monospace. Placeholder text in Faded Graphite (`#7d879e`). No visible focus ring — relies on color context.
* **Inline alongside button:** Search inputs sit flush next to CTA buttons at matching height.

### Tags & Badges

* **Tier Badges:** Monospace, 15px, uppercase, letter-spacing 1px, weight 700. Background is a 15% wash of the tag color. 1px border at 20% opacity of tag color. Border-radius 4px. Padding 3px 10px.
* **Party Badges:** Same pattern — Democratic uses blue wash, Republican uses red wash, other uses gold wash. Border-radius 4px.
* **Data Source Tags:** Monospace, gold text on gold wash. Compact inline format.

### Section Label Pattern (Signature Element)

Every content section opens with a distinctive "kicker" pattern:
- Monospace text, 15px, letter-spacing 3-4px, uppercase
- Signal Red or Archive Gold color
- Sometimes flanked by thin horizontal rules (24px wide, 1px height, matching color)
- Followed by a serif headline and dim subtitle

This is the most recognizable recurring pattern in the design.

## 5. Layout Principles

### Content Width
- Maximum content width: **1100-1200px**, centered with auto margins
- Narrower sections (editorial, AI output): **850-900px**
- Padding: 24-32px horizontal on all sections

### Spacing System
- Section vertical padding: **60-100px** — generous, creates clear separation
- Between section label and headline: **16px**
- Between headline and body: **12px**
- Grid gaps: **2-16px** depending on density (2px for tight data grids, 16px for feature cards)
- Card internal padding: **24-36px**
- Component margins: **8-48px** bottom, scaled by importance

### Grid Strategy
- Feature grids: `repeat(auto-fit, minmax(240px, 1fr))` — fluid responsive without breakpoints
- Role selector: `repeat(auto-fit, minmax(150px, 1fr))` — tighter minimum for compact items
- Data comparison grids: 2-column fixed, 4-column flex rows
- Stats: Horizontal flex with 1px dividers (no grid)

### Navigation
- Fixed top nav, 72px height, max-width 1200px centered
- Transparent when at top, frosted glass (`rgba(8,9,13,0.95)` + `blur(24px)`) when scrolled
- Mobile breakpoint at 768px: hamburger menu with animated three-line-to-X transition

### Responsive Behavior
- Single breakpoint at **768px** for nav collapse
- Content grids handle responsiveness via `auto-fit` / `minmax` — no explicit breakpoints
- Hero text uses `clamp()` for fluid scaling: `clamp(34px, 5.5vw, 68px)`

### Animation & Transitions
- **Standard transition:** `all 0.2s` — snappy, barely noticeable
- **Smooth transition:** `all 0.3s` — card hovers, menu toggles
- **Slow transition:** `all 0.4s` — nav background blur on scroll
- **Hover lift pattern:** `translateY(-2px)` for subtle, `translateY(-4px)` for feature cards
- **Counter animation:** Eased cubic timing `(1 - (1-p)^3)` over 2 seconds on intersection
- **Gradient text:** `background: linear-gradient(135deg, red, gold)` with `-webkit-background-clip: text` for hero emphasis
- **Star field:** 50 randomly placed dots at 12% white opacity, fixed position, pointer-events: none

### Depth Model
The UI is **essentially flat** — no drop shadows on cards or containers. Depth is communicated entirely through **background color layering**:
1. Void (`#0b0e14`) — deepest
2. Surface (`#141820`) — cards float here
3. Surface2 (`#1c2130`) — hover states, nested elements
4. Hover highlight (`#242a3a`) — momentary elevation on interaction

The only shadow in the system is the **CTA hover glow**: `0 12px 40px rgba(230,57,70,0.25)` — a diffused crimson halo that appears on primary button hover. This deliberate restraint keeps the interface feeling grounded and data-centric.
