import { useState, useMemo, useRef } from 'react';
import { FileText, Download, RotateCcw, Building2 } from 'lucide-react';
import type { FormData } from '@/lib/types';
import { initialFormData } from '@/lib/types';
import { calculatePoints } from '@/lib/calculate';
import { ApplicantForm } from '@/components/ApplicantForm';
import { PointsCalculator } from '@/components/PointsCalculator';
import { SummaryPanel } from '@/components/SummaryPanel';
import { CheckboxField, InfoBox } from '@/components/ui';

export default function App() {
  const [data, setData] = useState<FormData>(initialFormData);
  const formRef = useRef<HTMLDivElement>(null);
  const [roomType, setRoomType] = useState<'3-4' | '2'>('3-4');
  const currentTaiwanYear = useMemo(() => new Date().getFullYear() - 1911, []);
  const breakdown = useMemo(() => calculatePoints(data), [data]);

  const update = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  // 🎯 核心改動：點擊直接觸發系統列印，完美匯出 A4 格式
  const handleExport = () => {
    window.print();
  };

  const handleReset = () => {
    if (confirm('確定要清除所有填寫資料嗎？')) {
      setData(initialFormData);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* 網頁原本的 UI (加上 print:hidden，列印時會自動隱藏，不破壞排版) */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-teal-600 text-white">
              <Building2 size={22} />
            </div>
            <div>
              <h1 className="text-base font-semibold text-slate-900 leading-tight">職務宿舍積點試算表</h1>
              <div className="flex items-center gap-1 mt-0.5 text-xs text-slate-500">
                <span>中央研究院 · </span>
                <select
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value as '3-4' | '2')}
                  className="bg-transparent font-medium text-teal-700 focus:outline-none cursor-pointer border-b border-dashed border-teal-500 pb-px"
                >
                  <option value="3-4">3-4 房型</option>
                  <option value="2">2 房型</option>
                </select>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleReset} className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
              <RotateCcw size={16} />
              <span className="hidden sm:inline">清除重填</span>
            </button>
            <button onClick={handleExport} className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-700">
              <Download size={16} />
              <span>匯出 A4 PDF</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print:hidden">
        <div className="mb-6">
          <div className="flex items-start gap-3">
            <FileText className="text-teal-600 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-sm text-slate-600 leading-relaxed">
              中央研究院 {currentTaiwanYear} 年度統一借用多房間（{roomType}房型）職務宿舍積點表。填妥後系統將自動計算積點，並可匯出為 PDF 檔案。
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2" ref={formRef}>
            <div className="mb-8"><ApplicantForm data={data} update={update} /></div>
            <PointsCalculator data={data} update={update} />
          </div>
          <div className="lg:col-span-1"><SummaryPanel data={data} breakdown={breakdown} /></div>
        </div>
      </div>

      {/* 🎯 這裡由 AI 去幫你生成跟中研院一模一樣的 HTML A4 隱藏表格，平常看不到，只有按列印時會出現 */}
      {/* 只要你在 Bolt.new 的對話框貼上下方那段指令，AI 就會自動把這裡補滿成精緻的 Word 表格格線 */}
    </div>
  );
}
