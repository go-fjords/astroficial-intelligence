(ns astroficial.server
  (:require [astroficial.game :as game]
            [astroficial.utils :refer [tap*>]]
            [clj-http.client :as client]
            [clojure.core.async :refer [<! go-loop timeout]]
            [muuntaja.core :as muuntaja]
            [reitit.ring :as ring]
            [ring.adapter.undertow :refer [run-undertow]]
            [ring.adapter.undertow.websocket :as ws]))

(defonce server (atom nil))
(defonce clients (atom #{}))



(defn ask-ai!
  [{:keys [url nick state]}]
  (merge (try (->> (client/post url
                                {:body (->> state
                                            (muuntaja/encode "application/json")
                                            slurp)
                                 :content-type :json
                                 :socket-timeout 4000
                                 :connect-timeout 4000
                                 :accept :json})
                   :body
                   ((fn [body] (println body) body))
                   (muuntaja/decode "application/json"))
              (catch java.net.SocketTimeoutException _ (println "Player AI spent more than 4 seconds replying") {:type :error})
              (catch java.net.ConnectException _ (println "Player AI did not respond") {:type :error})
              (catch Exception e (println "Player AI failed to return valid response" e) {:type :error}))
         {:url url
          :nick nick}))


(defn ai-requests
  "Build a vec of AI requests (url and state) for each player in state"
  [state]
  (->> state
       :players
       (map #(select-keys % [:url :nick]))
       (map #(assoc % :state state))))



(defn start-game!
  []
  (println "Starting game")
  (swap! game/state #(assoc % :status :play))
  (println "Game status" (:status @game/state))
  (go-loop [] ;; Use a go-loop to keep running rounds until the game is over
    (when (and (= 2 (count (:players @game/state)))
               (= (:status @game/state) :play)) ;; Abort game loop when game is no longer in play
      (println "Running round!")
      (let [state @game/state ;; Get the current game state
            prepared-actions (->> state ai-requests (mapv #(-> % ask-ai! future)))] ;; Send of AI requests
        (<! (timeout 4000)) ;; Wait for at least 4 secs before doing anything
        ;; Calculate new game state
        (->> prepared-actions
             (mapv deref)
             (game/apply-actions state)
             (reset! game/state))
        ;; Start new round
        (recur)))))

(defn client-message
  "Given message from client"
  [message]
  (println "Message" message)
  (case (-> message :command keyword)
    :start (game/start-game!)
    :init (game/init-game!)
    :reset (game/reset-game!)
    :join (game/join-player! message)
    (constantly true)))

(comment
  (keyword nil)
  ())

;; Whenever state is updated send it to the graphics clients
(add-watch game/state
           :game-state
           (fn [_key _atom old-state new-state]
             (println "Send updated state to clients")
             (doseq [client @clients]
                    (as-> new-state $
                      (assoc $ :type
                             (cond (= :initialized (:status new-state))
                                   :init

                                   :default :update))
                      (muuntaja/encode "application/json" $)
                      (slurp $)
                      (ws/send $ client)))))

;; Whenever game status is updated to playing start the game loop
(add-watch game/state
           :start-game
           (fn [_key _atom old-state new-state]
             (println ":start-game")
             (when (and (= :play (:status new-state))
                        (not= (:status old-state)
                              (:status new-state)))
               (future (start-game!)))))



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
               (as-> @game/state $
                 (assoc $ :type :init)
                 (muuntaja/encode "application/json" $)
                 (slurp $)
                 (ws/send $ channel)))
    :on-message (fn [{:keys [channel data]}]
                  (try (client-message (muuntaja/decode "application/json" data))
                       (catch Exception e (println "Failed to decode message" e))))

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

    (reset! game/state game/init-state)
    (game/generate-grid! {})
    (game/join-player! {:url "http://127.0.0.1:1337" :nick "Player 1"})
    (game/join-player! {:url "http://127.0.0.1:1338" :nick "Player 2"}))

  (swap! game/state #(assoc % :status :initialized))

  (swap! game/state #(assoc % :status :play))

  (swap! game/state
         (fn [s]
           (-> s
               (assoc-in [:players 0 :coordinates]
                         (astroficial.hex/random-neighbor! (:grid s) (get-in s [:players 0 :coordinates])))
               (assoc-in [:players 1 :coordinates]
                         (astroficial.hex/random-neighbor! (:grid s) (get-in s [:players 1 :coordinates]))))))

  (get-in @game/state [:players 0 :actions])


  (as-> @game/state $
    (muuntaja/encode "application/json" $)
    (slurp $)
    (ws/send $ (first @clients)))


  ;; Simulteanous requests to player AIs can be achieved using futures
  (let [awaiter (future (Thread/sleep 4000))
        first (future (ask-ai! {:url "http://localhost:1337" :state @game/state}))
        second (future (ask-ai! {:url "http://localhost:1338" :state @game/state}))]
    [@first @second @awaiter])

  (require '[vlaaad.reveal :as r])

  )

