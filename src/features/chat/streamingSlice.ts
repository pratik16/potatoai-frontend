import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Artifact } from '../../types/artifact.types';

interface StreamingState {
  isStreaming:       boolean;
  currentContent:    string;
  thinkingContent:   string;
  streamedArtifacts: Partial<Artifact>[];
}

const initialState: StreamingState = {
  isStreaming:       false,
  currentContent:    '',
  thinkingContent:   '',
  streamedArtifacts: [],
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
  stopStream,
  resetStream,
} = streamingSlice.actions;

export default streamingSlice.reducer;
