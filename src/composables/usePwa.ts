import { ref, onMounted } from 'vue';

/**
 * PWA関連機能のためのコンポーザブル
 */
export function usePwa() {
  // インストールプロンプトを表示可能かどうか
  const canInstall = ref(false);
  // オフラインモードかどうか
  const isOffline = ref(!navigator.onLine);
  // 更新が利用可能かどうか
  const updateAvailable = ref(false);
  // インストールイベント
  const deferredPrompt = ref<any>(null);

  // オンライン/オフライン状態の監視
  onMounted(() => {
    // オンライン状態の変更を監視
    window.addEventListener('online', () => {
      isOffline.value = false;
    });

    window.addEventListener('offline', () => {
      isOffline.value = true;
    });

    // インストールプロンプトイベントの監視
    window.addEventListener('beforeinstallprompt', (e) => {
      // デフォルトの動作を防止
      e.preventDefault();
      // イベントを保存
      deferredPrompt.value = e;
      // インストール可能フラグを設定
      canInstall.value = true;
    });

    // インストール完了イベントの監視
    window.addEventListener('appinstalled', () => {
      // インストールプロンプトをクリア
      deferredPrompt.value = null;
      // インストール可能フラグをリセット
      canInstall.value = false;
      // インストール完了をログに記録
      console.log('PWA was installed');
    });
  });

  /**
   * インストールプロンプトを表示
   * @returns Promise<boolean> インストール成功時はtrue
   */
  const promptInstall = async (): Promise<boolean> => {
    if (!deferredPrompt.value) {
      return false;
    }

    try {
      // インストールプロンプトを表示
      deferredPrompt.value.prompt();
      // ユーザーの選択を待機
      const choiceResult = await deferredPrompt.value.userChoice;
      // プロンプトをクリア
      deferredPrompt.value = null;
      canInstall.value = false;

      // ユーザーがインストールを選択したかどうか
      return choiceResult.outcome === 'accepted';
    } catch (error) {
      console.error('インストールプロンプトエラー:', error);
      return false;
    }
  };

  /**
   * Service Workerの更新をチェック
   */
  const checkForUpdates = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.update();
      });
    }
  };

  /**
   * 利用可能な更新を適用
   */
  const applyUpdate = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.update().then(() => {
          // 更新が完了したらページをリロード
          window.location.reload();
        });
      });
    }
  };

  /**
   * キャッシュをクリア
   */
  const clearCache = async () => {
    if ('caches' in window) {
      try {
        // 利用可能なキャッシュの名前を取得
        const cacheNames = await caches.keys();
        // すべてのキャッシュを削除
        await Promise.all(
          cacheNames.map((cacheName) => {
            return caches.delete(cacheName);
          })
        );
        return true;
      } catch (error) {
        console.error('キャッシュクリアエラー:', error);
        return false;
      }
    }
    return false;
  };

  return {
    canInstall,
    isOffline,
    updateAvailable,
    promptInstall,
    checkForUpdates,
    applyUpdate,
    clearCache
  };
}
