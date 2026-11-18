import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../../store/auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Bell,
  LogOut,
  ShieldAlert,
  Check,
  Volume2,
  VolumeX,
  Camera,
  Activity,
  Radio,
  Download,
  AlertTriangle,
} from 'lucide-react';
import api from '../../api';
import { cameraAudio } from '../../utils/CameraAudioFeedback';

interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: 'alert' | 'info' | 'warning' | 'success';
  isRead: boolean;
  createdAt: string;
}

export const Navbar: React.FC = () => {
  const { logout } = useAuthStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(cameraAudio.isEnabled());
  const [timeStr, setTimeStr] = useState(new Date().toLocaleTimeString());
  const panelRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const t = setInterval(() => setTimeStr(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(t);
  }, []);

  const { data } = useQuery<{ notifications: NotificationItem[]; unreadCount: number }>({
    queryKey: ['notifications'],
    queryFn: async () => {
      try {
        const res = await api.get('/notifications');
        return res.data.data;
      } catch {
        return { notifications: [], unreadCount: 0 };
      }
    },
    refetchInterval: 6000,
  });

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  // Close notifications on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showNotifications]);

  const markAllReadMutation = useMutation({
    mutationFn: async () => { await api.put('/notifications/read-all'); },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const readOneMutation = useMutation({
    mutationFn: async (id: string) => { await api.put(`/notifications/${id}/read`); },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const toggleSound = () => {
    const next = cameraAudio.toggleSound();
    setSoundEnabled(next);
    if (next) cameraAudio.playLockOnBeep();
  };

  const typeBadge = (type: string) => {
    if (type === 'alert') return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
    if (type === 'warning') return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    if (type === 'success') return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
  };

  return (
    <header className="h-16 shrink-0 border-b border-cyan-500/15 bg-[#090d16]/95 backdrop-blur-md px-5 flex items-center justify-between gap-4 z-30 font-mono text-slate-300">
      {/* LEFT: Live Optical Telemetry Feed */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-black/40 border border-cyan-500/20 text-[11px]">
          <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_#ef4444]" />
          <span className="font-black text-white tracking-wider">OPTICAL C2</span>
          <span className="text-cyan-400 font-bold border-l border-cyan-500/20 pl-2">ACTIVE</span>
        </div>

        <div className="hidden lg:flex items-center gap-3 text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5 text-cyan-400/90">
            <Radio className="h-3 w-3 text-cyan-400 animate-pulse" />
            4K UHD · 60 FPS
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-emerald-400 flex items-center gap-1">
            <Activity className="h-3 w-3 text-emerald-400" />
            0% PACKET LOSS
          </span>
        </div>
      </div>

      {/* RIGHT: Controls & Profile */}
      <div className="flex items-center gap-3">
        {/* Real-time Clock */}
        <div className="hidden sm:block px-3 py-1 rounded-lg bg-black/40 border border-cyan-500/20 text-[11px] text-cyan-300">
          {timeStr}
        </div>

        {/* Audio FX Toggle */}
        <button
          type="button"
          onClick={toggleSound}
          title={soundEnabled ? 'Mute Shutter & HUD Audio' : 'Enable Shutter & HUD Audio'}
          className={`p-2 rounded-xl border transition-all duration-200 ${
            soundEnabled
              ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/25'
              : 'bg-slate-900 border-slate-700 text-slate-500 hover:text-slate-300'
          }`}
        >
          {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </button>

        {/* Notifications Center */}
        <div className="relative" ref={panelRef}>
          <button
            type="button"
            onClick={() => {
              setShowNotifications((s) => !s);
              if (!showNotifications) cameraAudio.playLockOnBeep();
            }}
            className="relative p-2 rounded-xl bg-black/40 border border-cyan-500/20 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 hover:bg-cyan-500/10 transition-all duration-200"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-rose-600 text-white text-[9px] font-black flex items-center justify-center shadow-[0_0_8px_#ff2d55]">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-[#0b101c] rounded-2xl border border-cyan-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 overflow-hidden backdrop-blur-xl">
              {/* Header */}
              <div className="px-4 py-3 border-b border-cyan-500/20 bg-[#0e1626] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-cyan-400" />
                  <span className="text-[12px] font-bold text-white uppercase tracking-wider">Tactical Alerts</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[9px] font-black">
                      {unreadCount} NEW
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={() => markAllReadMutation.mutate()}
                    className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                  >
                    <Check className="h-3 w-3" /> Mark all read
                  </button>
                )}
              </div>

              {/* Items */}
              <div className="max-h-[340px] overflow-y-auto divide-y divide-cyan-500/10">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div
                      key={notif._id}
                      onClick={() => !notif.isRead && readOneMutation.mutate(notif._id)}
                      className={`px-4 py-3 flex gap-3 text-xs cursor-pointer transition-colors ${
                        notif.isRead
                          ? 'bg-[#0b101c] hover:bg-[#11192b]'
                          : 'bg-[#0f1728] hover:bg-[#141f36] border-l-2 border-cyan-400'
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg border h-fit ${typeBadge(notif.type)}`}>
                        <AlertTriangle className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-[12px] font-bold text-white leading-tight truncate">{notif.title}</p>
                          <span className="text-[9px] text-slate-500 shrink-0 font-mono">
                            {new Date(notif.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 break-words leading-relaxed font-sans">
                          {notif.message.includes('Download: ') ? (
                            <>
                              {notif.message.split('Download: ')[0]}
                              <a
                                href={notif.message.split('Download: ')[1]}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-cyan-400 hover:underline font-medium inline-flex items-center gap-1 ml-1"
                              >
                                <Download className="h-3 w-3" /> View Report
                              </a>
                            </>
                          ) : (
                            notif.message
                          )}
                        </p>
                      </div>
                      {!notif.isRead && (
                        <div className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#00f0ff] shrink-0 self-start mt-1.5" />
                      )}
                    </div>
                  ))
                ) : (
                  <div className="py-10 text-center text-[12px] text-slate-500">
                    No active tactical alerts
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-5 w-px bg-cyan-500/20" />

        {/* Sign out */}
        <button
          type="button"
          onClick={logout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 hover:border-rose-500/40 text-[11px] font-bold transition-all duration-200"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
