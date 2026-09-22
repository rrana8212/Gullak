# Hisab

A simple personal ledger for tracking incoming and outgoing money in INR, with a monthly graph, categories, and CSV export.

Data stays in your browser. No account required.

## Run locally

```bash
npm install
npm run dev
```

Then open [http://localhost:8080](http://localhost:8080).

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server on port 8080 |
| `npm run build` | Production build |
| `npm run typecheck` | TypeScript check |

## What’s inside

- **Home** — this month’s net, income, and expense, plus a 6-month bar chart
- **Activity** — add, edit, delete, search, and filter transactions
- **Insights** — category split, CSV export, and local backup/restore
