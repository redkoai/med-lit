import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {createSecureAuthStorage} from './secureAuthStorageCore';
// Firebase refresh credentials stay in the device-only Keychain. Remove the
// exact legacy persistence key when Firebase asks for it; never sweep guest data.
export const secureAuthStorage=createSecureAuthStorage({
 getItemAsync:SecureStore.getItemAsync,
 setItemAsync:(key,value)=>SecureStore.setItemAsync(key,value,{keychainAccessible:SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY}),
 deleteItemAsync:SecureStore.deleteItemAsync,
},async key=>'auth.'+await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256,key),()=>Crypto.randomUUID(),key=>AsyncStorage.removeItem(key));
