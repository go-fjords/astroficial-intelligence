<?php
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Factory\AppFactory;
use Cocur\Chain\Chain;

error_reporting(E_ALL ^ E_WARNING);

require __DIR__ . '/vendor/autoload.php';


$app = AppFactory::create();
$logger = new \Slim\Logger();

// NICK fro env
$nick = getenv('NICK');

// Hexagonal directions q r s
$hex_directions = array(
  array(1, 0, -1), // right
  array(1, -1, 0), // top right
  array(0, -1, 1), // top left
  array(-1, 0, 1), // left
  array(-1, 1, 0), // bottom left
  array(0, 1, -1) // bottom right
);

// Actions
$actions = array(
  "move",
  "laser"
);

// Given two coordinates returns new hex coordinate, useful
// for calculating neighbours
function hex_add($a, $b) {
  return array($a[0] + $b[0], $a[1] + $b[1], $a[2] + $b[2]);
}

// Given new coordinate b and old coordinate a returns direction
function subHex($a, $b) {
  return array($a[0] - $b[0], $a[1] - $b[1], $a[2] - $b[2]);
}

// Check if two hexagon coordinates are equal
// In JS: const equalPos = (a, b) => a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
function equalPos($a, $b) {
  return $a[0] === $b[0] && $a[1] === $b[1] && $a[2] === $b[2];
}

// Figure out valid moves given grid and current position
function validMoves($grid, $currentPos) {
  global $hex_directions, $logger;

  // First we find neighbours, ps @ is used to surpress deprecation warnings from Chain library
  $neighbours = @Chain::create($hex_directions)
    ->map(function($move) use ($currentPos) {
      return hex_add($currentPos, $move);
    });

  // Then we filter out grid hexes that are not neighbours
  return @Chain::create($grid)
    ->filter(function($hex) use ($neighbours) {
      return $neighbours
        ->find(function($n) use ($hex) {
          return equalPos($n, $hex["coordinates"]);
        });
    })
    ->filter(function($hex) {
      return $hex["terrain"] === "land";
    })
    ->map(function($hex) use ($currentPos) {
      return subHex($hex["coordinates"], $currentPos);
    })
    ->array;
}

// AI action to take game state and return an action
function ai($state) {
  global $actions, $logger;
  $me = @Chain::create($state["players"])
    ->find(function($p) {
      global $nick, $logger;
      $logger->info($nick . " " . $p["nick"]);
      return $p["nick"] == $nick;
    });

  // Do random action
  $actionType = $actions[array_rand($actions)];

  $moves = validMoves($state["grid"], $me["coordinates"]);
  $direction = $moves[array_rand($moves)];

  // We just always keep on moving randomly around
  $action = array(
    "type" => $actionType,
    "direction" => $direction
  );

  return $action;
}

// Request handler for AI to action

$app->post('/', function (Request $request, Response $response) {
  global $logger;
  $gameState = $request->getParsedBody();
  $action = ai($gameState);
  $response->getBody()->write(json_encode($action));
  return $response->withHeader('Content-Type', 'application/json');
});

$app->run();
