import React, { useCallback } from 'react';
import * as xlsx from 'xlsx';
import { UploadCloud } from 'lucide-react';

export default function ExcelUploader({ onDataLoaded }) {
  const handleFileUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = xlsx.read(bstr, { type: 'binary' });
      // Get first worksheet
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      // Convert array of arrays (header: 1)
      // defval ensures empty cells become empty strings rather than undefined, keeping grid structure even
      const data = xlsx.utils.sheet_to_json(ws, { header: 1, defval: '' });
      
      // Ensure all rows have at least max column count so UI table is strict rect
      const maxCols = Math.max(...data.map(r => r.length));
      const normalizedData = data.map(r => {
        const row = [...r];
        while (row.length < maxCols) row.push('');
        return row;
      });
      
      onDataLoaded(normalizedData);
    };
    reader.readAsBinaryString(file);
  }, [onDataLoaded]);

  return (
    <div className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
      <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <UploadCloud className="w-10 h-10 mb-3 text-gray-400" />
          <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
          <p className="text-xs text-gray-500">.xlsx or .xls Excel files</p>
        </div>
        <input 
          id="file-upload" 
          type="file" 
          className="hidden" 
          accept=".xlsx, .xls" 
          onChange={handleFileUpload} 
        />
      </label>
    </div>
  );
}
