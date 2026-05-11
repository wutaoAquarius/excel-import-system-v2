import type { OrderRow, SystemField } from '@/types/order';
import type { ColumnMapping } from '@/types/template';
import type { AddressPartInfo } from './matcher';
import { mergeAddressParts } from './matcher';
import { FIELD_TO_KEY } from '@/types/order';

/**
 * 根据列映射关系，将原始解析数据转换为 OrderRow[]
 * 支持地址拆分合并（模板 D）
 */
export function applyMapping(
  rawRows: Record<string, string | number | null>[],
  mappings: ColumnMapping[],
  addressParts: AddressPartInfo | null
): OrderRow[] {
  // 构建 列名 → 系统字段 的映射
  const colToField: Record<string, SystemField> = {};
  mappings.forEach((m) => {
    if (m.targetField) {
      colToField[m.sourceColumn] = m.targetField as SystemField;
    }
  });

  return rawRows.map((raw, index) => {
    const row: OrderRow = {
      key: `row-${index}`,
      rowIndex: index + 1,
      senderName: '',
      senderPhone: '',
      senderAddress: '',
      receiverName: '',
      receiverPhone: '',
      receiverAddress: '',
      weight: '',
      quantity: '',
      temperature: '',
      externalCode: '',
      remark: '',
    };

    // 按映射填充字段
    Object.entries(colToField).forEach(([colName, sysField]) => {
      const key = FIELD_TO_KEY[sysField];
      if (key && key !== 'key' && key !== 'rowIndex') {
        const val = raw[colName];
        (row as unknown as Record<string, unknown>)[key] = val !== null && val !== undefined ? val : '';
      }
    });

    // 地址拆分合并处理
    if (addressParts) {
      if (
        addressParts.senderParts &&
        Object.keys(addressParts.senderParts).length > 0 &&
        !row.senderAddress
      ) {
        row.senderAddress = mergeAddressParts(raw, addressParts.senderParts);
      }
      if (
        addressParts.receiverParts &&
        Object.keys(addressParts.receiverParts).length > 0 &&
        !row.receiverAddress
      ) {
        row.receiverAddress = mergeAddressParts(raw, addressParts.receiverParts);
      }
    }

    return row;
  });
}
