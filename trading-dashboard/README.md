# Trading Analytics Dashboard

A comprehensive, professional-grade trading analytics dashboard built with React, TypeScript, Redux, shadcn/ui, and Tailwind CSS for analyzing MT5 trading data.

## 🚀 Features

### Core Analytics
- 📊 **Performance Metrics**: Total P&L, Win Rate, Profit Factor, Expectancy
- 📈 **Equity Curve**: Visualize cumulative P&L progression over time
- 📅 **Trading Calendar**: Daily P&L heatmap with clickable days
- 🎯 **Quick Stats**: Average winner/loser, best/worst trades, streaks, risk-reward
- 📉 **Long vs Short Analysis**: Compare performance by trade direction
- 🏆 **Top Symbols**: Best performing trading instruments
- 📊 **Day Performance**: Find your most profitable trading days
- 🔍 **Trade Filters**: Filter by time period, asset, and trade outcome
- 📋 **Recent Trades**: View your last 10 trades

### Advanced Analytics
- 💹 **Drawdown Intelligence**:
  - Max Drawdown ($ and %)
  - Average Drawdown
  - Drawdown Duration (days to recover)
  - Recovery Factor
  - Current Drawdown Status

- ⏱️ **Trade Duration Analysis**:
  - Average hold time (winners vs losers)
  - Optimal holding window classification
  - Duration-based performance insights

- 🌍 **Session & Kill-Zone Analytics**:
  - Asia Session (00:00 - 09:00 UTC)
  - London Session (08:00 - 17:00 UTC)
  - New York Session (13:00 - 22:00 UTC)
  - London-NY Overlap (13:00 - 17:00 UTC) - The Kill Zone
  - Performance metrics by session (trades, P&L, win rate, expectancy)

### UI/UX Features
- 🎨 **Modern UI**: Built with shadcn/ui components
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile
- 🎯 **Navigation Sidebar**: Easy access to all sections
- 🔄 **State Management**: Redux for efficient data management
- ⚡ **Fast Performance**: Optimized rendering and calculations
- 🌙 **Dark Theme**: Easy on the eyes for long analysis sessions

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Navigate to the project directory:
```bash
cd trading-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

### Excel File Format

Your MT5 Excel file should have the following columns:
- **Time**: Opening time of the trade
- **Position**: Position identifier
- **Symbol**: Trading instrument (e.g., EURUSD, GBPUSD)
- **Type**: Trade type (Buy/Long or Sell/Short)
- **Volume**: Trade volume/lot size
- **Price**: Opening price
- **S / L**: Stop loss price
- **T / P**: Take profit price
- **Time** (second column): Closing time
- **Price** (second column): Closing price
- **Commission**: Trading commission
- **Swap**: Swap fee
- **Profit**: Trade profit/loss

### How to Use

1. **Upload Data**: Click the "Upload MT5 Data" button and select your Excel file
2. **Select Time Period**: Choose from Today, 7 Days, 30 Days, 3 Months, 1 Year, or All Time
3. **Filter Trades**: View All Trades, Winners only, or Losers only
4. **Analyze**: Explore various metrics and visualizations
5. **Calendar**: Click on any day in the calendar to view trades from that day

## Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist` folder.

## Technologies Used

- **React 18**: UI framework
- **TypeScript**: Type safety
- **Redux Toolkit**: State management
- **shadcn/ui**: High-quality UI components
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling
- **Vite**: Build tool and dev server
- **Recharts**: Chart library
- **XLSX**: Excel file parsing
- **Lucide React**: Beautiful icons

## Key Metrics Explained

- **Win Rate**: Percentage of profitable trades
- **Profit Factor**: Gross profit divided by gross loss (>1.5 is good)
- **Expectancy**: Expected profit per trade based on your statistics
- **Risk-Reward**: Average winner divided by average loser

## Project Structure

```
trading-dashboard/
├── src/
│   ├── components/          # React components
│   │   ├── FileUpload.tsx
│   │   ├── MetricCard.tsx
│   │   ├── EquityCurve.tsx
│   │   ├── QuickStats.tsx
│   │   ├── TradingCalendar.tsx
│   │   ├── DayTrades.tsx
│   │   └── AdditionalComponents.tsx
│   ├── types/               # TypeScript types
│   │   └── index.ts
│   ├── utils/               # Utility functions
│   │   ├── excelParser.ts
│   │   └── statistics.ts
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

## License

MIT
