import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Search,
  Download,
  User,
  X,
  MapPin,
  Layers,
  Route,
  Flame,
  Tag as TagIcon,
  Box,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useMapForgeStore } from '@/hooks/useMapForgeStore';
import { type Plugin, fmtDownload, hexToRgba } from '@/types/mapforge';

const iconMap: Record<string, React.ReactNode> = {
  leaflet: <MapPin className="w-3.5 h-3.5" />,
  mapbox: <Layers className="w-3.5 h-3.5" />,
  openlayers: <Box className="w-3.5 h-3.5" />,
  routing: <Route className="w-3.5 h-3.5" />,
  heatmap: <Flame className="w-3.5 h-3.5" />,
  marker: <MapPin className="w-3.5 h-3.5" />,
  layer: <Layers className="w-3.5 h-3.5" />,
};

function TagPill({ tagId }: { tagId: string }) {
  const { tagById } = useMapForgeStore();
  const t = tagById(tagId);
  return (
    <span
      className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border"
      style={{
        color: t.color,
        borderColor: hexToRgba(t.color, 0.3),
        backgroundColor: hexToRgba(t.color, 0.08),
      }}
    >
      {iconMap[tagId] || <TagIcon className="w-3 h-3" />}
      {t.label}
    </span>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const { state, tagById, incrementDownload } = useMapForgeStore();
  const [searchQ, setSearchQ] = useState('');
  const [fwFilter, setFwFilter] = useState<string>('all');
  const [detailPlugin, setDetailPlugin] = useState<Plugin | null>(null);

  const filteredPlugins = useMemo(() => {
    return state.plugins.filter((p) => {
      const matchesFw = fwFilter === 'all' || p.tags.includes(fwFilter);
      const q = searchQ.toLowerCase().trim();
      const matchesSearch =
        !q || p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q);
      return matchesFw && matchesSearch;
    });
  }, [state.plugins, fwFilter, searchQ]);

  const handleDownload = (plugin: Plugin) => {
    incrementDownload(plugin.id);
    if (plugin.link) {
      window.open(plugin.link, '_blank');
      toast.success('กำลังดาวน์โหลด...');
      return;
    }
    if (plugin.fileId) {
      const file = state.files.find((f) => f.id === plugin.fileId);
      if (file?.base64) {
        const a = document.createElement('a');
        a.href = file.base64;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success('กำลังดาวน์โหลด...');
        return;
      }
      if (file?.url) {
        window.open(file.url, '_blank');
        toast.success('กำลังดาวน์โหลด...');
        return;
      }
    }
    toast.error('ไม่มีไฟล์หรือลิงก์ดาวน์โหลดสำหรับ plugin นี้');
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 flex items-center justify-between h-[52px] px-5 border-b border-border bg-background/96 backdrop-blur-md">
        <div className="flex items-center gap-2 font-montserrat font-bold text-base whitespace-nowrap">
          <div className="w-[7px] h-[7px] rounded-full bg-primary" />
          MapForge
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="border border-border text-muted-foreground hover:text-primary hover:border-primary/50 text-xs gap-1.5"
          onClick={() => navigate('/login')}
        >
          <User className="w-3.5 h-3.5" />
          Admin
        </Button>
      </nav>

      {/* Hero */}
      <section className="py-10 px-5 text-center">
        <div className="max-w-[560px] mx-auto">
          <h1 className="font-montserrat font-bold text-[clamp(26px,5vw,38px)] tracking-tight leading-[1.15] mb-2.5">
            Map Plugins
            <br />
            <span className="text-primary">พร้อมใช้ ฟรี</span>
          </h1>
          <p className="text-muted-foreground text-[15px] mb-5 leading-relaxed">
            รวม plugin แผนที่คุณภาพสูง สำหรับ Leaflet, Mapbox และ OpenLayers
          </p>
          <div className="relative max-w-[400px] mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="ค้นหา plugin..."
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              className="pl-10 bg-secondary border-border focus:border-primary"
            />
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="flex-1 w-full max-w-[1080px] mx-auto px-4 pb-28">
        <div className="flex items-center mb-4">
          <span className="text-[13px] text-muted-foreground">
            แสดง <strong className="text-foreground">{filteredPlugins.length}</strong> plugins
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredPlugins.length === 0 && (
            <div className="col-span-full text-center text-muted-foreground py-10">
              ไม่พบ plugin
            </div>
          )}
          {filteredPlugins.map((p) => (
            <div
              key={p.id}
              className="bg-card border border-border rounded-[10px] p-4 flex flex-col gap-2.5 cursor-pointer transition-all duration-200 hover:border-primary/35 hover:-translate-y-0.5 group"
              onClick={() => setDetailPlugin(p)}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-base shrink-0">
                  {p.icon}
                </div>
                <div className="min-w-0">
                  <h4 className="font-montserrat text-sm font-semibold truncate text-balance">
                    {p.name}
                  </h4>
                  <div className="text-[11px] text-muted-foreground">{p.ver}</div>
                </div>
              </div>
              <p className="text-[12.5px] text-muted-foreground leading-relaxed line-clamp-2 text-pretty">
                {p.desc}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {p.tags.slice(0, 3).map((t) => (
                  <TagPill key={t} tagId={t} />
                ))}
                {p.tags.length > 3 && (
                  <span className="text-[11px] text-muted-foreground">+{p.tags.length - 3}</span>
                )}
              </div>
              <div className="flex items-center justify-between pt-2.5 border-t border-border mt-auto">
                <span className="text-xs text-muted-foreground">⬇ {fmtDownload(p.dl)}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs border border-border hover:border-primary hover:text-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(p);
                  }}
                >
                  <Download className="w-3 h-3 mr-1" />
                  ดาวน์โหลด
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Tag Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/97 border-t border-border backdrop-blur-md py-2.5 px-4 z-50">
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide max-w-[1080px] mx-auto">
          <button
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium whitespace-nowrap transition-all ${
              fwFilter === 'all'
                ? 'bg-primary/12 border-primary/40 text-primary'
                : 'bg-secondary border-border text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setFwFilter('all')}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
            ทั้งหมด <span>{state.plugins.length}</span>
          </button>
          {state.tags.map((t) => {
            const cnt = state.plugins.filter((p) => p.tags.includes(t.id)).length;
            if (!cnt) return null;
            return (
              <button
                key={t.id}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium whitespace-nowrap transition-all ${
                  fwFilter === t.id
                    ? 'bg-primary/12 border-primary/40 text-primary'
                    : 'bg-secondary border-border text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setFwFilter(t.id)}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: t.color }} />
                {t.label} <span>{cnt}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!detailPlugin} onOpenChange={() => setDetailPlugin(null)}>
        <DialogContent className="max-w-[460px] max-h-[90dvh] overflow-y-auto bg-card border-border p-6">
          <DialogHeader>
            <div className="text-4xl mb-2">{detailPlugin?.icon}</div>
            <DialogTitle className="font-montserrat text-lg font-bold">
              {detailPlugin?.name}
            </DialogTitle>
          </DialogHeader>
          {detailPlugin && (
            <div className="space-y-4">
              <div className="text-xs text-muted-foreground">{detailPlugin.ver}</div>
              <div className="flex flex-wrap gap-1.5">
                {detailPlugin.tags.map((t) => (
                  <TagPill key={t} tagId={t} />
                ))}
              </div>
              <div className="flex gap-2 text-sm">
                <span className="text-muted-foreground min-w-[80px] shrink-0">คำอธิบาย</span>
                <span className="break-words">{detailPlugin.desc}</span>
              </div>
              <div className="flex gap-2 text-sm">
                <span className="text-muted-foreground min-w-[80px] shrink-0">ดาวน์โหลด</span>
                <span>{fmtDownload(detailPlugin.dl)} ครั้ง</span>
              </div>
              {detailPlugin.link && (
                <div className="flex gap-2 text-sm">
                  <span className="text-muted-foreground min-w-[80px] shrink-0">ลิงก์</span>
                  <a
                    href={detailPlugin.link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary break-all hover:underline"
                  >
                    {detailPlugin.link}
                  </a>
                </div>
              )}
              <div className="pt-2">
                <Button
                  className="bg-primary text-primary-foreground hover:opacity-85 font-bold"
                  onClick={() => handleDownload(detailPlugin)}
                >
                  <Download className="w-4 h-4 mr-1.5" />
                  ดาวน์โหลด Plugin
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
