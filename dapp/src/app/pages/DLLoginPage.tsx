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
import "./DLLoginPage.css";

import { BsWallet2 } from "react-icons/bs";

import NavBar from "../elements/NavBar";

interface Pet {
  name: string;
  description: string;
  level: number;
  type: number;
  id: number;
  lastUpdated: number;
}

interface DLLoginPageState {
  publicKey: string;
  top: Array<Pet>;
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
  pet: Pet | null; // Allow pet to be null
  showMessageBox: boolean; // New state variable for message box,
  token: string;
}

class DLLoginPage extends React.Component<{}, DLLoginPageState> {
  constructor(props: {}) {
    super(props);
    const address = Server.service.isLoggedIn();
    this.state = {
      publicKey: "",
      top: [],
      name: "",
      description: "",
      users: 0,
      posts: 0,
      replies: 0,
      open: false,
      address,
      openMenu: false,
      count: 0,
      message: "",
      token: "",
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
    Server.service.checkPermisson();
    this.start();
  }

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
    this.fetchMessage();
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
      addr: this.state.address
    });

    // Send the signature, public key, and message to your Deno server
    const response = await fetch('https://d-life.deno.dev/gen_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: payload
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    console.log("Sig Verification:", data.verification);
    this.setState({ token: data.token});


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

    return (
      <div className="app-container">
        <div className="site-page-header-pc">
        <div className="header-container">
            <div className="wallet-container">
              {this.state.address ? (
                <>
                  <div
                    className="app-icon-button connect"
                    onClick={() => this.disconnectWallet()}
                  >
                    {shortAddress}
                  </div>
                  <a href="/#/profile">
                  <div
                    className="profile-button"
                  >
                    Profile
                  </div>
                  </a>
                </>
              ) : (
                <div
                  className="app-icon-button connect"
                  onClick={() => this.connect2ArConnect()}
                >
                  <BsWallet2 size={20} />
                  ArConnect
                </div>
              )}
            </div>
            <NavBar address={this.state.address} />
          </div>
          <center>
            <h2>Dimension Life Login</h2>
            <p>
              using dimension Life as a <b>PASSPORT</b>.
            </p>
            <div>
              <br></br>
              <p>
                <b>Message for sign:</b> {this.state.message}
              </p>
              <br></br>
              <button onClick={this.getToken}>Sign & Generate Token</button>
              <br></br>
              <br></br>
              <input
                value={this.state.token}
                onChange={() => {}}
                onClick={this.copyToClipboard}
                readOnly
              />
              <br></br>
              <br></br>
              <hr></hr>
              <br></br>
              <a href="https://arweave.noncegeeek.com" target="_blank" rel="noreferrer"> use token in GPT Bot for interact!</a>
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

export default DLLoginPage;
