import { Plus, Trash2, User } from 'lucide-react';
import type { FormData, FamilyMember } from '@/lib/types';
import { Section, TextField, SelectField, CheckboxField, InfoBox } from './ui';

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

export function ApplicantForm({ data, update }: Props) {
  const updateApplicant = (field: keyof FormData['applicant'], value: string) => {
    update('applicant', { ...data.applicant, [field]: value });
  };

  const updateSpouse = (field: keyof FormData['spouse'], value: string) => {
    update('spouse', { ...data.spouse, [field]: value });
  };

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
        title="申請人基本資料"
        subtitle="請填寫申請人之個人資訊"
        icon={<User size={20} />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField
            label="服務單位"
            value={data.applicant.serviceUnit}
            onChange={(e) => updateApplicant('serviceUnit', e.target.value)}
          />
          <TextField
            label="姓名"
            value={data.applicant.name}
            onChange={(e) => updateApplicant('name', e.target.value)}
          />
          <TextField
            label="職稱"
            value={data.applicant.jobTitle}
            onChange={(e) => updateApplicant('jobTitle', e.target.value)}
          />
          <TextField
            label="聯絡電話"
            value={data.applicant.phone}
            onChange={(e) => updateApplicant('phone', e.target.value)}
          />
          <SelectField
            label="性別"
            value={data.applicant.gender}
            onChange={(v) => updateApplicant('gender', v)}
            options={[
              { value: '', label: '請選擇' },
              { value: '男', label: '男' },
              { value: '女', label: '女' },
            ]}
          />
          <TextField
            label="身分證字號"
            value={data.applicant.idNumber}
            onChange={(e) => updateApplicant('idNumber', e.target.value)}
          />
          <TextField
            label="生日"
            type="date"
            value={data.applicant.birthday}
            onChange={(e) => updateApplicant('birthday', e.target.value)}
          />
          <SelectField
            label="婚姻狀況"
            value={data.applicant.maritalStatus}
            onChange={(v) => updateApplicant('maritalStatus', v)}
            options={[
              { value: '', label: '請選擇' },
              { value: 'married', label: '已婚' },
              { value: 'single', label: '未婚' },
            ]}
          />
          <TextField
            label="戶籍地址"
            value={data.applicant.censusAddress}
            onChange={(e) => updateApplicant('censusAddress', e.target.value)}
            className="sm:col-span-2"
          />
          <TextField
            label="通訊地址"
            value={data.applicant.mailingAddress}
            onChange={(e) => updateApplicant('mailingAddress', e.target.value)}
            className="sm:col-span-2"
          />
        </div>
      </Section>

      {/* 🎯 配偶基本資料區塊：當婚姻狀況為「已婚」時自動展開 */}
      {data.applicant.maritalStatus === 'married' && (
        <Section
          title="配偶基本資料"
          subtitle="填寫配偶資訊以供年資與職級合併計點審查"
          icon={<User size={20} />}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField
              label="姓名"
              value={data.spouse.name}
              onChange={(e) => updateSpouse('name', e.target.value)}
              placeholder="請輸入配偶姓名"
            />
            <TextField
              label="身分證字號"
              value={data.spouse.idNumber}
              onChange={(e) => updateSpouse('idNumber', e.target.value)}
              placeholder="請輸入配偶身分證字號"
            />
            <TextField
              label="生日"
              type="date"
              value={data.spouse.birthday}
              onChange={(e) => updateSpouse('birthday', e.target.value)}
            />
            <TextField
              label="職業（服務單位）"
              value={data.spouse.occupation}
              onChange={(e) => updateSpouse('occupation', e.target.value)}
              placeholder="如：中央研究院○○所"
            />
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <CheckboxField
              label="夫婦同在本院任職，年資與職級得合併計點"
              checked={data.isBothSpousesInAcademia}
              onChange={(v) => update('isBothSpousesInAcademia', v)}
              hint="若勾選，配偶之年資與職級可與申請人合併計算"
            />
          </div>
        </Section>
      )}

      <Section
        title="眷口資料"
        subtitle="與申請人同住之配偶、未成年子女、父母等眷屬，每口四點"
        icon={<User size={20} />}
      >
        <InfoBox>
          積點計算標準：與申請人同住之配偶、未成年子女（明年1月1日未滿18歲）、身心障礙賴其扶養之已成年子女或申請人（或配偶，以一方為限）之父母為眷口，每口四點。
        </InfoBox>
        <div className="mt-4 space-y-3">
          {data.familyMembers.map((member, index) => (
            <div
              key={index}
              className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end p-4 rounded-xl bg-slate-50 border border-slate-200"
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
            className="flex items-center gap-2 rounded-lg border-2 border-dashed border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-600 transition hover:border-teal-400 hover:bg-teal-50 hover:text-teal-600"
          >
            <Plus size={18} />
            新增眷口
          </button>
        </div>
      </Section>
    </div>
  );
}
