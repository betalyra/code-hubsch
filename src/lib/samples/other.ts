import type { Language } from '#/lib/types'

export const OTHER_SAMPLES: Partial<Record<Language, ReadonlyArray<string>>> = {
  swift: [
    `import Foundation

struct User: Codable, Equatable {
    let id: Int
    let name: String
    var active: Bool = true
}

protocol Repo {
    associatedtype T
    func findById(_ id: Int) -> T?
}

final class UserService: Repo {
    typealias T = User
    private var users: [Int: User] = [:]

    func add(_ user: User) {
        users[user.id] = user
    }

    func findById(_ id: Int) -> User? {
        users[id]
    }

    func active() -> [User] {
        users.values
            .filter { $0.active }
            .sorted { $0.name < $1.name }
    }
}

@MainActor
func load(id: Int) async throws -> User? {
    try await Task.sleep(nanoseconds: 1_000_000)
    return nil
}

let svc = UserService()
svc.add(User(id: 1, name: "Ada"))
guard let u = svc.findById(1) else {
    fatalError("missing")
}
print("got \\(u.name)")

let nums = (1...5).map { $0 * 2 }.filter { $0 > 2 }
`,
  ],
  dart: [
    `import 'dart:async';
import 'dart:convert';

class User {
  final int id;
  final String name;
  final bool active;

  const User({required this.id, required this.name, this.active = true});

  factory User.fromJson(Map<String, dynamic> json) =>
      User(id: json['id'] as int, name: json['name'] as String);

  Map<String, dynamic> toJson() =>
      {'id': id, 'name': name, 'active': active};
}

abstract class Repo<T> {
  T? findById(int id);
}

class UserService implements Repo<User> {
  final Map<int, User> _users = {};

  void add(User u) => _users[u.id] = u;

  @override
  User? findById(int id) => _users[id];

  Future<User?> load(int id) async {
    await Future.delayed(const Duration(milliseconds: 10));
    return _users[id];
  }

  Iterable<User> get active sync* {
    for (final u in _users.values) {
      if (u.active) yield u;
    }
  }
}

void main() async {
  final svc = UserService();
  svc.add(const User(id: 1, name: 'Ada'));
  final u = await svc.load(1);
  print('got \${u?.name}');
  final xs = [1, 2, 3].map((x) => x * 2).where((x) => x > 0);
}
`,
  ],
  r: [
    `library(dplyr)
library(ggplot2)

users <- data.frame(
  id     = c(1L, 2L, 3L),
  name   = c("Ada", "Grace", "Linus"),
  active = c(TRUE, TRUE, FALSE),
  stringsAsFactors = FALSE
)

add_user <- function(df, id, name, active = TRUE) {
  rbind(df, data.frame(id = id, name = name, active = active))
}

active_users <- function(df) {
  df %>%
    filter(active) %>%
    arrange(name) %>%
    select(id, name)
}

users <- add_user(users, 4L, "Hopper")
result <- active_users(users)
print(result)

x <- c(1, 2, 3, NA, 5)
mean(x, na.rm = TRUE)

if (length(x) > 3) {
  message("long vector")
} else {
  warning("short vector")
}

for (i in seq_along(x)) {
  cat("element", i, "=", x[i], "\\n")
}

plot(users$id, type = "b", main = "users")
`,
  ],
  julia: [
    `module App

using DataFrames
import Base: show

struct User
    id::Int
    name::String
    active::Bool
end

User(id::Int, name::AbstractString) = User(id, String(name), true)

mutable struct Repo
    users::Dict{Int, User}
end

Repo() = Repo(Dict{Int, User}())

function add!(r::Repo, u::User)
    r.users[u.id] = u
    return r
end

function find_by_id(r::Repo, id::Int)::Union{User, Nothing}
    return get(r.users, id, nothing)
end

active(r::Repo) = filter(u -> u.active, collect(values(r.users)))

function Base.show(io::IO, u::User)
    print(io, "User(\$(u.id), \$(u.name))")
end

end # module

using .App

repo = App.Repo()
App.add!(repo, App.User(1, "Ada"))
println(App.find_by_id(repo, 1))

xs = [x * 2 for x in 1:5 if x > 1]
sq = map(x -> x^2, xs) |> sort
`,
  ],
  solidity: [
    `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IRegistry {
    function isApproved(address user) external view returns (bool);
}

contract UserVault is Ownable {
    struct UserData {
        uint256 balance;
        uint64  lastDeposit;
        bool    active;
    }

    mapping(address => UserData) public users;
    address[] public registered;
    IERC20 public immutable token;

    event Deposited(address indexed user, uint256 amount);
    error NotActive(address user);

    constructor(IERC20 _token) Ownable(msg.sender) {
        token = _token;
    }

    modifier onlyActive() {
        if (!users[msg.sender].active) revert NotActive(msg.sender);
        _;
    }

    function deposit(uint256 amount) external onlyActive {
        require(amount > 0, "zero");
        users[msg.sender].balance += amount;
        users[msg.sender].lastDeposit = uint64(block.timestamp);
        emit Deposited(msg.sender, amount);
    }

    function activate(address user) external onlyOwner {
        users[user].active = true;
        registered.push(user);
    }

    receive() external payable {}
}
`,
  ],
}
