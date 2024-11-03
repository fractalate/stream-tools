import { Application, Request, Response, NextFunction } from 'express'

export default function setUpApi(app: Application) {
  // Useful things you might want:
  //app.use('/api', express.urlencoded({ extended: true }))

  app.get('/api/test/ping', (_req, res) => {
    res.send({ message: 'Pong.' })
  })

  app.get('/api/test/sqlite3', async (_req, _res) => {
    console.log('TODO - implement sqlite3 test')
    // TODO - Implement sqlite3 test
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
