import type { Language } from '#/lib/types'

export const DOTNET_SAMPLES: Partial<Record<Language, ReadonlyArray<string>>> = {
  csharp: [
    `using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Example.App;

public record User(long Id, string Name, bool Active = true);

public interface IRepo<T>
{
    T? FindById(long id);
}

public class UserService : IRepo<User>
{
    private readonly Dictionary<long, User> _users = new();

    public void Add(User user) => _users[user.Id] = user;

    public User? FindById(long id) => _users.TryGetValue(id, out var u) ? u : null;

    public IEnumerable<User> Active() =>
        _users.Values
            .Where(u => u.Active)
            .OrderBy(u => u.Name);

    public async Task<User?> LoadAsync(long id)
    {
        await Task.Delay(10);
        return FindById(id);
    }
}

public static class Program
{
    public static async Task Main(string[] args)
    {
        var svc = new UserService();
        svc.Add(new User(1L, "Ada"));
        var u = await svc.LoadAsync(1L);
        Console.WriteLine($"got {u?.Name}");
    }
}
`,
  ],
  fsharp: [
    `module App.UserService

open System
open System.Collections.Generic

type User = {
    Id: int64
    Name: string
    Active: bool
}

type Result<'T> =
    | Ok of 'T
    | Err of string

let users = Dictionary<int64, User>()

let add (u: User) =
    users.[u.Id] <- u

let findById id =
    match users.TryGetValue id with
    | true, u -> Some u
    | _ -> None

let active () =
    users.Values
    |> Seq.filter (fun u -> u.Active)
    |> Seq.sortBy (fun u -> u.Name)
    |> Seq.toList

let load id =
    match findById id with
    | Some u -> Ok u
    | None -> Err "not found"

[<EntryPoint>]
let main argv =
    add { Id = 1L; Name = "Ada"; Active = true }
    match load 1L with
    | Ok u -> printfn "got %s" u.Name
    | Err r -> printfn "oops: %s" r
    let xs = [1; 2; 3] |> List.map (fun x -> x * 2)
    0
`,
  ],
}
