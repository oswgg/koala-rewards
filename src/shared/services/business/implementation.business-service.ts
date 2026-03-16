import { supabaseBusinessService } from './supabase.business-service';
import type { BusinessService } from './interface.business-service';

export const businessService: BusinessService = supabaseBusinessService;
