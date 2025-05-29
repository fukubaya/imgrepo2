import type { FontOption } from "../types";

// 利用可能なフォントのリスト
export const AVAILABLE_FONTS: FontOption[] = [
  // 基本フォント
  { value: "Arial", label: "Arial", category: "sans-serif" },
  { value: "Courier New", label: "Courier New", category: "monospace" },

  // 日本語フォント
  { value: "Klee Demibold", label: "クレー デミボールド", category: "japanese" },
  { value: "Klee Medium", label: "クレー ミディアム", category: "japanese" },
  { value: "Hiragino Kaku Gothic Pro W3", label: "ヒラギノ角ゴ Pro W3", category: "japanese" },
  { value: "Hiragino Kaku Gothic Pro W6", label: "ヒラギノ角ゴ Pro W6", category: "japanese" },
  { value: "Hiragino Kaku Gothic ProN W3", label: "ヒラギノ角ゴ ProN W3", category: "japanese" },
  { value: "Hiragino Kaku Gothic ProN W6", label: "ヒラギノ角ゴ ProN W6", category: "japanese" },
  { value: "Hiragino Kaku Gothic Std W8", label: "ヒラギノ角ゴ Std W8", category: "japanese" },
  { value: "Hiragino Kaku Gothic StdN W8", label: "ヒラギノ角ゴ StdN W8", category: "japanese" },
  { value: "Hiragino Sans W0", label: "ヒラギノ角ゴシック W0", category: "japanese" },
  { value: "Hiragino Sans W1", label: "ヒラギノ角ゴシック W1", category: "japanese" },
  { value: "Hiragino Sans W2", label: "ヒラギノ角ゴシック W2", category: "japanese" },
  { value: "Hiragino Sans W3", label: "ヒラギノ角ゴシック W3", category: "japanese" },
  { value: "Hiragino Sans W4", label: "ヒラギノ角ゴシック W4", category: "japanese" },
  { value: "Hiragino Sans W5", label: "ヒラギノ角ゴシック W5", category: "japanese" },
  { value: "Hiragino Sans W6", label: "ヒラギノ角ゴシック W6", category: "japanese" },
  { value: "Hiragino Sans W7", label: "ヒラギノ角ゴシック W7", category: "japanese" },
  { value: "Hiragino Sans W8", label: "ヒラギノ角ゴシック W8", category: "japanese" },
  { value: "Hiragino Sans W9", label: "ヒラギノ角ゴシック W9", category: "japanese" },
  { value: "Hiragino Maru Gothic Pro W4", label: "ヒラギノ丸ゴ Pro W4", category: "japanese" },
  { value: "Hiragino Maru Gothic ProN W4", label: "ヒラギノ丸ゴ ProN W4", category: "japanese" },
  { value: "Hiragino Mincho Pro W3", label: "ヒラギノ明朝 Pro W3", category: "japanese" },
  { value: "Hiragino Mincho Pro W6", label: "ヒラギノ明朝 Pro W6", category: "japanese" },
  { value: "Hiragino Mincho ProN W3", label: "ヒラギノ明朝 ProN W3", category: "japanese" },
  { value: "Hiragino Mincho ProN W6", label: "ヒラギノ明朝 ProN W6", category: "japanese" },
  { value: "fot-tsukuardgothic-std", label: "FOT-筑紫A丸ゴシック Std", category: "japanese" },
  { value: "fot-tsukubrdgothic-std", label: "FOT-筑紫B丸ゴシック Std", category: "japanese" },
  { value: "Tsukushi A Round Gothic Bold", label: "筑紫A丸ゴシック ボールド", category: "japanese" },
  { value: "Tsukushi A Round Gothic Regular", label: "筑紫A丸ゴシック レギュラー", category: "japanese" },
  { value: "Tsukushi B Round Gothic Bold", label: "筑紫B丸ゴシック ボールド", category: "japanese" },
  { value: "Tsukushi B Round Gothic Regular", label: "筑紫B丸ゴシック レギュラー", category: "japanese" },
  { value: "toppan-bunkyu-midashi-go-std", label: "凸版文久見出しゴシック StdN", category: "japanese" },
  { value: "Toppan Bunkyu Gothic Regular", label: "凸版文久ゴシック Regular", category: "japanese" },
  { value: "Toppan Bunkyu Midashi Gothic Extrabold", label: "凸版文久見出しゴシック Extrabold", category: "japanese" },
  { value: "Toppan Bunkyu Midashi Mincho Extrabold", label: "凸版文久見出し明朝 Extrabold", category: "japanese" },
  { value: "Toppan Bunkyu Mincho Regular", label: "凸版文久明朝 Regular", category: "japanese" },
  { value: "YuGothic Bold", label: "游ゴシック体 ボールド", category: "japanese" },
  { value: "YuGothic Medium", label: "游ゴシック体 ミディアム", category: "japanese" },
  { value: "yu-gothic-pr6n", label: "游ゴシック体 Pr6N", category: "japanese" },
  { value: "YuMincho Demibold", label: "游明朝体 デミボールド", category: "japanese" },
  { value: "YuMincho Extrabold", label: "游明朝体 エクストラボールド", category: "japanese" },
  { value: "YuMincho Medium", label: "游明朝体 ミディアム", category: "japanese" },
  { value: "YuMincho +36p Kana Demibold", label: "游明朝体+36ポかな デミボールド", category: "japanese" },
  { value: "YuMincho +36p Kana Extrabold", label: "游明朝体+36ポかな エクストラボールド", category: "japanese" },
  { value: "YuMincho +36p Kana Medium", label: "游明朝体+36ポかな ミディアム", category: "japanese" },
  { value: "yu-mincho-pr6n", label: "游明朝体 Pr6N", category: "japanese" },
  { value: "YuKyokasho Yoko", label: "游教科書体 横用", category: "japanese" },
  { value: "YuKyokasho", label: "游教科書体", category: "japanese" },
  { value: "biz-udpgothic", label: "BIZ UDGothic", category: "japanese" },
  { value: "BIZ UDMincho", label: "BIZ UDMincho", category: "japanese" },
  { value: "honoka-maru-gothic", label: "ほのか丸ゴシック", category: "japanese" },
  { value: "zen-maru-gothic", label: "Zen Maru Gothic", category: "japanese" },
  { value: "dela-gothic-one", label: "Dela Gothic One", category: "japanese" },
  { value: "Osaka", label: "Osaka", category: "japanese" },

  // 装飾フォント
  { value: "Comic Sans MS", label: "Comic Sans MS", category: "decorative" },
  { value: "Impact", label: "Impact", category: "decorative" },
  { value: "Papyrus", label: "Papyrus", category: "decorative" },
  { value: "Brush Script MT", label: "Brush Script MT", category: "decorative" },
];

// フォントカテゴリー
export const FONT_CATEGORIES = [
  { value: "sans-serif", label: "ゴシック体" },
  { value: "serif", label: "明朝体" },
  { value: "monospace", label: "等幅" },
  { value: "japanese", label: "日本語" },
  { value: "decorative", label: "装飾" },
];

// デフォルトフォント
export const DEFAULT_FONT = "Arial";
