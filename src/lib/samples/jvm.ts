import type { Language } from '#/lib/types'

export const JVM_SAMPLES: Partial<Record<Language, ReadonlyArray<string>>> = {
  java: [
    `package com.example.app;

import java.util.*;
import java.util.stream.Collectors;

public class UserService {
    private final Map<Long, User> users = new HashMap<>();

    public Optional<User> findById(long id) {
        return Optional.ofNullable(users.get(id));
    }

    public List<User> active() {
        return users.values().stream()
            .filter(User::isActive)
            .sorted(Comparator.comparing(User::getName))
            .collect(Collectors.toList());
    }

    public static void main(String[] args) {
        UserService svc = new UserService();
        svc.users.put(1L, new User(1L, "Ada", true));
        System.out.println(svc.active());
    }
}

interface Greeter {
    String greet(String name);
}

class User {
    private final long id;
    private final String name;
    private final boolean active;
    public User(long id, String name, boolean active) {
        this.id = id; this.name = name; this.active = active;
    }
    public String getName() { return name; }
    public boolean isActive() { return active; }
}
`,
  ],
  kotlin: [
    `package com.example.app

import kotlinx.coroutines.*
import kotlin.collections.mutableMapOf

data class User(val id: Long, val name: String, val active: Boolean = true)

sealed class Result<out T> {
    data class Ok<T>(val value: T) : Result<T>()
    data class Err(val reason: String) : Result<Nothing>()
}

class UserService {
    private val users = mutableMapOf<Long, User>()

    fun add(user: User) {
        users[user.id] = user
    }

    fun findById(id: Long): User? = users[id]

    suspend fun load(id: Long): Result<User> = withContext(Dispatchers.IO) {
        users[id]?.let { Result.Ok(it) } ?: Result.Err("not found")
    }
}

fun main() = runBlocking {
    val svc = UserService().apply {
        add(User(1L, "Ada"))
    }
    when (val r = svc.load(1L)) {
        is Result.Ok -> println(r.value.name)
        is Result.Err -> println("oops: \${r.reason}")
    }
    val names = listOf(1, 2, 3).map { it * 2 }.filter { it > 0 }
    println(names)
}
`,
  ],
  scala: [
    `package com.example.app

import scala.collection.mutable
import scala.concurrent.{ExecutionContext, Future}

case class User(id: Long, name: String, active: Boolean = true)

sealed trait Result[+T]
case class Ok[T](value: T) extends Result[T]
case class Err(reason: String) extends Result[Nothing]

trait Repo[T] {
  def findById(id: Long): Option[T]
}

object UserService extends Repo[User] {
  private val users = mutable.Map.empty[Long, User]

  def findById(id: Long): Option[User] = users.get(id)

  def add(u: User): Unit = users(u.id) = u

  def active: Seq[User] =
    users.values.toSeq
      .filter(_.active)
      .sortBy(_.name)
}

object Main extends App {
  UserService.add(User(1L, "Ada"))
  val r = UserService.findById(1L) match {
    case Some(u) => Ok(u)
    case None    => Err("not found")
  }
  val names = List(1, 2, 3).map(_ * 2).filter(_ > 0)
  for {
    n <- names
    s = n.toString
  } yield s
}
`,
  ],
  clojure: [
    `(ns app.users
  (:require [clojure.string :as str]
            [clojure.set :as set]))

(def users (atom {}))

(defn add-user [m {:keys [id] :as user}]
  (assoc m id user))

(defn active? [user]
  (:active user))

(defn find-by-id [id]
  (get @users id))

(defn names []
  (->> @users
       vals
       (filter active?)
       (map :name)
       (sort)))

(defmacro when-active [user & body]
  \`(when (active? ~user)
     ~@body))

(defprotocol Repo
  (load-user [this id]))

(defrecord MemRepo [store]
  Repo
  (load-user [_ id] (get store id)))

(swap! users add-user {:id 1 :name "Ada" :active true})
(println (names))
`,
  ],
  groovy: [
    `package com.example.app

import groovy.transform.CompileStatic
import groovy.transform.ToString

@ToString
class User {
    Long id
    String name
    boolean active = true
}

@CompileStatic
class UserService {
    private Map<Long, User> users = [:]

    void add(User u) {
        users[u.id] = u
    }

    User findById(Long id) {
        users[id]
    }

    List<User> active() {
        users.values().findAll { it.active }.sort { it.name }
    }
}

def svc = new UserService()
svc.add(new User(id: 1L, name: "Ada"))

def names = (1..5).collect { it * 2 }.findAll { it > 4 }
println names

[1, 2, 3].each { x -> println "got \${x}" }

def closure = { String who -> "hello \${who}" }
println closure("world")
`,
  ],
}
