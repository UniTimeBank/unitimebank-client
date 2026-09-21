import React, { useState } from 'react';
import type { LocalParticipant, RemoteParticipant } from 'livekit-client';
import {
  Users,
  Mic,
  MicOff,
  UserX,
  Ban,
  ShieldAlert,
  Crown,
  User,
  Clock,
  Coins,
  Shield,
  Search,
} from 'lucide-react';
import { Modal, Button } from '@/shared/components/ui';

export interface InRoomParticipantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  localParticipant: LocalParticipant | null;
  remoteParticipants: RemoteParticipant[];
  mentorId?: string;
  currentUserId?: string;
  roomStats?: {
    learners?: Array<{
      userId: string;
      learnerName?: string;
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

export const InRoomParticipantsModal: React.FC<InRoomParticipantsModalProps> = ({
  isOpen,
  onClose,
  localParticipant,
  remoteParticipants,
  mentorId,
  currentUserId,
  roomStats,
  onMuteParticipant,
  onKickParticipant,
  onBlockParticipant,
  onReportParticipant,
}) => {
  const isHost = mentorId && currentUserId ? mentorId === currentUserId : false;
  const [searchQuery, setSearchQuery] = useState('');

  // Confirm state for Kick or Block action
  const [confirmAction, setConfirmAction] = useState<{
    type: 'KICK' | 'BLOCK';
    userId: string;
    userName: string;
  } | null>(null);
  const [actionReason, setActionReason] = useState('');

  const allParticipants = [
    ...(localParticipant ? [{ participant: localParticipant, isLocal: true }] : []),
    ...remoteParticipants.map((p) => ({ participant: p, isLocal: false })),
  ];

  const filteredParticipants = allParticipants.filter(({ participant, isLocal }) => {
    if (!searchQuery.trim()) return true;
    const name = participant.name || (isLocal ? 'Bạn' : participant.identity);
    return name.toLowerCase().includes(searchQuery.toLowerCase().trim());
  });

  const learnersOnly = allParticipants.filter(
    ({ participant }) => participant.identity !== mentorId,
  );

  const handleConfirmAction = () => {
    if (!confirmAction) return;

    if (confirmAction.type === 'KICK' && onKickParticipant) {
      onKickParticipant(confirmAction.userId, actionReason.trim() || undefined);
    } else if (confirmAction.type === 'BLOCK' && onBlockParticipant) {
      onBlockParticipant(confirmAction.userId, actionReason.trim() || undefined);
    }

    setConfirmAction(null);
    setActionReason('');
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="md"
        title={
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Thành viên buổi học</h3>
              <p className="text-[11px] text-slate-500 font-medium">
                {allParticipants.length} người đang có mặt trong phòng
              </p>
            </div>
          </div>
        }
      >
        <div className="space-y-3 pt-1">
          {/* Host Privilege Pill / Search */}
          <div className="flex items-center justify-between gap-2 pb-1">
            {isHost ? (
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/80 flex items-center gap-1.5 shadow-2xs">
                <Shield className="w-3.5 h-3.5 text-emerald-600" />
                <span>Quyền Host: Quản lý phòng học</span>
              </span>
            ) : (
              <span className="text-[11px] text-slate-500 font-medium">
                Danh sách người tham gia
              </span>
            )}

            {allParticipants.length > 3 && (
              <div className="relative w-44">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm thành viên..."
                  className="w-full pl-8 pr-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
            )}
          </div>

          {/* Participant List */}
          <div className="space-y-2 max-h-80 overflow-y-auto pr-0.5">
            {filteredParticipants.map(({ participant, isLocal }) => {
              const participantId = participant.identity;
              const isParticipantHost = mentorId === participantId;
              const isSelf = currentUserId === participantId;
              const displayName =
                participant.name ||
                (isLocal ? 'Bạn' : `Học viên (${participantId.substring(0, 5)})`);

              // Thống kê cước tạm giữ của học viên này (nếu có)
              const learnerStat = roomStats?.learners?.find((l) => l.userId === participantId);
              const activeMinutes = learnerStat?.activeSeconds
                ? Math.floor(learnerStat.activeSeconds / 60)
                : undefined;
              const credits = learnerStat?.creditsContributed;

              return (
                <div
                  key={participantId}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                    isParticipantHost
                      ? 'bg-amber-50/30 border-amber-200/60 shadow-2xs'
                      : isSelf
                      ? 'bg-slate-50/80 border-slate-200/80'
                      : 'bg-white border-slate-200/70 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Avatar with role ring */}
                    <div className="relative shrink-0">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                          isParticipantHost
                            ? 'bg-amber-100 text-amber-800 ring-2 ring-amber-300/80'
                            : isSelf
                            ? 'bg-primary-100 text-primary-800 ring-2 ring-primary-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {isParticipantHost ? (
                          <Crown className="w-4 h-4 text-amber-600" />
                        ) : (
                          displayName.substring(0, 1).toUpperCase() || <User className="w-4 h-4" />
                        )}
                      </div>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white absolute -bottom-0.5 -right-0.5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-slate-800 truncate max-w-[160px] sm:max-w-[200px]">
                          {displayName}
                        </span>
                        {isParticipantHost ? (
                          <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-amber-100/90 text-amber-800 border border-amber-200/70 flex items-center gap-1">
                            <Crown className="w-2.5 h-2.5 text-amber-600" />
                            Chủ phòng
                          </span>
                        ) : isSelf ? (
                          <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200/60">
                            Bạn
                          </span>
                        ) : null}
                      </div>

                      {/* Thời gian học & Credit nếu là học viên */}
                      {!isParticipantHost && (activeMinutes !== undefined || credits !== undefined) && (
                        <div className="flex items-center gap-2.5 mt-1 text-[11px] text-slate-500 font-medium">
                          {activeMinutes !== undefined && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {activeMinutes} phút
                            </span>
                          )}
                          {credits !== undefined && (
                            <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                              <Coins className="w-3 h-3 text-emerald-500" />
                              {credits} Credit
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Actions & Status */}
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    {/* Mic Status Icon */}
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                        participant.isMicrophoneEnabled
                          ? 'text-emerald-700 bg-emerald-50 border border-emerald-200/60'
                          : 'text-slate-400 bg-slate-100 border border-slate-200/60'
                      }`}
                      title={participant.isMicrophoneEnabled ? 'Micro đang bật' : 'Micro đang tắt'}
                    >
                      {participant.isMicrophoneEnabled ? (
                        <Mic className="w-3.5 h-3.5" />
                      ) : (
                        <MicOff className="w-3.5 h-3.5" />
                      )}
                    </div>

                    {/* Moderation Controls (Host only, not targeting self or other hosts) */}
                    {isHost && !isSelf && !isParticipantHost && (
                      <div className="flex items-center gap-1 pl-1 border-l border-slate-200">
                        {/* Mute toggle */}
                        {onMuteParticipant && (
                          <button
                            type="button"
                            onClick={() => onMuteParticipant(participantId)}
                            className="w-7 h-7 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center justify-center cursor-pointer"
                            title="Tắt tiếng học viên"
                          >
                            <MicOff className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Kick */}
                        {onKickParticipant && (
                          <button
                            type="button"
                            onClick={() =>
                              setConfirmAction({
                                type: 'KICK',
                                userId: participantId,
                                userName: displayName,
                              })
                            }
                            className="w-7 h-7 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors flex items-center justify-center cursor-pointer"
                            title="Mời ra khỏi phòng (Kick)"
                          >
                            <UserX className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Block */}
                        {onBlockParticipant && (
                          <button
                            type="button"
                            onClick={() =>
                              setConfirmAction({
                                type: 'BLOCK',
                                userId: participantId,
                                userName: displayName,
                              })
                            }
                            className="w-7 h-7 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors flex items-center justify-center cursor-pointer"
                            title="Chặn vĩnh viễn không cho vào lại (Block)"
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Report */}
                        {onReportParticipant && (
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onReportParticipant(participantId, displayName);
                            }}
                            className="w-7 h-7 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors flex items-center justify-center cursor-pointer"
                            title="Báo cáo vi phạm"
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Empty state when only host is present */}
            {learnersOnly.length === 0 && (
              <div className="flex flex-col items-center justify-center py-7 px-4 bg-slate-50/70 rounded-2xl border border-dashed border-slate-200/90 text-center my-1">
                <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200/70 shadow-2xs flex items-center justify-center text-slate-400 mb-2">
                  <Users className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-700">Chưa có học viên nào tham gia</p>
                <p className="text-[11px] text-slate-400 mt-0.5 max-w-xs leading-relaxed">
                  Khi học viên tham gia vào phòng học, thông tin thời lượng và quyền quản trị sẽ hiển thị tại đây.
                </p>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium">
              UniTime Bank • Phòng học nhóm
            </span>
            <Button
              onClick={onClose}
              variant="primary"
              size="sm"
              className="bg-primary-700 hover:bg-primary-800 text-white rounded-xl px-5 text-xs font-bold shadow-xs cursor-pointer"
            >
              Đóng
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirmation Modal for Kick or Block */}
      {confirmAction && (
        <Modal
          isOpen={true}
          onClose={() => setConfirmAction(null)}
          size="sm"
          title={
            confirmAction.type === 'KICK'
              ? 'Mời thành viên ra khỏi phòng'
              : 'Chặn thành viên tham gia lại'
          }
        >
          <div className="space-y-4 pt-1">
            <div
              className={`p-3 rounded-2xl border text-xs leading-relaxed ${
                confirmAction.type === 'BLOCK'
                  ? 'bg-rose-50 text-rose-900 border-rose-200'
                  : 'bg-amber-50 text-amber-900 border-amber-200'
              }`}
            >
              {confirmAction.type === 'BLOCK' ? (
                <p>
                  Bạn đang chuẩn bị <b>chặn vĩnh viễn</b> học viên{' '}
                  <span className="font-bold underline">{confirmAction.userName}</span>. Học viên
                  này sẽ bị ngắt kết nối LiveKit ngay lập tức và <b>không thể tham gia lại</b> phòng
                  học nhóm này.
                </p>
              ) : (
                <p>
                  Bạn có chắc muốn mời học viên{' '}
                  <span className="font-bold underline">{confirmAction.userName}</span> ra khỏi
                  phòng học hiện tại? Cước phí đã học sẽ được quyết toán đến thời điểm này.
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Lý do (Tùy chọn)
              </label>
              <input
                type="text"
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder={
                  confirmAction.type === 'BLOCK'
                    ? 'VD: Quấy rối, bật âm thanh phản cảm...'
                    : 'VD: Rời phòng sớm, hết giờ...'
                }
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl text-xs cursor-pointer"
                onClick={() => setConfirmAction(null)}
              >
                Hủy
              </Button>
              <Button
                variant={confirmAction.type === 'BLOCK' ? 'danger' : 'primary'}
                size="sm"
                className="rounded-xl text-xs font-bold cursor-pointer"
                onClick={handleConfirmAction}
              >
                {confirmAction.type === 'BLOCK' ? 'Chặn ngay' : 'Mời ra'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
