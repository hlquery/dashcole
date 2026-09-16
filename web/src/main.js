import { createApp } from 'vue';
import { createVuetify } from 'vuetify';
import '@mdi/font/css/materialdesignicons.css';
import 'animate.css';
import 'vuetify/styles';
import App from './App.vue';
import './design/tokens.css';
import './styles.css';
import './design/components.css';
import './design/student-profile.css';

const vuetify = createVuetify({
  theme: {
    defaultTheme: 'dashcole',
    themes: {
      dashcole: {
        dark: false,
        colors: {
          primary: '#0e2535',
          secondary: '#0f766e',
          success: '#15803d',
          warning: '#c27803',
          error: '#c2410c',
          surface: '#ffffff',
          background: '#f5f7fa',
        },
      },
    },
  },
  defaults: {
    VBtn: { elevation: 0, rounded: 'lg' },
    VCard: { elevation: 0, rounded: 'lg' },
    VChip: { rounded: 'lg' },
    VProgressCircular: { width: 5 },
    VProgressLinear: { rounded: true, height: 8 },
  },
});

createApp(App).use(vuetify).mount('#app');
