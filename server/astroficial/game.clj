(ns astroficial.game
  (:require [astroficial.hex :as hex]))

;; The game state describes the current state of the game.
;; It describes the hexagon grid map, the players and their
;; provided actions, and keeps track of the current turn.
(defonce state
  (atom {:round 0
         :grid []
         :players []
         :moves []}))

(defn generate-grid!
  [grid-opts]
  (swap! state
         (fn [s]
           (assoc s :grid (hex/hex-map grid-opts)))))


(defn join-player
  [{:keys [ip nick]}
   {:keys [players grid] :as state}]
  (if (= 2 (count  players))
    state
    (assoc state :players
           (conj players
                 {:ip ip
                  :nick nick
                  :hp 100
                  :coordinates  (case (count players)
                                  0 (hex/left-most grid)
                                  1 (hex/right-most grid))}))))

(defn join-player!
  [args]
  (swap! state (partial join-player args)))


 

;; Rich comments
(comment
  ;; Update state with new random grid map
  (generate-grid! {})
 )

