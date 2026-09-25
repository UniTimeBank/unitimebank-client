import React, { useState, useMemo, useEffect } from 'react';
import {
  Users,
  Search,
  Crown,
  UserX,
  Ban,
  RotateCcw,
  Loader2,
  ShieldAlert,
  UserCheck,
  MoreVertical,
} from 'lucide-react';
import { Modal, Button } from '@/shared/components/ui';
import {
  useGetGroupMembersQuery,
  useGetBannedGroupMembersQuery,
  useKickGroupMemberMutation,
  useBanGroupMemberMutation,
  useUnbanGroupMemberMutation,
  useTransferGroupOwnershipMutation,
} from '@/core/api/community/communityApi';
import type { GroupMember, BannedMember } from '@/features/post/types';
import { toast } from 'react-hot-toast';

interface ManageGroupMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  groupName: string;
  currentOwnerId: string;
}

interface MenuAnchorState {
  member: GroupMember;
  top?: number;
  bottom?: number;
  right: number;
}

export const ManageGroupMembersModal: React.FC<ManageGroupMembersModalProps> = ({
  isOpen,
  onClose,
  groupId,
  groupName,
  currentOwnerId,
}) => {
  const [activeTab, setActiveTab] = useState<'MEMBERS' | 'BANNED'>('MEMBERS');
  const [searchTerm, setSearchTerm] = useState('');
  const [menuAnchor, setMenuAnchor] = useState<MenuAnchorState | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'KICK' | 'BAN' | 'TRANSFER';
    user: GroupMember;
  } | null>(null);

  // Close floating 3-dots menu when clicking outside or scrolling
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        !(e.target as HTMLElement).closest('.member-action-menu-btn') &&
        !(e.target as HTMLElement).closest('.member-action-floating-menu')
      ) {
        setMenuAnchor(null);
      }
    };

    const handleDismiss = () => {
      setMenuAnchor(null);
    };

    if (menuAnchor) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleDismiss, true);
      window.addEventListener('resize', handleDismiss);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleDismiss, true);
      window.removeEventListener('resize', handleDismiss);
    };
  }, [menuAnchor]);

  // Queries
  const { data: members = [], isLoading: isLoadingMembers } = useGetGroupMembersQuery(groupId, {
    skip: !isOpen || !groupId,
  });

  const { data: bannedMembers = [], isLoading: isLoadingBanned } =
    useGetBannedGroupMembersQuery(groupId, {
      skip: !isOpen || !groupId,
    });

  // Mutations
  const [kickMember, { isLoading: isKicking }] = useKickGroupMemberMutation();
  const [banMember, { isLoading: isBanning }] = useBanGroupMemberMutation();
  const [unbanMember, { isLoading: isUnbanning }] = useUnbanGroupMemberMutation();
  const [transferOwnership, { isLoading: isTransferring }] = useTransferGroupOwnershipMutation();

  // Filter members by search term
  const filteredMembers = useMemo(() => {
    if (!searchTerm.trim()) return members;
    const term = searchTerm.toLowerCase();
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(term) || (m.email && m.email.toLowerCase().includes(term)),
    );
  }, [members, searchTerm]);

  // Filter banned members by search term
  const filteredBanned = useMemo(() => {
    if (!searchTerm.trim()) return bannedMembers;
    const term = searchTerm.toLowerCase();
    return bannedMembers.filter(
      (m) =>
        m.name.toLowerCase().includes(term) || (m.email && m.email.toLowerCase().includes(term)),
    );
  }, [bannedMembers, searchTerm]);

  const handleExecuteAction = async () => {
    if (!confirmAction) return;
    const { type, user } = confirmAction;

    try {
      if (type === 'TRANSFER') {
        await transferOwnership({ groupId, newOwnerId: user.id }).unwrap();
        toast.success(`Đã phân quyền Trưởng nhóm cho @${user.name} thành công! 👑`);
        setConfirmAction(null);
        onClose();
        return;
      } else if (type === 'KICK') {
        await kickMember({ groupId, targetUserId: user.id }).unwrap();
        toast.success(`Đã đuổi @${user.name} ra khỏi nhóm thành công`);
      } else if (type === 'BAN') {
        await banMember({ groupId, targetUserId: user.id }).unwrap();
        toast.success(`Đã cấm @${user.name} khỏi nhóm thành công`);
      }
      setConfirmAction(null);
    } catch (err: unknown) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message ||
        'Không thể thực hiện hành động, vui lòng thử lại sau!';
      toast.error(msg);
    }
  };

  const handleUnban = async (user: BannedMember) => {
    try {
      await unbanMember({ groupId, targetUserId: user.id }).unwrap();
      toast.success(`Đã bỏ cấm @${user.name} thành công`);
    } catch (err: unknown) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message ||
        'Không thể bỏ cấm, vui lòng thử lại sau!';
      toast.error(msg);
    }
  };

  const handleToggleMenu = (e: React.MouseEvent<HTMLButtonElement>, member: GroupMember) => {
    e.stopPropagation();
    if (menuAnchor?.member.id === member.id) {
      setMenuAnchor(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const isDropUp = spaceBelow < 170;

    if (isDropUp) {
      setMenuAnchor({
        member,
        bottom: window.innerHeight - rect.top + 6,
        right: window.innerWidth - rect.right,
      });
    } else {
      setMenuAnchor({
        member,
        top: rect.bottom + 6,
        right: window.innerWidth - rect.right,
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setConfirmAction(null);
        setMenuAnchor(null);
        setSearchTerm('');
        onClose();
      }}
      title="Quản lý thành viên nhóm"
      description={`Quản lý và xét duyệt quyền thành viên trong nhóm ${groupName}`}
      size="lg"
    >
      <div className="space-y-4">
        {/* Tab switcher */}
        <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
          <button
            type="button"
            onClick={() => {
              setActiveTab('MEMBERS');
              setConfirmAction(null);
              setMenuAnchor(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'MEMBERS'
                ? 'bg-primary-600 text-white shadow-2xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Thành viên ({members.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('BANNED');
              setConfirmAction(null);
              setMenuAnchor(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'BANNED'
                ? 'bg-red-600 text-white shadow-2xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Ban className="w-3.5 h-3.5" />
            <span>Danh sách cấm ({bannedMembers.length})</span>
          </button>
        </div>

        {/* Confirmation dialog banner inside modal */}
        {confirmAction && (
          <div
            className={`p-3.5 border rounded-2xl space-y-2 animate-fadeIn ${
              confirmAction.type === 'TRANSFER'
                ? 'bg-amber-50/90 border-amber-200'
                : 'bg-red-50/90 border-red-200'
            }`}
          >
            <div
              className={`flex items-center gap-2 text-xs font-bold ${
                confirmAction.type === 'TRANSFER' ? 'text-amber-900' : 'text-red-900'
              }`}
            >
              {confirmAction.type === 'TRANSFER' ? (
                <Crown className="w-4 h-4 text-amber-600 shrink-0" />
              ) : (
                <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>
                {confirmAction.type === 'TRANSFER'
                  ? `Chuyển quyền Trưởng nhóm cho @${confirmAction.user.name}?`
                  : confirmAction.type === 'KICK'
                  ? `Xác nhận đuổi thành viên @${confirmAction.user.name}?`
                  : `Xác nhận cấm vĩnh viễn @${confirmAction.user.name} khỏi nhóm?`}
              </span>
            </div>
            <p
              className={`text-[11px] leading-relaxed ${
                confirmAction.type === 'TRANSFER' ? 'text-amber-800' : 'text-red-700'
              }`}
            >
              {confirmAction.type === 'TRANSFER'
                ? `Sau khi phân quyền, bạn sẽ trở thành thành viên thường. Người này sẽ nắm toàn quyền quản lý nhóm ${groupName}.`
                : confirmAction.type === 'KICK'
                ? 'Thành viên này sẽ bị xóa khỏi nhóm nhưng vẫn có thể tìm kiếm và tham gia lại sau này.'
                : 'Thành viên này sẽ bị xóa khỏi nhóm và không thể xem hoặc tham gia lại nhóm này nữa.'}
            </p>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleExecuteAction}
                disabled={isKicking || isBanning || isTransferring}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold text-white cursor-pointer shadow-2xs disabled:opacity-50 ${
                  confirmAction.type === 'TRANSFER'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {confirmAction.type === 'TRANSFER'
                  ? 'Xác nhận chuyển quyền'
                  : confirmAction.type === 'KICK'
                  ? 'Đuổi khỏi nhóm'
                  : 'Cấm khỏi nhóm'}
              </button>
            </div>
          </div>
        )}

        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={
              activeTab === 'MEMBERS'
                ? 'Tìm thành viên theo tên hoặc email...'
                : 'Tìm người bị cấm...'
            }
            className="w-full pl-9 pr-4 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500 font-medium transition-all placeholder:text-gray-400"
          />
        </div>

        {/* List content */}
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1 min-h-[160px]">
          {activeTab === 'MEMBERS' ? (
            isLoadingMembers ? (
              <div className="py-10 text-center text-xs text-gray-400 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-primary-600" />
                <span>Đang tải danh sách thành viên...</span>
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-400">
                Không tìm thấy thành viên nào phù hợp.
              </div>
            ) : (
              filteredMembers.map((member: GroupMember) => {
                const isOwner = member.id === currentOwnerId;
                const isMenuOpen = menuAnchor?.member.id === member.id;

                return (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-white border border-gray-100 hover:border-gray-200 transition-all group"
                  >
                    {/* User profile */}
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={
                          member.avatar ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'
                        }
                        alt={member.name}
                        className="w-9 h-9 rounded-full object-cover border border-gray-200 shrink-0 shadow-2xs"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-gray-900 truncate">
                            {member.name}
                          </h4>
                          {isOwner && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold flex items-center gap-1 shrink-0">
                              <Crown className="w-3 h-3 text-amber-600" />
                              <span>Trưởng nhóm</span>
                            </span>
                          )}
                        </div>
                        {member.email && (
                          <p className="text-[11px] text-gray-400 font-normal truncate">
                            {member.email}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Host action 3-dots trigger button */}
                    {!isOwner && (
                      <button
                        type="button"
                        onClick={(e) => handleToggleMenu(e, member)}
                        className={`p-2 rounded-xl text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors cursor-pointer border member-action-menu-btn shrink-0 ml-2 ${
                          isMenuOpen
                            ? 'bg-gray-100 border-gray-300 text-gray-800'
                            : 'border-transparent'
                        }`}
                        title="Tùy chọn quản lý"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })
            )
          ) : isLoadingBanned ? (
            <div className="py-10 text-center text-xs text-gray-400 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-red-600" />
              <span>Đang tải danh sách cấm...</span>
            </div>
          ) : filteredBanned.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-400 space-y-1">
              <Ban className="w-6 h-6 text-gray-300 mx-auto" />
              <p className="font-semibold text-gray-600">Danh sách cấm trống</p>
              <p className="text-[11px] text-gray-400">Không có thành viên nào bị cấm khỏi nhóm.</p>
            </div>
          ) : (
            filteredBanned.map((bannedUser: BannedMember) => (
              <div
                key={bannedUser.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-red-50/40 border border-red-100 hover:border-red-200 transition-all"
              >
                {/* User profile */}
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={
                      bannedUser.avatar ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'
                    }
                    alt={bannedUser.name}
                    className="w-9 h-9 rounded-full object-cover border border-gray-200 shrink-0 opacity-75"
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-gray-900 truncate">{bannedUser.name}</h4>
                    {bannedUser.email && (
                      <p className="text-[11px] text-gray-400 font-normal truncate">
                        {bannedUser.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Unban action */}
                <button
                  type="button"
                  onClick={() => handleUnban(bannedUser)}
                  disabled={isUnbanning}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Bỏ cấm</span>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Floating Portal-style 3-dots dropdown menu (Never clipped by overflow or modal borders) */}
        {menuAnchor && (
          <div
            style={{
              position: 'fixed',
              top: menuAnchor.top !== undefined ? `${menuAnchor.top}px` : undefined,
              bottom: menuAnchor.bottom !== undefined ? `${menuAnchor.bottom}px` : undefined,
              right: `${menuAnchor.right}px`,
            }}
            className="w-52 bg-white rounded-2xl shadow-2xl border border-gray-100 py-1.5 z-50 animate-fadeIn space-y-0.5 member-action-floating-menu"
          >
            <button
              type="button"
              onClick={() => {
                const targetUser = menuAnchor.member;
                setMenuAnchor(null);
                setConfirmAction({ type: 'TRANSFER', user: targetUser });
              }}
              className="w-full px-3 py-2 text-left text-xs font-semibold text-gray-700 hover:bg-amber-50 hover:text-amber-800 flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Phân quyền Trưởng nhóm</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const targetUser = menuAnchor.member;
                setMenuAnchor(null);
                setConfirmAction({ type: 'KICK', user: targetUser });
              }}
              className="w-full px-3 py-2 text-left text-xs font-semibold text-gray-700 hover:bg-orange-50 hover:text-orange-800 flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <UserX className="w-4 h-4 text-orange-500 shrink-0" />
              <span>Đuổi khỏi nhóm</span>
            </button>

            <div className="border-t border-gray-100 my-1" />

            <button
              type="button"
              onClick={() => {
                const targetUser = menuAnchor.member;
                setMenuAnchor(null);
                setConfirmAction({ type: 'BAN', user: targetUser });
              }}
              className="w-full px-3 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <Ban className="w-4 h-4 text-red-600 shrink-0" />
              <span>Cấm khỏi nhóm</span>
            </button>
          </div>
        )}

        {/* Modal footer */}
        <div className="flex items-center justify-end pt-3 border-t border-gray-100">
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </Modal>
  );
};
