import React from "react";

interface PetCardProps {
  id: string;
  name: string;
  description: string;
  level: number;
  type: number;
  lastUpdated: number;
  onFeed: () => void;
}

const PetCard: React.FC<PetCardProps> = ({ id, name, description, level, type, lastUpdated, onFeed }) => {
  const [isFeedingEnabled, setIsFeedingEnabled] = React.useState(false);
  const [timeRemaining, setTimeRemaining] = React.useState(0);

  React.useEffect(() => {
    const updateFeedingStatus = () => {
      const currentTime = Date.now();
      const timeElapsed = (currentTime - lastUpdated) / 1000;
      const remainingTime = 3600 - timeElapsed;

      if (remainingTime <= 0) {
        setIsFeedingEnabled(true);
        setTimeRemaining(0);
      } else {
        setIsFeedingEnabled(false);
        setTimeRemaining(remainingTime);
      }
    };

    updateFeedingStatus();
    const intervalId = setInterval(updateFeedingStatus, 1000);

    return () => clearInterval(intervalId);
  }, [lastUpdated]);

  const getSymbol = (type: number) => {
    if (type >= 0 && type < 333) {
      return "ฅ^•ﻌ•^ฅ";
    } else if (type >= 333 && type < 666) {
      return "ʕ´•ᴥ•`ʔ";
    } else if (type >= 666 && type < 999) {
      return "૮₍ • ᴥ • ₎ა";
    } else {
      return "";
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-sm rounded overflow-hidden shadow-lg p-4 bg-white">
      <div className="font-bold text-xl mb-2">{name}</div>
      <p className="text-gray-700 text-base">{description}</p>
      <p className="text-gray-900 text-lg mt-4">Level: {level}</p>
      <p className="text-gray-900 text-lg">Type: {getSymbol(type)}</p>
      <button
        onClick={onFeed}
        disabled={!isFeedingEnabled}
        className={`mt-4 px-4 py-2 rounded ${
          isFeedingEnabled ? "bg-green-500 text-white" : "bg-gray-300 text-gray-700 cursor-not-allowed"
        }`}
      >
        {isFeedingEnabled ? "Feed" : "Cannot Feed Yet"}
      </button>
      {!isFeedingEnabled && (
        <p className="text-gray-600 text-sm mt-2">Time remaining to feed: {formatTime(timeRemaining)}</p>
      )}
    </div>
  );
};

export default PetCard;