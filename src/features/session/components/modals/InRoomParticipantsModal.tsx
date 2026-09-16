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
      <Modal isOpen={isOpen} onClose={onClose} size="md" title="Thành viên trong phòng">
        <div className="space-y-4 pt-1">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 pb-2 border-b border-slate-100">
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-slate-600" />
              Tổng cộng: {allParticipants.length} người
            </span>
            {isHost && (
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Quyền Host: Quản lý phòng
              </span>
            )}
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {allParticipants.map(({ participant, isLocal }) => {
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
                      ? 'bg-amber-50/40 border-amber-200/80 shadow-2xs'
                      : isSelf
                      ? 'bg-primary-50/30 border-primary-200/80'
                      : 'bg-white border-slate-200/80 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 ${
                        isParticipantHost
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {isParticipantHost ? (
                        <Crown className="w-5 h-5 text-white" />
                      ) : (
                        <User className="w-5 h-5 text-slate-500" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-xs font-bold text-slate-800 truncate">
                          {displayName} {isSelf && '(Bạn)'}
                        </p>
                        {isParticipantHost ? (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                            Host
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                            Học viên
                          </span>
                        )}
                      </div>

                      {/* Thời gian học & Credit nếu là học viên */}
                      {!isParticipantHost && (activeMinutes !== undefined || credits !== undefined) && (
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                          {activeMinutes !== undefined && (
                            <span className="flex items-center gap-0.5">
                              <Clock className="w-3 h-3" />
                              {activeMinutes} phút
                            </span>
                          )}
                          {credits !== undefined && (
                            <span className="flex items-center gap-0.5 text-emerald-600 font-semibold">
                              <Coins className="w-3 h-3" />
                              {credits} cr
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    {/* Mic Status Icon */}
                    <div
                      className={`p-1.5 rounded-lg ${
                        participant.isMicrophoneEnabled
                          ? 'text-slate-600 bg-slate-100'
                          : 'text-rose-500 bg-rose-50'
                      }`}
                      title={participant.isMicrophoneEnabled ? 'Micro đang bật' : 'Micro đang tắt'}
                    >
                      {participant.isMicrophoneEnabled ? (
                        <Mic className="w-4 h-4" />
                      ) : (
                        <MicOff className="w-4 h-4" />
                      )}
                    </div>

                    {/* Moderation Controls (Host only, not targeting self or other hosts) */}
                    {isHost && !isSelf && !isParticipantHost && (
                      <>
                        {/* Mute toggle */}
                        {onMuteParticipant && (
                          <button
                            type="button"
                            onClick={() => onMuteParticipant(participantId)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Tắt tiếng thành viên này"
                          >
                            <MicOff className="w-4 h-4 text-slate-600" />
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
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                            title="Mời ra khỏi phòng học (Kick)"
                          >
                            <UserX className="w-4 h-4" />
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
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Chặn vĩnh viễn không cho vào lại (Block)"
                          >
                            <Ban className="w-4 h-4" />
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
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Báo cáo vi phạm thành viên này"
                          >
                            <ShieldAlert className="w-4 h-4" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-end">
            <Button onClick={onClose} variant="primary" size="sm" className="rounded-xl px-5">
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
                className="rounded-xl"
                onClick={() => setConfirmAction(null)}
              >
                Hủy
              </Button>
              <Button
                variant={confirmAction.type === 'BLOCK' ? 'danger' : 'primary'}
                size="sm"
                className="rounded-xl"
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
