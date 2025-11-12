//Referencia:https://openrouter.ai/openai/gpt-oss-20b:free
export interface BodyChat {
    "model": "openai/gpt-oss-20b:free",
    "messages": Array<{
        "role": "user" | "system" 
        "content": string
    }>
}

// Aqui el body también puede ser system porque ese es el role
// que voy a usar para que el entienda que yo soy el 
// que le proporciona la base de conocimiento
// el usuario es porque es para digamos mi cliente