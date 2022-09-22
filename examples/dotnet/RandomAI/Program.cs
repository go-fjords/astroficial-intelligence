using System.Net;

var builder = WebApplication.CreateBuilder(args);

var logger = LoggerFactory.Create(config => {
  config.ClearProviders();
  config.AddConsole();
}).CreateLogger("AI");

var app = builder.Build();

// Get NICK from environment variable
var nick = Environment.GetEnvironmentVariable("NICK");

// All possible directions
var moves = new List<List<int>> {
  new List<int> { 1, 0, -1 }, // right
  new List<int> { 1, -1, 0 }, // right up
  new List<int> { 0, -1, 1 }, // left up
  new List<int> { -1, 0, 1 }, // left
  new List<int> { -1, 1, 0 }, // left down
  new List<int> { 0, 1, -1 }, // right down
};

// List of possible actions
var actions = new List<string> {
  "move",
  "laser",
};

// Given two coordinates returns new hex coordinate, useful for calculating neighbours
var add = (List<int> a, List<int> b) => {
  return new List<int> {
    a[0] + b[0],
    a[1] + b[1],
    a[2] + b[2],
  };
};

// Given new coordinate b and old coordinate a returns direction from a to b
var sub = (List<int> a, List<int> b) => {
  return new List<int> {
    b[0] - a[0],
    b[1] - a[1],
    b[2] - a[2],
  };
};

// Check if two hexagon coordinates are equal
var equal = (List<int> a, List<int> b) => {
  return a[0] == b[0] && a[1] == b[1] && a[2] == b[2];
};

// Figure out valid moves given grid and current position
var validMoves = (List<Grid> grid, List<int> currentPos) => {
  var neighbours = moves.Select(move => add(currentPos, move));
  return grid
    .Where(hex => neighbours.Any(n => equal(n, hex.Coordinates)))
    .Where(hex => hex.Terrain == "land")
    .Select(hex => sub(hex.Coordinates, currentPos))
    .ToList();
};

// Implement AI here
var ai = (GameState state) => {
  // Find our player
  var me = state.Players.Find(p => p.Nick == nick);

  if (me == null) {
    throw new Exception("Could not find player");
  }

  // Do random action
  var actionType = actions[new Random().Next(actions.Count)];

  // Get valid moves
  var moves = validMoves(state.Grid, me.Coordinates);

  // Pick random move
  var direction = moves[new Random().Next(moves.Count)];

  // We just always keep on moving randomly around
  var action = new {
    type = actionType,
    direction,
  };

  return action;
};

/// <summary>
/// The main entry point for the AI
/// </summary>
app.MapPost("/", async context => {
  var gameState = await context.Request.ReadFromJsonAsync<GameState>();

  var action = ai(gameState);

  logger.LogInformation("Action: {action}", action);

  context.Response.ContentType = "application/json";
  context.Response.StatusCode = (int) HttpStatusCode.OK;
  await context.Response.WriteAsJsonAsync(action);
});

app.Run();


