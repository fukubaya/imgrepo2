import { Rect, type RectProps } from "fabric";
import { markRaw } from "vue";

/**
 * Fabric.jsの矩形操作のためのコンポーザブル
 */
export function useFabricRect() {
  /**
   * 矩形オブジェクトの作成
   * @param options 矩形オプション
   * @returns 矩形オブジェクト
   */
  const createRect = (options: Partial<RectProps> = {}): Rect => {
    // 矩形オブジェクトの作成
    return markRaw(
      new Rect({
        originX: "left",
        originY: "top",
        left: 100,
        top: 100,
        fill: "#ffffff",
        width: 200,
        height: 200,
        strokeWidth: 2,
        strokeUniform: true,
        stroke: "#000000",
        hasControls: true,
        ...options,
      }),
    );
  };

  /**
   * 矩形スタイルの更新
   * @param rectObject 矩形オブジェクト
   * @param styleOptions スタイルオプション
   */
  const updateRectStyle = (
    rectObject: Rect,
    styleOptions: Partial<RectProps>,
  ) => {
    // スタイルを適用
    rectObject.set(styleOptions);

    // キャンバスの再描画をリクエスト
    if (rectObject.canvas) {
      rectObject.canvas.requestRenderAll();
    }
  };

  return {
    createRect,
    updateRectStyle,
  };
}
