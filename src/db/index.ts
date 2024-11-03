import util from 'util'
import { Database } from 'sqlite3'

export type DatabaseAsyncAwait = Database & {
  run_async(sql: string): Promise<null>,
  get_async<T>(sql: string): Promise<T>,
  all_async<T>(sql: string): Promise<T[]>,
}

export default async function setUpDatabase(): Promise<DatabaseAsyncAwait> {
  const db = new Database(':memory:')

  // unsafe type work. be careful!
  // {
  const temp = db as any

  temp.run_async = util.promisify(db.run.bind(db))
  temp.get_async = util.promisify(db.get.bind(db))
  temp.all_async = util.promisify(db.all.bind(db))

  const result: DatabaseAsyncAwait = temp
  // }

  // TODO - create tables if we need them

  return result
}
