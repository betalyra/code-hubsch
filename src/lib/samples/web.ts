import type { Language } from '#/lib/types'

export const WEB_SAMPLES: Partial<Record<Language, ReadonlyArray<string>>> = {
  ts: [
    `import { Effect } from "effect"
import type { User } from "./types"
const value: string = "hello"
interface User { id: number; name: string }
type Result<T> = { ok: true; value: T } | { ok: false; error: string }
export function foo<T extends Base>(x: T): T { return x }
const arr = [1, 2, 3] as const
enum Color { Red, Green, Blue }
class Bar extends Base implements Foo {
  private readonly x: number = 0
  public method(): void {}
}
const fn = (x: number): boolean => x > 0
type Pair = readonly [string, number]
declare module "foo" {}
namespace Foo { export const x = 1 }
`,
  ],
  tsx: [
    `import React, { useState, type FC } from "react"
interface Props { label: string; onClick?: () => void }
const Button: FC<Props> = ({ label, onClick }) => {
  const [count, setCount] = useState<number>(0)
  return (
    <button className="btn" onClick={onClick}>
      {label} {count}
    </button>
  )
}
type Item = { id: string; name: string }
export function List({ items }: { items: ReadonlyArray<Item> }) {
  return <ul>{items.map((it) => <li key={it.id}>{it.name}</li>)}</ul>
}
`,
  ],
  js: [
    `const fs = require("fs")
const { foo } = require("./bar")
function add(a, b) { return a + b }
const arr = [1, 2, 3]
arr.map(x => x * 2).filter(x => x > 0)
const fn = (x) => x + 1
async function load() { return await fetch("/x") }
module.exports = { add }
class Foo extends Bar {
  constructor() { super() }
  method() {}
}
if (x === undefined || x === null) throw new Error("oops")
console.log("hi", typeof obj)
const { name, age = 0 } = obj
let count = 0
var legacy = true
`,
  ],
  jsx: [
    `import React from "react"
function Button({ label, onClick }) {
  return (
    <button className="px-4 py-2 rounded" onClick={onClick}>
      {label}
    </button>
  )
}
const App = () => (
  <div className="container">
    <h1>Hello {name}</h1>
    <Button label="Click" onClick={() => setCount(c + 1)} />
    {items.map(item => <li key={item.id}>{item.name}</li>)}
  </div>
)
export default App
`,
  ],
  html: [
    `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Page</title>
  <link rel="stylesheet" href="/styles.css" />
</head>
<body>
  <header>
    <h1>Hello</h1>
    <nav><a href="/about">About</a></nav>
  </header>
  <main>
    <div class="container">
      <p>Some <a href="/about">link</a></p>
      <img src="/img.png" alt="x" />
    </div>
  </main>
  <script src="/main.js"></script>
</body>
</html>
`,
  ],
  css: [
    `body { margin: 0; font-family: sans-serif; }
.container {
  max-width: 1200px;
  padding: 16px;
  background-color: #fff;
}
.btn {
  display: inline-flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 6px;
  color: rgb(255, 255, 255);
}
@media (max-width: 768px) {
  .container { padding: 8px; }
}
:root {
  --primary: #1f2430;
  --radius: 8px;
}
*::before { content: ""; }
.btn:hover { opacity: 0.9; }
`,
  ],
  scss: [
    `$primary: #1f2430;
$radius: 8px;

@mixin card($bg) {
  background: $bg;
  border-radius: $radius;
  padding: 16px;
}

.button {
  @include card($primary);
  color: white;

  &:hover {
    opacity: 0.9;
  }

  &.is-large {
    padding: 24px;
  }

  .icon {
    margin-right: 8px;
  }
}

@import "vars";
@use "sass:math";
%placeholder { display: flex; }
`,
  ],
  vue: [
    `<template>
  <div class="counter">
    <p>Count: {{ count }}</p>
    <button @click="increment" :disabled="busy">+</button>
    <ul v-if="items.length">
      <li v-for="item in items" :key="item.id">{{ item.name }}</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
const count = ref(0)
const busy = ref(false)
const items = ref<Array<{ id: string; name: string }>>([])
const doubled = computed(() => count.value * 2)
function increment() { count.value += 1 }
onMounted(() => console.log("mounted"))
</script>

<style scoped>
.counter { padding: 12px; }
</style>
`,
  ],
  svelte: [
    `<script lang="ts">
  import { onMount } from "svelte"
  export let label: string = "click"
  let count = 0
  $: doubled = count * 2
  function increment() { count += 1 }
  onMount(() => console.log("mounted"))
</script>

<button on:click={increment} class:active={count > 0}>
  {label} ({count})
</button>

{#if count > 5}
  <p>High!</p>
{:else}
  <p>Low.</p>
{/if}

{#each items as item (item.id)}
  <li>{item.name}</li>
{/each}

<style>
  button { padding: 8px; }
</style>
`,
  ],
  astro: [
    `---
import Layout from "../layouts/Layout.astro"
import Card from "../components/Card.astro"

export async function getStaticPaths() {
  const posts = await Astro.glob("../posts/*.md")
  return posts.map((post) => ({ params: { slug: post.frontmatter.slug } }))
}

const { slug } = Astro.params
const title = "Hello"
---

<Layout title={title}>
  <main>
    <h1>{title}</h1>
    <Card href="/about" title="About" body="Learn more" />
    {posts.map((p) => <li>{p.frontmatter.title}</li>)}
  </main>
</Layout>

<style>
  main { padding: 24px; }
</style>
`,
  ],
}
