import type { SystemField } from '@/types/order';

/**
 * 系统标准字段 → 已知别名列表
 * 用于自动识别不同 Excel 模板中的列名
 */
export const FIELD_ALIASES: Record<SystemField, string[]> = {
  '发件人姓名': [
    '发件人姓名', '发件人', '寄件人', '寄件人姓名', '寄方',
    'Sender Name', 'sender_name', 'SenderName', 'sender name',
  ],
  '发件人电话': [
    '发件人电话', '发件电话', '寄件人电话', '寄件电话', '发件人手机',
    'Sender Phone', 'sender_phone', 'SenderPhone', 'sender phone',
  ],
  '发件人地址': [
    '发件人地址', '发件地址', '寄件人地址', '寄件地址', '发件人完整地址',
    'Sender Address', 'sender_address', 'SenderAddress', 'sender address',
  ],
  '收件人姓名': [
    '收件人姓名', '收件人', '收货人', '收方', '收件人名称',
    'Receiver', 'Receiver Name', 'receiver_name', 'ReceiverName', 'receiver name',
    'Consignee', 'consignee',
  ],
  '收件人电话': [
    '收件人电话', '收件电话', '联系电话', '电话', '收货人电话', '收件人手机', '手机',
    'Phone', 'Receiver Phone', 'receiver_phone', 'ReceiverPhone', 'receiver phone',
    'Tel', 'tel', 'Mobile', 'mobile',
  ],
  '收件人地址': [
    '收件人地址', '收件地址', '完整地址', '地址', '收货地址', '收货人地址', '收件人完整地址',
    'Address', 'Receiver Address', 'receiver_address', 'ReceiverAddress', 'receiver address',
    'Delivery Address', 'delivery_address',
  ],
  '重量': [
    '重量', '重量(kg)', '重量（kg）', '货物重量', '包裹重量',
    'Weight', 'weight', 'Weight(kg)', 'weight(kg)',
  ],
  '件数': [
    '件数', '数量', '包裹数量', '包裹数', '件',
    'Quantity', 'quantity', 'Qty', 'qty', 'Count', 'count', 'Pieces', 'pieces',
  ],
  '温层': [
    '温层', '温度', '温度类型', '温控', '温度要求',
    'Temperature', 'temperature', 'Temp', 'temp',
  ],
  '外部编码': [
    '外部编码', '外部订单号', '外部单号', '客户编码', '客户单号', '订单号',
    'External Code', 'external_code', 'ExternalCode', 'Order No', 'order_no',
  ],
  '备注': [
    '备注', '说明', '附注', '注意事项',
    'Remark', 'remark', 'Note', 'note', 'Notes', 'notes', 'Comment', 'comment',
  ],
};

/** 必填字段列表 */
export const REQUIRED_FIELDS: SystemField[] = [
  '发件人姓名', '发件人电话', '发件人地址',
  '收件人姓名', '收件人电话', '收件人地址',
  '重量', '件数', '温层',
];

/** 所有系统字段 */
export const ALL_SYSTEM_FIELDS: SystemField[] = [
  '发件人姓名', '发件人电话', '发件人地址',
  '收件人姓名', '收件人电话', '收件人地址',
  '重量', '件数', '温层', '外部编码', '备注',
];

/** 地址拆分字段识别（模板 D 支持） */
export const ADDRESS_PART_KEYWORDS = {
  province: ['省', '省份', 'Province', 'province'],
  city: ['市', '城市', 'City', 'city'],
  district: ['区', '区县', 'District', 'district'],
  detail: ['详细地址', '详址', '街道', 'Detail Address', 'detail_address', 'Street', 'street'],
};

/** 合法温层值 */
export const VALID_TEMPERATURES = ['常温', '冷藏', '冷冻'];
