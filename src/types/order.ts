/** 运单数据行 */
export interface OrderRow {
  key: string;
  rowIndex: number;
  senderName: string;
  senderPhone: string;
  senderAddress: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  weight: number | string;
  quantity: number | string;
  temperature: string;
  externalCode?: string;
  remark?: string;
}

/** 系统标准字段名 */
export type SystemField =
  | '发件人姓名'
  | '发件人电话'
  | '发件人地址'
  | '收件人姓名'
  | '收件人电话'
  | '收件人地址'
  | '重量'
  | '件数'
  | '温层'
  | '外部编码'
  | '备注';

/** 系统字段 → OrderRow key 的映射 */
export const FIELD_TO_KEY: Record<SystemField, keyof OrderRow> = {
  '发件人姓名': 'senderName',
  '发件人电话': 'senderPhone',
  '发件人地址': 'senderAddress',
  '收件人姓名': 'receiverName',
  '收件人电话': 'receiverPhone',
  '收件人地址': 'receiverAddress',
  '重量': 'weight',
  '件数': 'quantity',
  '温层': 'temperature',
  '外部编码': 'externalCode',
  '备注': 'remark',
};

/** 提交结果 */
export interface SubmitResult {
  total: number;
  success: number;
  failed: number;
  failedRows?: { row: number; reason: string }[];
}
