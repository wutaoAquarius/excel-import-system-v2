/** 单条校验错误 */
export interface ValidationError {
  rowIndex: number;
  field: string;
  message: string;
}

/** 校验结果 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}
