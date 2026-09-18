import React, { useState, useEffect } from 'react';
import { ATMMap } from '../features/map/ATMMap';
import { RadiusFilter } from '../features/map/RadiusFilter';
import { RiskLegend } from '../features/map/RiskLegend';
import { MapPopupModal } from '../features/map/MapPopup';
import { Modal } from '../components/Modal';
import { ATM, Complaint, RiskZone, Prediction } from '../types';
import { predictionService } from '../services/predictionService';
import { complaintService } from '../services/complaintService';
import { websocketService } from '../services/websocketService';
import { MapPin, ShieldAlert, Layers } from 'lucide-react';

export const RiskMapPage: React.FC = () => {
  const [atms, setAtms] = useState<ATM[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [riskZones, setRiskZones] = useState<RiskZone[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [selectedRadiusKm, setSelectedRadiusKm] = useState<number>(1);
  const [showComplaints, setShowComplaints] = useState(true);
  const [showRiskZones, setShowRiskZones] = useState(true);
  const [selectedAtm, setSelectedAtm] = useState<ATM | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMapData() {
      try {
        const [atmData, cmpData, zoneData, predData] = await Promise.all([
          predictionService.getATMs(),
          complaintService.getComplaints(),
          predictionService.getRiskZones(),
          predictionService.getPredictions()
        ]);
        setAtms(atmData);
        setComplaints(cmpData);
        setRiskZones(zoneData);
        setPredictions(predData);
      } catch (err) {
        console.error('Failed to load map data', err);
      } finally {
        setLoading(false);
      }
    }
    loadMapData();
  }, []);

  const districts = Array.from(new Set(atms.map((a) => a.district)));

  const handleTriggerDemoAlert = (atmCode: string) => {
    websocketService.triggerManualDemoAlert(atmCode);
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-cyber-accent border-t-transparent animate-spin"></div>
        <span>Loading GIS Spatial Map & Layers...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 glass-panel p-4 rounded-xl border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-cyber-accent" />
            <span>Predictive Geospatial Risk Map</span>
          </h2>
          <p className="text-xs text-slate-400">Interactive spatial intelligence view showing 1 km / 3 km fraud hotspots & ATM risk pins.</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-cyber-850 text-xs font-mono font-semibold text-cyber-accent border border-slate-800">
            {atms.length} ATM Terminals Monitored
          </span>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left Col: Query Filters & Legend */}
        <div className="space-y-4">
          <RadiusFilter
            selectedRadiusKm={selectedRadiusKm}
            onRadiusChange={setSelectedRadiusKm}
            selectedDistrict={selectedDistrict}
            onDistrictChange={setSelectedDistrict}
            districts={districts}
            showComplaints={showComplaints}
            onToggleComplaints={() => setShowComplaints(!showComplaints)}
            showRiskZones={showRiskZones}
            onToggleRiskZones={() => setShowRiskZones(!showRiskZones)}
          />

          <RiskLegend />
        </div>

        {/* Right 3 Cols: Interactive Leaflet Map */}
        <div className="lg:col-span-3">
          <ATMMap
            atms={atms}
            complaints={showComplaints ? complaints : []}
            riskZones={showRiskZones ? riskZones : []}
            predictions={predictions}
            selectedDistrict={selectedDistrict}
            selectedRadiusKm={selectedRadiusKm}
            height="680px"
            onAtmSelect={(atm) => setSelectedAtm(atm)}
          />
        </div>
      </div>

      {/* Detailed ATM Intelligence Modal */}
      <Modal
        isOpen={selectedAtm !== null}
        onClose={() => setSelectedAtm(null)}
        title="GIS Intelligence & XGBoost Risk Factors"
        maxWidth="lg"
      >
        {selectedAtm && (
          <MapPopupModal
            atm={selectedAtm}
            prediction={predictions.find((p) => p.atmId === selectedAtm.id)}
            nearbyComplaints={complaints.filter((c) => c.district === selectedAtm.district)}
            onClose={() => setSelectedAtm(null)}
            onTriggerAlert={handleTriggerDemoAlert}
          />
        )}
      </Modal>
    </div>
  );
};
