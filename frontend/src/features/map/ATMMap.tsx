import React, { useMemo, useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { 
  ATM, 
  Complaint, 
  RiskZone, 
  Prediction, 
  Transaction, 
  BaseMapTile, 
  MapLayerVisibility 
} from '../../types';
import { RiskBadge } from '../../components/RiskBadge';
import { RiskHeatmapLayer, HeatmapPoint } from './RiskHeatmapLayer';
import { ZonePolygonsLayer } from './ZonePolygonsLayer';
import { MapControls } from './MapControls';
import { clusterPoints } from './MapClustering';
import { 
  MapPin, 
  ShieldAlert, 
  AlertTriangle, 
  ArrowRight, 
  Building2, 
  DollarSign, 
  CreditCard, 
  TrendingUp, 
  Activity, 
  Clock 
} from 'lucide-react';

interface ATMMapProps {
  atms: ATM[];
  complaints?: Complaint[];
  withdrawals?: Transaction[];
  predictions?: Prediction[];
  riskZones?: RiskZone[];
  layers?: MapLayerVisibility;
  selectedDistrict?: string;
  selectedBank?: string;
  selectedRiskLevel?: string;
  selectedCategory?: string;
  selectedRadiusKm?: number;
  heatmapOpacity?: number;
  center?: [number, number];
  zoom?: number;
  height?: string;
  onAtmSelect?: (atm: ATM) => void;
  onZoneSelect?: (zone: RiskZone) => void;
  onComplaintSelect?: (complaint: Complaint) => void;
  onWithdrawalSelect?: (txn: Transaction) => void;
}

const DEFAULT_LAYERS: MapLayerVisibility = {
  atms: true,
  complaints: true,
  withdrawals: true,
  predictions: true,
  heatmap: true,
  riskZones: true
};

export const ATMMap: React.FC<ATMMapProps> = ({
  atms,
  complaints = [],
  withdrawals = [],
  predictions = [],
  riskZones = [],
  layers = DEFAULT_LAYERS,
  selectedDistrict = 'ALL',
  selectedBank = 'ALL',
  selectedRiskLevel = 'ALL',
  selectedCategory = 'ALL',
  selectedRadiusKm = 1,
  heatmapOpacity = 0.65,
  center = [28.6139, 77.2090], // New Delhi core center
  zoom = 11,
  height = '680px',
  onAtmSelect,
  onZoneSelect,
  onComplaintSelect,
  onWithdrawalSelect
}) => {
  const [basemap, setBasemap] = useState<BaseMapTile>('dark');
  const [currentMapZoom, setCurrentMapZoom] = useState<number>(zoom);
  const mapRef = useRef<L.Map | null>(null);

  // Filtered ATMs
  const filteredAtms = useMemo(() => {
    return atms.filter((a) => {
      if (selectedDistrict !== 'ALL' && a.district && a.district.toLowerCase() !== selectedDistrict.toLowerCase()) {
        return false;
      }
      if (selectedBank !== 'ALL') {
        const bankMatch = (a.bankName && a.bankName.toLowerCase() === selectedBank.toLowerCase()) ||
                          (a.bankId && a.bankId.toLowerCase() === selectedBank.toLowerCase());
        if (!bankMatch) return false;
      }
      return true;
    });
  }, [atms, selectedDistrict, selectedBank]);

  // Filtered Complaints
  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      if (selectedDistrict !== 'ALL' && c.district && c.district.toLowerCase() !== selectedDistrict.toLowerCase()) {
        return false;
      }
      if (selectedCategory !== 'ALL') {
        const cat = (c.crimeCategory || '').toUpperCase();
        const sel = selectedCategory.toUpperCase();
        const match = cat === sel ||
                      (sel.includes('IDENTITY') && (cat.includes('IDENTITY') || cat.includes('THEFT'))) ||
                      (sel.includes('ATM') && (cat.includes('ATM') || cat.includes('WITHDRAWAL'))) ||
                      (sel.includes('PHISHING') && cat.includes('PHISHING')) ||
                      (sel.includes('MULE') && cat.includes('MULE'));
        if (!match) return false;
      }
      return true;
    });
  }, [complaints, selectedDistrict, selectedCategory]);

  // Filtered Withdrawals
  const filteredWithdrawals = useMemo(() => {
    return withdrawals.filter((w) => {
      if (selectedDistrict !== 'ALL') {
        const linkedAtm = atms.find((a) => a.id === w.atmId || a.atmCode === w.atmId);
        if (linkedAtm && linkedAtm.district && linkedAtm.district.toLowerCase() !== selectedDistrict.toLowerCase()) {
          return false;
        }
      }
      return true;
    });
  }, [withdrawals, atms, selectedDistrict]);

  // Prediction Map by ATM ID
  const predictionMap = useMemo(() => {
    const map = new Map<string, Prediction>();
    predictions.forEach((p) => map.set(p.atmId, p));
    return map;
  }, [predictions]);

  // Heatmap Weighted Points
  const heatmapPoints: HeatmapPoint[] = useMemo(() => {
    const pts: HeatmapPoint[] = [];

    // Complaints contribute heat weighted by fraud amount
    filteredComplaints.forEach((c) => {
      if (c?.location && typeof c.location.lat === 'number' && typeof c.location.lng === 'number') {
        const weight = Math.min(1.0, Math.max(0.3, (c.fraudAmount || 0) / 150000));
        pts.push({ lat: c.location.lat, lng: c.location.lng, weight });
      }
    });

    // High risk withdrawals contribute heat
    filteredWithdrawals.forEach((w) => {
      if (w?.location && typeof w.location.lat === 'number' && typeof w.location.lng === 'number') {
        const weight = Math.min(1.0, Math.max(0.4, (w.amount || 0) / 50000));
        pts.push({ lat: w.location.lat, lng: w.location.lng, weight });
      }
    });

    // AI predictions contribute intense heat
    predictions.forEach((p) => {
      const atm = atms.find((a) => a && (a.id === p.atmId || a.atmCode === p.atmId));
      if (atm?.location && typeof atm.location.lat === 'number' && typeof atm.location.lng === 'number') {
        pts.push({
          lat: atm.location.lat,
          lng: atm.location.lng,
          weight: Math.min(1.0, (p.riskScore || 0) / 100)
        });
      }
    });

    return pts;
  }, [filteredComplaints, filteredWithdrawals, predictions, atms]);

  // Spatial clustering for ATMs to optimize demo rendering volume
  const clusteredAtms = useMemo(() => {
    const clusterable = filteredAtms.map((a) => {
      const pred = predictionMap.get(a.id);
      const riskLevel = pred ? pred.riskLevel : (a.historicalHotspotScore && a.historicalHotspotScore > 80 ? 'CRITICAL' : 'LOW');
      return {
        ...a,
        riskLevel
      };
    });
    return clusterPoints(clusterable, currentMapZoom, 13);
  }, [filteredAtms, predictionMap, currentMapZoom]);

  // Basemap Tile URLs & styling configuration (Watermark-free)
  const { basemapUrl, tileClassName, attribution } = useMemo(() => {
    const cartoKey = import.meta.env.VITE_CARTO_API_KEY;
    const mapplsKey = import.meta.env.VITE_MAPPLS_API_KEY;

    switch (basemap) {
      case 'mappls': {
        if (mapplsKey) {
          return {
            basemapUrl: `https://apis.mappls.com/advancedmaps/v1/${mapplsKey}/still_map/{z}/{x}/{y}.png`,
            tileClassName: '',
            attribution: '&copy; <a href="https://www.mappls.com/">Mappls</a>'
          };
        }
        return {
          basemapUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          tileClassName: 'cyber-dark-tiles',
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        };
      }
      case 'tactical': {
        if (cartoKey) {
          return {
            basemapUrl: `https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png?key=${cartoKey}`,
            tileClassName: '',
            attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap contributors'
          };
        }
        return {
          basemapUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          tileClassName: 'cyber-tactical-tiles',
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        };
      }
      case 'satellite':
        return {
          basemapUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          tileClassName: '',
          attribution: '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        };
      case 'light':
        return {
          basemapUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          tileClassName: '',
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        };
      case 'dark':
      default: {
        if (cartoKey) {
          return {
            basemapUrl: `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png?key=${cartoKey}`,
            tileClassName: '',
            attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap contributors'
          };
        }
        return {
          basemapUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          tileClassName: 'cyber-dark-tiles',
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        };
      }
    }
  }, [basemap]);

  // Custom DivIcons for crisp SVG pins
  const createAtmMarkerIcon = (riskLevel: string, count = 1, isCluster = false) => {
    let colorClass = 'bg-emerald-500 border-emerald-300 text-white';
    let pulseClass = '';

    if (riskLevel === 'CRITICAL') {
      colorClass = 'bg-rose-500 border-rose-200 text-white';
      pulseClass = 'risk-pulse-critical';
    } else if (riskLevel === 'HIGH') {
      colorClass = 'bg-orange-500 border-orange-200 text-white';
    } else if (riskLevel === 'MEDIUM') {
      colorClass = 'bg-amber-500 border-amber-200 text-white';
    }

    if (isCluster) {
      return L.divIcon({
        className: 'custom-cluster-marker',
        html: `
          <div class="relative flex items-center justify-center w-10 h-10 rounded-full ${colorClass} border-2 font-mono font-bold text-xs shadow-2xl ${pulseClass}">
            <span>${count}</span>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -20]
      });
    }

    return L.divIcon({
      className: 'custom-atm-marker',
      html: `
        <div class="relative flex items-center justify-center w-8 h-8 rounded-full ${colorClass} border-2 shadow-xl ${pulseClass}">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M3 10h18"/><path d="M5 6h14"/><path d="M4 10v11"/><path d="M20 10v11"/><path d="M8 14v3"/><path d="M12 14v3"/><path d="M16 14v3"/></svg>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16]
    });
  };

  const createComplaintMarkerIcon = (category: string) => {
    return L.divIcon({
      className: 'custom-complaint-marker',
      html: `
        <div class="w-7 h-7 rounded-full bg-purple-600 border-2 border-purple-200 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      popupAnchor: [0, -14]
    });
  };

  const createWithdrawalMarkerIcon = (amount: number) => {
    return L.divIcon({
      className: 'custom-withdrawal-marker',
      html: `
        <div class="w-7 h-7 rounded-full bg-amber-500 border-2 border-amber-200 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      popupAnchor: [0, -14]
    });
  };

  const createPredictionHotspotIcon = (riskScore: number) => {
    return L.divIcon({
      className: 'custom-prediction-marker',
      html: `
        <div class="relative flex items-center justify-center w-8 h-8 rounded-full bg-rose-600 border-2 border-rose-300 text-white font-mono font-bold text-[10px] shadow-2xl risk-pulse-critical">
          <span>${riskScore}%</span>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16]
    });
  };

  // Auto-fit bounds handler
  const handleFitAllBounds = () => {
    if (!mapRef.current) return;
    const allCoords: [number, number][] = [];

    filteredAtms.forEach((a) => allCoords.push([a.location.lat, a.location.lng]));
    filteredComplaints.forEach((c) => allCoords.push([c.location.lat, c.location.lng]));
    filteredWithdrawals.forEach((w) => allCoords.push([w.location.lat, w.location.lng]));

    if (allCoords.length > 0) {
      const bounds = L.latLngBounds(allCoords);
      mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  };

  // Auto-center map when district filter changes
  useEffect(() => {
    if (!mapRef.current) return;
    if (selectedDistrict !== 'ALL' && filteredAtms.length > 0) {
      const coords: [number, number][] = filteredAtms
        .filter((a) => a?.location && typeof a.location.lat === 'number' && typeof a.location.lng === 'number')
        .map((a) => [a.location.lat, a.location.lng]);
      if (coords.length > 0) {
        const bounds = L.latLngBounds(coords);
        mapRef.current.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
      }
    }
  }, [selectedDistrict, filteredAtms]);

  // Dynamically sync theme class directly to Leaflet container DOM node
  useEffect(() => {
    if (!mapRef.current) return;
    const container = mapRef.current.getContainer();
    if (!container) return;
    container.classList.remove('map-dark-tiles', 'map-tactical-tiles');
    if (basemap === 'dark') {
      container.classList.add('map-dark-tiles');
    } else if (basemap === 'tactical') {
      container.classList.add('map-tactical-tiles');
    }
  }, [basemap]);

  return (
    <div style={{ height }} className={`w-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative z-10 ${basemap === 'dark' ? 'map-dark-tiles' : basemap === 'tactical' ? 'map-tactical-tiles' : ''}`}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className={`w-full h-full ${basemap === 'dark' ? 'map-dark-tiles' : basemap === 'tactical' ? 'map-tactical-tiles' : ''}`}
        ref={(instance) => {
          if (instance) {
            mapRef.current = instance;
            instance.on('zoomend', () => setCurrentMapZoom(instance.getZoom()));
          }
        }}
      >
        {/* Basemap Tile Layer */}
        <TileLayer
          key={`${basemap}-${tileClassName}`}
          attribution={attribution}
          url={basemapUrl}
          className={tileClassName}
        />

        {/* 1. Dynamic Canvas Risk Heatmap Layer */}
        {layers.heatmap && (
          <RiskHeatmapLayer
            points={heatmapPoints}
            opacity={heatmapOpacity}
            radius={36}
            visible={layers.heatmap}
          />
        )}

        {/* 2. Danger Zone Polygons Layer */}
        {layers.riskZones && (
          <ZonePolygonsLayer
            zones={riskZones}
            visible={layers.riskZones}
            selectedRadiusKm={selectedRadiusKm}
            onZoneSelect={onZoneSelect}
          />
        )}

        {/* 3. Prediction Layer (XGBoost Predictive Halos & Cones) */}
        {layers.predictions &&
          predictions.map((pred) => {
            const atm = atms.find((a) => a && (a.id === pred.atmId || a.atmCode === pred.atmId));
            if (!atm?.location || typeof atm.location.lat !== 'number' || typeof atm.location.lng !== 'number') return null;

            return (
              <React.Fragment key={pred.id}>
                {/* Prediction Horizon Circle */}
                <Circle
                  center={[atm.location.lat, atm.location.lng]}
                  radius={selectedRadiusKm * 1000}
                  pathOptions={{
                    color: '#EF4444',
                    fillColor: '#EF4444',
                    fillOpacity: 0.15,
                    weight: 2,
                    dashArray: '4, 4'
                  }}
                />

                {/* Prediction Center Marker */}
                <Marker
                  position={[atm.location.lat, atm.location.lng]}
                  icon={createPredictionHotspotIcon(pred.riskScore || 0)}
                  eventHandlers={{
                    click: () => onAtmSelect && onAtmSelect(atm)
                  }}
                >
                  <Popup>
                    <div className="p-2 space-y-1.5 text-xs text-slate-200 max-w-xs">
                      <div className="flex items-center justify-between gap-2 border-b border-slate-700 pb-1">
                        <span className="font-bold text-white font-mono">PREDICTION HOTSPOT</span>
                        <RiskBadge level={pred.riskLevel} score={pred.riskScore} size="sm" />
                      </div>
                      <p className="text-[11px] text-slate-300">
                        Target: <strong className="text-white">{atm.bankName}</strong> ({atm.atmCode})
                      </p>
                      <p className="text-[10px] text-emerald-400 font-mono">
                        Model Confidence: {((pred.confidence ?? 0.9) * 100).toFixed(1)}% (xgb-v1.4)
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Forecast Horizon: {selectedRadiusKm} km query perimeter
                      </p>
                      <button
                        type="button"
                        onClick={() => onAtmSelect && onAtmSelect(atm)}
                        className="w-full mt-1 py-1 rounded bg-cyber-accent/20 hover:bg-cyber-accent/30 text-cyber-accent font-semibold text-[11px] flex items-center justify-center gap-1 border border-cyber-accent/30"
                      >
                        <span>Open Intelligence Panel</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            );
          })}

        {/* 4. Suspicious Withdrawal Layer */}
        {layers.withdrawals &&
          filteredWithdrawals
            .filter((txn) => txn?.location && typeof txn.location.lat === 'number' && typeof txn.location.lng === 'number')
            .map((txn) => (
              <Marker
                key={txn.id}
                position={[txn.location.lat, txn.location.lng]}
                icon={createWithdrawalMarkerIcon(txn.amount || 0)}
                eventHandlers={{
                  click: () => onWithdrawalSelect && onWithdrawalSelect(txn)
                }}
              >
                <Popup>
                  <div className="p-2 space-y-1 text-xs text-slate-200">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                      Suspicious Cash-Out Spike
                    </span>
                    <p className="font-bold text-white mt-1 font-mono">{txn.transactionReference}</p>
                    <p className="text-rose-400 font-mono font-bold text-sm">
                      Amount: ₹{(txn.amount || 0).toLocaleString('en-IN')}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Time: {txn.transactionTime ? new Date(txn.transactionTime).toLocaleTimeString() : 'N/A'}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Account: {txn.accountId}
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}

        {/* 5. NCRP Complaint Markers */}
        {layers.complaints &&
          filteredComplaints
            .filter((cmp) => cmp?.location && typeof cmp.location.lat === 'number' && typeof cmp.location.lng === 'number')
            .map((cmp) => (
              <Marker
                key={cmp.id}
                position={[cmp.location.lat, cmp.location.lng]}
                icon={createComplaintMarkerIcon(cmp.crimeCategory)}
                eventHandlers={{
                  click: () => onComplaintSelect && onComplaintSelect(cmp)
                }}
              >
                <Popup>
                  <div className="p-2 space-y-1 text-xs text-slate-200">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                      NCRP Crime Incident
                    </span>
                    <p className="font-bold text-white mt-1 font-mono">{cmp.complaintNumber}</p>
                    <p className="text-[11px] text-slate-300">{(cmp.crimeCategory || 'INCIDENT').replace(/_/g, ' ')}</p>
                    <p className="text-[11px] text-emerald-400 font-mono font-semibold">
                      Loss: ₹{(cmp.fraudAmount || 0).toLocaleString('en-IN')}
                    </p>
                    <p className="text-[10px] text-slate-400">{cmp.policeStation} ({cmp.district})</p>
                  </div>
                </Popup>
              </Marker>
            ))}

        {/* 6. ATM Layer (with Clustering Optimization) */}
        {layers.atms &&
          clusteredAtms.map((cluster) => {
            if (cluster.isCluster) {
              return (
                <Marker
                  key={cluster.id}
                  position={[cluster.lat, cluster.lng]}
                  icon={createAtmMarkerIcon(cluster.highestRisk, cluster.count, true)}
                  eventHandlers={{
                    click: () => {
                      if (mapRef.current) {
                        mapRef.current.flyTo([cluster.lat, cluster.lng], currentMapZoom + 2, { duration: 0.8 });
                      }
                    }
                  }}
                >
                  <Popup>
                    <div className="p-2 space-y-1 text-xs text-slate-200">
                      <p className="font-bold text-white">{cluster.count} ATMs in Cluster</p>
                      <p className="text-[11px] text-slate-400">Highest Threat Level: <strong className="text-white">{cluster.highestRisk}</strong></p>
                      <p className="text-[10px] text-cyber-accent">Click to zoom into cluster terminals</p>
                    </div>
                  </Popup>
                </Marker>
              );
            }

            const atm = cluster.points[0];
            if (!atm?.location || typeof atm.location.lat !== 'number' || typeof atm.location.lng !== 'number') return null;
            const pred = predictionMap.get(atm.id) || predictionMap.get(atm.atmCode);
            const riskLevel = pred ? pred.riskLevel : (atm.historicalHotspotScore && atm.historicalHotspotScore > 80 ? 'CRITICAL' : 'LOW');
            const riskScore = pred ? pred.riskScore : (atm.historicalHotspotScore || 30);

            return (
              <Marker
                key={atm.id}
                position={[atm.location.lat, atm.location.lng]}
                icon={createAtmMarkerIcon(riskLevel, 1, false)}
                eventHandlers={{
                  click: () => {
                    if (onAtmSelect) onAtmSelect(atm);
                  }
                }}
              >
                <Popup>
                  <div className="p-2.5 space-y-2 text-xs text-slate-200 max-w-xs">
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

                    <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800 pt-1">
                      <span>Type: <strong className="text-white">{atm.atmType}</strong></span>
                      <span>Radius: <strong className="text-cyber-accent font-mono">{selectedRadiusKm} km</strong></span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onAtmSelect && onAtmSelect(atm)}
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

        {/* Tactical HUD & Basemap Switcher Controls */}
        <MapControls
          currentBasemap={basemap}
          onBasemapChange={setBasemap}
          onFitAllBounds={handleFitAllBounds}
        />
      </MapContainer>
    </div>
  );
};
