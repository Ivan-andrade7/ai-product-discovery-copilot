import {useState} from 'react'
import App from '../App.jsx'
import {createTestEnvironment} from './test-adapters.js'
import './e1.css'
export default function E1Development(){
 const [environment]=useState(()=>createTestEnvironment(window.localStorage))
 const [session,setSession]=useState(false),[denied,setDenied]=useState(false)
 return <><aside className="storage-banner"><strong>SIMULACIÓN LOCAL · sin Google, continuidad remota ni IA real</strong>{session&&<button className="button" onClick={()=>{environment.auth.signOut();setSession(false)}}>Cerrar sesión de prueba</button>}</aside>
 {session?<App environment={environment}/>:<main className="form-page"><h1>Acceso de prueba</h1><p>Mismo producto y modelo, con repositorio de prueba aislado. No demuestra seguridad remota.</p>{denied&&<p role="alert">Acceso denegado.</p>}<button className="button primary" onClick={()=>{setSession(environment.auth.signIn('ivan'));setDenied(false)}}>Simular acceso de Iván</button><button className="button" onClick={()=>{environment.auth.signIn('other');setDenied(true)}}>Simular acceso no autorizado</button></main>}</>
}
