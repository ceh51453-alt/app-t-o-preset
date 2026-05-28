import React, { useState } from 'react';
import { useApp } from '../storeContext';
import { highlightJSON } from '../utils/parser';
import { Copy, Download, Check, FileCode, AlertTriangle } from 'lucide-react';

export const StepExport: React.FC = () => {
  const { activeProject, addToast } = useApp();
  
  // Tab within Export step: 'preset' or index of regex
  const [activeTab, setActiveTab] = useState<'preset' | number>('preset');
  const [copied, setCopied] = useState(false);

  const presetJSON = activeProject.preset;
  const regexes = activeProject.regexes;

  // Build clean Preset JSON strictly conforming to SillyTavern schema
  const cleanPreset = {
    ...presetJSON,
    // Add default schema additions if not exist
    prompt_order: presetJSON.prompts.map(p => ({
      identifier: p.identifier,
      enabled: p.enabled
    })),
    extensions: {
      SPreset: activeProject.name
    }
  };

  const activeJSONData = activeTab === 'preset' 
    ? cleanPreset 
    : regexes[activeTab as number];

  const activeName = activeTab === 'preset'
    ? activeProject.name
    : regexes[activeTab as number]?.scriptName || 'regex_script';

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(activeJSONData, null, 2));
    setCopied(true);
    addToast("Đã sao chép vào bộ nhớ tạm!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const jsonStr = JSON.stringify(activeJSONData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    // Normalize filename
    const cleanName = activeName.toLowerCase()
      .replace(/[^a-z0-9\s_-]/g, '')
      .replace(/\s+/g, '_');
      
    a.href = url;
    a.download = `${cleanName}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast(`Đã tải về file ${cleanName}.json`, "success");
  };

  return (
    <div className="space-y-6 animate-slide-up pb-10">
      
      {/* Overview stats */}
      <div className="bg-theme-panel border border-theme-border rounded-xl p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-3 bg-gray-900/40 rounded-lg border border-theme-border/50 space-y-1">
          <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Tên Dự Án</span>
          <span className="block text-xs font-bold text-gray-200 truncate">{activeProject.name}</span>
        </div>
        <div className="p-3 bg-gray-900/40 rounded-lg border border-theme-border/50 space-y-1">
          <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Khối Chỉ Thị (Prompts)</span>
          <span className="block text-xs font-bold text-purple-400">{presetJSON.prompts.length} blocks</span>
        </div>
        <div className="p-3 bg-gray-900/40 rounded-lg border border-theme-border/50 space-y-1">
          <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Bộ lọc Regex (Regexes)</span>
          <span className="block text-xs font-bold text-cyan-400">{regexes.length} scripts</span>
        </div>
      </div>

      {/* Tabs & Code view */}
      <div className="bg-theme-panel border border-theme-border rounded-xl overflow-hidden flex flex-col h-[550px]">
        {/* Tab Header bar */}
        <div className="flex border-b border-theme-border bg-gray-900/60 overflow-x-auto scrollbar-thin">
          <button
            onClick={() => setActiveTab('preset')}
            className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition ${
              activeTab === 'preset'
                ? 'border-purple-400 text-purple-400 bg-purple-500/[0.03]'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <FileCode size={14} />
            Preset JSON
          </button>
          
          {regexes.map((reg, idx) => (
            <button
              key={reg.id}
              onClick={() => setActiveTab(idx)}
              className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition ${
                activeTab === idx
                  ? 'border-cyan-400 text-cyan-400 bg-cyan-500/[0.03]'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              <FileCode size={14} />
              Regex: {reg.scriptName}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex justify-between items-center px-4 py-2.5 bg-gray-900/30 border-b border-theme-border/50 text-xs">
          <span className="text-gray-500 font-mono">
            {activeTab === 'preset' ? 'sillytavern_preset_schema.json' : 'sillytavern_regex_schema.json'}
          </span>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold px-2.5 py-1.5 rounded-lg border border-theme-border transition"
            >
              {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
              {copied ? 'Đã sao chép' : 'Sao chép'}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1 bg-purple-500 hover:bg-purple-600 active:bg-purple-700 text-white font-semibold px-2.5 py-1.5 rounded-lg transition shadow-md shadow-purple-500/10"
            >
              <Download size={13} />
              Tải xuống .json
            </button>
          </div>
        </div>

        {/* Syntax-highlighted Viewport */}
        <div className="flex-1 p-4 overflow-y-auto bg-gray-950 font-mono text-xs leading-relaxed select-text">
          {activeTab !== 'preset' && !activeJSONData ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-2">
              <AlertTriangle size={24} className="text-amber-500" />
              <span>Regex Script không tồn tại hoặc đã bị xóa.</span>
            </div>
          ) : (
            <pre 
              className="whitespace-pre"
              dangerouslySetInnerHTML={{ __html: highlightJSON(activeJSONData) }}
            />
          )}
        </div>
      </div>
    </div>
  );
};
