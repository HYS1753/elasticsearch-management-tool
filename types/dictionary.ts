export type DictionaryType = 'user' | 'decompound' | 'synonym' | 'correction' | 'stopword';

export type DictionaryStatus = 'DRAFT' | 'APPROVED' | 'REJECTED' | 'APPLIED';

export interface DictionaryBase {
  index: number;
  delete_yn: string;
  status: DictionaryStatus;
  comment: string;
  author: string;
  approver?: string;
  created_at: string;
  created_at_kst: string;
  updated_at: string;
  updated_at_kst: string;
  applied_at?: string;
  applied_at_kst?: string;
}

export interface UserDictionary extends DictionaryBase {
  word: string;
}

export interface DecompoundDictionary extends DictionaryBase {
  compound_word: string;
  components: string[];
}

export interface SynonymDictionary extends DictionaryBase {
  synonyms: string[];
}

export interface CorrectionDictionary extends DictionaryBase {
  incorrect: string;
  corrected: string;
}

export interface StopwordDictionary extends DictionaryBase {
  word: string;
}

// Union of all dictionary entity types
export type DictionaryEntity =
  | UserDictionary
  | DecompoundDictionary
  | SynonymDictionary
  | CorrectionDictionary
  | StopwordDictionary;

// Request Payloads
export interface SearchDictionaryRequest {
  keyword?: string;
  skip?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: number;
  isAdmin?: boolean; // Determines if we fetch from /search or /admin/search
}

// Response Payloads
export interface DictionaryListResponse<T> {
  total_count: number;
  items: T[];
}

export interface ApiResponse<T> {
  code?: string;
  message?: string;
  data?: T;
  success?: boolean;
  error?: {
    message: string;
  };
}
