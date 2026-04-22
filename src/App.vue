<template>
  <div class="app">
    <header class="app-header">
      <h1 class="app-title">画像テキストエディタ</h1>
      <div class="app-actions">
        <button
          @click="exportImage"
          class="action-btn export-btn"
          :disabled="!hasBackgroundImage"
        >
          <span class="icon">💾</span>
        </button>
        <button
          v-if="isMobile && canShare"
          @click="shareImage"
          class="action-btn share-btn"
          :disabled="!hasBackgroundImage"
        >
          <span class="icon">📤</span>
        </button>
        <button
          v-if="hasBackgroundImage"
          @click="clearImage"
          class="action-btn"
        >
          <span class="icon">❌</span>
        </button>
      </div>
    </header>

    <main class="app-main">
      <div class="editor-container">
        <div v-if="!hasBackgroundImage" class="upload-container">
          <ImageUploader @image-loaded="onImageLoaded" />
        </div>
        <div v-else class="canvas-container">
          <FabricCanvas
            ref="canvasRef"
            @object-selected="onObjectSelected"
            :width="1920"
            :height="1080"
          />
        </div>
      </div>

      <div
        class="sidebar"
        :class="{ 'has-selection': isTextSelected || isRectSelected }"
      >
        <div class="sidebar-section">
          <TextPanel ref="textPanelRef" v-if="isTextSelected" />
          <RectPanel v-if="isRectSelected" />
        </div>
      </div>
    </main>

    <footer class="app-footer">
      <p>© 2025 画像テキストエディタ</p>
      <p v-if="isOffline" class="offline-indicator">
        <span class="icon">📶</span> オフラインモード
      </p>
    </footer>

    <InstallPrompt ref="installPromptRef" />
  </div>
</template>

<script setup lang="ts">
import type { Canvas } from "fabric";
import { computed, onMounted, provide, ref } from "vue";
import FabricCanvas from "./components/FabricCanvas.vue";
import ImageUploader from "./components/ImageUploader.vue";
import InstallPrompt from "./components/InstallPrompt.vue";
import RectPanel from "./components/RectPanel.vue";
import TextPanel from "./components/TextPanel.vue";
import { useFabricCanvas } from "./composables/useFabricCanvas";
import { useFileHandling } from "./composables/useFileHandling";
import { usePwa } from "./composables/usePwa";
import { useEditorStore } from "./stores/editorStore";

// ストア
const store = useEditorStore();

// コンポーザブル
const { downloadImage, shareImage: shareImageFile } = useFileHandling();
const { isOffline } = usePwa();
const { exportCanvas } = useFabricCanvas();

// コンポーネント参照
const canvasRef = ref<InstanceType<typeof FabricCanvas> | null>(null);
const textPanelRef = ref<InstanceType<typeof TextPanel> | null>(null);
const installPromptRef = ref<InstanceType<typeof InstallPrompt> | null>(null);

// TextPanelをFabricCanvasで利用できるようにprovide
provide("textPanel", textPanelRef);

// 計算プロパティ
const hasBackgroundImage = computed(() => store.hasBackgroundImage);
const isTextSelected = computed(() => store.isTextSelected);
const isRectSelected = computed(() => store.isRectSelected);

// モバイル判定
const isMobile = ref(false);

// 共有機能の利用可否
const canShare = computed(() => {
  return !!navigator.share && !!navigator.canShare;
});

// マウント時の処理
onMounted(() => {
  // モバイル判定
  isMobile.value =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );
});

// 画像読み込み時の処理
const onImageLoaded = (dataUrl: string) => {
  // 明示的に背景画像を設定
  store.setBackgroundImage(dataUrl);
};

// オブジェクト選択時の処理
const onObjectSelected = () => {};

// 画像のクリア
const clearImage = () => {
  store.setBackgroundImage(null);
};

// 画像のエクスポート
const exportImage = () => {
  if (!store.canvas) return;

  // キャンバスをエクスポート
  const dataUrl = exportCanvas(store.canvas as unknown as Canvas, {
    format: "jpeg",
  });
  if (dataUrl) {
    // ファイル名の生成（現在日時を含む）
    const now = new Date();
    const dateStr = `${now.getFullYear()}${
      (now.getMonth() + 1).toString().padStart(2, "0")
    }${now.getDate().toString().padStart(2, "0")}_${
      now.getHours().toString().padStart(2, "0")
    }${now.getMinutes().toString().padStart(2, "0")}`;
    const filename = `image_editor_${dateStr}`;

    // ダウンロード
    downloadImage(dataUrl, filename, "jpg");
  }
};

// 画像の共有（モバイル向け）
const shareImage = async () => {
  if (!store.canvas) return;

  // キャンバスをエクスポート
  const dataUrl = exportCanvas(store.canvas as unknown as Canvas, {
    format: "jpeg",
  });
  if (dataUrl) {
    // ファイル名の生成
    const filename = `画像テキストエディタ_${
      new Date().toISOString().split("T")[0]
    }`;

    // 共有
    await shareImageFile(dataUrl, filename, "jpg");
  }
};
</script>

<style>
/* グローバルスタイル */
:root {
  --primary-color: #2196F3;
  --secondary-color: #0d8aee;
  --text-color: #333;
  --light-text-color: #666;
  --border-color: #ddd;
  --background-color: #f5f5f5;
  --card-background: #fff;
  --header-height: 60px;
  --footer-height: 40px;
  --sidebar-width: 300px;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'メイリオ', sans-serif;
  color: var(--text-color);
  background-color: var(--background-color);
  line-height: 1.6;
}

button {
  cursor: pointer;
  font-family: inherit;
}

/* アプリケーションレイアウト */
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-header {
  height: var(--header-height);
  background-color: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.app-title {
  font-size: 20px;
  font-weight: 600;
  font-family: -apple-system, 'Toppan Bunkyu Midashi Gothic Extrabold';
}

.app-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.2s;
}

.export-btn {
  background-color: white;
  color: var(--primary-color);
}

.export-btn:hover {
  background-color: #f0f0f0;
}

.share-btn {
  background-color: #4CAF50;
  color: white;
}

.share-btn:hover {
  background-color: #3d9140;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.app-main {
  flex: 1;
  display: flex;
  padding: 20px;
  gap: 20px;
}

.editor-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-container, .canvas-container {
  width: 100%;
  height: 100%;
}
.canvas-container {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
}

.sidebar {
  width: var(--sidebar-width);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.sidebar-section {
  margin-bottom: 20px;
}

.app-footer {
  height: var(--footer-height);
  background-color: var(--card-background);
  border-top: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  font-size: 12px;
  color: var(--light-text-color);
}

.offline-indicator {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #ff9800;
}

.icon {
  font-size: 18px;
  line-height: 1;
}

/* レスポンシブデザイン */
@media (max-width: 900px) {
  .app-main {
    flex-direction: column;
    padding: 10px;
  }

  .sidebar {
    width: 100%;
  }

  .editor-container {
    min-height: 300px;
  }
}

@media (max-width: 600px) {
  .app-header {
    height: 50px;
    padding: 0 10px;
  }

  .app-title {
    font-size: 18px;
  }

  .action-btn {
    padding: 6px 12px;
    font-size: 13px;
  }

  .app-main {
    padding: 0;
  }

  .app-footer {
    padding: 0 10px;
    font-size: 11px;
  }
}
</style>
