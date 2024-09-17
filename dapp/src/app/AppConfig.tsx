export class AppConfig {
  public static siteName = 'Up Up';
  public static secretPassword = 'ploy';

  public static menu = [
    {
      text: 'Index',
      to: '/',
      beta: false,
      loggedIn: false
    },
    {
      text: 'Games🔥',
      to: '/games',
      beta: false,
      loggedIn: false
    },
    {
      text: 'Ranking',
      to: '/rank',
      beta: false,
      loggedIn: false
    },
    {
      text: 'More',
      dropdown: true,
      items: [
        {
          text: 'WhitePaper',
          to: 'https://bodhi.wtf/15266',
          beta: false,
          loggedIn: false
        },
        {
          text: 'Buy Early Shares',
          to: 'https://bodhi.wtf/space/5/15192?action=buy',
          beta: false,
          loggedIn: false
        },
        {
          text: 'DL Login',
          to: '/dl-login',
          beta: false,
          loggedIn: false
        }
      ]
    }
  ];
}