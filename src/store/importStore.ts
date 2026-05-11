import { create } from 'zustand';
import type { OrderRow } from '@/types/order';
import type { ColumnMapping } from '@/types/template';
import type { ValidationError } from '@/types/validation';
import type { SubmitResult } from '@/types/order';
import type { AddressPartInfo } from '@/lib/excel/matcher';

/** 导入流程阶段 */
export type ImportPhase = 'upload' | 'mapping' | 'preview' | 'submitting' | 'result';

interface ImportState {
  /** 当前阶段 */
  phase: ImportPhase;
  /** 上传的文件名 */
  fileName: string;
  /** 解析出的表头 */
  headers: string[];
  /** 原始解析行数据（列名 → 值） */
  rawRows: Record<string, string | number | null>[];
  /** 列映射关系 */
  mappings: ColumnMapping[];
  /** 地址拆分信息 */
  addressParts: AddressPartInfo | null;
  /** 解析后的数据行（映射后） */
  data: OrderRow[];
  /** 校验错误列表 */
  errors: ValidationError[];
  /** 导入进度 0-100 */
  importProgress: number;
  /** 提交进度 0-100 */
  submitProgress: number;
  /** 提交结果 */
  submitResult: SubmitResult | null;
  /** 数据总行数 */
  totalRows: number;
  /** 是否使用了历史模板 */
  usedHistoryTemplate: boolean;
  /** 模板指纹 */
  fingerprint: string;

  // Actions
  setPhase: (phase: ImportPhase) => void;
  setFileName: (name: string) => void;
  setHeaders: (headers: string[]) => void;
  setRawRows: (rows: Record<string, string | number | null>[]) => void;
  setMappings: (mappings: ColumnMapping[]) => void;
  setAddressParts: (parts: AddressPartInfo | null) => void;
  setData: (data: OrderRow[]) => void;
  setErrors: (errors: ValidationError[]) => void;
  setImportProgress: (progress: number) => void;
  setSubmitProgress: (progress: number) => void;
  setSubmitResult: (result: SubmitResult | null) => void;
  setTotalRows: (count: number) => void;
  setUsedHistoryTemplate: (used: boolean) => void;
  setFingerprint: (fp: string) => void;
  reset: () => void;
}

const initialState = {
  phase: 'upload' as ImportPhase,
  fileName: '',
  headers: [],
  rawRows: [] as Record<string, string | number | null>[],
  mappings: [],
  addressParts: null as AddressPartInfo | null,
  data: [],
  errors: [],
  importProgress: 0,
  submitProgress: 0,
  submitResult: null,
  totalRows: 0,
  usedHistoryTemplate: false,
  fingerprint: '',
};

export const useImportStore = create<ImportState>((set) => ({
  ...initialState,
  setPhase: (phase) => set({ phase }),
  setFileName: (fileName) => set({ fileName }),
  setHeaders: (headers) => set({ headers }),
  setRawRows: (rawRows) => set({ rawRows }),
  setMappings: (mappings) => set({ mappings }),
  setAddressParts: (addressParts) => set({ addressParts }),
  setData: (data) => set({ data }),
  setErrors: (errors) => set({ errors }),
  setImportProgress: (importProgress) => set({ importProgress }),
  setSubmitProgress: (submitProgress) => set({ submitProgress }),
  setSubmitResult: (submitResult) => set({ submitResult }),
  setTotalRows: (totalRows) => set({ totalRows }),
  setUsedHistoryTemplate: (used) => set({ usedHistoryTemplate: used }),
  setFingerprint: (fingerprint) => set({ fingerprint }),
  reset: () => set(initialState),
}));
