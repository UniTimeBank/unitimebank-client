import React, { useState } from 'react';
import { Users, Trophy, Calendar, Sparkles, MessageSquare, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { COMMUNITY_TABS, STUDY_GROUPS, TOP_CONTRIBUTORS } from '../constants';
import type { CommunityTabType } from '../types';

export const CommunityPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CommunityTabType>('Nhóm học tập');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredGroups = STUDY_GROUPS.filter(
    (g) =>
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        {/* 1. Hero Header Banner (Dark Navy) */}
        <div className="bg-[#1b2a3a] text-white rounded-3xl p-8 md:p-12 shadow-lg relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-3xs font-extrabold uppercase bg-teal-500/20 text-teal-300 border border-teal-500/30 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              KHÔNG GIAN HỌC TẬP CHUNG
            </span>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-3">
              Cộng Đồng Sinh Viên UniTime Bank
            </h1>
            <p className="text-sm md:text-base text-gray-300 leading-relaxed">
              Gia nhập các nhóm học tập chuyên sâu, giao lưu cùng các bạn học xuất sắc và tham gia các buổi Workshop học thuật phi lợi nhuận.
            </p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row gap-3">
            <Link
              to="/requests"
              className="px-6 py-3 rounded-2xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
            >
              <span>Xem Yêu Cầu Học</span>
            </Link>
          </div>

          <Users className="absolute -right-6 -bottom-6 w-48 h-48 text-white/5 pointer-events-none" />
        </div>

        {/* 2. Navigation Tabs & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-3">
          <div className="flex items-center gap-6">
            {COMMUNITY_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-sm font-black transition-all relative pb-3 -mb-3 cursor-pointer whitespace-nowrap ${
                  activeTab === tab
                    ? 'text-gray-900 border-b-2 border-gray-900'
                    : 'text-gray-400 hover:text-gray-700 font-bold'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm nhóm, sự kiện..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* 3. Main Content based on Tabs */}
        {activeTab === 'Nhóm học tập' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredGroups.map((group) => (
              <div
                key={group.id}
                className="bg-white rounded-2xl p-6 border border-gray-100/90 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={group.image}
                      alt={group.name}
                      className="w-14 h-14 rounded-2xl object-cover ring-2 ring-gray-100 group-hover:scale-105 transition-transform"
                    />
                    <div>
                      <span className="px-2.5 py-0.5 rounded-md text-3xs font-extrabold uppercase bg-teal-50 text-teal-700 border border-teal-100">
                        {group.category}
                      </span>
                      <h3 className="text-base font-bold text-gray-900 group-hover:text-primary-600 transition-colors mt-1">
                        {group.name}
                      </h3>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed mb-6">
                    {group.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-3xs font-bold text-gray-500">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-gray-400" />
                      {group.membersCount.toLocaleString()} Thành viên
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
                      {group.activeDiscussions} Thảo luận
                    </span>
                  </div>

                  <button
                    onClick={() => alert(`Đã tham gia nhóm: ${group.name}`)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-primary-50 text-primary-700 hover:bg-primary-600 hover:text-white transition-all cursor-pointer"
                  >
                    Tham gia nhóm
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'Bảng xếp hạng' && (
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-2xs">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Bảng Vinh Danh Mentor Tuần Này</h3>
                <p className="text-xs text-gray-500">Những sinh viên có số giờ cống hiến và điểm uy tín cao nhất</p>
              </div>
            </div>

            <div className="flex flex-col divide-y divide-gray-100">
              {TOP_CONTRIBUTORS.map((c) => (
                <div key={c.id} className="py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                        c.rank === 1
                          ? 'bg-amber-400 text-amber-950 shadow-xs'
                          : c.rank === 2
                          ? 'bg-slate-300 text-slate-800'
                          : 'bg-amber-700/20 text-amber-900'
                      }`}
                    >
                      #{c.rank}
                    </div>

                    <img src={c.avatar} alt={c.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100" />

                    <div>
                      <div className="text-sm font-bold text-gray-900">{c.name}</div>
                      <div className="text-3xs text-gray-400 font-semibold">{c.major}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-sm font-black text-primary-600">+{c.hoursShared}h</div>
                      <div className="text-3xs text-gray-400">Đã chia sẻ</div>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                      {c.trustScore} Điểm uy tín
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'Sự kiện & Workshop' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-2xs group">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800"
                alt="Workshop"
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="p-6">
                <span className="px-2.5 py-0.5 rounded-md text-3xs font-extrabold uppercase bg-teal-50 text-teal-700 border border-teal-100 mb-2 inline-block">
                  WORKSHOP MIỄN PHÍ
                </span>
                <h3 className="text-base font-bold text-gray-900 mb-2">
                  Tư Duy Thiết Kế Sản Phẩm & Xây Dựng Portfolio 2024
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed mb-4">
                  Buổi chia sẻ trực tiếp về quy trình nghiên cứu người dùng, thiết kế wireframe và hoàn thiện hồ sơ xin việc ngành UX.
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-50 text-xs font-bold text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-primary-500" />
                    <span>Thứ 4, 18:00 (11 Thg 9)</span>
                  </div>
                  <button
                    onClick={() => alert('Đã đăng ký tham gia Workshop thành công!')}
                    className="px-4 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white transition-colors cursor-pointer"
                  >
                    Đăng ký tham gia
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
