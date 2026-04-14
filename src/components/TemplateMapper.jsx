import React, { useState } from 'react';
import { LayoutTemplate, RefreshCw, Plus, Trash2, X, Wand2, ToggleLeft, ToggleRight } from 'lucide-react';

export default function TemplateMapper({ excelData, blocks, setBlocks, mappings, setMappings, baseRow, setBaseRow, isDynamicRows, setIsDynamicRows, onReset }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBlock, setNewBlock] = useState({ name: "", type: "single", rows: 1, fields: [] });
  const [newField, setNewField] = useState("");
  const [dragOverCell, setDragOverCell] = useState(null);

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
      const newMappings = { ...mappings };
      Object.keys(newMappings).forEach(k => {
        if (k.startsWith(`${id}_`)) delete newMappings[k];
      });
      setMappings(newMappings);
    }
  };

  const handleDrop = (e, mappingId) => {
    e.preventDefault();
    setDragOverCell(null);
    const colIndex = parseInt(e.dataTransfer.getData("colIndex"));
    const rowIndex = parseInt(e.dataTransfer.getData("rowIndex"));
    
    if (isNaN(colIndex) || isNaN(rowIndex)) return;

    if (baseRow === null) {
      setBaseRow(rowIndex);
    } else if (baseRow !== rowIndex) {
      alert("Please drag fields from the locked starting row: " + (baseRow + 1));
      return;
    }
    
    setMappings(prev => ({ ...prev, [mappingId]: colIndex }));
  };

  const handleAutoMap = () => {
    if (!excelData || excelData.length === 0) {
      alert("Please upload an Excel file first.");
      return;
    }
    const headerRowIdx = baseRow !== null ? baseRow : 0;
    const headerRow = excelData[headerRowIdx];
    
    const aliases = {
      sr: ['sr', 'serial', 'no', 'number', 'id'],
      team: ['team', 'title', 'project', 'group'],
      domain: ['domain', 'category', 'track', 'theme'],
      p_name: ['name', 'participant', 'student', 'member'],
      p_phone: ['phone', 'mobile', 'contact', 'whatsapp'],
      p_college: ['college', 'institute', 'university'],
      p_sign: ['sign', 'signature', 'attendance']
    };

    const normalize = str => String(str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const newMappings = { ...mappings };
    let mappingCount = 0;

    blocks.forEach(b => {
      b.fields.forEach(f => {
        const fKey = f.id.replace('f_', '').toLowerCase();
        let targetAliasSet = [normalize(f.name)];
        
        for (const [key, list] of Object.entries(aliases)) {
           if (fKey.includes(key) || normalize(f.name).includes(key)) { 
             targetAliasSet = [...targetAliasSet, ...list]; 
             break; 
           }
        }

        if (b.type === 'single') {
          const mappingId = `${b.id}_${f.id}`;
          if (!newMappings[mappingId]) {
             const col = headerRow.findIndex(h => {
                const hn = normalize(h);
                return targetAliasSet.some(alias => hn.includes(alias));
             });
             if (col >= 0) {
               newMappings[mappingId] = col;
               mappingCount++;
             }
          }
        } else {
          for (let teamRow = 0; teamRow < b.rows; teamRow++) {
            const mappingId = `${b.id}_${f.id}_${teamRow}`;
            if (!newMappings[mappingId]) {
              const numKeyword = (teamRow + 1).toString();
              const col = headerRow.findIndex((h, idx) => {
                 if (Object.values(newMappings).includes(idx)) return false;
                 const hn = normalize(h);
                 const containsAlias = targetAliasSet.some(alias => hn.includes(alias));
                 return containsAlias && hn.includes(numKeyword);
              });
              if (col >= 0) {
                newMappings[mappingId] = col;
                mappingCount++;
              }
            }
          }
        }
      });
    });

    if (mappingCount > 0) {
      if (baseRow === null) setBaseRow(headerRowIdx);
      setMappings(newMappings);
      alert(`Auto-mapped ${mappingCount} columns successfully!`);
    } else {
      alert(`Could not find any clear auto-mapping matches.`);
    }
  };

  const renderCell = (mappingId, label, rowSpan = 1, disabled = false) => {
    if (disabled) {
      return <td className="p-3 border bg-gray-100 text-gray-300 text-center" rowSpan={rowSpan}>-</td>;
    }

    const isMapped = mappings[mappingId] !== undefined;
    const isDragOver = dragOverCell === mappingId;
    
    return (
      <td 
        key={mappingId}
        rowSpan={rowSpan}
        onDragOver={(e) => { e.preventDefault(); setDragOverCell(mappingId); }}
        onDragLeave={() => setDragOverCell(null)}
        onDrop={(e) => handleDrop(e, mappingId)}
        className={`
          p-3 border transition-all text-sm relative group
          ${isDragOver ? 'bg-blue-100 ring-2 ring-blue-500 border-transparent shadow-sm scale-[1.02] z-10' : 'bg-white hover:bg-gray-50 border-gray-200'}
          ${isMapped && !isDragOver ? 'bg-green-50 border-green-200' : ''}
        `}
      >
        <div className="flex flex-col gap-1.5 min-w-[120px] pointer-events-none select-none">
          <span className={`truncate font-medium ${isMapped ? 'text-green-900' : 'text-gray-700'}`}>{label}</span>
          {isMapped ? (
            <span className="text-xs font-bold text-green-700 rounded bg-green-200 px-2 py-0.5 w-max">
              → Map: Col {mappings[mappingId] + 1}
            </span>
          ) : (
            <span className="text-xs text-gray-400 font-normal border border-dashed border-gray-300 rounded px-2 py-0.5 bg-gray-50 w-max">
              Drop Excel cell here
            </span>
          )}
        </div>
        {/* Unmap button */}
        {isMapped && (
          <button 
            onClick={() => {
              const newM = {...mappings};
              delete newM[mappingId];
              setMappings(newM);
            }}
            className="absolute top-1 right-1 p-1 bg-red-100 text-red-600 rounded opacity-0 group-hover:opacity-100 transition shadow-sm pointer-events-auto"
            title="Remove mapping"
          >
            <X size={12} />
          </button>
        )}
      </td>
    );
  };

  const tableRows = [];
  for (let r = 0; r < maxRows; r++) {
    const rowCells = [];
    blocks.forEach(b => {
      b.fields.forEach(f => {
        if (b.type === 'single') {
          if (r === 0) rowCells.push(renderCell(`${b.id}_${f.id}`, f.name, maxRows));
        } else {
          if (r < b.rows) rowCells.push(renderCell(`${b.id}_${f.id}_${r}`, `${f.name} (R${r+1})`));
          else rowCells.push(renderCell(`disabled_${b.id}_${f.id}_${r}`, '', 1, true));
        }
      });
    });
    tableRows.push(<tr key={r}>{rowCells}</tr>);
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col min-w-0">
      <div className="flex flex-col mb-6 gap-3 border-b border-gray-100 pb-4">
        {/* Top Header */}
        <div className="flex flex-wrap justify-between items-center gap-2">
          <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
            <LayoutTemplate size={20} /> Template Configuration
          </h2>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleAutoMap}
              className="flex items-center gap-1.5 text-sm font-medium text-amber-600 bg-amber-50 px-3 py-1.5 rounded-md hover:bg-amber-100 transition shadow-sm"
              title="Automatically match headers using AI-like heuristics"
            >
              <Wand2 size={16} /> Auto Map
            </button>
            <button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1.5 text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-md hover:bg-blue-100 transition shadow-sm"
            >
              {showAddForm ? <X size={16} /> : <Plus size={16} />} 
              {showAddForm ? 'Cancel Form' : 'New Block'}
            </button>
            <button 
              onClick={onReset}
              className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-800 px-3 py-1.5 rounded-md hover:bg-gray-100 transition shadow-sm"
            >
              <RefreshCw size={14} /> Clear
            </button>
          </div>
        </div>

        {/* Dynamic Rows Toggle UI */}
        <div className="flex justify-start">
          <button 
            onClick={() => setIsDynamicRows(!isDynamicRows)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            {isDynamicRows ? <ToggleRight size={22} className="text-blue-600" /> : <ToggleLeft size={22} className="text-gray-400" />}
            <span className="font-medium">Filter Empty Participants Natively (Dynamic Output Rows)</span>
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="mb-6 p-4 border border-blue-200 bg-blue-50/50 rounded-lg shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wider">Create New Layout Block</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 text-sm">
            <div>
              <label className="block text-gray-600 mb-1">Block Name</label>
              <input type="text" value={newBlock.name} onChange={e => setNewBlock({...newBlock, name: e.target.value})} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 bg-white" placeholder="e.g. Judges Info" />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">Structure Type</label>
              <select value={newBlock.type} onChange={e => setNewBlock({...newBlock, type: e.target.value})} className="w-full p-2 border rounded bg-white focus:ring-2 focus:ring-blue-500">
                <option value="single">Single Row per Team</option>
                <option value="multi">Multi-row Repeating Block</option>
              </select>
            </div>
            {newBlock.type === 'multi' && (
              <div>
                <label className="block text-gray-600 mb-1">Maximum Reserved Rows</label>
                <input type="number" min="1" max="20" value={newBlock.rows} onChange={e => setNewBlock({...newBlock, rows: e.target.value})} className="w-full p-2 border rounded bg-white focus:ring-2 focus:ring-blue-500" />
              </div>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-600 mb-1 text-sm">Column Extraction Fields</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={newField} 
                onChange={e => setNewField(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddField()}
                className="flex-1 p-2 border rounded text-sm focus:ring-2 focus:ring-blue-500 bg-white" 
                placeholder="e.g. Mentor Name" 
              />
              <button onClick={handleAddField} className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm font-medium transition shadow-sm">Add Field</button>
            </div>
            {newBlock.fields.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3 p-3 bg-white border border-dashed rounded-lg shadow-[inset_0_0_2px_rgba(0,0,0,0.1)]">
                {newBlock.fields.map(f => (
                  <span key={f.id} className="bg-blue-50 border border-blue-200 rounded-full pl-3 pr-1 py-1 text-xs text-blue-800 flex items-center gap-2 shadow-sm font-medium">
                    {f.name}
                    <button className="bg-white rounded-full p-0.5 hover:bg-red-50 hover:text-red-600 transition" onClick={() => setNewBlock({...newBlock, fields: newBlock.fields.filter(field => field.id !== f.id)})}>
                      <X size={12}/>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <button onClick={handleAddBlock} className="w-full py-2 bg-blue-600 text-white rounded font-bold tracking-wide hover:bg-blue-700 transition shadow-md">Add Block to Schema</button>
        </div>
      )}

      {blocks.length === 0 ? (
        <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          No blocks defined. Add a block to create your template!
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm scrollbar-thin">
          <table className="w-full text-left bg-white">
            <thead className="bg-gray-100 text-gray-600 text-xs uppercase">
              <tr>
                {blocks.map(b => (
                  <th key={b.id} colSpan={b.fields.length} className="p-2 border-b border-r text-center font-bold bg-gray-200 relative group">
                    <span className="flex items-center justify-center gap-2">
                      {b.name} <span className="font-normal text-[10px] text-gray-500 bg-white px-1.5 py-0.5 rounded shadow-sm">({b.type})</span>
                      <button onClick={() => deleteBlock(b.id)} className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition bg-white rounded shadow-sm p-1"><Trash2 size={12}/></button>
                    </span>
                  </th>
                ))}
              </tr>
              <tr>
                {blocks.flatMap(b => b.fields.map(f => (
                  <th key={`${b.id}_${f.id}`} className="p-3 border-b border-r max-w-xs truncate bg-gray-50">{f.name}</th>
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
