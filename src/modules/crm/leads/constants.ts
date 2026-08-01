export const LEADS_KEY = 'leads-loading';
export const LEAD_STATUSES = ['','NEW','CONTACTED','QUALIFIED','PROPOSAL','NEGOTIATION','WON','LOST'] as const;
export const LEAD_STATUS_LABELS: Record<string,string> = { '':'All',NEW:'New',CONTACTED:'Contacted',QUALIFIED:'Qualified',PROPOSAL:'Proposal',NEGOTIATION:'Negotiation',WON:'Won',LOST:'Lost' };
export const PRIORITY_COLORS: Record<string,string> = { HIGH:'text-red-400',MEDIUM:'text-yellow-400',LOW:'text-blue-400' };
