import {protectedEntry} from '../../server/protected/entry.mjs'
export default (req,res)=>protectedEntry(req,res,'auth/callback')
