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
import { AO_COUNTER } from "../util/consts";
import { Server } from "../../server/server";
import Portrait from "../elements/Portrait";
import { subscribe } from "../util/event";
import "./SitePage.css";

import { BsWallet2 } from "react-icons/bs";

interface SitePageState {
  users: number;
  posts: number;
  replies: number;
  open: boolean;
  address: string;
  openMenu: boolean;
  count: number;
  message?: string;
}

class SitePage extends React.Component<{}, SitePageState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      users: 0,
      posts: 0,
      replies: 0,
      open: false,
      address: "",
      openMenu: false,
      count: 0,
      message: "",
    };

    subscribe("wallet-events", () => {
      let address = Server.service.isLoggedIn();
      this.setState({ address });
    });
  }

  componentDidMount() {
    this.start();
  }

  async addCount() {
    let response = await messageToAO(AO_COUNTER, this.state.address, "AddNew");
    console.log("add count:", response);
  }
  async getCount() {
    // let response = await messageToAO(AO_COUNTER, "", 'GetCount');
    // console.log("get count:", response);
    let replies = await getDataFromAO(AO_COUNTER, "GetCount");
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
  }

  handleClick = (e: { currentTarget: any }) => {
    console.log("Button clicked!");
    const button = e.currentTarget;
    const ripple = document.createElement("span");
    ripple.classList.add("ripple");
    button.appendChild(ripple);

    // Remove the span after the animation is done
    setTimeout(() => {
      ripple.remove();
    }, 600);

    this.addCount();
    setTimeout(() => {
      this.getCount();
    }, 1000); // Delay getCount by 1 second
  };

  render() {
    let shortAddress = shortAddr(this.state.address, 4);
    const upper = `\`\`\`
                         _      ___                           
                         /_\\    /___\\    __   _____ _ __ ___  ___ 
                        //_\\\\  //  //     \\ \\ / / _ \\ '__/ __|/ _ \\
                       /  _  \\/ \\_//       \\ V /  __/ |  \\__ \\  __/
                        \\_/ \\_/\\___/         \\_/ \\___|_|  |___/\\___|
                                                              
                        
                                       👇👇👇 Click it👇👇👇
\`\`\``;
    const codeStyle = {
      lineHeight: "1.2", // Adjust the line height to reduce spacing
      padding: "10px", // Adjust padding as needed
      margin: "0", // Remove default margins
    };

    const aoLinkUrl = `https://www.ao.link/#/entity/${AO_COUNTER}`; // Construct the URL dynamically

    return (
      <div className="app-container">
        <div className="site-page-header-pc">
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
          <br></br>
          <div className="button-container">
            <button onClick={this.handleClick}>+ 1</button>
            <p>
              {" "}
              ={">"} {this.state.count}
            </p>
          </div>
          <br></br>
          <br></br>
          <div className="button-container">
            <a
              href="https://x.com/0xleeduckgo"
              target="_blank"
              rel="noreferrer"
            >
              <button className="white-button">view the Author Twitter</button>
            </a>
            <br></br>
            <a
              href={aoLinkUrl} // Use the dynamic URL here
              target="_blank"
              rel="noreferrer"
            >
              <button className="white-button">
                check the description on ao.link
              </button>
            </a>
          </div>
        </div>

        {/* FOR MOBILE */}
        <div className="site-page-header-mobile">
          <NavLink to="/">
            <img className="app-logo" src="./logo.png" />
          </NavLink>
          <Portrait />
        </div>
      </div>
    );
  }
}

export default SitePage;
