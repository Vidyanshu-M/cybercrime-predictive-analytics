import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Case, Evidence } from '../types';
import { caseService } from '../services/caseService';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { Briefcase, ArrowLeft, FileText, Upload, HardDrive, Link, ShieldCheck, CheckCircle } from 'lucide-react';

export const CaseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [caseItem, setCaseItem] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState('application/pdf');

  const navigate = useNavigate();

  useEffect(() => {
    async function loadCase() {
      if (!id) return;
      try {
        const data = await caseService.getCaseById(id);
        setCaseItem(data);
      } catch (err) {
        console.error('Failed to load case details', err);
      } finally {
        setLoading(false);
      }
    }
    loadCase();
  }, [id]);

  const handleEvidenceUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseItem) return;
    try {
      const newEvd = await caseService.addEvidence(caseItem.id, {
        fileName,
        fileType
      });
      setCaseItem((prev) => prev ? {
        ...prev,
        evidenceCount: prev.evidenceCount + 1,
        evidenceList: [...(prev.evidenceList || []), newEvd]
      } : null);
      setUploadModalOpen(false);
      setFileName('');
    } catch (err) {
      console.error('Failed to upload evidence', err);
    }
  };

  if (loading || !caseItem) {
    return <div className="py-20 text-center text-slate-400 text-xs">Loading case file...</div>;
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/cases')}
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Cases Hub</span>
      </button>

      {/* Case Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-cyber-accent/15 text-cyber-accent border border-cyber-accent/30">
                {caseItem.caseNumber}
              </span>
              <StatusBadge status={caseItem.status} />
            </div>
            <h2 className="text-xl font-bold text-white mt-1">{caseItem.title}</h2>
          </div>

          <button
            onClick={() => setUploadModalOpen(true)}
            className="py-2 px-4 rounded-xl bg-cyber-accent text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Evidence</span>
          </button>
        </div>

        <p className="text-xs text-slate-300">{caseItem.summary}</p>
      </div>

      {/* Evidence Files List */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-cyber-accent" />
          <span>Case Evidence Files & Cryptographic Hashes</span>
        </h3>

        {caseItem.evidenceList && caseItem.evidenceList.length > 0 ? (
          <div className="space-y-2">
            {caseItem.evidenceList.map((evd) => (
              <div key={evd.id} className="glass-card p-3 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-cyber-accent shrink-0" />
                  <div>
                    <p className="font-semibold text-white">{evd.fileName}</p>
                    <p className="text-[10px] text-slate-400 font-mono truncate max-w-md">SHA256: {evd.hash}</p>
                  </div>
                </div>

                <div className="text-right text-[10px]">
                  <p className="text-purple-400 font-medium">Uploaded by {evd.uploadedBy}</p>
                  <p className="text-slate-400">{new Date(evd.uploadedAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400">No evidence artifacts uploaded yet.</p>
        )}
      </div>

      {/* Evidence Upload Modal */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="Register Case Evidence Artifact"
        maxWidth="md"
      >
        <form onSubmit={handleEvidenceUpload} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              File Name / Descriptor
            </label>
            <input
              type="text"
              required
              placeholder="e.g. ATM1023_CCTV_Footage_0610AM.mp4"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-cyber-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyber-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Artifact Type
            </label>
            <select
              value={fileType}
              onChange={(e) => setFileType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-cyber-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyber-accent"
            >
              <option value="video/mp4">CCTV Video Footage (.mp4)</option>
              <option value="application/pdf">NCRP Audit Report (.pdf)</option>
              <option value="image/jpeg">ATM Terminal Snapshot (.jpg)</option>
              <option value="text/csv">Transaction Logs (.csv)</option>
            </select>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setUploadModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-cyber-accent text-slate-950 font-bold text-xs uppercase tracking-wider"
            >
              Register Artifact
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
