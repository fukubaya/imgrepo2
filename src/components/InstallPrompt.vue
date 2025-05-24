<template>
  <div v-if="showPrompt" class="install-prompt" :class="{ 'mobile': isMobile }">
    <div class="prompt-content">
      <div class="prompt-icon">
        <img src="/pwa-192x192.png" alt="アプリアイコン" class="app-icon" />
      </div>
      <div class="prompt-text">
        <h3>画像テキストエディタ</h3>
        <p>ホーム画面に追加して、いつでも簡単にアクセスできます</p>
      </div>
      <div class="prompt-actions">
        <button @click="installPWA" class="install-btn">インストール</button>
        <button @click="dismissPrompt" class="dismiss-btn">あとで</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { usePwa } from '../composables/usePwa';

// プロパティ
const props = defineProps({
  // 自動表示するまでの遅延（ミリ秒）
  autoShowDelay: {
    type: Number,
    default: 5000
  },
  // 一度閉じた後に再表示するまでの期間（日数）
  dismissPeriod: {
    type: Number,
    default: 7
  }
});

// イベント
const emit = defineEmits(['installed', 'dismissed']);

// コンポーザブル
const { canInstall, promptInstall } = usePwa();

// プロンプト表示状態
const showPrompt = ref(false);

// モバイル判定
const isMobile = ref(false);

// マウント時の処理
onMounted(() => {
  // モバイル判定
  isMobile.value = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // 過去に閉じた日時を確認
  const lastDismissed = localStorage.getItem('pwa-prompt-dismissed');
  const shouldShow = !lastDismissed || 
    (Date.now() - parseInt(lastDismissed)) > (props.dismissPeriod * 24 * 60 * 60 * 1000);
  
  // 自動表示の設定
  if (shouldShow) {
    setTimeout(() => {
      showPrompt.value = canInstall.value;
    }, props.autoShowDelay);
  }
});

// インストール可能状態の変化を監視
watch(canInstall, (newValue) => {
  if (newValue) {
    const lastDismissed = localStorage.getItem('pwa-prompt-dismissed');
    const shouldShow = !lastDismissed || 
      (Date.now() - parseInt(lastDismissed)) > (props.dismissPeriod * 24 * 60 * 60 * 1000);
    
    if (shouldShow) {
      showPrompt.value = true;
    }
  } else {
    showPrompt.value = false;
  }
});

// PWAのインストール
const installPWA = async () => {
  const installed = await promptInstall();
  if (installed) {
    showPrompt.value = false;
    emit('installed');
  }
};

// プロンプトを閉じる
const dismissPrompt = () => {
  showPrompt.value = false;
  
  // 閉じた日時を保存
  localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
  
  // イベント発火
  emit('dismissed');
};

// 手動でプロンプトを表示
const showInstallPrompt = () => {
  if (canInstall.value) {
    showPrompt.value = true;
  }
};

// 外部に公開するメソッド
defineExpose({
  showInstallPrompt
});
</script>

<style scoped>
.install-prompt {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 400px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: hidden;
  animation: slide-up 0.3s ease-out;
}

.install-prompt.mobile {
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  max-width: 100%;
  transform: none;
  border-radius: 12px 12px 0 0;
}

.prompt-content {
  display: flex;
  flex-wrap: wrap;
  padding: 16px;
}

.prompt-icon {
  flex: 0 0 48px;
  margin-right: 16px;
}

.app-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
}

.prompt-text {
  flex: 1;
  min-width: 0;
}

.prompt-text h3 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.prompt-text p {
  margin: 0;
  font-size: 14px;
  color: #666;
  line-height: 1.4;
}

.prompt-actions {
  flex: 0 0 100%;
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
  gap: 8px;
}

.install-btn {
  padding: 8px 16px;
  background-color: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.install-btn:hover {
  background-color: #0d8aee;
}

.dismiss-btn {
  padding: 8px 16px;
  background-color: transparent;
  color: #666;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.dismiss-btn:hover {
  background-color: #f5f5f5;
  color: #333;
}

@keyframes slide-up {
  from {
    transform: translateX(-50%) translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }
}

.install-prompt.mobile {
  animation: slide-up-mobile 0.3s ease-out;
}

@keyframes slide-up-mobile {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@media (max-width: 600px) {
  .prompt-content {
    padding: 12px;
  }
  
  .prompt-icon {
    flex: 0 0 40px;
    margin-right: 12px;
  }
  
  .app-icon {
    width: 40px;
    height: 40px;
  }
  
  .prompt-text h3 {
    font-size: 15px;
  }
  
  .prompt-text p {
    font-size: 13px;
  }
  
  .install-btn, .dismiss-btn {
    padding: 6px 12px;
    font-size: 13px;
  }
}
</style>
