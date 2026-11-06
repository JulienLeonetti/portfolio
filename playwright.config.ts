import { defineConfig } from '@playwright/test';
export default defineConfig({
 testDir:'./tests',timeout:60000,workers:1,
 use:{baseURL:'http://127.0.0.1:5185',browserName:'chromium',launchOptions:{args:['--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']}},
 webServer:{command:'node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5185 --strictPort',url:'http://127.0.0.1:5185',reuseExistingServer:!process.env.CI},
});