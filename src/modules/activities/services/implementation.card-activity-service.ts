import type { CardActivityService } from './interface.card-activity-service';
import { supabaseCardActivityService } from './supabase.card-activity-service';

export const cardActivityService: CardActivityService = supabaseCardActivityService;
