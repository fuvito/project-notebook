import { defineConfig } from 'wxt';

export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'Project Notebook',
    description: 'A local-first notebook for project links and notes.',
    permissions: ['storage', 'activeTab'],
    icons: {
      16: 'icon16.png',
      48: 'icon48.png',
      128: 'icon128.png',
    },
    action: {
      default_icon: {
        16: 'icon16.png',
        48: 'icon48.png',
        128: 'icon128.png',
      },
    },
  },
});
