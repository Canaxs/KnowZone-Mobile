// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<string, ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'person.fill': 'person',
  'gearshape.fill': 'settings',
  'lock.fill': 'lock',
  'bell.fill': 'notifications',
  'questionmark.circle.fill': 'help',
  'info.circle.fill': 'info',
  'rectangle.portrait.and.arrow.right.fill': 'logout',
  'person.2.fill': 'people',
  'book.fill': 'book',
  'message.fill': 'chat',
  'bubble.left.and.bubble.right.fill': 'chat',
  'person.circle.fill': 'account-circle',
  'magnifyingglass': 'search',
  'plus': 'add',
  'line.3.horizontal': 'menu',
  'style': 'style',
  'heart.fill': 'favorite',
  'star.fill': 'star',
  'slider.horizontal.3': 'tune',
  'ellipsis': 'more-horiz',
  'notifications-fill': 'notifications'
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
