import React, { useMemo } from 'react';
import { ShieldCheck, Wallet } from 'lucide-react';
import { useGetMyWalletQuery, useGetWalletHistoryQuery, type CreditLedgerEntry } from '@/core/api';
import { CreditLedgerTable } from '@/features/user/components/profile/CreditLedgerTable';

export const WalletManagementPage: React.FC = () => {
  const { data: wallet } = useGetMyWalletQuery();
  const { data: historyData } = useGetWalletHistoryQuery();

  const balance = wallet?.availableBalance ?? 0;
  const escrowed = wallet?.escrowedBalance ?? 0;

  // Map real backend ledger transactions to UI
  const transactions = useMemo(() => {
    if (!historyData?.entries || historyData.entries.length === 0) {
      return [];
    }

    return historyData.entries.map((entry: CreditLedgerEntry) => {
      const isCredit = entry.direction === 'CREDIT';
      const createdDate = new Date(entry.createdAt);
      const dateStr = `${String(createdDate.getDate()).padStart(2, '0')}/${String(
        createdDate.getMonth() + 1,
      ).padStart(2, '0')}/${createdDate.getFullYear()}`;

      let typeLabel = 'Giao dịch';
      let typeBg = 'bg-gray-50 text-gray-700';

      if (entry.entryType === 'ONBOARDING_REWARD' || entry.entryType === 'ESCROW_RELEASE') {
        typeLabel = 'Thu nhập';
        typeBg = 'bg-emerald-50 text-emerald-700';
      } else if (entry.entryType === 'ESCROW_HOLD') {
        typeLabel = 'Tạm giữ';
        typeBg = 'bg-amber-50 text-amber-700';
      } else if (entry.entryType.includes('REFUND')) {
        typeLabel = 'Hoàn trả';
        typeBg = 'bg-blue-50 text-blue-700';
      }

      return {
        id: entry.id,
        title: entry.referenceKind ? `Khóa học / Hoạt động (${entry.referenceKind})` : 'Giao dịch ví',
        subtitle: `Mã GD: ${entry.id.slice(0, 8)}...`,
        type: typeLabel,
        typeBg,
        status: 'Đã xử lý',
        date: dateStr,
        amount: `${isCredit ? '+' : '-'}${entry.amount}m`,
        amountColor: isCredit ? 'text-primary-700 font-bold' : 'text-gray-700 font-bold',
      };
    });
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
      <CreditLedgerTable ledgerTransactions={transactions} />
    </div>
  );
};
