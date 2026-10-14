import {
  type FeeStructureCandidate,
  selectFeeStructureForChild,
} from '@/lib/fee-structure-selector';

export interface FeeStructureRow extends FeeStructureCandidate {
  id: string;
  amount: number;
  fee_type?: string | null;
}

/** Same rule as the EduDash Pro app. */
export function isTuitionFee(
  feeType?: string | null,
  name?: string | null,
  description?: string | null,
): boolean {
  const text = `${feeType ?? ''} ${name ?? ''} ${description ?? ''}`.toLowerCase();
  return (
    text.includes('tuition') ||
    text.includes('school fees') ||
    text.includes('school fee') ||
    text.includes('monthly')
  );
}

function monthStartISO(year: number, monthIndex: number): string {
  const first = new Date(year, monthIndex, 1);
  return `${first.getFullYear()}-${String(first.getMonth() + 1).padStart(2, '0')}-01`;
}

export interface StudentFeeInsert {
  student_id: string;
  fee_structure_id: string;
  amount: number;
  final_amount: number;
  due_date: string;
  billing_month: string;
  category_code: 'tuition';
  status: 'pending';
  amount_outstanding: number;
}

/**
 * The first two monthly tuition invoices for a newly enrolled learner (start month and the
 * next), exactly as the EduDash Pro app creates them on approval. Returns [] when the school
 * has no tuition fee structure that fits.
 */
export function buildStartupTuitionFees(input: {
  studentId: string;
  structures: FeeStructureRow[];
  dateOfBirth: string | null;
  enrollmentDate: string;
}): StudentFeeInsert[] {
  const tuition = input.structures.filter((fee) =>
    isTuitionFee(fee.fee_type, fee.name, fee.description),
  );
  const selected = selectFeeStructureForChild(tuition, {
    dateOfBirth: input.dateOfBirth,
    enrollmentDate: input.enrollmentDate,
  });
  if (!selected) return [];

  const start = new Date(`${input.enrollmentDate}T00:00:00`);
  if (Number.isNaN(start.getTime())) return [];
  const months = [
    monthStartISO(start.getFullYear(), start.getMonth()),
    monthStartISO(start.getFullYear(), start.getMonth() + 1),
  ];

  return months.map((month) => ({
    student_id: input.studentId,
    fee_structure_id: selected.id,
    amount: Number(selected.amount),
    final_amount: Number(selected.amount),
    due_date: month,
    billing_month: month,
    category_code: 'tuition' as const,
    status: 'pending' as const,
    amount_outstanding: Number(selected.amount),
  }));
}
