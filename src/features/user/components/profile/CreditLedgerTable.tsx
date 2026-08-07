import React from 'react';
import { Download } from 'lucide-react';

interface LedgerTransaction {
  id: string;
  title: string;
  subtitle: string;
  type: string;
  typeBg: string;
  status: string;
  date: string;
  amount: string;
  amountColor: string;
}

interface CreditLedgerTableProps {
  ledgerTransactions: LedgerTransaction[];
}

export const CreditLedgerTable: React.FC<CreditLedgerTableProps> = ({
  ledgerTransactions,
}) => {
  return (
    <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-900">Sổ cái Credit</h2>
        <div className="flex items-center gap-2">
          <select className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 font-medium text-gray-700">
            <option>30 ngày qua</option>
            <option>7 ngày qua</option>
            <option>Tất cả thời gian</option>
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
              <th className="pb-3">Ngày</th>
              <th className="pb-3 pr-2 text-right">Số lượng</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {ledgerTransactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="py-3.5 pl-2">
                  <div className="font-bold text-gray-900">{tx.title}</div>
                  <div className="text-[11px] text-gray-400">{tx.subtitle}</div>
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
                <td className="py-3.5 text-gray-500 font-medium">{tx.date}</td>
                <td className={`py-3.5 pr-2 text-right text-xs ${tx.amountColor}`}>
                  {tx.amount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 text-center border-t border-gray-50 pt-4">
        <button className="text-xs font-bold text-primary-500 hover:text-primary-600 flex items-center justify-center gap-1.5 mx-auto cursor-pointer">
          <Download className="w-4 h-4" />
          <span>Tải sao kê (PDF)</span>
        </button>
      </div>
    </section>
  );
};
