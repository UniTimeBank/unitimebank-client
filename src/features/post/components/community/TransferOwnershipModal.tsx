import React, { useState, useMemo } from 'react';
import { ShieldCheck, Search, Crown, Check, Users, Loader2 } from 'lucide-react';
import { Modal, Button } from '@/shared/components/ui';
import { useGetGroupMembersQuery, useTransferGroupOwnershipMutation } from '@/core/api/community/communityApi';
import type { GroupMember } from '@/features/post/types';
import { toast } from 'react-hot-toast';

interface TransferOwnershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  groupName: string;
  currentOwnerId: string;
  onSuccess?: () => void;
}

export const TransferOwnershipModal: React.FC<TransferOwnershipModalProps> = ({
  isOpen,
  onClose,
  groupId,
  groupName,
  currentOwnerId,
  onSuccess,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  const { data: members = [], isLoading: isLoadingMembers } = useGetGroupMembersQuery(groupId, {
    skip: !isOpen || !groupId,
  });

  const [transferOwnership, { isLoading: isTransferring }] = useTransferGroupOwnershipMutation();

  // Eligible members to transfer to (exclude current owner)
  const eligibleMembers = useMemo(() => {
    return members.filter((m) => m.id !== currentOwnerId);
  }, [members, currentOwnerId]);

  const filteredMembers = useMemo(() => {
    if (!searchTerm.trim()) return eligibleMembers;
    const term = searchTerm.toLowerCase();
    return eligibleMembers.filter(
      (m) => m.name.toLowerCase().includes(term) || (m.email && m.email.toLowerCase().includes(term)),
    );
  }, [eligibleMembers, searchTerm]);

  const selectedMember = eligibleMembers.find((m) => m.id === selectedMemberId);

  const handleConfirmTransfer = async () => {
    if (!selectedMemberId || !selectedMember) {
      toast.error('Vui lòng chọn một thành viên để chuyển quyền');
      return;
    }

    try {
      await transferOwnership({ groupId, newOwnerId: selectedMemberId }).unwrap();
      toast.success(`Đã chuyển quyền trưởng nhóm cho @${selectedMember.name} thành công! 🎉`);
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message ||
        'Không thể chuyển quyền, vui lòng thử lại sau!';
      toast.error(msg);
    }
  };

  const handleClose = () => {
    setSelectedMemberId(null);
    setSearchTerm('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Phân quyền / Chuyển quyền Trưởng nhóm" size="md">
      <div className="space-y-4">
        {/* Important notice */}
        <div className="p-3.5 bg-amber-50/80 border border-amber-200/90 rounded-2xl flex items-start gap-3">
          <Crown className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 leading-relaxed font-medium">
            <p className="font-bold text-amber-950">Lưu ý quan trọng:</p>
            <p className="mt-0.5">
              Sau khi chuyển quyền, bạn sẽ trở thành thành viên thường và có thể rời nhóm nếu muốn. Người được chọn sẽ nắm toàn quyền quản lý nhóm <strong>{groupName}</strong>.
            </p>
          </div>
        </div>

        {/* Member Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên thành viên..."
            className="w-full pl-9 pr-4 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500 font-medium transition-all placeholder:text-gray-400"
          />
        </div>

        {/* Members list */}
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {isLoadingMembers ? (
            <div className="py-8 text-center text-xs text-gray-400 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-primary-600" />
              <span>Đang tải danh sách thành viên...</span>
            </div>
          ) : eligibleMembers.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-400 space-y-2">
              <Users className="w-8 h-8 text-gray-300 mx-auto" />
              <p className="font-semibold text-gray-600">Nhóm chưa có thành viên nào khác</p>
              <p className="text-[11px] text-gray-400">
                Hãy mời thêm bạn bè vào nhóm hoặc chọn giải tán nhóm nếu không còn nhu cầu duy trì.
              </p>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="py-6 text-center text-xs text-gray-400">
              Không tìm thấy thành viên phù hợp với từ khóa "{searchTerm}".
            </div>
          ) : (
            filteredMembers.map((member: GroupMember) => {
              const isSelected = selectedMemberId === member.id;
              return (
                <div
                  key={member.id}
                  onClick={() => setSelectedMemberId(member.id)}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-primary-50/80 border-primary-500 ring-2 ring-primary-500/20 shadow-xs'
                      : 'bg-white border-gray-100 hover:bg-gray-50/80 hover:border-gray-200'
                  }`}
                >
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
                      <h4 className="text-xs font-bold text-gray-900 truncate">{member.name}</h4>
                      {member.email && (
                        <p className="text-[11px] text-gray-400 font-normal truncate">{member.email}</p>
                      )}
                    </div>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all shrink-0 ml-3 ${
                      isSelected
                        ? 'bg-primary-600 border-primary-600 text-white'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected target preview */}
        {selectedMember && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Sẽ chuyển quyền Trưởng nhóm cho: <strong>{selectedMember.name}</strong>
            </span>
          </div>
        )}

        {/* Modal actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
          <Button variant="outline" onClick={handleClose} disabled={isTransferring}>
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirmTransfer}
            isLoading={isTransferring}
            disabled={!selectedMemberId || isTransferring || eligibleMembers.length === 0}
            leftIcon={<Crown className="w-4 h-4" />}
          >
            Xác nhận chuyển quyền
          </Button>
        </div>
      </div>
    </Modal>
  );
};
