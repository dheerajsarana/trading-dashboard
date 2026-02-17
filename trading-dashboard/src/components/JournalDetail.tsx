import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { formatDateInTimezone } from '../utils/timezone';
import { updateJournal, createJournal } from '../store/journalSlice';
import { fetchTradeScreenshots } from '../store/screenshotSlice';
import { TradeJournal } from '../types';
import { Button } from './ui/button';
import { Smile, BookOpen, CheckCircle, Image as ImageIcon, Save } from 'lucide-react';
import { useToast } from './ui/use-toast';
import { ScreenshotUploader, ScreenshotGallery } from './screenshots';

interface JournalDetailProps {
  journal: TradeJournal | null;
  onSave?: () => void;
}

const getSymbolCategory = (symbol: string): { color: string; bg: string; label: string } => {
  const s = symbol.toUpperCase();
  if (s.includes('BTC') || s.includes('ETH') || s.includes('SOL') || s.includes('BNB') || s.includes('XRP')) {
    return { color: 'text-crypto', bg: 'bg-crypto/10', label: 'C' };
  }
  if (s.includes('XAU') || s.includes('XAG') || s.includes('GOLD') || s.includes('SILVER')) {
    return { color: 'text-metal', bg: 'bg-metal/10', label: 'M' };
  }
  return { color: 'text-forex', bg: 'bg-forex/10', label: 'F' };
};

export default function JournalDetail({ journal, onSave }: JournalDetailProps) {
  const dispatch = useAppDispatch();
  const timezone = useAppSelector((state) => state.trading.timezone);
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const [formData, setFormData] = useState({
    preTradeAnalysis: journal?.preTradeAnalysis || '',
    postTradeReview: journal?.postTradeReview || '',
    emotions: journal?.emotions || '',
    lessonsLearned: journal?.lessonsLearned || '',
    tags: journal?.tags?.join(', ') || '',
    rating: journal?.rating || 5,
    executionChecklist: journal?.executionChecklist?.items || [
      { label: 'Followed plan', checked: false },
      { label: 'Proper risk', checked: false },
      { label: 'Good entry', checked: false },
      { label: 'Patient exit', checked: false },
    ],
  });

  useEffect(() => {
    if (journal) {
      setFormData({
        preTradeAnalysis: journal.preTradeAnalysis || '',
        postTradeReview: journal.postTradeReview || '',
        emotions: journal.emotions || '',
        lessonsLearned: journal.lessonsLearned || '',
        tags: journal.tags?.join(', ') || '',
        rating: journal.rating || 5,
        executionChecklist: journal.executionChecklist?.items || [
          { label: 'Followed plan', checked: false },
          { label: 'Proper risk', checked: false },
          { label: 'Good entry', checked: false },
          { label: 'Patient exit', checked: false },
        ],
      });
      setHasChanges(false);
    }
  }, [journal]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleChecklistChange = (index: number, checked: boolean) => {
    const newChecklist = [...formData.executionChecklist];
    newChecklist[index] = { ...newChecklist[index], checked };
    handleChange('executionChecklist', newChecklist);
  };

  const handleAddChecklistItem = () => {
    const newItem = prompt('Enter checklist item:');
    if (newItem) {
      handleChange('executionChecklist', [
        ...formData.executionChecklist,
        { label: newItem, checked: false },
      ]);
    }
  };

  const handleSave = async () => {
    if (!journal) return;

    setIsSaving(true);
    try {
      const tagsArray = formData.tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const journalData = {
        preTradeAnalysis: formData.preTradeAnalysis,
        postTradeReview: formData.postTradeReview,
        emotions: formData.emotions,
        lessonsLearned: formData.lessonsLearned,
        tags: tagsArray,
        rating: formData.rating,
        executionChecklist: { items: formData.executionChecklist },
        status: 'journaled' as const,
      };

      if (journal.id) {
        await dispatch(updateJournal({ id: journal.id, data: journalData })).unwrap();
      } else {
        await dispatch(
          createJournal({
            tradeId: journal.tradeId,
            ...journalData,
          })
        ).unwrap();
      }

      setHasChanges(false);
      toast({
        title: 'Journal saved',
        description: 'Your trade journal has been successfully saved.',
        variant: 'success',
      });
      onSave?.();
    } catch (error) {
      console.error('Failed to save journal:', error);
      toast({
        title: 'Save failed',
        description: 'Failed to save journal. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!journal || !journal.trade) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-8 w-8 text-muted-foreground/40" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">Select a trade to journal</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Choose from the list on the left</p>
        </div>
      </div>
    );
  }

  const trade = journal.trade;
  const isProfitable = trade.profit > 0;
  const category = getSymbolCategory(trade.symbol);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl ${category.bg} flex items-center justify-center`}>
            <span className={`text-sm font-bold ${category.color}`}>{category.label}</span>
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold tracking-tight">{trade.symbol}</h2>
              <span
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border ${
                  isProfitable
                    ? 'bg-profit/10 text-profit border-profit/20'
                    : 'bg-loss/10 text-loss border-loss/20'
                }`}
              >
                {isProfitable ? 'WINNER' : 'LOSER'}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              <span className={isProfitable ? 'text-profit' : 'text-loss'}>
                {trade.type === 'buy' ? 'Long' : 'Short'}
              </span>
              <span className="text-border">|</span>
              <span className="font-mono-num">${trade.openPrice.toFixed(2)}</span>
              <span className="text-border">|</span>
              <span className="font-mono-num">Size {trade.volume.toFixed(2)}</span>
              <span className="text-border">|</span>
              <span>{formatDateInTimezone(trade.closeTime, timezone, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>
        </div>
        <Button onClick={handleSave} disabled={!hasChanges || isSaving} size="sm">
          <Save className="h-3.5 w-3.5 mr-1.5" />
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Pre-Trade Analysis */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Pre-Trade Analysis
            </h3>
          </div>
          <textarea
            value={formData.preTradeAnalysis}
            onChange={(e) => handleChange('preTradeAnalysis', e.target.value)}
            placeholder="What did you see? Plan, thesis, levels, risk..."
            rows={4}
            className="input-base resize-none"
          />
        </div>

        {/* Post-Trade Review */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-crypto" />
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Post-Trade Review
            </h3>
          </div>
          <textarea
            value={formData.postTradeReview}
            onChange={(e) => handleChange('postTradeReview', e.target.value)}
            placeholder="What happened? Execution, slippage, improvements..."
            rows={4}
            className="input-base resize-none"
          />
        </div>

        {/* Emotions and Lessons in 2 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Smile className="h-4 w-4 text-gold" />
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Emotions
              </h3>
            </div>
            <textarea
              value={formData.emotions}
              onChange={(e) => handleChange('emotions', e.target.value)}
              placeholder="Calm, anxious, FOMO, confident..."
              rows={4}
              className="input-base resize-none"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-profit" />
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Lessons Learned
              </h3>
            </div>
            <textarea
              value={formData.lessonsLearned}
              onChange={(e) => handleChange('lessonsLearned', e.target.value)}
              placeholder="Key takeaways to repeat or avoid..."
              rows={4}
              className="input-base resize-none"
            />
          </div>
        </div>

        {/* Tags and Rating */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Tags
            </h3>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => handleChange('tags', e.target.value)}
              placeholder="breakout, trend, news (comma separated)"
              className="input-base"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Rating
              </h3>
              <span className="text-lg font-bold font-mono-num text-primary">{formData.rating}/10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={formData.rating}
              onChange={(e) => handleChange('rating', parseInt(e.target.value))}
              className="w-full h-2 bg-gradient-to-r from-loss via-gold to-primary rounded-lg appearance-none cursor-pointer"
              style={{
                accentColor: formData.rating > 5 ? 'hsl(var(--primary))' : 'hsl(var(--loss))',
              }}
            />
            <div className="flex justify-between text-[10px] text-muted-foreground font-mono-num">
              <span>1</span>
              <span>5</span>
              <span>10</span>
            </div>
          </div>
        </div>

        {/* Execution Checklist */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Execution Checklist
            </h3>
            <Button variant="outline" size="sm" onClick={handleAddChecklistItem} className="h-7 text-xs">
              Add Item
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {formData.executionChecklist.map((item, index) => (
              <label
                key={index}
                className="flex items-center gap-3 px-4 py-3 bg-secondary/50 border rounded-lg cursor-pointer hover:bg-secondary transition-colors"
              >
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={(e) => handleChecklistChange(index, e.target.checked)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/30"
                />
                <span className="text-sm">{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Screenshots */}
        {trade.id && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-metal" />
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Screenshots
              </h3>
            </div>

            <ScreenshotUploader
              tradeId={trade.id}
              mt5TradeId={(trade as any).mt5TradeId}
              onUploadComplete={() => {
                dispatch(fetchTradeScreenshots({
                  tradeId: trade.id,
                  mt5TradeId: (trade as any).mt5TradeId
                }));
                toast({
                  title: 'Screenshots uploaded',
                  description: 'Your screenshots have been uploaded successfully.',
                  variant: 'success',
                });
              }}
            />

            <ScreenshotGallery
              tradeId={trade.id}
              mt5TradeId={(trade as any).mt5TradeId}
            />
          </div>
        )}
      </div>
    </div>
  );
}
