import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { ChatState, ChatMeta, Message } from '../../types/chat.types';

const DEFAULT_MODEL = 'claude-sonnet-4-5';

const initialState: ChatState = {
  activeChatId:   null,
  selectedModel:  DEFAULT_MODEL,
  chats:          [],
  activeMessages: [],
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setActiveChat: (state, action: PayloadAction<string | null>) => {
      state.activeChatId = action.payload;
      if (!action.payload) state.activeMessages = [];
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
    setMessages: (state, action: PayloadAction<Message[]>) => {
      state.activeMessages = action.payload;
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
  addMessage,
  updateLastMessage,
  updateMessageById,
  clearMessages,
} = chatSlice.actions;

export default chatSlice.reducer;
