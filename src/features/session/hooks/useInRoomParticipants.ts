import { useState, useMemo, useRef, useEffect } from 'react';
import type { LocalParticipant, RemoteParticipant } from 'livekit-client';

export interface ParticipantItemData {
  participant: LocalParticipant | RemoteParticipant;
  isLocal: boolean;
  participantId: string;
  displayName: string;
  avatarUrl?: string;
  initialLetter: string;
  isHost: boolean;
  isSelf: boolean;
  activeMinutes?: number;
  credits?: number;
}

export interface UseInRoomParticipantsProps {
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
  onKickParticipant?: (userId: string, reason?: string) => void;
  onBlockParticipant?: (userId: string, reason?: string) => void;
}

export const useInRoomParticipants = ({
  localParticipant,
  remoteParticipants,
  mentorId,
  currentUserId,
  currentUserDisplayName,
  currentUserAvatarUrl,
  roomStats,
  onKickParticipant,
  onBlockParticipant,
}: UseInRoomParticipantsProps) => {
  const isHost = Boolean(mentorId && currentUserId && mentorId === currentUserId);
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenuUserId, setOpenMenuUserId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Trạng thái xác nhận cho hành động Kick hoặc Block
  const [confirmAction, setConfirmAction] = useState<{
    type: 'KICK' | 'BLOCK';
    userId: string;
    userName: string;
  } | null>(null);
  const [actionReason, setActionReason] = useState('');

  // Đóng dropdown menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuUserId(null);
      }
    };
    if (openMenuUserId) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuUserId]);

  // Gom danh sách & tính toán metadata
  const allParticipants: ParticipantItemData[] = useMemo(() => {
    const rawList = [
      ...(localParticipant ? [{ participant: localParticipant, isLocal: true }] : []),
      ...remoteParticipants.map((p) => ({ participant: p, isLocal: false })),
    ];

    const mapped = rawList.map(({ participant, isLocal }) => {
      const participantId = participant.identity;
      const isParticipantHost = mentorId === participantId;
      const isSelf = currentUserId === participantId;

      let parsedMeta: { avatarUrl?: string; displayName?: string; name?: string } = {};
      try {
        if (participant.metadata) {
          parsedMeta = JSON.parse(participant.metadata);
        }
      } catch {
        // ignore parse error
      }

      const learnerStat = roomStats?.learners?.find((l) => l.userId === participantId);

      const displayName =
        (isSelf && currentUserDisplayName) ||
        parsedMeta.displayName ||
        parsedMeta.name ||
        participant.name ||
        learnerStat?.learnerName ||
        (isParticipantHost ? 'Mentor' : isLocal ? 'Bạn' : `Học viên (${participantId.substring(0, 5)})`);

      const avatarUrl =
        (isSelf && currentUserAvatarUrl) ||
        parsedMeta.avatarUrl ||
        learnerStat?.learnerAvatar;

      const initialLetter = (displayName || 'U').trim().charAt(0).toUpperCase();

      const activeMinutes = learnerStat?.activeSeconds
        ? Math.floor(learnerStat.activeSeconds / 60)
        : undefined;
      const credits = learnerStat?.creditsContributed;

      return {
        participant,
        isLocal,
        participantId,
        displayName,
        avatarUrl,
        initialLetter,
        isHost: isParticipantHost,
        isSelf,
        activeMinutes,
        credits,
      };
    });

    // Sắp xếp: Host lên đầu -> Bạn -> Các thành viên khác
    return mapped.sort((a, b) => {
      if (a.isHost && !b.isHost) return -1;
      if (!a.isHost && b.isHost) return 1;
      if (a.isLocal && !b.isLocal) return -1;
      if (!a.isLocal && b.isLocal) return 1;
      return a.displayName.localeCompare(b.displayName);
    });
  }, [
    localParticipant,
    remoteParticipants,
    mentorId,
    currentUserId,
    currentUserDisplayName,
    currentUserAvatarUrl,
    roomStats,
  ]);

  // Lọc theo tìm kiếm
  const filteredParticipants = useMemo(() => {
    if (!searchQuery.trim()) return allParticipants;
    const q = searchQuery.toLowerCase().trim();
    return allParticipants.filter(
      (p) =>
        p.displayName.toLowerCase().includes(q) ||
        p.participantId.toLowerCase().includes(q),
    );
  }, [allParticipants, searchQuery]);

  // Xác nhận thực hiện Kick / Block
  const handleConfirmAction = () => {
    if (!confirmAction) return;

    if (confirmAction.type === 'KICK' && onKickParticipant) {
      onKickParticipant(confirmAction.userId, actionReason.trim() || undefined);
    } else if (confirmAction.type === 'BLOCK' && onBlockParticipant) {
      onBlockParticipant(confirmAction.userId, actionReason.trim() || undefined);
    }

    setConfirmAction(null);
    setActionReason('');
    setOpenMenuUserId(null);
  };

  const handleOpenActionMenu = (userId: string) => {
    setOpenMenuUserId((prev) => (prev === userId ? null : userId));
  };

  const handleCloseActionMenu = () => {
    setOpenMenuUserId(null);
  };

  const handleOpenConfirmModal = (type: 'KICK' | 'BLOCK', userId: string, userName: string) => {
    setConfirmAction({ type, userId, userName });
    setOpenMenuUserId(null);
  };

  const handleCloseConfirmModal = () => {
    setConfirmAction(null);
    setActionReason('');
  };

  return {
    isHost,
    totalCount: allParticipants.length,
    filteredParticipants,
    searchQuery,
    setSearchQuery,
    openMenuUserId,
    menuRef,
    confirmAction,
    actionReason,
    setActionReason,
    handleOpenActionMenu,
    handleCloseActionMenu,
    handleOpenConfirmModal,
    handleCloseConfirmModal,
    handleConfirmAction,
  };
};
