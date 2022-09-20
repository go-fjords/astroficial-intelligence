(ns astroficial.hex
  (:require [simplex.noise :as simplex]
            [clojure.math :refer [sqrt round]]))

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
  [[1 0 -1] ;; right
   [0 1 -1] ;; right-down
   [-1 1 0] ;; left-down
   [-1 0 1] ;; left
   [0 -1 1] ;; left-up
   [1 -1 0]]) ;; right-up


(def group-by-memoed (memoize group-by))


(def seed!
  "Set new seed"
  simplex/seed)

(defn axial->cartesian
  "Converts an axial coordinate to a cartesian coordinate.
   As this is used for game logic we assume a hex size of 1."
  [[q r]]
  [(+ (* (sqrt 3.0) q)
      (* (/ (sqrt 3.0) 2) r))
   (* (/ 3.0 2) r)])


(defn add
  "Adds two cubical hex coordinates"
  [a b]
  (mapv + a b))

(defn distance
  "Calculates the distance between two hexes in cube coordinates system
   Source: https://www.redblobgames.com/grids/hexagons/#distances"
  [a b]
  (as-> (map - a b) $
    (map abs $)
    (apply max $)))


(defn cube-round
  [frac]
  (let [[q r s :as rounded] (map round frac)
        [q_diff r_diff s_diff] (as-> rounded $
                                 (map - $ frac)
                                 (map abs $))]
    (println "diffs: " q r s)
    (cond (and (> q_diff r_diff) (> q_diff s_diff))
          [(- (- r) s) r s]

          (> r_diff s_diff)
          [q (- (- q) s) s]

          :else
          [q r (- (- q) r)])))

(defn lerp
  "Linear interpolation between two values"
  [a b t]
  (+ a (* (- b a) t)))

(defn lerp-cube
  "Linear interpolation between two cube coordinates"
  [a b t]
  (map lerp a b (repeat t)))

(defn line-draw
  "Given hex coordinates a and b, returns a list of hex coordinates
   that are on the direct line between a and b.
   Source: https://www.redblobgames.com/grids/hexagons/#line-drawing"
  [a b]
  (->> (distance a b)
       inc
       range
       (map #(* (/ 1.0 (distance a b)) %))
       (map (partial lerp-cube a b))
       (map cube-round)))


(defn strait-draw
  "Given hex coordinate, a direction and a distance returns a list of hex coordinates
   that are on the strait line from a in the given direction."
  [coordinate direction distance]
  (reduce #(conj % (mapv + (last %1) %2)) [coordinate] (repeat distance direction)))



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

(defn coords->hexagons
  "Given a list of coordinates, return a list of hexagons"
  [grid coordinates]
  (->> (map #(or
              (first
               (filter (comp (partial = %)
                             :coordinates)
                       grid))
              {:coordinates % :terrain :void})
            coordinates)))

;; Rich comments
(comment
  (mapv + [0 0 0] (first neighbor-vecs))
  (-> (map #(mapv + [0 0 0] %) neighbor-vecs))

  (distance [0 0 0] [-2 -1 3])
  ;; => 3

  (line-draw [0 0 0] [-4 0 4])
  ;; => ([0 0 0] [-1 0 1] [-2 0 2] [-3 0 3] [-4 0 4])

  (line-draw [0 0 0] [-1 -2 3])
  ;; => ([0 0 0] [0 -1 1] [-1 -1 2] [-1 -2 3])


  ;; Generate pure hex grid of positions
  (hex-grid {:grid-size 3})

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

  (coords->hexagons (hex-map {:grid-size 2}) [[0 0 0] [1 0 -1] [2 0 -2]])
  
  (or nil {:hello :there})

  

  (= [0 0 0] [0 0 2])
  (hex-map {})

  ;; Generate hex grid and find left most hexagon
  (-> (hex-map {})
      left-most)

  ;;Generate hex grid and find right most hexagon
  (-> (hex-map {})
      right-most)


  (random-neighbor! (:grid @astroficial.game/state) [0 0 0]))


