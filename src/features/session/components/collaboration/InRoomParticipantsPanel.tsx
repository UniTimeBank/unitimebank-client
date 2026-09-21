import React from 'react';
import type { LocalParticipant, RemoteParticipant } from 'livekit-client';
import { X, Search } from 'lucide-react';
import { useInRoomParticipants } from '../../hooks';
import { ParticipantItem } from './ParticipantItem';
import { ParticipantActionModal } from './ParticipantActionModal';

export interface InRoomParticipantsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  localParticipant: LocalParticipant | null;
  remoteParticipants: RemoteParticipant[];
  mentorId?: string;
  currentUserId?: string;
  currentUserDisplayName?: string;
  currentUserAvatarUrl?: string;
  roomStats?: {
    learners?: Array<{
      userId: string;
      learnerName?: string;
      learnerAvatar?: string;
      activeSeconds?: number;
      paidMinutes?: number;
      creditsContributed?: number;
    }>;
  };
  onMuteParticipant?: (userId: string) => void;
  onKickParticipant?: (userId: string, reason?: string) => void;
  onBlockParticipant?: (userId: string, reason?: string) => void;
  onReportParticipant?: (userId: string, name?: string) => void;
}

export const InRoomParticipantsPanel: React.FC<InRoomParticipantsPanelProps> = ({
  isOpen,
  onClose,
  localParticipant,
  remoteParticipants,
  mentorId,
  currentUserId,
  currentUserDisplayName,
  currentUserAvatarUrl,
  roomStats,
  onMuteParticipant,
  onKickParticipant,
  onBlockParticipant,
  onReportParticipant,
}) => {
  const {
    isHost,
    totalCount,
    filteredParticipants,
    searchQuery,
    setSearchQuery,
    openMenuUserId,
    menuRef,
    confirmAction,
    actionReason,
    setActionReason,
    handleOpenActionMenu,
    handleOpenConfirmModal,
    handleCloseConfirmModal,
    handleConfirmAction,
  } = useInRoomParticipants({
    localParticipant,
    remoteParticipants,
    mentorId,
    currentUserId,
    currentUserDisplayName,
    currentUserAvatarUrl,
    roomStats,
    onKickParticipant,
    onBlockParticipant,
  });

  if (!isOpen) return null;

  return (
    <>
      <aside className="w-80 md:w-96 bg-white border-l border-slate-200 flex flex-col h-full z-20 shadow-xl select-none transition-all duration-300">
        {/* Header */}
        <div className="h-16 px-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-800">Thành viên</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60">
              {totalCount}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Đóng bảng thành viên"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar (Chỉ hiển thị khi có > 3 thành viên) */}
        {totalCount > 3 && (
          <div className="p-3 border-b border-slate-100 bg-slate-50/50 shrink-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm thành viên..."
                className="w-full pl-8.5 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 transition-all"
              />
            </div>
          </div>
        )}

        {/* Participant List */}
        <div className="flex-1 p-3 overflow-y-auto space-y-1.5">
          {filteredParticipants.length === 0 ? (
            <div className="h-40 flex flex-col items-center justify-center text-slate-400 text-xs text-center p-4">
              <p className="font-medium text-slate-500">Không tìm thấy thành viên</p>
            </div>
          ) : (
            filteredParticipants.map((item) => (
              <ParticipantItem
                key={item.participantId}
                item={item}
                isCurrentUserHost={isHost}
                isMenuOpen={openMenuUserId === item.participantId}
                menuRef={menuRef}
                onToggleMenu={() => handleOpenActionMenu(item.participantId)}
                onMute={onMuteParticipant}
                onOpenKickModal={(userId, userName) =>
                  handleOpenConfirmModal('KICK', userId, userName)
                }
                onOpenBlockModal={(userId, userName) =>
                  handleOpenConfirmModal('BLOCK', userId, userName)
                }
                onReport={onReportParticipant}
              />
            ))
          )}
        </div>
      </aside>

      {/* Confirmation Modal for Kick & Block */}
      <ParticipantActionModal
        confirmAction={confirmAction}
        actionReason={actionReason}
        onChangeReason={setActionReason}
        onClose={handleCloseConfirmModal}
        onConfirm={handleConfirmAction}
      />
    </>
  );
};
