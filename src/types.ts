/**
 * Type definitions for the LLM chat application.
 */

/**
 * Cloudflare Worker environment bindings
 */
export interface Env {
	AI: Ai;
	ASSETS: { fetch: (request: Request) => Promise<Response> };
}

/**
 * Chat message structure
 */
export interface ChatMessage {
	role: "system" | "user" | "assistant";
	content: string;
}

/**
 * API request body (clean extension for future features like history)
 */
export interface ChatRequest {
	messages: ChatMessage[];

	// optional future feature (chat history id)
	sessionId?: string;
}
