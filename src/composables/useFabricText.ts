import { markRaw } from "vue";
import type { TextEffectPreset } from "../types";
// Fabric.jsをインポート
import { Shadow, Textbox, type TextboxProps } from "fabric";
import { DEFAULT_FONT } from "../constants/fonts";
import { hexToRgb } from "../lib/common";

/**
 * Fabric.jsのテキスト操作のためのコンポーザブル
 */
export function useFabricText() {
  /**
   * テキストオブジェクトの作成
   * @param text テキスト内容
   * @param options テキストオプション
   * @returns テキストオブジェクト
   */
  const createText = (text: string, options: Partial<TextboxProps> = {}): Textbox => {
    // テキストオブジェクトの作成
    return markRaw(
      new Textbox(text, {
        fontFamily: DEFAULT_FONT,
        fontSize: 30,
        fill: "rgb(0 0 0 / 100%)",
        fontWeight: "normal",
        fontStyle: "normal",
        textAlign: "left",
        editable: true,
        paintFirst: "stroke",
        textBackgroundColor: null,
        ...options,
      }),
    );
  };

  /**
   * テキストスタイルの更新
   * @param textObject テキストオブジェクト
   * @param styleOptions スタイルオプション
   */
  const updateTextStyle = (
    textObject: Textbox,
    styleOptions: Partial<TextboxProps & { textBackgroundColor?: string | null }>,
  ) => {
    // スタイルを適用
    textObject.set(styleOptions);

    // キャンバスの再描画をリクエスト
    if (textObject.canvas) {
      textObject.canvas.requestRenderAll();
    }
  };

  /**
   * テキスト効果の適用
   * @param textObject テキストオブジェクト
   * @param effect 効果プリセット
   */
  const applyTextEffect = (textObject: Textbox, effect: TextEffectPreset) => {
    // 効果のオプションを作成
    const effectOptions: Partial<TextboxProps & { textBackgroundColor?: string | null }> = {};

    // 影の設定
    if (effect.shadow) {
      effectOptions.shadow = new Shadow({
        color: effect.shadow.color,
        blur: effect.shadow.blur,
        offsetX: effect.shadow.offsetX,
        offsetY: effect.shadow.offsetY,
      });
    } else {
      effectOptions.shadow = null;
    }

    // アウトラインの設定
    if (effect.stroke) {
      effectOptions.stroke = effect.stroke;
      effectOptions.strokeWidth = effect.strokeWidth || 1;
    } else {
      effectOptions.stroke = null;
      effectOptions.strokeWidth = 0;
    }

    // 背景色の設定
    if (effect.backgroundColor) {
      const rgb = effect.backgroundColor.startsWith("#")
        ? hexToRgb(effect.backgroundColor)
        : effect.backgroundColor.match(/\d+,\s*\d+,\s*\d+/)?.[0] || "0,0,0";

      effectOptions.textBackgroundColor = `rgba(${rgb}, ${effect.backgroundColorOpacity || 1})`;
    } else {
      effectOptions.textBackgroundColor = null;
    }

    // フォントスタイルの設定
    if (effect.fontWeight) {
      effectOptions.fontWeight = effect.fontWeight;
    }

    if (effect.fontStyle) {
      effectOptions.fontStyle = effect.fontStyle;
    }

    if (effect.fill) {
      effectOptions.fill = effect.fill;
    }

    // スタイルを適用
    updateTextStyle(textObject, effectOptions);
  };

  /**
   * テキストの位置を設定
   * @param textObject テキストオブジェクト
   * @param left X座標
   * @param top Y座標
   */
  const setTextPosition = (textObject: Textbox, left: number, top: number) => {
    textObject.set({
      left,
      top,
    });

    // キャンバスの再描画をリクエスト
    if (textObject.canvas) {
      textObject.canvas.requestRenderAll();
    }
  };

  /**
   * テキストの回転を設定
   * @param textObject テキストオブジェクト
   * @param angle 角度（度）
   */
  const rotateText = (textObject: Textbox, angle: number) => {
    textObject.set({
      angle,
    });

    // キャンバスの再描画をリクエスト
    if (textObject.canvas) {
      textObject.canvas.requestRenderAll();
    }
  };

  /**
   * テキストの内容を更新
   * @param textObject テキストオブジェクト
   * @param newText 新しいテキスト内容
   */
  const updateTextContent = (textObject: Textbox, newText: string) => {
    textObject.set({
      text: newText,
    });

    // キャンバスの再描画をリクエスト
    if (textObject.canvas) {
      textObject.canvas.requestRenderAll();
    }
  };

  /**
   * テキストオブジェクトの複製
   * @param textObject テキストオブジェクト
   * @param callback 複製完了時のコールバック
   */
  const duplicateText = (textObject: Textbox, callback: (cloned: Textbox) => void) => {
    textObject.clone().then((cloned: Textbox) => {
      // 少しオフセットして配置
      cloned.set({
        left: (textObject.left || 0) + 20,
        top: (textObject.top || 0) + 20,
        evented: true,
      });

      callback(cloned);
    });
  };

  return {
    createText,
    updateTextStyle,
    applyTextEffect,
    setTextPosition,
    rotateText,
    updateTextContent,
    duplicateText,
  };
}
