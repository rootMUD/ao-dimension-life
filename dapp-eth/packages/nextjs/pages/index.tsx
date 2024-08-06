import { useEffect, useState } from "react";
import { NextPage } from "next";
import ReactMarkdown from "react-markdown";

// Define data types for response and search results
export type resultByDataset = {
  dataset_id: string;
  results: search_result[];
};

export type search_result = {
  id: string;
  data: string;
  metadata: {};
};

const ETHSpace: NextPage = () => {
  const [count, setCount] = useState(0);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleOnClick = async () => {
    console.log("Get My Pet button clicked");
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
            onClick={handleOnClick}
            disabled={isButtonDisabled()}
            className={`p-2 rounded ${
              isButtonDisabled() ? "bg-gray-300 cursor-not-allowed" : "bg-blue-500 cursor-pointer"
            }`}
          >
            Get My Pet (Free Now!)
          </button>
        </div>
      </div>
    </div>
  );
};

export default ETHSpace;
