import React from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import SitePage from "./pages/SitePage";
import NotFoundPage from "./pages/NotFoundPage";
import "./App.css";
import DLLoginPage from "./pages/DLLoginPage";
import RankPage from "./pages/RankPage";
import PlaygroundPage from "./pages/PlaygroundPage";

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
          <Route path="/playground" element={<PlaygroundPage />} />
          <Route path="/rank" element={<RankPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </HashRouter>
    );
  }
}

export default App;
