/** Tipos de error conocidos al registrar una actividad earn. Cualquier otro fallo se clasifica como `DefaultError`. */
export const RegisterEarnErrorType = {
    DefaultError: 'DefaultError',
    EARN_PER_DAY_LIMIT_ERROR: 'EARN_PER_DAY_LIMIT_ERROR',
} as const;

export type RegisterEarnErrorType =
    (typeof RegisterEarnErrorType)[keyof typeof RegisterEarnErrorType];

export const EARN_PER_DAY_LIMIT_MESSAGE =
    'Este programa solo permite una visita o venta por día por cliente. Ya se registró una hoy.';

export class RegisterEarnActivityError extends Error {
    readonly type: RegisterEarnErrorType;

    constructor(type: RegisterEarnErrorType, message: string) {
        super(message);
        this.name = 'RegisterEarnActivityError';
        this.type = type;
    }

    static is(e: unknown): e is RegisterEarnActivityError {
        return e instanceof RegisterEarnActivityError;
    }
}

export function parseRegisterEarnError(error: unknown): {
    type: RegisterEarnErrorType;
    message: string;
} {
    if (RegisterEarnActivityError.is(error)) {
        return { type: error.type, message: error.message };
    }
    const message = error instanceof Error ? error.message : String(error);
    return { type: RegisterEarnErrorType.DefaultError, message };
}
