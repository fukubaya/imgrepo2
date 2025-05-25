import { defineStore } from "pinia";
import type { EditorState, HistoryState } from "../types";

// Fabric.jsをインポート
import { Canvas, IText } from "fabric";

// エディタストア
export const useEditorStore = defineStore("editor", {
  state: (): EditorState & HistoryState => ({
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
      return state.selectedObject && state.selectedObject.type === "i-text";
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
    },

    // 背景画像の設定
    setBackgroundImage(dataUrl: string | null) {
      console.log("setBackgroundImage called in store:", dataUrl ? dataUrl.substring(0, 50) + "..." : "null");
      this.backgroundImage = dataUrl;
    },

    // 選択オブジェクトの設定
    setSelectedObject(object: IText | null) {
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

      this.selectedObject.clone().then((cloned: IText) => {
        // 少しオフセットして配置
        cloned.set({
          left: (this.selectedObject?.left || 0) + 20,
          top: (this.selectedObject?.top || 0) + 20,
          evented: true,
        });

        this.canvas?.add(cloned);
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

      this.canvas.bringForward(this.selectedObject);
      this.canvas.requestRenderAll();

      // 履歴に保存
      this.saveState();
    },

    // 選択オブジェクトを背面に移動
    sendBackward() {
      if (!this.canvas || !this.selectedObject) return;

      this.canvas.sendBackward(this.selectedObject);
      this.canvas.requestRenderAll();

      // 履歴に保存
      this.saveState();
    },

    // 選択オブジェクトを最前面に移動
    bringToFront() {
      if (!this.canvas || !this.selectedObject) return;

      this.canvas.bringToFront(this.selectedObject);
      this.canvas.requestRenderAll();

      // 履歴に保存
      this.saveState();
    },

    // 選択オブジェクトを最背面に移動
    sendToBack() {
      if (!this.canvas || !this.selectedObject) return;

      this.canvas.sendToBack(this.selectedObject);
      this.canvas.requestRenderAll();

      // 履歴に保存
      this.saveState();
    },

    // 状態の保存（履歴用）
    saveState() {
      if (!this.canvas) return;

      // キャンバスの状態をJSON文字列として保存
      const json = JSON.stringify(this.canvas.toJSON(["id", "selectable"]));

      // 履歴スタックに追加
      this.undoStack.push(json);

      // スタックが大きくなりすぎないように制限
      if (this.undoStack.length > 20) {
        this.undoStack.shift();
      }

      // 新しい操作を行った場合、やり直しスタックをクリア
      this.redoStack = [];
    },

    // 元に戻す
    undo() {
      if (!this.canvas || this.undoStack.length === 0) return;

      // 現在の状態をやり直しスタックに保存
      const currentState = JSON.stringify(this.canvas.toJSON(["id", "selectable"]));
      this.redoStack.push(currentState);

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
      const currentState = JSON.stringify(this.canvas.toJSON(["id", "selectable"]));
      this.undoStack.push(currentState);

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

      // 現在の状態を保存
      this.saveState();

      // キャンバスをクリア
      this.canvas.clear();
      this.backgroundImage = null;
      this.setSelectedObject(null);
      this.canvas.requestRenderAll();
    },
  },
});
