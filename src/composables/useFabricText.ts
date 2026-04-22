import { markRaw } from "vue";
import type { TextEffectPreset } from "../types";
// Fabric.jsをインポート
import { Shadow, Textbox, type TextboxProps } from "fabric";
import { DEFAULT_FONT } from "../constants/fonts";

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
        originX: "left",
        originY: "top",
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
    textObject.setCoords();

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
    if (effect.textBackgroundColor) {
      effectOptions.textBackgroundColor = effect.textBackgroundColor; // 直接文字色を設定
    } else {
      effectOptions.textBackgroundColor = null;
    }

    // フォントスタイルの設定
    if (effect.fontWeight) {
      effectOptions.fontWeight = effect.fontWeight;
    }

    if (effect.fontStyle) {
      effectOptions.fontStyle = effect.fontStyle as any;
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
    textObject.setCoords();

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
    textObject.setCoords();

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
    textObject.setCoords();

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

  /**
   * カーソル位置でテキストを分割する
   * @param textObject テキストオブジェクト
   * @param callback 複製後のオブジェクトを配置するためのコールバック
   */
  const splitTextAtCursor = (textObject: Textbox, callback: (newText: Textbox) => void) => {
    const selectionStart = textObject.selectionStart || 0;
    const selectionEnd = textObject.selectionEnd || 0;
    const fullText = textObject.text || "";

    const splitIndex = Math.max(selectionStart, selectionEnd);
    if (splitIndex === 0 || splitIndex === fullText.length) {
      return; // 分割できない
    }

    const firstPart = fullText.slice(0, splitIndex);
    const secondPart = fullText.slice(splitIndex);

    textObject.set({ text: firstPart });
    textObject.canvas?.requestRenderAll();

    textObject.clone().then((cloned: Textbox) => {
      cloned.set({
        text: secondPart,
        left: textObject.left || 0,
        top: textObject.top || 0,
        editable: true,
      });
      callback(markRaw(cloned));
    });
  };

  let copiedStyles: Partial<TextboxProps & { textBackgroundColor?: string | null }> | null = null;

  /**
   * テキストスタイルとエフェクトをコピー
   * @param textObject テキストオブジェクト
   */
  const copyTextStylesAndEffects = (textObject: Textbox) => {
    copiedStyles = {
      fontFamily: textObject.fontFamily,
      fontSize: textObject.fontSize,
      fill: textObject.fill,
      fontWeight: textObject.fontWeight,
      fontStyle: textObject.fontStyle,
      underline: textObject.underline,
      textAlign: textObject.textAlign,
      scaleX: textObject.scaleX,
      scaleY: textObject.scaleY,
      lineHeight: textObject.lineHeight,
      shadow: textObject.shadow,
      stroke: textObject.stroke,
      strokeWidth: textObject.strokeWidth,
      textBackgroundColor: textObject.textBackgroundColor,
    };
  };

  /**
   * コピーしたテキストスタイルとエフェクトをペースト
   * @param textObject テキストオブジェクト
   */
  const pasteTextStylesAndEffects = (textObject: Textbox) => {
    if (copiedStyles) {
      updateTextStyle(textObject, copiedStyles);
    }
  };

  return {
    createText,
    updateTextStyle,
    applyTextEffect,
    setTextPosition,
    rotateText,
    updateTextContent,
    duplicateText,
    copyTextStylesAndEffects,
    pasteTextStylesAndEffects,
    splitTextAtCursor,
  };
}
