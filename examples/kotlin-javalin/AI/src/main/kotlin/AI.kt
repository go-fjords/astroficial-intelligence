import io.javalin.Javalin

const val port = 1338
const val nick = "MyBot"

/*
List of possible directions
 */
val moves = listOf(
  listOf(1, 0, -1), // right
  listOf(1, -1, 0), // right up
  listOf(0, -1, 1), // left up
  listOf(-1, 0, 1), // left
  listOf(-1, 1, 0), // left down
  listOf(0, 1, -1) // right down
)

// List of actions
val actions = listOf("move", "laser")

// Add two hex coordinates together
fun addHex(a: List<Int>, b: List<Int>): List<Int> {
  return listOf(a[0] + b[0], a[1] + b[1], a[2] + b[2])
}

// Subtract hex b from hex a, useful to find the direction from a to b
fun subHex(a: List<Int>, b: List<Int>): List<Int> {
  return listOf(a[0] - b[0], a[1] - b[1], a[2] - b[2])
}

// Check if two hexagon coordinates are equal
fun equalHex(a: List<Int>, b: List<Int>): Boolean {
  return a[0] == b[0] && a[1] == b[1] && a[2] == b[2]
}

// Figure out valid moves given grid and current position
fun validMoves(grid: List<Grid>, currentPos: List<Int>): List<List<Int>> {
  val neighbours = moves.map { move -> addHex(currentPos, move) }
  return grid
    .filter { hex -> neighbours.any { n -> equalHex(n, hex.coordinates) } }
    .map { hex -> subHex(hex.coordinates, currentPos) }
}

// AI implementation
fun ai(state: GameState): Action {
  // Find our player
  val me = state.players.find { p -> p.nick == nick }

  // Do random action
  val actionType = actions.random()

  // Get valid moves, me should never be null!
  val moves = validMoves(state.grid, me!!.coordinates)
  
  // Pick random move
  val direction = moves.random()

  // We just always keep on moving randomly around
  val action = Action(actionType, direction)

  return action
}

fun main() {
  val app = Javalin.create().start(port)
  
  app.post("/") {ctx ->
    val state = ctx.bodyAsClass<GameState>()
    val action = ai(state)
    ctx.json(action)
  }
  app.get("/") { ctx -> ctx.result("Hello World") }
}