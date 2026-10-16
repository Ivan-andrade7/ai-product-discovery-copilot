import {protectedConfig} from './config.mjs'
import {createDurableStore} from './store.mjs'
import {createServerlessApi} from './api.mjs'

export async function protectedEntry(req,res,path,env=process.env) {
  let config
  try{config=protectedConfig(env)}catch{res.writeHead(404,{'Cache-Control':'no-store'});res.end();return}
  // Each invocation constructs its own handler. All mutable state is in Postgres.
  await createServerlessApi(config,createDurableStore(config))(req,res,path)
}
