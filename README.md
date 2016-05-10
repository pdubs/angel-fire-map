## Angel Fire Bike Park Interactive Trail Map

```
/angel-fire-map
  ├─ /server.js                # API Server
  ├─ /app/models/trail.js      # Database Schema
  ├─ /public/js/controller.js  # Front-end Controller
  └─ /public/index.html        # HTML Index
```

##### MEAN Stack
  * MongoDB for GeoJSON data store, Node/Express API server to fetch & serve data, Angular front-end (using google maps & visualization JS APIs)

##### Map Controls:
  * Left sidebar mapControls control which trail segments are displayed
    * By Segment    (specific segment)
    * By Trail      (all segments of a trail)
    * By Difficulty (all segments of all trails of a difficulty)
    * Show/Hide All (all segments of all trails of all difficulties)
  * overlayControls control which type of view is active (Satellite vs. Topographic/Terrain)

##### Map Interactions:
  * trail hover: increased line width & opacity
  * trail click: center map on trail segment, display infoWindow w/ trail details, display elevation profile in #elevation_chart
  * hub (A-F) marker click: zoom & center map on location of hub
