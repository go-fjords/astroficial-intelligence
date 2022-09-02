const Koa = require("koa");
const bodyParser = require("koa-body");

const PORT = Number.parseInt(process.env.PORT);
const NICK = process.env.NICK;

const app = new Koa();
app.use(bodyParser());

const moves = [
  [1, 0, -1],
  [1, -1, 0],
  [0, -1, 1],
  [-1, 0, 1],
  [-1, 1, 0],
  [0, 1, -1],
];

const ai = (state) => {
  const me = state.players.find((p) => p.nick === NICK);
  const coordinates = me.coordinates;
  const randomNeighbour = moves[Math.floor(Math.random() * moves.length)];
  const action = {
    type: "move",
    coordinates: coordinates.map((c, i) => c + randomNeighbour[i]),
  };
  return action;
};

const timer = ms => new Promise( res => setTimeout(res, ms));

app.use(async (ctx) => {
  let gameState = ctx.request.body;
  console.log("Game state", gameState)
  ctx.body = ai(gameState);
  await timer(2000)
});

app.listen(PORT);
