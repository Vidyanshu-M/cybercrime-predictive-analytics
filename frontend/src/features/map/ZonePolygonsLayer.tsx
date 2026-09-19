import React from 'react';
import { Polygon, Circle, Popup, Tooltip } from 'react-leaflet';
import { RiskZone } from '../../types';
import { RiskBadge } from '../../components/RiskBadge';
import { ShieldAlert, AlertTriangle, ArrowRight, Activity, MapPin } from 'lucide-react';

interface ZonePolygonsLayerProps {
  zones: RiskZone[];
  visible?: boolean;
  selectedRadiusKm?: number;
  onZoneSelect?: (zone: RiskZone) => void;
}

export const ZonePolygonsLayer: React.FC<ZonePolygonsLayerProps> = ({
  zones,
  visible = true,
  selectedRadiusKm,
  onZoneSelect
}) => {
  if (!visible) return null;

  return (
    <>
      {zones.map((zone) => {
        const isCritical = zone.riskLevel === 'CRITICAL';
        const color = isCritical
          ? '#EF4444'
          : zone.riskLevel === 'HIGH'
          ? '#F97316'
          : '#F59E0B';

        const pathOptions = {
          color,
          fillColor: color,
          fillOpacity: isCritical ? 0.22 : 0.16,
          weight: isCritical ? 2.5 : 1.8,
          dashArray: isCritical ? '6, 6' : undefined,
          className: isCritical ? 'risk-pulse-polygon' : undefined
        };

        const renderPopupContent = () => (
          <div className="p-3 space-y-2 text-xs text-slate-200 min-w-[240px]">
            <div className="flex items-center justify-between gap-2 border-b border-slate-700/80 pb-2">
              <span className="font-bold text-white text-sm">{zone.name}</span>
              <RiskBadge level={zone.riskLevel} score={zone.riskScore} size="sm" />
            </div>

            <p className="text-[11px] text-slate-300 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-cyber-accent" />
              <span>Surveillance Perimeter: {zone.radiusKm} km radius</span>
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800 text-[11px]">
              <div className="bg-cyber-900/80 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Complaints:</span>
                <strong className="text-white text-sm font-mono">{zone.complaintCount}</strong>
              </div>
              <div className="bg-cyber-900/80 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Monitored ATMs:</span>
                <strong className="text-cyber-accent text-sm font-mono">{zone.atmCount}</strong>
              </div>
            </div>

            <div className="bg-cyber-950/80 p-2 rounded-lg border border-slate-800/80 text-[10px] text-slate-300 flex items-center justify-between">
              <span className="text-slate-400">Prediction Window:</span>
              <span className="font-mono text-amber-400 font-semibold">Active (Next 3h)</span>
            </div>

            {onZoneSelect && (
              <button
                type="button"
                onClick={() => onZoneSelect(zone)}
                className="w-full mt-1 py-1.5 rounded-lg bg-cyber-accent/20 hover:bg-cyber-accent/30 text-cyber-accent font-semibold text-[11px] flex items-center justify-center gap-1 transition-colors border border-cyber-accent/30"
              >
                <span>Inspect Zone Intelligence</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        );

        // If specific polygon coordinates exist, render Polygon
        if (zone.coordinates && zone.coordinates.length > 2) {
          return (
            <Polygon
              key={zone.id}
              positions={zone.coordinates as [number, number][]}
              pathOptions={pathOptions}
              eventHandlers={{
                click: () => onZoneSelect && onZoneSelect(zone)
              }}
            >
              <Tooltip permanent={false} direction="center" className="custom-zone-tooltip">
                <div className="text-[10px] font-bold text-white px-1.5 py-0.5 rounded bg-cyber-950/90 border border-slate-700 font-mono">
                  {zone.name} • {zone.riskScore}%
                </div>
              </Tooltip>
              <Popup>{renderPopupContent()}</Popup>
            </Polygon>
          );
        }

        // Fallback to spatial circle
        return (
          <Circle
            key={zone.id}
            center={[zone.center.lat, zone.center.lng]}
            radius={(selectedRadiusKm || zone.radiusKm) * 1000}
            pathOptions={pathOptions}
            eventHandlers={{
              click: () => onZoneSelect && onZoneSelect(zone)
            }}
          >
            <Tooltip permanent={false} direction="center" className="custom-zone-tooltip">
              <div className="text-[10px] font-bold text-white px-1.5 py-0.5 rounded bg-cyber-950/90 border border-slate-700 font-mono">
                {zone.name}
              </div>
            </Tooltip>
            <Popup>{renderPopupContent()}</Popup>
          </Circle>
        );
      })}
    </>
  );
};
