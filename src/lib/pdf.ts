import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { FormData, PointBreakdown } from './types';
import { roundToTwo } from './calculate';

export async function exportToPDF(data: FormData, breakdown: PointBreakdown, roomType: '3-4' | '2' = '3-4') {
  // 建立 A4 直式 PDF 專案 (210mm x 297mm)
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const ensureSpace = (needed: number) => {
    if (y + needed > pageHeight - margin) {
      pdf.addPage();
      y = margin;
    }
  };

  const addSectionHeader = (title: string) => {
    ensureSpace(10);
    pdf.setFillColor(13, 148, 136); // 蒂芬妮綠主題色
    pdf.rect(margin, y - 1, contentWidth, 8, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(11);
    pdf.text(title, margin + 2, y + 4);
    y += 10;
  };

  const addRow = (label: string, value: string) => {
    ensureSpace(7);
    pdf.setFontSize(10);
    pdf.setTextColor(80, 80, 80);
    pdf.text(label, margin + 2, y);
    pdf.setTextColor(0, 0, 0);
    const valueLines = pdf.splitTextToSize(value, contentWidth - 60);
    pdf.text(valueLines, margin + 50, y);
    y += 7 * Math.max(1, valueLines.length);
  };

  const addLine = () => {
    ensureSpace(2);
    pdf.setDrawColor(220, 220, 220);
    pdf.line(margin, y, pageWidth - margin, y);
    y += 3;
  };

  // --- 頂部大橫幅 ---
  pdf.setFillColor(13, 148, 136);
  pdf.rect(0, 0, pageWidth, 28, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(16);
  pdf.text('中央研究院', margin, 12);
  pdf.setFontSize(12);
  pdf.text(`統一借用多房間（${roomType}房型）職務宿舍積點表`, margin, 20);
  pdf.setFontSize(9);
  const currentTaiwanYear = new Date().getFullYear() - 1911;
  pdf.text(`產出日期：民國 ${currentTaiwanYear} 年 ${new Date().getMonth() + 1} 月 ${new Date().getDate()} 日`, pageWidth - margin - 50, 20);
  y = 36;

  // --- 1. 申請人基本資料 ---
  addSectionHeader('申請人基本資料');
  addRow('服務單位', data.applicant.serviceUnit || '-');
  addRow('姓名', data.applicant.name || '-');
  addRow('職稱', data.applicant.jobTitle || '-');
  addRow('聯絡電話', data.applicant.phone || '-');
  addRow('性別', data.applicant.gender || '-');
  addRow('身分證字號', data.applicant.idNumber || '-');
  addRow('生日', data.applicant.birthday || '-');
  addRow('婚姻狀況', data.applicant.maritalStatus === 'married' ? '已婚' : data.applicant.maritalStatus === 'single' ? '未婚' : '-');
  addRow('戶籍地址', data.applicant.censusAddress || '-');
  addRow('通訊地址', data.applicant.mailingAddress || '-');
  addLine();

  // --- 2. 配偶基本資料 ---
  addSectionHeader('配偶基本資料');
  addRow('配偶姓名', data.spouse.name || '-');
  addRow('身分證字號', data.spouse.idNumber || '-');
  addRow('配偶生日', data.spouse.birthday || '-');
  addRow('職業（服務單位）', data.spouse.occupation || '-');
  addRow('夫婦同在本院任職合併計點', data.isBothSpousesInAcademia ? '是' : '否');
  addLine();
  // --- 3. 眷口資料清單 ---
  if (data.familyMembers.some((m) => m.name.trim() !== '')) {
    addSectionHeader('同住眷口明細');
    data.familyMembers.filter((m) => m.name.trim() !== '').forEach((m, i) => {
      addRow(`眷屬 #${i + 1} 稱謂`, m.relationship || '-');
      addRow(`眷屬 #${i + 1} 姓名`, m.name);
      addRow(`眷屬 #${i + 1} 生日`, m.birthday || '-');
      addRow(`眷屬 #${i + 1} 職業（服務單位）`, m.occupation || '-');
      y += 2;
    });
    addLine();
  }

  // --- 4. Ａ. 自填加項 ---
  addSectionHeader('Ａ. 自填加項 - 積點計算');
  addRow('服務年資', `任滿 ${data.serviceYears.years} 年, ${data.serviceYears.months} 個月`);
  addRow('服務年資點數', `${breakdown.serviceYears} 點`);
  addRow('本俸（元）', `${data.baseSalary.toLocaleString()} 元`);
  addRow('職級點數（每千元一點）', `${breakdown.jobLevel} 點`);
  addRow('有效扶養眷口數', `${data.familyMembers.filter((m) => m.name.trim() !== '').length} 口`);
  addRow('眷口點數（每口四點）', `${breakdown.dependents} 點`);
  addRow('Ａ 項總加點小計', `${breakdown.totalA} 點`);
  addLine();

  // --- 5. Ｂ. 自填減項 ---
  addSectionHeader('Ｂ. 自填減項 - 扣點計算');
  addRow('指定區域內是否有自有住宅', data.hasSelfOwnedProperty ? '有（總點數將減半計算）' : '無');
  if (data.hasSelfOwnedProperty) {
    data.selfOwnedProperties.forEach((p, i) => {
      addRow(`自有住宅 #${i + 1} 所有權人`, p.owner || '-');
      addRow(`自有住宅 #${i + 1} 房屋地址`, p.address || '-');
    });
  }
  addRow('自有住宅扣點小計', `${roundToTwo(breakdown.propertyDeduction)} 點`);
  addRow('曾借用多房間職務宿舍次數', `${data.previousBorrowCount} 次`);
  addRow('借用次數扣點小計', `${roundToTwo(breakdown.borrowDeduction)} 點`);
  addRow('Ｂ 項總扣點小計', `${roundToTwo(breakdown.totalB)} 點`);
  addLine();

  // --- 6. Ｃ. 最終總積點結果 ---
  ensureSpace(20);
  pdf.setFillColor(224, 242, 240);
  pdf.rect(margin, y - 2, contentWidth, 16, 'F');
  pdf.setTextColor(13, 148, 136);
  pdf.setFontSize(13);
  pdf.text(`Ｃ. 合計積點 (Ａ - Ｂ = Ｃ)： ${roundToTwo(breakdown.totalC)} 點`, margin + 2, y + 6);
  pdf.setFontSize(9);
  pdf.text(`備註：二房型宿舍申請人及眷口總數至少2人；三至四房型宿舍至少3人。`, margin + 2, y + 11);
  y += 20;

  // --- 7. 聲明事項暨切結書 ---
  ensureSpace(35);
  addSectionHeader('聲明事項暨切結書');
  pdf.setTextColor(60, 60, 60);
  pdf.setFontSize(8);
  const declaration = `本人、配偶於臺北市南港區、信義區、內湖區、松山區、新北市汐止區等地無自有住宅，且未曾獲政府輔助、補助購置或承購住宅，亦未曾獲公有眷舍處理之一次補助費等。申請人如於申請後核定發布前有調職、離職及退休、留職停薪或借調、受撤職、免職處分時，同意負責主動告知服務機關撤回本申請。以上各欄所填均屬實情，如有不實願負一切法律責任。`;
  const declLines = pdf.splitTextToSize(declaration, contentWidth);
  declLines.forEach((line: string) => {
    ensureSpace(4);
    pdf.text(line, margin, y);
    y += 4;
  });

  y += 6;
  addRow('申請人簽名 (蓋章)', '_______________________');
  y += 4;
  addRow('配偶簽名 (蓋章)', '_______________________');
  y += 4;
  addRow('填表日期', '______ 年 ______ 月 ______ 日');

  // --- 8. 機關審查欄 ---
  addSectionHeader('機關審查欄 (申請人請勿填寫)');
  addRow('總務承辦人簽章', '');
  addRow('人事承辦人簽章', '');
  addRow('院區單位主管核章', '');

  pdf.save(`中央研究院-職務宿舍申請積點試算表-${roomType}房型.pdf`);
}

export async function exportFormToImage(element: HTMLElement, filename: string) {
  const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
