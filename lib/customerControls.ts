import { promises as fs } from 'fs';
import path from 'path';

export type CustomerControls = {
  customerId: string;
  brokerProvider: 'none' | 'IBKR' | 'Alpaca';
  brokerStatus: 'not_connected' | 'onboarding_requested';
  executionMode: 'disabled' | 'paper' | 'live';
  killSwitch: boolean;
  schedule: 'manual' | 'hourly' | 'daily' | 'weekdays';
  timezone: 'UTC' | 'Asia/Kolkata' | 'America/New_York' | 'Europe/London';
  approvalPolicy: 'manual' | 'risk_gated';
  confidenceFloor: number | null;
  maxDailyLossPct: number | null;
  maxNotional: number | null;
  maxContracts: number | null;
  staleQuoteSeconds: number | null;
  emailAlerts: boolean;
  updatedAt: string;
};

const filePath = path.join(process.cwd(), '.qsentia-cache', 'customer-controls.json');

function defaults(customerId: string): CustomerControls {
  return { customerId, brokerProvider:'none', brokerStatus:'not_connected', executionMode:'disabled', killSwitch:true, schedule:'manual', timezone:'UTC', approvalPolicy:'manual', confidenceFloor:null, maxDailyLossPct:null, maxNotional:null, maxContracts:null, staleQuoteSeconds:null, emailAlerts:true, updatedAt:new Date().toISOString() };
}

async function readAll() {
  try { return JSON.parse(await fs.readFile(filePath,'utf8')) as CustomerControls[]; } catch { return []; }
}

export async function readCustomerControls(customerId: string) {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const { supabaseAdmin } = await import('../backend/lib/supabase');
    const { data } = await supabaseAdmin.from('customer_controls').select('*').eq('customer_id',customerId).maybeSingle();
    if (data) return { customerId:data.customer_id, brokerProvider:data.broker_provider, brokerStatus:data.broker_status, executionMode:data.execution_mode, killSwitch:data.kill_switch, schedule:data.schedule, timezone:data.timezone, approvalPolicy:data.approval_policy, confidenceFloor:data.confidence_floor, maxDailyLossPct:data.max_daily_loss_pct, maxNotional:data.max_notional, maxContracts:data.max_contracts, staleQuoteSeconds:data.stale_quote_seconds, emailAlerts:data.email_alerts, updatedAt:data.updated_at } as CustomerControls;
    return defaults(customerId);
  }
  return (await readAll()).find(row=>row.customerId===customerId) || defaults(customerId);
}

function enumValue<T extends string>(value: unknown, choices: readonly T[], label: string): T {
  if (!choices.includes(value as T)) throw new Error(`Select a valid ${label}`);
  return value as T;
}
function optionalNumber(value: unknown, min: number, max: number, label: string) {
  if (value === '' || value === null || value === undefined) return null;
  const number = Number(value);
  if (!Number.isFinite(number) || number < min || number > max) throw new Error(`${label} must be between ${min} and ${max}`);
  return number;
}

export async function updateCustomerControls(customerId: string, input: Record<string, unknown>, liveEntitled: boolean) {
  const current = await readCustomerControls(customerId);
  const next: CustomerControls = {
    ...current,
    brokerProvider: enumValue(input.brokerProvider,['none','IBKR','Alpaca'] as const,'broker'),
    brokerStatus: input.brokerProvider === 'none' ? 'not_connected' : 'onboarding_requested',
    executionMode: enumValue(input.executionMode,['disabled','paper','live'] as const,'execution mode'),
    killSwitch: Boolean(input.killSwitch),
    schedule: enumValue(input.schedule,['manual','hourly','daily','weekdays'] as const,'schedule'),
    timezone: enumValue(input.timezone,['UTC','Asia/Kolkata','America/New_York','Europe/London'] as const,'timezone'),
    approvalPolicy: enumValue(input.approvalPolicy,['manual','risk_gated'] as const,'approval policy'),
    confidenceFloor: optionalNumber(input.confidenceFloor,0,1,'Confidence floor'),
    maxDailyLossPct: optionalNumber(input.maxDailyLossPct,0.01,100,'Maximum daily loss'),
    maxNotional: optionalNumber(input.maxNotional,1,1000000000,'Maximum notional'),
    maxContracts: optionalNumber(input.maxContracts,1,100000,'Maximum contracts'),
    staleQuoteSeconds: optionalNumber(input.staleQuoteSeconds,1,3600,'Stale quote threshold'),
    emailAlerts: Boolean(input.emailAlerts),
    updatedAt: new Date().toISOString(),
  };
  if (next.executionMode === 'live' && (!liveEntitled || next.brokerProvider === 'none')) throw new Error('Live mode requires a live entitlement and broker onboarding');
  if (next.executionMode !== 'disabled' && [next.confidenceFloor,next.maxDailyLossPct,next.maxNotional,next.maxContracts,next.staleQuoteSeconds].some(value=>value===null)) throw new Error('Complete every risk limit before enabling execution');
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const { supabaseAdmin } = await import('../backend/lib/supabase');
    const { error } = await supabaseAdmin.from('customer_controls').upsert({ customer_id:customerId, broker_provider:next.brokerProvider, broker_status:next.brokerStatus, execution_mode:next.executionMode, kill_switch:next.killSwitch, schedule:next.schedule, timezone:next.timezone, approval_policy:next.approvalPolicy, confidence_floor:next.confidenceFloor, max_daily_loss_pct:next.maxDailyLossPct, max_notional:next.maxNotional, max_contracts:next.maxContracts, stale_quote_seconds:next.staleQuoteSeconds, email_alerts:next.emailAlerts, updated_at:next.updatedAt });
    if (error) throw new Error('Controls could not be stored');
    return next;
  }
  const rows = (await readAll()).filter(row=>row.customerId!==customerId);
  rows.push(next);
  await fs.mkdir(path.dirname(filePath),{recursive:true});
  await fs.writeFile(filePath,JSON.stringify(rows,null,2),'utf8');
  return next;
}
