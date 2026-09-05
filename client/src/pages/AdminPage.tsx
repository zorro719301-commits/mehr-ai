import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import {
  Shield,
  Plus,
  Edit,
  Trash2,
  Activity,
  Users,
  Database,
  Terminal,
  CheckCircle2,
  Clock
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [conditions, setConditions] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [aiLogs, setAiLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New condition modal
  const [isAddConditionOpen, setIsAddConditionOpen] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newSymptoms, setNewSymptoms] = useState('');
  const [newSpecialists, setNewSpecialists] = useState('LOGOPED,PSIXOLOG,NEVROLOG');

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [mRes, cRes, aRes, aiRes] = await Promise.all([
        api.get('/api/admin/metrics'),
        api.get('/api/admin/conditions'),
        api.get('/api/admin/audit-logs'),
        api.get('/api/admin/ai-logs'),
      ]);

      if (mRes.success) setMetrics(mRes.data);
      if (cRes.success) setConditions(cRes.data);
      if (aRes.success) setAuditLogs(aRes.data);
      if (aiRes.success) setAiLogs(aiRes.data);
    } catch (e) {
      console.error('Failed to load admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCondition = async () => {
    if (!newCode || !newName || !newDesc) return;
    try {
      const res = await api.post('/api/admin/conditions', {
        code: newCode,
        name: newName,
        description: newDesc,
        symptoms: newSymptoms,
        recommendedSpecialists: newSpecialists,
      });

      if (res.success) {
        setIsAddConditionOpen(false);
        setNewCode('');
        setNewName('');
        setNewDesc('');
        setNewSymptoms('');
        loadAdminData();
      }
    } catch (e) {
      console.error('Error creating condition:', e);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <span>MEHR AI Boshqaruv Markazi</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 font-bold border border-purple-200">
              Administrator
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Kasalliklar katalogi, AI prompt versiyalari, foydalanuvchilar va xavfsizlik auditi.
          </p>
        </div>

        <button
          onClick={() => setIsAddConditionOpen(true)}
          className="px-5 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-card flex items-center space-x-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Yangi kasallik / holat qo‘shish</span>
        </button>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-soft space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Foydalanuvchilar</span>
          <div className="text-3xl font-black text-slate-900">
            {metrics?.totalUsers || 6}
          </div>
          <p className="text-xs text-slate-500">Ota-onalar va mutaxassislar</p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-soft space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Jami Bolalar</span>
          <div className="text-3xl font-black text-brand-600">
            {metrics?.totalChildren || 3}
          </div>
          <p className="text-xs text-slate-500">Profil ochilgan</p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-soft space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Mashqlar Bazasi</span>
          <div className="text-3xl font-black text-emerald-600">
            {metrics?.totalExercises || 25}+
          </div>
          <p className="text-xs text-slate-500">Klinik mashg‘ulotlar</p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-soft space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">AAC Kartochkalar</span>
          <div className="text-3xl font-black text-purple-600">
            {metrics?.totalAacCards || 22}+
          </div>
          <p className="text-xs text-slate-500">Ovozli piktogrammalar</p>
        </div>
      </div>

      {/* Dynamic Kasalliklar va Rivojlanish Holatlari Katalogi (CRUD) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Kasalliklar va Rivojlanish Holatlari Katalogi (Dinamik CRUD)
            </h3>
            <p className="text-xs text-slate-500">
              Kod ichida qotirilmagan, admin tomonidan yangilanadigan katalog.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {conditions.map((c) => (
            <div
              key={c.id}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold px-2 py-0.5 bg-brand-50 text-brand-700 rounded-md border border-brand-200">
                    {c.code}
                  </span>
                  <h4 className="font-extrabold text-sm text-slate-900">{c.name}</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{c.description}</p>
                <div className="text-[11px] text-slate-500 flex flex-wrap gap-2 pt-1">
                  <span>Mutaxassislar: <strong className="text-slate-700">{c.recommendedSpecialists}</strong></span>
                  <span>•</span>
                  <span>Davomiyligi: <strong className="text-slate-700">{c.defaultDurationDays} kun</strong></span>
                </div>
              </div>

              <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                Faol
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Security Audit Logs */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-600" />
            <span>Xavfsizlik va Amallar Auditi (Audit Logs)</span>
          </h3>
          <span className="text-xs text-slate-400">So‘nggi 50 ta amal</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase">
                <th className="py-2">Vaqt</th>
                <th className="py-2">Foydalanuvchi</th>
                <th className="py-2">Amal</th>
                <th className="py-2">Obyekt</th>
                <th className="py-2">IP Manzil</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {auditLogs.slice(0, 10).map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="py-2.5 text-slate-500">{new Date(log.createdAt).toLocaleTimeString()}</td>
                  <td className="py-2.5 font-bold text-slate-800">{log.user?.fullName || 'Anonim'}</td>
                  <td className="py-2.5 text-brand-600 font-bold">{log.action}</td>
                  <td className="py-2.5 text-slate-600">{log.entity}</td>
                  <td className="py-2.5 text-slate-400 font-mono">{log.ipAddress || '127.0.0.1'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD CONDITION MODAL */}
      {isAddConditionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-lg text-slate-900">Yangi Kasallik / Rivojlanish Holatini Qo‘shish</h3>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Holat kodi (masalan: SENSORY_PROCESSING) *</label>
              <input
                type="text"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:bg-white focus:border-brand-500 uppercase"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                placeholder="SPD"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Nomi *</label>
              <input
                type="text"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:bg-white focus:border-brand-500"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Sensor Integratsiya Buzilishi"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Tavsif *</label>
              <textarea
                rows={2}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:bg-white focus:border-brand-500"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Tashqi sensor stimullarga nisbatan giper- yoki giposezgirlik..."
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Simptomlar va xususiyatlar</label>
              <textarea
                rows={2}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:bg-white focus:border-brand-500"
                value={newSymptoms}
                onChange={(e) => setNewSymptoms(e.target.value)}
                placeholder="Tegishga qarshilik, shovqindan qo‘rqish..."
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Tavsiya etilgan mutaxassislar (vergul bilan)</label>
              <input
                type="text"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:bg-white focus:border-brand-500"
                value={newSpecialists}
                onChange={(e) => setNewSpecialists(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsAddConditionOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleCreateCondition}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-brand-600 text-white hover:bg-brand-700 shadow-sm"
              >
                Katalogga kiritish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
