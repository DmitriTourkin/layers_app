import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { PresenceUser } from "shared";

interface PresenceState {
  users: PresenceUser[];
}

const initialState: PresenceState = {
  users: [],
};

const presenceSlice = createSlice({
  name: "presence",
  initialState,
  reducers: {
    setPresence(state, action: PayloadAction<PresenceUser[]>) {
      state.users = action.payload;
    },
    clearPresence(state) {
      state.users = [];
    },
  },
});

export const { setPresence, clearPresence } = presenceSlice.actions;
export default presenceSlice.reducer;
