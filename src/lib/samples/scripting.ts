import type { Language } from '#/lib/types'

export const SCRIPTING_SAMPLES: Partial<Record<Language, ReadonlyArray<string>>> = {
  python: [
    `from __future__ import annotations
from dataclasses import dataclass
from typing import Optional, Iterable
import asyncio

@dataclass(frozen=True)
class User:
    id: int
    name: str
    active: bool = True

class Repo:
    def __init__(self) -> None:
        self._users: dict[int, User] = {}

    def add(self, user: User) -> None:
        self._users[user.id] = user

    def find_by_id(self, id: int) -> Optional[User]:
        return self._users.get(id)

    def active(self) -> list[User]:
        return [u for u in self._users.values() if u.active]

async def load(id: int) -> Optional[User]:
    await asyncio.sleep(0.01)
    return None

if __name__ == "__main__":
    repo = Repo()
    repo.add(User(1, "Ada"))
    print(f"active: {len(repo.active())}")
    nums = [x * 2 for x in range(10) if x > 3]
`,
  ],
  ruby: [
    `# frozen_string_literal: true

require "json"
require "set"

module App
  class User
    attr_accessor :id, :name, :active

    def initialize(id:, name:, active: true)
      @id = id
      @name = name
      @active = active
    end

    def to_h
      { id: @id, name: @name, active: @active }
    end
  end

  class Repo
    def initialize
      @users = {}
    end

    def add(user)
      @users[user.id] = user
      self
    end

    def find_by_id(id)
      @users[id]
    end

    def active
      @users.values.select(&:active).sort_by(&:name)
    end
  end
end

repo = App::Repo.new
repo.add(App::User.new(id: 1, name: "Ada"))
puts repo.active.map(&:name).inspect
[1, 2, 3].each { |n| puts "got #{n * 2}" }
`,
  ],
  lua: [
    `local M = {}

local function make_user(id, name, active)
  active = active == nil and true or active
  return { id = id, name = name, active = active }
end

local Repo = {}
Repo.__index = Repo

function Repo.new()
  return setmetatable({ users = {} }, Repo)
end

function Repo:add(user)
  self.users[user.id] = user
end

function Repo:find_by_id(id)
  return self.users[id]
end

function Repo:active()
  local result = {}
  for _, u in pairs(self.users) do
    if u.active then
      table.insert(result, u)
    end
  end
  return result
end

M.Repo = Repo

local repo = Repo.new()
repo:add(make_user(1, "Ada"))

for i = 1, 3 do
  print("hello " .. i)
end

if type(repo) == "table" then
  io.write(tostring(#repo:active()))
end

return M
`,
  ],
  perl: [
    `#!/usr/bin/env perl
use strict;
use warnings;
use feature qw(say);
use Data::Dumper;

package App::User;

sub new {
    my ($class, %args) = @_;
    my $self = {
        id     => $args{id},
        name   => $args{name},
        active => $args{active} // 1,
    };
    bless $self, $class;
    return $self;
}

sub name { $_[0]->{name} }

package App::Repo;

sub new {
    my $class = shift;
    bless { users => {} }, $class;
}

sub add {
    my ($self, $user) = @_;
    $self->{users}{$user->{id}} = $user;
}

sub find_by_id {
    my ($self, $id) = @_;
    return $self->{users}{$id};
}

package main;

my $repo = App::Repo->new;
$repo->add(App::User->new(id => 1, name => "Ada"));

my @doubled = map { $_ * 2 } grep { $_ > 1 } (1..5);
say "list: @doubled";

if ("hello world" =~ /(\\w+)\\s(\\w+)/) {
    say "matched: $1 $2";
}

print Dumper($repo);
`,
  ],
  php: [
    `<?php declare(strict_types=1);

namespace App;

use JsonSerializable;
use RuntimeException;

final class User implements JsonSerializable
{
    public function __construct(
        public readonly int $id,
        public readonly string $name,
        public readonly bool $active = true,
    ) {}

    public function jsonSerialize(): array
    {
        return ['id' => $this->id, 'name' => $this->name, 'active' => $this->active];
    }
}

interface Repo
{
    public function findById(int $id): ?User;
}

class MemRepo implements Repo
{
    /** @var array<int, User> */
    private array $users = [];

    public function add(User $u): void
    {
        $this->users[$u->id] = $u;
    }

    public function findById(int $id): ?User
    {
        return $this->users[$id] ?? null;
    }

    public function active(): array
    {
        return array_filter($this->users, fn(User $u) => $u->active);
    }
}

$repo = new MemRepo();
$repo->add(new User(1, 'Ada'));
echo json_encode($repo->findById(1)) . "\\n";

foreach (range(1, 3) as $i) {
    echo "got $i\\n";
}
`,
  ],
}
