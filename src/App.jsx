import React, { useState } from 'react';
import ExcelUploader from './components/ExcelUploader';
import TemplateMapper from './components/TemplateMapper';
import DocxExport from './components/DocxExport';
import { FileUp, TableProperties } from 'lucide-react';

function App() {
  const [excelData, setExcelData] = useState(null);
  const [baseRow, setBaseRow] = useState(null);
  const [mappings, setMappings] = useState({});
  const [activeTemplateCell, setActiveTemplateCell] = useState(null);

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
    if (confirm("Reset all mappings?")) {
      setMappings({});
      setBaseRow(null);
      setActiveTemplateCell(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-6">
      <header className="mb-6 pb-4 border-b border-gray-200">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <TableProperties className="text-blue-600" />
          Excel to Word Mapper
        </h1>
        <p className="text-gray-500 mt-2">Map your flat Excel data to a complex Word table template effortlessly.</p>
      </header>

      <div className="flex-1 grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Left Column: Excel Upload & Preview */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <h2 className="text-xl font-semibold mb-4 text-gray-700 flex items-center gap-2">
            <FileUp size={20} /> Data Source
          </h2>
          
          {!excelData ? (
            <ExcelUploader onDataLoaded={setExcelData} />
          ) : (
            <div className="flex-1 flex flex-col min-h-[400px]">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-gray-500">
                  Click an Excel cell to map it to the active template field. Base row locked: {baseRow !== null ? `Row ${baseRow + 1}` : 'None'}
                </p>
                <button 
                  onClick={() => { setExcelData(null); setMappings({}); setBaseRow(null); }}
                  className="text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  Change File
                </button>
              </div>
              <div className="overflow-auto border rounded-lg max-h-[600px]">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="p-2 border-b border-r text-gray-400 font-medium w-12 text-center bg-gray-100 z-10 sticky left-0"></th>
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
                        <td className="p-2 border-b border-r text-gray-400 font-medium text-center bg-gray-50 sticky left-0">
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
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <TemplateMapper 
            activeCell={activeTemplateCell}
            setActiveCell={setActiveTemplateCell}
            mappings={mappings}
            onReset={handleReset}
          />

          <div className="mt-8 pt-6 border-t border-gray-200">
            <DocxExport 
              excelData={excelData} 
              mappings={mappings} 
              baseRow={baseRow} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
