import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { registerSW } from 'virtual:pwa-register'

// PWAの登録
registerSW({
  onNeedRefresh() {
    // 更新が必要な場合の処理
    console.log('新しいバージョンが利用可能です')
  },
  onOfflineReady() {
    // オフライン準備完了時の処理
    console.log('アプリケーションはオフラインで使用できます')
  }
})

// Piniaストアの作成
const pinia = createPinia()

// アプリケーションの作成
const app = createApp(App)

// Piniaストアの使用
app.use(pinia)

// アプリケーションのマウント
app.mount('#app')
