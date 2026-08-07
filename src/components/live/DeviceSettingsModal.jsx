'use client';

import React from 'react';

export default function DeviceSettingsModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4 animate-fade-in-up">
      <div className="bg-[#202124] border border-white/10 w-full max-w-md rounded-2xl p-6 shadow-2xl text-white space-y-4">
        
        <div className="flex justify-between items-center pb-2 border-b border-white/10">
          <h3 className="font-bold text-base flex items-center gap-2">
            <span className="material-symbols-outlined text-[#8ab4f8]">settings</span>
            <span>Classroom Device Settings</span>
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="space-y-4 text-xs">
          {/* Microphone */}
          <div>
            <label className="block text-gray-400 font-bold mb-1.5">Microphone Input</label>
            <div className="p-3 bg-[#3c4043] rounded-xl flex items-center justify-between border border-white/5">
              <span className="truncate">Default Microphone (Built-in Audio)</span>
              <span className="material-symbols-outlined text-green-400 text-sm">check_circle</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[10px] text-gray-400">Mic Test:</span>
              <div className="flex-1 h-1.5 bg-[#3c4043] rounded-full overflow-hidden">
                <div className="bg-green-400 h-full w-[65%] animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Camera */}
          <div>
            <label className="block text-gray-400 font-bold mb-1.5">Camera Video Input</label>
            <div className="p-3 bg-[#3c4043] rounded-xl flex items-center justify-between border border-white/5">
              <span className="truncate">Integrated HD Web Camera (1080p)</span>
              <span className="material-symbols-outlined text-green-400 text-sm">check_circle</span>
            </div>
          </div>

          {/* Speaker */}
          <div>
            <label className="block text-gray-400 font-bold mb-1.5">Audio Output Speaker</label>
            <div className="p-3 bg-[#3c4043] rounded-xl flex items-center justify-between border border-white/5">
              <span className="truncate">Speakers (High Definition Audio)</span>
              <span className="material-symbols-outlined text-green-400 text-sm">check_circle</span>
            </div>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="mt-4 w-full py-2.5 bg-[#8ab4f8] text-black font-bold text-xs rounded-xl hover:opacity-90 transition-opacity"
        >
          Save & Apply Settings
        </button>

      </div>
    </div>
  );
}
