import { useEffect, useState } from "react";
import { NextPage } from "next";
import ReactMarkdown from "react-markdown";
import { useAccount } from "wagmi";
import PetCard from "~~/components/PetCard";

const ETHSpace: NextPage = () => {
  const { address, isConnected } = useAccount();
  const [count, setCount] = useState(0);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [pet, setPet] = useState<any>(null); // State to store pet information

  const checkNameUnique = async (name: string): Promise<boolean> => {
    try {
      const response = await fetch(`https://d-life.deno.dev/check_name_unique?name=${encodeURIComponent(name)}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to check name uniqueness");
      }

      const result = await response.json();
      return result.unique; // Assuming the API returns { unique: true/false }
    } catch (error) {
      console.error("Error checking name uniqueness:", error);
      return false;
    }
  };

  const getPet = async () => {
    if (!isConnected || !address) {
      alert("Please connect your wallet to proceed.");
      return;
    }

    try {
      const response = await fetch(`https://d-life.deno.dev/get_pet?address=${encodeURIComponent(address)}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.log("No pet found for this address.");
          setPet(null); // No pet found, clear the pet state
        } else {
          throw new Error("Failed to fetch pet information");
        }
        return;
      }

      const petInfo = await response.json();
      console.log("Pet information retrieved successfully:", petInfo);
      setPet(petInfo); // Set the pet information in state
    } catch (error) {
      console.error("Error fetching pet information:", error);
    }
  };

  const initPet = async () => {
    if (!isConnected || !address) {
      alert("Please connect your wallet to proceed.");
      return;
    }

    // Check if the name is unique
    const isUnique = await checkNameUnique(name);
    if (!isUnique) {
      alert("The pet name is already taken. Please choose another name.");
      return;
    }

    try {
      const response = await fetch(
        `https://ao-dimension-life-1.onrender.com/init_pet?name=${encodeURIComponent(
          name,
        )}&description=${encodeURIComponent(description)}&address=${address}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to initialize pet");
      }

      const petInfo = await response.json();
      console.log("Pet initialized successfully:", petInfo);
      setPet(petInfo); // Set the newly created pet information in state
    } catch (error) {
      console.error("Error initializing pet:", error);
    }
  };

  const updatePetLevel = async () => {
    if (!address) return;

    try {
      const response = await fetch(
        `https://ao-dimension-life-1.onrender.com/update_level?address=${encodeURIComponent(address)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to update pet level");
      }

      const updatedPetInfo = await response.json();
      console.log("Pet level updated successfully:", updatedPetInfo);
      getPet(); // Refresh pet data after feeding
    } catch (error) {
      console.error("Error updating pet level:", error);
    }
  };

  const fetchPetCount = async () => {
    try {
      const response = await fetch("https://d-life.deno.dev/count");
      if (!response.ok) {
        throw new Error("Failed to fetch pet count");
      }
      const petCount = await response.text();
      setCount(Number(petCount));
    } catch (error) {
      console.error("Error fetching pet count:", error);
    }
  };

  useEffect(() => {
    fetchPetCount();
  }, []);

  useEffect(() => {
    if (isConnected) {
      getPet();
    }
  }, [isConnected]);

  const isButtonDisabled = () => {
    return !name || !description;
  };

  const upper = `
    _____     __     __    __     ______     __   __     ______     __     ______     __   __    
    /\\  __-.  /\\ \\   /\\ "-./  \\   /\\  ___\\   /\\ "-.\\ \\   /\\  ___\\   /\\ \\   /\\  __ \\   /\\ "-.\\ \\   
    \\ \\ \\/\\ \\ \\ \\ \\  \\ \\ \\-./\\ \\  \\ \\  __\\   \\ \\ \\-.  \\  \\ \\___  \\  \\ \\ \\  \\ \\ \\/\\ \\  \\ \\ \\-.  \\  
     \\ \\____-  \\ \\_\\  \\ \\_\\ \\ \\_\\  \\ \\_____\\  \\ \\_\\\\"\\_\\  \\/\\_____\\  \\ \\_\\  \\ \\_____\\  \\ \\_\\\\"\\_\\ 
      \\/____/   \\/_/   \\/_/  \\/_/   \\/_____/   \\/_/ \\/_/   \\/_____/   \\/_/   \\/_____/   \\/_/ \\/_/ 
                                                                                                  
                                         __         __     ______   ______                        
                                        /\\ \\       /\\ \\   /\\  ___\\ /\\  ___\\                       
                                        \\ \\ \\____  \\ \\ \\  \\ \\  __\\ \\ \\  __\\                       
                                         \\ \\_____\\  \\ \\_\\  \\ \\_\\    \\ \\_____\\                     
                                          \\/_____/   \\/_/   \\/_/     \\/_____/                     
                                                                                                  
    `;
  const codeStyle = {
    lineHeight: "1.2", // Adjust the line height to reduce spacing
    padding: "10px", // Adjust padding as needed
    margin: "0", // Remove default margins
  };

  return (
    <div className="grid lg:grid-cols-1 flex-grow p-4">
      <div className="hero min-h-screen bg-base-200 bg-gradient-to-r from-green-500 to-blue-500 flex flex-col items-center justify-center space-y-6">
        <div className="text-content text-center">
          <ReactMarkdown
            components={{
              code({ node, className, children, ...props }) {
                return (
                  <code style={codeStyle} {...props}>
                    {children}
                  </code>
                );
              },
              pre({ node, className, children, ...props }) {
                return (
                  <pre style={codeStyle} {...props}>
                    {children}
                  </pre>
                );
              },
            }}
          >
            {upper}
          </ReactMarkdown>
          <p className="py-6">
            The 1st Pet Game/AI Twin Protocol on AO which is
            <br />
            strongly AI powered, Community GC(Generate Content), UserGC, DeveloperGC and AIGC ฅ^•ﻌ•^ฅ。
            <br />
            首个 AO 上的宠物游戏/数字分身类协议 ——
            <br />强 AI 支持, 社区创造内容, 用户创造内容, 开发者创造内容与 AI 创造内容 ฅ^•ﻌ•^ฅ。
          </p>
        </div>
        <div className="text-center">
          <p>Pet supplied totally:</p>
          <p>
            <b>&lt;{count}&gt;</b>
          </p>
        </div>
        <div className="text-center">
          <div className="mb-4">
            <label>
              Name:&nbsp;&nbsp;
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="rounded p-1" />
            </label>
          </div>
          <div className="mb-4">
            <label>
              Description:&nbsp;&nbsp;
              <input
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="rounded p-1"
              />
            </label>
          </div>
        </div>
        <div className="button-container">
          <button
            onClick={initPet}
            disabled={isButtonDisabled()}
            className={`p-2 rounded ${
              isButtonDisabled() ? "bg-gray-300 cursor-not-allowed" : "bg-blue-500 cursor-pointer"
            }`}
          >
            Get My Pet (Free Now!)
          </button>
        </div>
        {pet && (
          <div className="mt-8">
            <PetCard
              id={pet.id}
              name={pet.name}
              description={pet.description}
              level={pet.level}
              type={pet.type}
              lastUpdated={pet.lastUpdated}
              onFeed={updatePetLevel} // Call updatePetLevel when the user clicks "Feed"
            />
          </div>
        )}
        <br></br>
      </div>
    </div>
  );
};

export default ETHSpace;
