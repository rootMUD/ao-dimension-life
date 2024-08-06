-- ProcessId: cO4thcoxO57AflN5hfXjce0_DydbMJclTU9kC3S75cg

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
    data TEXT,
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

-- Function to get top N pets by level
local function getTopNPets(n)
  local stmt = DB:prepare [[
    SELECT * FROM pets ORDER BY level DESC LIMIT :limit;
  ]]

  if not stmt then
    error("Failed to prepare SQL statement: " .. DB:errmsg())
  end

  stmt:bind_names({ limit = n })

  local rows = query(stmt)
  return rows
end


-- Function to check if a pet name is unique
local function checkNameUnique(msg)
  local dataJson = json.decode(msg.Data)
  local name = dataJson.name

  -- Check if the name already exists
  local stmt = DB:prepare [[
    SELECT * FROM pets WHERE name = :name;
  ]]

  if not stmt then
    error("Failed to prepare SQL statement: " .. DB:errmsg())
  end

  stmt:bind_names({ name = name })

  local existingPet = query(stmt)[1]

  local result
  if existingPet then
    result = json.encode({unique = false})
  else
    result = json.encode({unique = true})
  end

  Handlers.utils.reply(result)(msg)

  stmt:reset()
  stmt:finalize()
end

-- TODO: i think the reply has some prob so it should fix the reply in the future.
local function initPet(data, timestamp)
  -- Decode the JSON data
  local dataJson = json.decode(data)
  local name = dataJson.name
  local description = dataJson.description
  local address = dataJson.address

  -- Check if the name already exists
  local checkNameStmt = DB:prepare [[
    SELECT * FROM pets WHERE name = :name;
  ]]

  if not checkNameStmt then
    error("Failed to prepare SQL statement: " .. DB:errmsg())
  end

  checkNameStmt:bind_names({ name = name })

  local existingPet = query(checkNameStmt)[1]

  if existingPet then
    print("Error: Name already exists")
    Handlers.utils.reply("Error: Name already exists")
    return
  end

  -- Prepare the SQL statement
  local stmt = DB:prepare [[
    INSERT INTO pets (name, description, level, type, address, lastUpdated)
    VALUES (:name, :description, :level, :type, :address, :lastUpdated);
  ]]

  if not stmt then
    error("Failed to prepare SQL statement: " .. DB:errmsg())
  end

  -- Bind values to the statement
  local randomType = math.random(0, 1000)
  stmt:bind_names({
    name = name,
    description = description,
    level = 0,
    type = randomType,
    address = address,
    lastUpdated = timestamp
  })

  -- Execute the statement
  local result = stmt:step()
  if result ~= sqlite3.DONE then
    print("Error: Address already exists")
    Handlers.utils.reply("Error: Address already exists")
  else
    print('Pet Added!')
    Handlers.utils.reply("Pet Added!")
  end

  -- Reset and finalize the statements
  checkNameStmt:reset()
  checkNameStmt:finalize()
  stmt:reset()
  stmt:finalize()
end

-- local function initPet(data, timestamp)
--   -- Decode the JSON data
--   local dataJson = json.decode(data)
--   local name = dataJson.name
--   local description = dataJson.description
--   local address = dataJson.address
--   -- Prepare the SQL statement
--   local stmt = DB:prepare [[
--     INSERT INTO pets (name, description, level, type, address, lastUpdated)
--     VALUES (:name, :description, :level, :type, :address, :lastUpdated);
--   ]]

--   if not stmt then
--     error("Failed to prepare SQL statement: " .. DB:errmsg())
--   end

--   -- Bind values to the statement
--   local randomType = math.random(0, 1000)
--   stmt:bind_names({
--     name = name,
--     description = description,
--     level = 0,
--     type = randomType,
--     address = address,
--     lastUpdated = timestamp
--   })

--   -- Execute the statement
--   local result = stmt:step()
--   if result ~= sqlite3.DONE then
--     print("Error: Address already exists")
--     Handlers.utils.reply("Error: Address already exists")
--   else
--     print('Pet Added!')
--     Handlers.utils.reply("Pet Added!")
--   end

--   -- Reset and finalize the statement
--   stmt:reset()
--   stmt:finalize()
-- end

-- Function to get a pet by address
local function getPet(data)
  local dataJson = json.decode(data)
  local address = dataJson.address
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
    -- TODO: milliseconds is the timestamp here.
    if timestampNow - currentPet.lastUpdated < 3600000 then 
      -- 3600,000 mileseconds = 1 hour
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

-- Function to update the data field of a pet by address

-- Function to update the data field of a pet by address
local function updatePetData(pet, data)
  local currentPetStmt = DB:prepare [[
    SELECT * FROM pets WHERE address = :address;
  ]]

  if not currentPetStmt then
    error("Failed to prepare SQL statement: " .. DB:errmsg())
  end

  currentPetStmt:bind_names({ address = pet.address })

  local currentPet = query(currentPetStmt)[1]

  if currentPet then
    local dataJson = json.decode(data)
    local newData = dataJson.data

    local stmt = DB:prepare [[
      UPDATE pets SET data = :data, lastUpdated = :lastUpdated WHERE address = :address;
    ]]

    if not stmt then
      error("Failed to prepare SQL statement: " .. DB:errmsg())
    end

    stmt:bind_names({
      address = pet.address,
      data = newData
    })

    stmt:step()
    stmt:reset()
    print('Pet Data Updated!')
    Handlers.utils.reply("Pet Data Updated!")(pet)
  else
    print('Pet not found.')
    Handlers.utils.reply("Pet not found.")(pet)
  end
end

-- Add initPet Handler
Handlers.add(
  "initPet",
  Handlers.utils.hasMatchingTag("Action", "initPet"),
  function (msg)
    initPet(msg.Data, msg.Timestamp)
  end
)

-- Add getPet Handler
Handlers.add(
  "getPet",
  Handlers.utils.hasMatchingTag("Action", "getPet"),
  function (msg)
    local pet = getPet(msg.Data)
    local petsJson = json.encode(pet)
    print(pet)
    Handlers.utils.reply(petsJson)(msg)
  end
)

-- Add getPets Handler to get all pets
-- Handlers.add(
--   "getPets",
--   Handlers.utils.hasMatchingTag("Action", "getPets"),
--   function (msg)
--     local pets = getAllPets()
--     print(pets)
--     local petsJson = json.encode(pets)
--     Handlers.utils.reply(petsJson)(msg)
--   end
-- )

-- Add updateLevel Handler
Handlers.add(
  "updateLevel",
  Handlers.utils.hasMatchingTag("Action", "updateLevel"),
  function (msg)
    local pet = getPet(msg.Data)[1]
    if pet then
      updatePetLevel(pet, msg.Timestamp)
    else
      Handlers.utils.reply("Pet not found!")(msg)
    end
  end
)

-- Add getCount Handler to get the count of all pets
Handlers.add(
  "getCount",
  Handlers.utils.hasMatchingTag("Action", "getCount"),
  function (msg)
    local stmt = DB:prepare [[
      SELECT COUNT(*) AS count FROM pets;
    ]]
  
    if not stmt then
      error("Failed to prepare SQL statement: " .. DB:errmsg())
    end
  
    local rows = query(stmt)
    print(rows[1].count)
    Handlers.utils.reply(tostring(rows[1].count))(msg)
  end
)


-- Add checkNameUnique Handler
Handlers.add(
  "checkNameUnique",
  Handlers.utils.hasMatchingTag("Action", "checkNameUnique"),
  function (msg)
    checkNameUnique(msg)
  end
)

-- Add getTopNPets Handler to get top N pets
Handlers.add(
  "getTopPets",
  Handlers.utils.hasMatchingTag("Action", "getTopPets"),
  function (msg)
    local dataJson = json.decode(msg.Data)
    local number = dataJson.number
    local topPets = getTopNPets(number)
    local topPetsJson = json.encode(topPets)
    Handlers.utils.reply(topPetsJson)(msg)
  end
)

Handlers.add(
  "sendLatestDataForPet",
  Handlers.utils.hasMatchingTag("Action", "sendLatestDataForPet"),
  function (msg)
    local dataJson = json.decode(msg.Data)
    local address = dataJson.address
    local target = dataJson.target
    local pet = getPet(msg.Data)
    print(pet)
    Send({
      Target = target,
      Tags = {
          Action = "updatePet"
      },
      Data = json.encode(pet[1])
    })
    Handlers.utils.reply("finished")(msg)
  end
)
-- Add updateData Handler to update the data field of a pet
-- it should not add to the entry handler because it need the verification of the owner.
-- Handlers.add(
--   "updateData",
--   Handlers.utils.hasMatchingTag("Action", "updateData"),
--   function (msg)
--     local pet = getPet(msg.Data)[1]
--     updatePetData(pet, msg.Data)
--   end
-- )

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
