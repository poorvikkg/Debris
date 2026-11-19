import React, { useState } from 'react';
import { Camera, Eye, Zap, Maximize2, Minimize2, Radio, Crosshair } from 'lucide-react';
import { cameraAudio } from '../../utils/CameraAudioFeedback';

export type VisionFilter = 'normal' | 'nightvision' | 'thermal' | 'surveillance-ir';

interface ViewfinderOverlayProps {
  cameraName: string;
  location?: string;
  status?: 'online' | 'offline' | 'maintenance';
  timestamp: string;
  filter?: VisionFilter;
  onFilterChange?: (filter: VisionFilter) => void;
  onSnapshot?: () => void;
  isSpotlight?: boolean;
  onToggleSpotlight?: () => void;
  isTargetLocked?: boolean;
  targetName?: string;
  confidence?: number;
  zoomLevel?: number;
  onZoomChange?: (zoom: number) => void;
  showReticle?: boolean;
  showControls?: boolean;
}

export const ViewfinderOverlay: React.FC<ViewfinderOverlayProps> = ({
  cameraName,
  location,
  status = 'online',
  timestamp,
  filter = 'normal',
  onFilterChange,
  onSnapshot,
  isSpotlight = false,
  onToggleSpotlight,
  isTargetLocked = false,
  targetName,
  confidence,
  zoomLevel = 1,
  onZoomChange,
  showReticle = true,
  showControls = true,
}) => {
  const [isFlashing, setIsFlashing] = useState(false);

  const handleTakeSnapshot = (e: React.MouseEvent) => {
    e.stopPropagation();
    cameraAudio.playShutterSound();
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 350);
    if (onSnapshot) {
      onSnapshot();
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-10 select-none overflow-hidden font-mono">
      {/* Shutter Screen Flash */}
      {isFlashing && (
        <div className="absolute inset-0 z-50 animate-shutter-flash bg-white pointer-events-none" />
      )}

      {/* CRT Scanline & Lens Vignette */}
      <div className="absolute inset-0 camera-scanline-grid opacity-30 pointer-events-none" />
      <div className="absolute inset-0 lens-vignette pointer-events-none" />

      {/* Corner Brackets */}
      <div className={`viewfinder-bracket ${isTargetLocked ? 'viewfinder-lock-tl' : 'viewfinder-corner-tl'}`} />
      <div className={`viewfinder-bracket ${isTargetLocked ? 'viewfinder-lock-tr' : 'viewfinder-corner-tr'}`} />
      <div className={`viewfinder-bracket ${isTargetLocked ? 'viewfinder-lock-bl' : 'viewfinder-corner-bl'}`} />
      <div className={`viewfinder-bracket ${isTargetLocked ? 'viewfinder-lock-br' : 'viewfinder-corner-br'}`} />

      {/* Center Reticle Crosshair */}
      {showReticle && status === 'online' && (
        <div className="reticle-crosshair">
          <div className="w-5 h-5 rounded-full border border-cyan-400/40 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
            <div className="w-1 h-1 bg-cyan-400/80 rounded-full" />
          </div>
        </div>
      )}

      {/* TOP HUD BAR */}
      <div className="absolute top-2 left-3 right-3 flex items-center justify-between text-[9px] text-cyan-300/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
        {/* Left: REC & Camera ID */}
        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded border border-cyan-500/30">
          {status === 'online' ? (
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_#ef4444]" />
              <span className="font-black text-red-400 tracking-wider">REC</span>
            </div>
          ) : (
            <span className="font-bold text-slate-400 uppercase">{status}</span>
          )}
          <span className="text-white/80 font-bold truncate max-w-[140px]">{cameraName}</span>
        </div>

        {/* Right: Optical Telemetry */}
        <div className="flex items-center gap-2">
          {isSpotlight && (
            <div className="hidden sm:flex items-center gap-2 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded border border-cyan-500/20 text-slate-300">
              <span>35mm F/1.8</span>
              <span className="text-cyan-400">ISO 800</span>
              <span>1/250s</span>
            </div>
          )}
          <div className="bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded border border-cyan-500/30 text-emerald-400 font-bold">
            {status === 'online' ? '60 FPS · 4K' : 'NO SIGNAL'}
          </div>
        </div>
      </div>

      {/* TARGET LOCK OVERLAY (If suspect acquired) */}
      {isTargetLocked && (
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          <div className="w-24 h-24 sm:w-32 sm:h-32 border-2 border-red-500/90 rounded-lg relative animate-pulse-glow flex items-center justify-center">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 text-white font-black text-[8px] px-1.5 py-0.2 rounded uppercase tracking-widest whitespace-nowrap shadow-lg">
              TARGET LOCK
            </div>
            <Crosshair className="h-6 w-6 text-red-400 animate-spin" style={{ animationDuration: '6s' }} />
            {confidence && (
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-black/90 border border-red-500 text-red-300 font-mono text-[8px] px-1 rounded whitespace-nowrap">
                MATCH: {Math.round(confidence * 100)}%
              </div>
            )}
          </div>
          {targetName && (
            <div className="mt-2 bg-red-950/90 border border-red-500/80 px-2 py-0.5 rounded text-white text-[10px] font-bold tracking-wider uppercase">
              {targetName}
            </div>
          )}
        </div>
      )}

      {/* BOTTOM HUD BAR */}
      <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[9px] text-slate-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
        {/* Left: Location & Sensor Status */}
        <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded border border-cyan-500/20">
          <Radio className="h-3 w-3 text-cyan-400 animate-pulse" />
          <span className="text-slate-300 truncate max-w-[120px]">{location || 'Station Sector'}</span>
          <span className="text-cyan-400 font-bold ml-1">[{zoomLevel.toFixed(1)}x]</span>
        </div>

        {/* Right: Real-time clock */}
        <div className="bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded border border-cyan-500/20 font-mono text-cyan-200">
          {timestamp}
        </div>
      </div>

      {/* INTERACTIVE CONTROLS (Hover overlay with pointer-events-auto) */}
      {showControls && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/30 backdrop-blur-[2px] pointer-events-auto">
          <div className="flex items-center gap-2 bg-slate-950/90 border border-cyan-500/40 p-1.5 rounded-xl shadow-2xl">
            {/* Shutter Snapshot Button */}
            <button
              type="button"
              onClick={handleTakeSnapshot}
              title="Capture Shutter Snapshot"
              className="p-2 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500 hover:text-black transition-colors border border-cyan-500/30"
            >
              <Camera className="h-4 w-4" />
            </button>

            {/* Vision Filter Cycle */}
            {onFilterChange && (
              <div className="flex items-center gap-1 border-l border-slate-700 pl-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const next: Record<VisionFilter, VisionFilter> = {
                      normal: 'nightvision',
                      nightvision: 'thermal',
                      thermal: 'surveillance-ir',
                      'surveillance-ir': 'normal',
                    };
                    onFilterChange(next[filter]);
                  }}
                  title={`Filter: ${filter.toUpperCase()}`}
                  className="p-2 rounded-lg bg-slate-800 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 transition-colors border border-slate-700 text-[10px] font-bold uppercase flex items-center gap-1"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{filter === 'nightvision' ? 'NVG' : filter === 'thermal' ? 'FLIR' : filter === 'surveillance-ir' ? 'IR' : 'RGB'}</span>
                </button>
              </div>
            )}

            {/* Zoom In/Out */}
            {onZoomChange && (
              <div className="flex items-center gap-1 border-l border-slate-700 pl-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const zooms = [1, 2, 4];
                    const nextIndex = (zooms.indexOf(zoomLevel) + 1) % zooms.length;
                    onZoomChange(zooms[nextIndex]);
                  }}
                  className="px-2 py-1 rounded bg-slate-800 text-amber-300 hover:bg-slate-700 text-[10px] font-bold border border-slate-700"
                >
                  {zoomLevel}X
                </button>
              </div>
            )}

            {/* Spotlight / Maximize */}
            {onToggleSpotlight && (
              <div className="border-l border-slate-700 pl-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSpotlight();
                  }}
                  title={isSpotlight ? 'Exit Spotlight' : 'Focus Spotlight'}
                  className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors border border-slate-700"
                >
                  {isSpotlight ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
