import { Text, View } from 'react-native';
export function ReviewBanner() {
  if (process.env.EXPO_PUBLIC_REVIEW_BUILD !== 'true') return null;
  return <View style={{ backgroundColor: '#FFF6DE', paddingHorizontal: 24, paddingVertical: 10 }}><Text style={{ color: '#77521A', fontSize: 13, lineHeight: 21, textAlign: 'center' }}>Design preview · Cloud accounts are off. Revised policies are awaiting operator review.</Text></View>;
}
