# LedgerFlow Accounting

> **AI-Powered Double-Entry Accounting, Invoicing, Inventory Automation & Financial Intelligence**

LedgerFlow is an enterprise-grade accounting application designed for retail shops, growing businesses, and modern enterprises. It integrates automated double-entry bookkeeping, multi-currency invoicing, AI-powered receipt scanning, predictive customer purchasing analytics, live stock reordering, and hands-free voice command execution.

---

## Key Features

### 1. General Ledger & Double-Entry Bookkeeping
- **Standard Chart of Accounts**: Assets, Liabilities, Equity, Revenue, and Expense account categorization.
- **Journal Vouchers & Debit/Credit Balancing**: Automatic double-entry journal postings with real-time balance validation.
- **Daybook & Transaction Auditing**: Chronological transaction recording with search, date filtering, and ledger drilldowns.

### 2. Invoicing, Billing & Accounts Receivable
- **Customizable Invoices**: Line items, tiered tax rates, discounts, custom payment terms (Net 15, Net 30, Net 60), and customer notes.
- **Automated Payment Tracking**: Mark paid, partial payments, and overdue tracking with 1-click reminders.
- **AI Prompt Invoicing**: Generate structured invoices from natural language prompts.
- **PDF Export & Print**: Vectorized PDF downloads with customized branding.

### 3. Purchases, Bills & Accounts Payable
- **Purchase Invoices**: Record supplier bills, inventory purchases, and operational overhead.
- **Vendor Directory**: Manage supplier terms, contact details, and purchase histories.
- **Payment Vouchers**: Issue payment receipts and link directly to purchase records.

### 4. Real-Time Financial Statements & Reports
- **Executive Financial Dashboard**: Real-time KPI summaries, cash runway estimator, revenue vs. expense charts, and top expense breakdowns.
- **Profit & Loss (P&L)**: Operating income, Cost of Goods Sold (COGS), Gross Profit, Operating Expenses, and Net Margin.
- **Balance Sheet**: Current/Non-Current Assets, Liabilities, and Owner's Equity.
- **Assets & Liabilities Summary**: Net worth, working capital, and debt-to-asset ratios.
- **Cash Flow Statement**: Operating, Investing, and Financing cash flow tracking.
- **Tax & VAT Audit Report**: Output tax collected vs. Input tax deductions with net liability computation.
- **1-Click PDF Report Generation**: Export formatted financial statements.

### 5. AI Financial Copilot & Receipt Scanner
- **CPA Financial Copilot**: Conversational financial intelligence that analyzes ledger health, identifies expense anomalies, and executes commands.
- **Multimodal OCR Receipt Scanner**: Extract merchant name, date, itemized lines, total amount, taxes, and deductible status directly from receipt photos.
- **Model Fallback Resilience**: Automated multi-model redundancy (`gemini-3.8-flash`, `gemini-3.1-flash-lite`, `gemini-flash-latest`) for uptime during high traffic.

### 6. Retail Inventory & Supply Chain Automation
- **SKU & Stock Tracking**: Real-time units on hand, reorder thresholds, and unit valuation.
- **Automated Restock Forecasts**: Dynamic burn rate analysis and automated purchase order suggestions.
- **Dead Stock & Stockout Alerts**: Highlight high-velocity items and stagnant inventory.

### 7. Predictive Customer Analytics
- **Customer Segmentation**: Automatic categorization into VIP Champions, Loyal Accounts, Potential, and At-Risk segments.
- **Next-Purchase Date Prediction**: Machine learning purchasing cycle estimation and churn likelihood scoring.
- **Automated Campaign Recommendations**: Targeted discount vouchers and bulk order proposals.

### 8. VoiceOver & Hands-Free Voice Commands
- **Voice Navigation**: Navigate anywhere by speaking (*"Go to invoices"*, *"Show reports"*, *"Open inventory"*).
- **Voice Invoicing & Expense Logging**: Create sales or expenses via voice (*"Create invoice for $500 to Tesla"*).
- **Spoken Financial Audio (TTS)**: Hear executive summaries and financial metrics read aloud.
- **Accessibility & Customization**: Adjustable speech rate, sound effect chimes, and live captions.

### 9. Progressive Web App (PWA) & Offline Reliability
- **Offline Cache**: IndexedDB and localStorage resilience ensures seamless operation without internet connectivity.
- **Quick PIN & Session Security**: Fast lock screen and role-based data protection.
- **Installable Desktop/Mobile App**: Fully compliant PWA manifest with custom icons.

---

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Framer Motion
- **Charts & Visualizations**: Recharts, D3.js math utilities
- **Backend & APIs**: Express.js, `@google/genai` TypeScript SDK
- **PDF & Document Generation**: jsPDF, html2canvas
- **Audio & Speech**: Web Speech Recognition API, Web Speech Synthesis (TTS), Web Audio API

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or bun

### 1. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/your-username/ledgerflow-accounting.git
cd ledgerflow-accounting
npm install
```

### 2. Environment Variables
Create a `.env` file in the root directory (refer to `.env.example`):
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Running Development Server
Start the full-stack dev server:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000`.

### 4. Production Build
Build client and server bundles:
```bash
npm run build
npm start
```

---

## Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `V` | Start Voice Command / Push to Talk |
| `Esc` | Close Modals / Stop VoiceOver Audio |
| `Alt + 1` | Navigate to Executive Dashboard |
| `Alt + 2` | Navigate to Invoices |
| `Alt + 3` | Navigate to Financial Reports |

---

## License

This project is licensed under the [MIT License](LICENSE).
