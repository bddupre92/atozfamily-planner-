'use client';

import { useState, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import {
  Calendar, BookOpen, Target, FileText, NotebookPen, History, LogOut,
  Check, Plus, Trash2, Printer, BookMarked, Lightbulb,
} from 'lucide-react';
import { LibraryTab } from './library/LibraryTab';
import { SuggestionsTab } from './suggestions/SuggestionsTab';
import { SuggestionFAB } from './suggestions/SuggestionFAB';
import { WeeklyTopicPicker } from './library/WeeklyTopicPicker';
import { NextLessonCard, type SequenceProgressRow } from './library/NextLessonCard';
import { currentOrUpcomingTerm, currentWeekOfTerm } from '@/lib/week';
import { MapPin } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================
type Child = { id: string; name: string; age: string; grade: string; colorKey: string; sortOrder: number };
type Term = { id: string; name: string; season: string; startDate: string; endDate: string; weeks: number; theme: string };
type TermProgress = { id: string; termId: string; childId: string; lessonsComplete: number; notes: string | null };
type Lesson = {
  id: string; childId: string; subject: string; curriculum: string; lessonRef: string;
  topic: string | null; date: string; durationMin: number | null; status: string;
  difficulty: number | null; notes: string | null;
  child: Child;
};
type Reflection = {
  id: string; childId: string | null; date: string;
  whatWorked: string | null; whatDidnt: string | null; tomorrowAdjust: string | null;
  mood: number | null; energyLevel: number | null; tags: string[];
  child?: Child | null;
};

// ============================================================================
// CONSTANTS — daily schedule template, prep checklist, curriculum tracks
// ============================================================================
const COLOR_MAP: Record<string, { swatch: string; soft: string }> = {
  terracotta: { swatch: '#C26B4F', soft: '#F5E0D6' },
  sage: { swatch: '#7B8F5C', soft: '#E5EAD8' },
  lavender: { swatch: '#8B7FB5', soft: '#E6E1F0' },
};

const DAILY_BLOCKS = [
  { time: '8:30–9:00', label: 'Morning Anchor', type: 'family', detail: 'Calendar, weather, read-aloud start' },
  { time: '9:00–9:30', label: 'English Block 1', type: 'instruction',
    assignments: { eldest: 'LOE Foundations (1:1)', middle: 'Busy bag / tracing', youngest: 'School-time toy bin' } },
  { time: '9:30–10:00', label: 'English Block 2', type: 'instruction',
    assignments: { eldest: 'Independent reading', middle: 'LOE Foundations (1:1)', youngest: 'Continued play' } },
  { time: '10:00–10:20', label: 'Snack & Movement', type: 'break', detail: '2yo connection time' },
  { time: '10:20–10:50', label: 'Math Block 1', type: 'instruction',
    assignments: { eldest: 'Singapore Math (1:1)', middle: 'Math manipulatives', youngest: 'Play alongside' } },
  { time: '10:50–11:15', label: 'Math Block 2', type: 'instruction',
    assignments: { eldest: 'Workbook independently', middle: 'Singapore Math (1:1)', youngest: 'Play' } },
  { time: '11:15–12:00', label: 'Family Content', type: 'family', detail: 'Science (Mon/Wed) · History (Tue/Thu)' },
  { time: '12:00–12:15', label: 'Closing Read-Aloud', type: 'family', detail: 'Picture or chapter book' },
];

const PREP_CHECKLIST = [
  'Read upcoming LOE lessons for Eldest',
  'Read upcoming LOE lessons for Middle',
  'Pull phonogram cards & game pieces',
  'Preview Singapore Math chapter (Eldest)',
  'Preview Singapore Math chapter (Middle)',
  'Gather science materials',
  'Queue history read-aloud',
  'Refresh 2yo school-time toy bin',
  'Library list — request holds',
  'Print worksheets / mark workbook pages',
];

const CURRICULUM_TRACKS: Record<string, string[]> = {
  // child colorKey → progression
  terracotta: ['LOE Foundations C', 'LOE Foundations D', 'LOE Essentials A', 'LOE Essentials B', 'LOE Essentials C'],
  sage: ['LOE Foundations A', 'LOE Foundations B', 'LOE Foundations C', 'LOE Foundations D', 'LOE Essentials A'],
  lavender: ['Read-aloud', 'Pre-literacy games', 'LOE Foundations A', 'LOE Foundations B', 'LOE Foundations C'],
};

// ============================================================================
// MAIN APP
// ============================================================================
type WeeklyTopicWithResource = {
  id: string;
  termId: string;
  weekNumber: number;
  subject: 'SCIENCE' | 'HISTORY';
  resourceId: string;
  notes: string | null;
  selectedBy: string;
  resource: {
    id: string;
    title: string;
    framework: string | null;
    materials: string[];
    fieldTripLocation: string | null;
  };
};

type Props = {
  session: { email: string; name: string | null };
  initialState: any;
  childrenList: Child[];
  terms: Term[];
  termProgress: TermProgress[];
  recentLessons: Lesson[];
  recentReflections: Reflection[];
  weeklyTopics: WeeklyTopicWithResource[];
};

export function PlannerApp({ session, initialState, childrenList, terms, termProgress: tp0, recentLessons: rl0, recentReflections: rr0, weeklyTopics: wt0 }: Props) {
  const [activeTab, setActiveTab] = useState<'week' | 'year' | 'lessons' | 'reflections' | 'progress' | 'audit' | 'notes' | 'library' | 'suggestions'>('week');
  const [state, setState] = useState<any>(initialState ?? { weekState: { prep: {}, daily: {} }, selectedTermId: 'summer-2026' });
  const [termProgress, setTermProgress] = useState(tp0);
  const [lessons, setLessons] = useState(rl0);
  const [reflections, setReflections] = useState(rr0);
  const [weeklyTopics, setWeeklyTopics] = useState<WeeklyTopicWithResource[]>(wt0);
  const [savedAt, setSavedAt] = useState<string>('');

  // Reload weekly topics after a pick/clear so the WeekTab card reflects state.
  async function refreshWeeklyTopics(termId: string) {
    const res = await fetch(`/api/weekly-topic?termId=${encodeURIComponent(termId)}`);
    if (!res.ok) return;
    const j = await res.json();
    // Replace only this term's rows; preserve any other-term picks already in state.
    setWeeklyTopics((prev) => [
      ...prev.filter((t) => t.termId !== termId),
      ...((j.topics ?? []) as WeeklyTopicWithResource[]),
    ]);
  }

  // Debounced save
  useEffect(() => {
    if (!state) return;
    const t = setTimeout(() => {
      fetch('/api/state', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ state }),
      }).then(() => setSavedAt(new Date().toLocaleTimeString()));
    }, 800);
    return () => clearTimeout(t);
  }, [state]);

  return (
    <div className="min-h-screen bg-cream text-ink font-body">
      {/* Header */}
      <header className="border-b border-rule bg-cream px-6 py-4 sticky top-0 z-30 no-print">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div>
            <div className="font-display text-xl font-semibold leading-none">atozfamily planner</div>
            <div className="text-[11px] text-ink-muted uppercase tracking-wider mt-0.5">Whitford School · Hillsboro, OR</div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-ink-muted">{savedAt && `Saved ${savedAt}`}</span>
            <span className="text-xs text-ink-soft">{session.email}</span>
            <button onClick={() => signOut({ callbackUrl: '/signin' })}
              className="text-xs flex items-center gap-1 text-ink-muted hover:text-ink">
              <LogOut size={12} /> Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <nav className="border-b border-rule bg-cream sticky top-[57px] z-20 no-print">
        <div className="max-w-7xl mx-auto px-6 flex gap-1 overflow-x-auto">
          {([
            ['week', 'This Week', Calendar],
            ['year', 'Year Plan', BookOpen],
            ['lessons', 'Lessons', NotebookPen],
            ['reflections', 'Reflections', FileText],
            ['progress', 'Progress', Target],
            ['audit', 'Audit Log', History],
            ['notes', 'Notes', FileText],
            ['library', 'Library', BookMarked],
            ['suggestions', 'Suggestions', Lightbulb],
          ] as const).map(([id, label, Icon]) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm border-b-2 transition whitespace-nowrap ${
                activeTab === id
                  ? 'border-accent text-ink font-semibold'
                  : 'border-transparent text-ink-muted hover:text-ink-soft'
              }`}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8 pb-20">
        {activeTab === 'week' && (
          <WeekTab
            state={state}
            setState={setState}
            childrenList={childrenList}
            terms={terms}
            weeklyTopics={weeklyTopics}
            onTopicChanged={refreshWeeklyTopics}
          />
        )}
        {activeTab === 'year' && <YearTab state={state} setState={setState} childrenList={childrenList} terms={terms} termProgress={termProgress} setTermProgress={setTermProgress} />}
        {activeTab === 'lessons' && <LessonsTab childrenList={childrenList} lessons={lessons} setLessons={setLessons} />}
        {activeTab === 'reflections' && <ReflectionsTab childrenList={childrenList} reflections={reflections} setReflections={setReflections} />}
        {activeTab === 'progress' && <ProgressTab childrenList={childrenList} terms={terms} termProgress={termProgress} lessons={lessons} />}
        {activeTab === 'audit' && <AuditTab />}
        {activeTab === 'notes' && <NotesTab state={state} setState={setState} />}
        {activeTab === 'library' && <LibraryTab termIds={terms.map((t: any) => t.id)} />}
        {activeTab === 'suggestions' && <SuggestionsTab />}
      </main>
      <SuggestionFAB />
    </div>
  );
}

// ============================================================================
// WEEK TAB
// ============================================================================
function TopicCard({
  label,
  topic,
  onPick,
}: {
  label: string;
  topic: WeeklyTopicWithResource | undefined;
  onPick: () => void;
}) {
  return (
    <div className="bg-cream border border-rule rounded-lg p-4 flex flex-col">
      <div className="text-[10px] uppercase tracking-wider text-ink-muted font-semibold mb-1">
        {label}
      </div>
      {topic ? (
        <>
          <div className="text-sm font-semibold leading-tight">{topic.resource.title}</div>
          <div className="flex flex-wrap items-center gap-1.5 mt-1">
            {topic.resource.framework && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-paper border border-rule text-ink-soft">
                {topic.resource.framework}
              </span>
            )}
            <span className="text-[10px] text-ink-muted">
              {topic.resource.materials.length} materials
            </span>
            {topic.resource.fieldTripLocation && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-paper border border-rule text-ink-soft inline-flex items-center gap-0.5">
                <MapPin size={9} /> trip
              </span>
            )}
          </div>
          <button
            onClick={onPick}
            className="self-start mt-3 text-xs px-3 py-1.5 border border-rule rounded text-ink-soft hover:bg-paper"
          >
            Change
          </button>
        </>
      ) : (
        <>
          <div className="text-sm text-ink-muted italic flex-1">No topic picked yet.</div>
          <button
            onClick={onPick}
            className="self-start mt-3 text-xs px-3 py-1.5 bg-accent text-cream rounded"
          >
            Pick topic
          </button>
        </>
      )}
    </div>
  );
}

function WeekTab({ state, setState, childrenList, terms, weeklyTopics, onTopicChanged }: any) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu'];

  // Pick the term that contains today (or next-upcoming) and the week number
  // within it. Off-season → default to week 1 of the current/upcoming term.
  const term = currentOrUpcomingTerm(terms) ?? terms[0];
  const weekNumber = term ? (currentWeekOfTerm(term.startDate, term.weeks) ?? 1) : 1;

  const scienceTopic = weeklyTopics.find(
    (t: WeeklyTopicWithResource) =>
      t.termId === term?.id && t.weekNumber === weekNumber && t.subject === 'SCIENCE',
  );
  const historyTopic = weeklyTopics.find(
    (t: WeeklyTopicWithResource) =>
      t.termId === term?.id && t.weekNumber === weekNumber && t.subject === 'HISTORY',
  );

  const [pickerSubject, setPickerSubject] = useState<'SCIENCE' | 'HISTORY' | null>(null);

  const togglePrep = (idx: number) => {
    setState({ ...state, weekState: { ...state.weekState, prep: { ...state.weekState.prep, [idx]: !state.weekState.prep?.[idx] } } });
  };
  const toggleBlock = (day: string, blockIdx: number, childId: string) => {
    const daily = state.weekState.daily || {};
    const dayObj = daily[day] || {};
    const blockObj = dayObj[blockIdx] || {};
    setState({
      ...state,
      weekState: { ...state.weekState, daily: { ...daily, [day]: { ...dayObj, [blockIdx]: { ...blockObj, [childId]: !blockObj[childId] } } } },
    });
  };

  const completedPrep = Object.values(state.weekState.prep ?? {}).filter(Boolean).length;

  return (
    <div>
      <SectionHeader eyebrow="Weekly Operations" title="This Week"
        subtitle="Click any block to mark complete. Friday is flex day." />

      {/* Family Content topics — Science (Mon/Wed) + History (Tue/Thu) */}
      {term && (
        <div className="bg-paper border border-rule rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="font-display text-lg font-semibold">Family Content</div>
              <div className="text-xs text-ink-muted mt-0.5">
                {term.name} · Week {weekNumber} · curated from the library
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <TopicCard
              label="Science · Mon / Wed"
              topic={scienceTopic}
              onPick={() => setPickerSubject('SCIENCE')}
            />
            <TopicCard
              label="History · Tue / Thu"
              topic={historyTopic}
              onPick={() => setPickerSubject('HISTORY')}
            />
          </div>
        </div>
      )}

      {term && pickerSubject && (
        <WeeklyTopicPicker
          open
          termId={term.id}
          weekNumber={weekNumber}
          subject={pickerSubject}
          age={7}
          onClose={() => setPickerSubject(null)}
          onPicked={() => onTopicChanged(term.id)}
        />
      )}

      {/* Prep */}
      <div className="bg-paper border border-rule rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="font-display text-lg font-semibold">Weekly Prep Ritual</div>
            <div className="text-xs text-ink-muted mt-0.5">Sunday or Friday · ~30–45 min · non-negotiable</div>
          </div>
          <div className="text-xs text-ink-soft">{completedPrep} / {PREP_CHECKLIST.length}</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {PREP_CHECKLIST.map((item, idx) => {
            const checked = !!state.weekState.prep?.[idx];
            return (
              <button key={idx} onClick={() => togglePrep(idx)}
                className={`flex items-center gap-2 text-left text-sm px-3 py-2 rounded border transition ${
                  checked ? 'bg-moss-soft border-forest/40 text-forest line-through' : 'bg-cream border-rule text-ink-soft'
                }`}>
                <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                  checked ? 'bg-forest border-forest' : 'border-rule'
                }`}>
                  {checked && <Check size={10} color="#FAF6EF" strokeWidth={3} />}
                </div>
                {item}
              </button>
            );
          })}
        </div>
      </div>

      {/* Daily blocks */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="font-display text-lg font-semibold">Daily Schedule (Mon–Thu)</div>
          <div className="text-xs text-ink-muted">~2.5 hr instruction · staggered 1:1 with family-style content</div>
        </div>
        <a href="/print/week" target="_blank" className="text-xs flex items-center gap-1 px-3 py-1.5 border border-rule rounded text-ink-soft hover:bg-paper">
          <Printer size={12} /> Print view
        </a>
      </div>
      {DAILY_BLOCKS.map((block, idx) => (
        <ScheduleRow key={idx} block={block} blockIdx={idx} days={days} childrenList={childrenList}
          dayChecks={state.weekState.daily ?? {}} onToggle={toggleBlock} />
      ))}
    </div>
  );
}

function ScheduleRow({ block, blockIdx, days, childrenList, dayChecks, onToggle }: any) {
  const isInstruction = block.type === 'instruction';
  // Map UI assignment keys to actual child IDs by sortOrder
  const childKeys = ['eldest', 'middle', 'youngest'];

  return (
    <div className="bg-cream border border-rule rounded-lg p-4 mb-2.5">
      <div className="flex items-start gap-4 mb-3">
        <div className="flex-shrink-0 w-28">
          <div className="text-[10px] text-ink-muted uppercase tracking-wider font-semibold">{block.time}</div>
          <div className="font-display text-base font-semibold mt-0.5">{block.label}</div>
        </div>
        <div className="flex-1">
          {!isInstruction && <div className="text-sm text-ink-soft pt-1">{block.detail}</div>}
          {isInstruction && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {childrenList.map((child: Child, i: number) => {
                const colors = COLOR_MAP[child.colorKey] ?? COLOR_MAP.terracotta;
                const assignmentKey = childKeys[i];
                const assignment = block.assignments?.[assignmentKey];
                if (!assignment) return null;
                return (
                  <div key={child.id} className="rounded px-2.5 py-1.5"
                    style={{ background: colors.soft, borderColor: colors.swatch + '33', borderWidth: 1 }}>
                    <div className="text-[9px] font-semibold uppercase tracking-wider mb-0.5"
                      style={{ color: colors.swatch }}>{child.name} · age {child.age}</div>
                    <div className="text-xs font-semibold text-ink">{assignment}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      {isInstruction && (
        <div className="flex gap-4 pl-32 items-center">
          <div className="text-[10px] text-ink-muted uppercase tracking-wider font-semibold">This Week</div>
          {days.map((day: string) => (
            <div key={day} className="flex items-center gap-1.5">
              <span className="text-[10px] text-ink-muted font-medium w-6">{day}</span>
              <div className="flex gap-1">
                {childrenList.map((child: Child, i: number) => {
                  const assignmentKey = childKeys[i];
                  if (!block.assignments?.[assignmentKey]) return null;
                  const colors = COLOR_MAP[child.colorKey] ?? COLOR_MAP.terracotta;
                  const checked = dayChecks?.[day]?.[blockIdx]?.[child.id];
                  return (
                    <button key={child.id} onClick={() => onToggle(day, blockIdx, child.id)}
                      title={`${child.name}: ${block.assignments[assignmentKey]}`}
                      className="w-4 h-4 rounded border-2 transition hover:scale-110"
                      style={{ borderColor: colors.swatch, background: checked ? colors.swatch : 'transparent' }} />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// YEAR TAB
// ============================================================================
function YearTab({ state, setState, childrenList, terms, termProgress, setTermProgress }: any) {
  const selected = state.selectedTermId ?? terms[0]?.id;
  const term = terms.find((t: Term) => t.id === selected);

  return (
    <div>
      <SectionHeader eyebrow="Multi-Term Plan" title="Year Roadmap · June 2026 forward"
        subtitle="Year-round across three terms plus Summer 2027 preview." />

      <div className="flex gap-2 mb-6 flex-wrap">
        {terms.map((t: Term) => (
          <button key={t.id} onClick={() => setState({ ...state, selectedTermId: t.id })}
            className={`px-4 py-2 rounded-full text-xs font-semibold border-2 transition ${
              selected === t.id ? 'bg-accent text-cream border-accent' : 'bg-paper text-ink border-rule hover:border-accent'
            }`}>
            {t.name}
          </button>
        ))}
      </div>

      {term && (
        <div>
          <div className="bg-accent-soft border border-accent rounded-xl p-6 mb-5">
            <div className="text-[11px] text-accent font-semibold uppercase tracking-wider mb-1">
              {term.name} · {term.weeks} weeks
            </div>
            <div className="font-display text-2xl font-semibold leading-tight mb-2">
              {new Date(term.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} — {new Date(term.endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
            <div className="text-sm text-ink-soft italic">{term.theme}</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            {childrenList.map((child: Child) => {
              const colors = COLOR_MAP[child.colorKey] ?? COLOR_MAP.terracotta;
              const progress = termProgress.find((p: TermProgress) => p.termId === term.id && p.childId === child.id);
              return (
                <div key={child.id} className="rounded-xl p-4 border"
                  style={{ background: colors.soft, borderColor: colors.swatch + '66' }}>
                  <div className="font-display text-base font-semibold">{child.name}</div>
                  <div className="text-[10px] text-ink-muted uppercase tracking-wider">Age {child.age} · {child.grade}</div>
                  <div className="mt-3 text-xs">
                    <span className="text-ink-muted">Lessons this term: </span>
                    <span className="font-semibold text-ink">{progress?.lessonsComplete ?? 0}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// LESSONS TAB — per-lesson tracking
// ============================================================================
function LessonsTab({ childrenList, lessons, setLessons }: any) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div>
      <SectionHeader eyebrow="Per-Lesson Tracking" title="Lessons"
        subtitle="Log each completed lesson. This is your Oregon portfolio AND your data feedback loop." />

      <div className="mb-6 flex justify-end">
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-4 py-2 bg-accent text-cream rounded text-sm font-semibold hover:opacity-90">
          <Plus size={14} /> Log lesson
        </button>
      </div>

      {showForm && <LessonForm childrenList={childrenList} onSaved={(lesson: Lesson) => { setLessons([lesson, ...lessons]); setShowForm(false); }} onCancel={() => setShowForm(false)} />}

      <div className="space-y-2">
        {lessons.length === 0 && <div className="text-center py-12 text-ink-muted">No lessons logged yet. Start with today.</div>}
        {lessons.map((lesson: Lesson) => {
          const colors = COLOR_MAP[lesson.child?.colorKey ?? 'terracotta'] ?? COLOR_MAP.terracotta;
          return (
            <div key={lesson.id} className="bg-cream border border-rule rounded-lg p-4 flex items-center gap-4">
              <div className="w-1 self-stretch rounded" style={{ background: colors.swatch }} />
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: colors.swatch }}>
                    {lesson.child?.name ?? 'Child'}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-paper rounded text-ink-muted font-semibold uppercase tracking-wider">{lesson.subject}</span>
                  <span className="text-xs text-ink-muted">{new Date(lesson.date).toLocaleDateString()}</span>
                </div>
                <div className="font-display text-base font-semibold mt-1">{lesson.curriculum} · {lesson.lessonRef}</div>
                {lesson.topic && <div className="text-sm text-ink-soft">{lesson.topic}</div>}
                {lesson.notes && <div className="text-xs text-ink-muted italic mt-1">{lesson.notes}</div>}
              </div>
              <button onClick={async () => {
                await fetch(`/api/lessons?id=${lesson.id}`, { method: 'DELETE' });
                setLessons(lessons.filter((l: Lesson) => l.id !== lesson.id));
              }} className="text-ink-muted hover:text-red-700">
                <Trash2 size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LessonForm({ childrenList, onSaved, onCancel }: any) {
  const [data, setData] = useState({
    childId: childrenList[0]?.id ?? '',
    subject: 'ENGLISH',
    curriculum: '',
    lessonRef: '',
    topic: '',
    date: new Date().toISOString().slice(0, 10),
    durationMin: 30,
    status: 'COMPLETED',
    difficulty: 3,
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const res = await fetch('/api/lessons', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(data),
    });
    const { lesson } = await res.json();
    const child = childrenList.find((c: Child) => c.id === data.childId);
    onSaved({ ...lesson, child });
    setSaving(false);
  }

  return (
    <div className="bg-paper border border-rule rounded-xl p-5 mb-6">
      <div className="font-display text-base font-semibold mb-3">Log a lesson</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="Child">
          <select value={data.childId} onChange={(e) => setData({ ...data, childId: e.target.value })} className="form-input">
            {childrenList.map((c: Child) => <option key={c.id} value={c.id}>{c.name} (age {c.age})</option>)}
          </select>
        </Field>
        <Field label="Subject">
          <select value={data.subject} onChange={(e) => setData({ ...data, subject: e.target.value })} className="form-input">
            {['ENGLISH', 'MATH', 'SCIENCE', 'HISTORY', 'ART', 'MUSIC', 'PE', 'OTHER'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Curriculum">
          <input value={data.curriculum} onChange={(e) => setData({ ...data, curriculum: e.target.value })}
            placeholder="LOE Foundations C / Singapore Math 2A" className="form-input" />
        </Field>
        <Field label="Lesson reference">
          <input value={data.lessonRef} onChange={(e) => setData({ ...data, lessonRef: e.target.value })}
            placeholder="Lesson 12 / Chapter 3.2" className="form-input" />
        </Field>
        <Field label="Topic">
          <input value={data.topic} onChange={(e) => setData({ ...data, topic: e.target.value })}
            placeholder='e.g. Phonogram /sh/' className="form-input" />
        </Field>
        <Field label="Date">
          <input type="date" value={data.date} onChange={(e) => setData({ ...data, date: e.target.value })} className="form-input" />
        </Field>
        <Field label="Duration (min)">
          <input type="number" value={data.durationMin} onChange={(e) => setData({ ...data, durationMin: parseInt(e.target.value) })} className="form-input" />
        </Field>
        <Field label="Status">
          <select value={data.status} onChange={(e) => setData({ ...data, status: e.target.value })} className="form-input">
            <option value="COMPLETED">Completed</option>
            <option value="PARTIAL">Partial</option>
            <option value="ABANDONED">Abandoned (bad day)</option>
          </select>
        </Field>
        <Field label="Difficulty (1-5)">
          <input type="number" min={1} max={5} value={data.difficulty} onChange={(e) => setData({ ...data, difficulty: parseInt(e.target.value) })} className="form-input" />
        </Field>
      </div>
      <Field label="Notes" className="mt-3">
        <textarea value={data.notes} onChange={(e) => setData({ ...data, notes: e.target.value })}
          placeholder="What went well, what was hard, anything to remember…"
          className="form-input min-h-[60px]" />
      </Field>
      <div className="flex gap-2 mt-4">
        <button onClick={save} disabled={saving} className="px-4 py-2 bg-accent text-cream rounded text-sm font-semibold disabled:opacity-50">
          {saving ? 'Saving…' : 'Save lesson'}
        </button>
        <button onClick={onCancel} className="px-4 py-2 border border-rule rounded text-sm text-ink-soft">Cancel</button>
      </div>
    </div>
  );
}

function Field({ label, children, className = '' }: any) {
  return (
    <label className={className}>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted mb-1">{label}</div>
      {children}
    </label>
  );
}

// ============================================================================
// REFLECTIONS TAB
// ============================================================================
function ReflectionsTab({ childrenList, reflections, setReflections }: any) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div>
      <SectionHeader eyebrow="Daily Reflection" title="Reflections"
        subtitle="2 minutes at end of day. The highest-leverage habit in homeschooling." />

      <div className="mb-6 flex justify-end">
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 px-4 py-2 bg-accent text-cream rounded text-sm font-semibold">
          <Plus size={14} /> Add reflection
        </button>
      </div>

      {showForm && <ReflectionForm childrenList={childrenList} onSaved={(r: Reflection) => { setReflections([r, ...reflections]); setShowForm(false); }} onCancel={() => setShowForm(false)} />}

      <div className="space-y-3">
        {reflections.length === 0 && <div className="text-center py-12 text-ink-muted">No reflections yet. Try one tonight.</div>}
        {reflections.map((r: Reflection) => (
          <div key={r.id} className="bg-cream border border-rule rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-ink-muted">{new Date(r.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
              {r.child && <span className="text-[10px] font-semibold uppercase tracking-wider">{r.child.name}</span>}
              {r.mood && <span className="text-xs">Mood: {'★'.repeat(r.mood)}</span>}
            </div>
            {r.whatWorked && <div className="mb-1"><span className="text-[10px] font-semibold uppercase text-forest">Worked</span><div className="text-sm">{r.whatWorked}</div></div>}
            {r.whatDidnt && <div className="mb-1"><span className="text-[10px] font-semibold uppercase text-accent">Didn&apos;t</span><div className="text-sm">{r.whatDidnt}</div></div>}
            {r.tomorrowAdjust && <div><span className="text-[10px] font-semibold uppercase text-ink-muted">Tomorrow</span><div className="text-sm">{r.tomorrowAdjust}</div></div>}
          </div>
        ))}
      </div>
    </div>
  );
}

function ReflectionForm({ childrenList, onSaved, onCancel }: any) {
  const [data, setData] = useState({
    date: new Date().toISOString().slice(0, 10),
    childId: '',
    whatWorked: '',
    whatDidnt: '',
    tomorrowAdjust: '',
    mood: 3,
    energyLevel: 3,
    tags: [],
  });
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const res = await fetch('/api/reflections', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(data),
    });
    const { reflection } = await res.json();
    const child = childrenList.find((c: Child) => c.id === data.childId);
    onSaved({ ...reflection, child });
    setSaving(false);
  }

  return (
    <div className="bg-paper border border-rule rounded-xl p-5 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
        <Field label="Date">
          <input type="date" value={data.date} onChange={(e) => setData({ ...data, date: e.target.value })} className="form-input" />
        </Field>
        <Field label="Child (optional)">
          <select value={data.childId} onChange={(e) => setData({ ...data, childId: e.target.value })} className="form-input">
            <option value="">— Whole family —</option>
            {childrenList.map((c: Child) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
        <Field label="Mood (1-5)">
          <input type="number" min={1} max={5} value={data.mood} onChange={(e) => setData({ ...data, mood: parseInt(e.target.value) })} className="form-input" />
        </Field>
      </div>
      <Field label="What worked" className="block mb-3">
        <textarea value={data.whatWorked} onChange={(e) => setData({ ...data, whatWorked: e.target.value })} className="form-input min-h-[60px]" />
      </Field>
      <Field label="What didn't" className="block mb-3">
        <textarea value={data.whatDidnt} onChange={(e) => setData({ ...data, whatDidnt: e.target.value })} className="form-input min-h-[60px]" />
      </Field>
      <Field label="Tomorrow, try…" className="block mb-3">
        <textarea value={data.tomorrowAdjust} onChange={(e) => setData({ ...data, tomorrowAdjust: e.target.value })} className="form-input min-h-[60px]" />
      </Field>
      <div className="flex gap-2 mt-4">
        <button onClick={save} disabled={saving} className="px-4 py-2 bg-accent text-cream rounded text-sm font-semibold disabled:opacity-50">
          {saving ? 'Saving…' : 'Save reflection'}
        </button>
        <button onClick={onCancel} className="px-4 py-2 border border-rule rounded text-sm text-ink-soft">Cancel</button>
      </div>
    </div>
  );
}

// ============================================================================
// PROGRESS TAB
// ============================================================================
function ProgressTab({ childrenList, terms, termProgress, lessons }: any) {
  const [progressRows, setProgressRows] = useState<SequenceProgressRow[]>([]);

  async function loadProgress() {
    const res = await fetch('/api/sequence-progress');
    if (!res.ok) return;
    const j = await res.json();
    setProgressRows((j.rows ?? []) as SequenceProgressRow[]);
  }
  useEffect(() => { loadProgress(); }, []);

  return (
    <div>
      <SectionHeader eyebrow="Tracking" title="Per-Child Progress" subtitle="Long-arc view across terms." />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {childrenList.map((child: Child) => {
          const colors = COLOR_MAP[child.colorKey] ?? COLOR_MAP.terracotta;
          const total = termProgress.filter((p: TermProgress) => p.childId === child.id).reduce((s: number, p: TermProgress) => s + p.lessonsComplete, 0);
          const lessonCount = lessons.filter((l: Lesson) => l.childId === child.id).length;
          const childRows = progressRows.filter((r) => r.childId === child.id);
          return (
            <div key={child.id} className="bg-cream border rounded-xl p-5"
              style={{ borderColor: colors.swatch + '66' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center font-display font-semibold text-cream"
                  style={{ background: colors.swatch }}>{child.name.charAt(0)}</div>
                <div>
                  <div className="font-display text-lg font-semibold leading-none">{child.name}</div>
                  <div className="text-[10px] text-ink-muted uppercase tracking-wider mt-1">Age {child.age} · {child.grade}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="rounded p-2" style={{ background: colors.soft }}>
                  <div className="text-[9px] uppercase tracking-wider text-ink-muted font-semibold">Logged lessons</div>
                  <div className="font-display text-xl font-semibold" style={{ color: colors.swatch }}>{lessonCount}</div>
                </div>
                <div className="rounded p-2" style={{ background: colors.soft }}>
                  <div className="text-[9px] uppercase tracking-wider text-ink-muted font-semibold">Term total</div>
                  <div className="font-display text-xl font-semibold" style={{ color: colors.swatch }}>{total}</div>
                </div>
              </div>

              {childRows.length > 0 && (
                <div className="mb-3">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted mb-1.5">Next Lessons</div>
                  <div className="space-y-2">
                    {childRows.map((row) => (
                      <NextLessonCard key={row.assignmentId} row={row} onAdvanced={loadProgress} />
                    ))}
                  </div>
                </div>
              )}

              <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted mb-1.5">Curriculum Path</div>
              <div className="flex flex-wrap gap-1">
                {(CURRICULUM_TRACKS[child.colorKey] ?? []).map((step, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded"
                    style={{ background: i === 0 ? colors.swatch : colors.soft, color: i === 0 ? '#FAF6EF' : '#2D2418' }}>
                    {step}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// AUDIT TAB
// ============================================================================
function AuditTab() {
  const [logs, setLogs] = useState<any[]>([]);
  useEffect(() => {
    fetch('/api/audit?limit=200').then(r => r.json()).then(d => setLogs(d.logs ?? []));
  }, []);
  return (
    <div>
      <SectionHeader eyebrow="History" title="Audit Log" subtitle="Every meaningful change. Both you and your wife. Last 200 events." />
      <div className="space-y-1 text-sm font-mono">
        {logs.map(l => (
          <div key={l.id} className="bg-cream border border-rule rounded px-3 py-2 flex items-center gap-3">
            <span className="text-[10px] text-ink-muted w-32">{new Date(l.createdAt).toLocaleString()}</span>
            <span className="text-xs text-ink-soft w-32 truncate">{l.user?.email ?? 'system'}</span>
            <span className="text-xs font-semibold">{l.action}</span>
            <span className="text-xs text-ink-muted">{l.entityType}</span>
          </div>
        ))}
        {logs.length === 0 && <div className="text-center py-12 text-ink-muted">No audit events yet.</div>}
      </div>
    </div>
  );
}

// ============================================================================
// NOTES TAB
// ============================================================================
function NotesTab({ state, setState }: any) {
  return (
    <div>
      <SectionHeader eyebrow="Strategy & Reference" title="Notes" subtitle="Free-form scratch space. Both adults edit live." />
      <textarea value={state.notes ?? ''} onChange={(e) => setState({ ...state, notes: e.target.value })}
        className="form-input min-h-[400px] w-full" placeholder="Anything: weekly reflections, kid milestones, curriculum tweaks…" />
    </div>
  );
}

// ============================================================================
// SHARED
// ============================================================================
function SectionHeader({ eyebrow, title, subtitle }: any) {
  return (
    <div className="mb-6 pb-5 border-b border-rule">
      <div className="text-[10px] text-ink-muted uppercase tracking-widest font-semibold mb-1">{eyebrow}</div>
      <div className="font-display text-3xl font-semibold leading-tight mb-1">{title}</div>
      <div className="text-sm text-ink-soft max-w-3xl">{subtitle}</div>
    </div>
  );
}

// Inject form-input class via globals.css under @layer components
