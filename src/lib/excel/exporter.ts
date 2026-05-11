import ExcelJS from 'exceljs';
import type { OrderRow } from '@/types/order';

/** 列配置 */
const EXPORT_COLUMNS: { header: string; key: keyof OrderRow; width: number }[] = [
  { header: '行号', key: 'rowIndex', width: 8 },
  { header: '发件人姓名', key: 'senderName', width: 15 },
  { header: '发件人电话', key: 'senderPhone', width: 15 },
  { header: '发件人地址', key: 'senderAddress', width: 30 },
  { header: '收件人姓名', key: 'receiverName', width: 15 },
  { header: '收件人电话', key: 'receiverPhone', width: 15 },
  { header: '收件人地址', key: 'receiverAddress', width: 30 },
  { header: '重量(kg)', key: 'weight', width: 10 },
  { header: '件数', key: 'quantity', width: 8 },
  { header: '温层', key: 'temperature', width: 10 },
  { header: '外部编码', key: 'externalCode', width: 15 },
  { header: '备注', key: 'remark', width: 20 },
];

/**
 * 将数据导出为 Excel 文件并触发浏览器下载
 */
export async function exportToExcel(
  data: OrderRow[],
  fileName: string = '运单数据.xlsx'
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = '万能导入系统';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('运单数据');

  // 设置列
  worksheet.columns = EXPORT_COLUMNS.map((col) => ({
    header: col.header,
    key: col.key,
    width: col.width,
  }));

  // 设置表头样式
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1677FF' },
  };
  headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
  headerRow.height = 24;

  // 填充数据
  data.forEach((row) => {
    const rowData: Record<string, unknown> = {};
    EXPORT_COLUMNS.forEach((col) => {
      rowData[col.key] = row[col.key] ?? '';
    });
    worksheet.addRow(rowData);
  });

  // 生成文件并下载
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}
