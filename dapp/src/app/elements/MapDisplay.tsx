import React from 'react';

interface MapInfo {
  id: number;
  name: string;
  description: string;
  object_id: string;
  creator: string;
  map: number[][];
}

const MapDisplay: React.FC<{ mapInfo: MapInfo | null }> = ({ mapInfo }) => {
  if (!mapInfo) return <p>No map data available.</p>;

  return (
    <div>
    <p><b>Map Name:</b> {mapInfo.name}</p>
    <p><b>Description:</b> {mapInfo.description}</p>
    <p><b>Creator:</b> {mapInfo.creator}</p>
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(100, 10px)",
      border: "2px solid black", // Adding a border
      padding: "10px", // Adding some padding
      margin: "20px"  // Optionally add margin to separate from surrounding elements
    }}>
      {mapInfo.map.flat().map((cell, index) => (
        <div
          key={index}
          style={{
            width: "10px",
            height: "10px",
            backgroundColor: cell !== 0 ? `hsl(${Math.random() * 360}, 100%, 50%)` : "transparent",
          }}
        />
      ))}
    </div>
    </div>
  );
};

export default MapDisplay;
