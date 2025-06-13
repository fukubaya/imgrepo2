<template>
  <div class="text-panel">
    <div
      class="text-style-panel"
      :class="{ 'panel-disabled': !isTextSelected }"
    >
      <div class="panel-header">
        <h3>テキストスタイル</h3>
      </div>

      <div class="panel-content" v-if="isTextSelected">
        <!-- フォント選択 -->
        <div class="style-section">
          <select
            id="text-font"
            v-model="fontFamily"
            @change="updateStyle"
            class="style-select"
          >
            <option
              v-for="font in availableFonts"
              :key="font.value"
              :value="font.value"
              :style="{ fontFamily: font.value }"
            >
              {{ font.label }}
            </option>
          </select>
        </div>

        <div class="style-section">
          <div class="slider-with-value">
            <input
              type="range"
              id="text-scale"
              v-model.number="scale"
              min="0.1"
              max="50"
              step="0.1"
              @input="updateStyle"
              class="style-slider"
            />
            <span class="value-display">{{ scale }}</span>
          </div>
        </div>

        <div class="style-buttons-section">
          <!-- テキスト色 -->
          <div class="buttons">
            <input
              type="color"
              id="text-color"
              v-model="textColor"
              @input="updateStyle"
              class="style-color-picker"
            />
          </div>
          <!-- テキストスタイルボタン -->
          <div class="buttons">
            <button
              :class="{ active: isBold }"
              @click="toggleBold"
              title="太字"
              class="style-btn"
            >
              <span class="icon">B</span>
            </button>
            <button
              :class="{ active: isItalic }"
              @click="toggleItalic"
              title="斜体"
              class="style-btn"
            >
              <span class="icon">I</span>
            </button>
            <button
              :class="{ active: isUnderline }"
              @click="toggleUnderline"
              title="下線"
              class="style-btn"
            >
              <span class="icon">U</span>
            </button>
          </div>

          <!-- テキスト配置 -->
          <div class="buttons">
            <button
              :class="{ active: textAlign === 'left' }"
              @click="setTextAlign('left')"
              title="左揃え"
              class="style-btn"
            >
              <span class="icon">⟵</span>
            </button>
            <button
              :class="{ active: textAlign === 'center' }"
              @click="setTextAlign('center')"
              title="中央揃え"
              class="style-btn"
            >
              <span class="icon">⟷</span>
            </button>
            <button
              :class="{ active: textAlign === 'right' }"
              @click="setTextAlign('right')"
              title="右揃え"
              class="style-btn"
            >
              <span class="icon">⟶</span>
            </button>
          </div>
        </div>

        <div class="style-section">
          <div class="control-row">
            <div class="slider-with-value">
              <label for="background-color-opacity">透明度</label>
              <input
                type="range"
                id="background-color-opacity"
                v-model.number="textColorOpacity"
                min="0"
                max="1"
                step="0.01"
                @input="updateStyle"
                class="effect-slider"
              />
              <span class="value-display">{{
                  Math.round(
                    textColorOpacity * 100,
                  )
                }}%</span>
            </div>
          </div>
        </div>
      </div>

      <div class="panel-content empty-state" v-else>
        <p>テキストを選択してください</p>
      </div>
    </div>
    <div
      class="text-effects-panel"
      :class="{ 'panel-disabled': !isTextSelected }"
    >
      <div class="panel-header">
        <h3>テキスト効果</h3>
      </div>

      <div class="panel-content" v-if="isTextSelected">
        <!-- 影効果 -->
        <div class="effect-section">
          <div class="effect-header">
            <h4>影</h4>
            <label class="toggle-switch">
              <input type="checkbox" v-model="hasShadow" @change="updateShadow">
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="effect-controls" v-if="hasShadow">
            <div class="control-row">
              <input
                type="color"
                id="shadow-color"
                v-model="shadowColor"
                @input="updateShadow"
                class="effect-color-picker"
                v-if="hasShadow"
              />
            </div>
            <div class="control-row">
              <div class="slider-with-value">
                <label for="shadow-blur">ぼかし</label>
                <input
                  type="range"
                  id="shadow-blur"
                  v-model.number="shadowBlur"
                  min="0"
                  max="50"
                  @input="updateShadow"
                  class="effect-slider"
                />
                <span class="value-display">{{ shadowBlur }}px</span>
              </div>
            </div>

            <div class="control-row">
              <div class="slider-with-value">
                <label for="shadow-offset-x">X</label>
                <input
                  type="range"
                  id="shadow-offset-x"
                  v-model.number="shadowOffsetX"
                  min="-50"
                  max="50"
                  @input="updateShadow"
                  class="effect-slider"
                />
                <span class="value-display">{{ shadowOffsetX }}px</span>
              </div>
            </div>

            <div class="control-row">
              <div class="slider-with-value">
                <label for="shadow-offset-y">Y</label>
                <input
                  type="range"
                  id="shadow-offset-y"
                  v-model.number="shadowOffsetY"
                  min="-50"
                  max="50"
                  @input="updateShadow"
                  class="effect-slider"
                />
                <span class="value-display">{{ shadowOffsetY }}px</span>
              </div>
            </div>
          </div>
        </div>

        <!-- アウトライン効果 -->
        <div class="effect-section">
          <div class="effect-header">
            <h4>アウトライン</h4>
            <label class="toggle-switch">
              <input
                type="checkbox"
                v-model="hasOutline"
                @change="updateOutline"
              >
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="effect-controls" v-if="hasOutline">
            <div class="control-row">
              <input
                type="color"
                id="outline-color"
                v-model="outlineColor"
                @input="updateOutline"
                class="effect-color-picker"
                v-if="hasOutline"
              />
            </div>
            <div class="control-row">
              <div class="slider-with-value">
                <label for="outline-width">太さ</label>
                <input
                  type="range"
                  id="outline-width"
                  v-model.number="outlineWidth"
                  min="1"
                  max="10"
                  @input="updateOutline"
                  class="effect-slider"
                />
                <span class="value-display">{{ outlineWidth }}px</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 背景色  -->
        <div class="effect-section">
          <div class="effect-header">
            <h4>背景色</h4>
            <label class="toggle-switch">
              <input
                type="checkbox"
                v-model="hasBackgroundColor"
                @change="updateBackgroundColor"
              >
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="effect-controls" v-if="hasBackgroundColor">
            <div class="control-row">
              <input
                type="color"
                id="background-color"
                v-model="backgroundColor"
                @input="updateBackgroundColor"
                class="effect-color-picker"
              />
            </div>
            <div class="control-row">
              <div class="slider-with-value">
                <label for="background-color-opacity">透明度</label>
                <input
                  type="range"
                  id="background-color-opacity"
                  v-model.number="backgroundColorOpacity"
                  min="0"
                  max="1"
                  step="0.01"
                  @input="updateBackgroundColor"
                  class="effect-slider"
                />
                <span class="value-display">{{
                    Math.round(
                      backgroundColorOpacity * 100,
                    )
                  }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- エフェクトプリセット -->
        <div class="effect-section">
          <h4>エフェクトプリセット</h4>
          <div class="effect-presets">
            <button
              v-for="(preset, key) in TEXT_EFFECT_PRESETS"
              :key="key"
              @click="applyPreset(key)"
              class="preset-btn"
              :title="preset.name"
              :style="
                {
                  textShadow: preset.shadow
                    ? `${preset.shadow.offsetX}px ${preset.shadow.offsetY}px ${preset.shadow.blur}px ${preset.shadow.color}`
                    : 'none',
                  '-webkit-text-stroke': preset.stroke
                    ? `${
                      preset.strokeWidth || 1
                    }px ${preset.stroke}`
                    : 'none',
                  backgroundColor: preset.textBackgroundColor
                    ? preset.textBackgroundColor
                    : 'transparent',
                }
              "
            >
              {{ preset.name }}
            </button>
          </div>
        </div>
      </div>

      <div class="panel-content empty-state" v-else>
        <p>テキストを選択してください</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Shadow, Textbox } from "fabric";
import { computed, onMounted, ref, watch } from "vue";
import { useFabricText } from "../composables/useFabricText";
import { useFont } from "../composables/useFont";
import { AVAILABLE_FONTS, DEFAULT_FONT } from "../constants/fonts";
import { TEXT_EFFECT_PRESETS } from "../constants/textEffects";
import {
  extractRGBA,
  hexToRgb,
  isAvailableFont,
  rgbToHex,
  roundToPointOne,
} from "../lib/common";
import { useEditorStore } from "../stores/editorStore";

// ストア
const store = useEditorStore();

// コンポーザブル
const { updateTextStyle, applyTextEffect } = useFabricText();

// フォントリスト
const availableFonts = ref(AVAILABLE_FONTS);

// テキスト選択状態
const isTextSelected = computed(() => {
  return store.isTextSelected;
});

// フォント読み込み
const { loadFont } = useFont();

// 選択中のテキストオブジェクト
const selectedText = computed<Textbox | null>(() => {
  if (isTextSelected.value && store.selectedObject) {
    return store.selectedObject as Textbox;
  }
  return null;
});

// スタイル設定
const fontFamily = ref("Arial");
const fontSize = ref(30);
const textColor = ref("#000000");
const textColorOpacity = ref(1);
const isBold = ref(false);
const isItalic = ref(false);
const isUnderline = ref(false);
const textAlign = ref("left");
const scale = ref(1);

//
onMounted(() => {
  // fontの読み込み
  loadFont(document, {
    kitId: import.meta.env.VITE_ADOBE_KITID,
    scriptTimeout: 3000,
    async: true,
    active: () => {
      // フォント読み込み完了後に利用可能なフォントを更新
      availableFonts.value = AVAILABLE_FONTS.filter((font) => {
        return isAvailableFont(document, font);
      });
    },
  });
});

// 選択テキストが変わったらスタイル設定を更新
watch(selectedText, (text) => {
  if (text) {
    const rgba = extractRGBA(text.fill as string || "rgb(0 0 0 / 100%)");
    fontFamily.value = text.fontFamily || DEFAULT_FONT;
    fontSize.value = text.fontSize || 30;
    textColor.value = rgbToHex(rgba);
    textColorOpacity.value = rgba.a ? rgba.a / 100.0 : 1;
    isBold.value = text.fontWeight === "bold";
    isItalic.value = text.fontStyle === "italic";
    isUnderline.value = text.underline || false;
    textAlign.value = text.textAlign || "left";
    const rScale = roundToPointOne(text.scaleX || text.scaleY || 1);
    text.scaleX = rScale;
    text.scaleY = rScale;
    scale.value = rScale;
  }
}, { immediate: true });

// スタイルの更新
const updateStyle = () => {
  if (!selectedText.value) return;

  const rgba = hexToRgb(textColor.value);
  const rScale = roundToPointOne(
    selectedText.value.scaleX || selectedText.value.scaleY || 1,
  );
  scale.value = rScale;
  updateTextStyle(selectedText.value, {
    fontFamily: fontFamily.value,
    fontSize: fontSize.value,
    fill: `rgb(${rgba.r} ${rgba.g} ${rgba.b} / ${
      textColorOpacity.value * 100
    }%)`,
    fontWeight: isBold.value ? "bold" : "normal",
    fontStyle: isItalic.value ? "italic" : "normal",
    underline: isUnderline.value,
    textAlign: textAlign.value,
    scaleX: scale.value,
    scaleY: scale.value,
  });

  // 履歴に保存
  store.saveState();
};

// 太字の切り替え
const toggleBold = () => {
  isBold.value = !isBold.value;
  updateStyle();
};

// 斜体の切り替え
const toggleItalic = () => {
  isItalic.value = !isItalic.value;
  updateStyle();
};

// 下線の切り替え
const toggleUnderline = () => {
  isUnderline.value = !isUnderline.value;
  updateStyle();
};

// テキスト配置の設定
const setTextAlign = (align: string) => {
  textAlign.value = align;
  updateStyle();
};

// 影設定
const hasShadow = ref(false);
const shadowColor = ref("rgba(0,0,0,0.6)");
const shadowBlur = ref(5);
const shadowOffsetX = ref(5);
const shadowOffsetY = ref(5);

// アウトライン設定
const hasOutline = ref(false);
const outlineColor = ref("#ffffff");
const outlineWidth = ref(1);

// 背景色設定
const hasBackgroundColor = ref(false);
const backgroundColor = ref("#ffffff");
const backgroundColorOpacity = ref(1);

// 選択テキストが変わったら効果設定を更新
watch(selectedText, (text) => {
  if (text) {
    // 影
    const shadow = text.shadow;
    hasShadow.value = !!shadow;
    if (shadow) {
      shadowColor.value = shadow.color || "#000000";
      shadowBlur.value = shadow.blur;
      shadowOffsetX.value = shadow.offsetX;
      shadowOffsetY.value = shadow.offsetY;
    }

    // アウトライン
    hasOutline.value = !!text.stroke && text.strokeWidth! > 0;
    if (text.stroke) {
      outlineColor.value = text.stroke as string;
      outlineWidth.value = text.strokeWidth === undefined
        ? 1
        : text.strokeWidth;
    }

    // 背景色
    hasBackgroundColor.value = !!text.textBackgroundColor;
    if (text.textBackgroundColor) {
      hasBackgroundColor.value = true;
      // RGBA形式から色と透明度を抽出
      const rgba = extractRGBA(
        text.textBackgroundColor as string || "rgb(0 0 0 / 100%)",
      );
      backgroundColor.value = rgbToHex(rgba);
      backgroundColorOpacity.value = rgba.a ? rgba.a / 100 : 1;
    }

    // scale
    const roundScale = roundToPointOne(text.scaleX || text.scaleY || 1);
    text.scaleX = roundScale;
    text.scaleY = roundScale;
    scale.value = roundScale;
  }
}, { immediate: true });

// 影の更新
const updateShadow = () => {
  if (!selectedText.value) return;

  if (hasShadow.value) {
    // Fabric.jsのShadowオブジェクトを作成
    const shadowOptions = new Shadow({
      affectStroke: false,
      blur: shadowBlur.value,
      color: shadowColor.value,
      id: 0,
      includeDefaultValues: true,
      nonScaling: false,
      offsetX: shadowOffsetX.value,
      offsetY: shadowOffsetY.value,
    });

    updateTextStyle(selectedText.value, {
      shadow: shadowOptions,
    });
  } else {
    updateTextStyle(selectedText.value, {
      shadow: null,
    });
  }

  // 履歴に保存
  store.saveState();
};

// アウトラインの更新
const updateOutline = () => {
  if (!selectedText.value) return;

  if (hasOutline.value) {
    updateTextStyle(selectedText.value, {
      stroke: outlineColor.value,
      strokeWidth: outlineWidth.value,
    });
  } else {
    updateTextStyle(selectedText.value, {
      stroke: null,
      strokeWidth: 0,
    });
  }

  // 履歴に保存
  store.saveState();
};

// 背景色の更新
const updateBackgroundColor = () => {
  if (!selectedText.value) return;

  if (hasBackgroundColor.value) {
    // RGBカラーをRGBAに変換
    const rgba = hexToRgb(backgroundColor.value as string);
    updateTextStyle(selectedText.value, {
      textBackgroundColor: `rgb(${rgba.r} ${rgba.g} ${rgba.b} / ${
        backgroundColorOpacity.value * 100
      }%)`,
    });
  } else {
    updateTextStyle(selectedText.value, {
      textBackgroundColor: null,
    });
  }

  // 履歴に保存
  store.saveState();
};

// エフェクトプリセットの適用
const applyPreset = (presetName: string) => {
  if (!selectedText.value) return;

  const preset = TEXT_EFFECT_PRESETS[presetName];
  console.log("Applying preset:", presetName, preset);
  if (preset) {
    // UI状態も更新
    if (preset.shadow) {
      hasShadow.value = true;
      shadowColor.value = preset.shadow.color;
      shadowBlur.value = preset.shadow.blur;
      shadowOffsetX.value = preset.shadow.offsetX;
      shadowOffsetY.value = preset.shadow.offsetY;
    } else {
      hasShadow.value = false;
    }

    if (preset.stroke) {
      hasOutline.value = true;
      outlineColor.value = preset.stroke;
      outlineWidth.value = preset.strokeWidth === undefined
        ? 1
        : preset.strokeWidth;
    } else {
      hasOutline.value = false;
    }

    if (preset.textBackgroundColor) {
      hasBackgroundColor.value = true;
      const rgba = extractRGBA(preset.textBackgroundColor);
      backgroundColor.value = rgbToHex(rgba);
      backgroundColorOpacity.value = rgba.a ? rgba.a / 100 : 1;
    } else {
      hasBackgroundColor.value = false;
    }

    // fillの色と透明度を設定
    if (preset.fill) {
      const rgba = extractRGBA(preset.fill);
      textColor.value = rgbToHex(rgba);
      textColorOpacity.value = rgba.a ? rgba.a / 100 : 1;
    }

    // プリセット設定を反映
    applyTextEffect(selectedText.value, preset);

    // 履歴に保存
    store.saveState();
  }
};
</script>

<style scoped>
.text-panel {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  width: 100%;
}

.panel-disabled {
  opacity: 0.7;
}

.panel-header {
  background-color: #f5f5f5;
  padding: 10px 15px;
  border-bottom: 1px solid #eee;
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.panel-content {
  padding: 15px;
}

.style-section {
  margin-bottom: 15px;
}

.style-buttons-section {
  margin-bottom: 15px;
  display: flex;
  justify-content: space-between;
  gap: 20px;
}

.style-section label {
  display: block;
  margin-bottom: 5px;
  font-size: 14px;
  color: #555;
}

.style-select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.slider-with-value {
  display: flex;
  align-items: center;
  gap: 10px;
}

.style-slider {
  flex: 1;
  height: 6px;
  background-color: #eee;
  border-radius: 3px;
  outline: none;
}

.value-display {
  min-width: 40px;
  text-align: right;
  font-size: 14px;
  color: #555;
}

.style-color-picker {
  width: 30px;
  height: 30px;
  padding: 0;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

 .buttons {
  display: flex;
  gap: 5px;
}

.style-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 27px;
  height: 27px;
  border: 1px solid #ddd;
  background-color: #fff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.style-btn:hover {
  background-color: #f5f5f5;
}

.style-btn.active {
  background-color: #e0e0e0;
  border-color: #bbb;
}

.icon {
  font-size: 16px;
  line-height: 1;
}

.effect-section {
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
}

.effect-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.effect-section h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
  font-weight: 600;
  color: #444;
}

.effect-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.effect-header h4 {
  margin: 0;
}

.control-row {
  margin-bottom: 10px;
}

.control-row label {
  display: block;
  margin-bottom: 5px;
  font-size: 13px;
  color: #555;
  min-width: 3em;
  text-align: right;
}

.effect-slider {
  flex: 1;
  height: 6px;
  background-color: #eee;
  border-radius: 3px;
  outline: none;
}

.value-display {
  min-width: 40px;
  text-align: right;
  font-size: 13px;
  color: #555;
}

.effect-color-picker {
  width: 30px;
  height: 30px;
  padding: 0;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}


.toggle-switch {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 20px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 20px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: #2196F3;
}

input:checked + .toggle-slider:before {
  transform: translateX(20px);
}

.effect-presets {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.preset-btn {
  padding: 6px 10px;
  border: 1px solid #ddd;
  background-color: #fff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.preset-btn:hover {
  background-color: #f5f5f5;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100px;
  color: #999;
  font-size: 14px;
}

@media (max-width: 600px) {
  .text-panel {
    max-width: 100%;
  }
  
  .panel-content {
    padding: 10px;
  }
  
  .effect-section {
    margin-bottom: 15px;
    padding-bottom: 10px;
  }

  .text-panel {
    display: flex;
    gap: 10px;
  }

  .text-style-panel, .text-effects-panel {
    flex: 1;
    min-width: 0;
  }

  .style-buttons-section {
    justify-content: center;
    flex-wrap: wrap;
  }

  .effect-slider {
    max-width: 33%;
  }
}
</style>
