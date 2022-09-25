# Playing the game

The game is a simultaneous turn-based strategy game where you control a spaceship and try to destroy the other player's spaceship.
The game is played on a [hexagonal grid](https://www.redblobgames.com/grids/hexagons).
The grid consists of hexagonal tiles representing land, void, and mountains.
The objective of the game is to move your spaceship across land tiles towards the enemy spaceship and destroy it using your weapons.

The game is played in turns.
Each round the server sends the current game state to each player AI and waits 4 seconds an action response.
When the actions are received the server updates the state accordingly and the next round starts.

## Game state

The game state is represented as a JSON object that looks as follows:

```json
{
  "status": "play",
  "round": 1,
  "grid": [
    {
      "coordinates": [4, 0, -4],
      "terrain": "land"
    },
    {
      "coordinates": [4, 1, -5],
      "terrain": "land"
    }
    ...
  ],
  "players": [
    {
      "nick": "Snorre",
      "hitpoints": 100,
      "coordinates": [-4, 0, 4],
      "score": 0
    },
    {
      "nick": "Ørjan",
      "hitpoints": 100,
      "coordinates": [4, 1, -5],
      "score": 0
    }
  ],
  "events": [
    { 
      "type": "move",
      "nick": "Snorre",
      "coordinates": [-4, 0, 4]
    },
    {
      "type": "laser",
      "nick": "Ørjan",
      "start": [4, 1, -5],
      "end": [1, 1, -2]
    }
  ]
}
```

The `round` field is the current round number and is incremented at the end of each round.

The `grid` field is a list of all the tiles in the game.
Each tile has a `coordinates` field that is a list of three integers representing the coordinates of the tile and a `terrain` field that is either `land`, `void`, or `mountain`.

The `players` field is a list of all the players in the game.
Each player has a `nick` field that is the player's nickname and a `hitpoints` field that is the player's current hitpoints
It also contains a `coordinates` field that is a list of three integers representing the coordinates of the player's spaceship and a `score` field that is the player's current score.

## Performing actions

When the AI receives the state it should reply with an action.
Currently the following actions are supported:

### Move

```json
{
  "type": "move",
  "direction": [1, 0, -1]
}
```
The `move` action moves the player's spaceship in the direction specified by the `coordinates` field.
Note that direction must be a valid direction on the hexagonal grid.

### Laser

```json
{
  "type": "laser",
  "direction": [1, 0, -1]
}
```

The `laser` action fires a laser in the direction specified by the `direction` field.
Note that direction must be a valid direction on the hexagonal grid.

Lasers are blocked by mountains and has a range of 12 tiles.

## Events

As player AIs perform actions the server will calculate events based on those actions.
The events are sent to the player AIs in the `events` field of the game state as well as the web UI.

Many events includes a `reason` field that is a string describing the reason for the event, e.g. why a spaceship collided.

The following events can happen:

### Move

```json
{
  "type": "move",
  "nick": "Snorre",
  "coordinates": [-4, 0, 4]
}
```

The `move` event is sent when a player moves their spaceship to a valid tile.

### Collision

```json
{
  "type": "collision",
  "nick": "Snorre",
  "coordinates": [-4, 0, 4],
  "hitpoints": 10
}
```

The `collision` event is sent when a player moves their spaceship to a tile occupied by another player or a mountain.

### Laser

```json
{
  "type": "laser",
  "nick": "Ørjan",
  "start": [4, 1, -5],
  "end": [1, 1, -2]
}
```

The `laser` event is sent when a player fires a laser.

### Hit

```json
{
  "type": ":laser-hit",
  "nick": "Snorre",
  "hitpoints": 100
}
```
