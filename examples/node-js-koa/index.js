const Koa = require("koa");
const bodyParser = require("koa-body");

const PORT = Number.parseInt(process.env.PORT);
const NICK = process.env.NICK;

const app = new Koa();
app.use(bodyParser());

const moves = [
  [1, 0, -1], // right
  [1, -1, 0], // right up
  [0, -1, 1], // left up
  [-1, 0, 1], // left
  [-1, 1, 0], // left down
  [0, 1, -1], // right down
];

const actions = [
  "move",
  "laser",
]

// Given two coordinates returns new hex coordinate, useful
// for calculating neighbours
const addHex = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

// Given new coordinate b and old coordinate a returns direction
const subHex = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];

// Check if two hexagon coordinates are equal
const equalPos = (a, b) => a[0] === b[0] && a[1] === b[1] && a[2] === b[2];

// Figure out valid moves given grid and current position
const validMoves = (grid, currentPos) => {
  const neighbours = moves.map(move => addHex(currentPos, move));
  return grid
    .filter(hex => neighbours.find(n => equalPos(n, hex.coordinates)))
    .filter(hex => hex.terrain === "land")
    .map(hex => subHex(hex.coordinates, currentPos));
}

const vallidAttackDirection = (grid, currentPos) => {
  const neighbours = moves.map(move => addHex(currentPos, move));
  return grid
    .filter(hex => neighbours.find(n => equalPos(n, hex.coordinates)))
    .map(hex => subHex(hex.coordinates, currentPos));
}

// Simulate slowness for testing purposes, e.g. await timer(5000);
const timer = ms => new Promise( res => setTimeout(res, ms));

const ai = (state) => {
  const me = state.players.find((p) => p.nick === NICK);
  // Do random action
  const actionType = actions[Math.floor(Math.random() * actions.length)];

  const moves = validMoves(state.grid, me.coordinates);
  const direction = moves[Math.floor(Math.random() * moves.length)];
  // We just always keep on moving randomly around
  const action = {
    type: actionType,
    direction,
  };

  return action;
};

app.use(async (ctx) => {
  let gameState = ctx.request.body;
  ctx.body = ai(gameState);
  console.log(ctx.body)
});

app.listen(PORT);
