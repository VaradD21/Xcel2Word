import React from 'react';
import { LayoutTemplate, RefreshCw, Hand } from 'lucide-react';

export default function TemplateMapper({ activeCell, setActiveCell, mappings, onReset }) {
  
  const renderCell = (id, label, rowSpan = 1) => {
    const isMapped = mappings[id] !== undefined;
    const isActive = activeCell === id;
    
    return (
      <td 
        rowSpan={rowSpan}
        onClick={() => setActiveCell(isActive ? null : id)}
        className={`
          p-3 border cursor-pointer font-medium transition-all text-sm
          ${isActive ? 'bg-blue-100 ring-2 ring-blue-500 border-transparent z-10 relative shadow-sm' : 'bg-white hover:bg-gray-50 border-gray-200'}
          ${isMapped && !isActive ? 'bg-green-50 text-green-800 border-green-200' : 'text-gray-700'}
        `}
      >
        <div className="flex flex-col gap-1.5 min-w-[120px]">
          <span>{label}</span>
          {isMapped ? (
             <span className="text-xs font-bold text-green-700 rounded bg-green-200 px-2 py-0.5 w-max">
              → Col {mappings[id] + 1}
            </span>
          ) : (
            <span className="text-xs text-gray-400 font-normal">Click to map</span>
          )}
        </div>
      </td>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
          <LayoutTemplate size={20} /> Template Builder
        </h2>
        <button 
          onClick={onReset}
          className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-800 px-3 py-1.5 rounded-md hover:bg-gray-100 transition"
        >
          <RefreshCw size={14} /> Reset Mappings
        </button>
      </div>

      <div className="bg-yellow-50 text-yellow-800 p-3 rounded-md mb-4 text-sm flex items-start gap-2 border border-yellow-200">
        <Hand size={16} className="mt-0.5 shrink-0" />
        <p>
          <strong>Mapping Mode:</strong> Click a cell below, then click a column in the Excel preview to map them. 
          Multi-row participant layout applies to all generated teams.
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-left bg-white">
          <thead className="bg-gray-100 text-gray-600 text-xs uppercase">
            <tr>
              <th className="p-3 border-b text-center">SR NO</th>
              <th className="p-3 border-b">TEAM TITLE</th>
              <th className="p-3 border-b">DOMAIN</th>
              <th className="p-3 border-b">PARTICIPANT NAME</th>
              <th className="p-3 border-b">PHONE NUMBER</th>
              <th className="p-3 border-b">COLLEGE</th>
              <th className="p-3 border-b">SIGN</th>
            </tr>
          </thead>
          <tbody>
            {/* Participant 1 Row */}
            <tr>
              {renderCell('sr_no', 'SR NO', 4)}
              {renderCell('team_title', 'TEAM TITLE', 4)}
              {renderCell('domain', 'DOMAIN', 4)}
              {renderCell('p1_name', 'Participant 1 Name')}
              {renderCell('p1_phone', 'Participant 1 Phone')}
              {renderCell('p1_college', 'Participant 1 College')}
              {renderCell('p1_sign', 'Participant 1 Sign (Empty)')}
            </tr>
            {/* Participant 2 Row */}
            <tr>
              {renderCell('p2_name', 'Participant 2 Name')}
              {renderCell('p2_phone', 'Participant 2 Phone')}
              {renderCell('p2_college', 'Participant 2 College')}
              {renderCell('p2_sign', 'Participant 2 Sign (Empty)')}
            </tr>
            {/* Participant 3 Row */}
            <tr>
              {renderCell('p3_name', 'Participant 3 Name')}
              {renderCell('p3_phone', 'Participant 3 Phone')}
              {renderCell('p3_college', 'Participant 3 College')}
              {renderCell('p3_sign', 'Participant 3 Sign (Empty)')}
            </tr>
            {/* Participant 4 Row */}
            <tr>
              {renderCell('p4_name', 'Participant 4 Name')}
              {renderCell('p4_phone', 'Participant 4 Phone')}
              {renderCell('p4_college', 'Participant 4 College')}
              {renderCell('p4_sign', 'Participant 4 Sign (Empty)')}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
