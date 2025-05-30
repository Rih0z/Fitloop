// セキュリティ: XSS対策のためのサニタイズ関数
export const sanitizeInput = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // HTMLタグを除去
    .slice(0, 1000); // 最大長を制限
};

export const sanitizeForDisplay = (text: string): string => {
  if (!text || typeof text !== 'string') return '';
  
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

// ファイルアップロードの検証
export const validateFile = (file: File): { valid: boolean; error?: string } => {
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  
  if (!file.name.endsWith('.json')) {
    return { valid: false, error: 'JSONファイルのみアップロード可能です' };
  }
  
  if (file.size > MAX_SIZE) {
    return { valid: false, error: 'ファイルサイズは10MB以下にしてください' };
  }
  
  return { valid: true };
};

// インポートデータの検証
export const validateImportData = (data: any): boolean => {
  if (!data || typeof data !== 'object') return false;
  
  // 必須フィールドの確認
  const requiredFields = ['exportDate'];
  const hasRequiredFields = requiredFields.every(field => field in data);
  
  if (!hasRequiredFields) return false;
  
  // 各エンティティの基本的な検証
  if (data.profile && !Array.isArray(data.profile)) return false;
  if (data.context && !Array.isArray(data.context)) return false;
  if (data.prompts && !Array.isArray(data.prompts)) return false;
  if (data.sessions && !Array.isArray(data.sessions)) return false;
  
  return true;
};