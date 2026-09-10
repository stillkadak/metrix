import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { scans as scansApi } from '../services/api';

export interface Violation {
  id: string;
  rule_code: string;
  rule_description: string;
  field_name?: string | null;
  extracted_value?: string | null;
  expected_value?: string | null;
  severity: 'critical' | 'major' | 'minor';
  confidence?: number | null;
}

export interface Scan {
  id: string;
  user_id: string;
  product_id?: string | null;
  image_path: string;
  thumbnail_path?: string | null;
  ocr_text?: string | null;
  ocr_confidence?: number | null;
  compliance_score?: number | null;
  is_compliant?: boolean | null;
  scan_date: string;
  created_at?: string;
  processing_time_ms?: number | null;
  violations: Violation[];
}

interface ScanState {
  items: Scan[];
  current: Scan | null;
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
}

const initialState: ScanState = {
  items: [],
  current: null,
  status: 'idle',
  error: null,
};

export const fetchScans = createAsyncThunk('scans/list', async () => {
  const response = await scansApi.list();
  return response.data as Scan[];
});

export const fetchScan = createAsyncThunk('scans/get', async (id: string) => {
  const response = await scansApi.get(id);
  return response.data as Scan;
});

const scanSlice = createSlice({
  name: 'scans',
  initialState,
  reducers: {
    clearCurrentScan(state) {
      state.current = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchScans.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchScans.fulfilled, (state, action) => {
        state.status = 'idle';
        state.items = action.payload;
      })
      .addCase(fetchScans.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to load scans';
      })
      .addCase(fetchScan.fulfilled, (state, action) => {
        state.current = action.payload;
      });
  },
});

export const { clearCurrentScan } = scanSlice.actions;
export default scanSlice.reducer;
