import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Plus, Radio, Search, X, CalendarCheck, Users, Clock, Crown, UserCheck, GraduationCap, BookOpen } from 'lucide-react';
import { CreateGroupRoomModal } from '@/features/session';
import { ManageGroupRoomCard } from '../components';
import {
  useGetActiveGroupRoomsQuery,
  useGetGroupRoomsHistoryQuery,
  useCloseGroupRoomMutation,
} from '@/core/api/session';
import { toast } from '@/shared/utils';
import { Button, Tabs } from '@/shared/components/ui';
import { FALLBACK_CATEGORY_IMAGES, DEFAULT_POST_COVER, SKILL_CATEGORY_LABELS } from '@/features/post/constants';
import type { RootState } from '@/core/store';

export const GroupSessionsManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const authUser = useSelector((state: RootState) => state.auth.user);
  const currentUserId = authUser?.id;

  const [roleTab, setRoleTab] = useState<'HOST' | 'PARTICIPANT'>('HOST');
  const [groupTab, setGroupTab] = useState<'ACTIVE' | 'HISTORY'>('ACTIVE');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);

  // Active Group Rooms Query
  const {
    data: groupRoomsData,
    isLoading: isGroupRoomsLoading,
    refetch: refetchGroupRooms,
  } = useGetActiveGroupRoomsQuery(undefined, {
    pollingInterval: 12000,
    refetchOnFocus: true,
  });

  // History Group Rooms Query
  const {
    data: historyRoomsData,
    isLoading: isHistoryRoomsLoading,
    refetch: refetchHistoryRooms,
  } = useGetGroupRoomsHistoryQuery(undefined, {
    refetchOnFocus: true,
  });

  const [closeGroupRoom, { isLoading: isClosingGroupRoom }] = useCloseGroupRoomMutation();

  const handleCloseGroupRoom = async (roomId: string) => {
    try {
      await closeGroupRoom(roomId).unwrap();
      toast.success('Đã đóng phòng học nhóm.');
      refetchGroupRooms();
      refetchHistoryRooms();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Không thể đóng phòng học nhóm.');
    }
  };

  // Lọc chỉ những phòng nhóm do chính người dùng hiện tại mở (Host)
  const myActiveGroupRooms = useMemo(() => {
    if (!currentUserId) return [];
    return (groupRoomsData?.rooms || []).filter(
      (r) => String(r.mentorId) === String(currentUserId),
    );
  }, [groupRoomsData, currentUserId]);

  // Lọc phòng nhóm đang mở mà người dùng đang tham gia (Participant)
  const myActiveParticipantRooms = useMemo(() => {
    if (!currentUserId) return [];
    return (groupRoomsData?.rooms || []).filter((r: any) => {
      if (String(r.mentorId) === String(currentUserId)) return false;
      return (r.participantUserIds || []).some(
        (uid: string) => String(uid) === String(currentUserId),
      );
    });
  }, [groupRoomsData, currentUserId]);

  const historyGroupRooms = useMemo(() => historyRoomsData?.rooms || [], [historyRoomsData]);

  // Phân chia lịch sử: Phòng do tôi mở (Host) vs Phòng do tôi tham gia (Participant)
  const myHostHistoryRooms = useMemo(() => {
    return historyGroupRooms.filter((r: any) => r.isHost);
  }, [historyGroupRooms]);

  const myParticipantHistoryRooms = useMemo(() => {
    return historyGroupRooms.filter((r: any) => !r.isHost);
  }, [historyGroupRooms]);

  // Danh sách active host filtered theo search
  const filteredActiveRooms = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return myActiveGroupRooms;
    return myActiveGroupRooms.filter(
      (r) =>
        r.title?.toLowerCase().includes(q) ||
        r.category?.toLowerCase().includes(q),
    );
  }, [searchQuery, myActiveGroupRooms]);

  // Danh sách active participant filtered theo search
  const filteredActiveParticipantRooms = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return myActiveParticipantRooms;
    return myActiveParticipantRooms.filter(
      (r) =>
        r.title?.toLowerCase().includes(q) ||
        r.category?.toLowerCase().includes(q),
    );
  }, [searchQuery, myActiveParticipantRooms]);

  // Danh sách host history filtered theo search
  const filteredHostHistoryRooms = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return myHostHistoryRooms;
    return myHostHistoryRooms.filter(
      (r: any) =>
        r.title?.toLowerCase().includes(q) ||
        r.category?.toLowerCase().includes(q),
    );
  }, [searchQuery, myHostHistoryRooms]);

  // Danh sách participant history filtered theo search
  const filteredParticipantRooms = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return myParticipantHistoryRooms;
    return myParticipantHistoryRooms.filter(
      (r: any) =>
        r.title?.toLowerCase().includes(q) ||
        r.category?.toLowerCase().includes(q),
    );
  }, [searchQuery, myParticipantHistoryRooms]);

  // Helper lấy ảnh bìa theo danh mục an toàn
  const getCategoryCover = (category?: string) => {
    if (!category) return DEFAULT_POST_COVER;
    const upper = category.trim().toUpperCase();
    if (FALLBACK_CATEGORY_IMAGES[upper]) return FALLBACK_CATEGORY_IMAGES[upper];
    if (upper.includes('LẬP TRÌNH') || upper.includes('LAP TRINH') || upper.includes('CODE')) return FALLBACK_CATEGORY_IMAGES.PROGRAMMING;
    if (upper.includes('NGOẠI NGỮ') || upper.includes('NGOAI NGU') || upper.includes('TIẾNG')) return FALLBACK_CATEGORY_IMAGES.LANGUAGE;
    if (upper.includes('THIẾT KẾ') || upper.includes('THIET KE') || upper.includes('DESIGN')) return FALLBACK_CATEGORY_IMAGES.DESIGN;
    if (upper.includes('HỌC THUẬT') || upper.includes('HOC THUAT') || upper.includes('TOÁN')) return FALLBACK_CATEGORY_IMAGES.ACADEMIC;
    if (upper.includes('KINH DOANH') || upper.includes('KINH TE')) return FALLBACK_CATEGORY_IMAGES.BUSINESS;
    if (upper.includes('KỸ NĂNG') || upper.includes('KY NANG')) return FALLBACK_CATEGORY_IMAGES.SOFT_SKILLS;
    if (upper.includes('ÂM NHẠC') || upper.includes('AM NHAC')) return FALLBACK_CATEGORY_IMAGES.MUSIC;
    if (upper.includes('THỂ THAO') || upper.includes('THE THAO')) return FALLBACK_CATEGORY_IMAGES.SPORTS;
    return DEFAULT_POST_COVER;
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-6 sm:p-8 relative space-y-6 animate-in fade-in duration-200">
      {/* ════════════════════════════════════════════════════════════════ */}
      {/* 1. HEADER BAR */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-1">
            Quản lý Lớp học nhóm
          </h2>
          <p className="text-xs text-slate-500">
            Quản lý các phòng học nhóm trực tuyến do bạn mở hoặc lịch sử các buổi học đã tham gia.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate('/rooms/group')}
            className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold px-3.5 py-2 flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Radio className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
            <span>Sảnh học nhóm</span>
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => setIsCreateGroupModalOpen(true)}
            className="rounded-xl bg-primary-700 hover:bg-primary-800 text-white font-bold text-xs py-2 px-4 shadow-xs whitespace-nowrap cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Tạo phòng nhóm mới</span>
          </Button>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* 2. PRIMARY ROLE TABS (Phòng tôi mở vs Phòng tôi tham gia) */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <div className="border-b border-gray-200">
        <Tabs<'HOST' | 'PARTICIPANT'>
          value={roleTab}
          onChange={(newRole) => {
            setRoleTab(newRole);
            if (newRole === 'PARTICIPANT') {
              setGroupTab('HISTORY');
            } else {
              setGroupTab('ACTIVE');
            }
          }}
          variant="underline"
          options={[
            {
              value: 'HOST',
              label: 'Phòng tôi mở',
              count: myActiveGroupRooms.length + myHostHistoryRooms.length,
              icon: <GraduationCap className="w-4 h-4" />,
            },
            {
              value: 'PARTICIPANT',
              label: 'Phòng tôi tham gia',
              count: myParticipantHistoryRooms.length,
              icon: <BookOpen className="w-4 h-4" />,
            },
          ]}
        />
      </div>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* 3. SUB-STATUS FILTER PILLS & SEARCH BAR */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        {/* Status Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {roleTab === 'HOST' ? (
            (
              [
                { value: 'ACTIVE', label: 'Đang mở', count: myActiveGroupRooms.length },
                { value: 'HISTORY', label: 'Lịch sử đã đóng', count: myHostHistoryRooms.length },
              ] as const
            ).map((tab) => {
              const isActive = groupTab === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setGroupTab(tab.value)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border ${
                    isActive
                      ? 'bg-primary-50 text-primary-800 border-primary-300 font-bold shadow-2xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-primary-200/80 text-primary-900' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })
          ) : (
            (
              [
                { value: 'ACTIVE', label: 'Đang tham gia', count: myActiveParticipantRooms.length },
                { value: 'HISTORY', label: 'Lịch sử đã học', count: myParticipantHistoryRooms.length },
              ] as const
            ).map((tab) => {
              const isActive = groupTab === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setGroupTab(tab.value)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border ${
                    isActive
                      ? 'bg-primary-50 text-primary-800 border-primary-300 font-bold shadow-2xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-primary-200/80 text-primary-900' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Quick Search */}
        <div className="w-full sm:w-80 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo chủ đề, danh mục phòng nhóm..."
              className="w-full pl-10 pr-9 py-2 bg-gray-50/90 hover:bg-white focus:bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-medium placeholder:text-gray-400 placeholder:text-xs focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* 4. GROUP ROOMS CONTENT */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {roleTab === 'HOST' ? (
        groupTab === 'ACTIVE' ? (
          isGroupRoomsLoading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-bold text-gray-500">Đang tải phòng học nhóm...</p>
            </div>
          ) : filteredActiveRooms.length === 0 ? (
            <div className="bg-gray-50/50 rounded-3xl p-12 border border-dashed border-gray-200 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-700 flex items-center justify-center mx-auto shadow-xs">
                <Radio className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h3 className="text-sm font-bold text-gray-900">
                  {searchQuery ? 'Không tìm thấy phòng nhóm phù hợp' : 'Bạn chưa có phòng học nhóm nào đang mở'}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed font-medium">
                  Bạn có thể tạo và mở một phòng học nhóm mới để cùng các bạn sinh viên khác trao đổi kiến thức ngay bây giờ.
                </p>
              </div>
              <div className="pt-2">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => setIsCreateGroupModalOpen(true)}
                  className="rounded-xl bg-primary-700 hover:bg-primary-800 text-white font-bold text-xs py-2.5 px-5 shadow-xs cursor-pointer"
                >
                  Mở phòng học nhóm ngay
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredActiveRooms.map((room) => (
                <ManageGroupRoomCard
                  key={room.roomId}
                  room={room}
                  currentUserId={currentUserId}
                  onCloseRoom={handleCloseGroupRoom}
                  isClosing={isClosingGroupRoom}
                />
              ))}
            </div>
          )
        ) : (
          /* HOST HISTORY GROUP ROOMS */
          isHistoryRoomsLoading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-bold text-gray-500">Đang tải lịch sử phòng nhóm...</p>
            </div>
          ) : filteredHostHistoryRooms.length === 0 ? (
            <div className="bg-gray-50/50 rounded-3xl p-12 border border-dashed border-gray-200 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto shadow-xs">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h3 className="text-sm font-bold text-gray-900">Chưa có lịch sử phòng bạn đã mở</h3>
                <p className="text-xs text-gray-500 leading-relaxed font-medium">
                  Các phòng học nhóm do chính bạn tạo và tổ chức sau khi kết thúc sẽ được lưu vết tại đây.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredHostHistoryRooms.map((room: any) => {
                const rawCat = (room.category || 'PROGRAMMING').toUpperCase();
                const categoryLabel = (SKILL_CATEGORY_LABELS[rawCat] || room.category || 'HỌC NHÓM').toUpperCase();
                const coverUrl = getCategoryCover(room.category);

                return (
                  <div
                    key={room.roomId}
                    className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs hover:border-slate-300 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1 min-w-0">
                      {/* Thumbnail */}
                      <div className="w-full sm:w-44 md:w-48 h-32 sm:h-28 rounded-xl overflow-hidden relative shrink-0 bg-slate-900 select-none">
                        <img
                          src={coverUrl}
                          alt={room.title}
                          className="w-full h-full object-cover grayscale-30"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none" />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-800/90 backdrop-blur-md text-slate-300 text-[10px] font-bold tracking-wide">
                          Đã kết thúc
                        </span>
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white text-[11px] font-medium flex items-center gap-1">
                          <Users className="w-3 h-3 text-slate-300" />
                          <span>{room.totalParticipants || 1} người tham gia</span>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                            {categoryLabel}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
                            <Crown className="w-3 h-3 text-blue-600" />
                            <span>Host (Phòng của bạn)</span>
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-1 sm:line-clamp-2">
                          {room.title}
                        </h3>

                        <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap pt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>Thời lượng: <strong className="text-slate-800 font-bold">{room.durationMinutes || 0} phút</strong></span>
                          </span>
                          {room.openedAt && (
                            <>
                              <span className="text-slate-300">•</span>
                              <span className="text-slate-400 text-[11px]">
                                {new Date(room.openedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}{' '}
                                -{' '}
                                {new Date(room.openedAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Status label */}
                    <div className="shrink-0 text-xs font-semibold text-slate-500 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200/60 text-center">
                      Lịch sử đã lưu
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )
      ) : groupTab === 'ACTIVE' ? (
        /* PARTICIPANT ACTIVE GROUP ROOMS */
        isGroupRoomsLoading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-gray-500">Đang tải phòng học đang tham gia...</p>
          </div>
        ) : filteredActiveParticipantRooms.length === 0 ? (
          <div className="bg-gray-50/50 rounded-3xl p-12 border border-dashed border-gray-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-700 flex items-center justify-center mx-auto shadow-xs">
              <Radio className="w-6 h-6" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="text-sm font-bold text-gray-900">
                {searchQuery ? 'Không tìm thấy phòng nhóm phù hợp' : 'Bạn chưa tham gia phòng nhóm nào đang mở'}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed font-medium">
                Khám phá sảnh học nhóm để tham gia cùng các mentor và bạn bè ngay bây giờ.
              </p>
            </div>
            <div className="pt-2">
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => navigate('/rooms/group')}
                className="rounded-xl bg-primary-700 hover:bg-primary-800 text-white font-bold text-xs py-2.5 px-5 shadow-xs cursor-pointer"
              >
                Khám phá sảnh học nhóm
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredActiveParticipantRooms.map((room) => (
              <ManageGroupRoomCard
                key={room.roomId}
                room={room}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        )
      ) : (
        /* PARTICIPANT HISTORY GROUP ROOMS */
        isHistoryRoomsLoading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-gray-500">Đang tải lịch sử tham gia...</p>
          </div>
        ) : filteredParticipantRooms.length === 0 ? (
          <div className="bg-gray-50/50 rounded-3xl p-12 border border-dashed border-gray-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto shadow-xs">
              <Users className="w-6 h-6" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="text-sm font-bold text-gray-900">
                {searchQuery ? 'Không tìm thấy phòng nhóm phù hợp' : 'Chưa có lịch sử tham gia phòng nhóm'}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed font-medium">
                Các phòng học nhóm bạn từng tham gia thảo luận cùng cộng đồng sẽ được lưu vết chi tiết tại đây.
              </p>
            </div>
            <div className="pt-2">
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => navigate('/rooms/group')}
                className="rounded-xl bg-primary-700 hover:bg-primary-800 text-white font-bold text-xs py-2.5 px-5 shadow-xs cursor-pointer"
              >
                Khám phá sảnh học nhóm
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredParticipantRooms.map((room: any) => {
              const rawCat = (room.category || 'PROGRAMMING').toUpperCase();
              const categoryLabel = (SKILL_CATEGORY_LABELS[rawCat] || room.category || 'HỌC NHÓM').toUpperCase();
              const coverUrl = getCategoryCover(room.category);

              return (
                <div
                  key={room.roomId}
                  className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs hover:border-slate-300 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1 min-w-0">
                    {/* Thumbnail */}
                    <div className="w-full sm:w-44 md:w-48 h-32 sm:h-28 rounded-xl overflow-hidden relative shrink-0 bg-slate-900 select-none">
                      <img
                        src={coverUrl}
                        alt={room.title}
                        className="w-full h-full object-cover grayscale-30"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none" />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-800/90 backdrop-blur-md text-slate-300 text-[10px] font-bold tracking-wide">
                        Đã kết thúc
                      </span>
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white text-[11px] font-medium flex items-center gap-1">
                        <Users className="w-3 h-3 text-slate-300" />
                        <span>{room.totalParticipants || 1} người tham gia</span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                          {categoryLabel}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-semibold">
                          <UserCheck className="w-3 h-3 text-slate-500" />
                          <span>Thành viên tham gia</span>
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-1 sm:line-clamp-2">
                        {room.title}
                      </h3>

                      <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap pt-0.5">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Thời lượng: <strong className="text-slate-800 font-bold">{room.durationMinutes || 0} phút</strong></span>
                        </span>
                        {room.openedAt && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="text-slate-400 text-[11px]">
                              {new Date(room.openedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}{' '}
                              -{' '}
                              {new Date(room.openedAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status label */}
                  <div className="shrink-0 text-xs font-semibold text-slate-500 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200/60 text-center">
                    Lịch sử đã lưu
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Modal Tạo Phòng Nhóm */}
      <CreateGroupRoomModal
        isOpen={isCreateGroupModalOpen}
        onClose={() => {
          setIsCreateGroupModalOpen(false);
          refetchGroupRooms();
        }}
      />
    </div>
  );
};
