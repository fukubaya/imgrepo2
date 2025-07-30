import { ref } from "vue";

/**
 * ファイル操作のためのコンポーザブル
 */
export function useFileHandling() {
  // 読み込み中フラグ
  const isLoading = ref(false);
  // エラーメッセージ
  const errorMessage = ref<string | null>(null);

  /**
   * 画像ファイルの読み込み
   * @param file ファイルオブジェクト
   * @returns Promise<string> データURL
   */
  const loadImageFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      // 読み込み中フラグを設定
      isLoading.value = true;
      errorMessage.value = null;

      // ファイルが画像かどうかチェック
      if (!file.type.match("image.*")) {
        errorMessage.value = "画像ファイルを選択してください";
        isLoading.value = false;
        reject(new Error("画像ファイルではありません"));
        return;
      }

      // FileReaderの作成
      const reader = new FileReader();

      // 読み込み完了時の処理
      reader.onload = (e) => {
        if (e.target?.result) {
          const dataUrl = e.target.result as string;
          const orgimg = new Image();
          orgimg.onload = () => {
            // mobile safari の制限のため 4096 * 4096 を超える画像は縮小する
            if (orgimg.width * orgimg.height > 4096 * 4096) {
              const r = Math.sqrt((4096 * 4096) / (orgimg.width * orgimg.height));
              const newimg = document.createElement("canvas");
              newimg.width = orgimg.width * r;
              newimg.height = orgimg.height * r;
              const ctx = newimg.getContext("2d");
              ctx?.drawImage(orgimg, 0, 0, newimg.width, newimg.height);
              resolve(newimg.toDataURL(file.type));
            } else {
              resolve(dataUrl);
            }
            isLoading.value = false;
          };
          orgimg.onerror = () => {
            isLoading.value = false;
            errorMessage.value = "画像データの解析に失敗しました";
            reject(new Error("画像データの解析に失敗しました"));
          };
          orgimg.src = dataUrl;
        } else {
          isLoading.value = false;
          errorMessage.value = "ファイルの読み込みに失敗しました";
          reject(new Error("ファイルの読み込みに失敗しました"));
        }
      };

      // エラー時の処理
      reader.onerror = () => {
        isLoading.value = false;
        errorMessage.value = "ファイルの読み込み中にエラーが発生しました";
        reject(new Error("ファイルの読み込み中にエラーが発生しました"));
      };

      // ファイルをデータURLとして読み込み
      reader.readAsDataURL(file);
    });
  };

  /**
   * データURLから画像をダウンロード
   * @param dataUrl データURL
   * @param filename ファイル名
   * @param format ファイル形式
   */
  const downloadImage = (dataUrl: string, filename: string, format: "png" | "jpg" = "png") => {
    // ダウンロード用のリンク要素を作成
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `${filename}.${format}`;

    // リンクをクリック（ダウンロード開始）
    document.body.appendChild(link);
    link.click();

    // リンク要素を削除
    document.body.removeChild(link);
  };

  /**
   * 画像の共有（モバイル向け）
   * @param dataUrl データURL
   * @param title タイトル
   * @param format ファイル形式
   * @returns Promise<boolean> 共有成功時はtrue
   */
  const shareImage = async (dataUrl: string, title: string, format: "png" | "jpg" = "png"): Promise<boolean> => {
    // Web Share APIが利用可能かチェック
    if (!navigator.share || !navigator.canShare) {
      errorMessage.value = "共有機能はこのブラウザでサポートされていません";
      return false;
    }

    try {
      // データURLからBlobを作成
      const res = await fetch(dataUrl);
      const blob = await res.blob();

      // ファイルオブジェクトを作成
      const file = new File([blob], `${title}.${format}`, { type: `image/${format}` });

      // 共有データを作成
      const shareData = {
        title: title,
        files: [file],
      };

      // 共有可能かチェック
      if (!navigator.canShare(shareData)) {
        errorMessage.value = "この内容は共有できません";
        return false;
      }

      // 共有ダイアログを表示
      await navigator.share(shareData);
      return true;
    } catch (error) {
      // ユーザーがキャンセルした場合はエラーとしない
      if (error instanceof Error && error.name === "AbortError") {
        return false;
      }

      // その他のエラー
      errorMessage.value = "共有中にエラーが発生しました";
      console.error("共有エラー:", error);
      return false;
    }
  };

  /**
   * カメラからの画像キャプチャ（モバイル向け）
   * @returns Promise<string | null> データURL
   */
  const captureFromCamera = (): Promise<string | null> => {
    return new Promise((resolve, reject) => {
      // 入力要素を作成
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.capture = "environment"; // 背面カメラを使用

      // 変更イベントのハンドラ
      input.onchange = async (e) => {
        const target = e.target as HTMLInputElement;
        if (target.files && target.files.length > 0) {
          try {
            // 選択されたファイルを読み込み
            const dataUrl = await loadImageFile(target.files[0]);
            resolve(dataUrl);
          } catch (error) {
            reject(error);
          }
        } else {
          // ファイルが選択されなかった場合
          resolve(null);
        }
      };

      // ファイル選択ダイアログを表示
      input.click();
    });
  };

  return {
    isLoading,
    errorMessage,
    loadImageFile,
    downloadImage,
    shareImage,
    captureFromCamera,
  };
}
