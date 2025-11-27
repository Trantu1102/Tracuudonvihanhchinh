import React, { useState } from 'react';
import { SearchResult } from '../types';
import { MapPin, User, Users, Building2, Expand, Layout, ArrowRight, Copy, Check, Sparkles } from 'lucide-react';

interface ResultCardProps {
  data: SearchResult;
  keyword: string;
}

export const ResultCard: React.FC<ResultCardProps> = ({ data, keyword }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  // Highlight keyword in text
  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    try {
      const safeHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const parts = text.split(new RegExp(`(${safeHighlight})`, 'gi'));
      return (
        <span>
          {parts.map((part, i) => 
            part.toLowerCase() === highlight.toLowerCase() ? (
              <span key={i} className="bg-yellow-200 font-semibold text-yellow-900 px-0.5 rounded">{part}</span>
            ) : (
              part
            )
          )}
        </span>
      );
    } catch (e) {
      return text;
    }
  };

  // Strip prefix for matching
  const stripPrefix = (name: string) => {
    return name.replace(/^(Phường|Xã|Thị trấn)\s+/i, '');
  };

  // Address Generation Logic
  const generateNewAddress = () => {
    if (!data.matchedOldUnit || !keyword) return null;

    const input = keyword;
    const oldUnitFull = data.matchedOldUnit; 
    const oldUnitCore = stripPrefix(oldUnitFull);
    
    // 1. Standardize New Unit Name (Ensure it has Phường/Xã/Thị trấn)
    const newUnitCore = data.newUnitName; 
    let finalNewUnit = newUnitCore;
    const lowerNew = newUnitCore.toLowerCase();
    
    if (!lowerNew.startsWith('phường') && !lowerNew.startsWith('xã') && !lowerNew.startsWith('thị trấn')) {
       if (data.loai) {
           finalNewUnit = `${data.loai} ${newUnitCore}`;
       } else {
           // Fallback based on old unit type
           if (oldUnitFull.toLowerCase().startsWith('phường')) finalNewUnit = `Phường ${newUnitCore}`;
           else if (oldUnitFull.toLowerCase().startsWith('xã')) finalNewUnit = `Xã ${newUnitCore}`;
           else if (oldUnitFull.toLowerCase().startsWith('thị trấn')) finalNewUnit = `Thị trấn ${newUnitCore}`;
       }
    }

    // 2. Find split point based on the Old Unit found in the search
    const lowerInput = input.toLowerCase();
    
    // Priority 1: Find full match "Phường Hàng Bột"
    let matchIndex = lowerInput.lastIndexOf(oldUnitFull.toLowerCase());
    
    // Priority 2: Find core match "Hàng Bột"
    if (matchIndex === -1) {
        matchIndex = lowerInput.lastIndexOf(oldUnitCore.toLowerCase());
    }

    if (matchIndex === -1) return null;

    // 3. Extract Prefix (e.g., "P232, nhà E, ")
    let prefixPart = input.substring(0, matchIndex).trim();
    
    // Clean trailing punctuation (comma, space, dash, dot)
    prefixPart = prefixPart.replace(/[,\s\-\.]+$/, '');

    // 4. Standardize Province
    let finalProvince = data.provinceName;
    const lowerProv = finalProvince.toLowerCase();
    const isCity = ['hà nội', 'hồ chí minh', 'đà nẵng', 'hải phòng', 'cần thơ'].includes(lowerProv);
    
    if (isCity) {
        if (!lowerProv.startsWith('tp') && !lowerProv.startsWith('thành phố')) {
            finalProvince = `TP ${data.provinceName}`;
        }
    } else {
         if (!lowerProv.startsWith('tỉnh')) {
            finalProvince = `Tỉnh ${data.provinceName}`;
        }
    }

    // 5. Combine
    if (prefixPart.length > 0) {
        return `${prefixPart}, ${finalNewUnit}, ${finalProvince}`;
    } else {
        // User only typed the old unit name without address details
        return `${finalNewUnit}, ${finalProvince}`;
    }
  };

  const newAddress = generateNewAddress();

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (newAddress) {
      navigator.clipboard.writeText(newAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-200 hover:shadow-md ${isExpanded || newAddress ? 'ring-1 ring-primary/30' : ''}`}>
      <div 
        className="p-5 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex flex-col gap-4">
          
          {/* Header Section */}
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">
              <span className="bg-slate-100 px-2 py-1 rounded">{data.provinceName}</span>
              <span>•</span>
              <span>{data.loai}</span>
            </div>
            
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h3 className="text-xl font-bold text-slate-900">{data.newUnitName}</h3>
                {data.matchedOldUnit && (
                  <span className="text-sm font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 flex items-center gap-1">
                    <ArrowRight className="w-3 h-3" />
                    Từ: {data.matchedOldUnit}
                  </span>
                )}
            </div>
          </div>

          {/* NEW ADDRESS SECTION - Prominent Display */}
          {newAddress && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 relative flex flex-col sm:flex-row sm:items-center gap-4 group" onClick={(e) => e.stopPropagation()}>
               <div className="flex-1">
                 <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Địa chỉ mới đề xuất</p>
                 </div>
                 <p className="text-lg font-semibold text-slate-800 font-mono leading-snug">{newAddress}</p>
               </div>

               <button 
                  onClick={handleCopy}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all shadow-sm border ${
                    copied 
                      ? 'bg-emerald-600 text-white border-emerald-600' 
                      : 'bg-white text-slate-700 border-slate-300 hover:border-emerald-400 hover:text-emerald-700'
                  }`}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Đã chép' : 'Sao chép'}
                </button>
            </div>
          )}

          {/* Old Unit List */}
          <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
            <p className="font-semibold text-slate-700 mb-1 text-xs uppercase">Sáp nhập từ các đơn vị cũ:</p>
            <p className="leading-relaxed text-slate-600">
                {highlightText(data.donViCu, keyword)}
            </p>
          </div>

          {/* Expand Button (Visual cue) */}
          <div className="flex justify-center">
             <button className={`p-1 rounded-full transition-colors text-slate-300 hover:text-slate-500 ${isExpanded ? 'rotate-180' : ''}`}>
                <Expand className="w-5 h-5" />
             </button>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-5 pb-5 pt-0 bg-slate-50/30 border-t border-slate-100 animate-in slide-in-from-top-2 duration-200">
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {(data.bT || data.cT) && (
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-1.5">
                  <User className="w-4 h-4" /> Lãnh đạo đơn vị mới
                </h4>
                <div className="space-y-3">
                  {data.bT && (
                    <div className="flex flex-col">
                      <span className="text-slate-500 text-[10px] uppercase tracking-wider font-semibold">Bí thư</span>
                      <span className="font-medium text-slate-900">{data.bT}</span>
                    </div>
                  )}
                  {data.cT && (
                    <div className="flex flex-col pt-2 border-t border-slate-50">
                      <span className="text-slate-500 text-[10px] uppercase tracking-wider font-semibold">Chủ tịch</span>
                      <span className="font-medium text-slate-900">{data.cT}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-3">
                {data.tS && (
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4" /> Trụ sở làm việc
                    </h4>
                    <p className="text-sm text-slate-800 font-medium leading-relaxed">{data.tS}</p>
                </div>
                )}
                
                <div className="grid grid-cols-2 gap-3">
                    {data.danSo && (
                        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-1">Dân số</h4>
                            <p className="text-sm text-slate-900 font-semibold">{data.danSo}</p>
                        </div>
                    )}
                    {data.dienTich && (
                        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-1">Diện tích</h4>
                            <p className="text-sm text-slate-900 font-semibold">{data.dienTich}</p>
                        </div>
                    )}
                </div>
            </div>
          </div>
          
          <div className="mt-4 text-right">
             <span className="text-[10px] text-slate-400 italic bg-white px-2 py-1 rounded border border-slate-200 inline-block">
                * Dữ liệu cập nhật theo Nghị quyết của UBTVQH
             </span>
          </div>
        </div>
      )}
    </div>
  );
};