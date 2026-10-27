import React, { useState } from 'react';
import { UserStats } from '../types';

interface EditProfileModalProps {
  stats: UserStats;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: Partial<UserStats>) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  stats,
  isOpen,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(stats.name);
  const [nim, setNim] = useState(stats.nim);
  const [university, setUniversity] = useState(stats.university);
  const [major, setMajor] = useState(stats.major);
  const [semester, setSemester] = useState(stats.semester);
  const [targetIpk, setTargetIpk] = useState(stats.targetIpk);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: name.trim() || stats.name,
      nim: nim.trim(),
      university: university.trim(),
      major: major.trim(),
      semester: Number(semester),
      targetIpk: Number(targetIpk),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <h3 className="text-base font-bold text-neutral-900">
            Edit Profil Akademik Mahasiswa
          </h3>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 text-sm font-semibold p-1"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-neutral-700 mb-1">
              Nama Lengkap Mahasiswa *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:outline-hidden focus:border-neutral-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                NIM (Nomor Induk)
              </label>
              <input
                type="text"
                value={nim}
                onChange={(e) => setNim(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs font-mono focus:outline-hidden focus:border-neutral-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Semester Aktif
              </label>
              <input
                type="number"
                min="1"
                max="14"
                value={semester}
                onChange={(e) => setSemester(Number(e.target.value))}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs font-mono focus:outline-hidden focus:border-neutral-900"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-neutral-700 mb-1">
              Program Studi / Jurusan
            </label>
            <input
              type="text"
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:outline-hidden focus:border-neutral-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Universitas / Kampus
              </label>
              <input
                type="text"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:outline-hidden focus:border-neutral-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Target IPK Semester
              </label>
              <input
                type="number"
                step="0.01"
                min="2.0"
                max="4.0"
                value={targetIpk}
                onChange={(e) => setTargetIpk(Number(e.target.value))}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs font-mono focus:outline-hidden focus:border-neutral-900"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-neutral-200 hover:bg-neutral-50 text-neutral-700 rounded-lg text-xs font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              Simpan Profil
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
