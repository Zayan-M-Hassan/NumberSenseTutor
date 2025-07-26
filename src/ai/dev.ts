import { config } from 'dotenv';
config();

import '@/ai/flows/generate-estimation-questions.ts';
import '@/ai/flows/provide-feedback-on-estimate.ts';