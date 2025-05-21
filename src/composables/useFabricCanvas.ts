import { ref } from 'vue';
import type { FabricObject } from '../types';

// Fabric.jsをインポート
import { Canvas, FabricImage } from 'fabric';

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
  const initCanvas = (canvasEl: HTMLCanvasElement, options: any = {}): Canvas => {
    // Fabric.jsキャンバスの作成
    const fabricCanvas = new Canvas(canvasEl, {
      preserveObjectStacking: true, // オブジェクトの重ね順を維持
      selection: true, // 複数選択を有効化
      ...options
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
      console.log('setBackgroundImage called with:', imageUrl.substring(0, 50) + '...');
      
      // Fabric.jsのImage.fromURLを使用して画像を読み込む
      FabricImage.fromURL(imageUrl).then((fabricImage: FabricImage) => {
        if (!fabricImage) {
          console.error('Failed to load image');
          reject(new Error('画像の読み込みに失敗しました'));
          return;
        }
        
        try {
          // キャンバスのサイズを取得
          const canvasWidth = fCanvas.width;
          const canvasHeight = fCanvas.height;
          
          // 画像のサイズを取得
          const imgWidth = fabricImage.width || 1;
          const imgHeight = fabricImage.height || 1;
          
          // 画像のアスペクト比を維持しながらキャンバスに合わせる
          const scale = Math.min(
            canvasWidth / imgWidth,
            canvasHeight / imgHeight
          );
          
          // 画像をキャンバスの中央に配置
          fabricImage.set({
            scaleX: scale,
            scaleY: scale,
            left: (canvasWidth - imgWidth * scale) / 2,
            top: (canvasHeight - imgHeight * scale) / 2,
            selectable: false, // 選択不可
            evented: false, // イベント無効
          });
          
          // 背景として設定
          fCanvas.backgroundImage = fabricImage;
          fCanvas.renderAll();
          console.log('Background image set successfully');
          resolve();
        } catch (error) {
          console.error('Error setting background image:', error);
          reject(error);
        }
      });
    });
  };

  /**
   * キャンバスのリサイズ
   * @param canvas キャンバス
   * @param width 幅
   * @param height 高さ
   */
  const resizeCanvas = (fCanvas: Canvas, width: number, height: number) => {
    // キャンバスのサイズを設定
    console.log('Resizing canvas to:', width, height);
    fCanvas.width = width;
    fCanvas.height = height;
    //fCanvas.setWidth(width);
    //fCanvas.setHeight(height);
    fCanvas.requestRenderAll();
  };

  /**
   * オブジェクトの選択
   * @param canvas キャンバス
   * @param object 選択するオブジェクト
   */
  const selectObject = (canvas: Canvas, object: FabricObject) => {
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
    options: { format?: 'png' | 'jpeg'; quality?: number } = {}
  ): string => {
    const { format = 'png', quality = 1 } = options;

    // 選択状態を一時的に解除
    const activeObject = canvas.getActiveObject();
    canvas.discardActiveObject();
    canvas.requestRenderAll();

    // 画像としてエクスポート
    const dataUrl = canvas.toDataURL({
      format,
      quality,
      multiplier: 2 // 高解像度
    });

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
    exportCanvas
  };
}
