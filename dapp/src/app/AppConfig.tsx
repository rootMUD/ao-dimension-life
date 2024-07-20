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
      text: 'Rank',
      to: '/rank',
      beta: false,
      loggedIn: false
    }, 
    {
      text: 'WhitePaper',
      to: 'https://bodhi.wtf/todo.',
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