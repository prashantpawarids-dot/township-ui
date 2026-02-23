import packageInfo from '../../package.json';

export const environment = {
  appVersion: packageInfo.version,
  apiurl: 'http://localhost:5055/api/',
  // apiurl: 'http://192.168.0.9:5253/api/',
  //  apiurl: 'http://192.168.1.43:5000/api/',
   
  production: true
};
