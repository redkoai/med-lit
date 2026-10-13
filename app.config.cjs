module.exports = ({config}) => {
 const iosClientId=process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
 const plugins=[...(config.plugins||[])];
 if(iosClientId){
  if(!/^[0-9]+-[a-zA-Z0-9_-]+\.apps\.googleusercontent\.com$/.test(iosClientId))throw new Error('Invalid Google iOS client identifier');
  plugins.push(['@react-native-google-signin/google-signin',{iosUrlScheme:'com.googleusercontent.apps.'+iosClientId.replace('.apps.googleusercontent.com','')}]);
 }
 return {...config,plugins};
};
