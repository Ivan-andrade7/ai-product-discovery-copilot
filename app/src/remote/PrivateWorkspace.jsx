import {useEffect,useState} from 'react'
import App from '../App.jsx'
import {callPrivate,loadPrivateEnvironment} from './client.js'

export default function PrivateWorkspace(){
 const [state,setState]=useState({loading:true}),[reload,setReload]=useState(0)
 useEffect(()=>{let active=true;loadPrivateEnvironment().then(environment=>{if(active)setState({environment})}).catch(error=>{if(active)setState({error:error.message})});return()=>{active=false}},[reload])
 async function logout(){state.environment?.deactivate();setState({loading:true});try{await callPrivate('logout',{});setState({error:'signed-out'})}catch{setState({error:'logout-uncertain'})}}
 if(state.environment)return <><aside className="storage-banner"><strong>PRUEBA PRIVADA · Google real y persistencia remota · proveedor según configuración del servidor</strong></aside><App environment={state.environment} onLogout={logout}/></>
 return <main className="form-page access-page"><section className="access-card">
  <h1>Espacio privado de Iván</h1>
  {state.loading?<p role="status">Comprobando sesión y datos remotos…</p>:<>
   <p role="alert">{state.error==='permission'||new URLSearchParams(location.search).get('access')==='denied'?'Acceso denegado o sesión no iniciada. Sólo las identidades Google autorizadas pueden ingresar.':state.error==='signed-out'?'Sesión cerrada.':state.error==='logout-uncertain'?'No se pudo confirmar la revocación remota. El trabajo quedó oculto; reintentá el cierre de sesión.':'No se pudo confirmar la conexión. No se cargó ni reemplazó el trabajo.'}</p>
   <div className="action-group">{state.error==='logout-uncertain'?<button className="button" onClick={logout}>Reintentar cierre de sesión</button>:<><a className="button primary" href="/api/login">Ingresar con Google</a><button className="button" onClick={()=>{setState({loading:true});setReload(v=>v+1)}}>Reintentar lectura</button></>}</div>
  </>}
 </section></main>
}
