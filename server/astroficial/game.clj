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
;; - Lazer attack a given direction
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




(defn move->event
  "Given a move action returns one of the following events:
   - :move {:coordinates [q r s]}
   - :collide {:coordinates [q r s]}
   - :noop {}"
  [state actions action]
  (let [old-pos (->> state
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
       :reason "Can't move to a non-land hex, subtracting hitpoints"}
      
      :else
      {:type :move
       :nick (:nick action)
       :coordinates new-pos})))

(defn lazer->event
  [state actions action]
  {:type :lazer})


(defn  mine->event
  [state actions action]
  {:type :mine})

(defn action->event
  "Given game state, all actions, and the given player action
   returns the event that should unfold as a result of the action.
   Events can be used to update the game state as well as animate
   the UI on the frontend."
  [state actions action]
  (println "action->event" action)
  (try
    (case (-> action :type keyword)
      :move (move->event state actions action)
      :lazer (lazer->event state actions action)
      :mine (mine->event state actions action)
      {:type :noop
       :nick (:nick action)
       :reason (str "Unknown action type: " (:type action))})
    (catch Exception e
      {:type :noop
       :nick (:nick action)
       :reason (str "Error when processing action: " (.getMessage e))})))


(defn actions->events
  [state actions]
  (map (partial action->event state actions) actions))


(defn move-event->state
  [event players]
  (map (fn [player]
         (if (= (:nick player) (:nick event))
           (assoc player :coordinates (:coordinates event))
           player))
       players))

(defn collision-event->state
  [event players]
  (map (fn [player]
         (if (= (:nick player) (:nick event))
           (assoc player :hitpoints (- (:hitpoints player) (:hitpoints event)))
           player))
       players))

(defn event->state
  "Given a game state and an event, returns the new game state."
  [state event]
  (println "Event" event)
  (case (-> event :type keyword)
    :noop state
    :move (update state
                  :players
                  (partial move-event->state event))
    :collision (update state
                       :players
                       (partial colission-event->state event))
    state))

(defn events->state
  [state]
  (reduce event->state state (:events state)))


(defn apply-actions
  [state actions]
  (-> state
      (update :round inc) 
      (assoc :events (actions->events state actions))
      events->state))



;; Rich comments
(comment
  (count {:foo "bar" :baz "quux"})
  (conj [] 1)
  ;; Update state with new random grid map
  (generate-grid! {}))

