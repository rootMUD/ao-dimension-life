import React from 'react';
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
        <div key={menu.text} className="relative inline-block text-left">
          <button
            onClick={() => this.setState({ dropdownOpen: !this.state.dropdownOpen })}
            className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500"
          >
            {menu.text}
          </button>
          {this.state.dropdownOpen && (
            <div className="absolute right-0 w-56 mt-2 origin-top-right bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
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
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                {/* Add your logo here if needed */}
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {buttons}
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  }
}

export default NavBar;
