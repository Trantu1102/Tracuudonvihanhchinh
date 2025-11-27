import React from 'react';
import { ChevronDown } from 'lucide-react';

interface ProvinceFilterProps {
  provinces: string[];
  selectedProvince: string;
  onSelect: (province: string) => void;
}

export const ProvinceFilter: React.FC<ProvinceFilterProps> = ({ provinces, selectedProvince, onSelect }) => {
  return (
    <div className="relative min-w-[200px]">
      <select
        value={selectedProvince}
        onChange={(e) => onSelect(e.target.value)}
        className="block w-full pl-3 pr-10 py-3 text-base border-slate-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-xl shadow-sm appearance-none bg-white border cursor-pointer"
      >
        <option value="">Tất cả tỉnh thành</option>
        {provinces.map((prov) => (
          <option key={prov} value={prov}>{prov}</option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
        <ChevronDown className="h-4 w-4" />
      </div>
    </div>
  );
};