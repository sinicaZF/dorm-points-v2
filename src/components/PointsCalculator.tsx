import { Plus, Trash2, Calculator, Home } from 'lucide-react';
import type { FormData, SelfOwnedProperty, FamilyMember } from '@/lib/types';
import { Section, NumberField, CheckboxField, TextField, SelectField, InfoBox } from './ui';

interface Props {
  data: FormData;
  update: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
}

const relationships = [
  { value: '', label: '請選擇' },
  { value: '配偶', label: '配偶' },
  { value: '父', label: '父' },
  { value: '母', label: '母' },
  { value: '子女', label: '子女' },
];

export function PointsCalculator({ data, update }: Props) {
  const addProperty = () => {
    update('selfOwnedProperties', [
      ...data.selfOwnedProperties,
      { owner: '', address: '' },
    ]);
  };

  const updateProperty = (index: number, field: keyof SelfOwnedProperty, value: string) => {
    const updated = data.selfOwnedProperties.map((p, i) =>
      i === index ? { ...p, [field]: value } : p
    );
    update('selfOwnedProperties', updated);
  };

  const removeProperty = (index: number) => {
    update('selfOwnedProperties', data.selfOwnedProperties.filter((_, i) => i !== index));
  };

  // 🎯 完整保留的眷口處理邏輯
  const addFamilyMember = () => {
    update('familyMembers', [
      ...data.familyMembers,
      { relationship: '', name: '', birthday: '', occupation: '' },
    ]);
  };

  const updateFamilyMember = (index: number, field: keyof FamilyMember, value: string) => {
    const updated = data.familyMembers.map((m, i) =>
      i === index ? { ...m, [field]: value } : m
    );
    update('familyMembers', updated);
  };

  const removeFamilyMember = (index: number) => {
    update('familyMembers', data.familyMembers.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <Section
        title="Ａ. 自填加項"
        subtitle="服務年資、職級與眷口之積點計算"
        icon={<Calculator size={20} />}
      >
        <div className="space-y-5">
          {/* 服務年資 */}
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">服務年資</h3>
            <p className="text-xs text-slate-500 mb-4">
              服務年資一年2點，滿半年為1點，餘數不滿半年者不計。年資計算至今年12月31日止。
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <NumberField
                label="服務年數"
                value={data.serviceYears.years || ''}
                onChange={(v) => update('serviceYears', { ...data.serviceYears, years: v })}
                min={0}
                hint="單位：年"
              />
              <NumberField
                label="服務月數"
                value={data.serviceYears.months || ''}
                onChange={(v) => update('serviceYears', { ...data.serviceYears, months: v })}
                min={0}
                max={11}
                hint="單位：月"
              />
              <div className="flex items-end">
                <div className="w-full rounded-lg bg-teal-50 border border-teal-200 px-4 py-2.5 text-center">
                  <span className="text-xs text-teal-600 block mb-0.5">年資點數</span>
                  <span className="text-lg font-bold text-teal-700">
                    {Math.floor(
                      data.serviceYears.years * 2 + Math.floor(data.serviceYears.months / 6)
                    )} 點
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 職級 */}
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">職級</h3>
            <p className="text-xs text-slate-500 mb-4">
              按本俸計算每千元為一點（換算積點時小數點不計）
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <NumberField
                label="本俸（元）"
                value={data.baseSalary || ''}
                onChange={(v) => update('baseSalary', v)}
                min={0}
                hint="每千元為一點"
              />
              <div className="flex items-end">
                <div className="w-full rounded-lg bg-teal-50 border border-teal-200 px-4 py-2.5 text-center">
                  <span className="text-xs text-teal-600 block mb-0.5">職級點數</span>
                  <span className="text-lg font-bold text-teal-700">
                    {Math.floor(data.baseSalary / 1000)} 點
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 🎯 眷口：已成功將動態增刪欄位移至職級下方 */}
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">眷口</h3>
            <InfoBox>
              積點計算標準：與申請人同住之配偶、未成年子女（明年1月1日未滿18歲）、身心障礙賴其扶養之已成年子女或申請人（或配偶，以一方為限）之父母為眷口，每口四點。
            </InfoBox>

            {/* 眷口動態輸入表單 */}
            <div className="mt-4 space-y-3">
              {data.familyMembers.map((member, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end p-4 rounded-xl bg-white border border-slate-200 shadow-sm"
                >
                  <SelectField
                    label="稱謂"
                    value={member.relationship}
                    onChange={(v) => updateFamilyMember(index, 'relationship', v)}
                    options={relationships}
                  />
                  <TextField
                    label="姓名"
                    value={member.name}
                    onChange={(e) => updateFamilyMember(index, 'name', e.target.value)}
                  />
                  <TextField
                    label="生日"
                    type="date"
                    value={member.birthday}
                    onChange={(e) => updateFamilyMember(index, 'birthday', e.target.value)}
                  />
                  <TextField
                    label="職業（服務單位）"
                    value={member.occupation}
                    onChange={(e) => updateFamilyMember(index, 'occupation', e.target.value)}
                  />
                  <button
                    onClick={() => removeFamilyMember(index)}
                    className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                    刪除
                  </button>
                </div>
              ))}

              <button
                onClick={addFamilyMember}
                className="flex items-center gap-2 rounded-lg border-2 border-dashed border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-600 transition hover:border-teal-400 hover:bg-teal-50 hover:text-teal-600 w-full justify-center"
              >
                <Plus size={18} />
                新增眷口資料
              </button>
            </div>

            {/* 眷口結算分數顯示 */}
            <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <p className="text-xs text-slate-500">
                目前有效眷口數：
                <span className="font-semibold text-slate-700 text-sm ml-1">
                  {data.familyMembers.filter((m) => m.name.trim() !== '').length} 口
                </span>
              </p>
              <div className="w-full rounded-lg bg-teal-50 border border-teal-200 px-4 py-2.5 text-center">
                <span className="text-xs text-teal-600 block mb-0.5">眷口點數</span>
                <span className="text-lg font-bold text-teal-700">
                  {data.familyMembers.filter((m) => m.name.trim() !== '').length * 4} 點
                </span>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Ｂ. 自填減項 */}
      <Section
        title="Ｂ. 自填減項"
        subtitle="自有住宅與借用次數之扣點計算"
        icon={<Home size={20} />}
      >
        <div className="space-y-5">
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-5">
            <div className="mb-4">
              <CheckboxField
                label="申請人或配偶名下有自有住宅（位於指定區域）"
                checked={data.hasSelfOwnedProperty}
                onChange={(v) => update('hasSelfOwnedProperty', v)}
                hint="位於台北市文山區、大安區、中正區、中山區、萬華區、大大同區、新北市深坑區、汐止區等地者，其點數減半計算"
              />
            </div>

            {data.hasSelfOwnedProperty && (
              <div className="space-y-3 mt-4">
                <InfoBox variant="warning">
                  勾選後，Ａ 項總點數將減半計算。
                </InfoBox>
                {data.selfOwnedProperties.map((prop, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end p-4 rounded-xl bg-white border border-slate-200"
                  >
                    <TextField
                      label="所有權人"
                      value={prop.owner}
                      onChange={(e) => updateProperty(index, 'owner', e.target.value)}
                    />
                    <TextField
                      label="自用住宅地址"
                      value={prop.address}
                      onChange={(e) => updateProperty(index, 'address', e.target.value)}
                    />
                    <button
                      onClick={() => removeProperty(index)}
                      className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                      刪除
                    </button>
                  </div>
                ))}
                <button
                  onClick={addProperty}
