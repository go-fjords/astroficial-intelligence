(ns astroficial.game
  (:require [astroficial.hex :as hex]))

(def init-state
  {;; Round keeping so we can stop in case of infinite game
   :round 0
   ;; The grid of hex locations and their properties
   :grid []
   ;; List of players in the game with url, nick, and game related properties
   :players []
   ;; The events calculated from previous state and AI player actions 
   :events []})

;; The game support the following AI actions:
;; - Move to a given coordinate
;; - lazer attack a given direction
;; - Mine a given coordinate

;; The game state describes the current state of the game.
;; It describes the hexagon grid map, the players and their
;; provided actions, and keeps track of the current turn.
(defonce state
  (atom init-state))

(defn generate-grid!
  [grid-opts]
  (swap! state
         (fn [s]
           (assoc s :grid (hex/hex-map grid-opts)))))


(defn new-player
  [url nick]
  {:url url
   :nick nick
   :coordinates nil
   :actions {}
   :mines 3
   :score 0})


(defn join-player
  [{:keys [url nick]}
   {:keys [players grid] :as state}]
  (if (= 2 (count  players))
    state
    (update state
            :players
            #(conj % (-> (new-player url nick)
                         (assoc :coordinates
                                (case (count players)
                                  0 (hex/left-most grid)
                                  1 (hex/right-most grid))))))))

(defn join-player!
  [args]
  (swap! state (partial join-player args)))

(defn land-hex?
  [grid coordinate]
  (some (fn [hex]
          (and (= coordinate (:coordinates hex))
               (= :land (:terrain hex))))
        grid))

(defn action->player
  [action players]
  (first (filter #(= (:nick %) (:nick action)) players)))


(defn colliding-players?
  "Check if the player will collide with any other player given state, action and actions.
   No need to check validity of other player moves, new-pos is already checked for validity."
  [players actions nick new-position]
  (->> (map (fn [action player]
              {:new-coordinates (if (= "move" (:type action))
                                  (hex/add (:coordinates player) (:direction action))
                                  (:coordinates player))
               :nick (:nick player)})
            actions
            players)
       (filter #(not= (:nick %) nick))
       (map :new-coordinates)
       (filter #(= new-position %))
       count
       (not= 0)))


(defn move->event
  "Given a move action returns one of the following events:
   - :move {:coordinates [q r s]}
   - :collide {:coordinates [q r s]}
   - :noop {}"
  [state actions action]
  (try (let [old-pos (->> state
                          :players
                          (filter #(= (:nick %) (:nick action)))
                          first
                          :coordinates)
             new-pos (->> action :direction (hex/add old-pos))]
         (cond
           (> (hex/distance old-pos new-pos) 1)
           {:type :noop
            :nick (:nick action)
            :reason "Too far, specify a direction in terms of -1 >= x <= 1"}

           (not (land-hex? (:grid state) new-pos))
           {:type :collision
            :nick (:nick action)
            :hitpoints -5
            :coordinates new-pos
            :reason "Can't move to a non-land hex, subtracting hitpoints"}

           (colliding-players? (:players state) actions (:nick action) new-pos)
           {:type :collision
            :nick (:nick action)
            :hitpoints -5
            :coordinates new-pos
            :reason "Can't move to a hex occupied by another player, subtracting hitpoints"}

           :else
           {:type :move
            :nick (:nick action)
            :coordinates new-pos}))
       (catch Exception e
         (println "Error in move->event" e)
         {:type :noop
          :nick (:nick action)
          :reason "Failed while processing move action"})))

(defn laser->events
  "Given game state and a player laser action returns one of the following events:
   - :laser {:coordinates [q r s]}
   - :noop {}"
  [{:keys [grid players]} action]
  (println "lazer!")
  (try
    (let [player (action->player action players)
          line-of-fire (->> (hex/strait-draw (:coordinates player)
                                             (:direction action)
                                             12)
                            (hex/coords->hexagons grid)
                            (take-while #(#{:land :void} (:terrain %)))
                            (map :coordinates))
          hit (->> players
                   (filter #(not= (:nick %) (:nick action)))
                   (filter #(-> line-of-fire vec (contains? (:coordinates %)))))]
      (cond (empty? line-of-fire)
            [{:type :noop
              :nick (:nick action)
              :reason "Can't fire laser in that direction"}]

            ;; If line of fire contains player coordinates then we hit a player
            :else
            (do (println "lazer ftw")
                (concat [{:type :laser
                          :nick (:nick action)
                          :start (:coordinates player)
                          :end (last line-of-fire)}]
                        (map (fn [opponent]
                               (println "Hit opponent")
                               {:type :laser-hit
                                :nick (:nick opponent)
                                :hitpoints 10
                                :coordinates (:coordinates opponent)
                                :reason "Got hit by laser"})
                             hit)))))
    (catch Exception e
      (println "Error in laser->event" e)
      {:type :noop
       :nick (:nick action)
       :reason "Failed while processing laser action"})))


(defn move-event->state
  "Given game state and move event applies it
   and returns new game state"
  [state event]
  (println "Apply move event" event)
  (if (not= (:type event) :move)
    state
    (assoc state
           :players (map (fn [player]
                           (if (= (:nick player) (:nick event))
                             (assoc player :coordinates (:coordinates event))
                             player))
                         (:players state))
           :events (conj (:events state) event))))

(defn collision-event->state
  "Given game state and collision event applies it
   and returns new game state"
  [state event]
  (println "Apply collision event" event)
  (if (not= (:type event) :collision)
    state
    (assoc state
           :players (map (fn [player]
                           (if (= (:nick player) (:nick event))
                             (assoc player :hitpoints (- (:hitpoints player) (:hitpoints event)))
                             player))
                         (:players state))
           :events (conj (:events state) event))))

(defn laser-event->state
  "Given game state and laser event applies"
  [state event]
  (println "Apply laser event" event)
  (if (not= (:type event) :laser)
    state
    (assoc state
           :events (conj (:events state) event))))

(defn laser-hit-event->state
  "Given game state and laser hit event applies"
  [state event]
  (println "Apply laser hit event" event)
  (if (not= (:type event) :laser-hit)
    state
    (assoc state
           :players (map (fn [player]
                           (if (= (:nick player) (:nick event))
                             (update player :hitpoints #(- % (:hitpoints event)))
                             player))
                         (:players state))
           :events (conj (:events state) event))))


(defn apply-move-actions
  [state actions]
  (as-> actions $
    (filter #(= (:type %) "move") $)
    (map (partial move->event state actions) $)
    (reduce #(case (:type %2)
               :move (move-event->state %1 %2)
               :collision (collision-event->state %1 %2)
               %1) ;; Move events can trigger both move and collision events
            state
            $)))

(defn apply-laser-actions
  [state actions]
  (as-> actions $
    (filter #(= (:type %) "laser") $)
    (map (partial laser->events state) $)
    (flatten $)
    (reduce #(case (:type %2)
               :laser (laser-event->state %1 %2)
               :laser-hit (laser-hit-event->state %1 %2)
               %1) state $)))

(defn apply-actions
  ""
  [state actions]
  (println "Apply actions" actions)
  (as-> state $
    (update $ :round inc)
    (assoc $ :events [])
    (apply-move-actions $ actions)
    (apply-laser-actions $ actions)))



;; Rich comments
(comment
  (count {:foo "bar" :baz "quux"})
  (conj [] 1)
  ;; Update state with new random grid map
  (generate-grid! {}))

