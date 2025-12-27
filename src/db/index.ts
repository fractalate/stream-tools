import util from 'util'
import { Database } from 'sqlite3'

export type DatabaseAsyncAwait = Database & {
  run_async(sql: string, ...params: any[]): Promise<null>,
  get_async<T>(sql: string, ...params: any[]): Promise<T>,
  all_async<T>(sql: string, ...params: any[]): Promise<T[]>,
}

export default async function setUpDatabase(): Promise<DatabaseAsyncAwait> {
  const db = new Database('stream.db')

  // unsafe type work. be careful!
  // {
  const temp = db as any

  temp.run_async = util.promisify(db.run.bind(db))
  temp.get_async = util.promisify(db.get.bind(db))
  temp.all_async = util.promisify(db.all.bind(db))

  const result: DatabaseAsyncAwait = temp
  // }

  await createTables(result)

  return result
}

async function getTableVersion(db: DatabaseAsyncAwait, name: string): Promise<number> {
  const table_version: any = await db.get_async(`
    SELECT * FROM table_versions WHERE name = ? LIMIT 1
  `, [name])
  if (!table_version) {
    return 0
  }
  return table_version.version
}

async function setTableVersion(db: DatabaseAsyncAwait, name: string, version: number) {
  await db.run_async(`
    INSERT INTO table_versions(name, version) VALUES(?, ?)
  `, [name, version])
}

async function createTables(db: DatabaseAsyncAwait) {
  // The table_versions table holds the current version of tables. This is used for upgrading tables from one
  // version to the next. The basic process is that on startup, versions of particular tables are checked and
  // appropriate SQL is run to enact the upgrade.
  await db.run_async(`
    CREATE TABLE IF NOT EXISTS table_versions (
      name TEXT,
      version NUMBER
    )
  `)

  await createTableChats(db)
  await createTableGreetings(db)
}

async function createTableChats(db: DatabaseAsyncAwait) {
  await createTableChatsVersion1(db)
  // and future versions...
}

async function createTableChatsVersion1(db: DatabaseAsyncAwait) {
  if (await getTableVersion(db, 'chats') == 0) {
    await db.run_async(`
      CREATE TABLE chats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT,
        username TEXT,
        message TEXT,
        payload TEXT
      )
    `)
    await setTableVersion(db, 'chats', 1)
  }
}

async function createTableGreetings(db: DatabaseAsyncAwait) {
  if (await getTableVersion(db, 'greetings') == 0) {
    await db.run_async(`
      CREATE TABLE greetings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_login TEXT,
        greeting TEXT
      )
    `)
    await setTableVersion(db, 'greetings', 1)
  }
}
