import React from 'react';
import { generateTableStructure } from '../utils/exportUtils';
import { Eye } from 'lucide-react';

export default function LivePreview({ excelData, mappings, blocks, baseRow, isDynamicRows }) {
  const { headers, rows } = generateTableStructure({ excelData, mappings, blocks, baseRow, isDynamicRows });
  
  if (rows.length === 0) return null;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col min-w-0">
      <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-2 mb-4 border-b pb-4">
        <Eye size={20} className="text-blue-500" /> Live Output Preview
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        This table structurally mirrors the exact Word (.docx) document output representation. Watch it evolve in real-time as you configure mappings.
      </p>
      <div className="overflow-x-auto max-h-[600px] border border-gray-300 shadow-inner rounded bg-gray-50 p-4 scrollbar-thin">
        <table className="w-full border-collapse bg-white text-sm text-gray-800 shadow-[0_0_5px_rgba(0,0,0,0.05)]">
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th key={i} className="border border-gray-300 bg-gray-100 p-2 text-left font-bold text-gray-700 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-blue-50/20">
                {r.map((cell, cIdx) => !cell.isSkip && (
                  <td 
                    key={cIdx} 
                    rowSpan={cell.rowSpan > 1 ? cell.rowSpan : undefined}
                    className="border border-gray-300 p-2 align-middle max-w-[200px] break-words whitespace-pre-wrap"
                  >
                    {cell.text}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
