import type { Language } from '#/lib/types'

export const DATA_SAMPLES: Partial<Record<Language, ReadonlyArray<string>>> = {
  json: [
    `{
  "name": "code-pretty",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "test": "vitest"
  },
  "dependencies": {
    "react": "^19.0.0",
    "shiki": "^4.0.0"
  },
  "keywords": ["code", "image", "social"],
  "engines": { "node": ">=20" }
}
`,
  ],
  yaml: [
    `name: ci
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node: [20, 22]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: 9
      - name: Install
        run: pnpm install
      - name: Test
        run: |
          pnpm test
          pnpm typecheck
        env:
          CI: true
`,
  ],
  toml: [
    `[package]
name = "my-crate"
version = "0.1.0"
edition = "2021"
authors = ["Jane <jane@example.com>"]

[dependencies]
serde = { version = "1.0", features = ["derive"] }
tokio = { version = "1", features = ["full"] }
anyhow = "1.0"

[dev-dependencies]
proptest = "1.4"

[[bin]]
name = "server"
path = "src/bin/server.rs"

[features]
default = ["tls"]
tls = ["rustls"]
`,
  ],
  xml: [
    `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Example Feed</title>
  <link href="https://example.com/" />
  <updated>2025-01-01T00:00:00Z</updated>
  <author>
    <name>John Doe</name>
  </author>
  <id>urn:uuid:60a76c80-d399-11d9-b93C-0003939e0af6</id>
  <entry>
    <title>Atom-Powered Robots</title>
    <link href="https://example.com/2025/01/01/atom" />
    <id>urn:uuid:1225c695-cfb8-4ebb-aaaa-80da344efa6a</id>
    <updated>2025-01-01T18:30:02Z</updated>
    <summary>Some text.</summary>
    <content type="html"><![CDATA[<p>Hello!</p>]]></content>
  </entry>
</feed>
`,
  ],
  md: [
    `# Project Title

A short description of the project.

## Installation

\`\`\`bash
pnpm install
\`\`\`

## Usage

Visit [the docs](https://example.com) for details.

- First item
- Second item
- Third item

> Note: this is important.

### Features

1. Fast
2. Reliable
3. **Easy** to use

![Logo](logo.png)

| Name | Value |
| ---- | ----- |
| foo  | bar   |
`,
  ],
  graphql: [
    `type Query {
  user(id: ID!): User
  posts(filter: PostFilter, limit: Int = 10): [Post!]!
  search(term: String!): SearchResult
}

type Mutation {
  createPost(input: CreatePostInput!): Post!
  deletePost(id: ID!): Boolean!
}

type Subscription {
  postAdded: Post!
}

type User {
  id: ID!
  name: String!
  email: String
  posts: [Post!]!
}

input PostFilter {
  authorId: ID
  publishedAfter: DateTime
}

union SearchResult = User | Post

fragment UserBasics on User {
  id
  name
}

scalar DateTime
enum Role { ADMIN MEMBER GUEST }
`,
  ],
  sql: [
    `-- find recent posts with author info
SELECT p.id, p.title, p.created_at, u.name AS author
FROM posts p
INNER JOIN users u ON u.id = p.author_id
LEFT JOIN tags t ON t.post_id = p.id
WHERE p.published = TRUE
  AND p.created_at >= NOW() - INTERVAL '7 days'
GROUP BY p.id, u.name
HAVING COUNT(t.id) > 0
ORDER BY p.created_at DESC
LIMIT 20;

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO users (email) VALUES ('a@b.com')
ON CONFLICT (email) DO NOTHING;

UPDATE posts SET views = views + 1 WHERE id = $1;
DELETE FROM sessions WHERE expires_at < NOW();
`,
  ],
}
