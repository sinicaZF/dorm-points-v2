import { useState, useMemo, useRef } from 'react';
import { FileText, Download, RotateCcw, Building2 } from 'lucide-react';
import type { FormData } from '@/lib/types';
import { initialFormData } from '@/lib/types';
import { calculatePoints } from '@/lib/calculate';
import { exportToPDF } from '@/lib/pdf';
import { ApplicantForm } from '@/components/ApplicantForm';
import { PointsCalculator } from '@/components/PointsCalculator';
import { SummaryPanel } from '@/components/SummaryPanel';
import { CheckboxField, InfoBox } from '@/components/ui';

export default function App() {
  const [data, setData] = useState<FormData>(initialFormData);
  const [isExporting, setIsExporting] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const breakdown = useMemo(() => calculatePoints(data), [data]);

  const update = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportToPDF(data, breakdown);
    } catch (err) {
      console.error('PDF export failed', err);
      alert('PDF 匯出失敗，請重試');
    } finally {
      setIsExporting(false);
    }
  };

  const handleReset = () => {
    if (confirm('確定要清除所有填寫資料嗎？')) {
      setData(initialFormData);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-teal-600 text-white">
              <Building2 size={22} />
            </div>
            <div>
              <h1 className="text-base font-semibold text-slate-900 leading-tight">
                職務宿舍積點試算表
              </h1>
              <p className="text-xs text-slate-500">中央研究院 · 3-4房型</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              <RotateCcw size={16} />
              <span className="hidden sm:inline">清除重填</span>
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-700 disabled:opacity-50"
            >
              <Download size={16} />
              {isExporting ? '匯出中...' : '匯出 PDF'}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex items-start gap-3">
            <FileText className="text-teal-600 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-sm text-slate-600 leading-relaxed">
              中央研究院 113 年度統一借用多房間（3-4房型）職務宿舍積點表。
              宿舍房型需求人數：二房型宿舍至少2人，三至四房型宿舍至少3人（申請人及眷口之總數）。
              填妥後系統將自動計算積點，並可匯出為 PDF 檔案。
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2" ref={formRef}>
            <ApplicantForm data={data} update={update} />
            <PointsCalculator data={data} update={update} />

            <div className="mt-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">聲明事項</h2>
              <div className="space-y-4">
                <InfoBox>
                  本人、配偶於臺北市南港區、信義區、內湖區、松山區、新北市汐止區等地無自有住宅，
                  且未曾獲政府輔助、補助購置或承購住宅，亦未曾獲公有眷舍處理之一次補助費等。
                  申請人如於申請後核定發布前有調職、離職及退休、留職停薪或借調、受撤職、免職處分時，
                  同意負責主動告知服務機關撤回本申請。
                </InfoBox>
                <div className="text-xs text-slate-500 leading-relaxed">
                  中央研究院進行本院宿舍業務之各項宿舍行政管理、分配、審核、公證、費用繳納、
                  宿舍管委會及各項統計調查與分析。蒐集類別包含辨識個人者、辨識財務者、
                  個人描述、家庭情形、財產、貸款等。個人資料之利用期間為本院或業務之存續期間，
                  利用地區不限。當事人得依個人資料保護法第3條規定，行使個人資料之查閱或請求閱覽。
                </div>
                <CheckboxField
                  label="本人及配偶已詳閱並同意上述內容，所填均屬實情，如有不實願負法律責任"
                  checked={data.agreementChecked}
                  onChange={(v) => update('agreementChecked', v)}
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <SummaryPanel data={data} breakdown={breakdown} />
          </div>
        </div>
      </div>
    </div>
  );
}
