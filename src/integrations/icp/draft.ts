// Draft note utilities for ICP integration (optional)
// Adapted from whisperrnote_icp/frontend/src/store/draft.ts

export interface DraftModel {
  content: string;
  tags: string[];
}

const initialDraft: DraftModel = {
  content: '',
  tags: [],
};

export function loadDraft(): DraftModel {
  try {
    const saved = localStorage.getItem('draft');
    if (saved) {
      const parsed = JSON.parse(saved);
      if ('content' in parsed && 'tags' in parsed) {
        return parsed;
      }
    }
  } catch {}
  return initialDraft;
}

export function saveDraft(draft: DraftModel) {
  localStorage.setItem('draft', JSON.stringify(draft));
}

export function clearDraft() {
  localStorage.removeItem('draft');
}
