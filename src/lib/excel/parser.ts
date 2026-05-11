import ExcelJS from 'exceljs';

export interface ParseResult {
  headers: string[];
  rows: Record<string, string | number | null>[];
  sheetName: string;
}

/**
 * 解析 Excel 文件（浏览器端）
 * 支持 .xlsx 和 .xls 格式
 * 自动检测表头行（跳过空行和合并单元格标题）
 */
export async function parseExcelFile(
  file: File,
  onProgress?: (percent: number) => void
): Promise<ParseResult> {
  const arrayBuffer = await file.arrayBuffer();

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(arrayBuffer);

  // 取第一个有效 Sheet
  const worksheet = workbook.worksheets.find((ws) => ws.rowCount > 0);
  if (!worksheet) {
    throw new Error('无法找到有效的数据表，请检查文件结构');
  }

  // 自动检测表头行：找第一个有 2 个以上非空单元格的行
  let headerRowIndex = 1;
  for (let i = 1; i <= Math.min(worksheet.rowCount, 10); i++) {
    const row = worksheet.getRow(i);
    const nonEmptyCells = row.values
      ? (row.values as (string | number | null)[]).filter(
          (v) => v !== null && v !== undefined && String(v).trim() !== ''
        )
      : [];
    if (nonEmptyCells.length >= 2) {
      headerRowIndex = i;
      break;
    }
  }

  // 提取表头
  const headerRow = worksheet.getRow(headerRowIndex);
  const headers: string[] = [];
  const colIndexMap: number[] = []; // 记录有效列的实际索引

  headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
    const headerName = String(cell.value ?? '').trim();
    if (headerName) {
      headers.push(headerName);
      colIndexMap.push(colNumber);
    }
  });

  if (headers.length === 0) {
    throw new Error('无法识别表头，请检查文件格式');
  }

  // 提取数据行
  const totalDataRows = worksheet.rowCount - headerRowIndex;
  const rows: Record<string, string | number | null>[] = [];

  for (let i = headerRowIndex + 1; i <= worksheet.rowCount; i++) {
    const row = worksheet.getRow(i);
    const rowData: Record<string, string | number | null> = {};
    let hasData = false;

    colIndexMap.forEach((colIdx, headerIdx) => {
      const cell = row.getCell(colIdx);
      let value: string | number | null = null;

      if (cell.value !== null && cell.value !== undefined) {
        if (typeof cell.value === 'object' && 'result' in cell.value) {
          // 公式单元格，取结果值
          value = cell.value.result as string | number;
        } else if (typeof cell.value === 'object' && 'richText' in cell.value) {
          // 富文本
          value = (cell.value as ExcelJS.CellRichTextValue).richText
            .map((rt) => rt.text)
            .join('');
        } else {
          value = cell.value as string | number;
        }
        if (value !== null && value !== undefined) hasData = true;
      }

      rowData[headers[headerIdx]] = value;
    });

    // 跳过完全空的行
    if (hasData) {
      rows.push(rowData);
    }

    // 报告进度
    if (onProgress && totalDataRows > 0) {
      onProgress(Math.round(((i - headerRowIndex) / totalDataRows) * 100));
    }
  }

  if (rows.length === 0) {
    throw new Error('文件为空，没有有效的数据行');
  }

  return {
    headers,
    rows,
    sheetName: worksheet.name,
  };
}
