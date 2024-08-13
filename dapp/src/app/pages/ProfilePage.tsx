import React from "react";
import {
  getWalletAddress,
  getDataFromAO,
  connectWallet,
  messageToAO,
  shortAddr,
} from "../util/util";
import { AO_PET, AO_ACHIEVEMENT } from "../util/consts";
import { Server } from "../../server/server";
import Portrait from "../elements/Portrait";
import { subscribe } from "../util/event";
import "./ProfilePage.css";

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
  top: Array<Pet>;
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
  achievements: any[]; // Add this line
}

class RankPage extends React.Component<{}, RankPageState> {
  constructor(props: {}) {
    super(props);
    const address = Server.service.isLoggedIn();
    this.state = {
      top: [],
      name: "",
      description: "",
      users: 0,
      posts: 0,
      replies: 0,
      open: false,
      address: address,
      openMenu: false,
      count: 0,
      message: "",
      pet: null, // Initialize pet as null
      showMessageBox: false, // Initialize showMessageBox as false
      achievements: [],
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
    Server.service.checkPermisson();
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

  async get_achievements(address: string) {
    console.log("is getting achievements for address:", address);
    try {
        let replies = await getDataFromAO(AO_ACHIEVEMENT, "GetAchievement", { address: address });
        console.log("getAchievements:", replies);

        // Check if the replies contain a data field
        if (replies && replies.data) {
            // Parse the data field from the replies object
            let achievements = JSON.parse(replies.data);
            
            // Set the parsed achievements data to the state
            this.setState({ achievements });
            console.log("Achievements data found in replies:", achievements);
        } else {
            console.warn("No achievements data found in replies.");
            this.setState({ achievements: [] });
        }
    } catch (error) {
        console.error("Error fetching achievements:", error);
        this.setState({ achievements: [] }); // Set empty achievements on error
    }
}

  async getTopPets(num: number) {
    try {
      let replies = await getDataFromAO(AO_PET, "getTopPets", { number: num });
      console.log("getTop:", replies);
      if (replies && replies.length > 0) {
        this.setState({ top: replies });
      } else {
        this.setState({ top: null });
      }
    } catch (error) {
      console.error("Error fetching pet data:", error);
      this.setState({ top: null });
    }
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
    // Ensure that the wallet is connected and an address is available
    if (this.state.address) {
      await this.get_achievements(this.state.address);
    } else {
      console.warn("No wallet address found. Unable to fetch achievements.");
    }
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
    this.get_achievements(address);
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
  
    return (
      <div className="app-container">
        <div className="site-page-header-pc">
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
            {/* TODO: address as a param to NavBar Component */}
            <NavBar address={this.state.address} />
          </div>
          
          <h2><center>Achievements</center></h2>
          {/* Achievements Table */}
          {this.state.achievements.length > 0 ? (
            <table className="achievements-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Process ID</th>
                </tr>
              </thead>
              <tbody>
                {this.state.achievements.map((achievement, index) => (
                  <tr key={index}>
                    <td>{achievement.title}</td>
                    <td>{achievement.process_id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No achievements found.</p>
          )}
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

export default RankPage;