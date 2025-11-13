# Cloudflare Agents SDK Setup Guide

**Status**: Preparation guide for future implementation
**Last Updated**: 2025-11-13

---

## Overview

This guide prepares for implementing AI chat using **Cloudflare Agents SDK** instead of AI SDK v5.

**Why Agents SDK?**
- Built specifically for Cloudflare Workers + Workers AI
- Native SSE streaming support (no protocol mismatch)
- Simpler architecture for Workers-first apps
- Official Cloudflare solution

---

## Installation

### Check Availability

The Agents SDK is in beta. Check if it's available:

```bash
pnpm search @cloudflare/agents-sdk
# If not found, use GitHub installation
```

### Option 1: NPM (when available)

```bash
pnpm add @cloudflare/agents-sdk
```

### Option 2: GitHub (current)

```bash
# Clone agents-starter repo and extract the agents package
git clone https://github.com/cloudflare/agents-starter
cd agents-starter
# Follow their installation instructions
```

---

## Prerequisites

1. **Cloudflare Account** ✅ (already configured)
2. **Workers AI binding** ✅ (already in wrangler.jsonc)
3. **Durable Objects** - Will need to configure

---

## Architecture Plan

### Backend: Agent Definition

```typescript
// src/modules/agents/chat.agent.ts
import { Agent } from '@cloudflare/agents-sdk';

export class ChatAgent extends Agent<Env, ChatState> {
  async onRequest(request: Request) {
    // Handle HTTP requests
  }

  async onConnect(websocket: WebSocket) {
    // Handle WebSocket connections
  }

  async onMessage(message: Message) {
    // Handle chat messages with Workers AI
    // Streams via SSE automatically
  }
}
```

### Frontend: Agent Hook

```typescript
// src/modules/agents/client/use-agent-chat.ts
import { useAgentChat } from '@cloudflare/agents-sdk/react';

export function useChat() {
  return useAgentChat({
    api: '/api/agents/chat',
    agentId: 'chat-session-id',
  });
}
```

---

## Wrangler Configuration

Add Durable Objects binding:

```jsonc
{
  "durable_objects": {
    "bindings": [
      {
        "name": "CHAT_AGENT",
        "class_name": "ChatAgent",
        "script_name": "next-cf-app"
      }
    ]
  },
  "migrations": [
    {
      "tag": "v1",
      "new_sqlite_classes": ["ChatAgent"]
    }
  ]
}
```

---

## Implementation Checklist

### Phase 1: Setup
- [ ] Install Agents SDK
- [ ] Configure Durable Objects in wrangler.jsonc
- [ ] Create agent module structure

### Phase 2: Backend
- [ ] Implement ChatAgent class
- [ ] Add API route: `/api/agents/chat`
- [ ] Test with Workers AI

### Phase 3: Frontend
- [ ] Create React hook wrapper
- [ ] Build chat UI component
- [ ] Test streaming responses

### Phase 4: Deploy
- [ ] Build for production
- [ ] Deploy to Cloudflare
- [ ] Verify SSE streaming works

---

## Resources

- **Agents SDK Docs**: https://developers.cloudflare.com/agents/
- **Agents Starter**: https://github.com/cloudflare/agents-starter
- **Workers AI**: https://developers.cloudflare.com/workers-ai/
- **Durable Objects**: https://developers.cloudflare.com/durable-objects/

---

## Next Steps

1. Wait for Agents SDK stable release OR use GitHub installation
2. Review agents-starter example code
3. Create implementation plan
4. Build and test

---

**Status**: Ready to implement when Agents SDK is available
