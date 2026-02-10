import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { journalApi, GetJournalsParams } from '../api/journal.api';
import { TradeJournal, JournalFormData, JournalStats, PaginationInfo } from '../types';

interface JournalState {
  journals: TradeJournal[];
  selectedJournal: TradeJournal | null;
  stats: JournalStats | null;
  pagination: PaginationInfo | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: JournalState = {
  journals: [],
  selectedJournal: null,
  stats: null,
  pagination: null,
  isLoading: false,
  error: null,
};

// Async Thunks

export const fetchJournals = createAsyncThunk(
  'journal/fetchJournals',
  async (params?: GetJournalsParams, { rejectWithValue }) => {
    try {
      const response = await journalApi.getJournals(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch journals');
    }
  }
);

export const fetchJournalById = createAsyncThunk(
  'journal/fetchJournalById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await journalApi.getJournalById(id);
      return response.journal;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch journal');
    }
  }
);

export const fetchJournalByTradeId = createAsyncThunk(
  'journal/fetchJournalByTradeId',
  async (tradeId: string, { rejectWithValue }) => {
    try {
      const response = await journalApi.getJournalByTradeId(tradeId);
      return response.journal;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch journal');
    }
  }
);

export const createJournal = createAsyncThunk(
  'journal/createJournal',
  async (data: JournalFormData, { rejectWithValue }) => {
    try {
      const response = await journalApi.createJournal(data);
      return response.journal;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create journal');
    }
  }
);

export const updateJournal = createAsyncThunk(
  'journal/updateJournal',
  async ({ id, data }: { id: string; data: Partial<JournalFormData> }, { rejectWithValue }) => {
    try {
      const response = await journalApi.updateJournal(id, data);
      return response.journal;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update journal');
    }
  }
);

export const deleteJournal = createAsyncThunk(
  'journal/deleteJournal',
  async (id: string, { rejectWithValue }) => {
    try {
      await journalApi.deleteJournal(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete journal');
    }
  }
);

export const fetchJournalStats = createAsyncThunk(
  'journal/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await journalApi.getJournalStats();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch journal stats');
    }
  }
);

// Slice

const journalSlice = createSlice({
  name: 'journal',
  initialState,
  reducers: {
    clearSelectedJournal: (state) => {
      state.selectedJournal = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Journals
    builder.addCase(fetchJournals.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchJournals.fulfilled, (state, action) => {
      state.isLoading = false;
      state.journals = action.payload.journals;
      state.pagination = action.payload.pagination;
    });
    builder.addCase(fetchJournals.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch Journal by ID
    builder.addCase(fetchJournalById.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchJournalById.fulfilled, (state, action) => {
      state.isLoading = false;
      state.selectedJournal = action.payload;
    });
    builder.addCase(fetchJournalById.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch Journal by Trade ID
    builder.addCase(fetchJournalByTradeId.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchJournalByTradeId.fulfilled, (state, action) => {
      state.isLoading = false;
      state.selectedJournal = action.payload;
    });
    builder.addCase(fetchJournalByTradeId.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Create Journal
    builder.addCase(createJournal.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(createJournal.fulfilled, (state, action) => {
      state.isLoading = false;
      state.journals.unshift(action.payload);
      state.selectedJournal = action.payload;
    });
    builder.addCase(createJournal.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Update Journal
    builder.addCase(updateJournal.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(updateJournal.fulfilled, (state, action) => {
      state.isLoading = false;
      const index = state.journals.findIndex(j => j.id === action.payload.id);
      if (index !== -1) {
        state.journals[index] = action.payload;
      }
      if (state.selectedJournal?.id === action.payload.id) {
        state.selectedJournal = action.payload;
      }
    });
    builder.addCase(updateJournal.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Delete Journal
    builder.addCase(deleteJournal.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(deleteJournal.fulfilled, (state, action) => {
      state.isLoading = false;
      state.journals = state.journals.filter(j => j.id !== action.payload);
      if (state.selectedJournal?.id === action.payload) {
        state.selectedJournal = null;
      }
    });
    builder.addCase(deleteJournal.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch Stats
    builder.addCase(fetchJournalStats.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchJournalStats.fulfilled, (state, action) => {
      state.isLoading = false;
      state.stats = {
        total: action.payload.total,
        statusCounts: action.payload.statusCounts,
        averageRating: action.payload.averageRating,
      };
    });
    builder.addCase(fetchJournalStats.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearSelectedJournal, clearError } = journalSlice.actions;
export default journalSlice.reducer;
