import React, { useState } from 'react';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, VerticalAlign, WidthType } from 'docx';
import { DownloadCloud, Loader2 } from 'lucide-react';

export default function DocxExport({ excelData, mappings, blocks, baseRow }) {
  const [isExporting, setIsExporting] = useState(false);

  const canExport = excelData && baseRow !== null && Object.keys(mappings).length > 0 && blocks.length > 0;

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
      const maxRows = Math.max(1, ...blocks.map(b => b.type === 'multi' ? parseInt(b.rows) || 1 : 1));

      // Header Row
      const headerChildren = blocks.flatMap(b => 
        b.fields.map(f => createCell(f.name, { shading: { fill: "f3f4f6" } }))
      );
      tableRows.push(new TableRow({ children: headerChildren, tableHeader: true }));

      // Iterate through dataset
      for (let r = baseRow; r < excelData.length; r++) {
        const rowData = excelData[r];
        if (!rowData || rowData.length === 0 || rowData.every(c => !String(c).trim())) {
          continue; // Skip blank rows
        }

        // Each valid team expands to `maxRows` output rows
        for (let teamRow = 0; teamRow < maxRows; teamRow++) {
          const children = [];

          blocks.forEach(b => {
            b.fields.forEach(f => {
              if (b.type === 'single') {
                if (teamRow === 0) {
                  const mappingId = `${b.id}_${f.id}`;
                  const colIndex = mappings[mappingId];
                  const val = colIndex !== undefined ? rowData[colIndex] : "";
                  const finalVal = (val !== undefined && val !== null) ? val : "";
                  children.push(createCell(finalVal, { rowSpan: maxRows, verticalAlign: VerticalAlign.CENTER }));
                }
                // Skip pushing anything for subsequent teamRows to respect rowSpan
              } else {
                if (teamRow < b.rows) {
                  const mappingId = `${b.id}_${f.id}_${teamRow}`;
                  const colIndex = mappings[mappingId];
                  const val = colIndex !== undefined ? rowData[colIndex] : "";
                  const finalVal = (val !== undefined && val !== null) ? val : "";
                  children.push(createCell(finalVal));
                } else {
                  // Push empty cell to satisfy grid constraints for block fields exhausted before maxRows
                  children.push(createCell(''));
                }
              }
            });
          });

          tableRows.push(new TableRow({ children }));
        }
      }

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
          Compile mapped blocks directly into a `.docx` table structure. Blank rows are gracefully handled.
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
