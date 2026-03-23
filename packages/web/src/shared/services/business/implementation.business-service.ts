import { supabaseBusinessService } from './supabase.business-service';
import type { BusinessService } from '@koalacards/core';

export const businessService: BusinessService = supabaseBusinessService;
