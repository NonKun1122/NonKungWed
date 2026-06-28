import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DEMO_USER, DEMO_PASS } from '@/types/mapforge';

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleLogin = () => {
    const u = username.trim();
    const p = password;
    if (u === DEMO_USER && p === DEMO_PASS) {
      sessionStorage.setItem('mf_auth', '1');
      navigate('/admin');
    } else {
      setError(true);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-5">
      <div className="w-full max-w-[340px] bg-card border border-border rounded-[14px] p-7 space-y-5">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </div>
        <div>
          <h2 className="font-montserrat text-lg font-bold">Admin Login</h2>
          <p className="text-[13px] text-muted-foreground mt-1">กรอกชื่อผู้ใช้และรหัสผ่าน</p>
        </div>
        <div className="space-y-3.5">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">ชื่อผู้ใช้</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(false); }}
                placeholder="username"
                autoComplete="username"
                className="pl-10 bg-secondary border-border focus:border-primary"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">รหัสผ่าน</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(false); }}
                placeholder="••••••••"
                autoComplete="current-password"
                className="pl-10 bg-secondary border-border focus:border-primary"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
          </div>
          {error && (
            <div className="text-xs text-destructive text-center">ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง</div>
          )}
          <Button
            className="w-full bg-primary text-primary-foreground hover:opacity-85 font-bold"
            onClick={handleLogin}
          >
            เข้าสู่ระบบ
          </Button>
        </div>
      </div>
    </div>
  );
}
