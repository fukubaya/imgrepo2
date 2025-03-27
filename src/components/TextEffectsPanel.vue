<template>
  <div class="text-effects-panel" :class="{ 'panel-disabled': !isTextSelected }">
    <div class="panel-header">
      <h3>テキスト効果</h3>
    </div>

    <div class="panel-content" v-if="isTextSelected">
      <!-- 回転設定 -->
      <div class="effect-section">
        <h4>回転</h4>
        <div class="rotation-control">
          <input 
            type="range" 
            v-model.number="rotation" 
            min="0" 
            max="359" 
            @input="updateRotation" 
            class="effect-slider"
          />
          <span class="value-display">{{ rotation }}°</span>
          <button @click="resetRotation" title="回転をリセット" class="reset-btn">
            <span class="icon">↺</span>
          </button>
        </div>
      </div>
      
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
            <label for="shadow-color">色:</label>
            <input type="color" id="shadow-color" v-model="shadowColor" @input="updateShadow" class="effect-color-picker" />
          </div>
          
          <div class="control-row">
            <label for="shadow-blur">ぼかし:</label>
            <div class="slider-with-value">
              <input type="range" id="shadow-blur" v-model.number="shadowBlur" min="0" max="50" @input="updateShadow" class="effect-slider" />
              <span class="value-display">{{ shadowBlur }}px</span>
            </div>
          </div>
          
          <div class="control-row">
            <label for="shadow-offset-x">X位置:</label>
            <div class="slider-with-value">
              <input type="range" id="shadow-offset-x" v-model.number="shadowOffsetX" min="-50" max="50" @input="updateShadow" class="effect-slider" />
              <span class="value-display">{{ shadowOffsetX }}px</span>
            </div>
          </div>
          
          <div class="control-row">
            <label for="shadow-offset-y">Y位置:</label>
            <div class="slider-with-value">
              <input type="range" id="shadow-offset-y" v-model.number="shadowOffsetY" min="-50" max="50" @input="updateShadow" class="effect-slider" />
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
            <input type="checkbox" v-model="hasOutline" @change="updateOutline">
            <span class="toggle-slider"></span>
          </label>
        </div>
        
        <div class="effect-controls" v-if="hasOutline">
          <div class="control-row">
            <label for="outline-color">色:</label>
            <input type="color" id="outline-color" v-model="outlineColor" @input="updateOutline" class="effect-color-picker" />
          </div>
          
          <div class="control-row">
            <label for="outline-width">太さ:</label>
            <div class="slider-with-value">
              <input type="range" id="outline-width" v-model.number="outlineWidth" min="1" max="10" @input="updateOutline" class="effect-slider" />
              <span class="value-display">{{ outlineWidth }}px</span>
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
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useEditorStore } from '../stores/editorStore';
import { useFabricText } from '../composables/useFabricText';
import { TEXT_EFFECT_PRESETS } from '../constants/textEffects';
import type { FabricIText } from '../types';

// ストア
const store = useEditorStore();

// コンポーザブル
const { updateTextStyle, applyTextEffect } = useFabricText();

// テキスト選択状態
const isTextSelected = computed(() => {
  return store.isTextSelected;
});

// 選択中のテキストオブジェクト
const selectedText = computed<FabricIText | null>(() => {
  if (isTextSelected.value && store.selectedObject) {
    return store.selectedObject as FabricIText;
  }
  return null;
});

// 回転設定
const rotation = ref(0);

// 影設定
const hasShadow = ref(false);
const shadowColor = ref('rgba(0,0,0,0.6)');
const shadowBlur = ref(5);
const shadowOffsetX = ref(5);
const shadowOffsetY = ref(5);

// アウトライン設定
const hasOutline = ref(false);
const outlineColor = ref('#ffffff');
const outlineWidth = ref(1);

// 選択テキストが変わったら効果設定を更新
watch(selectedText, (text) => {
  if (text) {
    // 回転
    rotation.value = Math.round(text.angle || 0);
    
    // 影
    const shadow = text.shadow;
    hasShadow.value = !!shadow;
    if (shadow) {
      shadowColor.value = shadow.color || 'rgba(0,0,0,0.6)';
      shadowBlur.value = shadow.blur || 5;
      shadowOffsetX.value = shadow.offsetX || 5;
      shadowOffsetY.value = shadow.offsetY || 5;
    }
    
    // アウトライン
    hasOutline.value = !!text.stroke && text.strokeWidth! > 0;
    if (text.stroke) {
      outlineColor.value = text.stroke as string;
      outlineWidth.value = text.strokeWidth || 1;
    }
  }
}, { immediate: true });

// 回転の更新
const updateRotation = () => {
  if (!selectedText.value) return;
  
  updateTextStyle(selectedText.value, {
    angle: rotation.value
  });
  
  // 履歴に保存
  store.saveState();
};

// 回転のリセット
const resetRotation = () => {
  rotation.value = 0;
  updateRotation();
};

    // 影の更新
const updateShadow = () => {
  if (!selectedText.value) return;
  
  if (hasShadow.value) {
    // Fabric.jsのShadowオブジェクトを作成
    // @ts-ignore
    const shadowOptions = {
      color: shadowColor.value,
      blur: shadowBlur.value,
      offsetX: shadowOffsetX.value,
      offsetY: shadowOffsetY.value
    };
    
    updateTextStyle(selectedText.value, {
      shadow: shadowOptions
    });
  } else {
    updateTextStyle(selectedText.value, {
      shadow: null
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
      strokeWidth: outlineWidth.value
    });
  } else {
    updateTextStyle(selectedText.value, {
      stroke: null,
      strokeWidth: 0
    });
  }
  
  // 履歴に保存
  store.saveState();
};

// エフェクトプリセットの適用
const applyPreset = (presetName: string) => {
  if (!selectedText.value) return;
  
  const preset = TEXT_EFFECT_PRESETS[presetName];
  if (preset) {
    // プリセット設定を反映
    applyTextEffect(selectedText.value, preset);
    
    // UI状態も更新
    if (preset.shadow) {
      hasShadow.value = true;
      shadowColor.value = preset.shadow.color || 'rgba(0,0,0,0.6)';
      shadowBlur.value = preset.shadow.blur || 5;
      shadowOffsetX.value = preset.shadow.offsetX || 5;
      shadowOffsetY.value = preset.shadow.offsetY || 5;
    } else {
      hasShadow.value = false;
    }
    
    if (preset.stroke) {
      hasOutline.value = true;
      outlineColor.value = preset.stroke;
      outlineWidth.value = preset.strokeWidth || 1;
    } else {
      hasOutline.value = false;
    }
    
    // 履歴に保存
    store.saveState();
  }
};
</script>

<style scoped>
.text-effects-panel {
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

.effect-controls {
  padding-left: 10px;
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

.slider-with-value {
  display: flex;
  align-items: center;
  gap: 10px;
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
  width: 36px;
  height: 36px;
  padding: 0;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.rotation-control {
  display: flex;
  align-items: center;
  gap: 10px;
}

.reset-btn {
  width: 30px;
  height: 30px;
  border: 1px solid #ddd;
  background-color: #fff;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.2s;
}

.reset-btn:hover {
  background-color: #f5f5f5;
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
  .text-effects-panel {
    max-width: 100%;
  }
  
  .panel-content {
    padding: 10px;
  }
  
  .effect-section {
    margin-bottom: 15px;
    padding-bottom: 10px;
  }
}
</style>
