import React, { useState } from 'react';
import { useApp } from '../storeContext';
import { RegexScript } from '../types';
import { Plus, Trash2, Edit3, Save, Eye, EyeOff } from 'lucide-react';

export const StepRegex: React.FC = () => {
  const { 
    activeProject, 
    addRegexScript, 
    updateRegexScript, 
    deleteRegexScript, 
    addToast 
  } = useApp();

  const regexes = activeProject.regexes;

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<RegexScript>>({});

  // Adding state
  const [isAdding, setIsAdding] = useState(false);
  const [newForm, setNewForm] = useState<Omit<RegexScript, 'id'>>({
    scriptName: '',
    findRegex: '',
    replaceString: '',
    trimStrings: [],
    placement: [2],
    disabled: false,
    markdownOnly: true,
    promptOnly: false,
    runOnEdit: true,
    substituteRegex: 0,
    minDepth: null,
    maxDepth: null,
  });

  const handleStartEdit = (r: RegexScript) => {
    setEditingId(r.id);
    setEditForm({ ...r });
  };

  const handleSaveEdit = () => {
    if (editingId) {
      if (!editForm.scriptName?.trim()) {
        addToast("Tên script không được trống!", "warning");
        return;
      }
      if (!editForm.findRegex?.trim()) {
        addToast("Pattern Regex tìm kiếm không được trống!", "warning");
        return;
      }
      updateRegexScript(editingId, editForm);
      setEditingId(null);
      addToast("Đã lưu Regex Script thành công.", "success");
    }
  };

  const handleAddRegex = () => {
    if (!newForm.scriptName.trim()) {
      addToast("Tên script không được trống!", "warning");
      return;
    }
    if (!newForm.findRegex.trim()) {
      addToast("Pattern Regex tìm kiếm không được trống!", "warning");
      return;
    }
    addRegexScript(newForm);
    setIsAdding(false);
    setNewForm({
      scriptName: '',
      findRegex: '',
      replaceString: '',
      trimStrings: [],
      placement: [2],
      disabled: false,
      markdownOnly: true,
      promptOnly: false,
      runOnEdit: true,
      substituteRegex: 0,
      minDepth: null,
      maxDepth: null,
    });
  };

  const togglePlacement = (val: number, isNew: boolean = false) => {
    if (isNew) {
      const current = newForm.placement;
      const updated = current.includes(val) ? current.filter(x => x !== val) : [...current, val];
      setNewForm(prev => ({ ...prev, placement: updated }));
    } else {
      const current = editForm.placement || [];
      const updated = current.includes(val) ? current.filter(x => x !== val) : [...current, val];
      setEditForm(prev => ({ ...prev, placement: updated }));
    }
  };

  return (
    <div className="space-y-6 animate-slide-up pb-10">
      
      {/* Step Header */}
      <div className="flex justify-between items-center bg-theme-panel border border-theme-border rounded-xl p-4">
        <div>
          <h3 className="text-sm font-semibold text-cyan-400">🔍 Quản lý danh sách các Regex Scripts</h3>
          <p className="text-xs text-gray-400 mt-1">
            Dự án hiện tại chứa <span className="text-cyan-400 font-bold">{regexes.length}</span> kịch bản Regex. Bạn có thể bật/tắt hoặc yêu cầu AI thiết kế thêm các bộ lọc làm đẹp UI.
          </p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1.5 bg-cyan-500 hover:bg-cyan-600 active:bg-cyan-700 text-white font-semibold text-xs px-3.5 py-2 rounded-lg transition shadow-md shadow-cyan-500/10"
        >
          <Plus size={14} />
          Tạo Regex mới
        </button>
      </div>

      {/* Add New Regex Form */}
      {isAdding && (
        <div className="bg-theme-panel border border-cyan-500/30 rounded-xl p-5 space-y-4 animate-fade-in">
          <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">🌟 Tạo Regex Script Mới</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="add-r-name" className="block text-xs font-semibold text-gray-400">Tên Script</label>
              <input
                id="add-r-name"
                type="text"
                value={newForm.scriptName}
                onChange={(e) => setNewForm(prev => ({ ...prev, scriptName: e.target.value }))}
                placeholder="Ví dụ: Làm đẹp Collapsible Lịch trình, Lọc thẻ Thought..."
                className="w-full bg-gray-900 border border-theme-border rounded-lg px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="add-r-pattern" className="block text-xs font-semibold text-gray-400">Pattern Tìm Kiếm (findRegex)</label>
              <input
                id="add-r-pattern"
                type="text"
                value={newForm.findRegex}
                onChange={(e) => setNewForm(prev => ({ ...prev, findRegex: e.target.value }))}
                placeholder="Ví dụ: /<calendar_widget>([\s\S]*?)<\/calendar_widget>/"
                className="w-full bg-gray-900 border border-theme-border rounded-lg px-3 py-2 text-xs text-cyan-300 font-mono focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-900/40 p-3 rounded-lg border border-theme-border/50">
            {/* Placement checkbox */}
            <div className="space-y-2">
              <span className="block text-[10px] font-bold text-gray-500 uppercase">Đối tượng áp dụng</span>
              <div className="flex gap-3">
                <label className="flex items-center gap-1.5 text-xs text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newForm.placement.includes(1)}
                    onChange={() => togglePlacement(1, true)}
                    className="rounded text-cyan-400 bg-gray-900 border-theme-border w-3.5 h-3.5"
                  />
                  User input (1)
                </label>
                <label className="flex items-center gap-1.5 text-xs text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newForm.placement.includes(2)}
                    onChange={() => togglePlacement(2, true)}
                    className="rounded text-cyan-400 bg-gray-900 border-theme-border w-3.5 h-3.5"
                  />
                  AI Output (2)
                </label>
              </div>
            </div>

            {/* Markdown only */}
            <div className="flex items-center gap-2 pt-4">
              <input
                id="add-r-md"
                type="checkbox"
                checked={newForm.markdownOnly}
                onChange={(e) => setNewForm(prev => ({ ...prev, markdownOnly: e.target.checked }))}
                className="rounded text-cyan-400 bg-gray-900 border-theme-border w-4 h-4"
              />
              <div className="space-y-0.5">
                <label htmlFor="add-r-md" className="text-xs text-gray-300 font-semibold cursor-pointer">MarkdownOnly</label>
                <span className="block text-[9px] text-gray-500">Cho phép render HTML</span>
              </div>
            </div>

            {/* Prompt only */}
            <div className="flex items-center gap-2 pt-4">
              <input
                id="add-r-prompt"
                type="checkbox"
                checked={newForm.promptOnly}
                onChange={(e) => setNewForm(prev => ({ ...prev, promptOnly: e.target.checked }))}
                className="rounded text-cyan-400 bg-gray-900 border-theme-border w-4 h-4"
              />
              <div className="space-y-0.5">
                <label htmlFor="add-r-prompt" className="text-xs text-gray-300 font-semibold cursor-pointer">PromptOnly</label>
                <span className="block text-[9px] text-gray-500">Chỉ lọc text gửi đi</span>
              </div>
            </div>

            {/* Run on Edit */}
            <div className="flex items-center gap-2 pt-4">
              <input
                id="add-r-edit"
                type="checkbox"
                checked={newForm.runOnEdit}
                onChange={(e) => setNewForm(prev => ({ ...prev, runOnEdit: e.target.checked }))}
                className="rounded text-cyan-400 bg-gray-900 border-theme-border w-4 h-4"
              />
              <div className="space-y-0.5">
                <label htmlFor="add-r-edit" className="text-xs text-gray-300 font-semibold cursor-pointer">RunOnEdit</label>
                <span className="block text-[9px] text-gray-500">Chạy khi sửa tin RP</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="add-r-replace" className="block text-xs font-semibold text-gray-400">Chuỗi Thay Thế (replaceString / Hỗ trợ HTML & inline CSS)</label>
            <textarea
              id="add-r-replace"
              rows={5}
              value={newForm.replaceString}
              onChange={(e) => setNewForm(prev => ({ ...prev, replaceString: e.target.value }))}
              placeholder="Chuỗi thay thế hoặc đoạn code HTML inline để làm đẹp giao diện, sử dụng $1, $2 để hứng capture groups..."
              className="w-full bg-gray-900 border border-theme-border rounded-lg p-3 text-xs text-gray-200 font-mono focus:outline-none focus:border-cyan-400 resize-y"
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-theme-border/50 pt-3">
            <button
              onClick={() => setIsAdding(false)}
              className="text-xs font-semibold text-gray-400 hover:text-gray-200 px-3 py-2 rounded-lg transition"
            >
              Hủy bỏ
            </button>
            <button
              onClick={handleAddRegex}
              className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold text-xs px-4 py-2 rounded-lg transition"
            >
              Hoàn tất thêm
            </button>
          </div>
        </div>
      )}

      {/* Regex Cards List */}
      <div className="space-y-4">
        {regexes.length === 0 ? (
          <div className="bg-theme-panel border border-theme-border/50 rounded-xl p-8 text-center text-gray-500">
            <p className="text-xs italic">Chưa có Regex Script nào được tạo cho dự án này.</p>
            <button
              onClick={() => setIsAdding(true)}
              className="text-xs font-bold text-cyan-400 hover:underline mt-2 inline-block"
            >
              + Bấm vào đây để tạo Regex đầu tiên
            </button>
          </div>
        ) : (
          regexes.map((r) => {
            const isEditing = editingId === r.id;
            const isToggledOn = !r.disabled;

            return (
              <div
                key={r.id}
                className={`bg-theme-panel border rounded-xl overflow-hidden transition-all ${
                  isEditing 
                    ? 'border-cyan-500 shadow-md shadow-cyan-500/10' 
                    : isToggledOn 
                      ? 'border-theme-border hover:border-cyan-500/40' 
                      : 'border-theme-border/40 opacity-60'
                }`}
              >
                {/* Header info */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-gray-900/45 border-b border-theme-border/50 gap-3">
                  <div>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.scriptName || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, scriptName: e.target.value }))}
                        className="bg-gray-900 border border-cyan-500/40 rounded px-2 py-0.5 text-xs text-cyan-400 font-bold focus:outline-none"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-200 text-xs sm:text-sm">{r.scriptName}</span>
                        {!isToggledOn && (
                          <span className="bg-gray-800 text-gray-500 border border-theme-border font-mono text-[9px] px-1.5 py-0.5 rounded font-bold">
                            Đã tắt
                          </span>
                        )}
                        {r.markdownOnly && (
                          <span className="bg-cyan-950/60 text-cyan-300 border border-cyan-800/40 font-mono text-[9px] px-1.5 py-0.5 rounded font-bold">
                            HTML Render UI
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-x-2 text-[10px] text-gray-500 mt-1 font-mono">
                      <span>ID: {r.id}</span>
                      <span>•</span>
                      <span className="text-cyan-400">Pattern: {isEditing ? (
                        <input
                          type="text"
                          value={editForm.findRegex || ''}
                          onChange={(e) => setEditForm(prev => ({ ...prev, findRegex: e.target.value }))}
                          className="bg-gray-900 border border-cyan-500/40 rounded px-1 text-[10px] text-cyan-300 focus:outline-none"
                        />
                      ) : r.findRegex}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {/* Toggle button */}
                    <button
                      onClick={() => updateRegexScript(r.id, { disabled: !r.disabled })}
                      className={`p-1.5 rounded-lg border transition ${
                        isToggledOn 
                          ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20' 
                          : 'bg-gray-900 border-theme-border text-gray-500 hover:text-gray-300'
                      }`}
                      title={isToggledOn ? "Tắt Regex script" : "Bật Regex script"}
                    >
                      {isToggledOn ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>

                    {/* Edit button */}
                    {isEditing ? (
                      <button
                        onClick={handleSaveEdit}
                        className="flex items-center gap-1 bg-green-500/20 border border-green-500/40 text-green-400 hover:bg-green-500/30 font-semibold text-xs px-2.5 py-1.5 rounded-lg transition"
                      >
                        <Save size={12} />
                        Lưu
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStartEdit(r)}
                        className="p-1.5 rounded-lg border border-theme-border text-gray-400 hover:text-cyan-400 hover:border-cyan-500/20 transition"
                        title="Sửa Regex"
                      >
                        <Edit3 size={14} />
                      </button>
                    )}

                    {/* Delete button */}
                    <button
                      onClick={() => {
                        if (confirm(`Bạn muốn xóa Regex Script "${r.scriptName}" chứ?`)) {
                          deleteRegexScript(r.id);
                        }
                      }}
                      className="p-1.5 rounded-lg border border-theme-border text-gray-500 hover:text-red-400 hover:border-red-500/20 transition"
                      title="Xóa Regex script"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Edit forms & replacements preview */}
                <div className="p-4 bg-gray-950/20">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs bg-gray-900/60 p-2.5 rounded-lg border border-theme-border">
                        <label className="flex items-center gap-1.5 text-gray-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editForm.placement?.includes(1)}
                            onChange={() => togglePlacement(1)}
                            className="rounded text-cyan-400 bg-gray-900 border-theme-border w-3.5 h-3.5"
                          />
                          User Input (1)
                        </label>
                        <label className="flex items-center gap-1.5 text-gray-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editForm.placement?.includes(2)}
                            onChange={() => togglePlacement(2)}
                            className="rounded text-cyan-400 bg-gray-900 border-theme-border w-3.5 h-3.5"
                          />
                          AI Output (2)
                        </label>
                        <label className="flex items-center gap-1.5 text-gray-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editForm.markdownOnly}
                            onChange={(e) => setEditForm(prev => ({ ...prev, markdownOnly: e.target.checked }))}
                            className="rounded text-cyan-400 bg-gray-900 border-theme-border w-3.5 h-3.5"
                          />
                          MarkdownOnly
                        </label>
                        <label className="flex items-center gap-1.5 text-gray-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editForm.promptOnly}
                            onChange={(e) => setEditForm(prev => ({ ...prev, promptOnly: e.target.checked }))}
                            className="rounded text-cyan-400 bg-gray-900 border-theme-border w-3.5 h-3.5"
                          />
                          PromptOnly
                        </label>
                      </div>

                      <textarea
                        rows={5}
                        value={editForm.replaceString || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, replaceString: e.target.value }))}
                        className="w-full bg-gray-900 border border-theme-border rounded-lg p-3 text-xs text-gray-200 font-mono focus:outline-none focus:border-cyan-400 resize-y"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Chuỗi thay thế (replaceString):</span>
                      <div className="text-xs text-gray-300 font-mono whitespace-pre-wrap line-clamp-5 bg-gray-900/20 border border-theme-border/30 rounded-lg p-3 overflow-y-auto max-h-40">
                        {r.replaceString || <span className="italic text-gray-600">Thay thế thành chuỗi rỗng...</span>}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
