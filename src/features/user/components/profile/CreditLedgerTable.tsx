import React, { useState, useMemo } from 'react';
import { Download, Clock, BookOpen, GraduationCap, Layers, ChevronDown, ChevronUp, RotateCw } from 'lucide-react';
import { Pagination, Tabs } from '@/shared/components/ui';

export interface SubLedgerItem {
  id: string;
  title: string;
  time: string;
  amount: string;
}

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
  role?: 'LEARNING' | 'TEACHING' | 'SYSTEM';
  isGrouped?: boolean;
  totalMinutes?: number;
  subItems?: SubLedgerItem[];
}

interface CreditLedgerTableProps {
  ledgerTransactions: LedgerTransaction[];
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const CreditLedgerTable: React.FC<CreditLedgerTableProps> = ({
  ledgerTransactions,
  onRefresh,
  isRefreshing,
}) => {
  const [roleTab, setRoleTab] = useState<'ALL' | 'LEARNING' | 'TEACHING'>('ALL');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [filterRange, setFilterRange] = useState<'ALL' | '30D' | '7D'>('ALL');
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Đếm số lượng giao dịch theo từng vai trò
  const counts = useMemo(() => {
    let learning = 0;
    let teaching = 0;
    ledgerTransactions.forEach((tx) => {
      const r = tx.role || (tx.amount.startsWith('+') ? 'TEACHING' : 'LEARNING');
      if (r === 'TEACHING') teaching += 1;
      if (r === 'LEARNING') learning += 1;
    });
    return {
      all: ledgerTransactions.length,
      learning,
      teaching,
    };
  }, [ledgerTransactions]);

  // Lọc giao dịch theo vai trò & khoảng thời gian
  const filteredTransactions = useMemo(() => {
    let list = ledgerTransactions;

    // 1. Lọc theo Tab vai trò (Người học vs Người dạy)
    if (roleTab === 'LEARNING') {
      list = list.filter((tx) => {
        const r = tx.role || (tx.amount.startsWith('-') ? 'LEARNING' : 'TEACHING');
        return r === 'LEARNING' || r === 'SYSTEM';
      });
    } else if (roleTab === 'TEACHING') {
      list = list.filter((tx) => {
        const r = tx.role || (tx.amount.startsWith('+') ? 'TEACHING' : 'LEARNING');
        return r === 'TEACHING';
      });
    }

    // 2. Lọc theo khoảng thời gian
    if (filterRange !== 'ALL') {
      const now = Date.now();
      const days = filterRange === '7D' ? 7 : 30;
      const cutoff = now - days * 24 * 60 * 60 * 1000;
      list = list.filter((tx) => {
        if (tx.rawTimestamp) {
          return tx.rawTimestamp >= cutoff;
        }
        return true;
      });
    }

    return list;
  }, [ledgerTransactions, roleTab, filterRange]);

  const totalPages = Math.ceil(filteredTransactions.length / pageSize) || 1;

  const paginatedTransactions = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredTransactions.slice(start, start + pageSize);
  }, [filteredTransactions, page, pageSize]);

  return (
    <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs space-y-5">
      {/* 1. Header: Tiêu đề + Bộ lọc thời gian */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Sổ cái Credit</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Lịch sử giao dịch, biến động số dư và các hoạt động học tập được ghi nhận thời gian thực.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-60 cursor-pointer shadow-xs"
              title="Làm mới sổ cái"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-primary-600' : 'text-slate-500'}`} />
              <span className="hidden sm:inline">Làm mới</span>
            </button>
          )}

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

      {/* 2. ROLE TABS: Tab 2 người (Người học vs Người dạy vs Tất cả) */}
      <div className="border-b border-gray-100">
        <Tabs<'ALL' | 'LEARNING' | 'TEACHING'>
          value={roleTab}
          onChange={(newTab) => {
            setRoleTab(newTab);
            setPage(1);
          }}
          variant="underline"
          options={[
            {
              value: 'ALL',
              label: 'Tất cả',
              count: counts.all,
              icon: <Layers className="w-4 h-4" />,
            },
            {
              value: 'LEARNING',
              label: 'Lớp tôi học (Người học)',
              count: counts.learning,
              icon: <BookOpen className="w-4 h-4" />,
            },
            {
              value: 'TEACHING',
              label: 'Lớp tôi dạy (Người dạy)',
              count: counts.teaching,
              icon: <GraduationCap className="w-4 h-4" />,
            },
          ]}
        />
      </div>

      {/* 3. Bảng dữ liệu giao dịch */}
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
                <td colSpan={5} className="py-10 text-center text-slate-400 text-xs font-medium">
                  {roleTab === 'LEARNING'
                    ? 'Chưa có giao dịch chi phí học tập nào'
                    : roleTab === 'TEACHING'
                    ? 'Chưa có giao dịch thù lao dạy học nào'
                    : 'Chưa có giao dịch nào được ghi nhận'}
                </td>
              </tr>
            ) : (
              paginatedTransactions.map((tx) => {
                const isExpanded = Boolean(expandedIds[tx.id]);
                return (
                  <React.Fragment key={tx.id}>
                    <tr className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 pl-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900">{tx.title}</span>
                          {tx.isGrouped && (
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold tracking-wide">
                              {tx.totalMinutes || tx.subItems?.length} phút
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          {tx.isGrouped && tx.subItems && tx.subItems.length > 1 ? (
                            <button
                              type="button"
                              onClick={() => toggleExpand(tx.id)}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary-700 hover:text-primary-800 transition-colors cursor-pointer"
                            >
                              <span>{isExpanded ? 'Thu gọn chi tiết' : `Xem chi tiết (${tx.subItems.length} giao dịch)`}</span>
                              {isExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5" />
                              )}
                            </button>
                          ) : (
                            <span className="text-[11px] text-gray-400 font-mono">{tx.subtitle}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4">
                        <span className={`px-2.5 py-1 rounded-md font-semibold text-[10px] ${tx.typeBg}`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className="inline-flex items-center gap-1.5 text-gray-700 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-4 whitespace-nowrap">
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
                      <td className={`py-4 pr-2 text-right text-xs font-bold ${tx.amountColor}`}>
                        {tx.amount}
                      </td>
                    </tr>

                    {/* Hàng mở rộng hiển thị chi tiết từng phút học khi được bấm */}
                    {isExpanded && tx.subItems && (
                      <tr className="bg-slate-50/70 border-b border-gray-100 animate-in fade-in duration-150">
                        <td colSpan={5} className="py-3 px-4 sm:px-6">
                          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <span>Chi tiết nhịp tim từng phút trong phiên:</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                            {tx.subItems.map((sub) => (
                              <div
                                key={sub.id}
                                className="flex items-center justify-between px-3 py-2 rounded-xl bg-white border border-slate-200/80 text-xs shadow-2xs"
                              >
                                <div className="min-w-0 pr-2">
                                  <div className="font-semibold text-slate-700 truncate text-[11px]">
                                    {sub.title}
                                  </div>
                                  <div className="text-[10px] text-slate-400">{sub.time}</div>
                                </div>
                                <span className={`font-bold shrink-0 text-xs ${tx.amountColor}`}>
                                  {sub.amount}
                                </span>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 4. Phân trang */}
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

      {/* 5. Nút tải sao kê */}
      <div className="mt-6 text-center border-t border-gray-50 pt-4">
        <button className="text-xs font-bold text-primary-500 hover:text-primary-600 flex items-center justify-center gap-1.5 mx-auto cursor-pointer">
          <Download className="w-4 h-4" />
          <span>Tải sao kê (PDF)</span>
        </button>
      </div>
    </section>
  );
};
