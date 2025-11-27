import React from 'react';
import { MapPin } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-2 rounded-lg">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 leading-tight">Tra Cứu Đơn Vị Hành Chính</h1>
            <p className="text-xs text-slate-500 font-medium">Cập nhật thông tin sáp nhập mới nhất</p>
          </div>
        </div>
      </div>
    </header>
  );
};