import React from "react";
import { locationsData, metadataData } from "../data.js";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import "leaflet/dist/leaflet.css";
import "tailwindcss/tailwind.css";
import L from "leaflet";
import hotelIconUrl from "./icon.png";
import cafe from "./cafe.png";
import restaurant from "./restaurant-building.png";
import across from "./delete-button.png"

const mergedData = locationsData.map((loc) => ({
  ...loc,
  ...(metadataData.find((meta) => meta.id === loc.id) || {}),
}));

const typeCounts = mergedData.reduce((acc, loc) => {
  if (loc.type) acc[loc.type] = (acc[loc.type] || 0) + 1;
  return acc;
}, {});

const avgRatings = {};
Object.entries(typeCounts).forEach(([type, count]) => {
  const totalRating = mergedData.reduce((sum, loc) => (loc.type === type ? sum + loc.rating : sum), 0);
  avgRatings[type] = (totalRating / count).toFixed(1);
});

const mostReviewed = mergedData.reduce((max, loc) => (loc.reviews > (max.reviews || 0) ? loc : max), {});

const chartData = Object.entries(avgRatings).map(([type, rating]) => ({ type, rating: parseFloat(rating) }));

const hotelIcon = new L.Icon({
  iconUrl: hotelIconUrl,
  iconSize: [32, 32],
});

const restaurantIcon = new L.Icon({
  iconUrl: restaurant,
  iconSize: [32, 32],
});

const cafeIcon = new L.Icon({
  iconUrl: cafe,
  iconSize: [32, 32],
});

const defaultIcon = new L.Icon({
  iconUrl: across,
  iconSize: [32, 32],
});

const Dashboard = () => {

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-6">Location Data Analysis</h1>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-4 shadow-lg rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Valid Points Per Type</h2>
          {Object.entries(typeCounts).map(([type, count]) => (
            <p key={type} className="text-gray-700">{type}: {count}</p>
          ))}
        </div>

        <div className="bg-white p-4 shadow-lg rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Average Rating Per Type</h2>
          {Object.entries(avgRatings).map(([type, rating]) => (
            <p key={type} className="text-gray-700">{type}: {rating}</p>
          ))}
        </div>

        <div className="bg-white p-4 shadow-lg rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Most Reviewed Location</h2>
          <p className="text-gray-700">ID: {mostReviewed.id}</p>
          <p className="text-gray-700">Type: {mostReviewed.type}</p>
          <p className="text-gray-700">Reviews: {mostReviewed.reviews}</p>
        </div>
      </div>

      <div className="mt-6 bg-white p-4 shadow-lg rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Ratings Chart</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <XAxis dataKey="type" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="rating" fill="#4F46E5" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 bg-white p-4 shadow-lg rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Location Map</h2>
        <MapContainer center={[37.7749, -122.4194]} zoom={3} className="h-96 w-full rounded-lg">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {mergedData.map((loc) =>
            loc.latitude && loc.longitude ? (
              <Marker key={loc.id} position={[loc.latitude, loc.longitude]} 
              icon={
                loc.type === "hotel"
                  ? hotelIcon
                  : loc.type === "restaurant"
                  ? restaurantIcon
                  : loc.type === "cafe"
                  ? cafeIcon
                  : defaultIcon
              } >
                <Popup>
                  <strong>{loc.type || "Unknown"}</strong>
                  <br />
                  Rating: {loc.rating || "N/A"}
                  <br />
                  Reviews: {loc.reviews || "N/A"}
                </Popup>
              </Marker>
            ) : null
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default Dashboard;