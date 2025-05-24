// Fabric.jsの型定義を簡略化
import { IText } from 'fabric';

export interface FabricCanvas {
  width?: number;
  height?: number;
  add: (object: any) => void;
  remove: (object: any) => void;
  clear: () => void;
  setActiveObject: (object: any) => void;
  getActiveObject: () => any;
  discardActiveObject: () => void;
  requestRenderAll: () => void;
  loadFromJSON: (json: string, callback?: () => void) => void;
  toJSON: (propertiesToInclude?: string[]) => any;
  toDataURL: (options?: any) => string;
  [key: string]: any;
}

export interface FabricObject {
  type?: string;
  left?: number;
  top?: number;
  set: (options: any) => any;
  clone: (callback: (cloned: any) => void) => void;
  [key: string]: any;
}

export interface FabricShadow {
  color: string;
  blur: number;
  offsetX: number;
  offsetY: number;
}

// テキスト要素のオプション
export interface TextOptions {
  text: string;
  left: number;
  top: number;
  fontFamily: string;
  fontSize: number;
  fill: string;  // テキスト色
  fontWeight: string | number;  // 'normal', 'bold', または数値
  fontStyle: string;  // 'normal', 'italic'
  angle: number;  // 回転角度
  shadow: FabricShadow | null;  // 影効果
  stroke: string | null;  // アウトライン色
  strokeWidth: number;  // アウトライン幅
  textAlign: string;  // 'left', 'center', 'right'
  lineHeight: number;
  underline: boolean;
  overline: boolean;
  linethrough: boolean;
  editable: boolean;  // 直接編集可能かどうか
}

// エディタの状態
export interface EditorState {
  canvas: FabricCanvas | null;
  backgroundImage: string | null;
  selectedObject: IText | null;
  isEditing: boolean;
}

// フォント定義
export interface FontOption {
  value: string;
  label: string;
  category?: string;
}

// テキスト効果プリセット
export interface TextEffectPreset {
  name: string;
  shadow?: {
    color: string;
    blur: number;
    offsetX: number;
    offsetY: number;
  } | null;
  stroke?: string | null;
  strokeWidth?: number;
  fontWeight?: string | number;
  fontStyle?: string;
  fill?: string;
}

// 履歴管理
export interface HistoryState {
  undoStack: string[];
  redoStack: string[];
}
