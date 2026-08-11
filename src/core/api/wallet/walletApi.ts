import { baseApi } from '../baseApi';

export interface Wallet {
  id: string;
  userId: string;
  availableBalance: number;
  escrowedBalance: number;
  lowBalanceThreshold: number;
  totalEarned: number;
  totalSpent: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreditLedgerEntry {
  id: string;
  direction: 'CREDIT' | 'DEBIT';
  entryType:
    | 'ESCROW_HOLD'
    | 'ESCROW_RELEASE'
    | 'HEARTBEAT_DEDUCT'
    | 'TRIAL_REFUND'
    | 'CANCELLATION_REFUND'
    | 'AFK_REFUND'
    | 'ONBOARDING_REWARD'
    | 'MODERATION_REFUND';
  amount: number;
  balanceAfter: number;
  referenceId?: string;
  referenceKind?: string;
  createdAt: string;
}

export interface WalletHistoryParams {
  from?: string;
  to?: string;
  type?: 'CREDIT' | 'DEBIT';
  entryType?: string;
  page?: number;
  limit?: number;
}

export interface WalletHistoryResponse {
  entries: CreditLedgerEntry[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CheckBalanceResponse {
  availableBalance: number;
  canJoinRoom: boolean;
  minRequired: number;
  estimatedMinutes: number;
}

export const walletApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 1. Lấy thông tin ví của user đang đăng nhập
    getMyWallet: builder.query<Wallet, void>({
      query: () => '/wallets/me',
      providesTags: ['Wallet', 'User'],
    }),

    // 2. Lấy lịch sử giao dịch sổ cái
    getWalletHistory: builder.query<WalletHistoryResponse, WalletHistoryParams | void>({
      query: (params) => ({
        url: '/wallets/history',
        params: params || {},
      }),
      providesTags: ['User'],
    }),

    // 3. Kiểm tra số dư vào phòng học
    checkBalance: builder.query<CheckBalanceResponse, void>({
      query: () => '/wallets/balance/check',
      providesTags: ['User'],
    }),

    // 4. Lấy thông tin ví theo userId
    getWalletByUserId: builder.query<Wallet, string>({
      query: (userId) => `/wallets/${userId}`,
      providesTags: ['User'],
    }),
  }),
});

export const {
  useGetMyWalletQuery,
  useGetWalletHistoryQuery,
  useCheckBalanceQuery,
  useGetWalletByUserIdQuery,
} = walletApi;
