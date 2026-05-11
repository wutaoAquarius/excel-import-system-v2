/** 列映射关系 */
export interface ColumnMapping {
  /** Excel 原始列名 */
  sourceColumn: string;
  /** 映射到的系统字段名，null 表示跳过 */
  targetField: string | null;
  /** 是否自动识别的 */
  isAutoMatched: boolean;
  /** 匹配置信度 0-1 */
  confidence: number;
}

/** 模板指纹记录 */
export interface TemplateRecord {
  fingerprint: string;
  headerNames: string[];
  mappingRules: Record<string, string>;
  lastUsedAt: string;
}
