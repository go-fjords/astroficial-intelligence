(ns astroficial.server
  (:require [astroficial.game :as game]
            [clj-http.client :as client]
            [clojure.core.async :refer [<! go go-loop timeout]]
            [muuntaja.core :as muuntaja]
            [reitit.ring :as ring]
            [ring.adapter.undertow :refer [run-undertow]]
            [ring.adapter.undertow.websocket :as ws]))

(defonce server (atom nil))
(defonce clients (atom #{}))
(defonce game-status (atom :wait))



(defn ask-ai!
  [{:keys [url state]}]
  (try (->> (client/post url
                        {:body (->> state
                                    (muuntaja/encode "application/json")
                                    slurp)
                         :content-type :json
                         :socket-timeout 4000
                         :connect-timeout 4000
                         :accept :json})
            :body
            (muuntaja/decode "application/json"))
       (catch java.net.SocketTimeoutException _ (println "Player AI spent more than 4 seconds replying") :error)
       (catch java.net.ConnectException _ (println "Player AI did not respond") :error)
       (catch Exception _ (println "Player AI failed to return valid response") :error)))


(defn ai-requests
  "Build a vec of AI requests (url and state) for each player in state"
  [state]
  (->> state
       :players
       (map #(select-keys % [:url]))
       (map #(assoc % :state state))))

(defn apply-actions
  [state actions]
  (println "Apply actions!!" actions)
  (-> state
      (update :round inc)
      (update :players (fn [players]
                         (println "Players update")
                         (map (fn [player action]
                                (println player action)
                                (assoc player :coordinates (:coordinates action)))
                              players
                              actions)))))

(defn start-game!
  []
  (while (= @game-status :play)
    (println "Running round!")
    (let [state @game/state
          requests (ai-requests state)
          actions (mapv #(-> % ask-ai! future) requests)
          new-state (as-> actions $
                      (map deref $)
                      ;; Wait for all action requests to resolve
                      (apply-actions state $))]
                ;;(<! (timeout 4000)) ;; Don't do anything before waiting for 4 seconds
      (reset! game/state new-state))))



;; Whenever state is updated send it to the graphics clients
(add-watch game/state
           :game-state
           (fn [_key _atom _old-state new-state]
             (doseq [client @clients]
                    (as-> new-state $
                      (muuntaja/encode "application/json" $)
                      (slurp $)
                      (ws/send $ client)))))

(add-watch game-status
           :start-game
           (fn [_key _atom _old-state new-state]
             (println ":start-game")
             (when (= :play new-state)
               (future (start-game!)))))

;; (add-watch game/state
;;            :start-game
;;            (fn [_key _atom _old-state new-state]
;;              (when (= 2 (count (:players new-state)))
;;                )))

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
                 (muuntaja/encode "application/json" $)
                 (slurp $)
                 (ws/send $ channel)))
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

    (reset! game/state game/init-state)


    (game/generate-grid! {})
    (game/join-player! {:url "http://127.0.0.1:1337" :nick "Player 1"})
    (game/join-player! {:url "http://127.0.0.1:1338" :nick "Player 2"}))

  (reset! game-status :stop)
  (reset! game-status :play)

  (reset! playing false)

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

  )

