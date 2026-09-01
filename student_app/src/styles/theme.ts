import colors from './colors';
import spacing from './spacing';
import typography from './typography';

const theme = {
  colors,
  spacing,
  typography,

  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    round: 999,
  },

  shadow: {
    small: {
      elevation: 2,
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.08,
      shadowRadius: 3,
    },

    medium: {
      elevation: 4,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 6,
    },
  },
};

export default theme;