(ns astroficial.core
  (:require [astroficial.server :as server])
  (:gen-class))

(defn -main [& args]
  (println "Starting Astroficial Intelligence")
  (server/start!))