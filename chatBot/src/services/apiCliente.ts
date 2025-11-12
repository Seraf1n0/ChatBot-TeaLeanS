// src/services/apiCliente.ts
import type { BodyChat } from "@/interfaces/BodyChat"
import type { RespuestaChat } from "@/interfaces/RespuestaChat"


const API_URL = import.meta.env.VITE_API_URL as string


// Le enviamso el servicio de body como parametro y solo vamos a esperar
// la respuesta, el body siempre es json 
export const enviarMensaje = async (body: BodyChat): Promise<RespuestaChat> => {
  
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body)
  })

  if (!response.ok) {
    throw new Error(`Error en la API: ${response.statusText}`)
  }

  const data: RespuestaChat = await response.json()
  return data
}
