import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { CameraMap } from '../../components/map/CameraMap';
import { LocationPicker } from '../../components/map/LocationPicker';
import { Camera, Plus, Trash2, Map, List, Radio, Video, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../api';

interface CameraItem {
  _id: string;
  name: string;
  location: { name: string; latitude: number; longitude: number } | string;
  type: 'ip' | 'rtsp' | 'usb' | 'cloud';
  status: 'online' | 'offline' | 'maintenance';
  rtspUrl?: string;
}

export const CameraManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<'table' | 'map'>('table');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [locationObj, setLocationObj] = useState<{ name: string; latitude: number; longitude: number }>({
    name: '',
    latitude: 12.9141,
    longitude: 74.856,
  });
  const [type, setType] = useState<'ip' | 'rtsp' | 'usb' | 'cloud'>('rtsp');
  const [rtspUrl, setRtspUrl] = useState('');

  // Fetch cameras list
  const { data: cameras, isLoading } = useQuery<CameraItem[]>({
    queryKey: ['camerasList'],
    queryFn: async () => {
      try {
        const response = await api.get('/cameras?limit=50');
        return response.data.data;
      } catch {
        return [] as CameraItem[];
      }
    },
  });

  // Add camera mutation
  const addMutation = useMutation({
    mutationFn: async (data: any) => {
      await api.post('/cameras', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['camerasList'] });
      setIsAddOpen(false);
      setName('');
      setLocationObj({ name: '', latitude: 12.9141, longitude: 74.856 });
      setRtspUrl('');
    },
  });

  // Delete camera mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/cameras/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['camerasList'] });
    },
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMutation.mutate({
      name,
      location: locationObj,
      type,
      rtspUrl: type === 'rtsp' ? rtspUrl : undefined,
    });
  };

  return (
    <div className="space-y-5 font-sans select-none text-slate-200">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0d1424]/90 p-4 rounded-2xl border border-cyan-500/20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            <Camera className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-wide uppercase font-heading">
              Camera Network Stations
            </h1>
            <p className="text-xs font-mono text-slate-400 mt-0.5">
              Manage optical sensors, RTSP endpoints, and geospatial coordinates
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex bg-black/50 p-1 rounded-xl border border-cyan-500/20">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 px-3 rounded-lg text-xs font-mono font-bold transition-all duration-200 flex items-center gap-1.5 ${
                viewMode === 'table' ? 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(0,240,255,0.3)]' : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="h-3.5 w-3.5" />
              <span>List</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`p-1.5 px-3 rounded-lg text-xs font-mono font-bold transition-all duration-200 flex items-center gap-1.5 ${
                viewMode === 'map' ? 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(0,240,255,0.3)]' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Map className="h-3.5 w-3.5" />
              <span>Map</span>
            </button>
          </div>

          <Button onClick={() => setIsAddOpen(true)} size="sm" className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Camera Station
          </Button>
        </div>
      </div>

      {viewMode === 'map' ? (
        <Card className="border-cyan-500/20 overflow-hidden">
          <CardContent className="p-0">
            <CameraMap cameras={(cameras as any[]) || []} height="600px" />
          </CardContent>
        </Card>
      ) : (
        <Card className="border-cyan-500/20">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono">
                <thead>
                  <tr className="bg-[#080d18] text-[10px] font-bold text-cyan-400 uppercase tracking-wider border-b border-cyan-500/20">
                    <th className="px-6 py-3.5">Station Details</th>
                    <th className="px-6 py-3.5">Sensor Resolution</th>
                    <th className="px-6 py-3.5">Protocol</th>
                    <th className="px-6 py-3.5">Signal Status</th>
                    <th className="px-6 py-3.5">Stream Endpoint</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cyan-500/10 text-xs">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-xs text-slate-500">
                        Scanning optical network stations...
                      </td>
                    </tr>
                  ) : cameras && cameras.length > 0 ? (
                    cameras.map((cam) => {
                      const locName = typeof cam.location === 'object' ? cam.location.name : cam.location;
                      return (
                        <tr key={cam._id} className="hover:bg-cyan-500/5 transition-colors">
                          <td className="px-6 py-4 flex items-center gap-3">
                            <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
                              <Video className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-bold text-white text-[13px]">{cam.name}</p>
                              <p className="text-[10px] text-slate-400">{locName || 'Sector Coordinate Marker'}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold">
                              4K UHD · 60FPS
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="primary">{cam.type.toUpperCase()}</Badge>
                          </td>
                          <td className="px-6 py-4">
                            <Badge
                              variant={
                                cam.status === 'online'
                                  ? 'success'
                                  : cam.status === 'offline'
                                  ? 'danger'
                                  : 'warning'
                              }
                            >
                              {cam.status.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-slate-400 text-[11px] max-w-xs truncate">
                            {cam.rtspUrl || 'IP Local Feed'}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              type="button"
                              onClick={() => deleteMutation.mutate(cam._id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                              title="Delete camera sensor"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-xs text-slate-500">
                        No optical camera sensors registered. Click "Add Camera Station" to mount a feed.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Camera Modal with Map Picker */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Register Camera Station">
        <form onSubmit={handleAddSubmit} className="space-y-4 select-none">
          <Input
            label="Camera Sensor Name"
            placeholder="e.g. North Perimeter Entrance - Cam 01"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div>
            <label className="block text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider mb-1">
              Geospatial Coordinates & Location Marker
            </label>
            <LocationPicker
              locationName={locationObj.name}
              latitude={locationObj.latitude}
              longitude={locationObj.longitude}
              onChange={(data) => setLocationObj(data)}
              height="240px"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider mb-1">
              Stream Protocol Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-cyan-500/20 bg-[#080d18] text-white font-mono"
            >
              <option value="rtsp">RTSP Stream Protocol</option>
              <option value="ip">IP Camera Feed</option>
              <option value="usb">Direct USB Feed</option>
              <option value="cloud">Cloud Network Stream</option>
            </select>
          </div>

          {type === 'rtsp' && (
            <Input
              label="RTSP Network URL"
              placeholder="rtsp://admin:pass@192.168.1.100:554/stream"
              value={rtspUrl}
              onChange={(e) => setRtspUrl(e.target.value)}
              required
            />
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-cyan-500/20">
            <Button variant="outline" type="button" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={addMutation.isPending}>
              Mount Sensor
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CameraManagement;
