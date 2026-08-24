import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Artifact } from '../../types/artifact.types';

/** The `model_route` SSE frame — arrives once, before any token frames, only when Auto routed the turn. */
export interface RoutedModelInfo {
  model:         string;
  model_name:    string;
  colour_hex:    string;
  question_type: string;
  source:        string;
}

interface StreamingState {
  isStreaming:       boolean;
  currentContent:    string;
  thinkingContent:   string;
  streamedArtifacts: Partial<Artifact>[];
  /** Set mid-stream when Auto picked a model for this turn; cleared at the start of the next stream. */
  routedModel:       RoutedModelInfo | null;
}

const initialState: StreamingState = {
  isStreaming:       false,
  currentContent:    '',
  thinkingContent:   '',
  streamedArtifacts: [],
  routedModel:        null,
};

const streamingSlice = createSlice({
  name: 'streaming',
  initialState,
  reducers: {
    startStream: (state) => {
      state.isStreaming       = true;
      state.currentContent    = '';
      state.thinkingContent   = '';
      state.streamedArtifacts = [];
      state.routedModel       = null;
    },
    appendToken: (state, action: PayloadAction<string>) => {
      state.currentContent += action.payload;
    },
    appendThinking: (state, action: PayloadAction<string>) => {
      state.thinkingContent += action.payload;
    },
    updateArtifact: (state, action: PayloadAction<Partial<Artifact>>) => {
      const existing = state.streamedArtifacts.find(
        (a) => a.artifact_id === action.payload.artifact_id,
      );
      if (existing) {
        Object.assign(existing, action.payload);
      } else {
        state.streamedArtifacts.push(action.payload);
      }
    },
    setRoutedModel: (state, action: PayloadAction<RoutedModelInfo>) => {
      state.routedModel = action.payload;
    },
    stopStream: (state) => {
      state.isStreaming = false;
    },
    resetStream: () => initialState,
  },
});

export const {
  startStream,
  appendToken,
  appendThinking,
  updateArtifact,
  setRoutedModel,
  stopStream,
  resetStream,
} = streamingSlice.actions;

export default streamingSlice.reducer;
