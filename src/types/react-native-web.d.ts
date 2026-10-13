import 'react-native';
declare module 'react-native' {
  interface ViewProps { dataSet?: Record<string, string | number | boolean>; }
  interface TextProps { dataSet?: Record<string, string | number | boolean>; }
}
