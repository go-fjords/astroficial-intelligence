(ns astroficial.game
  (:require [astroficial.hex :as hex]))

(def init-state 
  {:round 0
   :grid []
   :players []})

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


(defn join-player
  [{:keys [url nick]}
   {:keys [players grid] :as state}]
  (if (= 2 (count  players))
    state
    (update state
            :players
            #(conj % {:url url
                      :nick nick
                      :hp 100
                      :actions []
                      :coordinates  (case (count players)
                                      0 (hex/left-most grid)
                                      1 (hex/right-most grid))}))))

(defn join-player!
  [args]
  (swap! state (partial join-player args)))

(defn action->event
  ""
  [state actions action]
  (case action
    :move {}))

 

;; Rich comments
(comment
  (count {:foo "bar" :baz "quux"})
  (conj [] 1)
  ;; Update state with new random grid map
  (generate-grid! {})
 )

