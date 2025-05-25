import { registerSW } from "virtual:pwa-register";

// Service Workerの更新間隔（1時間）
const intervalMS = 60 * 60 * 1000;

// Service Workerの登録
export const updateSW = registerSW({
  // 更新が必要な場合のコールバック
  onNeedRefresh() {
    // 更新が必要なことをコンソールに表示
    console.log("新しいバージョンが利用可能です！");
    // ここでUIに通知を表示することもできます
  },
  // オフライン準備完了時のコールバック
  onOfflineReady() {
    // オフライン準備完了をコンソールに表示
    console.log("アプリケーションはオフラインで使用できます");
    // ここでUIに通知を表示することもできます
  },
  // 定期的に更新をチェック
  onRegistered(r) {
    if (r) {
      // 定期的に更新をチェックする関数
      const checkUpdate = () => {
        if (navigator.onLine) {
          r.update();
        }
      };

      // 定期的に更新をチェック
      setInterval(checkUpdate, intervalMS);
    }
  },
});

/**
 * Service Workerの更新を手動で実行
 */
export function updateServiceWorker() {
  updateSW();
}
