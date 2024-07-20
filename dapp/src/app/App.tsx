import React from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import SitePage from "./pages/SitePage";
import NotFoundPage from "./pages/NotFoundPage";
import "./App.css";
import HomePage from "./pages/HomePage";
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

          <Route path="/rank" element={<RankPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </HashRouter>
    );
  }
}

export default App;
