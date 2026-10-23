import type { Preview } from '@storybook/nextjs-vite'

import '../styles/tokens.css'
import '../styles/typography.css'
import '../styles/effects.css'
import '../app/globals.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
    options: {
      storySort: {
        order: [
          'Foundation',
          ['Design Tokens', 'Color', 'Typography', 'Iconography'],
          'Components',
          ['Action', 'Form', 'Navigation', 'Feedback', 'Etc'],
          '*',
        ],
      },
    },
  },
};

export default preview;
