# Astroficial Intelligence

Astroficial Intelligence is a hexagonal grid based AI game.
Please read [Hexagonal Grids](https://www.redblobgames.com/grids/hexagons/#basics) to understand how such a grid works.
This game is inspired by the [Skyport Hackathon game](https://github.com/pilsprog/skyport-logic) which I played years ago.
The implementation is from scratch however, and the game logic and rules are different.

The logic of the game is implemented as a really simple [Clojure](https://clojure.org) HTTP and websocket server.
The graphics and UI of the game is implemented as a web client using [React](https://reactjs.org) and [Three.js Fiber](https://docs.pmnd.rs/react-three-fiber/getting-started/introduction).
Players can implement their AI using any programming language that supports running an HTTP server.

## Running

Details to be determined, but you will likely need a JVM installation.

## Development

### Frontend

The frontend is developed using the [Vite](https://vitejs.dev) tool.
You need [Node.js](https://nodejs.org/en/) and [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).

```bash
npm install
npm run dev
```

This should run a dev server that you can access at [localhost:3000](http://localhost:3000).


### Backend

The backend is developed using the [Clojure Tools Deps](https://clojure.org/guides/deps_and_cli).
You should install [Clojure](https://clojure.org/guides/getting_started).

Then start the server with Cider's jack-in (in Emacs and VSCode Calva) or something similar in other editor.
You can also run the dev repl via the command line:

```bash
clj -M
```
