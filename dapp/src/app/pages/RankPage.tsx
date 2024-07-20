import React from "react";
import { NavLink } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import {
  getWalletAddress,
  getDataFromAO,
  connectWallet,
  messageToAO,
  shortAddr,
} from "../util/util";
import { AO_PET } from "../util/consts";
import { Server } from "../../server/server";
import Portrait from "../elements/Portrait";
import { subscribe } from "../util/event";
import "./SitePage.css";

import { BsWallet2 } from "react-icons/bs";

import NavBar from '../elements/NavBar'; 


interface Pet {
  name: string;
  description: string;
  level: number;
  type: number;
  id: number;
  lastUpdated: number;
}

interface RankPageState {
  users: number;
  posts: number;
  replies: number;
  open: boolean;
  address: string;
  openMenu: boolean;
  count: number;
  message?: string;
  name: string;
  description: string;
  pet: Pet | null; // Allow pet to be null
  showMessageBox: boolean; // New state variable for message box
}

class RankPage extends React.Component<{}, RankPageState> {
  constructor(props: {}) {
    super(props);
    this.state = {
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
      pet: null, // Initialize pet as null
      showMessageBox: false, // Initialize showMessageBox as false
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
    this.getPet(this.state.address);
  }

  async updateLevel() {
    let response = await messageToAO(
      AO_PET,
      { address: this.state.address },
      "updateLevel"
    );
    console.log("response:", response);
    this.getPet(this.state.address); // Refresh pet data after feeding
  }

  async getPet(address: string) {
    console.log("address which is getting pet:", address);
    try {
      let replies = await getDataFromAO(AO_PET, "getPet", { address: address });
      console.log("getPet:", replies);
      if (replies && replies.length > 0) {
        this.setState({ pet: replies[0] });
      } else {
        this.setState({ pet: null });
      }
    } catch (error) {
      console.error("Error fetching pet data:", error);
      this.setState({ pet: null });
    }
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
    this.getCount();
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
    }
  }

  async afterConnected(address: string, othent?: any) {
    Server.service.setIsLoggedIn(address);
    Server.service.setActiveAddress(address);
    this.getPet(address);
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
        this.getPet(this.state.address);
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

  render() {
    let shortAddress = shortAddr(this.state.address, 4);
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

    const aoLinkUrl = `https://www.ao.link/#/entity/${AO_PET}`; // Construct the URL dynamically

    return (
      <div className="app-container">
        <div className="site-page-header-pc">
          {/* TODO: make the ArConnect & THe NavBar in the same line. */}
          {this.state.address ? (
            <div>
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
          <NavBar />
          <p>Here is the rank page.</p>
        </div>

        {/* FOR MOBILE */}
        <div className="site-page-header-mobile">
          <Portrait />
          <p>mobile version is not supportted yet.</p>
        </div>
      </div>
    );
  }
}

export default RankPage;