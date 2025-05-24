<template>
  <div class="image-uploader">
    <div 
      class="upload-area"
      :class="{ 'drag-over': isDragOver, 'has-image': !!imagePreview }"
      @dragover.prevent="onDragOver"
      @dragleave.prevent="onDragLeave"
      @drop.prevent="onDrop"
      @click="openFileDialog"
    >
      <div v-if="!imagePreview" class="upload-placeholder">
        <div class="upload-icon">
          <span class="icon">📁</span>
        </div>
        <p class="upload-text">
          クリックして画像を選択<br>
          または<br>
          ここにドラッグ＆ドロップ
        </p>
        <div class="mobile-options" v-if="isMobile">
          <button @click.stop="captureFromCamera" class="camera-btn">
            <span class="icon">📷</span> カメラで撮影
          </button>
        </div>
      </div>
      
      <div v-else class="image-preview-container">
        <img :src="imagePreview" alt="プレビュー" class="image-preview" />
        <div class="preview-overlay">
          <button @click.stop="clearImage" class="clear-btn">
            <span class="icon">×</span>
          </button>
        </div>
      </div>
    </div>
    
    <input 
      type="file" 
      ref="fileInput" 
      accept="image/*" 
      class="file-input" 
      @change="onFileSelected" 
    />
    
    <div class="upload-actions" v-if="!imagePreview">
      <button @click="openFileDialog" class="action-btn">
        <span class="icon">📁</span> 画像を選択
      </button>
      <button v-if="isMobile" @click="captureFromCamera" class="action-btn">
        <span class="icon">📷</span> カメラで撮影
      </button>
    </div>
    
    <div class="upload-error" v-if="errorMessage">
      <p>{{ errorMessage }}</p>
    </div>
    
    <div class="loading-overlay" v-if="isLoading">
      <div class="spinner"></div>
      <p>読み込み中...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useFileHandling } from '../composables/useFileHandling';
import { useEditorStore } from '../stores/editorStore';

// イベント
const emit = defineEmits(['image-loaded', 'image-cleared']);

// ストア
const store = useEditorStore();

// コンポーザブル
const { loadImageFile, captureFromCamera: captureImage, isLoading, errorMessage } = useFileHandling();

// ファイル入力参照
const fileInput = ref<HTMLInputElement | null>(null);

// 画像プレビュー
const imagePreview = ref<string | null>(null);

// ドラッグ状態
const isDragOver = ref(false);

// モバイル判定
const isMobile = ref(false);

// マウント時の処理
onMounted(() => {
  // モバイル判定
  isMobile.value = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // 既存の背景画像があれば設定
  if (store.backgroundImage) {
    imagePreview.value = store.backgroundImage;
  }
});

// ファイル選択ダイアログを開く
const openFileDialog = () => {
  if (fileInput.value) {
    fileInput.value.click();
  }
};

// ファイル選択時の処理
const onFileSelected = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    try {
      const file = target.files[0];
      const dataUrl = await loadImageFile(file);
      
      // プレビューを設定
      imagePreview.value = dataUrl;
      
      // ストアに背景画像を設定
      store.setBackgroundImage(dataUrl);
      
      // イベント発火
      emit('image-loaded', dataUrl);

      // ファイル入力をリセット
      if (fileInput.value) {
        fileInput.value.value = '';
      }
    } catch (error: any) {
      console.error('ファイル読み込みエラー:', error);
      errorMessage.value = error.message || 'ファイルの読み込みに失敗しました';
    }
  }
};

// ドラッグオーバー時の処理
const onDragOver = (event: DragEvent) => {
  isDragOver.value = true;
};

// ドラッグリーブ時の処理
const onDragLeave = (event: DragEvent) => {
  isDragOver.value = false;
};

// ドロップ時の処理
const onDrop = async (event: DragEvent) => {
  isDragOver.value = false;
  
  if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
    try {
      const file = event.dataTransfer.files[0];
      const dataUrl = await loadImageFile(file);
      
      // プレビューを設定
      imagePreview.value = dataUrl;
      
      // ストアに背景画像を設定
      store.setBackgroundImage(dataUrl);
      
      // イベント発火
      emit('image-loaded', dataUrl);
    } catch (error) {
      console.error('ファイル読み込みエラー:', error);
    }
  }
};

// カメラからキャプチャ
const captureFromCamera = async () => {
  try {
    const dataUrl = await captureImage();
    if (dataUrl) {
      // プレビューを設定
      imagePreview.value = dataUrl;
      
      // ストアに背景画像を設定
      store.setBackgroundImage(dataUrl);
      
      // イベント発火
      emit('image-loaded', dataUrl);
    }
  } catch (error) {
    console.error('カメラキャプチャエラー:', error);
  }
};

// 画像をクリア
const clearImage = () => {
  imagePreview.value = null;
  store.setBackgroundImage(null);
  
  // イベント発火
  emit('image-cleared');
};
</script>

<style scoped>
.image-uploader {
  position: relative;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.upload-area {
  position: relative;
  width: 100%;
  min-height: 200px;
  border: 2px dashed #ccc;
  border-radius: 8px;
  background-color: #f9f9f9;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  overflow: hidden;
}

.upload-area:hover {
  border-color: #aaa;
  background-color: #f5f5f5;
}

.upload-area.drag-over {
  border-color: #2196F3;
  background-color: rgba(33, 150, 243, 0.05);
}

.upload-area.has-image {
  border-style: solid;
  border-color: #ddd;
}

.upload-placeholder {
  text-align: center;
  padding: 20px;
}

.upload-icon {
  font-size: 40px;
  margin-bottom: 10px;
  color: #666;
}

.upload-text {
  font-size: 14px;
  color: #666;
  margin: 0;
  line-height: 1.5;
}

.file-input {
  display: none;
}

.upload-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 15px;
}

.action-btn {
  padding: 8px 16px;
  background-color: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: background-color 0.2s;
}

.action-btn:hover {
  background-color: #0d8aee;
}

.camera-btn {
  margin-top: 10px;
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  transition: background-color 0.2s;
}

.camera-btn:hover {
  background-color: #3d9140;
}

.image-preview-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.image-preview {
  width: 100%;
  height: 100%;
  object-fit: contain;
  max-height: 300px;
}

.preview-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0);
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  opacity: 0;
  transition: opacity 0.3s;
}

.image-preview-container:hover .preview-overlay {
  opacity: 1;
  background-color: rgba(0, 0, 0, 0.1);
}

.clear-btn {
  margin: 10px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.8);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;
  color: #666;
  transition: all 0.2s;
}

.clear-btn:hover {
  background-color: rgba(255, 255, 255, 1);
  color: #333;
}

.upload-error {
  margin-top: 10px;
  padding: 8px 12px;
  background-color: #ffebee;
  border: 1px solid #ffcdd2;
  border-radius: 4px;
  color: #c62828;
  font-size: 14px;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(33, 150, 243, 0.3);
  border-radius: 50%;
  border-top-color: #2196F3;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.icon {
  font-size: 18px;
  line-height: 1;
}

@media (max-width: 600px) {
  .upload-area {
    min-height: 150px;
  }
  
  .upload-icon {
    font-size: 30px;
  }
  
  .upload-text {
    font-size: 12px;
  }
  
  .action-btn, .camera-btn {
    padding: 6px 12px;
    font-size: 12px;
  }
}
</style>
