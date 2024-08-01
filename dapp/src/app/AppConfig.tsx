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
      text: 'DL Login',
      to: '/dl-login',
      beta: false,
      loggedIn: false
    }, 
    {
      text: 'Playground',
      to: '/playground',
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
      text: 'WhitePaper',
      to: 'https://bodhi.wtf/15266',
      beta: false,
      loggedIn: false
    }, 
    {
      text: 'Buy Early Shares',
      to: 'https://bodhi.wtf/space/5/15192',
      beta: false,
      loggedIn: false
    }
  ];
}