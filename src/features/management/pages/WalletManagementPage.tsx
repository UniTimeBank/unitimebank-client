import React, { useMemo, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { ShieldCheck, Wallet } from 'lucide-react';
import { useGetMyWalletQuery, useGetWalletHistoryQuery, type CreditLedgerEntry, baseApi } from '@/core/api';
import { CreditLedgerTable } from '@/features/user/components/profile/CreditLedgerTable';
import { parseUtcDate } from '@/shared/utils';
import { getNotificationSocket } from '@/features/notification/utils';

export const WalletManagementPage: React.FC = () => {
  const dispatch = useDispatch();

  const {
    data: wallet,
    refetch: refetchWallet,
    isFetching: isFetchingWallet,
  } = useGetMyWalletQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
    pollingInterval: 3000, // Tự động refetch nền mỗi 3 giây
  });

  const {
    data: historyData,
    refetch: refetchHistory,
    isFetching: isFetchingHistory,
  } = useGetWalletHistoryQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
    pollingInterval: 3000, // Tự động refetch nền mỗi 3 giây
  });

  const isRefreshing = isFetchingWallet || isFetchingHistory;

  const handleManualRefresh = () => {
    refetchWallet();
    refetchHistory();
    dispatch(baseApi.util.invalidateTags(['Wallet']));
  };

  // Lắng nghe Socket để cập nhật 0ms ngay khi có sự kiện ví hoặc thông báo
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const socket = getNotificationSocket(token);
    if (!socket) return;

    const handleRealtimeUpdate = () => {
      refetchWallet();
      refetchHistory();
      dispatch(baseApi.util.invalidateTags(['Wallet']));
    };

    socket.on('notification:new', handleRealtimeUpdate);
    socket.on('notification:update', handleRealtimeUpdate);
    socket.on('wallet:update', handleRealtimeUpdate);

    return () => {
      socket.off('notification:new', handleRealtimeUpdate);
      socket.off('notification:update', handleRealtimeUpdate);
      socket.off('wallet:update', handleRealtimeUpdate);
    };
  }, [refetchWallet, refetchHistory, dispatch]);

  const balance = wallet?.availableBalance ?? 0;
  const escrowed = wallet?.escrowedBalance ?? 0;

  // Map real backend ledger transactions to UI with Smart Aggregation
  const transactions = useMemo(() => {
    if (!historyData?.entries || historyData.entries.length === 0) {
      return [];
    }

    // 1. Lọc bỏ các bản ghi nhịp tim tạm thời của Host (Host chỉ nhận thù lao khi phòng học chính thức đóng)
    const validEntries = historyData.entries.filter((entry: CreditLedgerEntry) => {
      if (entry.direction === 'CREDIT' && entry.entryType === 'HEARTBEAT_DEDUCT') {
        return false;
      }
      return true;
    });

    // Sắp xếp giảm dần theo thời gian mới nhất
    const sorted = [...validEntries].sort((a, b) => {
      const timeA = parseUtcDate(a.createdAt).getTime();
      const timeB = parseUtcDate(b.createdAt).getTime();
      return timeB - timeA;
    });

    const formatTime = (d: Date) =>
      `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    const formatTimeFull = (d: Date) =>
      `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(
        d.getSeconds(),
      ).padStart(2, '0')}`;
    const formatDate = (d: Date) =>
      `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(
        2,
        '0',
      )}/${d.getFullYear()}`;

    // 2. Sessionize / Group consecutive HEARTBEAT_DEDUCT transactions
    const SESSION_MAX_GAP_MS = 15 * 60 * 1000; // 15 minutes gap threshold
    const result: any[] = [];

    let currentSession: {
      sessionKey: string;
      direction: 'CREDIT' | 'DEBIT';
      entries: CreditLedgerEntry[];
      lastTime: number;
    } | null = null;

    const flushCurrentSession = () => {
      if (!currentSession) return;
      const { entries, direction } = currentSession;
      const isCredit = direction === 'CREDIT';
      const newestEntry = entries[0];
      const oldestEntry = entries[entries.length - 1];
      const totalAmount = entries.reduce((sum, e) => sum + (Number(e.amount) || 1), 0);
      const totalMinutes = entries.length;

      const startDate = parseUtcDate(oldestEntry.createdAt);
      const endDate = parseUtcDate(newestEntry.createdAt);

      const timeRange =
        formatTime(startDate) === formatTime(endDate)
          ? formatTime(endDate)
          : `${formatTime(startDate)} - ${formatTime(endDate)}`;

      const dateStr = formatDate(endDate);

      const subItems = entries.map((e, idx) => {
        const d = parseUtcDate(e.createdAt);
        const refParts = (e.referenceId || '').split(':');
        const minIdx = refParts[3] ? `Phút #${refParts[3]}` : `Phút #${entries.length - idx}`;
        return {
          id: e.id,
          title: minIdx,
          time: formatTimeFull(d),
          amount: `${isCredit ? '+' : '-'}${e.amount || 1} CR`,
        };
      });

      result.push({
        id: `grouped_${newestEntry.id}`,
        title: isCredit
          ? `Thù lao học nhóm trực tuyến`
          : `Học phí học nhóm trực tuyến`,
        subtitle: `Phiên học nhóm (${totalMinutes} phút)`,
        type: isCredit ? 'Thu nhập dạy' : 'Chi phí học',
        typeBg: isCredit ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700',
        status: 'Đã xử lý',
        time: timeRange,
        date: dateStr,
        rawTimestamp: endDate.getTime(),
        amount: `${isCredit ? '+' : '-'}${totalAmount} CR`,
        amountColor: isCredit ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold',
        role: isCredit ? 'TEACHING' : 'LEARNING',
        isGrouped: totalMinutes > 1,
        totalMinutes,
        subItems: totalMinutes > 1 ? subItems : undefined,
      });

      currentSession = null;
    };

    for (const entry of sorted) {
      if (entry.entryType === 'HEARTBEAT_DEDUCT') {
        const ref = entry.referenceId || '';
        const parts = ref.split(':');
        const roomId = parts[1] || 'room';
        const entryTime = parseUtcDate(entry.createdAt).getTime();
        const sessionKey = `${roomId}_${entry.direction}`;

        if (
          currentSession &&
          currentSession.sessionKey === sessionKey &&
          Math.abs(currentSession.lastTime - entryTime) <= SESSION_MAX_GAP_MS
        ) {
          currentSession.entries.push(entry);
          currentSession.lastTime = entryTime;
        } else {
          flushCurrentSession();
          currentSession = {
            sessionKey,
            direction: entry.direction,
            entries: [entry],
            lastTime: entryTime,
          };
        }
      } else {
        flushCurrentSession();

        const isCredit = entry.direction === 'CREDIT';
        const createdDate = parseUtcDate(entry.createdAt);

        let typeLabel = 'Giao dịch';
        let typeBg = 'bg-gray-50 text-gray-700';
        let role: 'LEARNING' | 'TEACHING' | 'SYSTEM' = isCredit ? 'TEACHING' : 'LEARNING';

        if (entry.entryType === 'ONBOARDING_REWARD') {
          typeLabel = 'Thưởng';
          typeBg = 'bg-emerald-50 text-emerald-700';
          role = 'SYSTEM';
        } else if (entry.entryType === 'ESCROW_RELEASE') {
          typeLabel = 'Thu nhập dạy';
          typeBg = 'bg-emerald-50 text-emerald-700';
          role = 'TEACHING';
        } else if (entry.entryType === 'ESCROW_HOLD') {
          typeLabel = 'Tạm giữ';
          typeBg = 'bg-amber-50 text-amber-700';
          role = 'LEARNING';
        } else if (entry.entryType.includes('REFUND')) {
          typeLabel = 'Hoàn trả';
          typeBg = 'bg-blue-50 text-blue-700';
          role = 'LEARNING';
        }

        let title = entry.referenceKind ? `Khóa học / Hoạt động (${entry.referenceKind})` : 'Giao dịch ví';
        if (entry.entryType === 'ESCROW_RELEASE') {
          title = entry.referenceKind === 'SESSION_ROOM'
            ? 'Thù lao hoàn thành phòng học nhóm'
            : 'Thù lao hoàn thành buổi học 1:1';
        } else if (entry.entryType === 'ESCROW_HOLD') {
          title = 'Ký quỹ buổi học trực tuyến 1:1';
        } else if (entry.entryType === 'ONBOARDING_REWARD') {
          title = 'Thưởng nhiệm vụ hệ thống';
        }

        result.push({
          id: entry.id,
          title,
          subtitle: `Mã GD: ${entry.id.slice(0, 8)}...`,
          type: typeLabel,
          typeBg,
          status: 'Đã xử lý',
          time: formatTimeFull(createdDate),
          date: formatDate(createdDate),
          rawTimestamp: createdDate.getTime(),
          amount: `${isCredit ? '+' : '-'}${entry.amount} CR`,
          amountColor: isCredit ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold',
          role,
        });
      }
    }

    flushCurrentSession();
    return result;
  }, [historyData]);

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-6 sm:p-8 relative space-y-6 animate-in fade-in duration-200">
      {/* ════════════════════════════════════════════════════════════════ */}
      {/* HEADER BAR INSIDE CARD */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mb-1">
            Ví Credit & Sổ cái thời gian
          </h2>
          <p className="text-xs text-slate-500">
            Theo dõi số dư Credit, lịch sử tích lũy qua các buổi học và điểm danh hàng ngày.
          </p>
        </div>
      </div>

      {/* Wallet balance banner - 100% Dynamic */}
      <div className="bg-primary-800 text-white rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-primary-200 block">
              SỐ DƯ KHẢ DỤNG
            </span>
            <div className="text-3xl sm:text-4xl font-black text-white">
              {balance} <span className="text-lg font-bold text-primary-200">CR</span>
            </div>
            <p className="text-xs text-primary-100/90 font-medium">
              Tương đương {(balance / 60).toFixed(1)} giờ học 1-1 trên hệ thống UniTimeBank.
              {escrowed > 0 && ` (Đang tạm giữ: ${escrowed} CR)`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/15 text-primary-100 text-xs font-bold rounded-xl border border-white/20">
              <ShieldCheck className="w-4 h-4 text-primary-300" />
              <span>Bảo chứng Ký quỹ an toàn</span>
            </span>
          </div>
        </div>
      </div>

      {/* Credit Ledger Table with real entries */}
      <CreditLedgerTable
        ledgerTransactions={transactions}
        onRefresh={handleManualRefresh}
        isRefreshing={isRefreshing}
      />
    </div>
  );
};
