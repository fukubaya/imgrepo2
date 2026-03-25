import { createPinia } from "pinia";
import { useRegisterSW } from "virtual:pwa-register/vue";
import { createApp } from "vue";
import App from "./App.vue";

// Service Workerの更新間隔（1時間）
const intervalMS = 60 * 60 * 1000;

// PWAの登録
useRegisterSW({
  onNeedRefresh() {
    // 更新が必要な場合の処理
    console.log("新しいバージョンが利用可能です");
  },
  onOfflineReady() {
    // オフライン準備完了時の処理
    console.log("アプリケーションはオフラインで使用できます");
  },
  // 定期的に更新をチェック
  onRegistered(r: ServiceWorkerRegistration | undefined) {
    if (r) {
      // 定期的に更新をチェックする関数
      const checkUpdate: () => void = () => {
        if (navigator.onLine) {
          r.update();
        }
      };

      // 定期的に更新をチェック
      setInterval(checkUpdate, intervalMS);
    }
  },
});

// Piniaストアの作成
const pinia = createPinia();

// アプリケーションの作成
const app = createApp(App);

// Piniaストアの使用
app.use(pinia);

// アプリケーションのマウント
app.mount("#app");
