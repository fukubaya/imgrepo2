<template>
  <div class="fabric-canvas-container">
    <!-- キャンバス要素 -->
    <canvas ref="canvasEl" class="fabric-canvas"></canvas>

    <teleport to="#paste-form" v-if="showPasteForm" class="paste-form-overlay">
      <div class="paste-form-modal">
        <h3>テキストをここに貼り付け</h3>
        <textarea
          v-model="pasteTextContent"
          @paste="handlePaste"
          placeholder="ここにテキストをペーストしてください..."
          rows="1"
        ></textarea>
        <div class="form-actions">
          <button @click="showPasteForm = false" class="btn-secondary">
            キャンセル
          </button>
        </div>
      </div>
    </teleport>

    <!-- 貼り付けフォーム -->
    <div id="paste-form" />

    <!-- ツールバー -->
    <div class="canvas-toolbar">
      <button
        @click="addTextFromClipboard"
        title="クリップボードからテキスト追加"
        class="toolbar-btn"
      >
        <span class="icon">📋T</span>
      </button>

      <button
        @click="addTextFromButton"
        title="テキスト追加"
        class="toolbar-btn"
      >
        <span class="icon">T</span>
      </button>
      <button
        @click="deleteSelected"
        title="選択オブジェクト削除"
        :disabled="!hasSelection"
        class="toolbar-btn"
      >
        <span class="icon">🗑</span>
      </button>
      <button
        @click="duplicateSelected"
        title="選択オブジェクト複製"
        :disabled="!hasSelection"
        class="toolbar-btn"
      >
        <span class="icon">+</span>
      </button>
      <button
        @click="bringToFront"
        title="最前面へ"
        :disabled="!hasSelection"
        class="toolbar-btn"
      >
        <span class="icon">↑↑</span>
      </button>
      <button
        @click="sendToBack"
        title="最背面へ"
        :disabled="!hasSelection"
        class="toolbar-btn"
      >
        <span class="icon">↓↓</span>
      </button>
      <button
        @click="undo"
        title="元に戻す"
        :disabled="!canUndo"
        class="toolbar-btn"
      >
        <span class="icon">↩</span>
      </button>
      <button
        @click="redo"
        title="やり直し"
        :disabled="!canRedo"
        class="toolbar-btn"
      >
        <span class="icon">↪</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Canvas } from "fabric";
import { computed, onMounted, ref, watch } from "vue";
import { useFabricCanvas } from "../composables/useFabricCanvas";
import { useFabricText } from "../composables/useFabricText";
import { roundToPointOne } from "../lib/common";
import { useEditorStore } from "../stores/editorStore";

// 状態
const showPasteForm = ref(false);
const pasteTextContent = ref("");

// プロパティ
const props = defineProps({
  width: {
    type: Number,
    default: 800,
  },
  height: {
    type: Number,
    default: 600,
  },
});

// イベント
const emit = defineEmits([
  "canvas-ready",
  "object-selected",
  "object-modified",
]);

// キャンバス要素の参照
const canvasEl = ref<HTMLCanvasElement | null>(null);

// ストア
const store = useEditorStore();

// コンポーザブル
const { initCanvas, setBackgroundImage } = useFabricCanvas();
const { createText } = useFabricText();

// 計算プロパティ
const hasSelection = computed(() => store.hasSelection);
const canUndo = computed(() => store.canUndo);
const canRedo = computed(() => store.canRedo);

// キャンバスの初期化
onMounted(() => {
  if (canvasEl.value) {
    // キャンバスの初期化
    try {
      const canvas = initCanvas(canvasEl.value, {
        width: props.width,
        height: props.height,
        selection: true, // グループ選択を有効化
        preserveObjectStacking: true, // オブジェクトの重ね順を維持
      });

      // ストアにキャンバスを設定
      store.setCanvas(canvas);

      // イベントリスナーの設定
      canvas.on("selection:created", handleSelection);
      canvas.on("selection:updated", handleSelection);
      canvas.on("selection:cleared", () => store.setSelectedObject(null));
      canvas.on("object:modified", () => {
        store.saveState();
        emit("object-modified");
      });
      canvas.on("text:changed", () => store.saveState());

      // 背景画像の設定（もし存在すれば）
      if (store.backgroundImage) {
        setBackgroundImage(canvas, store.backgroundImage);
      }

      // 初期状態を保存
      store.saveState();

      // キャンバス準備完了イベントを発火
      emit("canvas-ready", canvas);
    } catch (error) {
      console.error("キャンバス初期化エラー:", error);
    }
  }
});

// 選択オブジェクトの処理
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleSelection = (e: any) => {
  const selected = e.selected?.[0] || e.target;
  store.setSelectedObject(selected);
  emit("object-selected", selected);
};

// クリップボードからテキストを追加（フォーム表示）
const addTextFromClipboard = () => {
  showPasteForm.value = true;
  pasteTextContent.value = ""; // フォームを開く際に内容をクリア
};

// 貼り付けイベントハンドラ
const handlePaste = (event: ClipboardEvent) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const clipboardData = event.clipboardData || (window as any).clipboardData;
  if (clipboardData) {
    pasteTextContent.value = clipboardData.getData("text");
    addTextFromPastedForm(); // 貼り付け時に自動でテキストを追加
  }
};

// フォームからテキストを追加
const addTextFromPastedForm = () => {
  addText(pasteTextContent.value || "テキストを入力");
  // フォームを閉じる
  showPasteForm.value = false;
  pasteTextContent.value = "";
};

// ボタンからのテキスト追加
const addTextFromButton = () => {
  // ボタンからのテキスト追加
  addText("テキストを入力");
};

// 新しいテキストの追加
const addText = (t: string = "") => {
  if (!store.canvas) return;

  // キャンバスの中央に新しいテキストを作成
  const scale = roundToPointOne(1 / store.canvas.getZoom());
  const text = createText(t || "テキストを入力", {
    left: 0,
    top: 0,
    fontFamily: "Arial",
    fontSize: 30,
    fill: "#000000",
    scaleX: scale,
    scaleY: scale,
  });

  // キャンバスのサイズの90%を超える場合は縮小する
  const upperRate = 0.9;
  if (
    text.width * scale > store.canvas.width * upperRate
    || text.height * scale > store.canvas.height * upperRate
  ) {
    const r = Math.min(
      store.canvas.width * upperRate / (text.width * scale),
      store.canvas.height * upperRate / (text.height * scale),
    );
    const rScale = roundToPointOne(r * scale);
    text.scaleX = rScale;
    text.scaleY = rScale;
  }

  // テキストの位置を中央に設定
  text.top = (store.canvas.height - text.height * text.scaleY) / 2;
  text.left = (store.canvas.width - text.width * text.scaleX) / 2;

  store.canvas.add(text);
  store.canvas.setActiveObject(text);
  store.canvas.requestRenderAll();

  // 履歴に保存
  store.saveState();
};

// 選択オブジェクトの削除
const deleteSelected = () => {
  store.deleteSelectedObject();
};

// 選択オブジェクトの複製
const duplicateSelected = () => {
  store.duplicateSelectedObject();
};

// 選択オブジェクトを最前面に移動
const bringToFront = () => {
  store.bringToFront();
};

// 選択オブジェクトを最背面に移動
const sendToBack = () => {
  store.sendToBack();
};

// 元に戻す
const undo = () => {
  store.undo();
};

// やり直し
const redo = () => {
  store.redo();
};

// 背景画像の変更を監視
watch(() => store.backgroundImage, async (newImage) => {
  if (store.canvas) {
    if (newImage) {
      console.log("背景画像を設定します:", newImage);
      try {
        await setBackgroundImage(store.canvas as unknown as Canvas, newImage);
        store.saveState();
      } catch (error) {
        console.error("背景画像の設定に失敗しました:", error);
      }
    } else {
      if (store.canvas) {
        store.canvas.backgroundImage = undefined;
        store.canvas.renderAll.bind(store.canvas);
        store.saveState();
      }
    }
  }
}, { immediate: true });

// 外部に公開するメソッド
defineExpose({
  addText,
  deleteSelected,
  duplicateSelected,
  bringToFront,
  sendToBack,
  undo,
  redo,
});
</script>

<style scoped>
.fabric-canvas-container {
  position: relative;
  height: 100%;
  background-color: #f5f5f5;
  overflow: hidden;
}

.fabric-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.canvas-toolbar {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 5px;
  background-color: rgba(255, 255, 255, 0.8);
  padding: 5px;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  z-index: 100;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background-color: #fff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
}

.toolbar-btn:hover {
  background-color: #f0f0f0;
}

.toolbar-btn:active {
  background-color: #e0e0e0;
}

.toolbar-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.icon {
  font-size: 18px;
  line-height: 1;
}

@media (max-width: 600px) {
  .canvas-toolbar {
    bottom: 5px;
    padding: 3px;
  }
  
  .toolbar-btn {
    width: 36px;
    height: 36px;
    font-size: 14px;
  }
  
  .icon {
    font-size: 16px;
  }
}

/* 貼り付けフォームのスタイル */
.paste-form-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 200; /* ツールバーより前面に */
}

.paste-form-modal {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.paste-form-modal h3 {
  margin-top: 0;
  color: #333;
  font-size: 1.2em;
}

.paste-form-modal textarea {
  width: calc(100% - 20px); /* paddingを考慮 */
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1em;
  resize: vertical;
}

#paste-form {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-primary,
.btn-secondary {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
  transition: background-color 0.2s;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #5a6268;
}
</style>
