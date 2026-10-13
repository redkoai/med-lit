import {useState} from 'react';
import {Pressable,ScrollView,Text,View,useWindowDimensions} from 'react-native';
import {SafeAreaView,useSafeAreaInsets} from 'react-native-safe-area-context';
import {router} from 'expo-router';
import {Ionicons} from '@expo/vector-icons';
import {useAuth} from '../hooks/useAuth';
import {Colors as C} from '../constants/colors';
import {BrandMark} from './BrandMark';
const links=[['Read','/','workspace'],['Library','/history','library'],['Learn','/learn','learn'],['Methodology','/methodology','methodology'],['FAQ','/faq','faq'],['AI & settings','/settings','settings']] as const;
/** Native navigation cannot rely on website CSS media queries for its menu. */
export function WorkspaceHeader({active='workspace'}:{active?:string}){
 const [open,setOpen]=useState(false),{user}=useAuth();
 const {height}=useWindowDimensions();const insets=useSafeAreaInsets();
 const navigate=(path:string)=>{setOpen(false);router.push(path as never);};
 return <SafeAreaView edges={['top']} style={{backgroundColor:'white',borderBottomWidth:1,borderColor:'#DBE5EB'}}><View style={{paddingHorizontal:22,paddingVertical:12,gap:12}}>
  <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
   <Pressable accessibilityRole="link" accessibilityLabel="MedLit home" onPress={()=>navigate('/')} style={{minHeight:44,flexDirection:'row',alignItems:'center',gap:9}}><BrandMark /><Text style={{fontSize:27,fontWeight:'700',letterSpacing:-1.4,color:C.primary}}>medlit<Text style={{color:C.accent}}>.</Text></Text></Pressable>
   <Pressable accessibilityRole="button" accessibilityLabel={open?'Close navigation':'Open navigation'} accessibilityState={{expanded:open}} onPress={()=>setOpen(!open)} style={{minHeight:44,minWidth:70,alignItems:'center',justifyContent:'center',flexDirection:'row',gap:8}}><Text style={{color:C.primary}}>Menu</Text><Ionicons name={open?'close':'menu-outline'} size={23} color={C.primary}/></Pressable>
  </View>
  {open&&<ScrollView nestedScrollEnabled style={{maxHeight:Math.max(140,height-insets.top-insets.bottom-110)}} contentContainerStyle={{gap:4,paddingBottom:8}} keyboardShouldPersistTaps="handled">{links.map(([label,path,id])=><Pressable key={id} accessibilityRole="link" accessibilityState={{selected:active===id}} onPress={()=>navigate(path)} style={{minHeight:46,justifyContent:'center',paddingHorizontal:14,borderRadius:10,backgroundColor:active===id?C.accentLight:'transparent'}}><Text style={{color:C.primary,fontWeight:'600'}}>{label}</Text></Pressable>)}<Pressable accessibilityRole="link" onPress={()=>navigate(user?'/profile':'/auth')} style={{minHeight:48,justifyContent:'center',paddingHorizontal:14,borderRadius:10,backgroundColor:C.accentLight}}><Text style={{color:C.primary,fontWeight:'600'}}>{user?'Your account':'Sign in'}</Text></Pressable></ScrollView>}
 </View></SafeAreaView>;
}
