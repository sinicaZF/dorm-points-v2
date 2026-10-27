import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { FormData, PointBreakdown } from './types';
import { roundToTwo } from './calculate';

export async function exportToPDF(data: FormData, breakdown: PointBreakdown) {
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

  const addText = (text: string, fontSize: number, style: 'normal' | 'bold' = 'normal', color: [number, number, number] = [0, 0, 0]) => {
    pdf.setFont('helvetica', style);
    pdf.setFontSize(fontSize);
    pdf.setTextColor(...color);
    const lines = pdf.splitTextToSize(text, contentWidth);
    lines.forEach((line: string) => {
      ensureSpace(fontSize * 0.5 + 1);
      pdf.text(line, margin, y);
      y += fontSize * 0.5 + 1;
    });
  };

  const addSectionHeader = (title: string) => {
    ensureSpace(10);
    pdf.setFillColor(13, 148, 136);
    pdf.rect(margin, y - 1, contentWidth, 8, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.text(title, margin + 2, y + 4);
    y += 10;
  };

  const addRow = (label: string, value: string) => {
    ensureSpace(7);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.setTextColor(80, 80, 80);
    pdf.text(label, margin + 2, y);
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'bold');
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

  pdf.setFillColor(13, 148, 136);
  pdf.rect(0, 0, pageWidth, 28, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  pdf.text('Academia Sinica', margin, 12);
  pdf.setFontSize(13);
  pdf.text('Dormitory Point Calculation Sheet', margin, 20);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Generated: ${new Date().toLocaleDateString('en-US')}`, pageWidth - margin - 40, 20);
  y = 36;

  addSectionHeader('Applicant Information');
  addRow('Service Unit', data.applicant.serviceUnit || '-');
  addRow('Name', data.applicant.name || '-');
  addRow('Job Title', data.applicant.jobTitle || '-');
  addRow('Phone', data.applicant.phone || '-');
  addRow('Gender', data.applicant.gender || '-');
  addRow('ID Number', data.applicant.idNumber || '-');
  addRow('Birthday', data.applicant.birthday || '-');
  addRow('Marital Status', data.applicant.maritalStatus === 'married' ? 'Married' : data.applicant.maritalStatus === 'single' ? 'Single' : '-');
  addRow('Census Address', data.applicant.censusAddress || '-');
  addRow('Mailing Address', data.applicant.mailingAddress || '-');
  addLine();

  if (data.applicant.maritalStatus === 'married' && data.spouse.name) {
    addSectionHeader('Spouse Information');
    addRow('Name', data.spouse.name || '-');
    addRow('ID Number', data.spouse.idNumber || '-');
    addRow('Birthday', data.spouse.birthday || '-');
    addRow('Occupation', data.spouse.occupation || '-');
    addRow('Both in Academia Sinica', data.isBothSpousesInAcademia ? 'Yes' : 'No');
    addLine();
  }

  if (data.familyMembers.some((m) => m.name.trim() !== '')) {
    addSectionHeader('Dependents');
    data.familyMembers.filter((m) => m.name.trim() !== '').forEach((m, i) => {
      addRow(`#${i + 1} Relationship`, m.relationship || '-');
      addRow(`#${i + 1} Name`, m.name);
      addRow(`#${i + 1} Birthday`, m.birthday || '-');
      addRow(`#${i + 1} Occupation`, m.occupation || '-');
      y += 2;
    });
    addLine();
  }

  addSectionHeader('A. Addition Items - Points');
  addRow('Service Years', `${data.serviceYears.years} years, ${data.serviceYears.months} months`);
  addRow('Service Years Points', `${breakdown.serviceYears}`);
  addRow('Base Salary (NTD)', data.baseSalary.toString());
  addRow('Job Level Points', `${breakdown.jobLevel}`);
  addRow('Dependents Count', `${data.familyMembers.filter((m) => m.name.trim() !== '').length}`);
  addRow('Dependents Points', `${breakdown.dependents}`);
  addRow('A Subtotal', `${breakdown.totalA} points`);
  addLine();

  addSectionHeader('B. Deduction Items - Points');
  addRow('Has Self-Owned Property', data.hasSelfOwnedProperty ? 'Yes' : 'No');
  if (data.hasSelfOwnedProperty) {
    data.selfOwnedProperties.forEach((p, i) => {
      addRow(`Property #${i + 1} Owner`, p.owner || '-');
      addRow(`Property #${i + 1} Address`, p.address || '-');
    });
  }
  addRow('Property Deduction', `${roundToTwo(breakdown.propertyDeduction)} points`);
  addRow('Previous Borrow Count', `${data.previousBorrowCount}`);
  addRow('Borrow Deduction', `${roundToTwo(breakdown.borrowDeduction)} points`);
  addRow('B Subtotal', `${roundToTwo(breakdown.totalB)} points`);
  addLine();

  ensureSpace(20);
  pdf.setFillColor(13, 148, 136, 0.1);
  pdf.setFillColor(224, 242, 240);
  pdf.rect(margin, y - 2, contentWidth, 16, 'F');
  pdf.setTextColor(13, 148, 136);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.text(`C. Total Points (A - B = C): ${roundToTwo(breakdown.totalC)} points`, margin + 2, y + 6);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Note: 2-room dorm requires at least 2 people; 3-4 room dorm requires at least 3 people.', margin + 2, y + 11);
  y += 20;

  ensureSpace(15);
  addSectionHeader('Declaration');
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(60, 60, 60);
  const declaration = `The applicant and spouse confirm no self-owned property in the designated restricted areas, no prior government housing assistance, and compliance with all dormitory regulations. The applicant agrees to vacate within 3 months upon transfer, resignation, retirement, leave of absence, or secondment, and within 1 month upon dismissal. All information provided is true and accurate to the best of knowledge.`;
  const declLines = pdf.splitTextToSize(declaration, contentWidth);
  declLines.forEach((line: string) => {
    ensureSpace(4);
    pdf.text(line, margin, y);
    y += 4;
  });

  y += 6;
  addRow('Agreement Confirmed', data.agreementChecked ? 'Yes' : 'No');
  addRow('Applicant Signature', '_______________________');
  y += 4;
  addRow('Spouse Signature', '_______________________');
  y += 4;
  addRow('Date', '_______________________');

  // Review section
  addSectionHeader('Review Section (For Office Use)');
  addRow('General Affairs Officer', '');
  addRow('HR Officer', '');
  addRow('Unit Supervisor', '');

  pdf.save('dormitory-points-form.pdf');
}

export async function exportFormToImage(element: HTMLElement, filename: string) {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
  });
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
