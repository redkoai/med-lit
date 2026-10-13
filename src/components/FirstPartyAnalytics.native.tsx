import {Text,View} from 'react-native';
import {guide as s} from './GuidePage';
export function ProductLoopObserver(){return null;}
export function FirstPartyAnalyticsPreferences(){
 return <View style={s.card}><Text style={s.heading}>Product analytics</Text><Text style={s.body}>Optional product analytics are off in this native build. Your saved library and AI-provider connection are separate.</Text></View>;
}
