import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Artifact } from '../../types/artifact.types';
import type { Citation } from '../../types/chat.types';

interface StreamingState {
  isStreaming:       boolean;
  currentContent:    string;
  thinkingContent:   string;
  streamedArtifacts: Partial<Artifact>[];
  pipelineStatus:    'analyzing' | 'searching' | null;
  streamedSources:   Citation[];
}

const initialState: StreamingState = {
  isStreaming:       false,
  currentContent:    '',
  thinkingContent:   '',
  streamedArtifacts: [],
  pipelineStatus:    null,
  streamedSources:   [],
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
      state.pipelineStatus    = null;
      state.streamedSources   = [];
    },
    appendToken: (state, action: PayloadAction<string>) => {
      state.currentContent += action.payload;
      state.pipelineStatus = null;
    },
    appendThinking: (state, action: PayloadAction<string>) => {
      state.thinkingContent += action.payload;
    },
    setPipelineStatus: (state, action: PayloadAction<'analyzing' | 'searching' | null>) => {
      state.pipelineStatus = action.payload;
    },
    setStreamedSources: (state, action: PayloadAction<Citation[]>) => {
      state.streamedSources = action.payload;
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
      state.pipelineStatus = null;
    },
    resetStream: () => initialState,
  },
});

export const {
  startStream,
  appendToken,
  appendThinking,
  setPipelineStatus,
  setStreamedSources,
  updateArtifact,
  stopStream,
  resetStream,
} = streamingSlice.actions;

export default streamingSlice.reducer;
