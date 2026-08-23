import React, { useState, useMemo } from 'react';
import { Download, Calendar, Clock } from 'lucide-react';
import { Pagination } from '@/shared/components/ui';

export interface LedgerTransaction {
  id: string;
  title: string;
  subtitle: string;
  type: string;
  typeBg: string;
  status: string;
  date: string;
  time?: string;
  amount: string;
  amountColor: string;
  rawTimestamp?: number;
}

interface CreditLedgerTableProps {
  ledgerTransactions: LedgerTransaction[];
}

export const CreditLedgerTable: React.FC<CreditLedgerTableProps> = ({
  ledgerTransactions,
}) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [filterRange, setFilterRange] = useState<'ALL' | '30D' | '7D'>('ALL');

  // Filter transactions by time range
  const filteredTransactions = useMemo(() => {
    if (filterRange === 'ALL') return ledgerTransactions;
    const now = Date.now();
    const days = filterRange === '7D' ? 7 : 30;
    const cutoff = now - days * 24 * 60 * 60 * 1000;
    return ledgerTransactions.filter((tx) => {
      if (tx.rawTimestamp) {
        return tx.rawTimestamp >= cutoff;
      }
      return true;
    });
  }, [ledgerTransactions, filterRange]);

  const totalPages = Math.ceil(filteredTransactions.length / pageSize) || 1;

  const paginatedTransactions = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredTransactions.slice(start, start + pageSize);
  }, [filteredTransactions, page, pageSize]);

  return (
    <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Sổ cái Credit</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Lịch sử giao dịch, biến động số dư và các hoạt động học tập được ghi nhận thời gian thực.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filterRange}
            onChange={(e) => {
              setFilterRange(e.target.value as 'ALL' | '30D' | '7D');
              setPage(1);
            }}
            className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 cursor-pointer"
          >
            <option value="ALL">Tất cả thời gian</option>
            <option value="30D">30 ngày qua</option>
            <option value="7D">7 ngày qua</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider">
              <th className="pb-3 pl-2">Chi tiết giao dịch</th>
              <th className="pb-3">Loại</th>
              <th className="pb-3">Trạng thái</th>
              <th className="pb-3">Thời gian ghi nhận</th>
              <th className="pb-3 pr-2 text-right">Số lượng</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {paginatedTransactions.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400 text-xs font-medium">
                  Chưa có giao dịch nào được ghi nhận
                </td>
              </tr>
            ) : (
              paginatedTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3.5 pl-2">
                    <div className="font-bold text-gray-900">{tx.title}</div>
                    <div className="text-[11px] text-gray-400 font-mono">{tx.subtitle}</div>
                  </td>
                  <td className="py-3.5">
                    <span className={`px-2.5 py-1 rounded-md font-semibold text-[10px] ${tx.typeBg}`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="py-3.5">
                    <span className="inline-flex items-center gap-1.5 text-gray-700 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                      {tx.status}
                    </span>
                  </td>
                  <td className="py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{tx.time || tx.date}</span>
                    </div>
                    {tx.time && (
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5 font-medium pl-5">
                        <span>{tx.date}</span>
                      </div>
                    )}
                  </td>
                  <td className={`py-3.5 pr-2 text-right text-xs font-bold ${tx.amountColor}`}>
                    {tx.amount}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredTransactions.length > 0 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={filteredTransactions.length}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          showPageSizeSelector={true}
          pageSizeOptions={[8, 16, 32]}
          itemLabel="giao dịch"
          className="mt-4"
        />
      )}

      <div className="mt-6 text-center border-t border-gray-50 pt-4">
        <button className="text-xs font-bold text-primary-500 hover:text-primary-600 flex items-center justify-center gap-1.5 mx-auto cursor-pointer">
          <Download className="w-4 h-4" />
          <span>Tải sao kê (PDF)</span>
        </button>
      </div>
    </section>
  );
};
