import React from "react";
import {
  getWalletAddress,
  getWalletPublicKey,
  getDataFromAO,
  connectWallet,
  messageToAO,
  shortAddr,
  signMessage,
} from "../util/util";
import { AO_PET } from "../util/consts";
import { Server } from "../../server/server";
import Portrait from "../elements/Portrait";
import { subscribe } from "../util/event";
import "./PlaygroundPage.css";

import { BsWallet2 } from "react-icons/bs";

import NavBar from "../elements/NavBar";

interface MapInfo {
  id: number;
  name: string;
  description: string;
  object_id: string;
  map: number[][];
  creator: string;
}

interface Pet {
  name: string;
  description: string;
  level: number;
  type: number;
  id: number;
  lastUpdated: number;
  address: string;
  x: number;
  y: number;
}

interface PlaygroundPageState {
  publicKey: string;
  users: number;
  posts: number;
  replies: number;
  open: boolean;
  address: string;
  openMenu: boolean;
  count: number;
  message: string;
  name: string;
  description: string;
  showMessageBox: boolean;
  token: string;
  pet: Pet | null; // Allow pet to be null
  mapInfo: MapInfo | null; // Use MapInfo type for map details
  hoveredPet: Pet | null; // Store the pet details for the hovered address
}

// Mock a map, for test.
function generateMap() {
  const size = 100;
  let map = new Array(size);
  for (let i = 0; i < size; i++) {
    map[i] = new Array(size);
    for (let j = 0; j < size; j++) {
      map[i][j] = Math.random() > 0.8 ? 1 : 0; // 20% chance of being '1'
    }
  }
  return map;
}

class PlaygroundPage extends React.Component<{}, PlaygroundPageState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      pet: null, // Initialize pet as null
      publicKey: "",
      name: "",
      description: "",
      users: 0,
      posts: 0,
      replies: 0,
      open: false,
      address: "",
      openMenu: false,
      count: 0,
      message: "",
      token: "",
      showMessageBox: false, // Initialize showMessageBox as false
      mapInfo: null,
      hoveredPet: null,
    };

    subscribe("wallet-events", () => {
      let address = Server.service.isLoggedIn();
      this.setState({ address });
    });

    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleDescriptionChange = this.handleDescriptionChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleFeed = this.handleFeed.bind(this); // Bind handleFeed
    this.closeMessageBox = this.closeMessageBox.bind(this); // Bind closeMessageBox
  }

  handleNameChange(event: { target: { value: any } }) {
    this.setState({ name: event.target.value });
  }

  handleDescriptionChange(event: { target: { value: any } }) {
    this.setState({ description: event.target.value });
  }

  componentDidMount() {
    this.start();
  }

  async fetchMapData() {
    try {
      // TODO: use const in this url.
      const response = await fetch(
        "https://map-manager.deno.dev/one?name=YuanSpace"
      );
      if (!response.ok) {
        throw new Error("Failed to fetch the map data.");
      }
      const data = await response.json();
      this.setState({ mapInfo: data }); // Set the entire mapInfo object
      // TODO: get the pet full info by the mapInfo element -- if the element is an addr.
    } catch (error) {
      console.error("Error fetching map data:", error);
      // Handle error or set default map data
      this.setState({ mapInfo: null }); // Handle error state appropriately
    }
  }

  async getPet(address: string, x: number, y: number) {
    console.log("address which is getting pet:", address);
    try {
      let replies = await getDataFromAO(AO_PET, "getPet", { address: address });
      console.log("getPet:", replies);
      if (replies && replies.length > 0) {
        let pet = replies[0];
        pet.x = x; // Set x coordinate
        pet.y = y; // Set y coordinate
        return pet;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error fetching pet data:", error);
      return null;
    }
  }

  handleMouseEnter = async (address: string, x: number, y: number) => {
    if (address) {
      const pet = await this.getPet(address, x, y);
      this.setState({ hoveredPet: pet });
    }
  };

  handleMouseLeave = () => {
    this.setState({ hoveredPet: null });
  };

  // Fetch message from Deno server
  async fetchMessage() {
    try {
      const response = await fetch("https://d-life.deno.dev/msg");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      this.setState({ message: data.message });
    } catch (error) {
      console.error("Failed to fetch message:", error);
    }
  }

  async initPet() {
    let response = await messageToAO(
      AO_PET,
      {
        name: this.state.name,
        description: this.state.description,
        address: this.state.address,
      },
      "initPet"
    );
    console.log("response:", response);
    this.getPet(this.state.address, 0, 0);
  }

  async updateLevel() {
    let response = await messageToAO(
      AO_PET,
      { address: this.state.address },
      "updateLevel"
    );
    console.log("response:", response);
    this.getPet(this.state.address, 0, 0); // Refresh pet data after feeding
  }

  async checkNameUnique(name: string) {
    let replies = await getDataFromAO(AO_PET, "checkNameUnique", {
      name: name,
    });
    console.log("checkName:", replies);
    return replies;
  }

  async getCount() {
    let replies = await getDataFromAO(AO_PET, "getCount");
    console.log("get count:", replies);
    this.setState({ count: replies }); // Update state with the count
  }

  async start() {
    this.fetchMessage();
    this.fetchMapData();
  }

  async disconnectWallet() {
    this.setState({ message: "Disconnect..." });

    Server.service.setIsLoggedIn("");
    Server.service.setActiveAddress("");
    localStorage.removeItem("id_token");

    this.setState({ address: "", message: "" });
  }

  async connect2ArConnect() {
    let connected = await connectWallet();
    if (connected) {
      let address = await getWalletAddress();

      this.setState({ address: address });
      console.log("user address:", address);
      this.afterConnected(address);
      let publicKey = await getWalletPublicKey();
      this.setState({ publicKey: publicKey });
    }
  }

  async afterConnected(address: string, othent?: any) {
    Server.service.setIsLoggedIn(address);
    Server.service.setActiveAddress(address);
    // this.getPet(address);
  }

  async handleClick(e: { currentTarget: any }) {
    // Check if the name is unique
    const replied = await this.checkNameUnique(this.state.name);
    if (replied.unique === false) {
      console.log("Name has been used！名字已经被占用辣！");
      alert("Name has been used！名字已经被占用辣！");
      this.setState({ showMessageBox: true }); // Show message box
    } else {
      console.log("Button clicked!");
      this.initPet();
      setTimeout(() => {
        this.getCount();
        this.getPet(this.state.address, 0, 0);
      }, 1000); // Delay getCount by 1 second
    }
  }

  handleFeed() {
    this.updateLevel();
  }

  closeMessageBox() {
    this.setState({ showMessageBox: false }); // Close message box
  }

  isButtonDisabled() {
    const { name, description, address } = this.state;
    return !name || !description || !address;
  }

  getToken = async () => {
    // Simulation of message signing
    const sig = await signMessage(this.state.message);
    console.log("signature:", sig);
    // Construct the request payload
    console.log("n:", this.state.publicKey);
    console.log("sig:", sig);
    const payload = JSON.stringify({
      sig: sig,
      n: this.state.publicKey, // publicKey identifier 'n' must match the server's expected key
      addr: this.state.address,
    });

    // Send the signature, public key, and message to your Deno server
    const response = await fetch("https://d-life.deno.dev/gen_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: payload,
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    console.log("Sig Verification:", data.verification);
    this.setState({ token: data.token });
  };

  // Copy signed message to clipboard
  copyToClipboard = () => {
    navigator.clipboard
      .writeText(this.state.token)
      .then(() => alert("Copied to clipboard!"))
      .catch((err) => console.error("Failed to copy text: ", err));
  };

  render() {
    let shortAddress = shortAddr(this.state.address, 4);
    const { mapInfo, hoveredPet } = this.state;
    return (
      <div className="app-container">
        <div className="site-page-header-pc">
          {/* TODO: make the ArConnect & The NavBar in the same line. */}
          <div className="header-container">
            {this.state.address ? (
              <div className="wallet-container">
                <div
                  className="app-icon-button connect"
                  onClick={() => this.disconnectWallet()}
                >
                  {shortAddress}
                </div>
              </div>
            ) : (
              <div
                className="app-icon-button connect"
                onClick={() => this.connect2ArConnect()}
              >
                <BsWallet2 size={20} />
                ArConnect
              </div>
            )}
            <NavBar address={this.state.address} />
          </div>
          <center>
            <h2>Playground</h2>
            <p>the 1st playground for all players in dimensionLifeverse.</p>
            <div>
              {mapInfo && (
                <div>
                  <p>
                    <b>Map Name:</b> {mapInfo.name}
                  </p>
                  <p>
                    <b>Description:</b> {mapInfo.description}
                  </p>
                  <p>
                    <b>Creator:</b> {mapInfo.creator}
                  </p>
                  <hr></hr>
                  <div className="pet-info">
                    {hoveredPet ? (
                      <div>
                        <p>
                          <strong>Name:</strong> {hoveredPet.name}
                        </p>
                        <p>
                          <strong>Description:</strong> {hoveredPet.description}
                        </p>
                        <p>
                          <strong>Level:</strong> {hoveredPet.level}
                        </p>
                        <p>
                          <strong>Owner:</strong> {hoveredPet.address}
                        </p>
                        <p>
                          <strong>Position:</strong> &lt;{hoveredPet.x},{" "}
                          {hoveredPet.y}&gt;
                        </p>
                      </div>
                    ) : (
                      <p>Hover over a point to see the details.</p>
                    )}
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(100, 10px)",
                      border: "2px solid black",
                      padding: "10px",
                      margin: "20px",
                    }}
                  >
                    {mapInfo.map.flat().map((cell, index) => {
                      const x = index % 100; // Assuming a 100x100 grid
                      const y = Math.floor(index / 100);
                      return (
                        <div
                          key={index}
                          style={{
                            width: "10px",
                            height: "10px",
                            backgroundColor:
                              typeof cell === "string"
                                ? `hsl(${Math.random() * 360}, 100%, 50%)`
                                : "transparent",
                          }}
                          onMouseEnter={() =>
                            typeof cell === "string"
                              ? this.handleMouseEnter(cell, x, y)
                              : null
                          }
                          onMouseLeave={this.handleMouseLeave}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </center>
        </div>

        {/* FOR MOBILE */}
        <div className="site-page-header-mobile">
          <Portrait />
          <p>mobile version is not supported yet.</p>
        </div>
      </div>
    );
  }
}

export default PlaygroundPage;
