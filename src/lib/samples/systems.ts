import type { Language } from '#/lib/types'

export const SYSTEMS_SAMPLES: Partial<Record<Language, ReadonlyArray<string>>> = {
  c: [
    `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct {
  int id;
  char name[32];
} User;

static int compare_users(const void *a, const void *b) {
  return ((const User *)a)->id - ((const User *)b)->id;
}

int main(int argc, char **argv) {
  if (argc < 2) {
    fprintf(stderr, "usage: %s <name>\\n", argv[0]);
    return 1;
  }
  User *u = malloc(sizeof(User));
  if (u == NULL) return -1;
  u->id = 42;
  strncpy(u->name, argv[1], sizeof(u->name) - 1);
  printf("user %d: %s\\n", u->id, u->name);
  free(u);
  return 0;
}
`,
  ],
  cpp: [
    `#include <iostream>
#include <vector>
#include <memory>
#include <string>
#include <algorithm>

namespace app {

template <typename T>
class Container {
 public:
  Container() = default;
  void add(T value) { items_.push_back(std::move(value)); }
  size_t size() const noexcept { return items_.size(); }

 private:
  std::vector<T> items_;
};

class User {
 public:
  User(int id, std::string name) : id_(id), name_(std::move(name)) {}
  const std::string& name() const { return name_; }

 private:
  int id_;
  std::string name_;
};

}  // namespace app

int main() {
  auto users = std::make_unique<app::Container<app::User>>();
  users->add(app::User(1, "Ada"));
  std::cout << "size: " << users->size() << '\\n';
  return 0;
}
`,
  ],
  rust: [
    `use std::collections::HashMap;
use std::sync::Arc;
use anyhow::{Result, Context};

#[derive(Debug, Clone)]
pub struct User<'a> {
    pub id: u64,
    pub name: &'a str,
}

pub trait Repo {
    fn get(&self, id: u64) -> Option<User>;
}

impl<'a> User<'a> {
    pub fn new(id: u64, name: &'a str) -> Self {
        Self { id, name }
    }
}

pub async fn fetch_user(id: u64) -> Result<Option<String>> {
    let url = format!("/users/{}", id);
    let res = reqwest::get(&url).await.context("request failed")?;
    Ok(Some(res.text().await?))
}

fn main() {
    let mut users: HashMap<u64, &str> = HashMap::new();
    users.insert(1, "Ada");
    match users.get(&1) {
        Some(name) => println!("found {}", name),
        None => println!("missing"),
    }
}
`,
  ],
  go: [
    `package main

import (
\t"context"
\t"errors"
\t"fmt"
\t"net/http"
\t"sync"
\t"time"
)

type User struct {
\tID   uint64
\tName string
}

type Repo interface {
\tGet(ctx context.Context, id uint64) (*User, error)
}

func fetchUser(ctx context.Context, id uint64) (*User, error) {
\tch := make(chan *User, 1)
\tgo func() {
\t\tdefer close(ch)
\t\tch <- &User{ID: id, Name: "Ada"}
\t}()
\tselect {
\tcase u := <-ch:
\t\tif u == nil {
\t\t\treturn nil, errors.New("not found")
\t\t}
\t\treturn u, nil
\tcase <-ctx.Done():
\t\treturn nil, ctx.Err()
\t}
}

func main() {
\tctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
\tdefer cancel()
\tu, err := fetchUser(ctx, 1)
\tif err != nil {
\t\tfmt.Println("oops:", err)
\t\treturn
\t}
\tfmt.Printf("got %+v\\n", u)
\tvar wg sync.WaitGroup
\twg.Wait()
\thttp.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {})
}
`,
  ],
  zig: [
    `const std = @import("std");

const User = struct {
    id: u64,
    name: []const u8,

    pub fn init(id: u64, name: []const u8) User {
        return .{ .id = id, .name = name };
    }
};

pub fn main() !void {
    const allocator = std.heap.page_allocator;
    var list = std.ArrayList(User).init(allocator);
    defer list.deinit();

    try list.append(User.init(1, "Ada"));
    try list.append(User.init(2, "Grace"));

    for (list.items) |u| {
        std.debug.print("{d}: {s}\\n", .{ u.id, u.name });
    }

    const x: ?u32 = 42;
    if (x) |v| {
        std.debug.print("x = {d}\\n", .{v});
    } else {
        std.debug.print("x is null\\n", .{});
    }

    const result = computeSomething() catch |err| {
        std.debug.print("error: {}\\n", .{err});
        return;
    };
    _ = result;
}

fn computeSomething() !u32 {
    return 42;
}
`,
  ],
  nim: [
    `import std/[strutils, sequtils, tables, options]

type
  User = object
    id: int
    name: string
  Repo = ref object of RootObj
    users: Table[int, User]

proc newRepo(): Repo =
  Repo(users: initTable[int, User]())

proc add(self: Repo, u: User) =
  self.users[u.id] = u

proc find(self: Repo, id: int): Option[User] =
  if id in self.users:
    some(self.users[id])
  else:
    none(User)

method describe(u: User): string {.base.} =
  result = "User(" & $u.id & ", " & u.name & ")"

when isMainModule:
  let repo = newRepo()
  repo.add(User(id: 1, name: "Ada"))
  let names = @[1, 2, 3].mapIt($it & "x")
  echo names.join(", ")
  for k, v in repo.users:
    echo describe(v)
`,
  ],
}
