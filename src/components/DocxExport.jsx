import React, { useState } from 'react';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, VerticalAlign, WidthType } from 'docx';
import { DownloadCloud, Loader2 } from 'lucide-react';
import { generateTableStructure } from '../utils/exportUtils';

export default function DocxExport({ excelData, mappings, blocks, baseRow, isDynamicRows }) {
  const [isExporting, setIsExporting] = useState(false);

  // Derive logical data rows using shared architecture
  const { headers, rows } = generateTableStructure({ excelData, mappings, blocks, baseRow, isDynamicRows });
  const canExport = rows.length > 0;

  const createCell = (text, options = {}) => {
    return new TableCell({
      children: [new Paragraph(text ? String(text) : "")],
      ...options
    });
  };

  const handleExport = async () => {
    if (!canExport) return;
    setIsExporting(true);

    try {
      const tableRows = [];

      // Header Row
      const headerChildren = headers.map(h => createCell(h, { shading: { fill: "f3f4f6" } }));
      tableRows.push(new TableRow({ children: headerChildren, tableHeader: true }));

      // Map rows purely from shared structure state
      rows.forEach(r => {
        const children = [];
        r.forEach(cellObj => {
          if (!cellObj.isSkip) {
             const options = {};
             if (cellObj.rowSpan > 1) {
               options.rowSpan = cellObj.rowSpan;
               options.verticalAlign = VerticalAlign.CENTER;
             }
             children.push(createCell(cellObj.text, options));
          }
        });
        tableRows.push(new TableRow({ children }));
      });

      const table = new Table({
        rows: tableRows,
        width: {
          size: 100,
          type: WidthType.PERCENTAGE,
        },
      });

      const doc = new Document({
        sections: [{
          properties: {},
          children: [table],
        }],
      });

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Advanced_Word_Template.docx';
      a.click();
      URL.revokeObjectURL(url);

    } catch (err) {
      console.error("Failed to generate docx", err);
      alert("Failed to generate DOCX file. Check console.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-800">Generate Dynamic Word Table</h3>
        <p className="text-sm text-gray-500 max-w-sm mt-1">
          Compile mapped blocks directly into a `.docx` table structure. Config changes automatically pipe to the algorithm.
        </p>
      </div>
      <button
        onClick={handleExport}
        disabled={!canExport || isExporting}
        className={`
          flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-white transition-all
          ${!canExport 
            ? 'bg-gray-300 cursor-not-allowed' 
            : 'bg-green-600 hover:bg-green-700 active:bg-green-800 shadow-md hover:shadow-lg'}
        `}
      >
        {isExporting ? <Loader2 size={20} className="animate-spin" /> : <DownloadCloud size={20} />}
        {isExporting ? 'Generating Document...' : 'Generate Docx'}
      </button>
    </div>
  );
}
