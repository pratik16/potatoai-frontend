import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { ArtifactState, Artifact } from '../../types/artifact.types';

const initialState: ArtifactState = {
  isCanvasOpen: false,
  artifacts:    [],
  activeTabId:  null,
  viewMode:     'preview',
};

const artifactSlice = createSlice({
  name: 'artifact',
  initialState,
  reducers: {
    openCanvas: (state, action: PayloadAction<string>) => {
      state.isCanvasOpen = true;
      state.activeTabId  = action.payload;
    },
    closeCanvas: (state) => {
      state.isCanvasOpen = false;
    },
    setActiveTab: (state, action: PayloadAction<string>) => {
      state.activeTabId = action.payload;
    },
    setViewMode: (state, action: PayloadAction<'preview' | 'code'>) => {
      state.viewMode = action.payload;
    },
    addArtifact: (state, action: PayloadAction<Artifact>) => {
      const exists = state.artifacts.find((a) => a.artifact_id === action.payload.artifact_id);
      if (!exists) state.artifacts.push(action.payload);
    },
    updateArtifact: (state, action: PayloadAction<Artifact>) => {
      const idx = state.artifacts.findIndex((a) => a.artifact_id === action.payload.artifact_id);
      if (idx !== -1) state.artifacts[idx] = action.payload;
    },
    clearArtifacts: (state) => {
      state.artifacts    = [];
      state.activeTabId  = null;
      state.isCanvasOpen = false;
    },
  },
});

export const {
  openCanvas,
  closeCanvas,
  setActiveTab,
  setViewMode,
  addArtifact,
  updateArtifact,
  clearArtifacts,
} = artifactSlice.actions;

export default artifactSlice.reducer;
