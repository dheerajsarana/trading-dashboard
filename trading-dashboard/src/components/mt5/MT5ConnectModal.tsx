import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { connectMT5Account, setConnectModalOpen } from '../../store/mt5Slice';
import { MT5ConnectFormData } from '../../types';
import { Button } from '../ui/button';
import { X, Eye, EyeOff } from 'lucide-react';

export default function MT5ConnectModal() {
  const dispatch = useAppDispatch();
  const { connectModalOpen, isLoading, error } = useAppSelector((state) => state.mt5);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState<MT5ConnectFormData>({
    accountNumber: '',
    investorPassword: '',
    server: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'accountNumber' ? value : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.accountNumber) {
      return;
    }

    if (!formData.investorPassword) {
      return;
    }

    if (!formData.server) {
      return;
    }

    try {
      await dispatch(connectMT5Account(formData)).unwrap();
      // Reset form on success
      setFormData({
        accountNumber: '',
        investorPassword: '',
        server: '',
      });
    } catch (err) {
      // Error is handled by Redux
      console.error('Failed to connect MT5 account:', err);
    }
  };

  const handleClose = () => {
    dispatch(setConnectModalOpen(false));
  };

  if (!connectModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg shadow-xl w-full max-w-md border border-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div>
            <h2 className="text-xl font-semibold text-white">Connect MT5 Account</h2>
            <p className="text-sm text-gray-400 mt-1">Link your MetaTrader 5 account for live data sync</p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-md">
              {error}
            </div>
          )}

          {/* Account Number */}
          <div className="space-y-2">
            <label htmlFor="accountNumber" className="text-sm font-medium text-gray-300">
              Account Number <span className="text-red-500">*</span>
            </label>
            <input
              id="accountNumber"
              name="accountNumber"
              type="number"
              value={formData.accountNumber}
              onChange={handleChange}
              placeholder="10181303"
              required
              className="w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Investor Password */}
          <div className="space-y-2">
            <label htmlFor="investorPassword" className="text-sm font-medium text-gray-300">
              Investor Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="investorPassword"
                name="investorPassword"
                type={showPassword ? 'text' : 'password'}
                value={formData.investorPassword}
                onChange={handleChange}
                placeholder="Enter investor password"
                required
                className="w-full px-3 py-2 pr-10 border border-gray-700 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Read-only password for accessing account data. Never your main password.
            </p>
          </div>

          {/* Server */}
          <div className="space-y-2">
            <label htmlFor="server" className="text-sm font-medium text-gray-300">
              Server <span className="text-red-500">*</span>
            </label>
            <input
              id="server"
              name="server"
              type="text"
              value={formData.server}
              onChange={handleChange}
              placeholder="MavenTrade-Server"
              required
              className="w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500">
              The MT5 server name (e.g., MavenTrade-Server, Deriv-Demo, etc.)
            </p>
          </div>

          {/* Info Box */}
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-md">
            <p className="text-xs text-blue-400">
              <strong>Note:</strong> Your credentials are encrypted and stored securely. We only use
              investor/read-only passwords for maximum security.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? 'Connecting...' : 'Connect Account'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
