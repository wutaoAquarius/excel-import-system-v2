/**
 * 模板指纹生成
 * 基于表头列名排序后生成唯一哈希，用于模板记忆学习
 */

/**
 * 简单哈希函数（djb2 算法）
 * 不依赖外部库，浏览器端可用
 */
function hashString(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  // 转为正数的十六进制字符串
  return (hash >>> 0).toString(16).padStart(8, '0');
}

/**
 * 生成模板指纹
 * 将表头列名归一化（trim + toLowerCase）后排序，拼接并取哈希
 */
export function generateFingerprint(headers: string[]): string {
  const normalized = headers
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean)
    .sort();
  return hashString(normalized.join('|'));
}

/**
 * 计算两组表头的相似度（Jaccard 系数）
 * 用于模糊匹配历史模板
 */
export function calculateHeaderSimilarity(
  headersA: string[],
  headersB: string[]
): number {
  const setA = new Set(headersA.map((h) => h.trim().toLowerCase()));
  const setB = new Set(headersB.map((h) => h.trim().toLowerCase()));

  const intersection = new Set([...setA].filter((x) => setB.has(x)));
  const union = new Set([...setA, ...setB]);

  if (union.size === 0) return 0;
  return intersection.size / union.size;
}
