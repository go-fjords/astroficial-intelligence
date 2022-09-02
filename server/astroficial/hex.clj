(ns astroficial.hex
  (:require [simplex.noise :as simplex]))

(def grid-options
  "Options determining how the grid is generated"
  {:grid-size 5
   :noise-mod 1.6
   :noise-scale 0.17
   :noise-max 150

   :moutain-height 0.70
   :land-height 0.20})

(def neighbor-vecs
  "Possible relative neighbor coordinates"
  [[1 0 -1]
   [1 -1 0]
   [0 -1 1]
   [-1 0 1]
   [-1 1 0]
   [0 1 -1]])


(def group-by-memoed (memoize group-by))

(def sqrt
  "Convenience wrapper around the Java method to allow more idiomatic uses"
  #(Math/sqrt %))

(def seed!
  "Set new seed"
  simplex/seed)

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
  [grid-opts]
  (let [opts (merge grid-options grid-opts)
        max (max-x (:grid-size opts))
        min (- max)
        xf  (comp (map +cartesian)
                  (map (partial +noise (assoc opts :min min :max max)))
                  (map (partial +terrain opts)))]
    (transduce xf conj (hex-grid opts))))

(defn left-most
  "Find the left most hexagon in the grid, i.e.
   the hex with smallest q and highest s coordinate"
  [grid]
  (->> grid
       (filter #(= :land (:terrain %)))
       (apply min-key #(as-> % k
                         (:coordinates k)
                         ((juxt first last) k)
                         (update k 1 -)
                         (apply + k)))
       :coordinates))

(defn right-most
  "Find the right most hexagon in the grid, i.e.
   the hex with the highest q and the smallest s coordinate"
  [grid]
  (->> grid
       (filter #(= :land (:terrain %)))
       (apply max-key #(as-> % k
                         (:coordinates k)
                         ((juxt first last) k)
                         (map abs k)
                         (apply + k)))
       :coordinates))


(defn random-neighbor!
  "Find a random, valid, neighbor of the given hexagon given
   the game grid."
  [grid hex]
  (->> (mapv #(mapv + hex %) neighbor-vecs)
       (select-keys (group-by-memoed :coordinates grid))
       (filter (fn [[_ [v]]] (= :land (:terrain v))))
       (map first)
       rand-nth))


;; Rich comments
(comment
  (mapv + [0 0 0] (first neighbor-vecs))
  (-> (map #(mapv + [0 0 0] %) neighbor-vecs))

  ;; Generate pure hex grid of positions
  (hex-grid {:grid-size 3})

  ;; Pretty print the game state
  (clojure.pprint/pprint @state)

  ;; Given map size 3 (hexagons 3 out from center each radial direction)
  ;; Easy to figure out min and max cartesian coordinate for x:
  (axial->cartesian [-3 0])
  (axial->cartesian [3 0])

  ;; And for y:
  (axial->cartesian [0 -3])
  (axial->cartesian [0 3])

  ;; Generate Simplex Noise, read more: https://en.wikipedia.org/wiki/Simplex_noise
  ;; Useful for generating semirandom contiguous terrain types
  (seed!)
  (simplex/noise 0.1 0.2)

  ;; Generate hex grid and find left most hexagon
  (-> (hex-map {})
      left-most)

  ;;Generate hex grid and find right most hexagon
  (-> (hex-map {})
      right-most)


  (random-neighbor! (:grid @astroficial.game/state) [0 0 0])
  
  )
  

