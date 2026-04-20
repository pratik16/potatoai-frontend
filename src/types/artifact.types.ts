export type ArtifactType = 'html' | 'svg' | 'react' | 'markdown' | 'code';

export interface Artifact {
  artifact_id: string;
  type:        ArtifactType;
  title:       string;
  language:    string;
  content:     string;
}

export interface ArtifactState {
  isCanvasOpen: boolean;
  artifacts:    Artifact[];
  activeTabId:  string | null;
  viewMode:     'preview' | 'code';
}
