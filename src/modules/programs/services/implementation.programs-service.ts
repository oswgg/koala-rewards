import { supabaseProgramsService } from './supabase.programs-service';
import type { ProgramsService } from './interface.programs-service';

export const programsService: ProgramsService = supabaseProgramsService;
