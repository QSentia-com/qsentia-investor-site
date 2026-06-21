import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

export type InvestorRequest = {
  id: string; name: string; email: string; organization: string; investorType: string;
  ticketSize: string; qualification: string; strategyInterest: string; timeline: string;
  status: 'pending'; createdAt: string;
};

const filePath = path.join(process.cwd(), '.qsentia-cache', 'investor-requests.json');
const allowed = {
  investorType: new Set(['Individual', 'Family office', 'Fund', 'Institution', 'Advisor']),
  ticketSize: new Set(['Under $100k', '$100k-$500k', '$500k-$1m', '$1m-$5m', '$5m+']),
  qualification: new Set(['Accredited investor', 'Qualified purchaser', 'Institutional investor', 'Not sure']),
  timeline: new Set(['Immediate', '1-3 months', '3-6 months', '6+ months']),
};

function required(value: unknown, label: string, max = 160) {
  const result = String(value || '').trim();
  if (!result || result.length > max) throw new Error(`${label} is required`);
  return result;
}

export async function createInvestorRequest(input: Record<string, unknown>) {
  const email = required(input.email, 'Email').toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error('Enter a valid email address');
  const investorType = required(input.investorType, 'Investor type');
  const ticketSize = required(input.ticketSize, 'Expected allocation');
  const qualification = required(input.qualification, 'Qualification');
  const timeline = required(input.timeline, 'Timeline');
  if (!allowed.investorType.has(investorType) || !allowed.ticketSize.has(ticketSize) || !allowed.qualification.has(qualification) || !allowed.timeline.has(timeline)) throw new Error('Select a valid option');
  const record: InvestorRequest = { id: crypto.randomUUID(), name: required(input.name, 'Name'), email, organization: required(input.organization, 'Organization'), investorType, ticketSize, qualification, strategyInterest: required(input.strategyInterest, 'Strategy interest'), timeline, status: 'pending', createdAt: new Date().toISOString() };
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const { supabaseAdmin } = await import('../backend/lib/supabase');
    const { error } = await supabaseAdmin.from('investor_requests').insert({ id:record.id, name:record.name, email:record.email, organization:record.organization, investor_type:record.investorType, ticket_size:record.ticketSize, qualification:record.qualification, strategy_interest:record.strategyInterest, timeline:record.timeline, status:record.status, created_at:record.createdAt });
    if (error) throw new Error('Investor request could not be stored');
    return record;
  }
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  let rows: InvestorRequest[] = [];
  try { rows = JSON.parse(await fs.readFile(filePath, 'utf8')) as InvestorRequest[]; } catch { rows = []; }
  rows.unshift(record);
  await fs.writeFile(filePath, JSON.stringify(rows.slice(0, 1000), null, 2), 'utf8');
  return record;
}
