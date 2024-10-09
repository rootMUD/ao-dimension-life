import React from 'react';
import './NavBar.css';
import { AppConfig } from '../AppConfig';
import NavBarButton from './NavBarButton';
import { Server } from '../../server/server';
import { subscribe } from '../util/event';

interface NavBarProps {
  address: string | null;
}

interface NavBarState {
  dropdownOpen: boolean;
}

class NavBar extends React.Component<NavBarProps, NavBarState> {
  constructor(props: NavBarProps) {
    super(props);
    this.state = {
      dropdownOpen: false
    };
    subscribe('wallet-events', () => {
      this.forceUpdate();
    });
  }

  renderButton(menu: any) {
    if (menu.dropdown) {
      return (
        <div key={menu.text} className="dropdown">
          <button onClick={() => this.setState({ dropdownOpen: !this.state.dropdownOpen })}>
            {menu.text}
          </button>
          {this.state.dropdownOpen && (
            <div className="dropdown-content">
              {menu.items.map((item: any) => this.renderButton(item))}
            </div>
          )}
        </div>
      );
    }
    return (
      <NavBarButton
        key={menu.text}
        text={menu.text}
        to={menu.to}
        beta={menu.beta}
        new={menu.new}
      />
    );
  }

  render() {
    let buttons = AppConfig.menu.map(menuItem => {
      if (menuItem.loggedIn && !Server.service.isLoggedIn()) {
        return null;
      }
      return this.renderButton(menuItem);
    }).filter(Boolean);

    return (
      <nav>
        <div className="navbar-container">{buttons}</div>
      </nav>
    );
  }
}

export default NavBar;
