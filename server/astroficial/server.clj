(ns astroficial.server
  (:require [astroficial.game :as game]
            [muuntaja.core :as muuntaja]
            [ring.adapter.undertow :refer [run-undertow]]
            [ring.adapter.undertow.websocket :as ws]
            [reitit.ring :as ring]))


(defonce server (atom nil))
(defonce clients (atom #{}))

(comment
  
  @clients
  
  ;; We can easily send messages to all connected clients
  (doseq [client @clients]
    (ws/send (slurp (muuntaja/encode "application/json" @game/state)) client))
  )

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
               (swap! clients #(conj % channel)))
    :on-message (fn [{:keys [channel data]}]
                  (ws/send "message received" channel))
    :on-close   (fn [{:keys [channel ws-channel]}]
                  (println "WS closeed!")
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
    (game/join-player! {:ip "127.0.0.1" :nick "Player 2"})

    (doseq [client @clients]
      (ws/send (slurp (muuntaja/encode "application/json" @game/state)) client)))

  
  )

