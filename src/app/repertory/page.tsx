'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase/client';

// ─── Data Types ────────────────────────────────────────────────────────────────
interface RemedyEntry {
  name: string;
  abbrev: string;
  grade: 1 | 2 | 3;
}

interface RubricEntry {
  id: string;
  rubric: string;
  chapter: string;
  chapterId: number;
  fullpath: string;
  remedies: RemedyEntry[];
  remediesLoaded: boolean;
  remediesLoading: boolean;
}

interface ChapterEntry {
  id: number;
  abbrev: string;
  textt: string;
}

interface SelectedRubric {
  id: string;
  fullpath: string;
  chapter: string;
}

interface AggregatedRemedy {
  abbrev: string;
  name: string;
  totalScore: number;
  rubricCount: number;
}

// ─── Utility: highlight matched text ──────────────────────────────────────────
const highlightText = (text: string, query: string): React.ReactNode => {
  if (!query.trim()) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="search-highlight">
        {part}
      </mark>
    ) : (
      part
    )
  );
};

// ─── Remedy Badge ──────────────────────────────────────────────────────────────
const RemedyBadge: React.FC<{ remedy: RemedyEntry; query: string }> = ({ remedy, query }) => (
  <span
    className={`inline-flex items-center px-1.5 py-0 rounded text-xs cursor-default ${
      remedy.grade === 3 ? 'grade-3' : remedy.grade === 2 ? 'grade-2' : 'grade-1'
    }`}
    title={`${remedy.name} — Grade ${remedy.grade}`}
    style={{ fontSize: '11px', lineHeight: '18px' }}
  >
    {highlightText(remedy.abbrev, query)}
  </span>
);

// ─── Rubric Row ────────────────────────────────────────────────────────────────
const RubricRow: React.FC<{
  entry: RubricEntry;
  isOpen: boolean;
  onToggle: () => void;
  query: string;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
}> = ({ entry, isOpen, onToggle, query, isSelected, onSelect }) => {
  return (
    <div
      className={`rubric-item border-b last:border-b-0 ${isOpen ? 'open' : ''}`}
      style={{
        borderColor: 'var(--border-subtle)',
        backgroundColor: isSelected ? 'var(--accent-light)' : undefined,
      }}
    >
      <div className="flex items-stretch">
        <button
          onClick={onSelect}
          className="flex-shrink-0 flex items-center justify-center transition-colors hover:opacity-80 active:opacity-60"
          style={{
            width: '44px',
            borderRight: '1px solid var(--border-subtle)',
            backgroundColor: isSelected ? 'rgba(45,106,106,0.15)' : 'transparent',
            minHeight: '40px',
          }}
          title={isSelected ? 'Remove from case' : 'Add to case analysis'}
          aria-label={isSelected ? 'Remove from case' : 'Add to case analysis'}
        >
          <div
            className="w-3.5 h-3.5 rounded-sm flex items-center justify-center transition-all"
            style={{
              border: isSelected
                ? '1.5px solid var(--accent-primary)'
                : '1.5px solid var(--border-medium)',
              backgroundColor: isSelected ? 'var(--accent-primary)' : 'transparent',
            }}
          >
            {isSelected && (
              <svg width="7" height="5" viewBox="0 0 9 7" fill="none">
                <path
                  d="M1 3.5L3.5 6L8 1"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
        </button>

        <button
          onClick={onToggle}
          className="flex-1 flex items-center justify-between px-3 text-left transition-colors hover:opacity-80 active:opacity-60 focus-visible:outline-none"
          style={{ backgroundColor: 'transparent', minHeight: '40px' }}
          aria-expanded={isOpen}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0 py-1">
            <span
              className="font-mono leading-snug"
              style={{ color: 'var(--text-primary)', fontSize: '12px', wordBreak: 'break-word' }}
            >
              {highlightText(entry.fullpath || entry.rubric, query)}
            </span>
            {entry.remediesLoaded && (
              <span
                className="flex-shrink-0 px-1.5 rounded-full font-medium"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text-muted)',
                  fontSize: '10px',
                  lineHeight: '16px',
                }}
              >
                {entry.remedies.length}
              </span>
            )}
          </div>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="rubric-chevron flex-shrink-0 ml-2"
            style={{ color: 'var(--text-muted)' }}
            aria-hidden="true"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      </div>

      <div className="rubric-content">
        <div className="px-3 pb-2 pt-1">
          {entry.remediesLoading && (
            <div className="flex items-center gap-1.5 py-1">
              <div
                className="w-3 h-3 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: 'var(--accent-primary)', borderTopColor: 'transparent' }}
              />
              <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Loading…</span>
            </div>
          )}
          {entry.remediesLoaded && entry.remedies.length === 0 && (
            <p style={{ color: 'var(--text-muted)', fontSize: '11px' }} className="py-1">
              No remedies listed.
            </p>
          )}
          {entry.remediesLoaded && entry.remedies.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-0.5">
              {entry.remedies
                .sort((a, b) => b.grade - a.grade)
                .map((remedy, idx) => (
                  <RemedyBadge key={`${remedy.abbrev}-${idx}`} remedy={remedy} query={query} />
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Chapter Accordion ─────────────────────────────────────────────────────────
const ChapterSection: React.FC<{
  chapter: string;
  entries: RubricEntry[];
  openRubrics: Set<string>;
  onToggleRubric: (id: string) => void;
  query: string;
  defaultOpen?: boolean;
  selectedRubricIds: Set<string>;
  onSelectRubric: (entry: RubricEntry, e: React.MouseEvent) => void;
}> = ({
  chapter,
  entries,
  openRubrics,
  onToggleRubric,
  query,
  defaultOpen = false,
  selectedRubricIds,
  onSelectRubric,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  useEffect(() => {
    if (query) setIsOpen(true);
  }, [query]);

  if (entries.length === 0) return null;

  return (
    <div
      className={`chapter-item rounded-lg overflow-hidden mb-1.5 ${isOpen ? 'open' : ''}`}
      style={{
        border: '1px solid var(--border-subtle)',
        backgroundColor: 'var(--bg-elevated)',
      }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 text-left transition-colors hover:opacity-80 active:opacity-60 focus-visible:outline-none"
        style={{ minHeight: '40px' }}
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-5 h-5 rounded flex items-center justify-center font-bold flex-shrink-0"
            style={{
              backgroundColor: 'var(--accent-light)',
              color: 'var(--accent-primary)',
              fontSize: '9px',
            }}
          >
            {chapter.slice(0, 2).toUpperCase()}
          </div>
          <span
            className="font-semibold font-display"
            style={{ color: 'var(--text-primary)', fontSize: '12px' }}
          >
            {chapter}
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{entries.length}</span>
        </div>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="chapter-chevron"
          style={{ color: 'var(--text-muted)' }}
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      <div className="chapter-content">
        <div className="border-t" style={{ borderColor: 'var(--border-subtle)' }}>
          {entries.map((entry) => (
            <RubricRow
              key={entry.id}
              entry={entry}
              isOpen={openRubrics.has(entry.id)}
              onToggle={() => onToggleRubric(entry.id)}
              query={query}
              isSelected={selectedRubricIds.has(entry.id)}
              onSelect={(e) => onSelectRubric(entry, e)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Repertorization Panel content ────────────────────────────────────────────
const RepertorizationPanelContent: React.FC<{
  selectedRubrics: SelectedRubric[];
  aggregatedRemedies: AggregatedRemedy[];
  isAnalyzing: boolean;
  onRemoveRubric: (id: string) => void;
  onClearAll: () => void;
  onClose?: () => void;
}> = ({
  selectedRubrics,
  aggregatedRemedies,
  isAnalyzing,
  onRemoveRubric,
  onClearAll,
  onClose,
}) => {
  const totalSelected = selectedRubrics.length;

  return (
    <div className="flex flex-col h-full">
      {/* Panel header */}
      <div
        className="px-3 py-2 flex items-center justify-between flex-shrink-0"
        style={{ backgroundColor: 'var(--accent-primary)' }}
      >
        <div className="flex items-center gap-1.5">
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
          </svg>
          <span
            className="font-bold uppercase tracking-widest text-white"
            style={{ fontSize: '10px' }}
          >
            Case Analysis
          </span>
          {totalSelected > 0 && (
            <span
              className="font-bold bg-white rounded-full px-1.5"
              style={{ color: 'var(--accent-primary)', fontSize: '10px', lineHeight: '16px' }}
            >
              {totalSelected}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {totalSelected > 0 && (
            <button
              onClick={onClearAll}
              className="text-white opacity-70 hover:opacity-100 transition-opacity font-medium"
              style={{ fontSize: '10px' }}
            >
              Clear all
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="text-white opacity-70 hover:opacity-100 transition-opacity ml-1"
              aria-label="Close panel"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="overflow-y-auto flex-1">
        {totalSelected === 0 && (
          <div className="px-3 py-5 text-center">
            <p
              className="font-medium mb-0.5"
              style={{ color: 'var(--text-primary)', fontSize: '12px' }}
            >
              No rubrics selected
            </p>
            <p
              className="leading-relaxed"
              style={{ color: 'var(--text-secondary)', fontSize: '11px' }}
            >
              Tap ☑ next to any rubric to add it to case analysis.
            </p>
          </div>
        )}

        {totalSelected > 0 && (
          <div className="px-3 py-2 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
            <p
              className="font-semibold mb-1"
              style={{ color: 'var(--text-muted)', fontSize: '10px', letterSpacing: '0.05em' }}
            >
              SELECTED RUBRICS
            </p>
            <div className="space-y-0.5">
              {selectedRubrics.map((r) => (
                <div key={r.id} className="flex items-start gap-1.5 group">
                  <button
                    onClick={() => onRemoveRubric(r.id)}
                    className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center opacity-50 active:opacity-100 transition-opacity"
                    style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-muted)' }}
                    title="Remove"
                    aria-label="Remove rubric"
                  >
                    <svg
                      width="7"
                      height="7"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    >
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                  <span
                    className="font-mono leading-snug"
                    style={{ color: 'var(--text-secondary)', fontSize: '11px' }}
                  >
                    {r.fullpath}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {totalSelected > 0 && (
          <div className="px-3 py-2">
            <p
              className="font-semibold mb-1.5"
              style={{ color: 'var(--text-muted)', fontSize: '10px', letterSpacing: '0.05em' }}
            >
              RANKED REMEDIES
            </p>

            {isAnalyzing && (
              <div className="flex items-center gap-1.5 py-2">
                <div
                  className="w-3 h-3 rounded-full border-2 border-t-transparent animate-spin flex-shrink-0"
                  style={{ borderColor: 'var(--accent-primary)', borderTopColor: 'transparent' }}
                />
                <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Analysing…</span>
              </div>
            )}

            {!isAnalyzing && aggregatedRemedies.length === 0 && (
              <p style={{ color: 'var(--text-muted)', fontSize: '11px' }} className="py-1">
                No common remedies found.
              </p>
            )}

            {!isAnalyzing && aggregatedRemedies.length > 0 && (
              <div>
                {aggregatedRemedies.slice(0, 30).map((rem, idx) => {
                  const coveragePct = Math.round((rem.rubricCount / totalSelected) * 100);
                  const maxScore = aggregatedRemedies[0]?.totalScore || 1;
                  const barWidth = Math.round((rem.totalScore / maxScore) * 100);

                  return (
                    <div key={rem.abbrev} className="flex items-center gap-1.5 py-1">
                      <span
                        className="flex-shrink-0 w-4 text-right font-mono"
                        style={{ color: 'var(--text-muted)', fontSize: '10px' }}
                      >
                        {idx + 1}
                      </span>
                      <span
                        className="font-bold font-mono w-16 truncate flex-shrink-0"
                        style={{ color: 'var(--accent-primary)', fontSize: '11px' }}
                        title={rem.name}
                      >
                        {rem.abbrev}
                      </span>
                      <div
                        className="flex-1 h-1 rounded-full overflow-hidden"
                        style={{ backgroundColor: 'var(--bg-card)' }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${barWidth}%`,
                            backgroundColor:
                              coveragePct === 100
                                ? 'var(--accent-primary)'
                                : 'var(--border-medium)',
                          }}
                        />
                      </div>
                      <span
                        className="flex-shrink-0 font-semibold w-5 text-right"
                        style={{ color: 'var(--text-primary)', fontSize: '11px' }}
                      >
                        {rem.totalScore}
                      </span>
                      <span
                        className="flex-shrink-0 rounded-full px-1 text-center"
                        style={{
                          backgroundColor:
                            coveragePct === 100 ? 'var(--accent-primary)' : 'var(--bg-card)',
                          color: coveragePct === 100 ? 'white' : 'var(--text-muted)',
                          fontSize: '9px',
                          lineHeight: '14px',
                          minWidth: '24px',
                        }}
                      >
                        {rem.rubricCount}/{totalSelected}
                      </span>
                    </div>
                  );
                })}
                {aggregatedRemedies.length > 30 && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '10px' }} className="pt-1">
                    +{aggregatedRemedies.length - 30} more
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Desktop Sidebar Panel ─────────────────────────────────────────────────────
const RepertorizationPanel: React.FC<{
  selectedRubrics: SelectedRubric[];
  aggregatedRemedies: AggregatedRemedy[];
  isAnalyzing: boolean;
  onRemoveRubric: (id: string) => void;
  onClearAll: () => void;
}> = (props) => (
  <div
    className="rounded-lg overflow-hidden flex flex-col h-full"
    style={{
      border: '1px solid var(--accent-primary)',
      backgroundColor: 'var(--bg-elevated)',
    }}
  >
    <RepertorizationPanelContent {...props} />
  </div>
);

// ─── Mobile Bottom Sheet ───────────────────────────────────────────────────────
const MobileDrawer: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  selectedRubrics: SelectedRubric[];
  aggregatedRemedies: AggregatedRemedy[];
  isAnalyzing: boolean;
  onRemoveRubric: (id: string) => void;
  onClearAll: () => void;
}> = ({ isOpen, onClose, ...panelProps }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 transition-opacity duration-300"
        style={{
          backgroundColor: 'rgba(0,0,0,0.5)',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
        }}
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl overflow-hidden flex flex-col transition-transform duration-300"
        style={{
          backgroundColor: 'var(--bg-elevated)',
          border: '1px solid var(--accent-primary)',
          borderBottom: 'none',
          height: '75vh',
          transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Case Analysis"
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-2 pb-1 flex-shrink-0">
          <div
            className="w-10 h-1 rounded-full"
            style={{ backgroundColor: 'var(--border-medium)' }}
          />
        </div>
        <RepertorizationPanelContent {...panelProps} onClose={onClose} />
      </div>
    </>
  );
};

// ─── Main Repertory Component ──────────────────────────────────────────────────
export default function RepertoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeChapter, setActiveChapter] = useState<number | null>(null);
  const [openRubrics, setOpenRubrics] = useState<Set<string>>(new Set());
  const [rubrics, setRubrics] = useState<RubricEntry[]>([]);
  const [chapters, setChapters] = useState<ChapterEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [chaptersLoading, setChaptersLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Repertorization state
  const [selectedRubrics, setSelectedRubrics] = useState<SelectedRubric[]>([]);
  const [remedyCache, setRemedyCache] = useState<
    Map<string, Array<{ abbrev: string; name: string; weight: number }>>
  >(new Map());
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const searchRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load chapters
  useEffect(() => {
    const loadChapters = async () => {
      setChaptersLoading(true);
      const { data, error } = await supabase
        .from('chapter')
        .select('id, abbrev, textt')
        .order('id', { ascending: true });
      if (!error) setChapters(data || []);
      setChaptersLoading(false);
    };
    loadChapters();
  }, []);

  // Load rubrics
  useEffect(() => {
    const loadRubrics = async () => {
      setLoading(true);
      setError(null);
      try {
        let query = supabase
          .from('rubric')
          .select('id, textt, fullpath, chapterid, abbrev')
          .limit(50);
        if (activeChapter !== null) query = query.eq('chapterid', activeChapter);
        if (debouncedQuery.trim()) {
          const q = `%${debouncedQuery.trim()}%`;
          query = query.or(`textt.ilike.${q},fullpath.ilike.${q}`);
        }
        query = query.order('id', { ascending: true });
        const { data, error: queryError } = await query;
        if (queryError) {
          setError(queryError.message);
          setRubrics([]);
        } else {
          const mapped: RubricEntry[] = (data || []).map((row) => {
            const chapterInfo = chapters.find((c) => c.id === row.chapterid);
            return {
              id: String(row.id),
              rubric: row.textt || '',
              chapter: chapterInfo?.textt || String(row.chapterid),
              chapterId: row.chapterid,
              fullpath: row.fullpath || row.textt || '',
              remedies: [],
              remediesLoaded: false,
              remediesLoading: false,
            };
          });
          setRubrics(mapped);
          setOpenRubrics(new Set());
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to load rubrics');
        setRubrics([]);
      } finally {
        setLoading(false);
      }
    };
    if (!chaptersLoading) loadRubrics();
  }, [debouncedQuery, activeChapter, chaptersLoading]);

  // Fetch remedies for a rubric ID
  const fetchRemediesForRubric = useCallback(
    async (rubricId: string): Promise<Array<{ abbrev: string; name: string; weight: number }>> => {
      if (remedyCache.has(rubricId)) return remedyCache.get(rubricId)!;

      const { data, error: remError } = await supabase
        .from('rubricremedy')
        .select('remedyid, weight')
        .eq('rubricid', parseInt(rubricId))
        .order('weight', { ascending: false });

      if (remError || !data || data.length === 0) return [];

      const remedyIds = data.map((row) => row.remedyid);
      const { data: remedyData, error: remedyError } = await supabase
        .from('remedy')
        .select('id, nameabbrev, namelong')
        .in('id', remedyIds);

      if (remedyError) return [];

      const remedyMap = new Map((remedyData || []).map((r) => [r.id, r]));
      const result = data.map((row) => {
        const rem = remedyMap.get(row.remedyid);
        return {
          abbrev: rem?.nameabbrev || String(row.remedyid),
          name: rem?.namelong || rem?.nameabbrev || String(row.remedyid),
          weight: Math.min(Math.max(row.weight, 1), 3),
        };
      });

      setRemedyCache((prev) => new Map(prev).set(rubricId, result));
      return result;
    },
    [remedyCache, supabase]
  );

  // Toggle rubric accordion open/close + lazy-load remedies
  const toggleRubric = useCallback(
    async (id: string) => {
      setOpenRubrics((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });

      const rubric = rubrics.find((r) => r.id === id);
      if (!rubric || rubric.remediesLoaded || rubric.remediesLoading) return;

      setRubrics((prev) => prev.map((r) => (r.id === id ? { ...r, remediesLoading: true } : r)));

      try {
        const result = await fetchRemediesForRubric(id);
        const remedies: RemedyEntry[] = result.map((r) => ({
          name: r.name,
          abbrev: r.abbrev,
          grade: r.weight as 1 | 2 | 3,
        }));
        setRubrics((prev) =>
          prev.map((r) =>
            r.id === id ? { ...r, remedies, remediesLoaded: true, remediesLoading: false } : r
          )
        );
      } catch {
        setRubrics((prev) =>
          prev.map((r) =>
            r.id === id ? { ...r, remediesLoading: false, remediesLoaded: true } : r
          )
        );
      }
    },
    [rubrics, fetchRemediesForRubric]
  );

  // Select/deselect a rubric for case analysis
  const handleSelectRubric = useCallback(
    async (entry: RubricEntry, e: React.MouseEvent) => {
      e.stopPropagation();
      const alreadySelected = selectedRubrics.some((r) => r.id === entry.id);

      if (alreadySelected) {
        setSelectedRubrics((prev) => prev.filter((r) => r.id !== entry.id));
        return;
      }

      setSelectedRubrics((prev) => [
        ...prev,
        { id: entry.id, fullpath: entry.fullpath || entry.rubric, chapter: entry.chapter },
      ]);

      if (!remedyCache.has(entry.id)) {
        setIsAnalyzing(true);
        await fetchRemediesForRubric(entry.id);
        setIsAnalyzing(false);
      }
    },
    [selectedRubrics, remedyCache, fetchRemediesForRubric]
  );

  const handleRemoveRubric = useCallback((id: string) => {
    setSelectedRubrics((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const handleClearAll = useCallback(() => {
    setSelectedRubrics([]);
  }, []);

  // Aggregate remedies across all selected rubrics
  const aggregatedRemedies = useMemo<AggregatedRemedy[]>(() => {
    if (selectedRubrics.length === 0) return [];

    const scoreMap = new Map<string, { name: string; totalScore: number; rubricCount: number }>();

    for (const sr of selectedRubrics) {
      const remedies = remedyCache.get(sr.id) || [];
      for (const rem of remedies) {
        const existing = scoreMap.get(rem.abbrev);
        if (existing) {
          existing.totalScore += rem.weight;
          existing.rubricCount += 1;
        } else {
          scoreMap.set(rem.abbrev, {
            name: rem.name,
            totalScore: rem.weight,
            rubricCount: 1,
          });
        }
      }
    }

    return Array.from(scoreMap.entries())
      .map(([abbrev, data]) => ({ abbrev, ...data }))
      .sort((a, b) => b.totalScore - a.totalScore || b.rubricCount - a.rubricCount);
  }, [selectedRubrics, remedyCache]);

  const selectedRubricIds = useMemo(
    () => new Set(selectedRubrics.map((r) => r.id)),
    [selectedRubrics]
  );

  // Group rubrics by chapter name
  const groupedData = useMemo(() => {
    const groups: Record<string, RubricEntry[]> = {};
    rubrics.forEach((entry) => {
      if (!groups[entry.chapter]) groups[entry.chapter] = [];
      groups[entry.chapter].push(entry);
    });
    return groups;
  }, [rubrics]);

  const resultCount = rubrics.length;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === 'Escape') {
        if (drawerOpen) {
          setDrawerOpen(false);
        } else {
          setSearchQuery('');
          searchRef.current?.blur();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [drawerOpen]);

  const panelProps = {
    selectedRubrics,
    aggregatedRemedies,
    isAnalyzing,
    onRemoveRubric: handleRemoveRubric,
    onClearAll: handleClearAll,
  };

  return (
    // Fixed viewport — no page scroll
    <div
      className="flex flex-col w-full"
      style={{ height: '100dvh', backgroundColor: 'var(--bg-primary)', overflow: 'hidden' }}
    >
      {/* ── Slim fixed header ─────────────────────────────────────────── */}
      <header
        className="flex-shrink-0 flex items-center gap-3 px-4 lg:px-6 border-b"
        style={{
          height: '44px',
          minHeight: '44px',
          borderColor: 'var(--border-subtle)',
          backgroundColor: 'var(--bg-primary)',
        }}
      >
        {/* App name */}
        <span
          className="font-display font-semibold flex-shrink-0"
          style={{ color: 'var(--text-primary)', fontSize: '14px' }}
        >
          RubricRepertory
        </span>

        {/* Search bar — fills available space */}
        <div
          className="flex items-center gap-2 px-2.5 py-1 rounded-lg transition-all duration-200 focus-within:ring-1 flex-1 min-w-0"
          style={
            {
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border-medium)',
              '--tw-ring-color': 'var(--accent-primary)',
            } as React.CSSProperties
          }
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: 'var(--text-muted)', flexShrink: 0 }}
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            ref={searchRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search rubrics — anxiety, vertigo, pain head…"
            className="flex-1 bg-transparent outline-none placeholder:opacity-40 min-w-0"
            style={{ color: 'var(--text-primary)', fontSize: '13px' }}
            aria-label="Search rubrics"
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center hover:opacity-80"
              style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-muted)' }}
              aria-label="Clear search"
            >
              <svg
                width="8"
                height="8"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          ) : (
            <kbd
              className="hidden sm:flex items-center px-1.5 py-0.5 rounded flex-shrink-0"
              style={{
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-muted)',
                border: '1px solid var(--border-subtle)',
                fontSize: '10px',
              }}
            >
              ⌘K
            </kbd>
          )}
        </div>

        {/* Right: clear + theme toggle */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {(searchQuery || activeChapter !== null) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveChapter(null);
              }}
              className="font-medium px-2 py-1 rounded hover:opacity-80"
              style={{
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)',
                fontSize: '11px',
              }}
            >
              Clear
            </button>
          )}
        </div>
      </header>

      {/* ── Chapter filter chips bar ───────────────────────────────────── */}
      <div
        className="flex-shrink-0 border-b px-3 py-1.5"
        style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-primary)' }}
      >
        <div
          className="flex gap-1 overflow-x-auto"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {chaptersLoading ? (
            <span style={{ color: 'var(--text-muted)', fontSize: '11px' }} className="px-2 py-1">
              Loading…
            </span>
          ) : (
            chapters.map((ch) => (
              <button
                key={ch.id}
                onClick={() => setActiveChapter(activeChapter === ch.id ? null : ch.id)}
                className={`flex-shrink-0 px-2.5 py-1 rounded-full font-medium transition-all duration-200 ${
                  activeChapter === ch.id ? 'filter-chip-active' : ''
                }`}
                style={
                  activeChapter === ch.id
                    ? { fontSize: '11px' }
                    : {
                        backgroundColor: 'var(--bg-card)',
                        color: 'var(--text-secondary)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '11px',
                      }
                }
              >
                {ch.textt || ch.abbrev}
              </button>
            ))
          )}
        </div>
      </div>

      {/* ── Scrollable content area — fills remaining height ──────────── */}
      <div className="flex-1 overflow-hidden min-w-0">
        <div className="px-3 h-full flex flex-col min-w-0">
          {/* Error */}
          {error && (
            <div
              className="flex-shrink-0 rounded-lg px-3 py-2 my-2 text-xs"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
              }}
            >
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Two-column layout — each column scrolls independently */}
          <div className="flex gap-4 flex-1 overflow-hidden py-2 min-w-0">
            {/* ── Left: Rubric list ─────────────────────────────────── */}
            <div className="flex-1 min-w-0 overflow-y-auto">
              {loading && (
                <div className="flex items-center justify-center py-16 gap-2">
                  <div
                    className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
                    style={{ borderColor: 'var(--accent-primary)', borderTopColor: 'transparent' }}
                  />
                  <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                    Searching repertory…
                  </span>
                </div>
              )}

              {!loading && !error && resultCount === 0 && (
                <div className="text-center py-16 space-y-2">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto"
                    style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)' }}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.35-4.35" />
                    </svg>
                  </div>
                  <h2
                    className="font-display font-semibold"
                    style={{ color: 'var(--text-primary)', fontSize: '14px' }}
                  >
                    No rubrics found
                  </h2>
                  <p
                    className="max-w-xs mx-auto"
                    style={{ color: 'var(--text-secondary)', fontSize: '12px' }}
                  >
                    {debouncedQuery
                      ? `No results for "${debouncedQuery}". Try a different term.`
                      : 'Type a search term above to explore the repertory.'}
                  </p>
                  {(searchQuery || activeChapter !== null) && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setActiveChapter(null);
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full font-semibold mt-1 transition-colors hover:opacity-90"
                      style={{
                        backgroundColor: 'var(--accent-primary)',
                        color: 'white',
                        fontSize: '12px',
                      }}
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              )}

              {!loading && !error && resultCount > 0 && (
                <>
                  {/* Grade legend */}
                  <div
                    className="flex items-center gap-2 sm:gap-3 flex-wrap mb-2 px-3 py-1.5 rounded-lg"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <span
                      className="font-medium"
                      style={{ color: 'var(--text-muted)', fontSize: '10px' }}
                    >
                      Grades:
                    </span>
                    <span className="grade-3 px-1.5 rounded" style={{ fontSize: '10px' }}>
                      G3 bold
                    </span>
                    <span className="grade-2 px-1.5 rounded" style={{ fontSize: '10px' }}>
                      G2 italic
                    </span>
                    <span className="grade-1 px-1.5 rounded" style={{ fontSize: '10px' }}>
                      G1 plain
                    </span>
                    <span
                      className="ml-auto hidden sm:inline"
                      style={{ color: 'var(--text-muted)', fontSize: '10px' }}
                    >
                      ☑ checkbox → add to case
                    </span>
                  </div>

                  {Object.entries(groupedData).map(([chapter, entries], index) => (
                    <ChapterSection
                      key={chapter}
                      chapter={chapter}
                      entries={entries}
                      openRubrics={openRubrics}
                      onToggleRubric={toggleRubric}
                      query={debouncedQuery}
                      defaultOpen={index === 0 || !!debouncedQuery}
                      selectedRubricIds={selectedRubricIds}
                      onSelectRubric={handleSelectRubric}
                    />
                  ))}
                </>
              )}
            </div>

            {/* ── Right: Case Analysis panel (desktop only, scrolls independently) */}
            <div className="hidden lg:flex flex-shrink-0 w-96 xl:w-[26rem] overflow-hidden">
              <RepertorizationPanel {...panelProps} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Slim fixed footer ─────────────────────────────────────────── */}
      <Footer />

      {/* ── Mobile FAB ────────────────────────────────────────────────── */}
      <div className="lg:hidden fixed bottom-6 right-4 z-30">
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-2 px-4 py-3 rounded-full shadow-lg font-semibold transition-all duration-200 active:scale-95"
          style={{
            backgroundColor: 'var(--accent-primary)',
            color: 'white',
            fontSize: '13px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
          }}
          aria-label="Open Case Analysis"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
          </svg>
          <span>Case Analysis</span>
          {selectedRubrics.length > 0 && (
            <span
              className="font-bold rounded-full px-1.5 py-0"
              style={{
                backgroundColor: 'white',
                color: 'var(--accent-primary)',
                fontSize: '11px',
                lineHeight: '18px',
              }}
            >
              {selectedRubrics.length}
            </span>
          )}
        </button>
      </div>

      {/* ── Mobile bottom sheet ───────────────────────────────────────── */}
      <MobileDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} {...panelProps} />
    </div>
  );
}
