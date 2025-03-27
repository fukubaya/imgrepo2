import { ref } from 'vue';
import type { FabricCanvas, FabricObject } from '../types';

// Fabric.jsをインポート
import { Canvas, Image } from 'fabric';

/**
 * Fabric.jsキャンバスを操作するためのコンポーザブル
 */
export function useFabricCanvas() {
  // キャンバス参照
  const canvas = ref<FabricCanvas | null>(null);

  /**
   * キャンバスの初期化
   * @param canvasEl キャンバス要素
   * @param options キャンバスオプション
   * @returns 初期化されたキャンバス
   */
  const initCanvas = (canvasEl: HTMLCanvasElement, options: any = {}): FabricCanvas => {
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
  const setBackgroundImage = (canvas: FabricCanvas, imageUrl: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      console.log('setBackgroundImage called with:', imageUrl.substring(0, 50) + '...');
      
      // Fabric.jsのImage.fromURLを使用して画像を読み込む
      Image.fromURL(imageUrl, (fabricImage) => {
        if (!fabricImage) {
          console.error('Failed to load image');
          reject(new Error('画像の読み込みに失敗しました'));
          return;
        }
        
        try {
          // キャンバスのサイズを取得
          const canvasWidth = canvas.width || 800;
          const canvasHeight = canvas.height || 600;
          
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
          canvas.setBackgroundImage(fabricImage, canvas.renderAll.bind(canvas));
          console.log('Background image set successfully');
          resolve();
        } catch (error) {
          console.error('Error setting background image:', error);
          reject(error);
        }
      }, { crossOrigin: 'anonymous' }); // CORS対応
    });
  };

  /**
   * キャンバスのリサイズ
   * @param canvas キャンバス
   * @param width 幅
   * @param height 高さ
   */
  const resizeCanvas = (canvas: FabricCanvas, width: number, height: number) => {
    // キャンバスのサイズを設定
    canvas.setWidth(width);
    canvas.setHeight(height);
    canvas.requestRenderAll();
  };

  /**
   * オブジェクトの選択
   * @param canvas キャンバス
   * @param object 選択するオブジェクト
   */
  const selectObject = (canvas: FabricCanvas, object: FabricObject) => {
    canvas.setActiveObject(object);
    canvas.requestRenderAll();
  };

  /**
   * 選択の解除
   * @param canvas キャンバス
   */
  const deselectAll = (canvas: FabricCanvas) => {
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
    canvas: FabricCanvas,
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
