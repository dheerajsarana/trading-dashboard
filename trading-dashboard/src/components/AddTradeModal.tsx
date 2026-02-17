import { useState } from 'react';
import { useAppDispatch } from '../store/hooks';
import { createManualTrade } from '../store/tradingSlice';
import { TradeFormData } from '../types';
import { Button } from './ui/button';
import { X, Plus } from 'lucide-react';

interface AddTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AddTradeModal({ isOpen, onClose, onSuccess }: AddTradeModalProps) {
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<TradeFormData>({
    symbol: '',
    type: 'buy',
    position: '',
    volume: 0,
    openPrice: 0,
    closePrice: 0,
    stopLoss: 0,
    takeProfit: 0,
    openTime: new Date().toISOString().slice(0, 16),
    closeTime: new Date().toISOString().slice(0, 16),
    commission: 0,
    swap: 0,
    profit: 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['volume', 'openPrice', 'closePrice', 'stopLoss', 'takeProfit', 'commission', 'swap', 'profit'].includes(name)
        ? parseFloat(value) || 0
        : value,
    }));
  };

  const calculateProfit = () => {
    const {
      type,
      volume,
      openPrice,
      closePrice,
      commission = 0,
      swap = 0,
      symbol
    } = formData;

    if (!volume || !openPrice || !closePrice || !symbol) return 0;

    const priceDiff =
      type === 'buy'
        ? closePrice - openPrice
        : openPrice - closePrice;

    let contractSize = 1;

    if (symbol.toUpperCase() === 'XAUUSD') {
      contractSize = 100;
    }

    if (symbol.toUpperCase() === 'BTCUSD') {
      contractSize = 1;
    }

    const pnl = priceDiff * contractSize * volume;

    return pnl - commission - swap;
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.symbol.trim()) {
      setError('Symbol is required');
      return;
    }

    if (formData.volume <= 0) {
      setError('Volume must be greater than 0');
      return;
    }

    if (formData.openPrice <= 0) {
      setError('Entry price must be greater than 0');
      return;
    }

    if (formData.closePrice && formData.closePrice <= 0) {
      setError('Exit price must be greater than 0');
      return;
    }

    const profit = calculateProfit();

    const tradeData: TradeFormData = {
      ...formData,
      symbol: formData.symbol.toUpperCase(),
      profit,
      openTime: new Date(formData.openTime as string),
      closeTime: formData.closeTime ? new Date(formData.closeTime as string) : new Date(),
    };

    setIsSubmitting(true);
    try {
      await dispatch(createManualTrade(tradeData)).unwrap();
      setFormData({
        symbol: '',
        type: 'buy',
        position: '',
        volume: 0,
        openPrice: 0,
        closePrice: 0,
        stopLoss: 0,
        takeProfit: 0,
        openTime: new Date().toISOString().slice(0, 16),
        closeTime: new Date().toISOString().slice(0, 16),
        commission: 0,
        swap: 0,
        profit: 0,
      });
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err || 'Failed to create trade');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Plus className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-lg font-bold tracking-tight">Add Manual Trade</h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-muted"
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 text-sm text-loss bg-loss/10 border border-loss/20 rounded-lg">
              {error}
            </div>
          )}

          {/* Row 1: Symbol and Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="symbol" className="text-xs font-medium text-muted-foreground">
                Symbol *
              </label>
              <input
                id="symbol"
                name="symbol"
                type="text"
                value={formData.symbol}
                onChange={handleChange}
                placeholder="EURUSD"
                required
                className="input-base"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="type" className="text-xs font-medium text-muted-foreground">
                Type *
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="input-base"
              >
                <option value="buy">Long (Buy)</option>
                <option value="sell">Short (Sell)</option>
              </select>
            </div>
          </div>

          {/* Row 2: Entry and Exit Price */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="openPrice" className="text-xs font-medium text-muted-foreground">
                Entry Price *
              </label>
              <input
                id="openPrice"
                name="openPrice"
                type="number"
                step="0.00001"
                value={formData.openPrice || ''}
                onChange={handleChange}
                placeholder="1.12345"
                required
                className="input-base font-mono-num"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="closePrice" className="text-xs font-medium text-muted-foreground">
                Exit Price
              </label>
              <input
                id="closePrice"
                name="closePrice"
                type="number"
                step="0.00001"
                value={formData.closePrice || ''}
                onChange={handleChange}
                placeholder="1.12456"
                className="input-base font-mono-num"
              />
            </div>
          </div>

          {/* Row 3: Volume and Position */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="volume" className="text-xs font-medium text-muted-foreground">
                Volume *
              </label>
              <input
                id="volume"
                name="volume"
                type="number"
                step="0.01"
                value={formData.volume || ''}
                onChange={handleChange}
                placeholder="0.10"
                required
                className="input-base font-mono-num"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="position" className="text-xs font-medium text-muted-foreground">
                Position ID
              </label>
              <input
                id="position"
                name="position"
                type="text"
                value={formData.position || ''}
                onChange={handleChange}
                placeholder="#12345"
                className="input-base"
              />
            </div>
          </div>

          {/* Row 4: Stop Loss and Take Profit */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="stopLoss" className="text-xs font-medium text-muted-foreground">
                Stop Loss
              </label>
              <input
                id="stopLoss"
                name="stopLoss"
                type="number"
                step="0.00001"
                value={formData.stopLoss || ''}
                onChange={handleChange}
                placeholder="1.12000"
                className="input-base font-mono-num"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="takeProfit" className="text-xs font-medium text-muted-foreground">
                Take Profit
              </label>
              <input
                id="takeProfit"
                name="takeProfit"
                type="number"
                step="0.00001"
                value={formData.takeProfit || ''}
                onChange={handleChange}
                placeholder="1.12500"
                className="input-base font-mono-num"
              />
            </div>
          </div>

          {/* Row 5: Entry and Exit Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="openTime" className="text-xs font-medium text-muted-foreground">
                Entry Date *
              </label>
              <input
                id="openTime"
                name="openTime"
                type="datetime-local"
                value={formData.openTime as string}
                onChange={handleChange}
                required
                className="input-base"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="closeTime" className="text-xs font-medium text-muted-foreground">
                Exit Date
              </label>
              <input
                id="closeTime"
                name="closeTime"
                type="datetime-local"
                value={formData.closeTime as string}
                onChange={handleChange}
                className="input-base"
              />
            </div>
          </div>

          {/* Row 6: Commission and Swap */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="commission" className="text-xs font-medium text-muted-foreground">
                Commission
              </label>
              <input
                id="commission"
                name="commission"
                type="number"
                step="0.01"
                value={formData.commission || ''}
                onChange={handleChange}
                placeholder="0.00"
                className="input-base font-mono-num"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="swap" className="text-xs font-medium text-muted-foreground">
                Swap
              </label>
              <input
                id="swap"
                name="swap"
                type="number"
                step="0.01"
                value={formData.swap || ''}
                onChange={handleChange}
                placeholder="0.00"
                className="input-base font-mono-num"
              />
            </div>
          </div>

          {/* Calculated Profit Display */}
          {formData.volume > 0 && formData.openPrice > 0 && formData.closePrice && formData.closePrice > 0 && (
            <div className="p-3 bg-secondary/50 rounded-lg border">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium">Calculated P&L</span>
                <span className={`text-lg font-bold font-mono-num ${calculateProfit() >= 0 ? 'text-profit' : 'text-loss'}`}>
                  {calculateProfit() >= 0 ? '+' : ''}${calculateProfit().toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Adding...' : 'Add Trade'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
