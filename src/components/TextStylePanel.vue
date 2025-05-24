<template>
  <div class="text-style-panel" :class="{ 'panel-disabled': !isTextSelected }">
    <div class="panel-header">
      <h3>テキストスタイル</h3>
    </div>

    <div class="panel-content" v-if="isTextSelected">
      <!-- フォント選択 -->
      <div class="style-section">
        <label for="text-font">フォント:</label>
        <select id="text-font" v-model="fontFamily" @change="updateStyle" class="style-select">
          <option v-for="font in availableFonts" :key="font.value" :value="font.value" :style="{ fontFamily: font.value }">
            {{ font.label }}
          </option>
        </select>
      </div>
      
      <!-- フォントサイズ -->
      <div class="style-section">
        <label for="text-size">サイズ:</label>
        <div class="slider-with-value">
          <input type="range" id="text-size" v-model.number="fontSize" min="8" max="120" @input="updateStyle" class="style-slider" />
          <span class="value-display">{{ fontSize }}px</span>
        </div>
      </div>
      
      <!-- テキスト色 -->
      <div class="style-section">
        <label for="text-color">色:</label>
        <input type="color" id="text-color" v-model="textColor" @input="updateStyle" class="style-color-picker" />
      </div>
      
      <!-- テキストスタイルボタン -->
      <div class="style-section">
        <div class="style-buttons">
          <button :class="{ active: isBold }" @click="toggleBold" title="太字" class="style-btn">
            <span class="icon">B</span>
          </button>
          <button :class="{ active: isItalic }" @click="toggleItalic" title="斜体" class="style-btn">
            <span class="icon">I</span>
          </button>
          <button :class="{ active: isUnderline }" @click="toggleUnderline" title="下線" class="style-btn">
            <span class="icon">U</span>
          </button>
        </div>
      </div>
      
      <!-- テキスト配置 -->
      <div class="style-section">
        <label>配置:</label>
        <div class="align-buttons">
          <button :class="{ active: textAlign === 'left' }" @click="setTextAlign('left')" title="左揃え" class="style-btn">
            <span class="icon">⟵</span>
          </button>
          <button :class="{ active: textAlign === 'center' }" @click="setTextAlign('center')" title="中央揃え" class="style-btn">
            <span class="icon">⟷</span>
          </button>
          <button :class="{ active: textAlign === 'right' }" @click="setTextAlign('right')" title="右揃え" class="style-btn">
            <span class="icon">⟶</span>
          </button>
        </div>
      </div>
    </div>

    <div class="panel-content empty-state" v-else>
      <p>テキストを選択してください</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { IText } from 'fabric';
import { useEditorStore } from '../stores/editorStore';
import { useFabricText } from '../composables/useFabricText';
import { AVAILABLE_FONTS } from '../constants/fonts';


// ストア
const store = useEditorStore();

// コンポーザブル
const { updateTextStyle } = useFabricText();

// フォントリスト
const availableFonts = ref(AVAILABLE_FONTS);

// テキスト選択状態
const isTextSelected = computed(() => {
  return store.isTextSelected;
});

// 選択中のテキストオブジェクト
const selectedText = computed<IText | null>(() => {
  if (isTextSelected.value && store.selectedObject) {
    return store.selectedObject as IText;
  }
  return null;
});

// スタイル設定
const fontFamily = ref('Arial');
const fontSize = ref(30);
const textColor = ref('#000000');
const isBold = ref(false);
const isItalic = ref(false);
const isUnderline = ref(false);
const textAlign = ref('left');

// 選択テキストが変わったらスタイル設定を更新
watch(selectedText, (text) => {
  if (text) {
    fontFamily.value = text.fontFamily || 'Arial';
    fontSize.value = text.fontSize || 30;
    textColor.value = text.fill as string || '#000000';
    isBold.value = text.fontWeight === 'bold';
    isItalic.value = text.fontStyle === 'italic';
    isUnderline.value = text.underline || false;
    textAlign.value = text.textAlign || 'left';
  }
}, { immediate: true });

// スタイルの更新
const updateStyle = () => {
  if (!selectedText.value) return;
  
  updateTextStyle(selectedText.value, {
    fontFamily: fontFamily.value,
    fontSize: fontSize.value,
    fill: textColor.value,
    fontWeight: isBold.value ? 'bold' : 'normal',
    fontStyle: isItalic.value ? 'italic' : 'normal',
    underline: isUnderline.value,
    textAlign: textAlign.value,
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
</script>

<style scoped>
.text-style-panel {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  width: 100%;
  max-width: 300px;
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
  width: 40px;
  height: 40px;
  padding: 0;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.style-buttons, .align-buttons {
  display: flex;
  gap: 5px;
}

.style-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
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

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100px;
  color: #999;
  font-size: 14px;
}

@media (max-width: 600px) {
  .text-style-panel {
    max-width: 100%;
  }
  
  .panel-content {
    padding: 10px;
  }
  
  .style-section {
    margin-bottom: 10px;
  }
}
</style>
