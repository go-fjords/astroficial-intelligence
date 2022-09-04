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


const addHex = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const equalPos = (a, b) => a[0] === b[0] && a[1] === b[1] && a[2] === b[2];

const filteredDirections = (grid, currentPos) => {
  // Find all neighbour hexagons in qrs format
  const neighbours = moves.map((move) => addHex(currentPos, move));
  return grid
    .filter(hex => neighbours.find(n => equalPos(n, hex.pos)))
  
  grid.filter(hex => {
    const [q, r, s] = hex;
    const [cq, cr, cs] = currentPos;


    return moves.some(([mq, mr, ms]) => q === cq + mq && r === cr + mr && s === cs + ms);
  })
}

const ai = (state) => {
  const me = state.players.find((p) => p.nick === NICK);
  const randomNeighbour = moves[Math.floor(Math.random() * moves.length)];
  const action = {
    type: "move",
    direction: randomNeighbour,
  };
  return action;
};

const timer = ms => new Promise( res => setTimeout(res, ms));

app.use(async (ctx) => {
  let gameState = ctx.request.body;
  console.log("Game state", gameState)
  ctx.body = ai(gameState);
});

app.listen(PORT);
