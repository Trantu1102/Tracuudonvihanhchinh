
export interface UnitInfo {
  loai: string;
  donViCu: string;
  bT?: string; // Bí thư
  cT?: string; // Chủ tịch
  dienTich?: string;
  danSo?: string;
  matDo?: string;
  tS?: string; // Trụ sở
}

export interface ProvinceInfo {
  loai: string;
  ten: string;
  donViCu: string;
  dienTich: string;
  danSo: string;
  matDo: string;
  grdp: string;
  soPhuongXa: string;
  bienSo: string;
}

export interface ProvinceData {
  _info: ProvinceInfo;
  [key: string]: UnitInfo | ProvinceInfo;
}

export interface AdministrativeData {
  [provinceName: string]: ProvinceData;
}

export interface SearchResult extends UnitInfo {
  provinceName: string;
  newUnitName: string;
  matchedOldUnit?: string; // The specific old unit string found in the user's input
}
