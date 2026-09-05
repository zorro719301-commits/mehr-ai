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
  MessageSquare
} from 'lucide-react';

export const SpecialistDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Review modal
  const [selectedPkg, setSelectedPkg] = useState<any>(null);
  const [comments, setComments] = useState('');
  const [reviewStatus, setReviewStatus] = useState<'APPROVED' | 'MODIFIED' | 'REJECTED'>('APPROVED');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadDashboard();
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
            Xush kelibsiz, {user?.fullName}. AI yaratgan individual rejalarni ko‘rib chiqish va tasdiqlash markazi.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-soft space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Jami Bolalar</span>
          <div className="text-3xl font-black text-slate-900">
            {data?.metrics?.totalChildren || 3}
          </div>
          <p className="text-xs text-slate-500">Platformada ro‘yxatdan o‘tgan</p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-soft space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Tasdiq Kutilmoqda</span>
          <div className="text-3xl font-black text-amber-600">
            {data?.metrics?.pendingPackages || 0}
          </div>
          <p className="text-xs text-slate-500">AI rejalari mutaxassis ko‘rigida</p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-soft space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">So‘nggi Baholashlar</span>
          <div className="text-3xl font-black text-brand-600">
            {data?.metrics?.recentAssessments || 1}
          </div>
          <p className="text-xs text-slate-500">Yangi to‘ldirilgan anketalar</p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-soft space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Xavf Belgilari</span>
          <div className="text-3xl font-black text-emerald-600">
            0 ta
          </div>
          <p className="text-xs text-slate-500">Barqaror holatda</p>
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
          <div className="text-center py-12 text-slate-400 text-sm">
            Hozirda kutilayotgan tasdiqlar mavjud emas. Barcha rejalar klinik tasdiqlangan.
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
    </div>
  );
};
