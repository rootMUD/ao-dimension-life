import React from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import SitePage from "./pages/SitePage";
import ProfilePage from "./pages/ProfilePage";
import "./App.css";
import DLLoginPage from "./pages/DLLoginPage";
import RankPage from "./pages/RankPage";

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
          <Route path="/rank" element={<RankPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </HashRouter>
    );
  }
}

export default App;
