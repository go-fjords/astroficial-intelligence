# Build UI as vite project
FROM node:alpine as ui

WORKDIR /build

COPY . .

RUN npm install
RUN npm run build

# Build server as Clojure.deps project
FROM clojure:temurin-18-tools-deps as server

WORKDIR /build

COPY . .

RUN clojure -T:build uber

# Make final image to run Astroficial Intelligence using Docker
FROM clojure:temurin-18-tools-deps

WORKDIR /app

COPY --from=ui /build/dist /app/dist
COPY --from=server /build/target/astroficial-intelligence.jar /app/astroficial-intelligence.jar

EXPOSE 8080

CMD ["java", "-jar", "astroficial-intelligence.jar"]