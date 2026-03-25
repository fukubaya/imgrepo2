<template>
  <div class="rect-panel">
    <div
      class="rect-style-panel"
      :class="{ 'panel-disabled': !isRectSelected }"
    >
      <div class="panel-header">
        <h3>矩形スタイル</h3>
      </div>

      <div class="panel-content" v-if="isRectSelected">
        <!-- 色設定 -->
        <div class="style-section">
          <div class="control-row">
            <label>塗り色</label>
            <div class="slider-with-value">
              <input
                type="color"
                v-model="fillColor"
                @input="updateRect"
                class="style-color-picker"
              />
              <button
                class="step-btn"
                @click="
                  fillOpacity = Math.max(
                    0,
                    Math.round((fillOpacity - 0.05) * 100) / 100,
                  );
                  updateRect();
                "
              >
                -
              </button>
              <input
                type="range"
                v-model.number="fillOpacity"
                min="0"
                max="1"
                step="0.01"
                @input="updateRect"
                class="effect-slider"
              />
              <button
                class="step-btn"
                @click="
                  fillOpacity = Math.min(
                    1,
                    Math.round((fillOpacity + 0.05) * 100) / 100,
                  );
                  updateRect();
                "
              >
                +
              </button>
              <span class="value-display">{{
                  Math.round(fillOpacity * 100)
                }}%</span>
            </div>
          </div>
        </div>

        <div class="style-section">
          <div class="control-row">
            <label>線の色</label>
            <div class="slider-with-value">
              <input
                type="color"
                v-model="strokeColor"
                @input="updateRect"
                class="style-color-picker"
              />
              <button
                class="step-btn"
                @click="
                  strokeOpacity = Math.max(
                    0,
                    Math.round((strokeOpacity - 0.05) * 100) / 100,
                  );
                  updateRect();
                "
              >
                -
              </button>
              <input
                type="range"
                v-model.number="strokeOpacity"
                min="0"
                max="1"
                step="0.01"
                @input="updateRect"
                class="effect-slider"
              />
              <button
                class="step-btn"
                @click="
                  strokeOpacity = Math.min(
                    1,
                    Math.round((strokeOpacity + 0.05) * 100) / 100,
                  );
                  updateRect();
                "
              >
                +
              </button>
              <span class="value-display">{{
                  Math.round(strokeOpacity * 100)
                }}%</span>
            </div>
          </div>
        </div>

        <div class="style-section">
          <div class="control-row">
            <div class="slider-with-value">
              <label for="stroke-width">線の太さ</label>
              <button
                class="step-btn"
                @click="
                  strokeWidth = Math.max(0, strokeWidth - 1);
                  applyStrokeStyle();
                "
              >
                -
              </button>
              <input
                type="range"
                id="stroke-width"
                v-model.number="strokeWidth"
                min="0"
                max="100"
                step="1"
                @input="updateRect"
                class="effect-slider"
              />
              <button
                class="step-btn"
                @click="
                  strokeWidth = Math.min(100, strokeWidth + 1);
                  applyStrokeStyle();
                "
              >
                +
              </button>
              <span class="value-display">{{ strokeWidth }}px</span>
            </div>
          </div>
        </div>

        <!-- プリセット的なスタイルの簡易例 -->
        <div class="style-section">
          <label>線スタイル</label>
          <select
            v-model="selectedStrokeStyle"
            @change="applyStrokeStyle"
            class="style-select"
          >
            <option :value="[]">実線</option>
            <option :value="[5, 5]">点線</option>
          </select>
        </div>
      </div>

      <div class="panel-content empty-state" v-else>
        <p>矩形を選択してください</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Rect } from "fabric";
import { computed, ref, watch } from "vue";
import { useFabricRect } from "../composables/useFabricRect";
import { useEditorStore } from "../stores/editorStore";

// ストア
const store = useEditorStore();

// コンポーザブル
const { updateRectStyle } = useFabricRect();

// 選択状態
const isRectSelected = computed(() => {
  return store.isRectSelected;
});

const selectedRect = computed<Rect | null>(() => {
  if (isRectSelected.value && store.selectedObject instanceof Rect) {
    return store.selectedObject as Rect;
  }
  return null;
});

// UI state
const fillColor = ref("#D81B60");
const fillOpacity = ref(1);
const strokeColor = ref("#880E4F");
const strokeOpacity = ref(1);
const strokeWidth = ref(2);
const strokeDashArray = ref<number[]>([]);
const selectedStrokeStyle = ref<number[]>([]);

import { hexToRgb } from "../lib/common";

// 選択テキストが変わったらスタイル設定を更新
watch(selectedRect, (rect) => {
  if (rect) {
    // 塗り
    const f = rect.fill as string;
    if (f && f.startsWith("rgba")) {
      const parts = f.match(/[\d.]+/g);
      if (parts) {
        fillColor.value = "#"
          + parts.slice(0, 3).map(n =>
            parseInt(n).toString(16).padStart(2, "0")
          ).join("");
        fillOpacity.value = parseFloat(parts[3]);
      }
    } else {
      fillColor.value = f || "#000000";
      fillOpacity.value = 1;
    }

    // 線
    const s = rect.stroke as string;
    if (s && s.startsWith("rgba")) {
      const parts = s.match(/[\d.]+/g);
      if (parts) {
        strokeColor.value = "#"
          + parts.slice(0, 3).map(n =>
            parseInt(n).toString(16).padStart(2, "0")
          ).join("");
        strokeOpacity.value = parseFloat(parts[3]);
      }
    } else {
      strokeColor.value = s || "#000000";
      strokeOpacity.value = 1;
    }

    strokeWidth.value = rect.strokeWidth || 0;
    strokeDashArray.value = rect.strokeDashArray || [];

    // 元の dashArray の比率を復元するための判定 (太さが0なら1とする)
    if (strokeDashArray.value.length > 0) {
      const w = strokeWidth.value || 1;
      selectedStrokeStyle.value = strokeDashArray.value.map(v => v / w);
    } else {
      selectedStrokeStyle.value = [];
    }
  }
}, { immediate: true });

const applyStrokeStyle = () => {
  if (selectedStrokeStyle.value.length > 0) {
    const w = strokeWidth.value || 1;
    strokeDashArray.value = selectedStrokeStyle.value.map(v => v * w);
  } else {
    strokeDashArray.value = [];
  }
  updateRect();
};

// 更新処理
const updateRect = () => {
  if (!selectedRect.value) return;

  const fRgb = hexToRgb(fillColor.value);
  const sRgb = hexToRgb(strokeColor.value);

  updateRectStyle(selectedRect.value, {
    fill: `rgba(${fRgb.r}, ${fRgb.g}, ${fRgb.b}, ${fillOpacity.value})`,
    stroke: `rgba(${sRgb.r}, ${sRgb.g}, ${sRgb.b}, ${strokeOpacity.value})`,
    strokeWidth: strokeWidth.value,
    strokeDashArray: strokeDashArray.value.length > 0
      ? strokeDashArray.value
      : undefined,
  });

  store.saveState();
};
</script>

<style scoped>
.rect-panel {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  padding: 15px;
}
.panel-header h3 { margin-bottom: 10px; font-size: 16px; }
.style-section { margin-bottom: 15px; }
.style-color-picker {
  width: 30px;
  height: 30px;
  padding: 0;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}
.effect-slider {
  flex: 1;
  height: 6px;
  background-color: #eee;
  border-radius: 3px;
  outline: none;
}
.value-display {
  min-width: 30px;
  text-align: right;
  font-size: 13px;
  color: #555;
}
.step-btn {
  padding: 0 8px;
  background: #eee;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.step-btn:hover {
  background: #ddd;
}
.style-select { width: 100%; padding: 5px; }
.empty-state { color: #999; text-align: center; }
.slider-with-value {
  display: flex;
  align-items: center;
  gap: 5px;
}
.control-row {
  margin-bottom: 10px;
}
.control-row label {
  display: block;
  margin-bottom: 5px;
  font-size: 13px;
  color: #555;
}
</style>
