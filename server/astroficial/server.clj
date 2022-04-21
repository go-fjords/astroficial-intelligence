(ns astroficial.server
  (:require [astroficial.game :as game]
            [muuntaja.core :as muuntaja]
            [ring.adapter.undertow :refer [run-undertow]]
            [ring.adapter.undertow.websocket :as ws]
            [reitit.ring :as ring]))

(defonce server (atom nil))
(defonce clients (atom #{}))

;; Whenever state is updated send it to the graphics clients
(add-watch game/state
           :game-state
           (fn [_key _atom _old-state new-state]
             (doseq [client @clients]
                    (as-> new-state $
                      (muuntaja/encode "application/json" $)
                      (slurp $)
                      (ws/send $ client)))))

(defn handler [_]
  (println "Hello world!!!")
  {:status 200  
   :body "Hello world."})

(defn ping-handler [_]
  (println "Pong")
  {:status 200
   :body "Pong"})

(defn join-handler [_])

(defn web-socket-handler
  [req]
  (println "Connect web socket!")
  {:undertow/websocket
   {:on-open (fn [{:keys [channel]}]
               (println "WS open!")
               (swap! clients #(conj % channel))
               (ws/send (slurp (muuntaja/encode "application/json" @game/state)) channel))
    :on-message (fn [{:keys [channel data]}]
                  (ws/send "message received" channel))
    :on-close   (fn [{:keys [channel ws-channel]}]
                  (println "WS closed!")
                  (swap! clients #(disj % channel)))}})


(def app 
  (ring/ring-handler
   (ring/router
    [["/" handler]
     ["/ui" {:name ::ui
             :get web-socket-handler}]
     ["/ping" {:name ::ping
               :get ping-handler
               :post handler}]
     ["/join" {:name ::join
               :post join-handler}]])))

(defn start-server!
  []
  (swap! server
        (fn [s]
          (when s (.stop s))
          (reset! clients [])
          (run-undertow #'app {:port 8080}))))

(comment
  (start-server!)

  (do
    (astroficial.hex/seed!)

    (reset! game/state {:grid []
                        :players []})
    
    (game/generate-grid! {})
    (game/join-player! {:ip "127.0.0.1" :nick "Player 1"})
    (game/join-player! {:ip "127.0.0.1" :nick "Player 2"}))

  
  (swap! game/state
        (fn [s]
          (-> s
              (update-in [:players 0 :coordinates]
                         (fn [coordinates]
                           (hex/random-neighbor! coordinates (:grid s))))
              (update-in [:players 1 :coordinates]
                         (fn [coordinates]
                           (hex/random-neighbor! coordinates (:grid s)))))))
  
  )

