import { defineStore } from "pinia";
import { markRaw } from "vue";
import type { EditorState, HistoryState } from "../types";

// Fabric.jsをインポート
import { Canvas, Textbox } from "fabric";

// エディタストア
export const useEditorStore = defineStore("editor", {
  state: (): EditorState & HistoryState & { saveStateTimer: ReturnType<typeof setTimeout> | null } => ({
    // キャンバス
    canvas: null,
    // 背景画像
    backgroundImage: null,
    // 選択中のオブジェクト
    selectedObject: null,
    // 編集中フラグ
    isEditing: false,
    // 履歴
    undoStack: [],
    redoStack: [],
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

    // 元に戻せるか
    canUndo: (state) => state.undoStack.length > 0,

    // やり直せるか
    canRedo: (state) => state.redoStack.length > 0,
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

      // 履歴に保存
      this.saveState();
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

        // 履歴に保存
        this.saveState();
      });
    },

    // 選択オブジェクトを前面に移動
    bringForward() {
      if (!this.canvas || !this.selectedObject) return;

      this.canvas.bringObjectForward(this.selectedObject);
      this.canvas.requestRenderAll();

      // 履歴に保存
      this.saveState();
    },

    // 選択オブジェクトを背面に移動
    sendBackward() {
      if (!this.canvas || !this.selectedObject) return;

      this.canvas.sendObjectBackwards(this.selectedObject);
      this.canvas.requestRenderAll();

      // 履歴に保存
      this.saveState();
    },

    // 選択オブジェクトを最前面に移動
    bringToFront() {
      if (!this.canvas || !this.selectedObject) return;

      this.canvas.bringObjectToFront(this.selectedObject);
      this.canvas.requestRenderAll();

      // 履歴に保存
      this.saveState();
    },

    // 選択オブジェクトを最背面に移動
    sendToBack() {
      if (!this.canvas || !this.selectedObject) return;

      this.canvas.sendObjectToBack(this.selectedObject);
      this.canvas.requestRenderAll();

      // 履歴に保存
      this.saveState();
    },

    // 状態の保存（履歴用）
    saveState(debounced: boolean = true) {
      if (!this.canvas) return;

      // すでにタイマーがある場合はクリア
      if (this.saveStateTimer) {
        clearTimeout(this.saveStateTimer);
        this.saveStateTimer = null;
      }

      if (debounced) {
        // 500msのデバウンス
        this.saveStateTimer = setTimeout(() => {
          this.performSaveState();
        }, 500);
      } else {
        // 即時保存
        this.performSaveState();
      }
    },

    // 実際の保存処理
    performSaveState() {
      if (!this.canvas) return;

      try {
        // 背景画像を一時的に保持し、JSONから除外して保存
        const bg = this.canvas.backgroundImage;
        this.canvas.backgroundImage = undefined;

        // キャンバスの状態を保存（オブジェクトの参照ではなくJSON形式で保存）
        const json = JSON.stringify(this.canvas.toJSON());

        // 背景画像を復元
        this.canvas.backgroundImage = bg;

        // 履歴スタックに追加
        this.undoStack.push(json);

        // スタックが大きくなりすぎないように制限
        if (this.undoStack.length > 5) {
          this.undoStack.shift();
        }

        // 新しい操作を行った場合、やり直しスタックをクリア
        this.redoStack = [];
      } catch (error) {
        console.error("Failed to save state:", error);
      }
    },

    // 元に戻す
    undo() {
      if (!this.canvas || this.undoStack.length === 0) return;

      // 現在の状態をやり直しスタックに保存
      try {
        const bg = this.canvas.backgroundImage;
        this.canvas.backgroundImage = undefined;
        const currentState = JSON.stringify(this.canvas.toJSON());
        this.canvas.backgroundImage = bg;
        this.redoStack.push(currentState);
      } catch (e) {
        console.error("Failed to stringify current state for undo:", e);
      }

      // 履歴から前の状態を取得
      const previousState = this.undoStack.pop();
      if (previousState) {
        this.loadCanvasState(previousState);
      }
    },

    // やり直し
    redo() {
      if (!this.canvas || this.redoStack.length === 0) return;

      // 現在の状態を元に戻すスタックに保存
      try {
        const bg = this.canvas.backgroundImage;
        this.canvas.backgroundImage = undefined;
        const currentState = JSON.stringify(this.canvas.toJSON());
        this.canvas.backgroundImage = bg;
        this.undoStack.push(currentState);
      } catch (e) {
        console.error("Failed to stringify current state for redo:", e);
      }

      // やり直しスタックから状態を取得
      const nextState = this.redoStack.pop();
      if (nextState) {
        this.loadCanvasState(nextState);
      }
    },

    // キャンバス状態の読み込み
    loadCanvasState(jsonState: string) {
      if (!this.canvas) return;

      // 選択状態をクリア
      this.setSelectedObject(null);

      // キャンバスをクリア
      this.canvas.clear();

      // JSONから状態を読み込み
      this.canvas.loadFromJSON(jsonState, () => {
        this.canvas?.requestRenderAll();
      });
    },

    // キャンバスのクリア
    clearCanvas() {
      if (!this.canvas) return;

      // 現在の状態を保存（即時保存）
      this.saveState(false);

      // キャンバスをクリア
      this.canvas.clear();
      this.backgroundImage = null;
      this.setSelectedObject(null);
      this.canvas.requestRenderAll();
    },
  },
});
