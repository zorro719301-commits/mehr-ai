import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import {
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Check,
  X,
  Edit,
  Shield,
  MessageSquare,
  Pill,
  Plus,
  Activity,
  Stethoscope
} from 'lucide-react';
import { clinicalStore, StoredChild, MedicationOrder } from '../services/clinicalStore.js';
import { DoctorMedicationPrescriptionModal } from '../components/DoctorMedicationPrescriptionModal.js';

export const SpecialistDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Review modal
  const [selectedPkg, setSelectedPkg] = useState<any>(null);
  const [comments, setComments] = useState('');
  const [reviewStatus, setReviewStatus] = useState<'APPROVED' | 'MODIFIED' | 'REJECTED'>('APPROVED');
  const [submitting, setSubmitting] = useState(false);

  // Doctor prescription modal
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [selectedChildForMed, setSelectedChildForMed] = useState<string>('child-madina');
  const [childrenList, setChildrenList] = useState<StoredChild[]>([]);

  useEffect(() => {
    loadDashboard();
    const children = clinicalStore.getChildren();
    setChildrenList(children);
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/specialist/dashboard');
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (e) {
      console.error('Specialist dashboard load failed:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async () => {
    if (!selectedPkg) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/api/packages/${selectedPkg.id}/review`, {
        status: reviewStatus,
        comments,
      });
      if (res.success) {
        setSelectedPkg(null);
        setComments('');
        loadDashboard();
      }
    } catch (e) {
      console.error('Review submit error:', e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <span>Mutaxassis Klinik Paneli</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
              Shifokor / Reabilitolog
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Xush kelibsiz, {user?.fullName || 'Dr. Nodira Rahimova'}. Reabilitatsiya dasturlari va dori monitoringi (Medication Adherence) markazi.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedChildForMed(childrenList[0]?.id || 'child-madina');
            setIsPrescriptionModalOpen(true);
          }}
          className="px-5 py-3 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-card flex items-center space-x-2 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Yangi Dori Retsepti Kiritish</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-soft space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Jami Bolalar</span>
          <div className="text-3xl font-black text-slate-900">
            {childrenList.length || 4}
          </div>
          <p className="text-xs text-slate-500">MKB-10 F70/G80/F71/F84/H90.3</p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-soft space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Tasdiq Kutilmoqda</span>
          <div className="text-3xl font-black text-amber-600">
            {data?.metrics?.pendingPackages || 0}
          </div>
          <p className="text-xs text-slate-500">AI rejalari mutaxassis ko‘rigida</p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-soft space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Faol Dorilar</span>
          <div className="text-3xl font-black text-primary-600">
            3 ta
          </div>
          <p className="text-xs text-slate-500">Shifokor nazoratida</p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-soft space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Adherence Ko‘rsatkichi</span>
          <div className="text-3xl font-black text-emerald-600">
            92%
          </div>
          <p className="text-xs text-slate-500">O‘rtacha dori qabul intizomi</p>
        </div>
      </div>

      {/* Children Clinical Dossier & Medication Management */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-primary-600" />
              <span>Biriktirilgan Bolalar va Funksional Holat (GMFCS, MACS, CFCS)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Har bir bolaning klinik holati, buyurilgan dori vositalari va rioya qilish darajasi
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {childrenList.map((ch) => {
            const meds = clinicalStore.getMedications(ch.id);
            const adherence = clinicalStore.calculateAdherenceScore(ch.id);
            return (
              <div key={ch.id} className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start space-x-3">
                  <img
                    src={ch.photoUrl}
                    alt={ch.firstName}
                    className="w-12 h-12 rounded-xl object-cover ring-2 ring-primary-100"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-slate-900 text-sm">{ch.firstName} {ch.lastName}</h4>
                      <span className="text-[11px] text-slate-500">({ch.region})</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {ch.medicalProfile?.doctorConclusions || ch.chiefComplaint}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                        GMFCS {ch.gmfcsLevel || 'III'}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-200">
                        MACS {ch.macsLevel || 'III'}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                        CFCS {ch.cfcsLevel || 'III'}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200">
                        Adherence: {adherence.scorePercent}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0 self-end md:self-auto">
                  <span className="text-xs text-slate-500 font-medium mr-2">
                    {meds.length} ta faol dori
                  </span>
                  <button
                    onClick={() => {
                      setSelectedChildForMed(ch.id);
                      setIsPrescriptionModalOpen(true);
                    }}
                    className="px-3 py-1.5 bg-primary-50 text-primary-700 hover:bg-primary-100 rounded-xl text-xs font-bold border border-primary-200 transition-colors flex items-center"
                  >
                    <Pill className="w-3.5 h-3.5 mr-1" />
                    Dori yozish
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pending Packages Review Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Ko‘rib Chiqish Kutilayotgan AI Individual Paketlar
            </h3>
            <p className="text-xs text-slate-500">
              AI yaratgan reabilitatsiya dasturlarini klinik ekspertiza qilish
            </p>
          </div>
        </div>

        {data?.pendingReviews && data.pendingReviews.length > 0 ? (
          <div className="space-y-4">
            {data.pendingReviews.map((pkg: any) => (
              <div
                key={pkg.id}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 hover:border-brand-300 transition-all"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-base">{pkg.title}</h4>
                    <span className="text-xs text-slate-500 font-medium">
                      Bola: {pkg.child?.firstName} {pkg.child?.lastName} ({pkg.child?.region})
                    </span>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                    Holati: Ko‘rikda
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {pkg.summary}
                </p>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => {
                      setSelectedPkg(pkg);
                      setReviewStatus('APPROVED');
                      setComments('Reja bolaning yosh va rivojlanish xususiyatlariga to‘liq mos keladi.');
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center space-x-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Tasdiqlash / Xulosa berish</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400 text-sm">
            Hozirda kutilayotgan yangi paketlar mavjud emas. Barcha dasturlar tasdiqlangan.
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedPkg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-lg text-slate-900">
              Klinik Qaror: {selectedPkg.title}
            </h3>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase">Qaror turi:</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'APPROVED', label: 'Tasdiqlash' },
                  { key: 'MODIFIED', label: 'O‘zgartirish' },
                  { key: 'REJECTED', label: 'Rad etish' },
                ].map((st) => (
                  <button
                    key={st.key}
                    type="button"
                    onClick={() => setReviewStatus(st.key as any)}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      reviewStatus === st.key
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase">
                Mutaxassis izohi va klinik tavsiyasi:
              </label>
              <textarea
                rows={3}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:bg-white focus:border-brand-500"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedPkg(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleReviewSubmit}
                disabled={submitting}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
              >
                {submitting ? 'Yuborilmoqda...' : 'Xulosani tasdiqlash'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prescription Modal */}
      <DoctorMedicationPrescriptionModal
        childId={selectedChildForMed}
        isOpen={isPrescriptionModalOpen}
        onClose={() => setIsPrescriptionModalOpen(false)}
        onSaved={() => {
          setChildrenList([...clinicalStore.getChildren()]);
        }}
      />
    </div>
  );
};
