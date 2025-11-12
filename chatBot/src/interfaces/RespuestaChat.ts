//Referencia:https://openrouter.ai/openai/gpt-oss-20b:free con el curl
export interface RespuestaChat {
    "choices": Array<{
        "message": {
            "content": string
        }
    }>
}

// Esto es lo que me debe devolver el botcito ararar