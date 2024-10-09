import React from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import SitePage from "./pages/SitePage";
import ProfilePage from "./pages/ProfilePage";
import "./App.css";
import DLLoginPage from "./pages/DLLoginPage";
import RankPage from "./pages/RankPage";
import GamesPage from "./pages/GamesPage";

class App extends React.Component<{}, {}> {
  constructor(props = {}) {
    super(props);
  }

  componentDidMount() {}

  render() {
    return (
      <HashRouter>
        <Routes>
          <Route path="/" element={<SitePage />} />
          <Route path="/dl-login" element={<DLLoginPage />} />
          {/* <Route path="/playground" element={<PlaygroundPage />} /> */}
          <Route path="/rank" element={<RankPage />} />
          <Route path="/games" element={<GamesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </HashRouter>
    );
  }
}

export default App;
