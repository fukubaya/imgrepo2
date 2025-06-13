// Fabric.jsの型定義を簡略化
import { Canvas, Textbox } from "fabric";

// エディタの状態
export interface EditorState {
  canvas: Canvas | null;
  backgroundImage: string | null;
  selectedObject: Textbox | null;
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
  textBackgroundColor?: string | null;
}

// 履歴管理
export interface HistoryState {
  undoStack: string[];
  redoStack: string[];
}

// 色
export interface Color {
  r: number;
  g: number;
  b: number;
  a?: number; // オプションでアルファ値
}

/**
 * @see https://stackoverflow.com/questions/51503754/typescript-type-beforeinstallpromptevent
 */
export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}
