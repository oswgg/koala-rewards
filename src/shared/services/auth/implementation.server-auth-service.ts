import type { ServerAuthService } from './interface.server-auth-service';
import { supabaseServerAuthService } from './supabase.server-auth-service';

export const serverAuthService: ServerAuthService = supabaseServerAuthService;
