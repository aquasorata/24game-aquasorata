import { z } from 'zod';

export const BootstrapSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(24)
    .regex(/^[a-zA-Z0-9_]+$/),
  password: z.string().min(4).max(72),
});

export type BootstrapDto = z.infer<typeof BootstrapSchema>;
