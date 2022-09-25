import os from "os"

const port = parseInt(process.env.PORT) || 3001;
const nick = process.env.NICK || "anonymous";


const moves = [
    [1, 0, -1], // right
    [1, -1, 0], // top right
    [0, -1, 1], // top left
    [-1, 0, 1], // left
    [-1, 1, 0], // bottom left
    [0, 1, -1], // bottom right
  ];


console.log(os.hostname());

const ai = (state) => {
  const me = state.players.find((p) => p.nick === nick);
  const coordinates = me.coordinates;
  const randomNeighbour = moves[Math.floor(Math.random() * moves.length)];
  const action = {
    type: "move",
    coordinates: coordinates.map((c, i) => c + randomNeighbour[i]),
  };
  return action;
};

const handler = async (request: Request) => {
  const body = await request.json();
  //const action = ai(body);
  return new Response(JSON.stringify({}));
};

console.log(`Running at http://localhost:${port}`);

export default {
  port,
  fetch: handler,
};
