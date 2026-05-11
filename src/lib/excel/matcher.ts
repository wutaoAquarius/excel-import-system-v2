import { compareTwoStrings } from 'string-similarity';
import { FIELD_ALIASES, ADDRESS_PART_KEYWORDS } from '@/lib/constants';
import type { SystemField } from '@/types/order';
import type { ColumnMapping } from '@/types/template';

/** 模糊匹配阈值 */
const SIMILARITY_THRESHOLD = 0.5;

/**
 * 三级匹配策略：对 Excel 表头列名进行自动识别
 * 1. 精确匹配：trim + toLowerCase 后直接命中别名表
 * 2. 模糊匹配：string-similarity 计算相似度
 * 3. 地址拆分检测：识别省/市/区/详细地址列
 */
export function autoMatchColumns(headers: string[]): {
  mappings: ColumnMapping[];
  addressParts: AddressPartInfo | null;
} {
  const usedFields = new Set<string>();
  const mappings: ColumnMapping[] = [];

  // 先检测地址拆分情况
  const addressParts = detectAddressParts(headers);

  headers.forEach((header) => {
    const trimmed = header.trim();
    const lower = trimmed.toLowerCase();

    // 如果是地址拆分的子列，先跳过（后面统一处理）
    if (addressParts && isAddressPartColumn(header, addressParts)) {
      mappings.push({
        sourceColumn: header,
        targetField: null, // 地址拆分列暂时标记为 null，会在外层合并
        isAutoMatched: true,
        confidence: 0,
      });
      return;
    }

    // 第一级：精确匹配
    let matched = false;
    for (const [field, aliases] of Object.entries(FIELD_ALIASES)) {
      if (usedFields.has(field)) continue;
      const exactMatch = aliases.some(
        (alias) => alias.toLowerCase() === lower || alias === trimmed
      );
      if (exactMatch) {
        mappings.push({
          sourceColumn: header,
          targetField: field,
          isAutoMatched: true,
          confidence: 1,
        });
        usedFields.add(field);
        matched = true;
        break;
      }
    }
    if (matched) return;

    // 第二级：模糊匹配
    let bestMatch: { field: string; score: number } | null = null;
    for (const [field, aliases] of Object.entries(FIELD_ALIASES)) {
      if (usedFields.has(field)) continue;
      for (const alias of aliases) {
        const score = compareTwoStrings(lower, alias.toLowerCase());
        if (score > SIMILARITY_THRESHOLD && (!bestMatch || score > bestMatch.score)) {
          bestMatch = { field, score };
        }
      }
    }
    if (bestMatch) {
      mappings.push({
        sourceColumn: header,
        targetField: bestMatch.field,
        isAutoMatched: true,
        confidence: Number(bestMatch.score.toFixed(2)),
      });
      usedFields.add(bestMatch.field);
      return;
    }

    // 未识别
    mappings.push({
      sourceColumn: header,
      targetField: null,
      isAutoMatched: false,
      confidence: 0,
    });
  });

  return { mappings, addressParts };
}

/** 地址拆分信息 */
export interface AddressPartInfo {
  type: 'sender' | 'receiver' | 'both';
  senderParts: { province?: string; city?: string; district?: string; detail?: string };
  receiverParts: { province?: string; city?: string; district?: string; detail?: string };
}

/**
 * 检测表头中是否包含拆分的地址字段（省、市、区、详细地址）
 */
function detectAddressParts(headers: string[]): AddressPartInfo | null {
  const lowers = headers.map((h) => h.trim().toLowerCase());
  const parts: AddressPartInfo = {
    type: 'both',
    senderParts: {},
    receiverParts: {},
  };

  let hasAnyPart = false;

  // 检测收件人地址拆分
  for (const h of headers) {
    const hl = h.trim().toLowerCase();
    for (const kw of ADDRESS_PART_KEYWORDS.province) {
      if (hl.includes(kw.toLowerCase())) {
        if (hl.includes('发') || hl.includes('sender')) {
          parts.senderParts.province = h;
        } else {
          parts.receiverParts.province = h;
        }
        hasAnyPart = true;
      }
    }
    for (const kw of ADDRESS_PART_KEYWORDS.city) {
      if (hl.includes(kw.toLowerCase())) {
        if (hl.includes('发') || hl.includes('sender')) {
          parts.senderParts.city = h;
        } else {
          parts.receiverParts.city = h;
        }
        hasAnyPart = true;
      }
    }
    for (const kw of ADDRESS_PART_KEYWORDS.district) {
      if (hl.includes(kw.toLowerCase())) {
        if (hl.includes('发') || hl.includes('sender')) {
          parts.senderParts.district = h;
        } else {
          parts.receiverParts.district = h;
        }
        hasAnyPart = true;
      }
    }
    for (const kw of ADDRESS_PART_KEYWORDS.detail) {
      if (hl.includes(kw.toLowerCase())) {
        if (hl.includes('发') || hl.includes('sender')) {
          parts.senderParts.detail = h;
        } else {
          parts.receiverParts.detail = h;
        }
        hasAnyPart = true;
      }
    }
  }

  return hasAnyPart ? parts : null;
}

function isAddressPartColumn(header: string, parts: AddressPartInfo): boolean {
  const allParts = [
    ...Object.values(parts.senderParts),
    ...Object.values(parts.receiverParts),
  ];
  return allParts.includes(header);
}

/**
 * 合并地址拆分字段到完整地址
 */
export function mergeAddressParts(
  row: Record<string, string | number | null>,
  parts: { province?: string; city?: string; district?: string; detail?: string }
): string {
  const segments = [
    parts.province ? String(row[parts.province] ?? '') : '',
    parts.city ? String(row[parts.city] ?? '') : '',
    parts.district ? String(row[parts.district] ?? '') : '',
    parts.detail ? String(row[parts.detail] ?? '') : '',
  ];
  return segments.filter(Boolean).join('');
}
