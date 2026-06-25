'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FormEvent, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import {
  Bot,
  ExternalLink,
  MessageCircle,
  Send,
  Sparkles,
  UserRound,
  X,
} from 'lucide-react';
import {
  parseStoredSession,
  QSENTIA_SESSION_KEY,
  QSENTIA_SESSION_EVENT,
  type QsentiaUserSession,
} from '@/lib/clientSession';
import { fmtDollar, fmtNum, fmtPct } from '@/lib/metrics';

type DashboardPayload = {
  selectedModel?: string;
  latest?: {
    portfolioValue?: number | null;
    portfolioReturn?: number | null;
    paperStatus?: string | null;
  };
  stats?: {
    totalReturn?: number | null;
    sharpe?: number | null;
    maxDrawdown?: number | null;
    hitRate?: number | null;
    nObservations?: number | null;
    nReturns?: number | null;
  };
  modelComparison?: Array<{
    id?: string;
    name?: string;
    latestValue?: number | null;
    dailyRowCount?: number | null;
    stats?: {
      totalReturn?: number | null;
      sharpe?: number | null;
      maxDrawdown?: number | null;
      hitRate?: number | null;
    };
  }>;
  benchmarks?: Array<{ name?: string; ticker?: string; rowCount?: number | null }>;
  debug?: {
    summaryOnly?: boolean;
    rowCounts?: Record<string, number>;
  };
};

type ModelResponse = {
  models?: Array<{
    id: string;
    name: string;
    slug: string;
    category: string;
    performance: {
      sharpeRatio: number | null;
      annualizedReturn: number | null;
      maxDrawdown: number | null;
      winRate: number | null;
    };
  }>;
};

type AssistantMessage = {
  id: string;
  role: 'alex' | 'user';
  body: string;
  links?: Array<{ href: string; label: string }>;
};

const sitePages = [
  {
    href: '/',
    label: 'Overview',
    keywords: ['home', 'overview', 'platform', 'product'],
    summary: 'The homepage summarizes QSentia, live registry telemetry, model status, API preview, and source-backed platform modules.',
  },
  {
    href: '/dashboard',
    label: 'Dashboard',
    keywords: ['dashboard', 'equity', 'curve', 'orders', 'positions', 'portfolio', 'telemetry'],
    summary: 'The dashboard is the main operating terminal for portfolio value, equity curves, benchmark data, decisions, positions, orders, and signal tables.',
  },
  {
    href: '/research',
    label: 'Research terminal',
    keywords: ['research', 'terminal', 'ticker', 'ytd', 'daily', 'benchmarks'],
    summary: 'The research terminal shows daily and YTD fund tickers, model and benchmark filters, and normalized curve controls.',
  },
  {
    href: '/mleq',
    label: 'MLEQ engine',
    keywords: ['mleq', 'machine learning', 'engine', 'quant', 'thesis', 'pipeline'],
    summary: 'The MLEQ page explains the Machine Learning Equity Quant layer with live metrics, investment thesis, pipeline workflow, and model review.',
  },
  {
    href: '/marketplace',
    label: 'Marketplace',
    keywords: ['marketplace', 'models', 'products', 'strategies', 'registry'],
    summary: 'The marketplace lists live dashboard-backed model products, categories, performance metrics, tags, and model profile links.',
  },
  {
    href: '/docs',
    label: 'Docs',
    keywords: ['docs', 'api', 'documentation', 'endpoints', 'integration'],
    summary: 'Docs explain the API flow: /api/dashboard, /api/models, model detail, and controlled demo preview endpoints.',
  },
  {
    href: '/contact',
    label: 'Contact',
    keywords: ['contact', 'sales', 'access', 'pricing', 'support', 'help'],
    summary: 'Contact is the route for access requests, support, institutional onboarding, pricing, and questions about model use.',
  },
  {
    href: '/signin',
    label: 'Sign in',
    keywords: ['sign in', 'login', 'account', 'auth'],
    summary: 'Sign in stores a lightweight local user session so the site and Alex can personalize the experience by name.',
  },
  {
    href: '/create-account',
    label: 'Create account',
    keywords: ['create account', 'register', 'onboarding', 'profile'],
    summary: 'Create account captures professional identity, work email, and organization for local onboarding state.',
  },
  {
    href: '/disclaimer',
    label: 'Risk disclaimer',
    keywords: ['risk', 'disclaimer', 'legal', 'investment advice'],
    summary: 'The disclaimer covers risk, paper-trading limitations, no guarantees, and non-advisory positioning.',
  },
];

const quickPrompts = [
  'Summarize live performance',
  'Where is MLEQ?',
  'Explain the dashboard',
  'How do I get access?',
];

function cleanText(value: unknown) {
  return String(value ?? '')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u00e2\u0080[\u0093\u0094]/g, '-')
    .replace(/\u00e2\u0080\u0099/g, "'")
    .replace(/\u00c2/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function firstName(session: QsentiaUserSession | null) {
  return session?.name?.trim().split(/\s+/)[0] || '';
}

function bestModel(data: DashboardPayload | null) {
  return [...(data?.modelComparison || [])]
    .filter((model) => Number.isFinite(Number(model.stats?.totalReturn)))
    .sort((a, b) => Number(b.stats?.totalReturn) - Number(a.stats?.totalReturn))[0];
}

function pageForPath(pathname: string) {
  return sitePages.find((page) => page.href === pathname) || sitePages[0];
}

function subscribeToSession(onStoreChange: () => void) {
  if (typeof window === 'undefined') return () => {};

  window.addEventListener(QSENTIA_SESSION_EVENT, onStoreChange);
  window.addEventListener('storage', onStoreChange);

  return () => {
    window.removeEventListener(QSENTIA_SESSION_EVENT, onStoreChange);
    window.removeEventListener('storage', onStoreChange);
  };
}

function sessionSnapshot() {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(QSENTIA_SESSION_KEY) || '';
}

function serverSessionSnapshot() {
  return '';
}

async function fetchJsonWithTimeout<T>(url: string, timeoutMs: number): Promise<T | null> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      cache: 'no-store',
      signal: controller.signal,
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function formatModelList(models: ModelResponse['models']) {
  if (!models?.length) return 'The model registry is loading or has no available rows right now.';

  return models
    .slice(0, 5)
    .map((model, index) => `${index + 1}. ${cleanText(model.name)} (${model.category})`)
    .join('\n');
}

function liveSummary(data: DashboardPayload | null, models: ModelResponse | null) {
  const top = bestModel(data);
  const stats = data?.stats || {};
  const modelCount = data?.modelComparison?.length || models?.models?.length || 0;

  return [
    `Models: ${modelCount || 'not available'}`,
    `Portfolio value: ${fmtDollar(data?.latest?.portfolioValue)}`,
    `Return: ${fmtPct(stats.totalReturn ?? data?.latest?.portfolioReturn, true)}`,
    `Sharpe: ${fmtNum(stats.sharpe)}`,
    `Max drawdown: ${fmtPct(stats.maxDrawdown, true)}`,
    `Paper status: ${data?.latest?.paperStatus || 'Not available'}`,
    top ? `Top live return: ${cleanText(top.name || top.id)} at ${fmtPct(top.stats?.totalReturn, true)}` : null,
  ]
    .filter(Boolean)
    .join('\n');
}

function answerQuestion({
  question,
  session,
  dashboard,
  models,
  pathname,
}: {
  question: string;
  session: QsentiaUserSession | null;
  dashboard: DashboardPayload | null;
  models: ModelResponse | null;
  pathname: string;
}): AssistantMessage {
  const lower = question.toLowerCase();
  const name = firstName(session);

  if (/(hello|hi|hey|who are you|your name)/.test(lower)) {
    return {
      id: crypto.randomUUID(),
      role: 'alex',
      body: `Hi${name ? ` ${name}` : ''}, I'm Alex. I can help with QSentia pages, MLEQ, dashboards, models, API docs, account access, and live telemetry values.`,
      links: [
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/research', label: 'Research terminal' },
      ],
    };
  }

  if (/(my name|signed in|sign in|login|account|profile)/.test(lower)) {
    return {
      id: crypto.randomUUID(),
      role: 'alex',
      body: session
        ? `You're signed in locally as ${session.name}${session.email ? ` (${session.email})` : ''}. I'll use ${name || session.name} when I address you.`
        : "I do not see a signed-in local session yet. Sign in or create an account and I'll pick up your name automatically.",
      links: session
        ? [{ href: '/dashboard', label: 'Go to dashboard' }]
        : [
            { href: '/signin', label: 'Sign in' },
            { href: '/create-account', label: 'Create account' },
          ],
    };
  }

  if (/(performance|return|sharpe|drawdown|portfolio|live|status|telemetry|best)/.test(lower)) {
    return {
      id: crypto.randomUUID(),
      role: 'alex',
      body: `Here is the current live telemetry snapshot:\n\n${liveSummary(dashboard, models)}`,
      links: [
        { href: '/dashboard', label: 'Open dashboard' },
        { href: '/research', label: 'Research terminal' },
      ],
    };
  }

  if (/(model|strategy|marketplace|product|registry)/.test(lower)) {
    return {
      id: crypto.randomUUID(),
      role: 'alex',
      body: `The marketplace is the model registry. Current visible models include:\n\n${formatModelList(models?.models)}`,
      links: [
        { href: '/marketplace', label: 'View marketplace' },
        { href: '/docs', label: 'API docs' },
      ],
    };
  }

  if (/(mleq|machine learning|quant|engine|thesis|pipeline)/.test(lower)) {
    return {
      id: crypto.randomUUID(),
      role: 'alex',
      body: 'MLEQ is the Machine Learning Equity Quant page. It explains the research engine, shows live model metrics, and connects the thesis to pipeline workflow and execution audit rows.',
      links: [
        { href: '/mleq', label: 'Open MLEQ' },
        { href: '/dashboard', label: 'Live dashboard' },
      ],
    };
  }

  if (/(research|ticker|ytd|daily|curve|benchmark)/.test(lower)) {
    return {
      id: crypto.randomUUID(),
      role: 'alex',
      body: 'The Research terminal contains daily and YTD fund tickers, best/weakest badges, model and benchmark filters, plus normalized equity curve controls.',
      links: [
        { href: '/research', label: 'Open research terminal' },
        { href: '/mleq', label: 'MLEQ engine' },
      ],
    };
  }

  if (/(api|docs|endpoint|integration|developer)/.test(lower)) {
    return {
      id: crypto.randomUUID(),
      role: 'alex',
      body: 'The Docs page explains the main API surface: GET /api/dashboard for telemetry, GET /api/models for the registry, GET /api/models/{slug} for details, and POST /api/models/{slug}/demo for controlled previews.',
      links: [{ href: '/docs', label: 'Open docs' }],
    };
  }

  if (/(pricing|access|support|contact|sales|onboard)/.test(lower)) {
    return {
      id: crypto.randomUUID(),
      role: 'alex',
      body: 'For access, pricing, support, and institutional onboarding, use the Contact page. The account pages can capture a local profile for personalization, but access still routes through QSentia contact/onboarding.',
      links: [
        { href: '/contact', label: 'Contact' },
        { href: '/create-account', label: 'Create account' },
      ],
    };
  }

  if (/(risk|legal|privacy|terms|disclaimer|advice)/.test(lower)) {
    return {
      id: crypto.randomUUID(),
      role: 'alex',
      body: 'QSentia presents telemetry and research workflows, not investment advice. The legal pages cover risk, privacy, terms, and limitations of paper-trading or historical information.',
      links: [
        { href: '/disclaimer', label: 'Disclaimer' },
        { href: '/privacy-policy', label: 'Privacy' },
        { href: '/terms-and-conditions', label: 'Terms' },
      ],
    };
  }

  if (/(where am i|this page|current page|what is here)/.test(lower)) {
    const page = pageForPath(pathname);
    return {
      id: crypto.randomUUID(),
      role: 'alex',
      body: `You are on ${page.label}. ${page.summary}`,
      links: [{ href: page.href, label: page.label }],
    };
  }

  const pageMatch = sitePages.find((page) =>
    page.keywords.some((keyword) => lower.includes(keyword))
  );

  if (pageMatch) {
    return {
      id: crypto.randomUUID(),
      role: 'alex',
      body: `${pageMatch.label}: ${pageMatch.summary}`,
      links: [{ href: pageMatch.href, label: `Open ${pageMatch.label}` }],
    };
  }

  return {
    id: crypto.randomUUID(),
    role: 'alex',
    body: 'I can help with the QSentia website, live dashboard values, model registry, Research terminal, MLEQ engine, API docs, account access, and risk/legal pages. Try asking "summarize live performance" or "where is MLEQ?"',
    links: [
      { href: '/dashboard', label: 'Dashboard' },
      { href: '/marketplace', label: 'Marketplace' },
      { href: '/docs', label: 'Docs' },
    ],
  };
}

export default function AlexAssistant() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [dashboard, setDashboard] = useState<DashboardPayload | null>(null);
  const [models, setModels] = useState<ModelResponse | null>(null);
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname() || '/';
  const sessionVersion = useSyncExternalStore(
    subscribeToSession,
    sessionSnapshot,
    serverSessionSnapshot
  );
  const session = useMemo(() => parseStoredSession(sessionVersion), [sessionVersion]);

  useEffect(() => {
    let cancelled = false;

    async function loadContext() {
      const [dashboardJson, modelsJson] = await Promise.all([
        fetchJsonWithTimeout<DashboardPayload>('/api/dashboard?summary=1', 2800),
        fetchJsonWithTimeout<ModelResponse>('/api/models', 2800),
      ]);

      if (!cancelled) {
        setDashboard(dashboardJson);
        setModels(modelsJson);
      }
    }

    loadContext();
    const id = window.setInterval(loadContext, 60000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  useEffect(() => {
    if (!open || !dashboard?.debug?.summaryOnly) return;
    let cancelled = false;

    fetchJsonWithTimeout<DashboardPayload>('/api/dashboard', 6500).then((payload) => {
      if (!cancelled && payload) setDashboard(payload);
    });

    return () => {
      cancelled = true;
    };
  }, [dashboard?.debug?.summaryOnly, open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: 'end' });
  }, [messages, open]);

  const greetingName = firstName(session);
  const contextLabel = useMemo(() => pageForPath(pathname).label, [pathname]);
  const openingMessage = useMemo<AssistantMessage>(
    () => ({
      id: 'alex-opening-message',
      role: 'alex',
      body: `Hi${greetingName ? ` ${greetingName}` : ''}, I'm Alex. Ask me about QSentia pages, live model data, MLEQ, docs, or account access.`,
    }),
    [greetingName]
  );
  const visibleMessages = messages.length ? messages : [openingMessage];

  function submitQuestion(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return;

    const userMessage: AssistantMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      body: trimmed,
    };
    const alexMessage = answerQuestion({
      question: trimmed,
      session,
      dashboard,
      models,
      pathname,
    });

    setMessages((current) => [
      ...(current.length ? current : [openingMessage]),
      userMessage,
      alexMessage,
    ]);
    setQuestion('');
    setOpen(true);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitQuestion(question);
  }

  return (
    <div className="fixed bottom-4 right-4 z-[80]">
      {open && (
        <section className="mb-3 flex h-[min(520px,calc(100vh-6.5rem))] w-[min(340px,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-[12px] border border-[#e2e7fb] bg-white shadow-[0_18px_55px_rgba(23,37,84,0.2)]">
          <header className="border-b border-[#e2e7fb] bg-[#07112a] px-3.5 py-3 text-white">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#c7d2fe] text-[#06130c]">
                  <Bot className="h-4 w-4" />
                </span>
                <div>
                  <div className="text-sm font-semibold">Alex</div>
                  <div className="mt-1 text-xs text-[#b8c2e8]">
                    {greetingName ? `Assisting ${greetingName}` : 'QSentia help assistant'} / {contextLabel}
                  </div>
                </div>
              </div>
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => setOpen(false)}
                className="rounded-md p-1 text-[#b8c2e8] hover:bg-white/10 hover:text-white"
                aria-label="Close Alex assistant"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </header>

          <div className="flex-1 space-y-2.5 overflow-y-auto bg-[#f8faff] px-3 py-3">
            {visibleMessages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'alex' && (
                  <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#eef2ff] text-[#3d52da]">
                    <Sparkles className="h-3 w-3" />
                  </span>
                )}
                <div
                  className={`max-w-[84%] whitespace-pre-line rounded-[10px] px-2.5 py-2 text-xs leading-5 ${
                    message.role === 'user'
                      ? 'bg-[#172554] text-white'
                      : 'border border-[#e2e7fb] bg-white text-[#26352c]'
                  }`}
                >
                  {message.body}
                  {message.links?.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {message.links.map((link) => (
                        <Link
                          key={`${message.id}-${link.href}`}
                          href={link.href}
                          className="inline-flex items-center gap-1 rounded-md border border-[#cbd5ff] bg-[#fbfcff] px-2 py-1 text-xs font-semibold text-[#3d52da] hover:bg-[#eef2ff]"
                        >
                          {link.label}
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
                {message.role === 'user' && (
                  <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#e2e7fb] text-[#26352c]">
                    <UserRound className="h-3 w-3" />
                  </span>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-[#e2e7fb] bg-white p-2.5">
            <div className="mb-2.5 flex gap-1.5 overflow-x-auto">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  suppressHydrationWarning
                  onClick={() => submitQuestion(prompt)}
                  className="shrink-0 rounded-full border border-[#e2e7fb] bg-[#f8faff] px-2.5 py-1 text-[11px] font-semibold text-[#46554b] hover:border-[#3d52da] hover:text-[#3d52da]"
                >
                  {prompt}
                </button>
              ))}
            </div>
            <form className="flex gap-2" onSubmit={handleSubmit}>
              <input
                suppressHydrationWarning
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="Ask Alex about QSentia..."
                className="min-w-0 flex-1 rounded-md border border-[#cbd5ff] px-2.5 py-2 text-xs text-[#06130c] outline-none focus:border-[#3d52da]"
              />
              <button
                type="submit"
                suppressHydrationWarning
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#172554] text-white hover:bg-[#2437b5]"
                aria-label="Send message to Alex"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </section>
      )}

      <button
        type="button"
        suppressHydrationWarning
        onClick={() => setOpen((current) => !current)}
        className="ml-auto flex h-11 items-center gap-2.5 rounded-full bg-[#172554] px-4 text-xs font-bold text-white shadow-[0_12px_32px_rgba(23,37,84,0.24)] hover:bg-[#2437b5]"
        aria-expanded={open}
        aria-label={open ? 'Close Alex assistant' : 'Open Alex assistant'}
      >
        <MessageCircle className="h-4 w-4" />
        Alex
      </button>
    </div>
  );
}
