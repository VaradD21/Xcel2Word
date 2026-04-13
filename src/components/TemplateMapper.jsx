import React, { useState } from 'react';
import { LayoutTemplate, RefreshCw, Hand, Plus, Trash2, X } from 'lucide-react';

export default function TemplateMapper({ blocks, setBlocks, activeCell, setActiveCell, mappings, setMappings, onReset }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBlock, setNewBlock] = useState({ name: "", type: "single", rows: 1, fields: [] });
  const [newField, setNewField] = useState("");

  const maxRows = Math.max(1, ...blocks.map(b => b.type === 'multi' ? parseInt(b.rows) || 1 : 1));

  const handleAddField = () => {
    if (!newField.trim()) return;
    setNewBlock(prev => ({
      ...prev,
      fields: [...prev.fields, { id: `f_${Date.now()}`, name: newField.trim() }]
    }));
    setNewField("");
  };

  const handleAddBlock = () => {
    if (!newBlock.name.trim() || newBlock.fields.length === 0) {
      alert("Please provide a block name and at least one field.");
      return;
    }
    const block = {
      ...newBlock,
      id: `b_${Date.now()}`,
      rows: newBlock.type === 'single' ? 1 : parseInt(newBlock.rows) || 1
    };
    setBlocks(prev => [...prev, block]);
    setNewBlock({ name: "", type: "single", rows: 1, fields: [] });
    setShowAddForm(false);
  };

  const deleteBlock = (id) => {
    if (confirm("Delete this block and its mappings?")) {
      setBlocks(prev => prev.filter(b => b.id !== id));
      // Cleanup mappings
      const newMappings = { ...mappings };
      Object.keys(newMappings).forEach(k => {
        if (k.startsWith(`${id}_`)) delete newMappings[k];
      });
      setMappings(newMappings);
    }
  };

  const renderCell = (mappingId, label, rowSpan = 1, disabled = false) => {
    if (disabled) {
      return <td className="p-3 border bg-gray-100 text-gray-300 text-center" rowSpan={rowSpan}>-</td>;
    }

    const isMapped = mappings[mappingId] !== undefined;
    const isActive = activeCell === mappingId;
    
    return (
      <td 
        key={mappingId}
        rowSpan={rowSpan}
        onClick={() => setActiveCell(isActive ? null : mappingId)}
        className={`
          p-3 border cursor-pointer font-medium transition-all text-sm
          ${isActive ? 'bg-blue-100 ring-2 ring-blue-500 border-transparent z-10 relative shadow-sm' : 'bg-white hover:bg-gray-50 border-gray-200'}
          ${isMapped && !isActive ? 'bg-green-50 text-green-800 border-green-200' : 'text-gray-700'}
        `}
      >
        <div className="flex flex-col gap-1.5 min-w-[120px]">
          <span className="truncate">{label}</span>
          {isMapped ? (
             <span className="text-xs font-bold text-green-700 rounded bg-green-200 px-2 py-0.5 w-max">
              → Col {mappings[mappingId] + 1}
            </span>
          ) : (
            <span className="text-xs text-gray-400 font-normal">Click to map</span>
          )}
        </div>
      </td>
    );
  };

  // Build the table rows logically
  const tableRows = [];
  for (let r = 0; r < maxRows; r++) {
    const rowCells = [];
    blocks.forEach(b => {
      b.fields.forEach(f => {
        if (b.type === 'single') {
          if (r === 0) {
            rowCells.push(renderCell(`${b.id}_${f.id}`, f.name, maxRows));
          }
        } else {
          if (r < b.rows) {
            rowCells.push(renderCell(`${b.id}_${f.id}_${r}`, `${f.name} (R${r+1})`));
          } else {
            rowCells.push(renderCell(`disabled_${b.id}_${f.id}_${r}`, '', 1, true));
          }
        }
      });
    });
    tableRows.push(<tr key={r}>{rowCells}</tr>);
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col min-w-0">
      <div className="flex flex-wrap justify-between items-center mb-6 gap-2">
        <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
          <LayoutTemplate size={20} /> Dynamic Template Builder
        </h2>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-md hover:bg-blue-100 transition"
          >
            {showAddForm ? <X size={16} /> : <Plus size={16} />} 
            {showAddForm ? 'Cancel' : 'Add Block'}
          </button>
          <button 
            onClick={onReset}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-800 px-3 py-1.5 rounded-md hover:bg-gray-100 transition"
          >
            <RefreshCw size={14} /> Clear Output
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="mb-6 p-4 border border-blue-200 bg-blue-50/50 rounded-lg shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wider">Create New Block</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 text-sm">
            <div>
              <label className="block text-gray-600 mb-1">Block Name</label>
              <input type="text" value={newBlock.name} onChange={e => setNewBlock({...newBlock, name: e.target.value})} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500" placeholder="e.g. Mentor Info" />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">Type</label>
              <select value={newBlock.type} onChange={e => setNewBlock({...newBlock, type: e.target.value})} className="w-full p-2 border rounded bg-white">
                <option value="single">Single Field</option>
                <option value="multi">Multi-row Group</option>
              </select>
            </div>
            {newBlock.type === 'multi' && (
              <div>
                <label className="block text-gray-600 mb-1">Number of Rows</label>
                <input type="number" min="1" max="20" value={newBlock.rows} onChange={e => setNewBlock({...newBlock, rows: e.target.value})} className="w-full p-2 border rounded" />
              </div>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-600 mb-1 text-sm">Block Fields (Columns)</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={newField} 
                onChange={e => setNewField(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddField()}
                className="flex-1 p-2 border rounded text-sm focus:ring-2 focus:ring-blue-500" 
                placeholder="e.g. First Name" 
              />
              <button onClick={handleAddField} className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm font-medium">Add</button>
            </div>
            {newBlock.fields.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {newBlock.fields.map(f => (
                  <span key={f.id} className="bg-white border rounded-full px-3 py-1 text-xs text-gray-600 flex items-center gap-1">
                    {f.name}
                    <X size={12} className="cursor-pointer hover:text-red-500" onClick={() => setNewBlock({...newBlock, fields: newBlock.fields.filter(field => field.id !== f.id)})} />
                  </span>
                ))}
              </div>
            )}
          </div>

          <button onClick={handleAddBlock} className="w-full py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition">Save Block into Template</button>
        </div>
      )}

      {blocks.length === 0 ? (
        <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          No blocks defined. Add a block to create your template!
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-left bg-white">
            <thead className="bg-gray-100 text-gray-600 text-xs uppercase">
              {/* Double Header: one for Block groups, one for actual fields */}
              <tr>
                {blocks.map(b => (
                  <th key={b.id} colSpan={b.fields.length} className="p-2 border-b border-r text-center font-bold bg-gray-200 relative group">
                    <span className="flex items-center justify-center gap-2">
                      {b.name} <span className="font-normal text-[10px] text-gray-500">({b.type})</span>
                      <button onClick={() => deleteBlock(b.id)} className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition"><Trash2 size={14}/></button>
                    </span>
                  </th>
                ))}
              </tr>
              <tr>
                {blocks.flatMap(b => b.fields.map(f => (
                  <th key={`${b.id}_${f.id}`} className="p-3 border-b border-r max-w-xs truncate">{f.name}</th>
                )))}
              </tr>
            </thead>
            <tbody>
              {tableRows}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
