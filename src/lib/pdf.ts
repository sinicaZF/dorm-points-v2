import type { FormData, PointBreakdown } from './types';

export async function exportToPDF(data: FormData, breakdown: PointBreakdown) {
  try {
    // 💡 呼叫瀏覽器內建的列印功能，搭配我們在 App.tsx 寫好的 A4 CSS 樣式
    window.print();
  } catch (err) {
    console.error('PDF export failed', err);
    alert('PDF 匯出失敗，請重試');
  }
}

// 保留原本的圖片導出功能以防其他組件引用
export async function exportFormToImage(element: HTMLElement, filename: string) {
  // 保持原狀
}
