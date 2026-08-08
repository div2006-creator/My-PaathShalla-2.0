'use client';

import React, { useState, useRef, useEffect } from 'react';

export default function WhiteboardModal({ onClose, isTeacher = false }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [activeTool, setActiveTool] = useState('pencil'); // 'pencil' | 'highlighter' | 'eraser' | 'rectangle' | 'circle' | 'text' | 'sticky' | 'laser'
  const [color, setColor] = useState('#8ab4f8');
  const [lineWidth, setLineWidth] = useState(4);
  const [teacherOnly, setTeacherOnly] = useState(false);

  // Shape Start Positions
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [laserPos, setLaserPos] = useState(null);

  // Sticky Notes Overlay State
  const [stickyNotes, setStickyNotes] = useState([
    { id: 'note-1', text: '∫ f(x)dx formula summary', color: '#fbbc04', x: 80, y: 80 }
  ]);

  // History stack for Undo / Redo
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(-1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#1e1e1e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      saveState();
    }
  }, []);

  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL();
    const newHistory = history.slice(0, historyStep + 1);
    setHistory([...newHistory, dataUrl]);
    setHistoryStep(newHistory.length);
  };

  const handleUndo = () => {
    if (historyStep > 0) {
      const prevStep = historyStep - 1;
      setHistoryStep(prevStep);
      restoreState(history[prevStep]);
    }
  };

  const handleRedo = () => {
    if (historyStep < history.length - 1) {
      const nextStep = historyStep + 1;
      setHistoryStep(nextStep);
      restoreState(history[nextStep]);
    }
  };

  const restoreState = (dataUrl) => {
    const canvas = canvasRef.current;
    if (!canvas || !dataUrl) return;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
  };

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    setStartPos({ x, y });

    if (activeTool === 'text') {
      const text = prompt('Enter Text to place on Whiteboard:');
      if (text) {
        const ctx = canvas.getContext('2d');
        ctx.font = `${lineWidth * 5 + 12}px sans-serif`;
        ctx.fillStyle = color;
        ctx.fillText(text, x, y);
        saveState();
      }
      return;
    }

    if (activeTool === 'sticky') {
      const text = prompt('Enter Sticky Note text:');
      if (text) {
        setStickyNotes([...stickyNotes, { id: 'sticky-' + Date.now(), text, color, x, y }]);
      }
      return;
    }

    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);

    if (activeTool === 'eraser') {
      ctx.strokeStyle = '#1e1e1e';
      ctx.lineWidth = lineWidth * 3;
    } else if (activeTool === 'highlighter') {
      ctx.strokeStyle = color + '80';
      ctx.lineWidth = lineWidth * 2;
    } else {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
    }

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    setIsDrawing(true);
  };

  const draw = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    if (activeTool === 'laser') {
      setLaserPos({ x, y });
      return;
    } else {
      setLaserPos(null);
    }

    if (!isDrawing) return;

    const ctx = canvas.getContext('2d');

    if (activeTool === 'pencil' || activeTool === 'highlighter' || activeTool === 'eraser') {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (canvas && (activeTool === 'rectangle' || activeTool === 'circle')) {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.clientX || (e.changedTouches && e.changedTouches[0].clientX);
      const clientY = e.clientY || (e.changedTouches && e.changedTouches[0].clientY);
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      const ctx = canvas.getContext('2d');
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;

      if (activeTool === 'rectangle') {
        ctx.strokeRect(startPos.x, startPos.y, x - startPos.x, y - startPos.y);
      } else if (activeTool === 'circle') {
        const radius = Math.sqrt(Math.pow(x - startPos.x, 2) + Math.pow(y - startPos.y, 2));
        ctx.beginPath();
        ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
      }
    }

    setIsDrawing(false);
    saveState();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#1e1e1e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setStickyNotes([]);
    saveState();
  };

  return (
    <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-[100] p-3 sm:p-6 animate-fade-in-up">
      <div className="bg-[#202124] border border-white/10 w-full max-w-5xl h-[85vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden">
        
        {/* WHITEBOARD HEADER & TOOLBAR */}
        <div className="p-3 sm:p-4 bg-[#28292c] border-b border-white/10 flex items-center justify-between flex-wrap gap-2">
          
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#8ab4f8]">draw</span>
            <h3 className="font-bold text-white text-xs sm:text-sm">Jamboard Collaborative Whiteboard</h3>
          </div>

          {/* Tools Picker */}
          <div className="flex items-center gap-1 bg-[#3c4043] p-1 rounded-xl overflow-x-auto no-scrollbar">
            {[
              { id: 'pencil', icon: 'edit', label: 'Pencil' },
              { id: 'highlighter', icon: 'ink_highlighter', label: 'Highlighter' },
              { id: 'eraser', icon: 'ink_eraser', label: 'Eraser' },
              { id: 'rectangle', icon: 'crop_square', label: 'Rectangle' },
              { id: 'circle', icon: 'circle', label: 'Circle' },
              { id: 'text', icon: 'title', label: 'Text' },
              { id: 'sticky', icon: 'note', label: 'Sticky Note' },
              { id: 'laser', icon: 'flare', label: 'Laser Pointer' }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTool(t.id)}
                className={`p-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 shrink-0 ${
                  activeTool === t.id ? 'bg-[#8ab4f8] text-black font-bold' : 'text-gray-300 hover:text-white'
                }`}
                title={t.label}
              >
                <span className="material-symbols-outlined text-base">{t.icon}</span>
              </button>
            ))}
          </div>

          {/* Color Palette & Stroke Thickness */}
          <div className="flex items-center gap-2">
            {['#8ab4f8', '#ea4335', '#fbbc04', '#34a853', '#ffffff'].map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 transition-transform ${
                  color === c ? 'border-white scale-110 shadow-lg' : 'border-transparent hover:scale-105'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}

            <select
              value={lineWidth}
              onChange={(e) => setLineWidth(Number(e.target.value))}
              className="bg-[#3c4043] border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
            >
              <option value="2">2px Fine</option>
              <option value="4">4px Medium</option>
              <option value="8">8px Bold</option>
              <option value="16">16px Extra</option>
            </select>
          </div>

          {/* Undo / Redo / Clear / Teacher Control */}
          <div className="flex items-center gap-2">
            <button 
              onClick={handleUndo} 
              disabled={historyStep <= 0}
              className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg disabled:opacity-30"
              title="Undo"
            >
              <span className="material-symbols-outlined text-sm">undo</span>
            </button>

            <button 
              onClick={handleRedo} 
              disabled={historyStep >= history.length - 1}
              className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg disabled:opacity-30"
              title="Redo"
            >
              <span className="material-symbols-outlined text-sm">redo</span>
            </button>

            <button 
              onClick={clearCanvas} 
              className="px-2.5 py-1 bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-semibold rounded-lg hover:bg-red-500/30"
            >
              Clear
            </button>

            {isTeacher && (
              <button
                onClick={() => setTeacherOnly(!teacherOnly)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                  teacherOnly ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-white/10 text-gray-300'
                }`}
              >
                {teacherOnly ? 'Teacher Only' : 'Student Editing ON'}
              </button>
            )}

            <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-white">
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

        </div>

        {/* CANVAS CANVAS AREA */}
        <div className="flex-1 relative w-full h-full cursor-crosshair overflow-hidden">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full h-full block"
          />

          {/* Sticky Notes Overlay */}
          {stickyNotes.map((note) => (
            <div
              key={note.id}
              style={{ left: note.x, top: note.y, backgroundColor: note.color }}
              className="absolute p-3 rounded-xl shadow-2xl text-black font-semibold text-xs max-w-[160px] border border-black/20 animate-fade-in-up"
            >
              <p>{note.text}</p>
            </div>
          ))}

          {/* Laser Pointer Glow Dot */}
          {laserPos && (
            <div
              style={{ left: laserPos.x - 8, top: laserPos.y - 8 }}
              className="absolute w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow-[0_0_15px_#red] animate-ping pointer-events-none"
            />
          )}
        </div>

      </div>
    </div>
  );
}

