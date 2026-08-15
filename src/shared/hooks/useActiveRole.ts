import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import type { RootState, AppDispatch } from '@/core/store';
import { setRole, toggleRole, type ActiveRole } from '@/core/store/slices/roleSlice';

export const useActiveRole = () => {
  const dispatch = useDispatch<AppDispatch>();
  const activeRole = useSelector((state: RootState) => state.role.activeRole);

  const isMentor = activeRole === 'MENTOR';
  const isLearner = activeRole === 'LEARNER';

  const switchRole = (newRole: ActiveRole, showToast = true) => {
    if (newRole !== activeRole) {
      dispatch(setRole(newRole));
      if (showToast) {
        if (newRole === 'MENTOR') {
          toast.success('Đã chuyển sang chế độ Người Dạy');
        } else {
          toast.success('Đã chuyển sang chế độ Người Học');
        }
      }
    }
  };

  const toggle = (showToast = true) => {
    const nextRole: ActiveRole = activeRole === 'LEARNER' ? 'MENTOR' : 'LEARNER';
    switchRole(nextRole, showToast);
  };

  return {
    activeRole,
    isMentor,
    isLearner,
    switchRole,
    toggleRole: toggle,
  };
};
