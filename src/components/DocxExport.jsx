import React, { useState } from 'react';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, VerticalAlign, WidthType, BorderStyle } from 'docx';
import { DownloadCloud, Loader2 } from 'lucide-react';

export default function DocxExport({ excelData, mappings, baseRow }) {
  const [isExporting, setIsExporting] = useState(false);

  const canExport = excelData && baseRow !== null && Object.keys(mappings).length > 0;

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
      const headerRow = new TableRow({
        children: [
          createCell("SR NO"),
          createCell("TEAM TITLE"),
          createCell("DOMAIN"),
          createCell("PARTICIPANT NAME"),
          createCell("PHONE NUMBER"),
          createCell("COLLEGE"),
          createCell("SIGN")
        ],
        tableHeader: true
      });
      tableRows.push(headerRow);

      // Iterate over excel rows from baseRow onwards
      for (let r = baseRow; r < excelData.length; r++) {
        const rowData = excelData[r];
        // Skip completely empty rows
        if (!rowData || rowData.length === 0 || rowData.every(c => !String(c).trim())) {
          continue;
        }

        const getValue = (key) => {
          const colIndex = mappings[key];
          if (colIndex === undefined) return "";
          const val = rowData[colIndex];
          return (val !== undefined && val !== null) ? val : "";
        };

        // Create standard styling for rowspanned cells
        const mergedOptions = { rowSpan: 4, verticalAlign: VerticalAlign.CENTER };

        // Participant 1 row (includes merged columns)
        tableRows.push(new TableRow({
          children: [
            createCell(getValue('sr_no'), mergedOptions),
            createCell(getValue('team_title'), mergedOptions),
            createCell(getValue('domain'), mergedOptions),
            createCell(getValue('p1_name')),
            createCell(getValue('p1_phone')),
            createCell(getValue('p1_college')),
            createCell(getValue('p1_sign'))
          ]
        }));

        // Participant 2 row (skips the first 3 merged columns)
        tableRows.push(new TableRow({
          children: [
            createCell(getValue('p2_name')),
            createCell(getValue('p2_phone')),
            createCell(getValue('p2_college')),
            createCell(getValue('p2_sign'))
          ]
        }));

        // Participant 3 row (skips the first 3 merged columns)
        tableRows.push(new TableRow({
          children: [
            createCell(getValue('p3_name')),
            createCell(getValue('p3_phone')),
            createCell(getValue('p3_college')),
            createCell(getValue('p3_sign'))
          ]
        }));

        // Participant 4 row (skips the first 3 merged columns)
        tableRows.push(new TableRow({
          children: [
            createCell(getValue('p4_name')),
            createCell(getValue('p4_phone')),
            createCell(getValue('p4_college')),
            createCell(getValue('p4_sign'))
          ]
        }));
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
          children: [table],
        }],
      });

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Generated_Word_Table.docx';
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
        <h3 className="text-lg font-semibold text-gray-800">Generate Word Document</h3>
        <p className="text-sm text-gray-500 max-w-sm">
          Map your Excel entries first. The app will auto-fill from the selected base row to the end of the sheet, respecting your 4-row participant structure.
        </p>
      </div>
      <button
        onClick={handleExport}
        disabled={!canExport || isExporting}
        className={`
          flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-white transition-all
          ${!canExport 
            ? 'bg-gray-300 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-md hover:shadow-lg'}
        `}
      >
        {isExporting ? <Loader2 size={20} className="animate-spin" /> : <DownloadCloud size={20} />}
        {isExporting ? 'Generating...' : 'Generate Docx'}
      </button>
    </div>
  );
}
