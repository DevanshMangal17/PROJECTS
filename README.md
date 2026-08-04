# Warehouse Manpower Planning Simulator

**Developed by:** Devansh & Shivam  
**Version:** v2.4 Enterprise  
**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS, Recharts, Lucide Icons  

---

## 📌 Executive Overview

The **Warehouse Manpower Planning Simulator** is an enterprise-grade Operations Research & DC (Distribution Center) Workforce Optimization platform designed for modern warehouse managers, supply chain analysts, and shift supervisors.

It combines dynamic throughput simulation, automated 31-day shift rotation engines (`A → B → C`), automated labor rule enforcement, shift swap compliance logging, and AI-driven staffing shortage recommendations into a single, cohesive dashboard.

---

## ✨ Key Features & Capability Modules

### 1. 🗓️ 31-Day Monthly Shift Rotation Planner
* **Automated Rotation Sequence (`A → B → C`):** Rotates teams across Morning (Shift A), Evening (Shift B), and Night (Shift C) on a weekly basis while maintaining optimal operational coverage.
* **Balanced Deployment Ratios:** Enforces standard distribution center ratios (e.g., **50% Shift A**, **40% Shift B**, **10% Shift C**).
* **Team Staggering:** Supports custom rotation groups (**Team Alpha**, **Team Bravo**, **Team Charlie**, **Team Delta**) with staggered weekly off assignments.
* **Labor Rule Enforcement:** Automatically logs scheduled weekly offs, calculates compensatory off (CO) balances for associates working on off days, and caps consecutive working days to a maximum limit of 9 days.
* **Interactive Editing & History:** In-cell shift editing with full **Undo / Redo** history and single-week or full-month schedule regeneration.

### 2. 🔀 Supervisor Shift Swap Manager & Compliance Logger
* **Live Swap Validation:** Evaluates requested shift swaps between associates against labor laws, consecutive work limits, and department cross-training skills.
* **Audit Trail:** Logs approved and rejected swap requests with supervisor names, request dates, and validation rationale.

### 3. 🤖 AI Rotation Intelligence Engine
* **Automated Alerts:** Provides real-time insights for rotation cycle transitions, forecasted staffing shortages due to medical leaves, and upcoming compensatory off deadlines.
* **Actionable Recommendations:** Allows shift supervisors to execute one-click AI recommendations to reassign cross-trained staff.

### 4. 📊 DC Workforce Simulator & Operational Dashboard
* **Dynamic Capacity Modeling:** Simulates inbound receiving, picking, packing, and dispatch operations based on order volume, items per order, pick rates, and target SLAs.
* **Scenario Stress-Testing:** Model the impact of volume spikes, high absenteeism rates, or OT cap restrictions on overall DC throughput and operational cost.

### 5. ⏱️ Shift Timeline & Hourly Load Balancing
* **Hourly Capacity vs. Demand:** Visualizes 24-hour warehouse workload vs. staffing capacity across Shift A (06:00 - 14:00), Shift B (14:00 - 22:00), and Shift C (22:00 - 06:00).

### 6. 💰 Financial & Cost Analysis Engine
* **Labor Cost Breakdown:** Tracks base wages, overtime premiums, temp labor costs, and financial penalties from SLA breach risks.

### 7. 📑 Downloadable Roster & Compliance Reports
* **Export Options:** One-click CSV export and print-ready PDF support for:
  * 31-Day Monthly Shift Rosters
  * Weekly Rotation Compliance Audits
  * Monthly Attendance Registers
  * Overtime & Temp Worker Ledgers
  * Compensatory Off Balance Registers
  * Shift Swap Logs

---

## 🛠️ Project Architecture & Directory Structure

```
├── src/
│   ├── components/
│   │   ├── Header.tsx                   # Main top app header & brand banner
│   │   ├── DashboardView.tsx            # Main DC simulator dashboard
│   │   ├── ShiftTimelineView.tsx        # 24-Hour workload & hourly timeline
│   │   ├── ScenarioView.tsx             # Interactive scenario stress tester
│   │   ├── CostAnalysisView.tsx         # Cost & overtime analytics
│   │   ├── ResourcesView.tsx            # Employee roster master table
│   │   ├── BenchmarksView.tsx           # WMS operational benchmarks
│   │   └── roster/
│   │       ├── RosterContainer.tsx      # Main tab orchestrator for roster modules
│   │       ├── MonthlyCalendarView.tsx  # 31-Day interactive shift calendar
│   │       ├── ShiftSwapManagerView.tsx # Shift swap validator & compliance logger
│   │       ├── AIRotationIntelligencePanel.tsx # AI insights feed
│   │       ├── MonthlyAnalyticsView.tsx # Recharts visuals & 50:40:10 deployment charts
│   │       ├── MonthlyReportsView.tsx   # CSV export & printable report center
│   │       ├── RosterGrid.tsx           # Weekly 7-day grid view
│   │       ├── AttendancePanel.tsx      # Shortage & replacement recommendation engine
│   │       └── ShiftDashboardView.tsx   # Shift allocation ratios
│   ├── utils/
│   │   ├── monthlyRotationEngine.ts     # 31-day schedule generator & labor rules
│   │   ├── rosterEngine.ts              # 8-priority replacement engine & metrics
│   │   └── simulationEngine.ts          # WMS throughput math model
│   ├── types/
│   │   └── roster.ts                    # TypeScript types & shift interfaces
│   ├── data/
│   │   └── mockEmployees.ts             # Default associate dataset
│   ├── App.tsx                          # Root Application component
│   ├── main.tsx                         # Vite React DOM entry point
│   └── index.css                        # Global Tailwind CSS imports
├── package.json                         # Dependencies & npm scripts
└── README.md                            # Project Documentation
```

---

## 🚀 Getting Started Locally

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/warehouse-manpower-simulator.git
   cd warehouse-manpower-simulator
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:3000`.

4. **Build for Production:**
   ```bash
   npm run build
   ```

---

## 📋 Shift Codes Legend

| Code | Shift Name | Standard Hours | Description |
| :---: | :--- | :---: | :--- |
| **A** | Shift A (Morning) | 06:00 – 14:00 | Primary fulfillment shift (50% staff) |
| **B** | Shift B (Evening) | 14:00 – 22:00 | Secondary dispatch shift (40% staff) |
| **C** | Shift C (Night) | 22:00 – 06:00 | Maintenance & inbound replenishment (10% staff) |
| **OFF** | Weekly Off | — | Scheduled rest day |
| **CO** | Compensatory Off | — | Earned day off for working on a weekly off |
| **ABS** | Unplanned Absence | — | Associate absent without prior leave approval |
| **LV** | Approved Leave | — | Pre-approved medical or personal leave |
| **TR** | Training | 09:00 – 17:00 | Skill development or safety onboarding |
| **OT** | Overtime Shift | — | Extended shift for peak volume coverage |

---

## 🤝 Authors & Credits

Designed and built by **Devansh & Shivam**.  
*Enterprise WMS Manpower Planning & Workforce Optimization Engine.*
