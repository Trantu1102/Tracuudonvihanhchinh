import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { ProvinceFilter } from './components/ProvinceFilter';
import { ResultCard } from './components/ResultCard';
import { ADMINISTRATIVE_DATA } from './constants';
import { SearchResult, UnitInfo, ProvinceInfo } from './types';
import { SearchX, Info, Map, Sparkles } from 'lucide-react';

// Helper to parse old units from the descriptive string
// Example: "Phường A (phần còn lại...), Xã B" -> ["Phường A", "Xã B"]
const parseOldUnits = (donViCu: string): string[] => {
  if (!donViCu) return [];
  // Remove content inside parentheses (e.g. "(phần còn lại...)")
  const cleanStr = donViCu.replace(/\([^)]*\)/g, '');
  // Split by comma and trim
  return cleanStr.split(',').map(s => s.trim()).filter(s => s.length > 0);
};

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');

  const provinces = useMemo(() => Object.keys(ADMINISTRATIVE_DATA).sort(), []);

  const results = useMemo<SearchResult[]>(() => {
    if (!searchTerm.trim() && !selectedProvince) return [];

    const hits: SearchResult[] = [];
    const term = searchTerm.toLowerCase().trim();
    const provinceKeys = selectedProvince ? [selectedProvince] : provinces;

    provinceKeys.forEach((province) => {
      const provinceData = ADMINISTRATIVE_DATA[province];
      
      Object.keys(provinceData).forEach((key) => {
        if (key === '_info') return;
        
        const unitData = provinceData[key] as UnitInfo;
        const newUnitName = key;
        
        // 1. Direct match on New Unit Name
        const isNewUnitMatch = newUnitName.toLowerCase().includes(term);
        
        // 2. Match against Old Units list
        const oldUnitsList = parseOldUnits(unitData.donViCu);
        
        // Find if any old unit matches the search term 
        const matchedOldUnit = oldUnitsList.find(old => {
            const oldLower = old.toLowerCase();
            
            // Check if user typed the old unit name directly
            const exactMatch = oldLower.includes(term);
            
            // Check if user input contains the old unit name (for full address search)
            // e.g. Input: "P232 Hàng Bột..." -> contains "Hàng Bột"
            // We strip common prefixes to catch "Hàng Bột" inside "Phường Hàng Bột" if user didn't type "Phường"
            const oldCore = oldLower.replace(/^(phường|xã|thị trấn)\s+/i, '').trim();
            
            // Only match if the core name is long enough (to avoid matching "Hà" in "Hà Nội")
            // and if the term actually contains this core name.
            const reverseMatch = oldCore.length > 1 && term.includes(oldCore);

            return exactMatch || reverseMatch;
        });

        if (isNewUnitMatch || matchedOldUnit) {
          hits.push({
            provinceName: province,
            newUnitName: key,
            ...unitData,
            matchedOldUnit: matchedOldUnit // Pass the specific old unit found for replacement logic
          });
        }
      });
    });

    return hits;
  }, [searchTerm, selectedProvince, provinces]);

  const provinceInfo = useMemo<ProvinceInfo | null>(() => {
    if (selectedProvince && ADMINISTRATIVE_DATA[selectedProvince]) {
        return ADMINISTRATIVE_DATA[selectedProvince]._info as ProvinceInfo;
    }
    return null;
  }, [selectedProvince]);

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      <Header />

      <main className="max-w-5xl mx-auto px-4 mt-8">
        
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center p-2 bg-blue-50 rounded-full mb-4">
                    <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-3 tracking-tight">Tra cứu & Chuyển đổi địa chỉ</h2>
                <p className="text-slate-500 max-w-2xl mx-auto">
                  Nhập địa chỉ cũ (ví dụ: <span className="font-medium text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">P232 Hàng Bột, Đống Đa, Hà Nội</span>) để tìm đơn vị hành chính mới và tự động tạo địa chỉ chuẩn.
                </p>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <SearchBar 
                        value={searchTerm} 
                        onChange={setSearchTerm} 
                        onClear={() => setSearchTerm('')} 
                    />
                </div>
                <div className="md:w-72">
                    <ProvinceFilter 
                        provinces={provinces} 
                        selectedProvince={selectedProvince} 
                        onSelect={setSelectedProvince} 
                    />
                </div>
            </div>
        </div>

        {/* Province Info Card */}
        {provinceInfo && !searchTerm && (
            <div className="mb-8 bg-white border border-blue-100 rounded-2xl p-6 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-10 -mt-10 z-0 opacity-50"></div>
                <div className="relative z-10">
                  <h3 className="font-bold text-xl text-slate-800 mb-4 flex items-center gap-2">
                      <span className="bg-blue-100 p-2 rounded-lg text-blue-600"><Info className="w-5 h-5" /></span>
                      Thông tin tỉnh {provinceInfo.ten}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4">
                      <div>
                          <span className="block text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Diện tích</span>
                          <span className="font-semibold text-slate-800 text-lg">{provinceInfo.dienTich}</span>
                      </div>
                      <div>
                          <span className="block text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Dân số</span>
                          <span className="font-semibold text-slate-800 text-lg">{provinceInfo.danSo}</span>
                      </div>
                      <div>
                          <span className="block text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Số Đơn vị HC</span>
                          <span className="font-semibold text-slate-800 text-lg">{provinceInfo.soPhuongXa}</span>
                      </div>
                      <div>
                          <span className="block text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Biển số xe</span>
                          <span className="font-semibold text-slate-800 text-lg">{provinceInfo.bienSo}</span>
                      </div>
                  </div>
                </div>
            </div>
        )}

        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Map className="w-5 h-5 text-slate-400" />
                    Kết quả tra cứu
                    {results.length > 0 && (
                      <span className="ml-2 text-xs font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                        {results.length} kết quả
                      </span>
                    )}
                </h3>
            </div>

            {results.length > 0 ? (
                <div className="grid gap-5 md:grid-cols-1">
                    {results.map((item, index) => (
                        <ResultCard 
                            key={`${item.provinceName}-${item.newUnitName}-${index}`} 
                            data={item} 
                            keyword={searchTerm} 
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-50 mb-4">
                        <SearchX className="w-10 h-10 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">Không tìm thấy kết quả</h3>
                    <p className="text-slate-500 max-w-md mx-auto">
                        {searchTerm 
                          ? `Không tìm thấy đơn vị hành chính nào khớp với "${searchTerm}". Hãy thử nhập tên xã/phường cũ hoặc mới.` 
                          : "Vui lòng nhập từ khóa hoặc chọn tỉnh để bắt đầu tra cứu."}
                    </p>
                </div>
            )}
        </div>
      </main>
    </div>
  );
}

export default App;