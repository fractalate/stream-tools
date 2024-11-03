import {
  Application,
  NextFunction,
  Request,
  Response,
} from 'express'
import { DatabaseAsyncAwait } from '../../db'

// TODO - add auto catch and next(err) capabilities to endpoints

export default function setUpApi(app: Application, db: DatabaseAsyncAwait) {
  // Useful things you might want:
  //app.use('/api', express.urlencoded({ extended: true }))

  app.get('/api/test/ping', (_req, res) => {
    res.send({ message: 'Pong.' })
  })

  app.get('/api/test/sqlite3', async (_req, res, next) => {
    try {
      const result: {value: number}[] = await db.all_async("SELECT 1 AS value")
      res.send({ result })
    } catch (err) {
      next(err)
    }
  })

  // 2nd to last handler!
  app.use('/api', (_req, res) => {
    res.status(404).send({ message: 'Not found.' })
  })

  // Last handler!
  app.use('/api', (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
    console.error(err)
    res.status(500).send({ message: 'Internal server error.' })
  })
}
