import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { ChatState, ChatMeta, ChatStreamError, Message } from '../../types/chat.types';

// Pre-fetch seed only. The live list comes from `GET /api/models` (admin-controlled
// `is_active`); ModelSelector self-corrects `selectedModel` to the first live model
// if this seed — or a previously chosen model — is no longer active. 'auto' is an
// exception: ModelSelector's self-heal treats it as always valid whenever the API's
// synthetic Auto row is present, so this default survives that check.
const DEFAULT_MODEL = 'auto';

const initialState: ChatState = {
  activeChatId:    null,
  selectedModel:   DEFAULT_MODEL,
  chats:           [],
  activeMessages:  [],
  hasMoreMessages: false,
  outOfCredits:    false,
  streamError:     null,
};

/** A single fetched page of transcript, newest-page-first per the `GET /chats/{id}` contract. */
interface MessagesPage {
  messages: Message[];
  has_more: boolean;
}

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setActiveChat: (state, action: PayloadAction<string | null>) => {
      state.activeChatId = action.payload;
      if (!action.payload) {
        state.activeMessages = [];
        state.hasMoreMessages = false;
      }
    },
    setModel: (state, action: PayloadAction<string>) => {
      state.selectedModel = action.payload;
    },
    setChats: (state, action: PayloadAction<ChatMeta[]>) => {
      state.chats = action.payload;
    },
    prependChat: (state, action: PayloadAction<ChatMeta>) => {
      state.chats.unshift(action.payload);
    },
    updateChatTitle: (state, action: PayloadAction<{ id: string; title: string }>) => {
      const chat = state.chats.find((c) => c._id === action.payload.id);
      if (chat) chat.title = action.payload.title;
    },
    toggleStar: (state, action: PayloadAction<string>) => {
      const chat = state.chats.find((c) => c._id === action.payload);
      if (chat) chat.starred = !chat.starred;
    },
    removeChat: (state, action: PayloadAction<string>) => {
      state.chats = state.chats.filter((c) => c._id !== action.payload);
    },
    /** Replaces the transcript wholesale — the initial (most-recent-page) load only. */
    setMessages: (state, action: PayloadAction<MessagesPage>) => {
      state.activeMessages = action.payload.messages;
      state.hasMoreMessages = action.payload.has_more;
    },
    /** Splices an older page onto the front without disturbing the loaded tail — scroll-up pagination. */
    prependMessages: (state, action: PayloadAction<MessagesPage>) => {
      const known = new Set(state.activeMessages.map((m) => m._id ?? m.id));
      const older = action.payload.messages.filter((m) => !known.has(m._id ?? m.id));
      state.activeMessages = [...older, ...state.activeMessages];
      state.hasMoreMessages = action.payload.has_more;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      state.activeMessages.push(action.payload);
    },
    updateLastMessage: (state, action: PayloadAction<Partial<Message>>) => {
      const last = state.activeMessages[state.activeMessages.length - 1];
      if (last) Object.assign(last, action.payload);
    },
    updateMessageById: (state, action: PayloadAction<{ id: string; update: Partial<Message> }>) => {
      const idx = state.activeMessages.findIndex(
        (m) => m.id === action.payload.id || m._id === action.payload.id,
      );
      if (idx !== -1) Object.assign(state.activeMessages[idx], action.payload.update);
    },
    clearMessages: (state) => {
      state.activeMessages = [];
      state.hasMoreMessages = false;
    },
    setOutOfCredits: (state, action: PayloadAction<boolean>) => {
      state.outOfCredits = action.payload;
    },
    setStreamError: (state, action: PayloadAction<ChatStreamError | null>) => {
      state.streamError = action.payload;
    },
  },
});

export const {
  setActiveChat,
  setModel,
  setChats,
  prependChat,
  updateChatTitle,
  toggleStar,
  removeChat,
  setMessages,
  prependMessages,
  addMessage,
  updateLastMessage,
  updateMessageById,
  clearMessages,
  setOutOfCredits,
  setStreamError,
} = chatSlice.actions;

export default chatSlice.reducer;
