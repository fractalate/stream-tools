# Stream Tools

This is a collection of tools and utilities to support live streams.

## Development

To install server dependencies for development, run `npm install .` in the root of the project.

To install client dependencies for development, run `npm install .` in the `/client/` directory of the project.

You can start the client and server in development mode with the command `npm run dev-client-server` which is the intended mode of operation. It is possible to build and deploy backends separately if needed.

## Setup

The following environment variables are used by the client and server:

* `LISTEN_HOST` - The host address for the API server to bind to. Use `127.0.0.1` (the default) to allow only local connections or `0.0.0.0` to allow access subject to firewall and other system configuration.
* `LISTEN_PORT` - The port for the API server to listen on.
* `VITE_DEV_PORT` - The port that the Vite frontend development server listens on.

The following environment variables are used internally between the backend and frontend and you should not adjust/override them:

* `DEV_CLIENT_SERVER` - This is set to `1` when `npm run dev-client-server` is run and this tells the development backend to proxy to the frontend Vite dev server.
