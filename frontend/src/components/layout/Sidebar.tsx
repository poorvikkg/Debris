import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/auth';
import {
  Camera,
  Tv,
  ScanSearch,
  MapPin,
  Bot,
  Radio,
  Zap,
  Network,
  FilePlus,
  FileQuestion,
  FileText,
  UserSearch,
  Users,
  Database,
  Shield,
  Aperture,
  Crosshair,
  Sliders,
  Cpu,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user } = useAuthStore();

  const sections = [
    {
      title: 'Optics & Feeds',
      items: [
        { to: '/monitoring',    label: 'Live Camera Wall',  icon: Tv,          roles: ['admin'], badge: 'LIVE' },
        { to: '/cameras',       label: 'Camera Stations',   icon: Camera,      roles: ['admin'] },
        { to: '/analyse',       label: 'Video Forensics',   icon: ScanSearch,  roles: ['admin'] },
        { to: '/detection-map', label: 'Sensor Map',        icon: MapPin,      roles: ['admin', 'station'] },
      ],
    },
    {
      title: 'AI Intelligence',
      items: [
        { to: '/suspects/chase-map',    label: 'Chase Radar',       icon: Radio,     roles: ['admin'], badge: 'RADAR' },
        { to: '/analytics/threats',     label: 'Threat Matrix',     icon: Zap,       roles: ['admin'] },
        { to: '/analytics/accomplices', label: 'Accomplice Engine', icon: Network,   roles: ['admin'] },
        { to: '/rag/chat',              label: 'Crime AI Copilot',  icon: Bot,       roles: ['admin', 'station', 'viewer'] },
        { to: '/rag/import',            label: 'Evidence Ingestion',icon: Database,  roles: ['admin', 'station'] },
      ],
    },
    {
      title: 'Recognition & Records',
      items: [
        { to: '/logs',               label: 'Recognition Logs',  icon: FileText,     roles: ['admin'] },
        { to: '/unknown-faces',      label: 'Unknown Face Bank', icon: Crosshair,    roles: ['admin'] },
        { to: '/recurring-unknowns', label: 'Recurring Targets', icon: UserSearch,   roles: ['admin'] },
        { to: '/complaints',         label: 'Case Complaints',   icon: FileQuestion, roles: ['admin', 'station', 'viewer'] },
        { to: '/file-case',          label: 'Register Case',     icon: FilePlus,     roles: ['station'] },
      ],
    },
    {
      title: 'System & Stations',
      items: [
        { to: '/users',    label: 'Station Officers', icon: Users,   roles: ['admin'] },
        { to: '/settings', label: 'System Settings',  icon: Sliders, roles: ['admin'] },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-[#090d16] border-r border-cyan-500/15 flex flex-col h-full select-none z-20 shrink-0 text-slate-300">
      {/* Brand Header with Camera Aperture & Pulse Radar */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-cyan-500/15 bg-[#0b101c]/80 shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative h-9 w-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            <Aperture className="h-5 w-5 animate-spin" style={{ animationDuration: '24s' }} />
            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-white text-[14px] tracking-widest font-heading">IMPD</span>
              <span className="text-[9px] font-mono font-bold px-1 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30">C2</span>
            </div>
            <p className="text-[9px] font-mono text-cyan-400/70 tracking-wider uppercase">AI Optics Command</p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded-md border border-cyan-500/20">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[9px] font-mono font-bold text-slate-300">REC</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-5">
        {sections.map((section) => {
          const visible = section.items.filter(
            (item) => user && item.roles.includes(user.role)
          );
          if (visible.length === 0) return null;

          return (
            <div key={section.title}>
              <div className="flex items-center justify-between px-2 mb-1.5">
                <p className="text-[9px] font-mono font-bold text-cyan-400/60 uppercase tracking-widest">
                  {section.title}
                </p>
                <span className="h-px flex-1 bg-cyan-500/10 ml-2" />
              </div>
              <div className="space-y-1">
                {visible.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `group flex items-center justify-between px-3 py-2 rounded-xl text-[12px] font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_-3px_rgba(0,240,255,0.25)] font-semibold'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/40 hover:border hover:border-slate-700/50'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center gap-3 truncate">
                          <item.icon
                            className={`h-4 w-4 shrink-0 transition-colors ${
                              isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-cyan-300'
                            }`}
                          />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={`text-[8px] font-mono font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${
                              isActive
                                ? 'bg-cyan-400 text-black shadow-xs'
                                : 'bg-slate-800 text-cyan-400/80 border border-cyan-500/20'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Optical Engine Telemetry Ticker & User Badge */}
      <div className="p-3 border-t border-cyan-500/15 bg-[#0b101c]/80 shrink-0 space-y-2.5">
        {/* GPU & AI Status */}
        <div className="p-2 rounded-lg bg-black/40 border border-cyan-500/20 text-[9px] font-mono space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5 text-cyan-300">
              <Cpu className="h-3 w-3 text-cyan-400 animate-pulse" />
              YOLOv8 + FaceNet
            </span>
            <span className="text-emerald-400 font-bold">ONLINE</span>
          </div>
          <div className="flex items-center justify-between text-[8px] text-slate-500">
            <span>OPTICAL SENSORS: 4K</span>
            <span className="text-cyan-400">LATENCY: 16ms</span>
          </div>
        </div>

        {/* User clearance */}
        <div className="flex items-center gap-2.5 px-2 py-1">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center text-white text-[12px] font-black shrink-0 shadow-[0_0_10px_rgba(0,240,255,0.3)] border border-cyan-400/30">
            {(user?.name || 'A').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-white truncate">{user?.name || 'Operator'}</p>
            <div className="flex items-center gap-1">
              <Shield className="h-2.5 w-2.5 text-cyan-400" />
              <p className="text-[9px] text-cyan-400/80 font-mono uppercase tracking-wider">{user?.role || 'Officer'}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
