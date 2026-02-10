# Quick Setup Guide - Trading Analytics Dashboard

## Installation Steps

1. **Extract the folder** to your desired location

2. **Open Terminal/Command Prompt** in the `trading-dashboard` folder

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser** and go to: `http://localhost:5173`

## First Time Use

1. Click "Upload MT5 Data" button
2. Select your Excel file with MT5 trading data
3. Dashboard will automatically populate with your trading analytics

## Excel File Requirements

Your Excel file must have these columns (in this order):
- Time (opening time)
- Position
- Symbol
- Type (buy/sell/long/short)
- Volume
- Price (opening)
- S / L (stop loss)
- T / P (take profit)
- Time (closing time - can be "Time.1" or "Time_1")
- Price (closing price - can be "Price.1" or "Price_1")
- Commission
- Swap
- Profit

## Build for Production

To create a production build:
```bash
npm run build
```

The optimized files will be in the `dist` folder.

## Troubleshooting

### npm install fails
- Make sure you have Node.js v18+ installed
- Try: `npm cache clean --force` then `npm install` again

### Port 5173 already in use
- The app will automatically try the next available port
- Or you can specify a port: `npm run dev -- --port 3000`

### Excel parsing errors
- Ensure your Excel file has all required columns
- Check that column names match exactly (case-sensitive)
- Try exporting a fresh file from MT5

## Features

✅ Real-time P&L calculations
✅ Win rate and profit factor analysis
✅ Interactive equity curve
✅ Trading calendar with daily P&L
✅ Long vs Short performance comparison
✅ Top performing symbols
✅ Day of week analysis
✅ Recent trades history
✅ Quick stats dashboard
✅ Time period filtering
✅ Trade outcome filtering

## Support

For issues or questions:
1. Check the README.md for detailed documentation
2. Verify your Excel file format matches the requirements
3. Check browser console for error messages

Happy Trading! 📈
