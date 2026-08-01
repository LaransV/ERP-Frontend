import { z } from 'zod';
export const LeadSchema = z.object({
  leadName:z.string().min(1,'Name required'), company:z.string().optional(),
  email:z.string().optional(), phone:z.string().optional(),
  source:z.string().optional(), status:z.string().default('NEW'),
  priority:z.string().default('MEDIUM'), assignedToId:z.number().optional(),
  expectedValue:z.number().optional(), expectedCloseDate:z.string().optional(),
  notes:z.string().optional(),
});
export const LeadReq=LeadSchema; export type TLeadReq=z.infer<typeof LeadSchema>;
export const FollowupSchema = z.object({
  leadId:z.number().min(1,'Lead required'), scheduledAt:z.string().min(1),
  followupType:z.enum(['CALL','EMAIL','VISIT','DEMO','OTHER']),
  notes:z.string().min(1,'Notes required'), status:z.string().optional(),
});
export const FollowupReq=FollowupSchema; export type TFollowupReq=z.infer<typeof FollowupSchema>;
export const ActivitySchema = z.object({
  entityType:z.string().optional(), entityId:z.number().optional(),
  activityType:z.enum(['CALL','EMAIL','MEETING','NOTE','TASK']),
  title:z.string().min(1,'Title required'), description:z.string().optional(),
  scheduledAt:z.string().optional(), status:z.string().optional(), leadId:z.number().optional(),
});
export const ActivityReq=ActivitySchema; export type TActivityReq=z.infer<typeof ActivitySchema>;
