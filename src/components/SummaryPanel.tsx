import type { FormData, PointBreakdown } from '@/lib/types';
import { roundToTwo } from '@/lib/calculate';

interface Props {
  data: FormData;
  breakdown: PointBreakdown;
}

function Row({ label, value, emphasis }: { label: string; value: string; emphasis?: boolean }) {
  return (
    <div className={`flex items-center justify-between py-2.5 ${emphasis ? 'border-t border-slate-200 pt-3 mt-1' : ''}`}>
      <span className={`text-sm ${emphasis ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>
        {label}
      </span>
      <span className={`tabular-nums ${emphasis ? 'text-lg font-bold text-teal-700' : 'text-sm font-medium text-slate-900'}`}>
        {value}
      </span>
    </div>
  );
}

export function SummaryPanel({ data, breakdown }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden sticky top-6">
      <div className="px-6 py-5 bg-gradient-to-br from-teal-600 to-teal-700">
        <h2 className="text-lg font-semibold text-white">積點試算結果</h2>
        <p className="text-sm text-teal-100 mt-0.5">即時更新計算結果</p>
      </div>

      <div className="p-6">
        <div className="mb-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Ａ 加項合計
          </h3>
          <div className="rounded-xl bg-slate-50 p-4 space-y-0">
            <Row label="服務年資點數" value={`${breakdown.serviceYears} 點`} />
            <Row label="職級點數" value={`${breakdown.jobLevel} 點`} />
            <Row label="眷口點數" value={`${breakdown.dependents} 點`} />
            <Row label="Ａ 小計" value={`${breakdown.totalA} 點`} emphasis />
          </div>
        </div>

        <div className="mb-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Ｂ 減項合計
          </h3>
          <div className="rounded-xl bg-slate-50 p-4 space-y-0">
            <Row label="自有住宅扣點" value={`${roundToTwo(breakdown.propertyDeduction)} 點`} />
            <Row label="借用次數扣點" value={`${roundToTwo(breakdown.borrowDeduction)} 點`} />
            <Row label="Ｂ 小計" value={`${roundToTwo(breakdown.totalB)} 點`} emphasis />
          </div>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-teal-50 to-teal-100 border-2 border-teal-300 p-5">
          <div className="text-center">
            <p className="text-sm font-medium text-teal-700 mb-1">Ｃ. 合計積點（Ａ－Ｂ＝Ｃ）</p>
            <p className="text-4xl font-bold text-teal-800 tabular-nums">
              {roundToTwo(breakdown.totalC)}
            </p>
            <p className="text-xs text-teal-600 mt-1">點</p>
          </div>
        </div>

        <div className="mt-5 p-4 rounded-xl bg-amber-50 border border-amber-200">
          <p className="text-xs text-amber-800 leading-relaxed">
            注意：二房型宿舍需求人數至少2人，三至四房型宿舍至少3人（申請人及眷口之總數）。
          </p>
        </div>
      </div>
    </div>
  );
}
