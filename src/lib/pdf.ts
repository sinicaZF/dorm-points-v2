import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { FormData, PointBreakdown } from './types';
import { roundToTwo } from './calculate';

/**
 * 🎯 終極完全體：將資料動態生成 HTML 官方表格，再利用 html2canvas 拍照轉成 PDF
 * 這樣可以 100% 確保字體完全是漂亮的繁體中文，且同住眷口明細會逐項完全列出
 */
export async function exportToPDF(data: FormData, breakdown: PointBreakdown, roomType: '3-4' | '2' = '3-4') {
  // 1. 在記憶體中建立一個隱藏的 HTML 容器，完全仿照中研院官方 DOC 格式進行排版
  const printContainer = document.createElement('div');
  printContainer.style.width = '210mm';
  printContainer.style.padding = '20mm';
  printContainer.style.background = '#ffffff';
  printContainer.style.fontFamily = '"Noto Sans TC", "Microsoft JhengHei", sans-serif';
  printContainer.style.color = '#000000';
  printContainer.style.position = 'absolute';
  printContainer.style.left = '-9999px';
  printContainer.style.top = '0';

  // 取得當前民國年份
  const currentTaiwanYear = new Date().getFullYear() - 1911;

  // 🎯 動態產生眷口表格的 HTML 橫列（逐項過濾並列出所有填寫的眷屬）
  const validFamilyMembers = data.familyMembers.filter((m) => m.name.trim() !== '');
  let familyRowsHTML = '';
  
  if (validFamilyMembers.length === 0) {
    familyRowsHTML = `
      <tr>
        <td style="border: 1px solid #000; padding: 6px; text-align: center; color: #666;" colspan="4">無填寫同住眷口資料</td>
      </tr>
    `;
  } else {
    validFamilyMembers.forEach((member, i) => {
      familyRowsHTML += `
        <tr>
          <td style="border: 1px solid #000; padding: 6px; text-align: center;">${member.relationship || '-'}</td>
          <td style="border: 1px solid #000; padding: 6px; text-align: center;">${member.name}</td>
          <td style="border: 1px solid #000; padding: 6px; text-align: center;">${member.birthday || '-'}</td>
          <td style="border: 1px solid #000; padding: 6px;">${member.occupation || '-'}</td>
        </tr>
      `;
    });
  }

  // 2. 建立官方主表格結構
  printContainer.innerHTML = `
    <div style="text-align: center; margin-bottom: 8px;">
      <h2 style="font-size: 20px; font-weight: bold; margin: 0; padding-bottom: 4px;">中央研究院 ${currentTaiwanYear} 年度統一借用多房間（${roomType}房型）職務宿舍積點表</h2>
      <p style="font-size: 11px; margin: 4px 0; color: #333;">
        （宿舍房型需求人數［申請人及眷口之總數］，二房型宿舍：至少2人，三至四房型宿舍：至少3人）
      </p>
    </div>

    <!-- 申請人與配偶基本資料表格 -->
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 13px;">
      <tr>
        <td style="border: 1px solid #000; padding: 6px; font-weight: bold; width: 12%; background: #f9f9f9;">申請人</td>
        <td style="border: 1px solid #000; padding: 6px; width: 13%; font-weight: bold;">服務單位</td>
        <td style="border: 1px solid #000; padding: 6px; width: 30%;">${data.applicant.serviceUnit || ''}</td>
        <td style="border: 1px solid #000; padding: 6px; width: 10%; font-weight: bold;">姓名</td>
        <td style="border: 1px solid #000; padding: 6px; width: 15%;">${data.applicant.name || ''}</td>
        <td style="border: 1px solid #000; padding: 6px; width: 10%; font-weight: bold;">職稱</td>
        <td style="border: 1px solid #000; padding: 6px; width: 10%;">${data.applicant.jobTitle || ''}</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 6px;" rowspan="2"></td>
        <td style="border: 1px solid #000; padding: 6px; font-weight: bold;">聯絡電話</td>
        <td style="border: 1px solid #000; padding: 6px;">${data.applicant.phone || ''}</td>
        <td style="border: 1px solid #000; padding: 6px; font-weight: bold;">性別</td>
        <td style="border: 1px solid #000; padding: 6px;">${data.applicant.gender || ''}</td>
        <td style="border: 1px solid #000; padding: 6px; font-weight: bold;">身分證字號</td>
        <td style="border: 1px solid #000; padding: 6px;">${data.applicant.idNumber || ''}</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 6px; font-weight: bold;">生日</td>
        <td style="border: 1px solid #000; padding: 6px;">${data.applicant.birthday || ''}</td>
        <td style="border: 1px solid #000; padding: 6px; font-weight: bold;">婚姻狀況</td>
        <td style="border: 1px solid #000; padding: 6px;" colspan="3">
          ${data.applicant.maritalStatus === 'married' ? '■ 已婚' : '□ 已婚'} &nbsp;&nbsp; 
          ${data.applicant.maritalStatus === 'single' ? '■ 未婚' : '□ 未婚'}
        </td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 6px; font-weight: bold;" colspan="2">戶籍地址</td>
        <td style="border: 1px solid #000; padding: 6px;" colspan="5">${data.applicant.censusAddress || ''}</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 6px; font-weight: bold;" colspan="2">通訊地址</td>
        <td style="border: 1px solid #000; padding: 6px;" colspan="5">${data.applicant.mailingAddress || ''}</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 6px; font-weight: bold; background: #f9f9f9;">配偶</td>
        <td style="border: 1px solid #000; padding: 6px; font-weight: bold;">姓名</td>
        <td style="border: 1px solid #000; padding: 6px;">${data.spouse.name || ''}</td>
        <td style="border: 1px solid #000; padding: 6px; font-weight: bold;">身分證字號</td>
        <td style="border: 1px solid #000; padding: 6px;" colspan="3">${data.spouse.idNumber || ''}</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 6px;"></td>
        <td style="border: 1px solid #000; padding: 6px; font-weight: bold;">職業 (服務單位)</td>
        <td style="border: 1px solid #000; padding: 6px;">${data.spouse.occupation || ''}</td>
        <td style="border: 1px solid #000; padding: 6px; font-weight: bold;">生日</td>
        <td style="border: 1px solid #000; padding: 6px;" colspan="3">${data.spouse.birthday || ''}</td>
      </tr>
    </table>

    <!-- Ａ 自填加項 -->
    <h3 style="font-size: 14px; font-weight: bold; margin: 10px 0 5px 0;">Ａ 自填加項 <span style="font-size: 11px; font-weight: normal;">(夫婦同在本院任職，年資與職級得合併計點)</span></h3>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 12px; text-align: left;">
      <tr style="background: #f5f5f5; font-weight: bold;">
        <th style="border: 1px solid #000; padding: 5px; width: 15%;">項目</th>
        <th style="border: 1px solid #000; padding: 5px; width: 45%;">說明</th>
        <th style="border: 1px solid #000; padding: 5px; width: 30%;">計分標準</th>
        <th style="border: 1px solid #000; padding: 5px; width: 10%; text-align: center;">點數</th>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 5px; font-weight: bold;">服務年資</td>
        <td style="border: 1px solid #000; padding: 5px; font-size: 10px; color: #444; line-height: 1.3;">
          服務年資一年2點，滿半年為1點，餘數不滿半年者不計。以本院編制內年資計算，年資中斷者，其前後在「本院任職之年資」得合併計算。年資計算至今年12月31日止。
        </td>
        <td style="border: 1px solid #000; padding: 5px;">共計任滿 ${data.serviceYears.years || 0} 年 ${data.serviceYears.months || 0} 月。</td>
        <td style="border: 1px solid #000; padding: 5px; text-align: center; font-weight: bold; font-size: 14px;">${breakdown.serviceYears}</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 5px; font-weight: bold;">職級</td>
        <td style="border: 1px solid #000; padding: 5px; font-size: 10px; color: #444;">按本俸計算每千元為一點（換算積點時小數點不計）。</td>
        <td style="border: 1px solid #000; padding: 5px;">本俸 ${(data.baseSalary || 0).toLocaleString()} 元</td>
        <td style="border: 1px solid #000; padding: 5px; text-align: center; font-weight: bold; font-size: 14px;">${breakdown.jobLevel}</td>
      </tr>
    </table>
    <!-- 🎯 成果加強：獨立的「同住眷口明細」官方規格明細表格，完美支援逐項呈現 -->
    <h4 style="font-size: 12px; font-weight: bold; margin: 6px 0 4px 0; color: #222;">同住眷口明細：</h4>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 12px; text-align: left;">
      <tr style="background: #fdfdfd; font-weight: bold;">
        <th style="border: 1px solid #000; padding: 5px; width: 15%; text-align: center;">稱謂</th>
        <th style="border: 1px solid #000; padding: 5px; width: 20%; text-align: center;">姓名</th>
        <th style="border: 1px solid #000; padding: 5px; width: 20%; text-align: center;">生日</th>
        <th style="border: 1px solid #000; padding: 5px; width: 45%;">職業（服務單位）</th>
      </tr>
      ${familyRowsHTML}
      <tr style="background: #fafafa;">
        <td style="border: 1px solid #000; padding: 6px; font-weight: bold;" colspan="2">有效核計眷口總數：${validFamilyMembers.length} 口</td>
        <td style="border: 1px solid #000; padding: 6px; font-weight: bold; text-align: right;" colspan="2">眷口應得總計點數：<span style="font-size: 14px; color: #0d9488;">${breakdown.dependents}</span> 點</td>
      </tr>
    </table>

    <!-- Ｂ 自填減項 -->
    <h3 style="font-size: 14px; font-weight: bold; margin: 10px 0 5px 0;">Ｂ 自填減項</h3>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 12px; text-align: left;">
      <tr style="background: #f5f5f5; font-weight: bold;">
        <th style="border: 1px solid #000; padding: 5px; width: 15%;">項目</th>
        <th style="border: 1px solid #000; padding: 5px; width: 45%;">說明</th>
        <th style="border: 1px solid #000; padding: 5px; width: 30%;">計分標準</th>
        <th style="border: 1px solid #000; padding: 5px; width: 10%; text-align: center;">扣點</th>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 5px; font-weight: bold;">自有住宅 (B1)</td>
        <td style="border: 1px solid #000; padding: 5px; font-size: 10px; color: #444;">
          申請人或配偶名下有自有住宅，其位於台北市文山、大安、中正、中山、萬華、大同區、新北市深坑、汐止區等地者，其點數減半計算【-1/2A】。
        </td>
        <td style="border: 1px solid #000; padding: 5px;">${data.hasSelfOwnedProperty ? `有自有住宅 (減半計算)` : '無'}</td>
        <td style="border: 1px solid #000; padding: 5px; text-align: center; font-weight: bold; font-size: 14px; color: red;">${breakdown.propertyDeduction > 0 ? `減半` : '0'}</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 5px; font-weight: bold;">借用次數 (B2)</td>
        <td style="border: 1px solid #000; padding: 5px; font-size: 10px; color: #444;">曾借用一般多房間職務宿舍1次者，其點數扣除1/2計算，借用2次以上者，其點數扣除2/3計算(均自民國92年起算)。</td>
        <td style="border: 1px solid #000; padding: 5px;">曾借用職務宿舍次數：${data.previousBorrowCount || 0} 次</td>
        <td style="border: 1px solid #000; padding: 5px; text-align: center; font-weight: bold; font-size: 14px; color: red;">${roundToTwo(breakdown.borrowDeduction)}</td>
      </tr>
    </table>

    <!-- Ｃ 合計積點 -->
    <div style="border: 2px solid #000; padding: 8px; font-size: 15px; font-weight: bold; text-align: center; margin-bottom: 15px; background: #e6f7f4; border-radius: 4px;">
      Ｃ．合計積點（Ａ － Ｂ ＝ Ｃ） &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <span style="font-size: 22px; color: #0d9488;">${roundToTwo(breakdown.totalC)}</span> 點
    </div>

    <!-- 法律聲明宣告條款 -->
    <div style="font-size: 9px; color: #222; line-height: 1.4; text-align: justify; border: 1px solid #ddd; padding: 8px; margin-bottom: 15px; background: #fff;">
      本人、配偶於臺北市南港區、信義區、內湖區、松山區、新北市汐止區（橫科里、福山里、宜興里、東勢里、樟樹里、環河里）無自有住宅，且未曾獲政府輔助、補助購置或承購住宅，包括政府負擔補貼利息之輔助、補助購置住宅貸款及曾承購政府興建優惠計價之住宅、未曾獲公有眷舍處理之一次補助費等，且配偶或其隨居住所之扶養親屬亦未在其他機關（構）借用首長宿舍或職務宿舍。申請人如於申請後，核定發布前，有調職、離職及退休、留職停薪或借調、受撤職、免職處分時，同意負責主動告知服務機關撤回本申請。借用人調職、離職及退休、留職停薪或借調時，應在3個月內遷出，借用期限已滿或受撤職、免職處分時應在1個月內遷出，申請人已確實詳閱所填及表列文字，以上各欄所填均屬實情，如有隱瞞或填載不實或擅自更改內容，申請人願負一切法律責任。<br/><br/>
      中央研究院（以下簡稱本院）進行本院宿舍業務之各項宿舍行政管理、分配、審核、公證、費用繳納，宿舍管委會及各項統計調查與分析。其法定之特定目的為：007不動產服務。蒐集類別：C001辨識個人者，C002辨識財務者，C003政府資料中之辨識者，C011個人描述，C021家庭情形，C023家庭其他成員之細節，C032財產，C084貸款。個人資料之利用期間為本院或業務之存續期間，利用地區不限。利用方式及對象：利用您的資料進行審核、登記管理系統、向主管機關查詢申請人及配偶政府輔助、補助購置或承購住宅及查詢自有不動產情形。當事人得依個人資料保護法第3條規定，行使個人資料之查閱或請求閱覽。如您未提供或拒絕提供正確之個人資料，將會影響到您申請本院宿舍相關的權益，本人及配偶已熟讀並詳知上述內容，並以簽名表示同意之。
    </div>

    <!-- 簽章欄位 -->
    <table style="width: 100%; font-size: 13px; margin-top: 10px; margin-bottom: 20px;">
      <tr>
        <td style="width: 50%;">申請人簽名（蓋章）：__________________</td>
        <td style="width: 50%;">配偶簽名（蓋章）：__________________</td>
      </tr>
      <tr>
        <td colspan="2" style="text-align: right; padding-top: 10px;">中華民國 ______ 年 ______ 月 ______ 日</td>
      </tr>
    </table>

    <div style="font-size: 12px; font-weight: bold; border-top: 1px dashed #000; padding-top: 10px; margin-top: 15px;">
      申請單位以上各項經審核相符，且申請人或其配偶確未曾獲政府輔助、補助購置或承購住宅（含已核准尚未辦貸部份），經核屬實。
    </div>

    <!-- 機關審查欄位 -->
    <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; text-align: center;">
      <tr>
        <td style="border: 1px solid #000; padding: 15px; width: 33.3%;">總務承辦人</td>
        <td style="border: 1px solid #000; padding: 15px; width: 33.3%;">人事承辦人</td>
        <td style="border: 1px solid #000; padding: 15px; width: 33.3%;">單位主管</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 25px;"></td>
        <td style="border: 1px solid #000; padding: 25px;"></td>
        <td style="border: 1px solid #000; padding: 25px;"></td>
      </tr>
    </table>
  `;

  // 3. 隱密掛載、拍照並完美轉換成高解析度的 A4 直式 PDF 檔案
  document.body.appendChild(printContainer);

  try {
    const canvas = await html2canvas(printContainer, {
      scale: 2, // 雙倍解析度，確保文字放大不模糊
      useCORS: true,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    // 將拍照成果完美貼滿標準 A4 框線中
    pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
    pdf.save(`中央研究院-職務宿舍統一借用積點試算表-${roomType}房型.pdf`);
  } catch (error) {
    console.error('PDF導出發生錯誤:', error);
    alert('PDF 產生失敗，請再試一次！');
  } finally {
    // 4. 清理痕跡，將隱藏的容器完全從 DOM 中拔除
    document.body.removeChild(printContainer);
  }
}

export async function exportFormToImage(element: HTMLElement, filename: string) {
  const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

