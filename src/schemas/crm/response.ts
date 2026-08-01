import { z } from 'zod';
import { BaseResponse, PagedSchema } from '@/schemas/template/response';
const LeadSchema = z.object({
  leadId:z.number(), leadName:z.string(), company:z.string().nullable().optional(),
  email:z.string().nullable().optional(), phone:z.string().nullable().optional(),
  source:z.string().nullable().optional(), status:z.string(), priority:z.string().optional(),
  assignedToName:z.string().nullable().optional(), expectedValue:z.number().nullable().optional(),
  expectedCloseDate:z.string().nullable().optional(), nextFollowupDate:z.string().nullable().optional(),
  notes:z.string().nullable().optional(), createdAt:z.string(),
});
const FollowupSchema = z.object({
  followupId:z.number(), leadId:z.number(), leadName:z.string().optional(),
  phone:z.string().optional(), scheduledAt:z.string(), followupType:z.string(),
  status:z.string(), notes:z.string(), completedAt:z.string().nullable().optional(),
});
const ActivitySchema = z.object({
  activityId:z.number(), leadId:z.number().nullable().optional(),
  leadName:z.string().nullable().optional(), activityType:z.string(),
  title:z.string().optional(), description:z.string().optional(),
  activityDate:z.string().optional(), status:z.string().optional(), createdBy:z.string().optional(),
});
const CRMDashSchema = z.object({
  totalLeads:z.number(), newLeads:z.number().optional(),
  wonLeads:z.number().optional(), lostLeads:z.number().optional(),
  conversionRate:z.number().optional(), totalPipelineValue:z.number().optional(),
  statusWise:z.array(z.any()).optional(),
});
export const LeadsRes    =BaseResponse.extend({data:PagedSchema(LeadSchema).nullable().optional()});
export const LeadRes     =BaseResponse.extend({data:LeadSchema.nullable().optional()});
export const FollowupsRes=BaseResponse.extend({data:PagedSchema(FollowupSchema).nullable().optional()});
export const ActivitiesRes=BaseResponse.extend({data:PagedSchema(ActivitySchema).nullable().optional()});
export const CRMDashRes  =BaseResponse.extend({data:CRMDashSchema.nullable().optional()});
export type TLead=z.infer<typeof LeadSchema>; export type TFollowup=z.infer<typeof FollowupSchema>;
export type TActivity=z.infer<typeof ActivitySchema>; export type TCRMDash=z.infer<typeof CRMDashSchema>;
