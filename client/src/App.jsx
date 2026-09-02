import { useEffect, useState } from 'react'
import AppRoutes from './routes/AppRoutes'
import api from './services/api'


function App() {
useEffect(()=>{
  api.get("/../health").then((response)=>{
    console.log("Backend response",response.data)
  }).catch((error)=>{
    console.error("Backend connection failed",error)
  })
},[])
  return (
    <>
    <h1>Slotify</h1>
    <AppRoutes/>
    </>
  )
}

export default App
