local json = require("json")
local sqlite3 = require("lsqlite3")

DB = DB or sqlite3.open_memory()

-- Create table for pets with unique constraint on address
DB:exec [[
  CREATE TABLE IF NOT EXISTS pets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    level INT,
    type INT,
    address TEXT UNIQUE,
    lastUpdated INT
  );
]]

-- Function to execute SQL queries and return results
local function query(stmt)
  local rows = {}
  for row in stmt:nrows() do
    table.insert(rows, row)
  end
  stmt:reset()
  return rows
end

-- Function to add a new pet
local function initPet(pet, timestamp)
  local stmt = DB:prepare [[
    INSERT INTO pets (name, description, level, type, address, lastUpdated)
    VALUES (:name, :description, :level, :type, :address, :lastUpdated);
  ]]

  if not stmt then
    error("Failed to prepare SQL statement: " .. DB:errmsg())
  end

  local randomType = math.random(0, 1000)

  stmt:bind_names({
    name = pet.Name,
    description = pet.Description,
    level = 0,
    type = randomType,
    address = pet.Address,
    lastUpdated = timestamp
  })

  local result = stmt:step()
  if result ~= sqlite3.DONE then
    print("Error: Address already exists")
    Handlers.utils.reply("Error: Address already exists")(pet)
  else
    print('Pet Added!')
    Handlers.utils.reply("Pet Added!")(pet)
  end
  stmt:reset()
end

-- Function to get a pet by address
local function getPet(address)
  local stmt = DB:prepare [[
    SELECT * FROM pets WHERE address = :address;
  ]]

  if not stmt then
    error("Failed to prepare SQL statement: " .. DB:errmsg())
  end

  stmt:bind_names({ address = address })

  local rows = query(stmt)
  return rows
end

-- Function to get all pets
local function getAllPets()
  local stmt = DB:prepare [[
    SELECT * FROM pets;
  ]]

  if not stmt then
    error("Failed to prepare SQL statement: " .. DB:errmsg())
  end

  local rows = query(stmt)
  
  return rows
end

-- Function to update the level of a pet by petid
local function updatePetLevel(pet, timestampNow)
  local currentPetStmt = DB:prepare [[
    SELECT * FROM pets WHERE id = :id;
  ]]

  if not currentPetStmt then
    error("Failed to prepare SQL statement: " .. DB:errmsg())
  end

  currentPetStmt:bind_names({ id = pet.id })

  local currentPet = query(currentPetStmt)[1]

  if currentPet then
    print(timestampNow)
    print(currentPet.lastUpdated)
    if timestampNow - currentPet.lastUpdated < 3600 then 
      -- 3600 seconds = 1 hour
      print('Not now')
      Handlers.utils.reply("Not now")(pet)
      return
    end

    local newLevel = currentPet.level + 1
    local stmt = DB:prepare [[
      UPDATE pets SET level = :level, lastUpdated = :lastUpdated WHERE id = :id;
    ]]

    if not stmt then
      error("Failed to prepare SQL statement: " .. DB:errmsg())
    end

    stmt:bind_names({
      id = pet.id,
      level = newLevel,
      lastUpdated = timestampNow
    })

    stmt:step()
    stmt:reset()
    print('Pet Level Updated!')
    Handlers.utils.reply("Updated")(pet)
  else
    print('Pet not updated. New level must be higher than the current level.')
  end
end

-- Add initPet Handler
Handlers.add(
  "initPet",
  Handlers.utils.hasMatchingTag("Action", "initPet"),
  function (msg)
    initPet(msg, msg.Timestamp)
  end
)

-- Add getPet Handler
Handlers.add(
  "getPet",
  Handlers.utils.hasMatchingTag("Action", "getPet"),
  function (msg)
    local pet = getPet(msg.Address)
    local petsJson = json.encode(pet)
    print(pet)
    Handlers.utils.reply(petsJson)(msg)
  end
)

-- Add getPets Handler to get all pets
Handlers.add(
  "getPets",
  Handlers.utils.hasMatchingTag("Action", "getPets"),
  function (msg)
    local pets = getAllPets()
    print(pets)
    local petsJson = json.encode(pets)
    Handlers.utils.reply(petsJson)(msg)
  end
)

-- Add updateLevel Handler
Handlers.add(
  "updateLevel",
  Handlers.utils.hasMatchingTag("Action", "updateLevel"),
  function (msg)
    local pet = getPet(msg.Address)[1]
    if pet then
      updatePetLevel(pet, msg.Timestamp)
    else
      Handlers.utils.reply("Pet not found!")(msg)
    end
  end
)

Handlers.add(
  "Info",
  Handlers.utils.hasMatchingTag("Action", "Info"),
  function (msg)
    info = [[
This module handles pet management including creating, retrieving, updating, and listing pets. The core functionalities are backed by an SQLite database.

1. **Database Setup**
   - A SQLite database is used, either in-memory or persistent.
   - Table `pets` is created to store pet details with unique constraints on the `address` field.

2. **Functions**

   - `query(stmt)`: Executes a prepared SQL statement and returns the result rows.
   - `initPet(pet, timestamp)`: Adds a new pet to the database. Fields include `name`, `description`, `level`, `type`, `address`, and `lastUpdated`. If the address already exists, an error message is returned.
   - `getPet(address)`: Retrieves pet details based on the provided address.
   - `getAllPets()`: Retrieves details of all pets in the database.
   - `updatePetLevel(pet, timestampNow)`: Updates the level of a pet if the last update was more than an hour ago.

3. **Handlers**

   - `"initPet"`: Adds a new pet to the database.
   - `"getPet"`: Retrieves a pet's details based on its address.
   - `"getPets"`: Retrieves details of all pets.
   - `"updateLevel"`: Updates a pet's level based on the provided address and current timestamp.

Each handler is associated with an action tag and uses utility functions to reply with appropriate messages or errors.
      ]]
    Handlers.utils.reply(info)(msg)
  end
)
