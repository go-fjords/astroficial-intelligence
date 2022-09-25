# Examples

Example AI clients for various languages and frameworks.
The examples should get you up and running quickly.
Feel free to contribute your own!

## [Node.js, JavaScript and Koa.js](/node-js-koa)

A random AI implementing a JavaScript-based AI on top of [Node](https://nodejs.org/en/) and the [Koa](https://koajs.com/) library.
To run the AI with hot reloading you need to install Node for your platform and run:

```sh
npm install -g nodemon # Install reload daemon for node
npm install # Install deps
# The nick helps the AI identify itself in the game state
NICK="Your Nick" PORT=1337 nodemon index.js
```

## [PHP and Slim framework](/php-slim)

For the PHP-folks [Slim](https://www.slimframework.com/) is a pretty barebones framework that seems a good fit to implement a simple AI.
The example implements a random AI matching the JavaScript example.

To run the API you need to have PHP >= 7.1 and should then run:

```sh
composer install
NICK="Your Nick" php -S 0.0.0.0:8000 server.php
```

## [C# and Dotnet Framework](/dotnet/RandomAI)

A random AI implemented in C# using the [.NET Core framework](https://dotnet.microsoft.com/en-us/).
The project was generated running `dotnet new web -o RandomAI` using dotnet version 6.0.400.
It uses the path to code feature of the framework to allow simple setup and configuration.

To run the AI you need to have the [.NET Core SDK](https://dotnet.microsoft.com/download) installed and then run:

```sh
dotnet watch run --project RandomAI
```

## [Kotlin and Javalin](/kotlin-javalin/AI)

A random AI implemented in Kotlin using the [Javalin](https://javalin.io/) framework.
The project was set up using IntelliJ IDEA and uses the Gradle build system.
It implements the same random AI as the other examples.

The recommended way to run and develop the AI is to use IntelliJ IDEA as it has better support for Kotlin and running Kotlin based projects.
Though it is always possible to use just Gradle.

To run the AI you need to have the following installed:

- [Java 17](https://adoptium.net/en-GB/temurin/releases/?version=17)
- [Gradle](https://gradle.org/install/)

Then you can run the AI using:

```sh
gradle run
```