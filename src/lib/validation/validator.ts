import type { OrderRow } from '@/types/order';
import type { ValidationError } from '@/types/validation';

/** 电话号码正则 */
const PHONE_REGEX = /^1[3-9]\d{9}$/;

/** 合法温层值 */
const VALID_TEMPERATURES = ['常温', '冷藏', '冷冻'];

/**
 * 对全部数据行执行校验，返回错误列表。
 * 包含：必填校验、格式校验、外部编码批次内重复检测。
 */
export function validateAllRows(data: OrderRow[]): ValidationError[] {
  const errors: ValidationError[] = [];

  data.forEach((row) => {
    const ri = row.rowIndex;

    // ---- 发件人姓名 ----
    if (!row.senderName?.toString().trim()) {
      errors.push({ rowIndex: ri, field: '发件人姓名', message: '缺失必填字段' });
    }

    // ---- 发件人电话 ----
    const sPhone = row.senderPhone?.toString().trim() ?? '';
    if (!sPhone) {
      errors.push({ rowIndex: ri, field: '发件人电话', message: '缺失必填字段' });
    } else if (!PHONE_REGEX.test(sPhone)) {
      errors.push({
        rowIndex: ri,
        field: '发件人电话',
        message: `电话格式错误（当前值：${sPhone}）`,
      });
    }

    // ---- 发件人地址 ----
    if (!row.senderAddress?.toString().trim()) {
      errors.push({ rowIndex: ri, field: '发件人地址', message: '缺失必填字段' });
    }

    // ---- 收件人姓名 ----
    if (!row.receiverName?.toString().trim()) {
      errors.push({ rowIndex: ri, field: '收件人姓名', message: '缺失必填字段' });
    }

    // ---- 收件人电话 ----
    const rPhone = row.receiverPhone?.toString().trim() ?? '';
    if (!rPhone) {
      errors.push({ rowIndex: ri, field: '收件人电话', message: '缺失必填字段' });
    } else if (!PHONE_REGEX.test(rPhone)) {
      errors.push({
        rowIndex: ri,
        field: '收件人电话',
        message: `电话格式错误（当前值：${rPhone}）`,
      });
    }

    // ---- 收件人地址 ----
    if (!row.receiverAddress?.toString().trim()) {
      errors.push({ rowIndex: ri, field: '收件人地址', message: '缺失必填字段' });
    }

    // ---- 重量 ----
    const w = Number(row.weight);
    if (row.weight === '' || row.weight === null || row.weight === undefined) {
      errors.push({ rowIndex: ri, field: '重量', message: '缺失必填字段' });
    } else if (isNaN(w) || w <= 0) {
      errors.push({
        rowIndex: ri,
        field: '重量',
        message: `重量不是正数（当前值：${row.weight}）`,
      });
    }

    // ---- 件数 ----
    const q = Number(row.quantity);
    if (row.quantity === '' || row.quantity === null || row.quantity === undefined) {
      errors.push({ rowIndex: ri, field: '件数', message: '缺失必填字段' });
    } else if (isNaN(q) || q <= 0 || !Number.isInteger(q)) {
      errors.push({
        rowIndex: ri,
        field: '件数',
        message: `件数必须是正整数（当前值：${row.quantity}）`,
      });
    }

    // ---- 温层 ----
    const temp = row.temperature?.toString().trim() ?? '';
    if (!temp) {
      errors.push({ rowIndex: ri, field: '温层', message: '缺失必填字段' });
    } else if (!VALID_TEMPERATURES.includes(temp)) {
      errors.push({
        rowIndex: ri,
        field: '温层',
        message: `值不在范围内（当前值：${temp}），可选值：常温/冷藏/冷冻`,
      });
    }
  });

  // ---- 外部编码批次内重复检测 ----
  const codeMap: Record<string, number[]> = {};
  data.forEach((row) => {
    const code = row.externalCode?.toString().trim();
    if (code) {
      if (!codeMap[code]) codeMap[code] = [];
      codeMap[code].push(row.rowIndex);
    }
  });
  Object.entries(codeMap).forEach(([code, rows]) => {
    if (rows.length > 1) {
      rows.forEach((rowIdx) => {
        const otherRows = rows.filter((r) => r !== rowIdx);
        errors.push({
          rowIndex: rowIdx,
          field: '外部编码',
          message: `与第${otherRows.join('、')}行重复（${code}）`,
        });
      });
    }
  });

  // 按行号排序，同行内按字段出现顺序
  errors.sort((a, b) => a.rowIndex - b.rowIndex);

  return errors;
}
