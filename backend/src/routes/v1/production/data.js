import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { dbType } from '../../../db/index.js';

export async function insertAndFetch(executor, table, values) {
  const recordId = values.id || randomUUID();
  await executor.insert(table).values({ ...values, id: recordId });
  const [record] = await executor.select().from(table).where(eq(table.id, recordId));
  return record;
}

export async function updateAndFetch(executor, table, where, values) {
  if (dbType === 'pg') {
    const [record] = await executor.update(table).set(values).where(where).returning();
    return record;
  }

  await executor.update(table).set(values).where(where);
  const [record] = await executor.select().from(table).where(where);
  return record;
}
