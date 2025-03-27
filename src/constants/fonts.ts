import type { FontOption } from '../types';

// 利用可能なフォントのリスト
export const AVAILABLE_FONTS: FontOption[] = [
  // 基本フォント
  { value: 'Arial', label: 'Arial', category: 'sans-serif' },
  { value: 'Helvetica', label: 'Helvetica', category: 'sans-serif' },
  { value: 'Verdana', label: 'Verdana', category: 'sans-serif' },
  { value: 'Tahoma', label: 'Tahoma', category: 'sans-serif' },
  { value: 'Trebuchet MS', label: 'Trebuchet MS', category: 'sans-serif' },
  { value: 'Times New Roman', label: 'Times New Roman', category: 'serif' },
  { value: 'Georgia', label: 'Georgia', category: 'serif' },
  { value: 'Garamond', label: 'Garamond', category: 'serif' },
  { value: 'Courier New', label: 'Courier New', category: 'monospace' },
  { value: 'Consolas', label: 'Consolas', category: 'monospace' },
  
  // 日本語フォント
  { value: 'Hiragino Sans', label: 'ヒラギノ角ゴ', category: 'japanese' },
  { value: 'Hiragino Mincho', label: 'ヒラギノ明朝', category: 'japanese' },
  { value: 'YuGothic', label: '游ゴシック', category: 'japanese' },
  { value: 'YuMincho', label: '游明朝', category: 'japanese' },
  { value: 'Meiryo', label: 'メイリオ', category: 'japanese' },
  { value: 'MS PGothic', label: 'MS Pゴシック', category: 'japanese' },
  
  // 装飾フォント
  { value: 'Comic Sans MS', label: 'Comic Sans MS', category: 'decorative' },
  { value: 'Impact', label: 'Impact', category: 'decorative' },
  { value: 'Papyrus', label: 'Papyrus', category: 'decorative' },
  { value: 'Brush Script MT', label: 'Brush Script MT', category: 'decorative' }
];

// フォントカテゴリー
export const FONT_CATEGORIES = [
  { value: 'sans-serif', label: 'ゴシック体' },
  { value: 'serif', label: '明朝体' },
  { value: 'monospace', label: '等幅' },
  { value: 'japanese', label: '日本語' },
  { value: 'decorative', label: '装飾' }
];

// デフォルトフォント
export const DEFAULT_FONT = 'Arial';
