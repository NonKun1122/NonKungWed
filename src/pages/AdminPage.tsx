import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  LayoutDashboard,
  Package,
  Tags,
  FileArchive,
  LogOut,
  ArrowLeft,
  Menu,
  X,
  Trash2,
  Eye,
  Plus,
  Download,
  Pencil,
  Upload,
  Link as LinkIcon,
  Search,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useMapForgeStore } from '@/hooks/useMapForgeStore';
import { type Plugin, type Tag, fmtDownload, hexToRgba, formatFileSize } from '@/types/mapforge';

type PanelKey = 'dashboard' | 'plugins' | 'tags' | 'files';

const sidebarItems: { key: PanelKey; label: string; icon: React.ReactNode }[] = [
  { key: 'dashboard', label: 'ภาพรวม', icon: <LayoutDashboard className="w-4 h-4" /> },
  { key: 'plugins', label: 'Map Plugin', icon: <Package className="w-4 h-4" /> },
  { key: 'tags', label: 'จัดการ Tag', icon: <Tags className="w-4 h-4" /> },
  { key: 'files', label: 'จัดการไฟล์', icon: <FileArchive className="w-4 h-4" /> },
];

export default function AdminPage() {
  const navigate = useNavigate();
  const { state, addPlugin, removePlugin, updatePlugin, addTag, removeTag, addFile, removeFile, tagById } =
    useMapForgeStore();
  const [panel, setPanel] = useState<PanelKey>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [detailPlugin, setDetailPlugin] = useState<Plugin | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // Plugin form state
  const [pName, setPName] = useState('');
  const [pVer, setPVer] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pIcon, setPIcon] = useState('🗺️');
  const [pLink, setPLink] = useState('');
  const [pFileId, setPFileId] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [editingPluginId, setEditingPluginId] = useState<number | null>(null);

  // Tag form state
  const [tName, setTName] = useState('');
  const [tId, setTId] = useState('');
  const [tColor, setTColor] = useState('#00D4AA');

  // File upload state
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
  const [fUrl, setFUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auth check
  React.useEffect(() => {
    if (!sessionStorage.getItem('mf_auth')) {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem('mf_auth');
    navigate('/');
  };

  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmAction({ title, message, onConfirm });
  };

  const clearPluginForm = () => {
    setPName('');
    setPVer('');
    setPDesc('');
    setPIcon('🗺️');
    setPLink('');
    setPFileId('');
    setSelectedTags([]);
    setEditingPluginId(null);
  };

  const startEditPlugin = (plugin: Plugin) => {
    setPName(plugin.name);
    setPVer(plugin.ver);
    setPDesc(plugin.desc);
    setPIcon(plugin.icon);
    setPLink(plugin.link);
    setPFileId(plugin.fileId || '');
    setSelectedTags([...plugin.tags]);
    setEditingPluginId(plugin.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Plugin form
  const handleAddPlugin = () => {
    if (!pName.trim() || !pDesc.trim()) {
      toast.error('กรุณากรอกชื่อ Plugin และคำอธิบาย');
      return;
    }
    if (selectedTags.length === 0) {
      toast.error('กรุณาเลือกอย่างน้อย 1 Tag');
      return;
    }
    if (editingPluginId !== null) {
      updatePlugin(editingPluginId, {
        name: pName.trim(),
        ver: pVer.trim() || 'v1.0.0',
        desc: pDesc.trim(),
        tags: [...selectedTags],
        icon: pIcon || '🔧',
        link: pLink.trim(),
        fileId: pFileId || undefined,
      });
      toast.success('แก้ไข Plugin สำเร็จ!');
    } else {
      addPlugin({
        name: pName.trim(),
        ver: pVer.trim() || 'v1.0.0',
        desc: pDesc.trim(),
        tags: [...selectedTags],
        icon: pIcon || '🔧',
        link: pLink.trim(),
        fileId: pFileId || undefined,
      });
      toast.success('เพิ่ม Plugin สำเร็จ!');
    }
    clearPluginForm();
  };

  const handleDeletePlugin = (id: number) => {
    showConfirm('ลบ Plugin', 'คุณแน่ใจหรือไม่ว่าจะลบ Plugin นี้?', () => {
      removePlugin(id);
      if (editingPluginId === id) clearPluginForm();
      toast.success('ลบ Plugin สำเร็จ!');
    });
  };

  // Tag form
  const handleAddTag = () => {
    const name = tName.trim();
    const id = tId.trim().toLowerCase().replace(/\s+/g, '-');
    if (!name || !id) {
      toast.error('กรุณากรอกชื่อ Tag และ ID');
      return;
    }
    if (state.tags.find((t) => t.id === id)) {
      toast.error('Tag นี้มีอยู่แล้ว');
      return;
    }
    addTag({ id, label: name, color: tColor });
    setTName('');
    setTId('');
    setTColor('#00D4AA');
    toast.success('เพิ่ม Tag สำเร็จ!');
  };

  const handleDeleteTag = (id: string) => {
    const usedCount = state.plugins.filter((p) => p.tags.includes(id)).length;
    const msg = usedCount > 0
      ? `Tag นี้ถูกใช้โดย Plugin ${usedCount} รายการ การลบจะลบ Tag ออกจาก Plugin เหล่านั้นด้วย คุณแน่ใจหรือไม่?`
      : 'คุณแน่ใจหรือไม่ว่าจะลบ Tag นี้?';
    showConfirm('ลบ Tag', msg, () => {
      removeTag(id);
      if (selectedTags.includes(id)) {
        setSelectedTags((prev) => prev.filter((t) => t !== id));
      }
      toast.success('ลบ Tag สำเร็จ!');
    });
  };

  // File upload
  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const validTypes = ['application/zip', 'application/java-archive', 'application/x-java-archive'];
      const validExt = ['.zip', '.jar'];
      const hasValidExt = validExt.some((ext) => file.name.toLowerCase().endsWith(ext));
      if (!validTypes.includes(file.type) && !hasValidExt) {
        toast.error('รองรับเຉพาะ ZIP และ JAR เท่านั้น');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast.error('ไฟล์ใหญ่เกิน 2MB กรุณาใช้ URL แทน');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        const newFile = {
          id: `file_${Date.now()}`,
          name: file.name,
          size: file.size,
          type: file.type || 'application/zip',
          base64,
          createdAt: new Date().toISOString(),
        };
        addFile(newFile);
        toast.success('อัปโหลดไฟล์สำเร็จ!');
      };
      reader.readAsDataURL(file);
    },
    [addFile]
  );

  const handleAddFileUrl = () => {
    const url = fUrl.trim();
    if (!url) {
      toast.error('กรุณากรอก URL');
      return;
    }
    const name = url.split('/').pop() || 'file';
    const newFile = {
      id: `url_${Date.now()}`,
      name,
      size: 0,
      type: 'application/octet-stream',
      url,
      createdAt: new Date().toISOString(),
    };
    addFile(newFile);
    setFUrl('');
    toast.success('เพิ่มลิงก์สำเร็จ!');
  };

  const handleDeleteFile = (id: string) => {
    showConfirm('ลบไฟล์', 'คุณแน่ใจหรือไม่ว่าจะลบไฟล์นี้?', () => {
      removeFile(id);
      if (pFileId === id) setPFileId('');
      toast.success('ลบไฟล์สำเร็จ!');
    });
  };

  // Stats
  const totalDl = state.plugins.reduce((a, p) => a + p.dl, 0);
  const topPlugins = [...state.plugins].sort((a, b) => b.dl - a.dl).slice(0, 5);

  const toggleTag = (id: string) => {
    setSelectedTags((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Topbar */}
      <div className="sticky top-0 z-50 flex items-center justify-between h-[52px] px-4 border-b border-border bg-background/96 backdrop-blur-md gap-2.5">
        <div className="flex items-center gap-2.5">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-8 w-8"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-1.5 font-montserrat font-bold text-[15px] whitespace-nowrap">
            <div className="w-[7px] h-[7px] rounded-full bg-primary" />
            MapForge <span className="text-muted-foreground font-normal text-xs">/ Admin</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            className="border border-border text-muted-foreground hover:text-foreground text-xs gap-1"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">หน้าหลัก</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="border border-destructive/30 text-destructive hover:bg-destructive/10 text-xs gap-1"
            onClick={handleLogout}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ออกจากระบบ</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 top-[52px] bg-black/50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed md:relative top-[52px] md:top-0 left-0 bottom-0 z-50 w-[200px] md:w-[190px] border-r border-border bg-background flex flex-col gap-1 p-3 transition-transform md:transition-none ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          {sidebarItems.map((item) => (
            <button
              key={item.key}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] transition-all whitespace-overflow-hidden ${
                panel === item.key
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
              onClick={() => {
                setPanel(item.key);
                setSidebarOpen(false);
              }}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 min-w-0">
          {/* DASHBOARD */}
          {panel === 'dashboard' && (
            <div className="animate-fade-in">
              <h2 className="font-montserrat text-lg font-bold">ภาพรวม</h2>
              <p className="text-[13px] text-muted-foreground mb-5">สถิติระบบ MapForge</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
                <div className="bg-card border border-border rounded-[10px] p-4">
                  <div className="font-montserrat text-[26px] font-bold text-primary">
                    {state.plugins.length}
                  </div>
                  <div className="text-xs text-muted-foreground">Plugin ทั้งหมด</div>
                </div>
                <div className="bg-card border border-border rounded-[10px] p-4">
                  <div className="font-montserrat text-[26px] font-bold text-primary">
                    {state.tags.length}
                  </div>
                  <div className="text-xs text-muted-foreground">Tag ทั้งหมด</div>
                </div>
                <div className="bg-card border border-border rounded-[10px] p-4 col-span-2 md:col-span-1">
                  <div className="font-montserrat text-[26px] font-bold text-primary">
                    {fmtDownload(totalDl)}
                  </div>
                  <div className="text-xs text-muted-foreground">ดาวน์โหลดรวม</div>
                </div>
              </div>
              <div className="bg-card border border-border rounded-[10px] p-4">
                <h3 className="font-montserrat text-[13px] font-semibold mb-3 pb-2.5 border-b border-border">
                  Plugin ยอดนิยม Top 5
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse min-w-[400px]">
                    <thead>
                      <tr className="text-[11px] text-muted-foreground text-left">
                        <th className="pb-2.5 px-3 font-medium">Plugin</th>
                        <th className="pb-2.5 px-3 font-medium">Tags</th>
                        <th className="pb-2.5 px-3 font-medium">ดาวน์โหลด</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topPlugins.map((p) => (
                        <tr key={p.id} className="border-t border-border hover:bg-white/[0.015]">
                          <td className="py-3 px-3">
                            <span className="text-base mr-1.5">{p.icon}</span>
                            <strong className="text-sm">{p.name}</strong>{' '}
                            <span className="text-[11px] text-muted-foreground">{p.ver}</span>
                          </td>
                          <td className="py-3 px-3">
                            {p.tags.map((tid) => {
                              const t = tagById(tid);
                              return (
                                <span
                                  key={tid}
                                  className="inline-block text-[11px] font-medium px-1.5 py-0.5 rounded-full border mr-1 my-0.5"
                                  style={{
                                    color: t.color,
                                    borderColor: hexToRgba(t.color, 0.3),
                                    backgroundColor: hexToRgba(t.color, 0.08),
                                  }}
                                >
                                  {t.label}
                                </span>
                              );
                            })}
                          </td>
                          <td className="py-3 px-3 text-primary font-semibold text-sm">
                            ⬇ {fmtDownload(p.dl)}
                          </td>
                        </tr>
                      ))}
                      {topPlugins.length === 0 && (
                        <tr>
                          <td colSpan={3} className="text-center text-muted-foreground py-7">
                            ไม่มีข้อมูล
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* PLUGINS */}
          {panel === 'plugins' && (
            <div className="animate-fade-in space-y-4">
              <h2 className="font-montserrat text-lg font-bold">Map Plugin</h2>
              <p className="text-[13px] text-muted-foreground mb-5">เพิ่ม ดู หรือลบ plugin</p>

              {/* Add Plugin Form */}
              <div className="bg-card border border-border rounded-[10px] p-4">
                <h3 className="font-montserrat text-[13px] font-semibold mb-3 pb-2.5 border-b border-border">
                  {editingPluginId !== null ? 'แก้ไข Plugin' : 'เพิ่ม Plugin ใหม่'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">ชื่อ Plugin *</Label>
                    <Input
                      value={pName}
                      onChange={(e) => setPName(e.target.value)}
                      placeholder="เช่น MapCluster X"
                      className="bg-secondary border-border focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Version</Label>
                    <Input
                      value={pVer}
                      onChange={(e) => setPVer(e.target.value)}
                      placeholder="v1.0.0"
                      className="bg-secondary border-border focus:border-primary"
                    />
                  </div>
                </div>
                <div className="space-y-1.5 mb-3">
                  <Label className="text-xs text-muted-foreground">คำอธิบาย *</Label>
                  <Textarea
                    value={pDesc}
                    onChange={(e) => setPDesc(e.target.value)}
                    placeholder="อธิบาย plugin..."
                    className="bg-secondary border-border focus:border-primary min-h-[64px] resize-y"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">ไอคอน (Emoji)</Label>
                    <Input
                      value={pIcon}
                      onChange={(e) => setPIcon(e.target.value)}
                      placeholder="🗺️"
                      className="bg-secondary border-border focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">ลิงก์ดาวน์โหลด</Label>
                    <Input
                      value={pLink}
                      onChange={(e) => setPLink(e.target.value)}
                      placeholder="https://..."
                      className="bg-secondary border-border focus:border-primary"
                    />
                  </div>
                </div>
                <div className="space-y-1.5 mb-3">
                  <Label className="text-xs text-muted-foreground">ไฟล์ที่อัปโหลด (เลือก)</Label>
                  <select
                    value={pFileId}
                    onChange={(e) => setPFileId(e.target.value)}
                    className="w-full bg-secondary border border-border text-foreground rounded-md px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  >
                    <option value="">ไม่มีไฟล์</option>
                    {state.files.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({formatFileSize(f.size)})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2 mb-4">
                  <Label className="text-xs text-muted-foreground">Tag (เลือกได้หลายอัน) *</Label>
                  <div className="flex flex-wrap gap-2">
                    {state.tags.map((t) => (
                      <button
                        key={t.id}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs transition-all ${
                          selectedTags.includes(t.id)
                            ? 'text-white'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                        style={
                          selectedTags.includes(t.id)
                            ? { backgroundColor: t.color, borderColor: t.color }
                            : { borderColor: 'hsl(var(--border))' }
                        }
                        onClick={() => toggleTag(t.id)}
                      >
                        {selectedTags.includes(t.id) && <Check className="w-3 h-3" />}
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  {editingPluginId !== null && (
                    <Button
                      variant="ghost"
                      className="border border-border text-muted-foreground hover:text-foreground"
                      onClick={clearPluginForm}
                    >
                      ยกเลิก
                    </Button>
                  )}
                  <Button
                    className="bg-primary text-primary-foreground hover:opacity-85 font-bold gap-1.5"
                    onClick={handleAddPlugin}
                  >
                    {editingPluginId !== null ? (
                      <>
                        <Pencil className="w-4 h-4" />
                        บันทึกการแก้ไข
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        เพิ่ม Plugin
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Plugin List */}
              <div className="bg-card border border-border rounded-[10px] p-4">
                <h3 className="font-montserrat text-[13px] font-semibold mb-3 pb-2.5 border-b border-border">
                  Plugin ทั้งหมด
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse min-w-[500px]">
                    <thead>
                      <tr className="text-[11px] text-muted-foreground text-left">
                        <th className="pb-2.5 px-3 font-medium">Plugin</th>
                        <th className="pb-2.5 px-3 font-medium">Tags</th>
                        <th className="pb-2.5 px-3 font-medium">โหลด</th>
                        <th className="pb-2.5 px-3 font-medium">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {state.plugins.map((p) => (
                        <tr key={p.id} className="border-t border-border hover:bg-white/[0.015]">
                          <td className="py-3 px-3">
                            <span className="text-base mr-1.5">{p.icon}</span>
                            <strong className="text-sm">{p.name}</strong>{' '}
                            <span className="text-[11px] text-muted-foreground">{p.ver}</span>
                          </td>
                          <td className="py-3 px-3">
                            {p.tags.map((tid) => {
                              const t = tagById(tid);
                              return (
                                <span
                                  key={tid}
                                  className="inline-block text-[11px] font-medium px-1.5 py-0.5 rounded-full border mr-1 my-0.5"
                                  style={{
                                    color: t.color,
                                    borderColor: hexToRgba(t.color, 0.3),
                                    backgroundColor: hexToRgba(t.color, 0.08),
                                  }}
                                >
                                  {t.label}
                                </span>
                              );
                            })}
                          </td>
                          <td className="py-3 px-3 text-primary font-semibold text-sm">
                            ⬇ {fmtDownload(p.dl)}
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex gap-1.5">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-[11px] border border-border hover:border-primary hover:text-primary px-2.5"
                                onClick={() => setDetailPlugin(p)}
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                ดู
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-[11px] border border-border hover:border-primary hover:text-primary px-2.5"
                                onClick={() => startEditPlugin(p)}
                              >
                                <Pencil className="w-3 h-3 mr-1" />
                                แก้ไข
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-[11px] border border-border hover:border-destructive hover:text-destructive px-2.5"
                                onClick={() => handleDeletePlugin(p.id)}
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                ลบ
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {state.plugins.length === 0 && (
                        <tr>
                          <td colSpan={4} className="text-center text-muted-foreground py-7">
                            ไม่มี Plugin
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAGS */}
          {panel === 'tags' && (
            <div className="animate-fade-in space-y-4">
              <h2 className="font-montserrat text-lg font-bold">จัดการ Tag</h2>
              <p className="text-[13px] text-muted-foreground mb-5">เพิ่มหรือลบ tag ที่ใช้จัดหมวดหมู่</p>

              <div className="bg-card border border-border rounded-[10px] p-4">
                <h3 className="font-montserrat text-[13px] font-semibold mb-3 pb-2.5 border-b border-border">
                  เพิ่ม Tag ใหม่
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3 items-end">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">ชื่อ Tag *</Label>
                    <Input
                      value={tName}
                      onChange={(e) => setTName(e.target.value)}
                      placeholder="เช่น Routing"
                      className="bg-secondary border-border focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">ID (EN, ไม่มีเว้นวรรค) *</Label>
                    <Input
                      value={tId}
                      onChange={(e) => setTId(e.target.value)}
                      placeholder="เช่น routing"
                      className="bg-secondary border-border focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">สี</Label>
                    <Input
                      type="color"
                      value={tColor}
                      onChange={(e) => setTColor(e.target.value)}
                      className="h-[41px] p-1 cursor-pointer bg-secondary border-border"
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <Button
                    className="bg-primary text-primary-foreground hover:opacity-85 font-bold gap-1.5"
                    onClick={handleAddTag}
                  >
                    <Plus className="w-4 h-4" />
                    เพิ่ม Tag
                  </Button>
                </div>
              </div>

              <div className="bg-card border border-border rounded-[10px] p-4">
                <h3 className="font-montserrat text-[13px] font-semibold mb-3 pb-2.5 border-b border-border">
                  Tag ทั้งหมด
                </h3>
                <div className="space-y-2">
                  {state.tags.map((t) => {
                    const usedCount = state.plugins.filter((p) => p.tags.includes(t.id)).length;
                    return (
                      <div
                        key={t.id}
                        className="flex items-center gap-3 px-3.5 py-2.5 bg-secondary border border-border rounded-lg"
                      >
                        <div
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: t.color }}
                        />
                        <span className="text-[13px] font-medium flex-1">{t.label}</span>
                        <span className="text-[11px] text-muted-foreground shrink-0">ID: {t.id}</span>
                        <span className="text-[11px] text-muted-foreground shrink-0">
                          {usedCount} plugin
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-[11px] border border-border hover:border-destructive hover:text-destructive px-2.5 shrink-0"
                          onClick={() => handleDeleteTag(t.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    );
                  })}
                  {state.tags.length === 0 && (
                    <div className="text-center text-muted-foreground py-7">ไม่มี Tag</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* FILES */}
          {panel === 'files' && (
            <div className="animate-fade-in space-y-4">
              <h2 className="font-montserrat text-lg font-bold">จัดการไฟล์</h2>
              <p className="text-[13px] text-muted-foreground mb-5">อัปโหลดหรือกำหนด URL สำหรับไฟล์ดาวน์โหลด</p>

              <div className="bg-card border border-border rounded-[10px] p-4">
                <h3 className="font-montserrat text-[13px] font-semibold mb-3 pb-2.5 border-b border-border">
                  เพิ่มไฟล์
                </h3>
                <div className="flex gap-2 mb-4">
                  <button
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                      uploadMode === 'file'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-muted-foreground hover:text-foreground'
                    }`}
                    onClick={() => setUploadMode('file')}
                  >
                    <Upload className="w-3.5 h-3.5 inline mr-1" />
                    อัปโหลดไฟล์
                  </button>
                  <button
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                      uploadMode === 'url'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-muted-foreground hover:text-foreground'
                    }`}
                    onClick={() => setUploadMode('url')}
                  >
                    <LinkIcon className="w-3.5 h-3.5 inline mr-1" />
                    ใช้ URL
                  </button>
                </div>

                {uploadMode === 'file' ? (
                  <div className="space-y-3">
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                      <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">
                        ลากไฟล์ ZIP หรือ JAR มาวางที่นี่
                      </p>
                      <p className="text-[11px] text-muted-foreground mb-3">
                        (จำกัด 2MB สำหรับการจัดเก็บใน localStorage)
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-border hover:border-primary"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        เลือกไฟล์
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".zip,.jar"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">URL ดาวน์โหลด</Label>
                      <Input
                        value={fUrl}
                        onChange={(e) => setFUrl(e.target.value)}
                        placeholder="https://example.com/plugin.zip"
                        className="bg-secondary border-border focus:border-primary"
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button
                        className="bg-primary text-primary-foreground hover:opacity-85 font-bold gap-1.5"
                        onClick={handleAddFileUrl}
                      >
                        <Plus className="w-4 h-4" />
                        เพิ่มลิงก์
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-card border border-border rounded-[10px] p-4">
                <h3 className="font-montserrat text-[13px] font-semibold mb-3 pb-2.5 border-b border-border">
                  ไฟล์ทั้งหมด
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse min-w-[500px]">
                    <thead>
                      <tr className="text-[11px] text-muted-foreground text-left">
                        <th className="pb-2.5 px-3 font-medium">ชื่อไฟล์</th>
                        <th className="pb-2.5 px-3 font-medium">ขนาด</th>
                        <th className="pb-2.5 px-3 font-medium">ประเภท</th>
                        <th className="pb-2.5 px-3 font-medium">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {state.files.map((f) => (
                        <tr key={f.id} className="border-t border-border hover:bg-white/[0.015]">
                          <td className="py-3 px-3 text-sm">{f.name}</td>
                          <td className="py-3 px-3 text-sm text-muted-foreground">
                            {formatFileSize(f.size)}
                          </td>
                          <td className="py-3 px-3 text-sm text-muted-foreground">
                            {f.base64 ? 'อัปโหลด' : 'URL'}
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex gap-1.5">
                              {f.base64 && (
                                <a
                                  href={f.base64}
                                  download={f.name}
                                  className="inline-flex items-center gap-1 h-7 px-2.5 text-[11px] border border-border rounded-md text-muted-foreground hover:border-primary hover:text-primary transition-all"
                                >
                                  <Download className="w-3 h-3" />
                                  ดาวน์โหลด
                                </a>
                              )}
                              {f.url && (
                                <a
                                  href={f.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 h-7 px-2.5 text-[11px] border border-border rounded-md text-muted-foreground hover:border-primary hover:text-primary transition-all"
                                >
                                  <LinkIcon className="w-3 h-3" />
                                  เปิด
                                </a>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-[11px] border border-border hover:border-destructive hover:text-destructive px-2.5"
                                onClick={() => handleDeleteFile(f.id)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {state.files.length === 0 && (
                        <tr>
                          <td colSpan={4} className="text-center text-muted-foreground py-7">
                            ไม่มีไฟล์
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Detail Modal */}
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
                {detailPlugin.tags.map((t) => {
                  const tag = tagById(t);
                  return (
                    <span
                      key={t}
                      className="inline-block text-[11px] font-medium px-1.5 py-0.5 rounded-full border"
                      style={{
                        color: tag.color,
                        borderColor: hexToRgba(tag.color, 0.3),
                        backgroundColor: hexToRgba(tag.color, 0.08),
                      }}
                    >
                      {tag.label}
                    </span>
                  );
                })}
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
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog */}
      <Dialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <DialogContent className="max-w-[400px] bg-card border-border p-6">
          <DialogHeader>
            <DialogTitle className="font-montserrat text-base font-bold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              {confirmAction?.title}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{confirmAction?.message}</p>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="ghost"
              className="border border-border text-muted-foreground hover:text-foreground"
              onClick={() => setConfirmAction(null)}
            >
              ยกเลิก
            </Button>
            <Button
              className="bg-destructive text-destructive-foreground hover:opacity-85"
              onClick={() => {
                confirmAction?.onConfirm();
                setConfirmAction(null);
              }}
            >
              ยืนยัน
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
