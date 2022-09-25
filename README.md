# Astroficial Intelligence

![Astroficial Intelligence screenshot](/docs/gameui.png)

Astroficial Intelligence is a hexagonal grid based AI game.
Please read [Hexagonal Grids](https://www.redblobgames.com/grids/hexagons/#basics) to understand how such a grid works.
This game is inspired by the [Skyport Hackathon game](https://github.com/pilsprog/skyport-logic) which I played years ago.
The implementation is from scratch however, and the game logic and rules are different.

The logic of the game is implemented as a really simple [Clojure](https://clojure.org) HTTP and websocket server.
The graphics and UI of the game is implemented as a web client using [React](https://reactjs.org) and [Three.js Fiber](https://docs.pmnd.rs/react-three-fiber/getting-started/introduction).
Players can implement their AI using any programming language that supports running an HTTP server.

## Running

To run a prod version of the game server you need Docker:

```bash
# Get the latest image of the game server and UI
docker pull ghcr.io/go-fjords/astroficial-intelligence:latest

# Run the server with docker
docker run -p 8080:8080 ghcr.io/go-fjords/astroficial-intelligence:latest
```

## Playing

See detailed instructions on how to play the game in [playing.md](/docs/playing.md).

## Development

Astroficial Intelligence is implemented as a Clojure HTTP server and a React web client.
The server is implemented in the `server` directory and the client in the `frontend` directory.
Some files are located in the root directory.

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

## Building for production

The easiest way to build for production is using Docker:

```bash
# Build the image
docker build -t ghcr.io/go-fjords/astroficial-intelligence:latest .

# Push image to GitHub container registry
docker push ghcr.io/go-fjords/astroficial-intelligence:latest
```


