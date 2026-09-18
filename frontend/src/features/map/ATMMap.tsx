import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { ATM, Complaint, RiskZone, Prediction } from '../../types';
import { RiskBadge } from '../../components/RiskBadge';
import { MapPin, ShieldAlert, AlertTriangle, ArrowRight, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ATMMapProps {
  atms: ATM[];
  complaints?: Complaint[];
  riskZones?: RiskZone[];
  predictions?: Prediction[];
  selectedDistrict?: string;
  selectedRadiusKm?: number;
  center?: [number, number];
  zoom?: number;
  height?: string;
  onAtmSelect?: (atm: ATM) => void;
}

export const ATMMap: React.FC<ATMMapProps> = ({
  atms,
  complaints = [],
  riskZones = [],
  predictions = [],
  selectedDistrict,
  selectedRadiusKm = 1,
  center = [28.6139, 77.2090], // Default New Delhi center
  zoom = 11,
  height = '600px',
  onAtmSelect
}) => {
  const navigate = useNavigate();

  // Filter ATMs by district if selected
  const filteredAtms = useMemo(() => {
    if (!selectedDistrict || selectedDistrict === 'ALL') return atms;
    return atms.filter((a) => a.district.toLowerCase() === selectedDistrict.toLowerCase());
  }, [atms, selectedDistrict]);

  // Map predictions by ATM ID
  const predictionMap = useMemo(() => {
    const map = new Map<string, Prediction>();
    predictions.forEach((p) => map.set(p.atmId, p));
    return map;
  }, [predictions]);

  // Create custom DivIcons for pins to avoid broken Leaflet PNG assets
  const createAtmIcon = (riskLevel: string, isCritical: boolean) => {
    let colorClass = 'bg-emerald-500 border-emerald-300';
    let glowClass = '';

    if (riskLevel === 'CRITICAL') {
      colorClass = 'bg-rose-500 border-rose-200';
      glowClass = 'risk-pulse-critical';
    } else if (riskLevel === 'HIGH') {
      colorClass = 'bg-orange-500 border-orange-200';
    } else if (riskLevel === 'MEDIUM') {
      colorClass = 'bg-amber-500 border-amber-200';
    }

    return L.divIcon({
      className: 'custom-leaflet-marker',
      html: `
        <div class="relative flex items-center justify-center w-8 h-8 rounded-full ${colorClass} border-2 text-white shadow-xl ${glowClass}">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M3 10h18"/><path d="M5 6h14"/><path d="M4 10v11"/><path d="M20 10v11"/><path d="M8 14v3"/><path d="M12 14v3"/><path d="M16 14v3"/></svg>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16]
    });
  };

  const createComplaintIcon = () => {
    return L.divIcon({
      className: 'custom-complaint-marker',
      html: `
        <div class="w-6 h-6 rounded-full bg-purple-600 border-2 border-purple-200 text-white flex items-center justify-center shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      popupAnchor: [0, -12]
    });
  };

  return (
    <div style={{ height }} className="w-full rounded-2xl overflow-hidden border border-slate-800/80 shadow-2xl relative z-10">
      <MapContainer 
        center={center} 
        zoom={zoom} 
        scrollWheelZoom={true} 
        className="w-full h-full"
      >
        {/* Dark CartoDB Map Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* Spatial Risk Zone Polygons / Radius Circles */}
        {riskZones.map((zone) => {
          const color = zone.riskLevel === 'CRITICAL' ? '#EF4444' : zone.riskLevel === 'HIGH' ? '#F97316' : '#F59E0B';
          return (
            <Circle
              key={zone.id}
              center={[zone.center.lat, zone.center.lng]}
              radius={(selectedRadiusKm || zone.radiusKm) * 1000}
              pathOptions={{
                color,
                fillColor: color,
                fillOpacity: 0.2,
                weight: 2,
                dashArray: zone.riskLevel === 'CRITICAL' ? '4, 4' : undefined
              }}
            >
              <Popup>
                <div className="p-2 space-y-1.5 text-xs text-slate-200">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-white text-sm">{zone.name}</span>
                    <RiskBadge level={zone.riskLevel} score={zone.riskScore} size="sm" />
                  </div>
                  <p className="text-[11px] text-slate-400">Fraud Query Radius: {selectedRadiusKm || zone.radiusKm} km</p>
                  <div className="pt-1 text-[11px] grid grid-cols-2 gap-2 border-t border-slate-700">
                    <div>Complaints: <strong className="text-white">{zone.complaintCount}</strong></div>
                    <div>ATMs: <strong className="text-white">{zone.atmCount}</strong></div>
                  </div>
                </div>
              </Popup>
            </Circle>
          );
        })}

        {/* Complaint Markers */}
        {complaints.map((cmp) => (
          <Marker
            key={cmp.id}
            position={[cmp.location.lat, cmp.location.lng]}
            icon={createComplaintIcon()}
          >
            <Popup>
              <div className="p-2 space-y-1 text-xs text-slate-200">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                  NCRP Complaint
                </span>
                <p className="font-bold text-white mt-1">{cmp.complaintNumber}</p>
                <p className="text-[11px] text-slate-300">{cmp.crimeCategory.replace(/_/g, ' ')}</p>
                <p className="text-[11px] text-emerald-400 font-mono font-semibold">
                  Amount: ₹{cmp.fraudAmount.toLocaleString('en-IN')}
                </p>
                <p className="text-[10px] text-slate-400">{cmp.policeStation} ({cmp.district})</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* ATM Markers */}
        {filteredAtms.map((atm) => {
          const pred = predictionMap.get(atm.id);
          const riskLevel = pred ? pred.riskLevel : (atm.historicalHotspotScore && atm.historicalHotspotScore > 80 ? 'CRITICAL' : 'LOW');
          const riskScore = pred ? pred.riskScore : (atm.historicalHotspotScore || 30);

          return (
            <Marker
              key={atm.id}
              position={[atm.location.lat, atm.location.lng]}
              icon={createAtmIcon(riskLevel, riskLevel === 'CRITICAL')}
              eventHandlers={{
                click: () => {
                  if (onAtmSelect) onAtmSelect(atm);
                }
              }}
            >
              <Popup>
                <div className="p-2 space-y-2 text-xs text-slate-200 max-w-xs">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-700 pb-1.5">
                    <div>
                      <h4 className="font-bold text-white text-sm leading-tight">{atm.bankName}</h4>
                      <p className="text-[10px] font-mono text-cyber-accent">{atm.atmCode}</p>
                    </div>
                    <RiskBadge level={riskLevel} score={riskScore} size="sm" />
                  </div>

                  <p className="text-[11px] text-slate-300 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{atm.area}, {atm.district}</span>
                  </p>

                  {pred && pred.reasons && pred.reasons.length > 0 && (
                    <div className="bg-cyber-850 p-2 rounded-lg border border-slate-800 text-[10px] space-y-1">
                      <p className="font-semibold text-cyber-accent uppercase">XGBoost Contributing Factors:</p>
                      <ul className="list-disc pl-3 text-slate-300 space-y-0.5">
                        {pred.reasons.slice(0, 2).map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <button
                    onClick={() => navigate(`/risk-map?atmId=${atm.id}`)}
                    className="w-full py-1.5 rounded bg-cyber-accent/20 hover:bg-cyber-accent/30 text-cyber-accent font-semibold text-[11px] flex items-center justify-center gap-1 transition-colors border border-cyber-accent/30"
                  >
                    <span>View GIS Intelligence</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
