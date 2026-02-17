import { z } from 'zod';

export const BootstrapSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(24)
    .regex(/^[a-zA-Z0-9_]+$/),
    password: z
    .string()
    .min(8)
    .max(72)
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter"),
});

export type BootstrapDto = z.infer<typeof BootstrapSchema>;
