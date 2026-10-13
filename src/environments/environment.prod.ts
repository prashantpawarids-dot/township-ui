// import packageInfo from '../../package.json';

// export const environment = {
//   // appVersion: packageInfo.version,
//   // apiurl: 'http://localhost:5555/api/',

//      //client server ip
//   apiurl: 'http://192.168.0.9:5253/api/',


//   //Testing on Client Side
//   // apiurl: 'http://192.168.0.9:8181/api/',




  
//   //office PC IP
// // apiurl: 'http:// 192.168.1.6:5253/api/',
  
   
//   production: true
// };


import packageInfo from '../../package.json';

export const environment = {
  production: true,

   apiurl: 'http://localhost:5555/api/',
  // apiurl: 'http://192.168.0.9:5253/api/',
  appVersion: packageInfo.version
};