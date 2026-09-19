import React, { useState, useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { BaseMapTile } from '../../types';
import { Layers, Maximize2, Minimize2, Navigation, Compass, Globe, Crosshair } from 'lucide-react';

interface MapControlsProps {
  currentBasemap: BaseMapTile;
  onBasemapChange: (basemap: BaseMapTile) => void;
  onFitAllBounds: () => void;
}

export const MapControls: React.FC<MapControlsProps> = ({
  currentBasemap,
  onBasemapChange,
  onFitAllBounds
}) => {
  const map = useMap();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mouseCoords, setMouseCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [currentZoom, setCurrentZoom] = useState(map.getZoom());

  useEffect(() => {
    const handleMouseMove = (e: L.LeafletMouseEvent) => {
      setMouseCoords({
        lat: Number(e.latlng.lat.toFixed(4)),
        lng: Number(e.latlng.lng.toFixed(4))
      });
    };

    const handleZoom = () => {
      setCurrentZoom(map.getZoom());
    };

    map.on('mousemove', handleMouseMove);
    map.on('zoomend', handleZoom);

    return () => {
      map.off('mousemove', handleMouseMove);
      map.off('zoomend', handleZoom);
    };
  }, [map]);

  const handleFlyTo = (lat: number, lng: number, zoomLevel: number) => {
    map.flyTo([lat, lng], zoomLevel, {
      duration: 1.2,
      easeLinearity: 0.25
    });
  };

  const toggleFullscreen = () => {
    const mapContainer = map.getContainer().parentElement;
    if (!mapContainer) return;

    if (!document.fullscreenElement) {
      mapContainer.requestFullscreen?.().catch((err) => console.warn(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch((err) => console.warn(err));
      setIsFullscreen(false);
    }
  };

  return (
    <>
      {/* Top Right Basemap & Tactical Controls */}
      <div className="absolute top-4 right-4 z-[400] flex flex-col items-end gap-2 pointer-events-auto">
        <div className="bg-cyber-950/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/80 shadow-2xl flex items-center gap-1">
          <button
            type="button"
            title="Dark Matter (Cyber)"
            onClick={() => onBasemapChange('dark')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
              currentBasemap === 'dark'
                ? 'bg-cyber-accent text-cyber-950 shadow-md font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Dark Matter
          </button>
          <button
            type="button"
            title="Tactical Radar Grid"
            onClick={() => onBasemapChange('tactical')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
              currentBasemap === 'tactical'
                ? 'bg-cyber-accent text-cyber-950 shadow-md font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Tactical
          </button>
          <button
            type="button"
            title="Satellite Aerial"
            onClick={() => onBasemapChange('satellite')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
              currentBasemap === 'satellite'
                ? 'bg-cyber-accent text-cyber-950 shadow-md font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Satellite
          </button>
          <button
            type="button"
            title="Light Canvas"
            onClick={() => onBasemapChange('light')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
              currentBasemap === 'light'
                ? 'bg-cyber-accent text-cyber-950 shadow-md font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Light
          </button>
        </div>

        {/* Quick Surveillance Jump Presets */}
        <div className="bg-cyber-950/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/80 shadow-2xl flex items-center gap-1">
          <span className="text-[10px] text-slate-400 font-mono px-1.5 uppercase font-bold flex items-center gap-1">
            <Compass className="w-3 h-3 text-cyber-accent" />
            <span>Preset:</span>
          </span>
          <button
            type="button"
            onClick={() => handleFlyTo(28.6139, 77.2090, 11)}
            className="px-2 py-0.5 rounded text-[10px] text-slate-300 hover:text-white hover:bg-slate-800 font-mono"
          >
            Delhi NCR
          </button>
          <button
            type="button"
            onClick={() => handleFlyTo(28.6315, 77.2167, 14)}
            className="px-2 py-0.5 rounded text-[10px] text-slate-300 hover:text-white hover:bg-slate-800 font-mono"
          >
            Connaught Pl
          </button>
          <button
            type="button"
            onClick={() => handleFlyTo(28.4595, 77.0266, 13)}
            className="px-2 py-0.5 rounded text-[10px] text-slate-300 hover:text-white hover:bg-slate-800 font-mono"
          >
            Cyber City
          </button>
          <button
            type="button"
            onClick={() => handleFlyTo(19.0596, 72.8295, 12)}
            className="px-2 py-0.5 rounded text-[10px] text-slate-300 hover:text-white hover:bg-slate-800 font-mono"
          >
            Mumbai
          </button>
          <button
            type="button"
            onClick={() => handleFlyTo(22.5937, 78.9629, 5)}
            className="px-2 py-0.5 rounded text-[10px] text-slate-300 hover:text-white hover:bg-slate-800 font-mono"
          >
            National
          </button>
        </div>

        {/* Action Buttons: Auto-Fit & Fullscreen */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onFitAllBounds}
            title="Auto-Fit Bounds to Filtered Nodes"
            className="bg-cyber-950/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-slate-700/80 text-[11px] text-slate-200 hover:text-white hover:border-cyber-accent transition-all flex items-center gap-1.5 shadow-xl"
          >
            <Crosshair className="w-3.5 h-3.5 text-cyber-accent" />
            <span>Fit Bounds</span>
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Map'}
            className="bg-cyber-950/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/80 text-slate-200 hover:text-white hover:border-cyber-accent transition-all shadow-xl"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4 text-cyber-accent" /> : <Maximize2 className="w-4 h-4 text-cyber-accent" />}
          </button>
        </div>
      </div>

      {/* Bottom Left Tactical HUD (Lat/Lng Coordinates & Zoom Readout) */}
      <div className="absolute bottom-4 left-4 z-[400] pointer-events-auto">
        <div className="bg-cyber-950/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 shadow-2xl flex items-center gap-3 text-[11px] font-mono text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-400">GIS HUD:</span>
          </div>
          {mouseCoords ? (
            <div>
              <span className="text-cyber-accent">{mouseCoords.lat.toFixed(4)}°N</span>
              <span className="text-slate-500 mx-1">|</span>
              <span className="text-cyber-accent">{mouseCoords.lng.toFixed(4)}°E</span>
            </div>
          ) : (
            <span className="text-slate-500">28.6139°N | 77.2090°E</span>
          )}
          <div className="border-l border-slate-700 pl-2 text-slate-400">
            Zoom: <strong className="text-white">{currentZoom}x</strong>
          </div>
        </div>
      </div>
    </>
  );
};
