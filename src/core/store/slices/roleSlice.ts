import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export type ActiveRole = 'LEARNER' | 'MENTOR';

interface RoleState {
  activeRole: ActiveRole;
}

const getInitialRole = (): ActiveRole => {
  try {
    const saved = localStorage.getItem('activeRole');
    if (saved === 'LEARNER' || saved === 'MENTOR') {
      return saved;
    }
  } catch {
    // ignore localStorage error
  }
  return 'LEARNER'; // Mặc định là Người học
};

const initialState: RoleState = {
  activeRole: getInitialRole(),
};

export const roleSlice = createSlice({
  name: 'role',
  initialState,
  reducers: {
    setRole: (state, action: PayloadAction<ActiveRole>) => {
      state.activeRole = action.payload;
      try {
        localStorage.setItem('activeRole', action.payload);
      } catch (err) {
        console.error('Lỗi khi lưu activeRole vào localStorage:', err);
      }
    },
    toggleRole: (state) => {
      const nextRole: ActiveRole = state.activeRole === 'LEARNER' ? 'MENTOR' : 'LEARNER';
      state.activeRole = nextRole;
      try {
        localStorage.setItem('activeRole', nextRole);
      } catch (err) {
        console.error('Lỗi khi lưu activeRole vào localStorage:', err);
      }
    },
  },
});

export const { setRole, toggleRole } = roleSlice.actions;
export default roleSlice.reducer;
