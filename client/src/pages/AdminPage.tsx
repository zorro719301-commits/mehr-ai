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
  Clock,
  UserCheck,
  UserX,
  Key,
  Mail,
  Phone,
  Lock,
  UserPlus
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [conditions, setConditions] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [aiLogs, setAiLogs] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New condition modal
  const [isAddConditionOpen, setIsAddConditionOpen] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newSymptoms, setNewSymptoms] = useState('');
  const [newSpecialists, setNewSpecialists] = useState('LOGOPED,PSIXOLOG,NEVROLOG');

  // User Management Modals & State
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // New User Form
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('Password123!');
  const [newUserRole, setNewUserRole] = useState<'SUPER_ADMIN' | 'MEDICAL_ADMIN' | 'SPECIALIST' | 'PARENT' | 'AUDITOR'>('PARENT');
  const [newUserPhone, setNewUserPhone] = useState('+998 ');
  const [newUserSpecialty, setNewUserSpecialty] = useState('');

  // Edit User Form
  const [editUserName, setEditUserName] = useState('');
  const [editUserPhone, setEditUserPhone] = useState('');
  const [editUserRole, setEditUserRole] = useState<string>('PARENT');
  const [editUserPassword, setEditUserPassword] = useState('');
  const [editUserIsActive, setEditUserIsActive] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [mRes, cRes, aRes, aiRes, uRes] = await Promise.all([
        api.get('/api/admin/metrics'),
        api.get('/api/admin/conditions'),
        api.get('/api/admin/audit-logs'),
        api.get('/api/admin/ai-logs'),
        api.get('/api/admin/users'),
      ]);

      if (mRes.success && mRes.data) setMetrics(mRes.data);
      if (cRes.success && Array.isArray(cRes.data)) setConditions(cRes.data);
      if (aRes.success && Array.isArray(aRes.data)) setAuditLogs(aRes.data);
      if (aiRes.success && Array.isArray(aiRes.data)) setAiLogs(aiRes.data);
      if (uRes.success && Array.isArray(uRes.data)) setUsers(uRes.data);
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

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail || !newUserName || !newUserPassword) return;
    try {
      const res = await api.post('/api/admin/users', {
        fullName: newUserName,
        email: newUserEmail,
        password: newUserPassword,
        role: newUserRole,
        phone: newUserPhone,
        specialty: newUserSpecialty,
      });

      if (res.success) {
        setIsAddUserOpen(false);
        setNewUserName('');
        setNewUserEmail('');
        setNewUserPassword('Password123!');
        setNewUserPhone('+998 ');
        setNewUserSpecialty('');
        loadAdminData();
      }
    } catch (e) {
      console.error('Error creating user:', e);
    }
  };

  const openEditUser = (u: any) => {
    setSelectedUser(u);
    setEditUserName(u.fullName || '');
    setEditUserPhone(u.phone || '');
    setEditUserRole(u.role || 'PARENT');
    setEditUserPassword('');
    setEditUserIsActive(u.isActive !== false);
    setIsEditUserOpen(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      const payload: any = {
        fullName: editUserName,
        phone: editUserPhone,
        role: editUserRole,
        isActive: editUserIsActive,
      };
      if (editUserPassword.trim()) {
        payload.password = editUserPassword.trim();
      }
      const res = await api.put(`/api/admin/users/${selectedUser.id}`, payload);
      if (res.success) {
        setIsEditUserOpen(false);
        setSelectedUser(null);
        loadAdminData();
      }
    } catch (e) {
      console.error('Error updating user:', e);
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (window.confirm(`${name} hisobini rostdan ham o‘chirmoqchimisiz?`)) {
      await api.delete(`/api/admin/users/${id}`);
      loadAdminData();
    }
  };

  const handleToggleUserActive = async (u: any) => {
    await api.put(`/api/admin/users/${u.id}`, { isActive: !u.isActive });
    loadAdminData();
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

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsAddUserOpen(true)}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-card flex items-center space-x-2 cursor-pointer transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Yangi ishtirokchi qo‘shish</span>
          </button>
          <button
            onClick={() => setIsAddConditionOpen(true)}
            className="px-5 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-card flex items-center space-x-2 cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Yangi kasallik / holat qo‘shish</span>
          </button>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-soft space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Foydalanuvchilar</span>
          <div className="text-3xl font-black text-slate-900">
            {metrics?.totalUsers || (Array.isArray(users) && users.length > 0 ? users.length : 6)}
          </div>
          <p className="text-xs text-slate-500">Ota-onalar va mutaxassislar</p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-soft space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Jami Bolalar</span>
          <div className="text-3xl font-black text-brand-600">
            {metrics?.totalChildren || 4}
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

      {/* 2. ISHTIROKCHILAR VA XODIMLAR BOSHQARUVI (SUPER ADMIN USER MANAGEMENT) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              <span>Ishtirokchilar va Xodimlar Boshqaruvi (User Management)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Platforma a’zolari (ota-onalar, nevrologlar, logopedlar, adminlar) ro‘yxati, rollari va login-parollarini boshqarish.
            </p>
          </div>
          <button
            onClick={() => setIsAddUserOpen(true)}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm flex items-center space-x-1.5 cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>➕ Yangi hisob qo‘shish</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase">
                <th className="py-2.5 px-3">Ishtirokchi</th>
                <th className="py-2.5 px-3">Login / Email</th>
                <th className="py-2.5 px-3">Rol</th>
                <th className="py-2.5 px-3">Telefon</th>
                <th className="py-2.5 px-3">Holati</th>
                <th className="py-2.5 px-3 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {(Array.isArray(users) ? users : []).map((u) => {
                const isSuper = u.role === 'SUPER_ADMIN' || u.role === 'MEDICAL_ADMIN';
                const isSpec = u.role === 'SPECIALIST';
                const isParent = u.role === 'PARENT';

                return (
                  <tr key={u.id || u.email} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{u.fullName}</div>
                      {u.specialty && <div className="text-[10px] text-slate-400">{u.specialty}</div>}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600">
                      <div className="flex items-center space-x-1">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{u.email}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-md border ${
                          isSuper
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : isSpec
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : isParent
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {isSuper ? 'Bosh Admin' : isSpec ? 'Mutaxassis' : isParent ? 'Ota-ona' : 'Auditor'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {u.phone ? (
                        <div className="flex items-center space-x-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{u.phone}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <button
                        onClick={() => handleToggleUserActive(u)}
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full border flex items-center space-x-1 cursor-pointer transition-colors ${
                          u.isActive !== false
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                        }`}
                        title="Holatni o‘zgartirish uchun bosing"
                      >
                        {u.isActive !== false ? (
                          <>
                            <UserCheck className="w-3 h-3" />
                            <span>Faol</span>
                          </>
                        ) : (
                          <>
                            <UserX className="w-3 h-3" />
                            <span>Bloklangan</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => openEditUser(u)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                          title="Tahrirlash va parolni yangilash"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        {u.role !== 'SUPER_ADMIN' && (
                          <button
                            onClick={() => handleDeleteUser(u.id, u.fullName)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="O‘chirish"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
          {(Array.isArray(conditions) ? conditions : []).map((c) => (
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
              {(Array.isArray(auditLogs) ? auditLogs.slice(0, 10) : []).map((log) => (
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

      {/* ADD USER MODAL */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-purple-600" />
              <span>Yangi Ishtirokchi Qo‘shish</span>
            </h3>
            <form onSubmit={handleCreateUser} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">F.I.O. (Ism va Familiya) *</label>
                <input
                  type="text"
                  required
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:bg-white focus:border-purple-500"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Azizbek To‘rayev"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Login / Email *</label>
                  <input
                    type="email"
                    required
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:bg-white focus:border-purple-500"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="azizbek@mehr.uz"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Dastlabki Parol *</label>
                  <input
                    type="text"
                    required
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:bg-white focus:border-purple-500 font-mono"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    placeholder="Parol kiritish..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Rol *</label>
                  <select
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:bg-white focus:border-purple-500"
                    value={newUserRole}
                    onChange={(e: any) => setNewUserRole(e.target.value)}
                  >
                    <option value="PARENT">Ota-ona (Faqat o‘z bolalarini ko‘radi)</option>
                    <option value="SPECIALIST">Mutaxassis / Shifokor</option>
                    <option value="ADMIN">Super Administrator</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Telefon raqam</label>
                  <input
                    type="tel"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:bg-white focus:border-purple-500"
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value)}
                    placeholder="+998 90 123 45 67"
                  />
                </div>
              </div>

              {newUserRole === 'SPECIALIST' && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Ixtisosligi / Mutaxassislik sohasi</label>
                  <input
                    type="text"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:bg-white focus:border-purple-500"
                    value={newUserSpecialty}
                    onChange={(e) => setNewUserSpecialty(e.target.value)}
                    placeholder="Bolalar nevrologi, Defektolog, Surdopedagog"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-purple-600 text-white hover:bg-purple-700 shadow-sm"
                >
                  Foydalanuvchini Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {isEditUserOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-lg text-slate-900 flex items-center justify-between">
              <span>Foydalanuvchini Tahrirlash</span>
              <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded-lg text-slate-600">
                {selectedUser.email}
              </span>
            </h3>

            <form onSubmit={handleUpdateUser} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">F.I.O. *</label>
                <input
                  type="text"
                  required
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:bg-white focus:border-brand-500"
                  value={editUserName}
                  onChange={(e) => setEditUserName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Rol</label>
                  <select
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:bg-white focus:border-brand-500"
                    value={editUserRole}
                    onChange={(e: any) => setEditUserRole(e.target.value)}
                  >
                    <option value="PARENT">Ota-ona</option>
                    <option value="SPECIALIST">Mutaxassis</option>
                    <option value="ADMIN">Super Admin</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Telefon</label>
                  <input
                    type="tel"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:bg-white focus:border-brand-500"
                    value={editUserPhone}
                    onChange={(e) => setEditUserPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Yangi Parol o‘rnatish (ixtiyoriy)</label>
                <input
                  type="text"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:bg-white focus:border-brand-500 font-mono"
                  placeholder="Agar parolni o‘zgartirmoqchi bo‘lsangiz yozing..."
                  value={editUserPassword}
                  onChange={(e) => setEditUserPassword(e.target.value)}
                />
                <span className="text-[10px] text-slate-400">Bo‘sh qoldirilsa avvalgi parol saqlanadi.</span>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="editIsActive"
                  checked={editUserIsActive}
                  onChange={(e) => setEditUserIsActive(e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="editIsActive" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Hisob faol holatda (tizimga kira oladi)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditUserOpen(false);
                    setSelectedUser(null);
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-600 text-white hover:bg-brand-700 shadow-sm"
                >
                  O‘zgarishlarni Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
