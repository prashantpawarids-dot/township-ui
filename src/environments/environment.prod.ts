import packageInfo from '../../package.json';

export const environment = {
  appVersion: packageInfo.version,
  // apiurl: 'http://localhost:5555/api/',
     //client server ip
  apiurl: 'http://192.168.0.9:5253/api/',
  //  apiurl: 'http://192.168.1.43:5253/api/',
  //office PC IP
  //  apiurl: 'http://192.168.1.9:5253/api/',
  
   
  production: true
};
