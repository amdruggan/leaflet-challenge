//API endpoint URL:
//https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson

// Define URL for query:
var Url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson"

// Test URL:
console.log();

// Create a map object:
var map = L.map("map", {
    center: [0, 0],
    zoom: 2.5
});

// Add a tile layer:

// Adding the Mapbox Streets tile layer
var tileMap = L.tileLayer(
    "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYmxvbmRkYW1jaGVzdCIsImEiOiJjbG50ZGoxbHYwMjV1MnFvY2k0NzlqaTU5In0.43UCCAOwd3g8rMz4ErUvVA",
    {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
                   'Imagery &copy; <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,  // You may adjust this based on the map source
      id: 'mapbox/streets-v11',  // Style ID for Mapbox Streets
    }
);

// Merge into map object:
tileMap.addTo(map);

// Use D3 to request data
d3.json(Url).then(function(data) {

    // This function gets the radius and color from the dataset
    function styleInfo(feature) {
        return {
            opacity: 1,
            fillOpacity: 1,
            fillColor: getColor(feature.geometry.coordinates[2]),
            color: "#000000",
            radius: getRadius(feature.properties.mag),
            stroke: true,
            weight: 0.5
        };
    }
    
    // Colors for the depth of the earthquake.
    var colorMap = [
        '#0076a3',  // Sapphire Blue
        '#9b59b6',  // Amethyst Purple
        '#3498db',  // Azure Blue
        '#1abc9c',  // Emerald Green
        '#e74c3c',  // Ruby Red
        '#f39c12'   // Topaz Yellow
    ];

    // Depth thresholds for us to map colors to depending on depth. 
    var depthThresholds = [100, 75, 50, 25, 10];

    // This function changes the color of the marker based on depth
    function getColor(depth) {
        for (let i = 0; i < depthThresholds.length; i++) {
            if (depth > depthThresholds[i]) {
                return colorMap[i];
            }
        }
        return colorMap[colorMap.length - 1]; // Default color
    }

    // This function changes radius based on earthquake magnitude
    function getRadius(magnitude) {
        if (magnitude === 0) {
            return 1;
        }
        return magnitude * 4;
    }

    // Use Leaflet to create a GeoJSON layer with all the information from our dataset and add to the map
    L.geoJson(data, {
    
    // Create circle markers depending on the latitutde and longitude from the dataset. 
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng);
    },

    // Input style from styleInfo function.
    style: styleInfo,

    // Create popups with information from the dataset so that on each marker you can hover and see the magnitude, depth, and location of the earthquake.
    onEachFeature: function (feature, layer) {
      layer.bindPopup(
        // Magnitude is stored in properties.mag
        "Magnitude: " + feature.properties.mag + 
        // Depth is stored in third coordinate/index = [2]
        "<br>Depth: " + feature.geometry.coordinates[2] + 
        // Location is stored in properties.place
        "<br>Location: " + feature.properties.place
      );
    }}).addTo(map);


    // Create a legend control and set its position to bottom right of the map, along with its logic.
    var legend = L.control({position: "bottomright"});
    legend.onAdd = function () {

        // Create a new div element with the class "info legend".
        var div = L.DomUtil.create("div", "info legend");
        
        // Create a new label element with the class "legend".
        div.innerHTML += '<h4>Earthquake Magnitude</h4>';

        // Looping through our intervals to generate a label with a colored square for each interval.
        for (var i = 0; i < depthThresholds.length; i++) {
            div.innerHTML += "<i style='background: " + colorMap[i] + "'></i> "
                + depthThresholds[i] + (depthThresholds[i + 1] ? "&ndash;" + depthThresholds[i + 1] + "<br>" : "+");
        }

        // Change the backgroundColor of the legend and set its opacity.
        div.style.backgroundColor = "rgba(255, 255, 255, 0.5)";
        
        // Set the z of the div to 1000 so it shows above the map.
        div.style.zIndex = 1000; 

        // Apply CSS to the legend for better styling.
        div.style.backgroundColor = "white";
        div.style.padding = "10px";
        div.style.border = "1px solid #999";
        div.style.borderRadius = "5px";
        div.style.fontSize = "14px";
        div.style.lineHeight = "18px";

        // Return the new div element.
        return div;
    };
  

    // Add the legend to the map.
    legend.addTo(map);
})