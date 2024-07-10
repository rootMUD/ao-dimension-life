import React from 'react';
import './PetCard.css';

interface PetCardProps {
  id: number;
  name: string;
  description: string;
  level: number;
  type: number;
  lastUpdated: number;
  onFeed: () => void; // Add onFeed prop
}

interface PetCardState {
  name: string;
  description: string;
  level: number;
  type: number;
  isFeedingEnabled: boolean;
  timeRemaining: number;
}

class PetCard extends React.Component<PetCardProps, PetCardState> {
  timer: NodeJS.Timeout | null = null;

  constructor(props: PetCardProps) {
    super(props);
    this.state = {
      name: this.props.name,
      description: this.props.description,
      level: this.props.level,
      type: this.props.type,
      isFeedingEnabled: false,
      timeRemaining: 0
    };
  }

  componentDidMount() {
    this.updateFeedingStatus();
    this.timer = setInterval(() => {
      this.updateFeedingStatus();
    }, 1000);
  }

  componentDidUpdate(prevProps: PetCardProps) {
    if (
      prevProps.name !== this.props.name ||
      prevProps.description !== this.props.description ||
      prevProps.level !== this.props.level ||
      prevProps.type !== this.props.type
    ) {
      this.setState({
        name: this.props.name,
        description: this.props.description,
        level: this.props.level,
        type: this.props.type
      });
    }
  }

  componentWillUnmount() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  updateFeedingStatus() {
    const { lastUpdated } = this.props;
    const currentTime = Date.now();
    const timeElapsed = (currentTime - lastUpdated) / 1000;
    const timeRemaining = 3600 - timeElapsed;

    if (timeRemaining <= 0) {
      this.setState({ isFeedingEnabled: true, timeRemaining: 0 });
    } else {
      this.setState({ isFeedingEnabled: false, timeRemaining });
    }
  }

  handleFeed = () => {
    this.props.onFeed();
  };

  getSymbol(type: number) {
    if (type >= 0 && type < 333) {
      return "ฅ^•ﻌ•^ฅ";
    } else if (type >= 333 && type < 666) {
      return "ʕ´•ᴥ•`ʔ";
    } else if (type >= 666 && type < 999) {
      return "૮₍ • ᴥ • ₎ა";
    } else {
      return "";
    }
  }

  formatTime(seconds: number) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h}:${m}:${s}`;
  }

  render() {
    const { name, description, level, type } = this.state;
    const { isFeedingEnabled, timeRemaining } = this.state;
    const symbol = this.getSymbol(type);

    return (
      <div className="pet-card">
        <h2>🐣{name}🐣</h2>
        <p>{description}</p>
        <p><b>Level: </b>{level}</p>
        <p><b>Type: </b>&nbsp;{symbol}</p>
        <button 
          onClick={this.handleFeed} 
          disabled={!isFeedingEnabled}
          style={{
            backgroundColor: isFeedingEnabled ? '#4CAF50' : '#d3d3d3',
            cursor: isFeedingEnabled ? 'pointer' : 'not-allowed'
          }}
        >
          Feed
        </button>
        {!isFeedingEnabled && (
          <p>Time remaining to feed: {this.formatTime(timeRemaining)}</p>
        )}
      </div>
    );
  }
}

export default PetCard;
