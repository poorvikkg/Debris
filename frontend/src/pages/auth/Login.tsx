import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Aperture, Shield, Lock, Eye, Scan, Radio } from 'lucide-react';
import api from '../../api';
import { cameraAudio } from '../../utils/CameraAudioFeedback';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    cameraAudio.playLockOnBeep();
    setLoginError(null);
    setLoginLoading(true);
    try {
      const response = await api.post('/auth/login', { email: loginEmail, password: loginPassword });
      const { user, token } = response.data.data;
      setAuth(user, token);
      navigate('/');
    } catch (err: any) {
      setLoginError(err.response?.data?.message || 'Authorization failed. Check station credentials.');
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#060911] px-4 select-none relative overflow-hidden font-sans">
      {/* Background Optical Grid & Vignette */}
      <div className="absolute inset-0 camera-scanline-grid opacity-30 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#00f0ff_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />
      <div className="absolute inset-0 lens-vignette pointer-events-none" />

      {/* Sweeping Laser Scan Line */}
      <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-camera-scan opacity-40 pointer-events-none" />

      {/* Main Terminal Card */}
      <div className="max-w-md w-full relative z-10">
        <div className="bg-[#0b101c]/95 border border-cyan-500/30 rounded-3xl shadow-[0_0_50px_rgba(0,240,255,0.15)] overflow-hidden backdrop-blur-xl relative">
          {/* Corner Viewfinder Reticles */}
          <div className="viewfinder-bracket viewfinder-corner-tl" />
          <div className="viewfinder-bracket viewfinder-corner-tr" />
          <div className="viewfinder-bracket viewfinder-corner-bl" />
          <div className="viewfinder-bracket viewfinder-corner-br" />

          {/* Top Status Bar */}
          <div className="px-6 py-2.5 bg-[#0e1628] border-b border-cyan-500/20 flex items-center justify-between text-[9px] font-mono text-cyan-400">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              TERMINAL SECURE
            </span>
            <span className="text-slate-500 font-bold">IMPD // SENTINEL C2</span>
          </div>

          {/* Header with Camera Aperture */}
          <div className="flex flex-col items-center text-center space-y-3 pt-8 px-8 pb-5">
            <div className="relative h-16 w-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-400/50 flex items-center justify-center text-cyan-400 shadow-[0_0_25px_rgba(0,240,255,0.3)]">
              <Aperture className="h-9 w-9 animate-spin" style={{ animationDuration: '30s' }} />
              <div className="absolute inset-0 rounded-2xl border border-cyan-400/30 animate-pulse-glow pointer-events-none" />
            </div>

            <div>
              <h1 className="text-xl font-black text-white tracking-widest uppercase font-heading">
                IMPD OPTICS C2
              </h1>
              <p className="text-[10px] font-mono text-cyan-400/80 uppercase tracking-widest mt-1">
                AI Surveillance & Target Reconnaissance
              </p>
            </div>
          </div>

          <div className="p-8 pt-2 space-y-5">
            {/* LOGIN FORM */}
            <form onSubmit={handleLogin} className="space-y-4">
              {loginError && (
                <div className="p-3 text-[11px] font-mono bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl font-bold text-center uppercase tracking-wider">
                  {loginError}
                </div>
              )}

              <Input
                label="Station Identifier / Officer Email"
                type="text"
                placeholder="e.g. central.command@police.gov"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />

              <Input
                label="Security Access Key"
                type="password"
                placeholder="••••••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full py-3 text-xs tracking-widest font-black"
                  isLoading={loginLoading}
                >
                  Authorize Terminal Access
                </Button>
              </div>
            </form>

            <div className="pt-3 border-t border-cyan-500/15 flex items-center justify-between text-[9px] font-mono text-slate-500">
              <span className="flex items-center gap-1">
                <Shield className="h-3 w-3 text-cyan-400" />
                256-Bit Encrypted
              </span>
              <span>v4.2-PROD</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
