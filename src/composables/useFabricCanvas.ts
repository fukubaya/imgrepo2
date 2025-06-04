import { ref } from "vue";

// Fabric.jsをインポート
import { Canvas, type CanvasOptions, FabricImage, IText, type TOptions } from "fabric";

/**
 * Fabric.jsキャンバスを操作するためのコンポーザブル
 */
export function useFabricCanvas() {
  // キャンバス参照
  const canvas = ref<Canvas | null>(null);

  /**
   * キャンバスの初期化
   * @param canvasEl キャンバス要素
   * @param options キャンバスオプション
   * @returns 初期化されたキャンバス
   */
  const initCanvas = (canvasEl: HTMLCanvasElement, options: TOptions<CanvasOptions> = {}): Canvas => {
    // Fabric.jsキャンバスの作成
    const fabricCanvas = new Canvas(canvasEl, {
      preserveObjectStacking: true, // オブジェクトの重ね順を維持
      selection: true, // 複数選択を有効化
      ...options,
    });

    // キャンバス参照を設定
    canvas.value = fabricCanvas;

    return fabricCanvas;
  };

  /**
   * 背景画像の設定
   * @param canvas キャンバス
   * @param imageUrl 画像URL
   * @returns Promise
   */
  const setBackgroundImage = (fCanvas: Canvas, imageUrl: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      console.log("setBackgroundImage called with:", imageUrl.substring(0, 50) + "...");

      // Fabric.jsのImage.fromURLを使用して画像を読み込む
      FabricImage.fromURL(imageUrl).then((fabricImage: FabricImage) => {
        if (!fabricImage) {
          console.error("Failed to load image");
          reject(new Error("画像の読み込みに失敗しました"));
          return;
        }

        try {
          const scale = resizeCanvas(fCanvas, fabricImage);

          // 画像を配置
          fabricImage.set({
            left: 0,
            top: 0,
            selectable: false,
            evented: false,
          });

          // 背景として設定
          fCanvas.backgroundImage = fabricImage;
          fCanvas.setZoom(scale);
          fCanvas.renderAll();
          console.log("Background image set successfully");
          resolve();
        } catch (error) {
          console.error("Error setting background image:", error);
          reject(error);
        }
      });
    });
  };

  const resizeCanvas = (fCanvas: Canvas, fabricImage: FabricImage): number => {
    if (!fabricImage) {
      return 1.0;
    }

    const containerWidth = fCanvas.wrapperEl.parentElement?.offsetWidth || fCanvas.width;
    const containerHeight = fCanvas.wrapperEl.parentElement?.offsetHeight || fCanvas.height;

    // 画像のサイズを取得
    const imgWidth = fabricImage.width || 1;
    const imgHeight = fabricImage.height || 1;

    // 画像のアスペクト比を維持しながらキャンバスのサイズを調整
    const scaleX = containerWidth / imgWidth;
    const scaleY = containerHeight / imgHeight;
    let scale = Math.min(scaleX, scaleY);
    fCanvas.width = imgWidth;
    fCanvas.height = imgHeight;

    // キャンバスのラッパー要素のサイズを設定
    let elWidth;
    let elHeight;
    // アスペクト比に基づいてキャンバスのサイズを設定
    if (containerWidth <= 600) {
      // スマートフォンや小さい画面の場合、幅を優先
      elWidth = containerWidth;
      elHeight = containerWidth * (imgHeight / imgWidth);
      scale = scaleX;
      fCanvas.wrapperEl.parentElement!.style.width = elWidth + "px";
      fCanvas.wrapperEl.parentElement!.style.height = elHeight + "px";

      fCanvas.wrapperEl.parentElement!.parentElement!.style.width = elWidth + "px";
      fCanvas.wrapperEl.parentElement!.parentElement!.style.height = elHeight + "px";

      fCanvas.wrapperEl.parentElement!.parentElement!.parentElement!.style.width = elWidth + "px";
      fCanvas.wrapperEl.parentElement!.parentElement!.parentElement!.style.height = elHeight + "px";
    } else if (scaleX > scaleY) {
      elWidth = containerHeight * (imgWidth / imgHeight);
      elHeight = containerHeight;
    } else {
      elWidth = containerWidth;
      elHeight = containerWidth * (imgHeight / imgWidth);
    }

    fCanvas.wrapperEl.style.width = elWidth + "px";
    fCanvas.wrapperEl.style.height = elHeight + "px";

    return scale;
  };

  /**
   * オブジェクトの選択
   * @param canvas キャンバス
   * @param object 選択するオブジェクト
   */
  const selectObject = (canvas: Canvas, object: IText) => {
    canvas.setActiveObject(object);
    canvas.requestRenderAll();
  };

  /**
   * 選択の解除
   * @param canvas キャンバス
   */
  const deselectAll = (canvas: Canvas) => {
    canvas.discardActiveObject();
    canvas.requestRenderAll();
  };

  /**
   * キャンバスのエクスポート
   * @param canvas キャンバス
   * @param options エクスポートオプション
   * @returns データURL
   */
  const exportCanvas = (
    canvas: Canvas,
    options: { format?: "png" | "jpeg"; quality?: number } = {},
  ): string => {
    const { format = "png", quality = 1 } = options;

    // 選択状態を一時的に解除
    const activeObject = canvas.getActiveObject();
    const z = canvas.getZoom();
    canvas.discardActiveObject();
    canvas.requestRenderAll();

    // zoomを一時的に戻す
    canvas.setZoom(1.0);

    // 画像としてエクスポート
    const dataUrl = canvas.toDataURL({
      format,
      quality,
      multiplier: 1.0,
    });

    // zoomを戻す
    canvas.setZoom(z);

    // 選択状態を復元
    if (activeObject) {
      canvas.setActiveObject(activeObject);
      canvas.requestRenderAll();
    }

    return dataUrl;
  };

  return {
    canvas,
    initCanvas,
    setBackgroundImage,
    resizeCanvas,
    selectObject,
    deselectAll,
    exportCanvas,
  };
}
