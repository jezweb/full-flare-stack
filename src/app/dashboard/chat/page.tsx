"use client";

import { useChat } from "@ai-sdk/react";
import { Conversation } from "@/components/ai-elements/conversation";
import {
	Message,
	MessageAvatar,
	MessageContent,
} from "@/components/ai-elements/message";
import {
	PromptInput,
	PromptInputTextarea,
	PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import { BotIcon, UserIcon } from "lucide-react";

export default function ChatPage() {
	const { messages, input, handleInputChange, handleSubmit, isLoading, error } =
		useChat({
			api: "/api/chat",
		});

	return (
		<div className="flex h-full flex-col">
			<div className="border-b px-6 py-4">
				<h1 className="text-2xl font-semibold">AI Chat</h1>
				<p className="text-sm text-muted-foreground">
					Chat with GPT-OSS-120B powered by Workers AI
				</p>
			</div>

			<Conversation className="flex-1">
				{messages.length === 0 ? (
					<div className="flex h-full items-center justify-center">
						<div className="text-center">
							<BotIcon className="mx-auto size-12 text-muted-foreground/50" />
							<h2 className="mt-4 text-lg font-semibold">
								Start a conversation
							</h2>
							<p className="mt-2 text-sm text-muted-foreground">
								Ask me anything! I'm powered by a 120B parameter model.
							</p>
						</div>
					</div>
				) : (
					messages.map((message) => (
						<Message key={message.id} from={message.role}>
							<MessageAvatar>
								{message.role === "user" ? (
									<UserIcon className="size-4" />
								) : (
									<BotIcon className="size-4" />
								)}
							</MessageAvatar>
							<MessageContent>{message.content}</MessageContent>
						</Message>
					))
				)}
			</Conversation>

			{error && (
				<div className="border-t border-destructive/20 bg-destructive/10 px-6 py-3">
					<p className="text-sm text-destructive">
						Error: {error.message || "Failed to send message. Please try again."}
					</p>
				</div>
			)}

			<div className="border-t p-4">
				<PromptInput onSubmit={handleSubmit}>
					<PromptInputTextarea
						value={input}
						onChange={handleInputChange}
						placeholder="Type your message..."
						disabled={isLoading}
					/>
					<PromptInputSubmit disabled={isLoading || !input.trim()} />
				</PromptInput>
			</div>
		</div>
	);
}
