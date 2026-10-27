import { User } from 'lucide-react';
import type { FormData } from '@/lib/types';
import { Section, TextField, SelectField, CheckboxField } from './ui';

interface Props {
  data: FormData;
  update: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
}

export function ApplicantForm({ data, update }: Props) {
  const updateApplicant = (field: keyof FormData['applicant'], value: string) => {
    update('applicant', { ...data.applicant, [field]: value });
  };

  const updateSpouse = (field: keyof FormData['spouse'], value: string) => {
    update('spouse', { ...data.spouse, [field]: value });
  };

  return (
    /* 🎯 這裡維持大區塊與 A 區塊之間原本的適當大間距 */
    <div className="space-y-6">
      
      {/* 🎯 用一個單獨的 div 把「申請人」與「配偶」包在一起，並強制它們的間距縮小（例如 space-y-3） */}
      <div className="space-y-3">
        
        {/* 申請人基本資料 */}
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

        {/* 配偶基本資料：永久固定顯示，並透過外層 div 向上貼近申請人 */}
        <Section
          title="配偶基本資料"
          subtitle="填寫配偶資訊（若無配偶則免填）"
          icon={<User size={20} />}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField
              label="配偶姓名"
              value={data.spouse.name}
              onChange={(e) => updateSpouse('name', e.target.value)}
              placeholder="請輸入配偶姓名"
            />
            <TextField
              label="配偶身分證字號"
              value={data.spouse.idNumber}
              onChange={(e) => updateSpouse('idNumber', e.target.value)}
              placeholder="請輸入配偶身分證字號"
            />
            <TextField
              label="配偶生日"
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

      </div> {/* 🎯 群組 div 結束，此處會自動與下方的 A 區塊彈開標準的大間距 */}

    </div>
  );
}
