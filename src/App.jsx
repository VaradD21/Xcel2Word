import React, { useState, useEffect } from 'react';
import ExcelUploader from './components/ExcelUploader';
import TemplateMapper from './components/TemplateMapper';
import DocxExport from './components/DocxExport';
import { FileUp, TableProperties } from 'lucide-react';

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

function App() {
  const [excelData, setExcelData] = useState(null);
  const [baseRow, setBaseRow] = useState(null);
  
  const [blocks, setBlocks] = useState(defaultBlocks);
  const [mappings, setMappings] = useState({});
  const [activeTemplateCell, setActiveTemplateCell] = useState(null);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("templateConfig");
    if (saved) {
      try {
        const config = JSON.parse(saved);
        if (config.blocks) setBlocks(config.blocks);
        if (config.mappings) setMappings(config.mappings);
        if (config.baseRow !== undefined) setBaseRow(config.baseRow);
      } catch (e) {
        console.error("Local storage decode error", e);
      }
    }
  }, []);

  // Save to localStorage when config changes
  useEffect(() => {
    const config = { blocks, mappings, baseRow };
    localStorage.setItem("templateConfig", JSON.stringify(config));
  }, [blocks, mappings, baseRow]);

  const handleExcelCellClick = (rowIndex, colIndex) => {
    if (!activeTemplateCell) return;
    
    // Lock base row on first mapping
    if (baseRow === null) {
      setBaseRow(rowIndex);
    } else if (baseRow !== rowIndex) {
      alert("Please map all fields from the same starting Excel row. The tool will auto-increment rows downwards.");
      return;
    }

    setMappings(prev => ({
      ...prev,
      [activeTemplateCell]: colIndex
    }));
    setActiveTemplateCell(null);
  };

  const handleReset = () => {
    if (confirm("Reset blocks and mappings to default?")) {
      setBlocks(defaultBlocks);
      setMappings({});
      setBaseRow(null);
      setActiveTemplateCell(null);
      localStorage.removeItem("templateConfig");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-6">
      <header className="mb-6 pb-4 border-b border-gray-200">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <TableProperties className="text-blue-600" />
          Excel to Word Mapper
        </h1>
        <p className="text-gray-500 mt-2">Map your flat Excel data to an advanced custom template layout.</p>
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
                  Click an Excel cell to map it. {baseRow !== null ? `Base Row locked: ${baseRow + 1}` : ''}
                </p>
                <button 
                  onClick={() => { setExcelData(null); setMappings({}); setBaseRow(null); }}
                  className="text-sm text-red-600 hover:text-red-800 font-medium whitespace-nowrap ml-4"
                >
                  Change File
                </button>
              </div>
              <div className="overflow-auto border rounded-lg min-h-[300px]">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 sticky top-0 z-20">
                    <tr>
                      <th className="p-2 border-b border-r text-gray-400 font-medium w-12 text-center bg-gray-100 z-30 sticky left-0"></th>
                      {excelData[0]?.map((_, colIndex) => (
                        <th key={colIndex} className="p-2 border-b border-r font-medium text-gray-600 min-w-[100px]">
                          Col {colIndex + 1}
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
                              onClick={() => handleExcelCellClick(rowIndex, colIndex)}
                              className={`
                                p-2 border-b border-r cursor-pointer min-w-[100px] truncate max-w-[200px]
                                ${activeTemplateCell && baseRow === null ? 'hover:bg-blue-200' : ''}
                                ${activeTemplateCell && baseRow === rowIndex ? 'hover:bg-blue-200' : ''}
                                ${activeTemplateCell && baseRow !== null && baseRow !== rowIndex ? 'cursor-not-allowed opacity-50' : ''}
                                ${isMapped ? 'bg-blue-100 font-medium text-blue-800' : ''}
                              `}
                              title={cell}
                            >
                              {cell}
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
            blocks={blocks}
            setBlocks={setBlocks}
            activeCell={activeTemplateCell}
            setActiveCell={setActiveTemplateCell}
            mappings={mappings}
            setMappings={setMappings}
            onReset={handleReset}
          />

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <DocxExport 
              excelData={excelData} 
              mappings={mappings} 
              blocks={blocks}
              baseRow={baseRow} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
