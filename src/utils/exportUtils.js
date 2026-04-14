export function generateTableStructure({ excelData, mappings, blocks, baseRow, isDynamicRows }) {
  if (!excelData || baseRow === null || Object.keys(mappings).length === 0 || blocks.length === 0) {
    return { headers: [], rows: [] };
  }

  const maxConfigRows = Math.max(1, ...blocks.map(b => b.type === 'multi' ? parseInt(b.rows) || 1 : 1));
  
  // Flatten headers identically to Word's grid expectations
  const headers = blocks.flatMap(b => b.fields.map(f => f.name));
  const outputRows = [];

  for (let r = baseRow; r < excelData.length; r++) {
    const rowData = excelData[r];
    // Skip entirely empty horizontal excel rows (e.g., EOF padding)
    if (!rowData || rowData.length === 0 || rowData.every(c => !String(c).trim())) {
      continue; 
    }

    let actualGroupRows = maxConfigRows;

    // Batch 4 Logic: Dynamic Participant Count Truncation
    if (isDynamicRows) {
      let highestPopulated = 0;
      blocks.forEach(b => {
        if (b.type === 'multi') {
          for (let tr = 0; tr < b.rows; tr++) {
             let hasData = false;
             for (let f of b.fields) {
               const mappingId = `${b.id}_${f.id}_${tr}`;
               const colIndex = mappings[mappingId];
               if (colIndex !== undefined) {
                 const cellText = String(rowData[colIndex] || "").trim();
                 if (cellText) hasData = true;
               }
             }
             if (hasData) {
               highestPopulated = Math.max(highestPopulated, tr + 1);
             }
          }
        }
      });
      // Fallback to exactly 1 row even if NO participants exist, so we can still print single fields like Team Title
      actualGroupRows = Math.max(1, highestPopulated);
    }

    // Unspool mapped data row by row
    for (let teamRow = 0; teamRow < actualGroupRows; teamRow++) {
      const rowCells = [];
      
      blocks.forEach(b => {
        b.fields.forEach(f => {
          if (b.type === 'single') {
            if (teamRow === 0) {
              const mappingId = `${b.id}_${f.id}`;
              const colIndex = mappings[mappingId];
              const val = colIndex !== undefined ? rowData[colIndex] : "";
              rowCells.push({ text: String(val || ""), rowSpan: actualGroupRows, isSkip: false });
            } else {
              rowCells.push({ isSkip: true });
            }
          } else {
            // Multi block
            if (teamRow < b.rows) {
              const mappingId = `${b.id}_${f.id}_${teamRow}`;
              const colIndex = mappings[mappingId];
              let val = colIndex !== undefined ? rowData[colIndex] : "";
              rowCells.push({ text: String(val || ""), rowSpan: 1, isSkip: false });
            } else {
              // Padding necessary to keep strict native grid logic without breaking columns
              rowCells.push({ text: "", rowSpan: 1, isSkip: false });
            }
          }
        });
      });
      outputRows.push(rowCells);
    }
  }

  return { headers, rows: outputRows };
}
