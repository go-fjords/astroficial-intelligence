# Example AI client in JavaScript on Node.js

An implementation of a random mover "AI" in JavaScript.
It uses the Koa library on top of the Node.js framework for simplicity.

The AI exposes a single endpoint at the root of the server.
The endpoint expects the game state as JSON in the POST body.
Given the player state, as identified by the chosen nick, returns a random move.

Zero intelligence or state is used, but the example should get you up and running.
Illegal moves (e.g. trying to go outside the grid or onto mountains) can be returned.

The server will discard illegal moves.