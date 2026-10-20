import dotenv from 'dotenv';
import { resolve } from 'node:path';

// The only checked-in env template lives at the workspace root. Docker supplies
// variables directly, while local backend commands load ../.env from this folder.
dotenv.config({ path: resolve(process.cwd(), '../.env') });
