import React, { useState } from 'react';
import { Pill, ShieldCheck, X, Plus, AlertCircle, Save, CheckCircle } from 'lucide-react';
import { clinicalStore, MedicationOrder, MedicationStatus } from '../services/clinicalStore';

interface DoctorMedicationPrescriptionModalProps {
  childId: string;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const DoctorMedicationPrescriptionModal: React.FC<DoctorMedicationPrescriptionModalProps> = ({
  childId,
  isOpen,
  onClose,
  onSaved
}) => {
  const [formData, setFormData] = useState<Partial<MedicationOrder>>({
    name: '',
    activeIngredient: '',
    form: 'tablets',
    dosage: '',
    concentration: '',
    route: 'Og‘iz orqali (per os)',
    frequency: 'Kuniga 2 marta',
    scheduledTimes: ['08:30', '19:30'],
    foodRelation: 'Ovqatdan so‘ng',
    courseDurationDays: 30,
    purpose: '',
    instructions: '',
    prescribingDoctorName: 'Dr. Nodira Rahimova',
    specialty: 'Bolalar nevrologi',
    status: 'ACTIVE',
    requiresDoubleApproval: true,
  });

  const [timeInput, setTimeInput] = useState('08:30, 19:30');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const times = timeInput.split(',').map(t => t.trim()).filter(Boolean);

    clinicalStore.addMedication(childId, {
      ...formData,
      scheduledTimes: times.length > 0 ? times : ['09:00'],
      startDate: new Date().toISOString().split('T')[0],
    });

    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-primary-100 text-primary-700 flex items-center justify-center">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Mutaxassis Dori Buyurtmasi (Medication Order)
              </h3>
              <p className="text-xs text-slate-500">
                Shifokor tomonidan kiritiladigan klinik tasdiqlangan dori rejasi
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-4 text-xs pr-1">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Dori savdo nomi (Brand Name)*:</label>
              <input
                type="text"
                required
                placeholder="Masalan: Baklofen (Lioresal)"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Faol modda (Active Ingredient):</label>
              <input
                type="text"
                placeholder="Masalan: Baclofenum"
                value={formData.activeIngredient}
                onChange={e => setFormData({ ...formData, activeIngredient: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Dori shakli:</label>
              <select
                value={formData.form}
                onChange={e => setFormData({ ...formData, form: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="tablets">Tabletka</option>
                <option value="syrup">Sirop / Suspenziya</option>
                <option value="drops">Tomchilar</option>
                <option value="capsules">Kapsula</option>
                <option value="injection">Inyeksiya</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Bir martalik doza*:</label>
              <input
                type="text"
                required
                placeholder="Masalan: 5 mg yoki 2.5 ml"
                value={formData.dosage}
                onChange={e => setFormData({ ...formData, dosage: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Kurs muddati (kun):</label>
              <input
                type="number"
                value={formData.courseDurationDays}
                onChange={e => setFormData({ ...formData, courseDurationDays: Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Kunlik vaqtlar (vergul bilan):</label>
              <input
                type="text"
                placeholder="08:30, 19:30"
                value={timeInput}
                onChange={e => setTimeInput(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Ota-onaga aynan shu soatlarda eslatma yuboriladi</span>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Ovqat bilan bog‘liqligi:</label>
              <select
                value={formData.foodRelation}
                onChange={e => setFormData({ ...formData, foodRelation: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="Ovqatdan so‘ng">Ovqatdan so‘ng</option>
                <option value="Ovqatdan oldin (30 daqiqa)">Ovqatdan oldin (30 daqiqa)</option>
                <option value="Ovqatlanish paytida">Ovqatlanish paytida</option>
                <option value="Ovqatdan qat’i nazar">Ovqatdan qat’i nazar</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Buyurilish sababi / Klinik ko‘rsatma*:</label>
            <input
              type="text"
              required
              placeholder="Masalan: BSF G80 spastikligini yengillashtirish va LFK harakatchanligini oshirish"
              value={formData.purpose}
              onChange={e => setFormData({ ...formData, purpose: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Ota-ona uchun maxsus ko‘rsatma:</label>
            <textarea
              rows={2}
              placeholder="Suv bilan ichiriladi, to‘satdan to‘xtatilmasin, engil uyquchanlik bo‘lsa shifokorga xabar qiling..."
              value={formData.instructions}
              onChange={e => setFormData({ ...formData, instructions: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Buyuruvchi shifokor:</label>
              <input
                type="text"
                value={formData.prescribingDoctorName}
                onChange={e => setFormData({ ...formData, prescribingDoctorName: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Order holati (Status):</label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as MedicationStatus })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
              >
                <option value="ACTIVE">ACTIVE (Faol qabul qilinadi)</option>
                <option value="APPROVED">APPROVED (Tasdiqlangan)</option>
                <option value="PENDING_REVIEW">PENDING REVIEW (Ko‘rib chiqilmoqda)</option>
                <option value="PAUSED">PAUSED (Vaqtincha to‘xtatilgan)</option>
              </select>
            </div>
          </div>

          <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center space-x-3">
            <input
              type="checkbox"
              id="doubleAppr"
              checked={formData.requiresDoubleApproval}
              onChange={e => setFormData({ ...formData, requiresDoubleApproval: e.target.checked })}
              className="w-4 h-4 text-primary-600 rounded"
            />
            <label htmlFor="doubleAppr" className="text-slate-700 font-medium cursor-pointer">
              Double Professional Approval (Yuqori xavfli dorilar uchun ikkinchi mutaxassis tasdig‘ini talab qilish)
            </label>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-semibold"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-md flex items-center"
            >
              <Save className="w-4 h-4 mr-1.5" />
              Dori Buyurtmasini Saqlash
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
