import { StdioServerTransport } from '@modelcontextprotocol/server/stdio'
import { createServer } from './server.js'

const transport = new StdioServerTransport()

try {
  await createServer().connect(transport)
} catch (error) {
  // stdout 은 프로토콜이 쓴다 — 진단은 stderr 로만 나간다.
  console.error('MCP 서버를 띄우지 못했다:', error)
  process.exit(1)
}
