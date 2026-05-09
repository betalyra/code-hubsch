import type { Language } from '#/lib/types'

export const FUNCTIONAL_SAMPLES: Partial<Record<Language, ReadonlyArray<string>>> = {
  haskell: [
    `module Main where

import Data.List (sortBy, filter)
import Data.Map.Strict (Map)
import qualified Data.Map.Strict as Map
import Control.Monad (forM_, when)

data User = User
  { userId   :: Int
  , userName :: String
  , active   :: Bool
  } deriving (Show, Eq)

newtype Repo = Repo { unRepo :: Map Int User }

class Storage s where
  findById :: Int -> s -> Maybe User

instance Storage Repo where
  findById i (Repo m) = Map.lookup i m

addUser :: User -> Repo -> Repo
addUser u (Repo m) = Repo (Map.insert (userId u) u m)

activeUsers :: Repo -> [User]
activeUsers (Repo m) = filter active (Map.elems m)

main :: IO ()
main = do
  let r = addUser (User 1 "Ada" True) (Repo Map.empty)
  case findById 1 r of
    Just u -> putStrLn $ "got " ++ userName u
    Nothing -> putStrLn "not found"
  forM_ [1..3] $ \\i -> print (i * 2)
`,
  ],
  ocaml: [
    `module User = struct
  type t = {
    id : int;
    name : string;
    active : bool;
  }

  let make ?(active = true) id name = { id; name; active }
end

module Repo = struct
  type t = (int, User.t) Hashtbl.t

  let create () : t = Hashtbl.create 16

  let add (r : t) (u : User.t) = Hashtbl.replace r u.id u

  let find_by_id (r : t) id =
    match Hashtbl.find_opt r id with
    | Some u -> Some u
    | None -> None

  let active r =
    Hashtbl.fold
      (fun _ u acc -> if u.User.active then u :: acc else acc)
      r []
end

let () =
  let repo = Repo.create () in
  Repo.add repo (User.make 1 "Ada");
  match Repo.find_by_id repo 1 with
  | Some u -> Printf.printf "got %s\\n" u.name
  | None -> Printf.printf "missing\\n"
;;

let xs = [1; 2; 3] |> List.map (fun x -> x * 2) |> List.filter (fun x -> x > 0)
`,
  ],
  elm: [
    `module Main exposing (..)

import Browser
import Html exposing (Html, button, div, text, ul, li)
import Html.Attributes exposing (class)
import Html.Events exposing (onClick)

type alias User =
    { id : Int
    , name : String
    , active : Bool
    }

type Msg
    = Increment
    | Decrement
    | LoadUser Int

type alias Model =
    { count : Int
    , users : List User
    }

init : Model
init =
    { count = 0, users = [] }

update : Msg -> Model -> Model
update msg model =
    case msg of
        Increment ->
            { model | count = model.count + 1 }

        Decrement ->
            { model | count = model.count - 1 }

        LoadUser _ ->
            model

view : Model -> Html Msg
view model =
    div [ class "app" ]
        [ button [ onClick Increment ] [ text "+" ]
        , div [] [ text (String.fromInt model.count) ]
        , ul [] (List.map (\\u -> li [] [ text u.name ]) model.users)
        ]

main =
    Browser.sandbox { init = init, update = update, view = view }
`,
  ],
  purescript: [
    `module Main where

import Prelude

import Data.Maybe (Maybe(..))
import Data.Array (filter, sortBy)
import Data.Map (Map)
import Data.Map as Map
import Effect (Effect)
import Effect.Aff (Aff, launchAff_)
import Effect.Console (log)

newtype UserId = UserId Int

derive newtype instance eqUserId :: Eq UserId
derive newtype instance ordUserId :: Ord UserId

type User =
  { id     :: UserId
  , name   :: String
  , active :: Boolean
  }

class Storage repo where
  findById :: UserId -> repo -> Maybe User

newtype Repo = Repo (Map UserId User)

instance storageRepo :: Storage Repo where
  findById uid (Repo m) = Map.lookup uid m

addUser :: User -> Repo -> Repo
addUser u (Repo m) = Repo (Map.insert u.id u m)

activeUsers :: Repo -> Array User
activeUsers (Repo m) =
  Map.values m
    # filter _.active

main :: Effect Unit
main = launchAff_ do
  let r = addUser { id: UserId 1, name: "Ada", active: true } (Repo Map.empty)
  case findById (UserId 1) r of
    Just u  -> log ("got " <> u.name)
    Nothing -> log "not found"
`,
  ],
  rescript: [
    `module User = {
  type t = {
    id: int,
    name: string,
    active: bool,
  }

  let make = (~active=true, id, name) => {id, name, active}
}

module Repo = {
  type t = Belt.HashMap.Int.t<User.t>

  let make = () => Belt.HashMap.Int.make(~hintSize=16)

  let add = (repo, user: User.t) => Belt.HashMap.Int.set(repo, user.id, user)

  let findById = (repo, id) =>
    switch Belt.HashMap.Int.get(repo, id) {
    | Some(u) => Some(u)
    | None => None
    }
}

let main = () => {
  let repo = Repo.make()
  Repo.add(repo, User.make(1, "Ada"))
  switch Repo.findById(repo, 1) {
  | Some(u) => Js.log("got " ++ u.name)
  | None => Js.log("not found")
  }
  let xs = [1, 2, 3]->Belt.Array.map(x => x * 2)
  Js.log(xs)
}

main()
`,
  ],
  erlang: [
    `-module(user_service).
-export([start/0, add/1, find_by_id/1, active/0]).

-record(user, {id, name, active = true}).

start() ->
    ets:new(users, [set, named_table, public, {keypos, #user.id}]),
    ok.

add(User = #user{}) ->
    ets:insert(users, User),
    ok.

find_by_id(Id) ->
    case ets:lookup(users, Id) of
        [User] -> {ok, User};
        []     -> {error, not_found}
    end.

active() ->
    [U || U = #user{active = A} <- ets:tab2list(users), A =:= true].

handle_call({load, Id}, _From, State) ->
    case find_by_id(Id) of
        {ok, U}        -> {reply, U, State};
        {error, Why}   -> {reply, {error, Why}, State}
    end.

main(_) ->
    start(),
    add(#user{id = 1, name = "Ada"}),
    {ok, U} = find_by_id(1),
    io:format("got ~p~n", [U]).
`,
  ],
  elixir: [
    `defmodule App.UserService do
  @moduledoc "Manages users in an ETS table."

  use GenServer

  defstruct [:id, :name, active: true]

  @type user :: %__MODULE__{id: pos_integer(), name: String.t(), active: boolean()}

  def start_link(opts \\\\ []) do
    GenServer.start_link(__MODULE__, :ok, opts)
  end

  @impl true
  def init(:ok) do
    {:ok, %{}}
  end

  def add(pid, %__MODULE__{} = user) do
    GenServer.cast(pid, {:add, user})
  end

  def find_by_id(pid, id) do
    GenServer.call(pid, {:get, id})
  end

  @impl true
  def handle_cast({:add, user}, state) do
    {:noreply, Map.put(state, user.id, user)}
  end

  @impl true
  def handle_call({:get, id}, _from, state) do
    {:reply, Map.get(state, id), state}
  end
end

{:ok, pid} = App.UserService.start_link()
App.UserService.add(pid, %App.UserService{id: 1, name: "Ada"})
[1, 2, 3] |> Enum.map(&(&1 * 2)) |> Enum.filter(&(&1 > 2))
`,
  ],
}
