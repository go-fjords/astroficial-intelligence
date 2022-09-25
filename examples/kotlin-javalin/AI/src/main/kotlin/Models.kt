data class GameState(
    val events: List<Event>,
    val grid: List<Grid>,
    val players: List<Player>,
    val round: Int,
    val status: String
)

class Actions

data class Event(
  val coordinates: List<Int>?,
  val end: List<Int>?,
  val nick: String?,
  val start: List<Int>?,
  val type: String,
  val hitpoints: Int?,
  val reason: String?,
  val score: Int?,
)

data class Grid(
  val cartesian: List<Double>,
  val coordinates: List<Int>,
  val noise: Double,
  val terrain: String
)

data class Player(
  val actions: Actions,
  val coordinates: List<Int>,
  val hitpoints: Int,
  val mines: Int,
  val nick: String,
  val score: Int,
  val url: String
)

data class Action(
  val type: String,
  val direction: List<Int>,
)