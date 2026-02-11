import { useState, useEffect } from 'react';
import { useAppDispatch } from '../store/hooks';
import { updateJournal, createJournal } from '../store/journalSlice';
import { TradeJournal } from '../types';
import { Button } from './ui/button';
import { Smile, BookOpen, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { useToast } from './ui/use-toast';

interface JournalDetailProps {
  journal: TradeJournal | null;
  onSave?: () => void;
}

export default function JournalDetail({ journal, onSave }: JournalDetailProps) {
  const dispatch = useAppDispatch();
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
        <div className="text-center text-muted-foreground">
          <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">Select a trade to view or create journal entry</p>
        </div>
      </div>
    );
  }

  const trade = journal.trade;
  const isProfitable = trade.profit > 0;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
            <span className="text-yellow-500 text-xl font-bold">$</span>
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold">{trade.symbol}</h2>
              <span
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  isProfitable
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}
              >
                {isProfitable ? 'WINNER' : 'LOSER'}
              </span>
            </div>
            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
              <span className="capitalize">{trade.type === 'buy' ? 'Long' : 'Short'}</span>
              <span>•</span>
              <span>Entry ${trade.openPrice.toFixed(2)}</span>
              <span>•</span>
              <span>Size {trade.volume.toFixed(2)}</span>
              <span>•</span>
              <span>{new Date(trade.closeTime).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        <Button onClick={handleSave} disabled={!hasChanges || isSaving}>
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Pre-Trade Analysis */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-400" />
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Pre-Trade Analysis
            </h3>
          </div>
          <textarea
            value={formData.preTradeAnalysis}
            onChange={(e) => handleChange('preTradeAnalysis', e.target.value)}
            placeholder="What did you see? Plan, thesis, levels, risk..."
            rows={5}
            className="w-full px-4 py-3 bg-background border rounded-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Post-Trade Review */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-purple-400" />
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Post-Trade Review
            </h3>
          </div>
          <textarea
            value={formData.postTradeReview}
            onChange={(e) => handleChange('postTradeReview', e.target.value)}
            placeholder="What happened? Execution, slippage, improvements..."
            rows={5}
            className="w-full px-4 py-3 bg-background border rounded-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Emotions and Lessons in 2 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Emotions */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Smile className="h-5 w-5 text-yellow-400" />
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Emotions
              </h3>
            </div>
            <textarea
              value={formData.emotions}
              onChange={(e) => handleChange('emotions', e.target.value)}
              placeholder="Calm, anxious, FOMO, confident..."
              rows={5}
              className="w-full px-4 py-3 bg-background border rounded-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Lessons Learned */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-green-400" />
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Lessons Learned
              </h3>
            </div>
            <textarea
              value={formData.lessonsLearned}
              onChange={(e) => handleChange('lessonsLearned', e.target.value)}
              placeholder="Key takeaways to repeat or avoid..."
              rows={5}
              className="w-full px-4 py-3 bg-background border rounded-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            />
          </div>
        </div>

        {/* Tags and Rating */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tags */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Tags
            </h3>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => handleChange('tags', e.target.value)}
              placeholder="breakout, trend, news (comma separated)"
              className="w-full px-4 py-3 bg-background border rounded-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Rating */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Rating
              </h3>
              <span className="text-2xl font-bold text-blue-400">{formData.rating}/10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={formData.rating}
              onChange={(e) => handleChange('rating', parseInt(e.target.value))}
              className="w-full h-2 bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 rounded-lg appearance-none cursor-pointer slider"
              style={{
                accentColor: formData.rating > 5 ? '#3b82f6' : '#ef4444',
              }}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1</span>
              <span>5</span>
              <span>10</span>
            </div>
          </div>
        </div>

        {/* Execution Checklist */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Execution Checklist
            </h3>
            <Button variant="outline" size="sm" onClick={handleAddChecklistItem}>
              Add Item
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {formData.executionChecklist.map((item, index) => (
              <label
                key={index}
                className="flex items-center gap-3 px-4 py-3 bg-background border rounded-lg cursor-pointer hover:bg-muted transition-colors"
              >
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={(e) => handleChecklistChange(index, e.target.checked)}
                  className="w-5 h-5 rounded border text-blue-500 focus:ring-2 focus:ring-blue-500"
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Screenshots */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Screenshots
          </h3>
          <div className="flex items-center justify-center px-6 py-12 border-2 border-dashed rounded-lg hover:border-muted-foreground transition-colors cursor-pointer">
            <div className="text-center">
              <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">Click to add images</p>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 10MB</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
