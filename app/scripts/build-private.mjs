import {build} from 'vite'
if(process.env.TP_BUILD_TARGET!=='protected-test'||(process.env.VERCEL_ENV && process.env.VERCEL_ENV!=='preview'))throw Error('private-build-disabled')
await build({mode:'private-test',build:{outDir:'dist-private',rollupOptions:{input:'protected.html'}}})
