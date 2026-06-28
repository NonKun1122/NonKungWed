export interface Tag {
  id: string;
  label: string;
  color: string;
}

export interface Plugin {
  id: number;
  name: string;
  ver: string;
  desc: string;
  tags: string[];
  icon: string;
  dl: number;
  link: string;
  fileId?: string;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  base64?: string;
  url?: string;
  createdAt: string;
}

export interface AppState {
  plugins: Plugin[];
  tags: Tag[];
  files: UploadedFile[];
  nextId: number;
}

export const STORE_KEY = 'mf_data';

export const DEMO_USER = 'AdminDemo';
export const DEMO_PASS = 'mapforge2024';

export const DEF_TAGS: Tag[] = [
  { id: 'leaflet', label: 'Leaflet', color: '#3BB273' },
  { id: 'mapbox', label: 'Mapbox', color: '#0A85D1' },
  { id: 'openlayers', label: 'OpenLayers', color: '#E85D4A' },
  { id: 'routing', label: 'Routing', color: '#00D4AA' },
  { id: 'heatmap', label: 'Heatmap', color: '#FF6B35' },
  { id: 'marker', label: 'Marker', color: '#7C3AED' },
  { id: 'layer', label: 'Layer', color: '#F59E0B' },
];

export const DEF_PLUGINS: Plugin[] = [
  { id: 1, name: 'LeafRoute Pro', ver: 'v2.4.1', desc: 'ระบบ routing สำหรับ Leaflet รองรับ turn-by-turn และ waypoints ไม่จำกัด', tags: ['leaflet', 'routing'], icon: '🗺️', dl: 12400, link: '' },
  { id: 2, name: 'HeatGL', ver: 'v1.2.0', desc: 'สร้าง heatmap บน WebGL ประสิทธิภาพสูง รองรับ real-time data streaming', tags: ['mapbox', 'heatmap'], icon: '🔥', dl: 8700, link: '' },
  { id: 3, name: 'CustomMarker Kit', ver: 'v3.0.2', desc: 'ชุด marker 200+ แบบ พร้อม animation และ custom popup สวยงาม', tags: ['leaflet', 'marker'], icon: '📍', dl: 21100, link: '' },
  { id: 4, name: 'LayerStack', ver: 'v1.8.3', desc: 'จัดการ layer ซ้อนกันได้หลายชั้น พร้อม toggle, opacity และ z-index drag', tags: ['mapbox', 'layer'], icon: '🧱', dl: 6300, link: '' },
  { id: 5, name: 'OL Navigator', ver: 'v2.1.0', desc: 'Navigation สำหรับ OpenLayers รองรับ GPS tracking และ offline routing', tags: ['openlayers', 'routing'], icon: '🧭', dl: 4200, link: '' },
  { id: 6, name: 'ClusterMagic', ver: 'v2.6.0', desc: 'Cluster marker อัตโนมัติ พร้อม animation ระดับ professional', tags: ['mapbox', 'marker'], icon: '🔮', dl: 9500, link: '' },
  { id: 7, name: 'TileBlend', ver: 'v1.3.7', desc: 'ผสม tile layer หลายแหล่งข้อมูล พร้อม blend mode และ opacity real-time', tags: ['leaflet', 'layer'], icon: '🗃️', dl: 5100, link: '' },
  { id: 8, name: 'HeatLeaf', ver: 'v2.0.0', desc: 'Heatmap เบาและเร็วสำหรับ Leaflet รองรับ large dataset ถึง 1M จุด', tags: ['leaflet', 'heatmap'], icon: '📊', dl: 7200, link: '' },
  { id: 9, name: 'OL Label', ver: 'v1.5.2', desc: 'ระบบ label และ tooltip สำหรับ OpenLayers รองรับ collision detection', tags: ['openlayers', 'marker'], icon: '🏷️', dl: 2900, link: '' },
  { id: 10, name: 'FastRoute MB', ver: 'v3.2.1', desc: 'Routing เร็วสุดขีดบน Mapbox GL JS รองรับ multi-modal transport', tags: ['mapbox', 'routing'], icon: '⚡', dl: 15000, link: '' },
  { id: 11, name: 'ThermalView', ver: 'v1.0.5', desc: 'แสดงข้อมูล density และ temperature รองรับ color palette กำหนดเอง', tags: ['openlayers', 'heatmap'], icon: '🌡️', dl: 3800, link: '' },
  { id: 12, name: 'WalkPath', ver: 'v1.1.4', desc: 'เส้นทางเดินเท้า pedestrian-optimized พร้อม accessibility routing', tags: ['leaflet', 'routing'], icon: '🚶', dl: 3400, link: '' },
];

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const d = JSON.parse(raw) as AppState;
      if (d && Array.isArray(d.plugins) && Array.isArray(d.tags)) {
        return d;
      }
    }
  } catch {
    // ignore
  }
  return {
    plugins: [...DEF_PLUGINS],
    tags: [...DEF_TAGS],
    files: [],
    nextId: 13,
  };
}

export function saveState(state: AppState) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function hexToRgba(hex: string, alpha: number): string {
  const r = Number.parseInt(hex.slice(1, 3), 16);
  const g = Number.parseInt(hex.slice(3, 5), 16);
  const b = Number.parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function fmtDownload(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1).replace('.0', '')}k` : `${n}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
