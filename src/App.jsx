import React, { useState, useEffect } from 'react';
import ExcelUploader from './components/ExcelUploader';
import TemplateMapper from './components/TemplateMapper';
import DocxExport from './components/DocxExport';
import LivePreview from './components/LivePreview';
import { FileUp, TableProperties, FilePlus2, Trash2, Eye, EyeOff } from 'lucide-react';

const defaultBlocks = [
  {
    id: "b_teaminfo",
    name: "Team Info",
    type: "single",
    fields: [
      { id: "f_sr_no", name: "SR NO" },
      { id: "f_team_title", name: "TEAM TITLE" },
      { id: "f_domain", name: "DOMAIN" }
    ]
  },
  {
    id: "b_participants",
    name: "Participants",
    type: "multi",
    rows: 4,
    fields: [
      { id: "f_p_name", name: "PARTICIPANT NAME" },
      { id: "f_p_phone", name: "PHONE NUMBER" },
      { id: "f_p_college", name: "COLLEGE" },
      { id: "f_p_sign", name: "SIGN" }
    ]
  }
];

const DEFAULT_PROFILE_NAME = "Default Template";

function App() {
  const [excelData, setExcelData] = useState(null);
  const [activeTemplateId, setActiveTemplateId] = useState(DEFAULT_PROFILE_NAME);
  const [previewMode, setPreviewMode] = useState(true);
  const [templates, setTemplates] = useState({
    [DEFAULT_PROFILE_NAME]: { blocks: defaultBlocks, mappings: {}, baseRow: null, isDynamicRows: false }
  });

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("templatesConfigMap");
    if (saved) {
      try {
        const config = JSON.parse(saved);
        if (config.templates) setTemplates(config.templates);
        if (config.activeTemplateId) setActiveTemplateId(config.activeTemplateId);
      } catch (e) {
        console.error("Local storage decode error", e);
      }
    }
  }, []);

  // Save to localStorage when things change
  useEffect(() => {
    const config = { templates, activeTemplateId };
    localStorage.setItem("templatesConfigMap", JSON.stringify(config));
  }, [templates, activeTemplateId]);

  const currentTemplate = templates[activeTemplateId] || templates[DEFAULT_PROFILE_NAME];
  const { blocks = [], mappings = {}, baseRow = null, isDynamicRows = false } = currentTemplate;

  const updateCurrentTemplate = (key, value) => {
    setTemplates(prev => ({
      ...prev,
      [activeTemplateId]: {
        ...prev[activeTemplateId],
        [key]: typeof value === 'function' ? value(prev[activeTemplateId][key]) : value
      }
    }));
  };

  const handleCreateTemplate = () => {
    const name = prompt("Enter a name for the new template:");
    if (!name || templates[name]) return;
    setTemplates(prev => ({
      ...prev,
      [name]: { blocks: [...defaultBlocks], mappings: {}, baseRow: null, isDynamicRows: false }
    }));
    setActiveTemplateId(name);
  };

  const handleDeleteTemplate = () => {
    if (activeTemplateId === DEFAULT_PROFILE_NAME) {
      alert("Cannot delete the default template.");
      return;
    }
    if (confirm(`Delete template '${activeTemplateId}'?`)) {
      setTemplates(prev => {
        const newMap = { ...prev };
        delete newMap[activeTemplateId];
        return newMap;
      });
      setActiveTemplateId(DEFAULT_PROFILE_NAME);
    }
  };

  // Setup drag event for Excel cells
  const handleDragStart = (e, rowIndex, colIndex) => {
    e.dataTransfer.setData("rowIndex", rowIndex.toString());
    e.dataTransfer.setData("colIndex", colIndex.toString());
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-6">
      <header className="mb-6 pb-4 border-b border-gray-200 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <TableProperties className="text-blue-600" />
            Excel to Word Mapper
          </h1>
          <p className="text-gray-500 mt-2">Map your flat Excel data to an advanced custom template layout via Drag & Drop.</p>
        </div>
        
        {/* Top Header Actions */}
        <div className="flex flex-col items-end gap-3">
          {/* Template Selector dropdown */}
          <div className="flex items-center gap-3 bg-white p-2 rounded-lg border shadow-sm">
            <label className="text-sm font-semibold text-gray-600">Profile:</label>
            <select 
              className="p-1 border rounded min-w-[150px] focus:ring-2 focus:ring-blue-500 bg-white"
              value={activeTemplateId}
              onChange={(e) => setActiveTemplateId(e.target.value)}
            >
              {Object.keys(templates).map(k => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
            <button onClick={handleCreateTemplate} title="New Template" className="p-1 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded">
              <FilePlus2 size={20} />
            </button>
            <button onClick={handleDeleteTemplate} title="Delete Template" className="p-1 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded disabled:opacity-50" disabled={activeTemplateId === DEFAULT_PROFILE_NAME}>
              <Trash2 size={20} />
            </button>
          </div>

          <button 
            onClick={() => setPreviewMode(!previewMode)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${previewMode ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
          >
            {previewMode ? <Eye size={16} /> : <EyeOff size={16} />}
            Live Preview {previewMode ? "ON" : "OFF"}
          </button>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
        {/* Left Column: Excel Upload & Preview */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col sticky top-6 max-h-[calc(100vh-8rem)]">
          <h2 className="text-xl font-semibold mb-4 text-gray-700 flex items-center gap-2 shrink-0">
            <FileUp size={20} /> Data Source
          </h2>
          
          {!excelData ? (
            <ExcelUploader onDataLoaded={setExcelData} />
          ) : (
            <div className="flex flex-col overflow-hidden">
              <div className="flex justify-between items-center mb-2 shrink-0">
                <p className="text-sm text-gray-500">
                  <strong className="text-blue-600 font-semibold cursor-default">Drag an Excel cell</strong> and drop it into the template map on the right. {baseRow !== null ? `Base Row locked: ${baseRow + 1}` : ''}
                </p>
                <button 
                  onClick={() => { setExcelData(null); updateCurrentTemplate('mappings', {}); updateCurrentTemplate('baseRow', null); }}
                  className="text-sm text-red-600 hover:text-red-800 font-medium whitespace-nowrap ml-4"
                >
                  Change File
                </button>
              </div>
              <div className="overflow-auto border rounded-lg min-h-[300px]">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 sticky top-0 z-20 shadow-sm">
                    <tr>
                      <th className="p-2 border-b border-r text-gray-400 font-medium w-12 text-center bg-gray-100 z-30 sticky left-0"></th>
                      {excelData[0]?.map((_, colIndex) => (
                        <th key={colIndex} className="p-2 border-b border-r font-medium text-gray-600 min-w-[100px] truncate max-w-[150px]">
                          {excelData[0][colIndex] || `Col ${colIndex + 1}`}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {excelData.map((row, rowIndex) => (
                      <tr key={rowIndex} className={`hover:bg-blue-50 transition-colors ${baseRow === rowIndex ? 'bg-amber-50' : ''}`}>
                        <td className="p-2 border-b border-r text-gray-400 font-medium text-center bg-gray-50 sticky left-0 z-10">
                          {rowIndex + 1}
                        </td>
                        {row.map((cell, colIndex) => {
                          const isMapped = Object.values(mappings).includes(colIndex) && baseRow === rowIndex;
                          return (
                            <td 
                              key={colIndex} 
                              draggable
                              onDragStart={(e) => handleDragStart(e, rowIndex, colIndex)}
                              className={`
                                p-2 border-b border-r cursor-grab min-w-[100px] truncate max-w-[200px] active:cursor-grabbing
                                ${baseRow !== null && baseRow !== rowIndex ? 'opacity-40 cursor-not-allowed' : ''}
                                ${isMapped ? 'bg-blue-100 font-medium text-blue-800 border-blue-200' : ''}
                              `}
                              title={cell}
                            >
                              <div className="pointer-events-none select-none">{cell}</div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Template Builder & Export */}
        <div className="flex flex-col gap-6 w-full max-w-full">
          <TemplateMapper 
            excelData={excelData}
            blocks={blocks}
            setBlocks={(val) => updateCurrentTemplate('blocks', val)}
            mappings={mappings}
            setMappings={(val) => updateCurrentTemplate('mappings', val)}
            baseRow={baseRow}
            setBaseRow={(val) => updateCurrentTemplate('baseRow', val)}
            isDynamicRows={isDynamicRows}
            setIsDynamicRows={(val) => updateCurrentTemplate('isDynamicRows', val)}
            onReset={() => {
              if (confirm("Reset blocks and mappings for this template?")) {
                updateCurrentTemplate('blocks', defaultBlocks);
                updateCurrentTemplate('mappings', {});
                updateCurrentTemplate('baseRow', null);
              }
            }}
          />

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <DocxExport 
              excelData={excelData} 
              mappings={mappings} 
              blocks={blocks}
              baseRow={baseRow}
              isDynamicRows={isDynamicRows}
            />
          </div>

          {previewMode && (
            <LivePreview 
              excelData={excelData} 
              mappings={mappings} 
              blocks={blocks}
              baseRow={baseRow}
              isDynamicRows={isDynamicRows}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
