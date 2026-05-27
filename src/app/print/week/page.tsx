import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';

// Auth + DB at request time — never prerender.
export const dynamic = 'force-dynamic';

const DAILY_BLOCKS = [
  { time: '8:30–9:00', label: 'Morning Anchor', detail: 'Calendar · weather · read-aloud' },
  { time: '9:00–9:30', label: 'English Block 1', detail: 'Eldest 1:1 · Middle quiet activity · Youngest play' },
  { time: '9:30–10:00', label: 'English Block 2', detail: 'Eldest independent read · Middle 1:1 · Youngest play' },
  { time: '10:00–10:20', label: 'Snack & Movement', detail: '— break —' },
  { time: '10:20–10:50', label: 'Math Block 1', detail: 'Eldest 1:1 · Middle manipulatives · Youngest play' },
  { time: '10:50–11:15', label: 'Math Block 2', detail: 'Eldest workbook · Middle 1:1 · Youngest play' },
  { time: '11:15–12:00', label: 'Family Content', detail: 'Science (M/W) · History (T/Th)' },
  { time: '12:00–12:15', label: 'Closing Read-Aloud', detail: '— group —' },
];

export default async function PrintWeekPage() {
  const session = await auth();
  if (!session?.user?.email) redirect('/signin?callbackUrl=/print/week');

  const children = await prisma.child.findMany({
    where: { deletedAt: null },
    orderBy: { sortOrder: 'asc' },
  });

  return (
    <div className="min-h-screen bg-white text-black p-8 print:p-0">
      <style>{`@media print { @page { size: letter; margin: 0.4in; } }`}</style>
      <header className="border-b-2 border-black pb-3 mb-5">
        <h1 className="font-display text-2xl font-semibold">The Whitford School · Weekly Schedule</h1>
        <p className="text-sm text-gray-600">
          Children: {children.map((c: { name: string; age: string }) => `${c.name} (${c.age})`).join(' · ')} ·
          Printed {new Date().toLocaleDateString()}
        </p>
      </header>

      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b-2 border-black">
            <th className="text-left p-2 w-28">Time</th>
            <th className="text-left p-2">Block</th>
            <th className="text-left p-2">Mon</th>
            <th className="text-left p-2">Tue</th>
            <th className="text-left p-2">Wed</th>
            <th className="text-left p-2">Thu</th>
          </tr>
        </thead>
        <tbody>
          {DAILY_BLOCKS.map((b, i) => (
            <tr key={i} className="border-b border-gray-300">
              <td className="p-2 font-mono text-xs">{b.time}</td>
              <td className="p-2">
                <div className="font-semibold">{b.label}</div>
                <div className="text-xs text-gray-700">{b.detail}</div>
              </td>
              <td className="p-2"><Box /></td>
              <td className="p-2"><Box /></td>
              <td className="p-2"><Box /></td>
              <td className="p-2"><Box /></td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-5 border-t border-gray-300 pt-3">
        <div className="font-semibold mb-1">Friday — Flex Day</div>
        <div className="text-sm text-gray-700">
          9:00–10:00 catch-up &nbsp;·&nbsp; 10:00–10:30 library/errand &nbsp;·&nbsp; 10:30–12:00 project · art · nature
        </div>
      </div>

      <div className="mt-6 text-xs text-gray-500 italic">
        Tip: print and stick on the fridge. Check boxes as you go. Friday absorbs life.
      </div>
    </div>
  );
}

function Box() {
  return <div className="w-4 h-4 border border-gray-400 inline-block" />;
}
