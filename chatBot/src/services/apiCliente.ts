// src/services/apiCliente.ts
import type { BodyChat } from "@/interfaces/BodyChat"
import type { RespuestaChat } from "@/interfaces/RespuestaChat"


const API_URL = import.meta.env.VITE_API_URL as string


// Le enviamso el servicio de body como parametro y solo vamos a esperar
// la respuesta, el body siempre es json 
export const enviarMensaje = async (body: BodyChat): Promise<RespuestaChat> => {
  
  console.log('Enviando a:', API_URL);
  console.log('Body:', JSON.stringify(body, null, 2));
  
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body)
    })

    console.log('Response status:', response.status); // Debug
    console.log('Response headers:', response.headers); // Debug

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText); // Debug
      throw new Error(`Error en la API: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const data: RespuestaChat = await response.json()
    console.log('Response data:', data); // Debug
    return data
  } catch (error) {
    console.error('Fetch error:', error); // Debug
    throw error;
  }
}
