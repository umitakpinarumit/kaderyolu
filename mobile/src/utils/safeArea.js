import { Platform, StatusBar } from 'react-native';

// Android edge-to-edge (API 35+) için status bar yüksekliğini al.
// iOS için notch/Dynamic Island varsayılan değeri.
export const SAFE_TOP = Platform.OS === 'android'
  ? (StatusBar.currentHeight || 24) + 4
  : 54;
