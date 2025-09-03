'use server';
/**
 * @file This file is the entrypoint for Genkit flows when deployed to Vercel.
 */

import { genkitNextHandler } from '@genkit-ai/next/server';
import '@/ai/dev'; // Import flows to register them

export const POST = genkitNextHandler();
