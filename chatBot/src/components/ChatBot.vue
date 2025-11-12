<script setup lang="ts">
import { ref } from 'vue';
import baseConocimiento from '../../data/baseConocimiento.json';
import Fuse from 'fuse.js'
import { enviarMensaje as enviarMensajeAPI } from '@/services/apiCliente'
import type { BodyChat } from '@/interfaces/BodyChat'
import MessageBubble from './MessageBubble.vue'
import type { Message } from '@/interfaces/ChatBot'

const messages = ref<Message[]>([
  { id: '1', text: 'Hola Tilin! ¿En qué puedo ayudarte?', sender: 'bot', time: new Date().toLocaleTimeString() },
])

const mensajeUsuario = ref("")
const respuestaBot = ref("")

// Esto es para buscar las coincidencias 
// https://www.hablemosdefrontend.dev/post/busqueda-difusa-en-cliente-con-fusejs/
const fuse = new Fuse(Object.keys(baseConocimiento), {
  includeScore: true,
  threshold: 0.4,
})

// Palabras a bloquear 
const blockedRe = /\b(insult|ofensiv|vulgar|sex|sexual|porno|pornograf|violenci|amenaz|matar|asesin|violaci|suicid|odio|rac|discrimin)\b/i
const rechazo = "No puedo responder eso."

const systemBaseConMatch =
  "Eres un asistente general, breve (máx 2 frases), amistoso y con humor ligero. Responde SOLO usando el fragmento dado. Ademas dile 'Tilin' a los usuarios"
const systemBaseNoMatch =
  "Eres un asistente general, breve (máx 2 frases), amistoso y con humor ligero. Si no sabes algo dilo sin inventar y sugiere reformular."

function scrollToBottom() {
  requestAnimationFrame(() => {
    const el = document.querySelector('.chatbot-messages') as HTMLElement | null
    if (el) el.scrollTop = el.scrollHeight
  })
}

const enviarMensaje = async () => {
  try {
    const preguntaOriginal = mensajeUsuario.value
    const pregunta = (preguntaOriginal || '').trim()
    if (!pregunta) return

    // Limpiamos input
    mensajeUsuario.value = ""

    // Registro de mensaje de user en ui
    messages.value.push({
      id: (messages.value.length + 1).toString(),
      text: pregunta,
      sender: 'user',
      time: new Date().toLocaleTimeString(),
    })
    scrollToBottom()

    // La pregunta tiene palabras bloqueadas?
    if (blockedRe.test(pregunta)) {
      messages.value.push({
        id: (messages.value.length + 1).toString(),
        text: rechazo,
        sender: 'bot',
        time: new Date().toLocaleTimeString(),
      })
      scrollToBottom()
      return
    }
    // Delay para no saturar el api
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Buscamos en la base de conocimiento
    const busqueda = fuse.search(pregunta)
    let data: any

    if (busqueda.length > 0 && busqueda[0]?.item) {
      const resultado = busqueda[0].item
      const respuesta = baseConocimiento[resultado as keyof typeof baseConocimiento]

      const body: BodyChat = {
        model: "openai/gpt-oss-20b:free",
        messages: [
          {
            role: "system",
            content: `${systemBaseConMatch}\n\nFragmento:\n${respuesta}`
          },
          { role: "user", content: pregunta }
        ]
      }

      data = await enviarMensajeAPI(body)
      respuestaBot.value =
        data?.choices?.[0]?.message?.content?.trim() ||
        "No encuentro esa información exacta en el sistema, pero puedo ayudarte con pasos generales o derivarte a un canal oficial."
    } else {
        const body: BodyChat = {
        model: "openai/gpt-oss-20b:free",
        messages: [
          { role: "system", content: systemBaseNoMatch },
          { role: "user", content: pregunta }
        ]
      }

      data = await enviarMensajeAPI(body)
      respuestaBot.value =
        data?.choices?.[0]?.message?.content?.trim() ||
        "No tengo esa información específica, pero te puedo orientar de forma general. También puedes consultar la web oficial o atención al cliente para detalles concretos."
    }
    // Creamos el mensaje de respuesta del bot
    messages.value.push({
      id: (messages.value.length + 1).toString(),
      text: respuestaBot.value,
      sender: 'bot',
      time: new Date().toLocaleTimeString(),
    })
    scrollToBottom()
  } catch (error) { 
    console.error("Error al enviar mensaje:", error)
    const fallback = error instanceof Error && error.message.includes('429') 
      ? "Demasiadas consultas. Espera un momento antes de enviar otro mensaje."
      : "Estoy teniendo problemas para procesar la solicitud ahora mismo. Intenta nuevamente en unos minutos."
    
    messages.value.push({
      id: (messages.value.length + 1).toString(),
      text: fallback,
      sender: 'bot',
      time: new Date().toLocaleTimeString(),
    })
    scrollToBottom()
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-slate-950 to-slate-900">
    <div
      class="w-full max-w-2xl h-[80vh] md:h-[70vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden
             bg-gradient-to-b from-violet-900 via-violet-500 to-indigo-900 text-gray-100"
    >
      <header class="px-6 py-4 flex items-center justify-between border-b border-purple-700/60">
        <h2 class="text-xl font-semibold">ChatBot</h2>
        <span class="text-sm text-purple-300 hidden sm:inline">Modo oscuro</span>
      </header>

      <main class="flex-1 overflow-auto p-4 chatbot-messages flex flex-col gap-4">
        <MessageBubble
          v-for="(msg, i) in messages"
          :key="msg.id"
          :message="msg"
          :index="i"
        />
      </main>

      <footer class="px-4 py-3 bg-purple-950/40 border-t border-purple-800/60">
        <div class="flex gap-3">
          <input
            v-model="mensajeUsuario"
            @keyup.enter="enviarMensaje"
            type="text"
            class="flex-1 rounded-lg bg-purple-900/60 placeholder:text-purple-300 px-4 py-2
                   focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            placeholder="Pregunta algo..."
            aria-label="Mensaje"
          />
          <button
            @click="enviarMensaje"
            class="px-4 py-2 rounded-lg bg-gradient-to-br from-fuchsia-600 to-purple-600
                   hover:opacity-95 active:scale-95 transition text-white"
          >
            Enviar
          </button>
        </div>
      </footer>
    </div>
  </div>
</template>

<style scoped></style>
