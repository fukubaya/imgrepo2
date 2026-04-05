import { defineStore } from "pinia";
import { markRaw } from "vue";
import type { EditorState } from "../types";

// Fabric.jsをインポート
import { Canvas, Textbox } from "fabric";

// エディタストア
export const useEditorStore = defineStore("editor", {
  state: (): EditorState & { saveStateTimer: ReturnType<typeof setTimeout> | null } => ({
    // キャンバス
    canvas: null,
    // 背景画像
    backgroundImage: null,
    // 選択中のオブジェクト
    selectedObject: null,
    // 編集中フラグ
    isEditing: false,
    // 履歴保存のデバウンス用タイマー
    saveStateTimer: null,
  }),

  getters: {
    // キャンバスが初期化されているか
    isCanvasInitialized: (state) => !!state.canvas,

    // 背景画像が設定されているか
    hasBackgroundImage: (state) => !!state.backgroundImage,

    // オブジェクトが選択されているか
    hasSelection: (state) => !!state.selectedObject,

    // 選択中のオブジェクトがテキストか
    isTextSelected: (state) => {
      return state.selectedObject && state.selectedObject.type === "textbox";
    },

    // 選択中のオブジェクトが矩形か
    isRectSelected: (state) => {
      return state.selectedObject && state.selectedObject.type === "rect";
    },
  },

  actions: {
    // キャンバスの設定
    setCanvas(canvas: Canvas) {
      this.canvas = canvas;
      // 履歴保存のデバウンス用タイマー
      this.saveStateTimer = null;
    },

    // 背景画像の設定
    setBackgroundImage(dataUrl: string | null) {
      console.log("setBackgroundImage called in store:", dataUrl ? dataUrl.substring(0, 50) + "..." : "null");
      this.backgroundImage = dataUrl;
    },

    // 選択オブジェクトの設定
    setSelectedObject(object: any | null) {
      this.selectedObject = object;
    },

    // 編集状態の設定
    setEditingState(isEditing: boolean) {
      this.isEditing = isEditing;
    },

    // 選択オブジェクトの削除
    deleteSelectedObject() {
      if (!this.canvas || !this.selectedObject) return;

      this.canvas.remove(this.selectedObject);
      this.setSelectedObject(null);
      this.canvas.requestRenderAll();
    },

    // 選択オブジェクトの複製
    duplicateSelectedObject() {
      if (!this.canvas || !this.selectedObject) return;

      this.selectedObject.clone().then((cloned: Textbox) => {
        // 少しオフセットして配置
        cloned.set({
          left: (this.selectedObject?.left || 0) + 20,
          top: (this.selectedObject?.top || 0) + 20,
          evented: true,
          editable: true,
        });

        this.canvas?.add(markRaw(cloned));
        this.canvas?.setActiveObject(cloned);
        this.canvas?.requestRenderAll();

        // 選択状態を更新
        this.setSelectedObject(cloned);
      });
    },

    // 選択オブジェクトを前面に移動
    bringForward() {
      if (!this.canvas || !this.selectedObject) return;

      this.canvas.bringObjectForward(this.selectedObject);
      this.canvas.requestRenderAll();
    },

    // 選択オブジェクトを背面に移動
    sendBackward() {
      if (!this.canvas || !this.selectedObject) return;

      this.canvas.sendObjectBackwards(this.selectedObject);
      this.canvas.requestRenderAll();
    },

    // 選択オブジェクトを最前面に移動
    bringToFront() {
      if (!this.canvas || !this.selectedObject) return;

      this.canvas.bringObjectToFront(this.selectedObject);
      this.canvas.requestRenderAll();
    },

    // 選択オブジェクトを最背面に移動
    sendToBack() {
      if (!this.canvas || !this.selectedObject) return;

      this.canvas.sendObjectToBack(this.selectedObject);
      this.canvas.requestRenderAll();
    },

    // キャンバスのクリア
    clearCanvas() {
      if (!this.canvas) return;

      // キャンバスをクリア
      this.canvas.clear();
      this.backgroundImage = null;
      this.setSelectedObject(null);
      this.canvas.requestRenderAll();
    },
  },
});
