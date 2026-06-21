'use client';

import { useState } from 'react';
import { CheckCircle2, Send } from 'lucide-react';

const initial = { name:'', email:'', organization:'', investorType:'', ticketSize:'', qualification:'', strategyInterest:'', timeline:'' };
const field = 'w-full rounded-md border border-[#cfd7eb] bg-white px-3 py-2.5 text-sm text-[#06130c] outline-none transition focus:border-[#3d52da] focus:ring-2 focus:ring-[#3d52da]/10';

export default function InvestorQualificationForm() {
  const [form,setForm]=useState(initial); const [status,setStatus]=useState<'idle'|'sending'|'sent'|'error'>('idle'); const [message,setMessage]=useState('');
  async function submit(event:React.FormEvent){event.preventDefault();setStatus('sending');const response=await fetch('/api/investor-requests',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)});const body=await response.json();if(!response.ok){setStatus('error');setMessage(body.error||'Unable to submit request');return;}setStatus('sent');setMessage(`Request ${body.requestId} is pending review.`);setForm(initial)}
  if(status==='sent') return <div className="rounded-md border border-[#bbf7d0] bg-[#f0fdf4] p-6"><CheckCircle2 className="h-6 w-6 text-[#047857]"/><h3 className="mt-4 text-lg font-semibold text-[#06130c]">Request received</h3><p className="mt-2 text-sm text-[#5a685f]">{message} Access is granted only after eligibility and document permissions are reviewed.</p></div>;
  return <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
    <Field label="Full name"><input required maxLength={160} className={field} value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></Field>
    <Field label="Work email"><input required type="email" maxLength={160} className={field} value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></Field>
    <Field label="Organization"><input required maxLength={160} className={field} value={form.organization} onChange={e=>setForm({...form,organization:e.target.value})}/></Field>
    <Select label="Investor type" value={form.investorType} onChange={value=>setForm({...form,investorType:value})} options={['Individual','Family office','Fund','Institution','Advisor']}/>
    <Select label="Expected allocation" value={form.ticketSize} onChange={value=>setForm({...form,ticketSize:value})} options={['Under $100k','$100k-$500k','$500k-$1m','$1m-$5m','$5m+']}/>
    <Select label="Investor status" value={form.qualification} onChange={value=>setForm({...form,qualification:value})} options={['Accredited investor','Qualified purchaser','Institutional investor','Not sure']}/>
    <Field label="Strategy interest"><input required maxLength={160} className={field} value={form.strategyInterest} onChange={e=>setForm({...form,strategyInterest:e.target.value})} placeholder="BTC sentiment, ETF, macro..."/></Field>
    <Select label="Timeline" value={form.timeline} onChange={value=>setForm({...form,timeline:value})} options={['Immediate','1-3 months','3-6 months','6+ months']}/>
    <div className="sm:col-span-2"><p className="mb-4 text-xs leading-5 text-[#647269]">This form is an access request, not an offer or eligibility determination. QSentia may request supporting information before granting materials.</p>{status==='error'?<p className="mb-3 text-sm font-semibold text-[#be123c]">{message}</p>:null}<button disabled={status==='sending'} className="inline-flex items-center gap-2 rounded-md bg-[#172554] px-5 py-3 text-sm font-semibold text-white hover:bg-[#2437b5] disabled:opacity-60">{status==='sending'?'Submitting...':'Request investor materials'}<Send className="h-4 w-4"/></button></div>
  </form>;
}
function Field({label,children}:{label:string;children:React.ReactNode}){return <label className="grid gap-2 text-sm font-semibold text-[#26352c]">{label}{children}</label>}
function Select({label,value,onChange,options}:{label:string;value:string;onChange:(v:string)=>void;options:string[]}){return <Field label={label}><select required className={field} value={value} onChange={e=>onChange(e.target.value)}><option value="">Select</option>{options.map(o=><option key={o}>{o}</option>)}</select></Field>}
