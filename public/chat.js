const chatMessages = document.getElementById("chat-messages");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");
const typingIndicator = document.getElementById("typing-indicator");

// Load history
let chatHistory = JSON.parse(localStorage.getItem("chat_history") || "[]");

// Restore chat on load
window.addEventListener("load", () => {
	chatMessages.innerHTML = "";

	chatHistory.forEach((m) => {
		addMessageToChat(m.role, m.content, false);
	});
});

// Save history
function saveHistory() {
	localStorage.setItem("chat_history", JSON.stringify(chatHistory));
}

// Linkify function
function linkify(text) {
	const urlRegex = /(https?:\/\/[^\s]+)/g;
	return text.replace(
		urlRegex,
		(url) =>
			`<a href="${url}" target="_blank" style="color:blue;text-decoration:underline">${url}</a>`
	);
}

// Add message safely
function addMessageToChat(role, content, save = true) {
	const messageEl = document.createElement("div");
	messageEl.className = `message ${role}-message`;

	const p = document.createElement("p");
	p.innerHTML = linkify(content);

	messageEl.appendChild(p);
	chatMessages.appendChild(messageEl);

	chatMessages.scrollTop = chatMessages.scrollHeight;

	if (save) {
		chatHistory.push({ role, content });
		saveHistory();
	}
}

sendButton.addEventListener("click", sendMessage);

userInput.addEventListener("keydown", (e) => {
	if (e.key === "Enter" && !e.shiftKey) {
		e.preventDefault();
		sendMessage();
	}
});

async function sendMessage() {
	const message = userInput.value.trim();
	if (!message) return;

	addMessageToChat("user", message);

	userInput.value = "";
	userInput.style.height = "auto";

	typingIndicator.classList.add("visible");

	chatHistory.push({ role: "user", content: message });
	saveHistory();

	try {
		const response = await fetch("/api/chat", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				messages: chatHistory,
			}),
		});

		if (!response.ok) throw new Error("API error");

		const reader = response.body.getReader();
		const decoder = new TextDecoder();

		let assistantText = "";

		const assistantEl = document.createElement("div");
		assistantEl.className = "message assistant-message";

		const p = document.createElement("p");
		assistantEl.appendChild(p);
		chatMessages.appendChild(assistantEl);

		while (true) {
			const { value, done } = await reader.read();
			if (done) break;

			assistantText += decoder.decode(value, { stream: true });

			p.innerHTML = linkify(assistantText);

			chatMessages.scrollTop = chatMessages.scrollHeight;
		}

		chatHistory.push({ role: "assistant", content: assistantText });
		saveHistory();
	} catch (err) {
		console.error(err);
		addMessageToChat("assistant", "Error getting response");
	} finally {
		typingIndicator.classList.remove("visible");
	}
}
