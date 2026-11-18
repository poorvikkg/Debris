import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { SendReportModal } from '../../components/modals/SendReportModal';
import { ViewfinderOverlay, VisionFilter } from '../../components/camera/ViewfinderOverlay';
import { cameraAudio } from '../../utils/CameraAudioFeedback';
import api from '../../api';
import {
  Camera,
  Radio,
  Sliders,
  Eye,
  Maximize2,
  Minimize2,
  Crosshair,
  Search,
  Plus,
  RefreshCw,
  Compass,
  ZoomIn,
  ZoomOut,
  Target,
  FileText,
  ShieldCheck,
  AlertTriangle,
  Zap,
} from 'lucide-react';

/* ─── Types ─────────────────────────────────────────── */
interface CameraItem {
  _id: string;
  name: string;
  location: string;
  rtspUrl?: string;
  status: 'online' | 'offline' | 'maintenance';
  type?: string;
}

interface SearchResult {
  _id: string;
  personName?: string;
  isUnknown: boolean;
  confidence: number;
  timestamp: string;
  snapshot?: string;
  cameraId?: { _id: string; name: string; location: string };
}

type GridLayout = 1 | 2 | 4 | 6 | 9;

/* ─── Camera Tile Component ─────────────────────────── */
const CameraStreamTile: React.FC<{
  cam: CameraItem;
  isSelected: boolean;
  onSelect: () => void;
  timestamp: string;
  filter: VisionFilter;
  onFilterChange: (f: VisionFilter) => void;
  onSnapshot: () => void;
  isSpotlight: boolean;
  onToggleSpotlight: () => void;
  targetLock?: { isLocked: boolean; name?: string; confidence?: number };
}> = ({
  cam,
  isSelected,
  onSelect,
  timestamp,
  filter,
  onFilterChange,
  onSnapshot,
  isSpotlight,
  onToggleSpotlight,
  targetLock,
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);

  const getFilterClass = (f: VisionFilter) => {
    switch (f) {
      case 'nightvision': return 'filter-nightvision';
      case 'thermal': return 'filter-thermal';
      case 'surveillance-ir': return 'filter-surveillance-ir';
      default: return 'filter-normal';
    }
  };

  return (
    <div
      onClick={onSelect}
      className={`group relative rounded-2xl overflow-hidden border transition-all duration-300 cursor-pointer bg-black ${
        isSelected
          ? 'border-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.3)] ring-1 ring-cyan-400'
          : 'border-cyan-500/20 hover:border-cyan-500/50 hover:shadow-lg'
      }`}
    >
      {/* Video Feed Surface */}
      <div className="aspect-video bg-[#050811] relative overflow-hidden flex items-center justify-center">
        {cam.status === 'online' ? (
          cam.rtspUrl?.startsWith('http') ? (
            <video
              src={cam.rtspUrl}
              autoPlay
              muted
              loop
              playsInline
              className={`w-full h-full object-cover transition-transform duration-300 ${getFilterClass(filter)}`}
              style={{ transform: `scale(${zoomLevel})` }}
            />
          ) : (
            <div className={`w-full h-full relative flex flex-col items-center justify-center text-center p-4 bg-gradient-to-b from-[#080d1a] to-[#04060c] ${getFilterClass(filter)}`}>
              {/* Simulated Optical Surveillance Background */}
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#00f0ff_1px,transparent_1px)] [background-size:16px_16px]" />
              
              {/* Animated Sweeping Laser Scan Line */}
              <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-camera-scan opacity-60" />

              <div className="relative z-10 flex flex-col items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
                  <Camera className="h-5 w-5 animate-pulse" />
                </div>
                <div>
                  <p className="text-[11px] font-black text-white font-mono uppercase tracking-widest">{cam.name}</p>
                  <p className="text-[9px] font-mono text-cyan-400/80 mt-0.5">{cam.location}</p>
                </div>
                {cam.rtspUrl && (
                  <span className="text-[8px] font-mono text-slate-500 max-w-[200px] truncate bg-black/60 px-2 py-0.5 rounded border border-slate-800">
                    {cam.rtspUrl}
                  </span>
                )}
              </div>
            </div>
          )
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-[#060810] text-slate-600">
            <AlertTriangle className="h-8 w-8 text-slate-600 animate-pulse" />
            <p className="text-[10px] font-black font-mono tracking-widest uppercase text-slate-500">
              {cam.status === 'offline' ? 'SENSOR OFFLINE' : 'MAINTENANCE MODE'}
            </p>
          </div>
        )}

        {/* Viewfinder HUD Overlays */}
        <ViewfinderOverlay
          cameraName={cam.name}
          location={cam.location}
          status={cam.status}
          timestamp={timestamp}
          filter={filter}
          onFilterChange={onFilterChange}
          onSnapshot={onSnapshot}
          isSpotlight={isSpotlight}
          onToggleSpotlight={onToggleSpotlight}
          isTargetLocked={targetLock?.isLocked}
          targetName={targetLock?.name}
          confidence={targetLock?.confidence}
          zoomLevel={zoomLevel}
          onZoomChange={setZoomLevel}
        />
      </div>

      {/* Footer Info Strip */}
      <div className="px-3 py-1.5 bg-[#090e1c] border-t border-cyan-500/15 flex items-center justify-between font-mono text-[10px]">
        <div className="flex items-center gap-2 truncate">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#00f0ff]" />
          <span className="text-slate-300 font-bold truncate">{cam.name}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[9px] text-slate-500 uppercase">{filter}</span>
          <span
            className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase ${
              cam.status === 'online'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
            }`}
          >
            {cam.status}
          </span>
        </div>
      </div>
    </div>
  );
};

/* ─── Main LiveMonitoring Component ─────────────────── */
export const LiveMonitoring: React.FC = () => {
  const queryClient = useQueryClient();
  const [timestamp, setTimestamp] = useState(new Date().toLocaleTimeString());
  const [gridLayout, setGridLayout] = useState<GridLayout>(4);
  const [selectedCams, setSelectedCams] = useState<Set<string>>(new Set());
  const [activeSpotlightId, setActiveSpotlightId] = useState<string | null>(null);
  const [detectionMode, setDetectionMode] = useState<'global' | 'specific'>('global');
  const [targetPersonId, setTargetPersonId] = useState<string>('');
  
  // Optical vision filters state (per camera or global)
  const [cameraFilters, setCameraFilters] = useState<Record<string, VisionFilter>>({});
  const [globalFilter, setGlobalFilter] = useState<VisionFilter>('normal');

  // PTZ Control simulation state for spotlight camera
  const [ptzZoom, setPtzZoom] = useState(1);
  const [ptzPan, setPtzPan] = useState(0);
  const [ptzTilt, setPtzTilt] = useState(0);

  // Modals
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportLogId, setReportLogId] = useState('');
  const [reportPersonName, setReportPersonName] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // RTSP registration state
  const [rtspName, setRtspName] = useState('');
  const [rtspLocation, setRtspLocation] = useState('');
  const [rtspUrl, setRtspUrl] = useState('');
  const [rtspError, setRtspError] = useState<string | null>(null);

  // Person search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSubmitted, setSearchSubmitted] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Live timer
  useEffect(() => {
    const t = setInterval(() => setTimestamp(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(t);
  }, []);

  // Fetch cameras
  const { data: cameras = [], isLoading } = useQuery<CameraItem[]>({
    queryKey: ['monitoringCameras'],
    queryFn: async () => {
      try {
        const r = await api.get('/cameras?limit=50');
        return r.data.data;
      } catch {
        return [];
      }
    },
    refetchInterval: 15000,
  });

  // Fetch active missing persons (complaints)
  const { data: complaints = [] } = useQuery<any[]>({
    queryKey: ['activeComplaints'],
    queryFn: async () => {
      try {
        const r = await api.get('/complaints?limit=100&status=complaint_registered,under_investigation,searching_cctv,possible_match_found');
        return r.data.data;
      } catch {
        return [];
      }
    },
  });

  // Auto-select online cameras
  useEffect(() => {
    if (cameras.length > 0 && selectedCams.size === 0) {
      const online = cameras.filter((c) => c.status === 'online').map((c) => c._id);
      setSelectedCams(new Set(online.slice(0, 9)));
    }
  }, [cameras]);

  // Apply tracking mutation
  const applySettingsMutation = useMutation({
    mutationFn: async () => {
      cameraAudio.playLockOnBeep();
      const promises = Array.from(selectedCams).map((camId) => {
        return api.post(`/cameras/${camId}/start`, {
          mode: detectionMode === 'specific' ? 'target' : 'multi_target',
          target_user_id: targetPersonId || undefined,
        });
      });
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitoringCameras'] });
    },
  });

  // Add camera mutation
  const addCamMutation = useMutation({
    mutationFn: async () => {
      await api.post('/cameras', { name: rtspName, location: rtspLocation, rtspUrl, type: 'rtsp' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitoringCameras'] });
      setIsAddOpen(false);
      setRtspName('');
      setRtspLocation('');
      setRtspUrl('');
      setRtspError(null);
    },
    onError: (err: any) => setRtspError(err.response?.data?.message || 'Failed to register camera stream.'),
  });

  const handleAddCamera = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rtspUrl.match(/^(rtsp|rtmp|http|https):\/\//)) {
      setRtspError('URL must start with rtsp://, rtmp://, http://, or https://');
      return;
    }
    setRtspError(null);
    addCamMutation.mutate();
  };

  const toggleCam = (id: string) => {
    cameraAudio.playLockOnBeep();
    setSelectedCams((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (next.size >= gridLayout) {
          const [first] = next;
          next.delete(first);
        }
        next.add(id);
      }
      return next;
    });
  };

  const setFilterForCam = (id: string, filter: VisionFilter) => {
    cameraAudio.playLockOnBeep();
    setCameraFilters((prev) => ({ ...prev, [id]: filter }));
  };

  const handleApplyGlobalFilter = (filter: VisionFilter) => {
    cameraAudio.playLockOnBeep();
    setGlobalFilter(filter);
    const updated: Record<string, VisionFilter> = {};
    cameras.forEach((c) => {
      updated[c._id] = filter;
    });
    setCameraFilters(updated);
  };

  // Person search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchError(null);
    setSearchSubmitted(searchQuery.trim());
    try {
      const q = encodeURIComponent(searchQuery.trim());
      const res = await api.get(`/recognition/logs?limit=50&personName=${q}`);
      const matched: SearchResult[] = res.data.data || [];
      setSearchResults(matched);
      if (matched.length === 0) setSearchError('No historical detections found in registry.');
    } catch {
      setSearchError('Search request failed. Verify backend server.');
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchSubmitted('');
    setSearchResults([]);
    setSearchError(null);
  };

  const activeCams = cameras.filter((c) => selectedCams.has(c._id));
  const spotlightCam = cameras.find((c) => c._id === activeSpotlightId);

  const gridClass: Record<GridLayout, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    4: 'grid-cols-1 md:grid-cols-2',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    9: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  };

  // Active target details
  const selectedTarget = complaints.find((c) => c._id === targetPersonId);

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col p-4 sm:p-5 overflow-hidden bg-[#070a11] gap-4 font-sans select-none text-slate-200">
      {/* TOP OPTICAL COMMAND BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 shrink-0 bg-[#0d1424]/90 p-3 rounded-2xl border border-cyan-500/20 backdrop-blur-md">
        {/* Title & Stats */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.25)]">
            <Camera className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black text-white uppercase tracking-wider font-heading">
                Surveillance Matrix
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] font-mono font-bold border border-cyan-500/30">
                4K OPTICAL HUD
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5 flex items-center gap-2">
              <span className="text-emerald-400 font-bold">{cameras.filter((c) => c.status === 'online').length} ACTIVE</span>
              <span>/</span>
              <span>{cameras.length} TOTAL SENSORS</span>
              <span>·</span>
              <span className="text-cyan-400">{activeCams.length} ON GRID</span>
            </p>
          </div>
        </div>

        {/* Global Optical Filter Bar */}
        <div className="hidden xl:flex items-center gap-1.5 bg-black/50 p-1.5 rounded-xl border border-cyan-500/20">
          <span className="text-[10px] font-mono text-cyan-400 font-bold px-2 uppercase">Optics Mode:</span>
          {(['normal', 'nightvision', 'thermal', 'surveillance-ir'] as VisionFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => handleApplyGlobalFilter(f)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase transition-all duration-200 ${
                globalFilter === f
                  ? 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(0,240,255,0.4)]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {f === 'normal' ? 'RGB' : f === 'nightvision' ? 'NVG Phosphor' : f === 'thermal' ? 'FLIR Thermal' : 'IR B&W'}
            </button>
          ))}
        </div>

        {/* Grid Layout Switcher & Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Grid Layout Selector */}
          <div className="flex items-center bg-black/50 p-1 rounded-xl border border-cyan-500/20">
            {([1, 2, 4, 6, 9] as GridLayout[]).map((n) => (
              <button
                key={n}
                onClick={() => {
                  cameraAudio.playLockOnBeep();
                  setGridLayout(n);
                  setActiveSpotlightId(null);
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all duration-200 ${
                  gridLayout === n && !activeSpotlightId
                    ? 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(0,240,255,0.4)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {n === 1 ? '1×1' : n === 2 ? '1×2' : n === 4 ? '2×2' : n === 6 ? '2×3' : '3×3'}
              </button>
            ))}
          </div>

          {/* Add RTSP Camera Button */}
          <Button
            onClick={() => setIsAddOpen(true)}
            size="sm"
            className="flex items-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Add Camera</span>
          </Button>
        </div>
      </div>

      {/* MAIN TWO-COLUMN WORKSPACE */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-4 gap-4 min-h-0 overflow-hidden">
        {/* LEFT COLUMN: Controls & Target Tracking Dossier */}
        <div className="xl:col-span-1 space-y-4 overflow-y-auto pr-1 h-full min-h-0 pb-4">
          {/* Target Tracking & AI Mode */}
          <Card>
            <CardHeader className="py-2.5 px-4 flex items-center justify-between">
              <CardTitle className="text-xs flex items-center gap-2">
                <Target className="h-4 w-4 text-cyan-400" />
                AI Target Acquisition
              </CardTitle>
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#10b981]" />
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div>
                <label className="block text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider mb-1">
                  Surveillance Scan Mode
                </label>
                <select
                  className="w-full px-3 py-2 text-xs border border-cyan-500/20 rounded-xl bg-[#080d18] text-white focus:outline-none focus:ring-1 focus:ring-cyan-400 font-mono"
                  value={detectionMode}
                  onChange={(e) => setDetectionMode(e.target.value as 'global' | 'specific')}
                >
                  <option value="global">Database Wide Scan (All Suspects)</option>
                  <option value="specific">Target Lock (Specific Missing/Suspect)</option>
                </select>
              </div>

              {detectionMode === 'specific' && (
                <div className="p-3 rounded-xl bg-[#080d18] border border-cyan-500/30 space-y-2">
                  <label className="block text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">
                    Select Target Subject
                  </label>
                  <select
                    className="w-full px-3 py-2 text-xs border border-amber-500/30 rounded-lg bg-black text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-400 font-mono"
                    value={targetPersonId}
                    onChange={(e) => setTargetPersonId(e.target.value)}
                  >
                    <option value="">-- Choose active case target --</option>
                    {complaints.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.missingPersonName} (ID: {c.complaintId})
                      </option>
                    ))}
                  </select>

                  {selectedTarget && (
                    <div className="pt-2 border-t border-cyan-500/20 flex items-center gap-3">
                      {selectedTarget.photoUrl && (
                        <img
                          src={selectedTarget.photoUrl}
                          alt={selectedTarget.missingPersonName}
                          className="h-12 w-12 rounded-lg object-cover border border-amber-500/40"
                        />
                      )}
                      <div className="text-[10px] font-mono">
                        <p className="text-white font-bold">{selectedTarget.missingPersonName}</p>
                        <p className="text-slate-400">Age: {selectedTarget.age || '—'}</p>
                        <p className="text-amber-400 font-bold uppercase">{selectedTarget.status?.replace('_', ' ')}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <Button
                className="w-full text-xs py-2"
                onClick={() => applySettingsMutation.mutate()}
                isLoading={applySettingsMutation.isPending}
                disabled={detectionMode === 'specific' && !targetPersonId}
              >
                Deploy AI Scan to Active Grid
              </Button>
            </CardContent>
          </Card>

          {/* Camera Array Station Selector */}
          <Card>
            <CardHeader className="py-2.5 px-4 flex items-center justify-between">
              <CardTitle className="text-xs flex items-center gap-2">
                <Radio className="h-4 w-4 text-cyan-400" />
                Optical Camera Stations
              </CardTitle>
              <span className="text-[10px] font-mono text-cyan-400 font-bold">{selectedCams.size} Selected</span>
            </CardHeader>
            <CardContent className="p-2 max-h-64 overflow-y-auto space-y-1">
              {isLoading ? (
                <p className="p-3 text-xs font-mono text-slate-500">Scanning optical array...</p>
              ) : cameras.length === 0 ? (
                <p className="p-3 text-xs font-mono text-slate-500">No registered cameras in station.</p>
              ) : (
                cameras.map((cam) => {
                  const sel = selectedCams.has(cam._id);
                  return (
                    <button
                      key={cam._id}
                      onClick={() => toggleCam(cam._id)}
                      className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between text-xs transition-all duration-200 border ${
                        sel
                          ? 'bg-cyan-500/15 border-cyan-400 text-white font-bold shadow-[0_0_10px_rgba(0,240,255,0.15)]'
                          : 'bg-[#080d18] border-cyan-500/10 text-slate-400 hover:text-white hover:border-cyan-500/30'
                      }`}
                    >
                      <div className="min-w-0 font-mono">
                        <p className="truncate text-white text-[11px]">{cam.name}</p>
                        <p className="text-[9px] text-slate-500 truncate">{cam.location}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[9px] font-mono text-cyan-400">4K</span>
                        <span
                          className={`text-[9px] font-mono font-black uppercase px-1.5 py-0.5 rounded ${
                            cam.status === 'online' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                          }`}
                        >
                          {cam.status}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Live Recognition Fast Search */}
          <Card>
            <CardHeader className="py-2.5 px-4">
              <CardTitle className="text-xs flex items-center gap-2">
                <Search className="h-4 w-4 text-cyan-400" />
                Optical Match Registry
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <form onSubmit={handleSearch} className="space-y-2">
                <Input
                  label="Target Person Name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                />
                <div className="flex gap-2">
                  <Button type="submit" isLoading={isSearching} size="sm" className="flex-1">
                    Locate Target
                  </Button>
                  {searchSubmitted && (
                    <Button type="button" variant="outline" size="sm" onClick={clearSearch}>
                      Clear
                    </Button>
                  )}
                </div>
              </form>

              {searchError && (
                <p className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-wider border border-rose-500/30 bg-rose-500/10 p-2 rounded-lg">
                  {searchError}
                </p>
              )}

              {searchResults.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-cyan-500/20">
                  <p className="text-[10px] font-mono font-black uppercase tracking-wider text-cyan-400">
                    {searchResults.length} sightings for "{searchSubmitted}"
                  </p>
                  <div className="divide-y divide-cyan-500/10 max-h-56 overflow-y-auto space-y-2">
                    {searchResults.map((log) => (
                      <div key={log._id} className="pt-2">
                        <div className="flex justify-between items-start font-mono">
                          <div className="min-w-0">
                            <p className="text-[11px] font-bold text-white truncate">
                              {log.cameraId?.name || 'Station Sensor'}
                            </p>
                            <p className="text-[9px] text-slate-400 truncate">{log.cameraId?.location || 'Sector 1'}</p>
                            <p className="text-[9px] text-cyan-400">{new Date(log.timestamp).toLocaleTimeString()}</p>
                          </div>
                          <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                            {Math.round(log.confidence * 100)}%
                          </span>
                        </div>
                        <div className="flex gap-2 items-center mt-1.5">
                          {log.snapshot && (
                            <img
                              src={`/uploads/${log.snapshot}`}
                              alt="snapshot"
                              className="h-10 w-10 object-cover rounded-lg border border-cyan-500/30"
                            />
                          )}
                          {!log.isUnknown && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-[10px] py-1 h-auto px-2"
                              onClick={() => {
                                setReportLogId(log._id);
                                setReportPersonName(log.personName || 'Subject');
                                setIsReportModalOpen(true);
                              }}
                            >
                              Dispatch Report
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: Camera Multi-Scope Wall & PTZ Spotlight */}
        <div className="xl:col-span-3 flex flex-col h-full min-h-0 overflow-hidden space-y-3">
          {/* Spotlight Mode View */}
          {activeSpotlightId && spotlightCam ? (
            <div className="flex-1 flex flex-col min-h-0 bg-[#0b101c] rounded-2xl border border-cyan-400/50 p-3 relative overflow-hidden shadow-[0_0_30px_rgba(0,240,255,0.2)]">
              {/* Spotlight Header */}
              <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20 shrink-0 font-mono">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00f0ff]" />
                  <span className="text-xs font-black text-white uppercase tracking-wider">
                    SPOTLIGHT TELEMETRY: {spotlightCam.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveSpotlightId(null)}
                    className="flex items-center gap-1 text-[11px]"
                  >
                    <Minimize2 className="h-3.5 w-3.5" />
                    Back to Grid Wall
                  </Button>
                </div>
              </div>

              {/* Spotlight Feed Surface */}
              <div className="flex-1 min-h-0 relative rounded-xl overflow-hidden my-2 bg-black flex items-center justify-center">
                <div className={`w-full h-full relative ${cameraFilters[spotlightCam._id] ? `filter-${cameraFilters[spotlightCam._id]}` : ''}`}>
                  {spotlightCam.rtspUrl?.startsWith('http') ? (
                    <video
                      src={spotlightCam.rtspUrl}
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="w-full h-full object-cover"
                      style={{
                        transform: `scale(${ptzZoom}) translate(${ptzPan}px, ${ptzTilt}px)`,
                        transition: 'transform 0.2s ease',
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-[#090f1e] to-[#04060c] text-center p-6">
                      <div className="h-16 w-16 rounded-full bg-cyan-500/10 border border-cyan-400 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.3)] mb-3">
                        <Camera className="h-8 w-8 animate-pulse" />
                      </div>
                      <h3 className="text-base font-bold font-mono text-white uppercase">{spotlightCam.name}</h3>
                      <p className="text-xs font-mono text-cyan-400 mt-1">{spotlightCam.location}</p>
                      <p className="text-[10px] font-mono text-slate-500 mt-2">4K HIGH-RESOLUTION DIGITAL OPTICAL SENSOR</p>
                    </div>
                  )}

                  {/* Viewfinder Overlay */}
                  <ViewfinderOverlay
                    cameraName={spotlightCam.name}
                    location={spotlightCam.location}
                    status={spotlightCam.status}
                    timestamp={timestamp}
                    filter={cameraFilters[spotlightCam._id] || 'normal'}
                    onFilterChange={(f) => setFilterForCam(spotlightCam._id, f)}
                    onSnapshot={() => cameraAudio.playShutterSound()}
                    isSpotlight={true}
                    zoomLevel={ptzZoom}
                    onZoomChange={setPtzZoom}
                  />
                </div>
              </div>

              {/* PTZ Controller Bar */}
              <div className="p-3 bg-[#080d18] rounded-xl border border-cyan-500/20 flex flex-wrap items-center justify-between gap-4 font-mono text-xs shrink-0">
                {/* D-Pad Pan/Tilt */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-cyan-400 font-bold uppercase">PTZ Pan/Tilt:</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPtzPan((p) => p + 15)}
                      className="p-1.5 rounded bg-slate-800 text-slate-200 hover:bg-cyan-500 hover:text-black transition-colors"
                    >
                      ◀
                    </button>
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => setPtzTilt((t) => t + 15)}
                        className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 hover:bg-cyan-500 hover:text-black transition-colors text-[10px]"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => setPtzTilt((t) => t - 15)}
                        className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 hover:bg-cyan-500 hover:text-black transition-colors text-[10px]"
                      >
                        ▼
                      </button>
                    </div>
                    <button
                      onClick={() => setPtzPan((p) => p - 15)}
                      className="p-1.5 rounded bg-slate-800 text-slate-200 hover:bg-cyan-500 hover:text-black transition-colors"
                    >
                      ▶
                    </button>
                    <button
                      onClick={() => {
                        setPtzPan(0);
                        setPtzTilt(0);
                        setPtzZoom(1);
                      }}
                      className="px-2 py-1 rounded bg-slate-800 text-cyan-400 hover:bg-slate-700 text-[10px] ml-1"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                {/* Zoom Level */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-cyan-400 font-bold uppercase">Optical Zoom:</span>
                  <input
                    type="range"
                    min="1"
                    max="6"
                    step="0.5"
                    value={ptzZoom}
                    onChange={(e) => setPtzZoom(parseFloat(e.target.value))}
                    className="w-28 accent-cyan-400 cursor-pointer"
                  />
                  <span className="text-cyan-300 font-bold">{ptzZoom.toFixed(1)}X</span>
                </div>

                {/* Shutter Snapshot Trigger */}
                <Button
                  onClick={() => cameraAudio.playShutterSound()}
                  size="sm"
                  className="flex items-center gap-1.5"
                >
                  <Camera className="h-3.5 w-3.5" />
                  Capture Shutter Frame
                </Button>
              </div>
            </div>
          ) : (
            /* Multi-Grid Camera Wall */
            <div className="flex-1 min-h-0 overflow-y-auto">
              {activeCams.length === 0 ? (
                <div className="h-full bg-[#080d18] border border-cyan-500/20 rounded-2xl flex items-center justify-center p-8 text-center">
                  <div>
                    <Camera className="h-12 w-12 text-cyan-500/40 mx-auto mb-3 animate-pulse" />
                    <h3 className="text-sm font-black font-mono text-slate-400 uppercase tracking-widest">
                      NO CAMERA STREAMS ENGAGED
                    </h3>
                    <p className="text-xs font-mono text-slate-500 mt-1">
                      Select camera stations from the left optical panel to mount feeds onto the surveillance wall.
                    </p>
                  </div>
                </div>
              ) : (
                <div className={`grid gap-3 ${gridClass[gridLayout]}`}>
                  {activeCams.map((cam) => (
                    <CameraStreamTile
                      key={cam._id}
                      cam={cam}
                      isSelected={selectedCams.has(cam._id)}
                      onSelect={() => {
                        // Clicking selects spotlight focus
                        setActiveSpotlightId(cam._id);
                      }}
                      timestamp={timestamp}
                      filter={cameraFilters[cam._id] || globalFilter}
                      onFilterChange={(f) => setFilterForCam(cam._id, f)}
                      onSnapshot={() => cameraAudio.playShutterSound()}
                      isSpotlight={false}
                      onToggleSpotlight={() => setActiveSpotlightId(cam._id)}
                      targetLock={
                        detectionMode === 'specific' && targetPersonId
                          ? {
                              isLocked: true,
                              name: selectedTarget?.missingPersonName || 'Target Person',
                              confidence: 0.94,
                            }
                          : undefined
                      }
                    />
                  ))}

                  {/* Empty filler tiles */}
                  {Array.from({ length: Math.max(0, gridLayout - activeCams.length) }).map((_, i) => (
                    <div
                      key={`empty-${i}`}
                      onClick={() => setIsAddOpen(true)}
                      className="aspect-video bg-[#080d18] border border-dashed border-cyan-500/20 rounded-2xl flex flex-col items-center justify-center gap-2 text-center p-4 cursor-pointer hover:border-cyan-500/50 hover:bg-[#0c1322] transition-colors"
                    >
                      <Plus className="h-6 w-6 text-cyan-500/40" />
                      <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                        EMPTY OPTICAL SLOT
                      </p>
                      <span className="text-[9px] font-mono text-cyan-400/60">+ Mount RTSP Stream</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Camera Stream Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Register RTSP Camera Sensor">
        <form onSubmit={handleAddCamera} className="space-y-4">
          <p className="text-[11px] font-mono text-slate-400 border border-cyan-500/20 bg-[#080d18] p-3 rounded-xl leading-relaxed">
            Mount an RTSP, RTMP, or HTTP camera stream directly into the command matrix. Streams are monitored with real-time face extraction and YOLOv8 inference.
          </p>
          <Input
            label="Camera Sensor Name *"
            value={rtspName}
            onChange={(e) => setRtspName(e.target.value)}
            placeholder="e.g. North Perimeter Entrance - Cam 01"
            required
          />
          <Input
            label="Sector Location *"
            value={rtspLocation}
            onChange={(e) => setRtspLocation(e.target.value)}
            placeholder="e.g. Terminal Gate B"
            required
          />
          <div>
            <label className="block text-[10px] font-mono font-bold uppercase tracking-wider mb-1.5 text-cyan-400/90">
              Stream Protocol URL *
            </label>
            <input
              type="text"
              value={rtspUrl}
              onChange={(e) => setRtspUrl(e.target.value)}
              placeholder="rtsp://192.168.1.100:554/live or http://server/stream.m3u8"
              required
              className="w-full px-4 py-2.5 text-[13px] rounded-xl border border-cyan-500/20 bg-[#080d18] text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 font-mono"
            />
            <p className="text-[9px] font-mono text-slate-500 mt-1">Supported: rtsp:// · rtmp:// · http:// · https://</p>
          </div>
          {rtspError && (
            <p className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-wider border border-rose-500/30 bg-rose-500/10 p-2.5 rounded-xl">
              {rtspError}
            </p>
          )}
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={addCamMutation.isPending}>
              Mount Sensor
            </Button>
          </div>
        </form>
      </Modal>

      {/* Dispatch Report Modal */}
      {isReportModalOpen && (
        <SendReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          logId={reportLogId}
          personName={reportPersonName}
        />
      )}
    </div>
  );
};

export default LiveMonitoring;
