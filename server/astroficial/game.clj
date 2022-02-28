(ns astroficial.game
  (:require [simplex.noise :as simplex]))

(defonce state (atom {:grid []
                      :players []}))

(def grid-options
  "Options determining how the grid is generated"
  {:grid-size 6
   :noise-mod 1.6
   :noise-scale 0.17
   :noise-max 150
   
   :moutain-height 0.70
   :land-height 0.20})

;; Convenience wrapper around the Java method to allow more idiomatic uses
(def sqrt #(Math/sqrt %))

(def seed simplex/seed)

(defn axial->cartesian
  "Converts an axial coordinate to a cartesian coordinate.
   As this is used for game logic we assume a hex size of 1."
  [[q r]]
  [(+ (* (sqrt 3) q)
      (* (/ (sqrt 3) 2) r))
   (* (/ 3. 2) r)])

(defn max-x
  "Find the max cartesian coordinate in the grid given its size.
   The minimum is the negative of this number.
   As this is used for game logic we assume a hex size of 1."
  [grid-size]
  (first (axial->cartesian [grid-size 0])))

(defn normalize
  "Normalize value between 0 and 1 given a min and max."
  [min max value]
  (/ (- value min)
     (- max min)))

(defn hex-grid
  "Produces sequence of cubic/radial hex grid coordinates
   given options map with grid-size."
  ;; TODO: Fix generation of grid, should not generate q: -2 r: -2 for map size 2 :sad-face
  [{:keys [grid-size]}]
  (let [map-range (range (- grid-size) grid-size)]
    (for [q map-range
          r map-range
          s map-range
          :when (= 0 (+ q r s))]
      {:coordinates [q r s]})))

(defn +cartesian
  "Add the cartesian coordinates to the hexagon"
  [hexagon]
  (assoc hexagon
         :cartesian
         (axial->cartesian (:coordinates hexagon))))

(defn +noise
  "Add simplex noise to a hexagon based off its coordinates"
  [{:keys [min max noise-mod noise-scale noise-max]}
   {:keys [cartesian] :as hexagon}]
  (assoc hexagon
         :noise
         (simplex/noise (* (/ (first cartesian) noise-mod)
                           noise-scale)
                        (* (/ (second cartesian) noise-mod)
                           noise-scale))))

(defn +terrain
  "Given hexagon with noise value returns its terrain type"
  [{:keys [moutain-height land-height]}
   {:keys [noise] :as hexagon}]
  (assoc hexagon
         :terrain
         (cond
           (>= noise moutain-height) :mountain
           (< land-height noise moutain-height) :land
           (< noise land-height) :void)))


(defn hex-map
  []
  (let [max (max-x (:grid-size grid-options))
        min (- max)
        xf  (comp (map +cartesian) 
                  (map (partial +noise (assoc grid-options :min min :max max)))
                  (map (partial +terrain grid-options)))]
    (transduce xf conj (hex-grid grid-options))))


(defn update-state!
  []
  (swap! state
         (fn [s]
           (assoc s :grid (hex-map)))))


(comment
  
  ;; Generate pure hex grid of positions
  (hex-grid {:grid-size 3})

  (swap! state
         (fn [s]
           (assoc s :grid (hex-map))))
  
  (clojure.pprint/pprint @state)

  (- (* (sqrt 3) 2)
     (sqrt 3))

  (->> (hex-grid {:grid-size 3})
       (map #(assoc % :cartesian (axial->cartesian (:pos %)))))

  (-> (hex-grid grid-options)
      (add-grid-noise grid-options))
  

  ;; Given map size 3 (hexagons 3 out from center each radial direction)
  ;; Easy to figure out min and max for x:
  (axial->cartesian [-3 0])
  (axial->cartesian [3 0])
  ;; And for y:
  (axial->cartesian [0 -3])
  (axial->cartesian [0 3])
  
  ;; Set up the grid and store in state atom
  (reset! state {:grid (hex-grid {:map-size 5})})
  
  ;; Generate Simplex Noise, read more: https://en.wikipedia.org/wiki/Simplex_noise
  (simplex/seed)
  (simplex/noise 0.1 0.2)
  
  )

