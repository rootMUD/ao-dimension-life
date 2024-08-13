-- TODO: avoid the totally same achievement by title.
-- ProcessId: [TODO]
local json = require("json")
local sqlite3 = require("lsqlite3")
local admin = "wbIGThLriLEzpuL5yS__aba2jn0YAF471adJTrc0Pdg"

DB = DB or sqlite3.open_memory()

-- Create table for achievements with unique constraint on address
DB:exec [[
  CREATE TABLE IF NOT EXISTS achievement_1_kv (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    address TEXT UNIQUE,
    data TEXT,
    lastUpdated INT
  );
]]

DB:exec [[
  CREATE TABLE IF NOT EXISTS whitelist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    description TEXT,
    process_id TEXT
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

-- Function to generate a random hexadecimal string
local function generateRandomHex(length)
  local chars = '0123456789abcdef'
  local hex = ''
  for i = 1, length do
    local randIndex = math.random(1, #chars)
    hex = hex .. chars:sub(randIndex, randIndex)
  end
  return hex
end

-- Function to initialize an achievement in the database
local function initAchievement(data, timestamp)
  local dataJson = json.decode(data)
  local address = dataJson.address

  -- Prepare the SQL statement to check if the achievement already exists
  local checkStmt = DB:prepare [[
    SELECT * FROM achievement_1_kv WHERE address = :address;
  ]]

  if not checkStmt then
    error("Failed to prepare SQL statement: " .. DB:errmsg())
  end

  checkStmt:bind_names({ address = address })
  local existingAchievement = query(checkStmt)[1]

  if existingAchievement then
    print("Achievement already exists for this address")
    Handlers.utils.reply("Achievement already exists for this address")(msg)
    checkStmt:finalize()
    return
  end

  -- Prepare the SQL statement to insert the new achievement
  local stmt = DB:prepare [[
    INSERT INTO achievement_1_kv (address, data, lastUpdated)
    VALUES (:address, :data, :lastUpdated);
  ]]

  if not stmt then
    error("Failed to prepare SQL statement: " .. DB:errmsg())
  end

  -- Define the initial achievement schema
  local defaultData = json.encode({
    -- Empty list for achievements
  })
  stmt:bind_names({
    address = address,
    data = defaultData,
    lastUpdated = timestamp
  })

  local result = stmt:step()
  if result ~= sqlite3.DONE then
    print("Error inserting achievement into the database")
  else
    print("Achievement initialized!")
  end

  stmt:reset()
  stmt:finalize()
  checkStmt:finalize()
end

-- Handler to get the achievement data or initialize it if not found
-- aos> Send({ Target = ao.id, Action = "GetAchievement", Data = '{"address": "0x01"}'})
Handlers.add(
  "GetAchievement",
  Handlers.utils.hasMatchingTag("Action", "GetAchievement"),
  function (msg)
    local dataJson = json.decode(msg.Data)
    local address = dataJson.address
    -- Prepare the SQL statement to retrieve the achievement data
    local stmt = DB:prepare [[
      SELECT * FROM achievement_1_kv WHERE address = :address;
    ]]

    if not stmt then
      error("Failed to prepare SQL statement: " .. DB:errmsg())
    end

    stmt:bind_names({ address = address })
    local achievement = query(stmt)[1]
    
    if achievement then
      local achievementJson = json.encode(achievement)
      print(achievementJson)
      Handlers.utils.reply(achievementJson)(msg)
    else
      initAchievement(msg.Data, msg.Timestamp)
      achievement = query(stmt)[1]
      local achievementJson = json.encode(achievement)
      print(achievementJson)
      Handlers.utils.reply(achievementJson)(msg)
    end

    stmt:reset()
    stmt:finalize()
  end
)

-- Function to check if the sender is in the whitelist
local function isInWhitelist(process_id)
  local stmt = DB:prepare [[
    SELECT * FROM whitelist WHERE process_id = :process_id;
  ]]

  if not stmt then
    error("Failed to prepare SQL statement: " .. DB:errmsg())
  end

  stmt:bind_names({ process_id = process_id })
  local result = query(stmt)[1]
  stmt:reset()
  stmt:finalize()

  return result ~= nil
end

-- Handler to append data to an achievement
-- aos> Send({ Target = ao.id, Action = "AppendAchievement" , Data = '{"data": "try", "title": "try", "proven": "", "address": "0x01"}'})
Handlers.add(
  "AppendAchievement",
  Handlers.utils.hasMatchingTag("Action", "AppendAchievement"),
  function (msg)
    -- Check if the sender is in the whitelist
    if not isInWhitelist(msg.From) then
      Handlers.utils.reply("Permission denied: Sender not in whitelist")(msg)
      return
    end

    local dataJson = json.decode(msg.Data)
    local address = dataJson.address

    -- Generate a unique id for this achievement
    local newAchievement = {
      id = generateRandomHex(32), -- Unique ID for this achievement
      process_id = msg.From,
      data = dataJson.data,
      title = dataJson.title,
      proven = dataJson.proven,
    }

    -- Prepare the SQL statement to retrieve the current achievements
    local stmt = DB:prepare [[
      SELECT * FROM achievement_1_kv WHERE address = :address;
    ]]

    if not stmt then
      error("Failed to prepare SQL statement: " .. DB:errmsg())
    end

    stmt:bind_names({ address = address })
    local achievement = query(stmt)[1]

    if not achievement then
      -- Initialize achievements if not found
      initAchievement(msg.Data, msg.Timestamp)
      achievement = query(stmt)[1]
    end

    -- Decode current achievements data
    local achievementData = json.decode(achievement.data)
    table.insert(achievementData, newAchievement)

    -- Prepare the SQL statement to update the achievements
    local updateStmt = DB:prepare [[
      UPDATE achievement_1_kv SET data = :data, lastUpdated = :lastUpdated WHERE address = :address;
    ]]

    if not updateStmt then
      error("Failed to prepare SQL statement: " .. DB:errmsg())
    end

    updateStmt:bind_names({
      address = address,
      data = json.encode(achievementData),
      lastUpdated = msg.Timestamp
    })

    local result = updateStmt:step()
    if result ~= sqlite3.DONE then
      print("Error updating achievement in the database")
      Handlers.utils.reply("Error updating achievement in the database")(msg)
    else
      print("Achievement updated!")
      Handlers.utils.reply("Achievement updated!")(msg)
    end

    updateStmt:reset()
    updateStmt:finalize()
    stmt:reset()
    stmt:finalize()
  end
)


-- Query with cursor
-- Function to get all achievements with pagination
local function getAllAchievements(cursor, limit)
  local stmt

  if cursor then
    stmt = DB:prepare [[
      SELECT * FROM achievement_1_kv WHERE id > :cursor LIMIT :limit;
    ]]
  else
    stmt = DB:prepare [[
      SELECT * FROM achievement_1_kv LIMIT :limit;
    ]]
  end

  if not stmt then
    error("Failed to prepare SQL statement: " .. DB:errmsg())
  end

  stmt:bind_names({
    cursor = cursor or 0,
    limit = limit
  })

  local rows = query(stmt)
  return rows
end


-- 
-- Handler to get all achievements with pagination
Handlers.add(
  "GetAllAchievements",
  Handlers.utils.hasMatchingTag("Action", "GetAllAchievements"),
  function (msg)
    local dataJson = json.decode(msg.Data)
    local cursor = dataJson.cursor
    local limit = dataJson.limit or 10

    local achievements = getAllAchievements(cursor, limit)
    local achievementsJson = json.encode(achievements)
    print(achievementsJson)
    Handlers.utils.reply(achievementsJson)(msg)
  end
)

-- Query with cursor
-- Function to get all achievements with pagination
local function getAllWhitelists(cursor, limit)
  local stmt

  if cursor then
    stmt = DB:prepare [[
      SELECT * FROM whitelist WHERE id > :cursor LIMIT :limit;
    ]]
  else
    stmt = DB:prepare [[
      SELECT * FROM whitelist LIMIT :limit;
    ]]
  end

  if not stmt then
    error("Failed to prepare SQL statement: " .. DB:errmsg())
  end

  stmt:bind_names({
    cursor = cursor or 0,
    limit = limit
  })

  local rows = query(stmt)
  return rows
end

-- Handler to get all achievements with pagination
Handlers.add(
  "GetAllWhitelists",
  Handlers.utils.hasMatchingTag("Action", "GetAllWhitelists"),
  function (msg)
    local dataJson = json.decode(msg.Data)
    local cursor = dataJson.cursor
    local limit = dataJson.limit or 10

    local achievements = getAllWhitelists(cursor, limit)
    local achievementsJson = json.encode(achievements)
    print(achievementsJson)
    Handlers.utils.reply(achievementsJson)(msg)
  end
)

-- Function to add a whitelist item
local function addWhitelistItem(description, process_id, name)
  local stmt = DB:prepare [[
    INSERT INTO whitelist (description, process_id, name)
    VALUES (:description, :process_id, :name);
  ]]

  if not stmt then
    error("Failed to prepare SQL statement: " .. DB:errmsg())
  end

  stmt:bind_names({
    description = description,
    process_id = process_id,
    name = name
  })

  local result = stmt:step()
  if result ~= sqlite3.DONE then
    print("Error inserting whitelist item into the database")
    return false
  else
    print("Whitelist item added!")
    return true
  end

  stmt:reset()
  stmt:finalize()
end

-- Send({ Target = ao.id, Action = "CreateWhitelistItem", Data = '{"process_id": "3eDlLGwAYtLRG2gD84VJj35Vqsndz8Qien1oD5KItlY", "name":"yuan-superisor", "description": "yuan superisor in yuan space."}'})
-- Handler to create a whitelist item
Handlers.add(
  "CreateWhitelistItem",
  Handlers.utils.hasMatchingTag("Action", "CreateWhitelistItem"),
  function (msg)

    -- Check if the message is from the admin
    if msg.From ~= admin then
      Handlers.utils.reply("Permission denied: Only admin can create whitelist items")(msg)
      return
    end

    local dataJson = json.decode(msg.Data)
    local description = dataJson.description
    local process_id = dataJson.process_id
    local name = dataJson.name

    local success = addWhitelistItem(description, process_id, name)
    Handlers.utils.reply(success and "Whitelist item added!" or "Error adding whitelist item")(msg)
  end
)

-- -- Function to update a whitelist item
-- local function updateWhitelistItem(id, description, process_id, name)
--   local stmt = DB:prepare [[
--     UPDATE whitelist
--     SET description = :description, process_id = :process_id, name = :name
--     WHERE id = :id;
--   ]]

--   if not stmt then
--     error("Failed to prepare SQL statement: " .. DB:errmsg())
--   end

--   stmt:bind_names({
--     id = id,
--     description = description,
--     process_id = process_id,
--     name = name
--   })

--   local result = stmt:step()
--   if result ~= sqlite3.DONE then
--     print("Error updating whitelist item in the database")
--     return false
--   else
--     print("Whitelist item updated!")
--     return true
--   end

--   stmt:reset()
--   stmt:finalize()
-- end

-- -- Handler to update a whitelist item
-- Handlers.add(
--   "UpdateWhitelistItem",
--   Handlers.utils.hasMatchingTag("Action", "UpdateWhitelistItem"),
--   function (msg)
--     local dataJson = json.decode(msg.Data)
--     local id = dataJson.id
--     local description = dataJson.description
--     local process_id = dataJson.process_id
--     local name = dataJson.name

--     local success = updateWhitelistItem(id, description, process_id, name)
--     Handlers.utils.reply(success and "Whitelist item updated!" or "Error updating whitelist item")(msg)
--   end
-- )

-- -- Function to delete a whitelist item
-- local function deleteWhitelistItem(id)
--   local stmt = DB:prepare [[
--     DELETE FROM whitelist WHERE id = :id;
--   ]]

--   if not stmt then
--     error("Failed to prepare SQL statement: " .. DB:errmsg())
--   end

--   stmt:bind_names({ id = id })

--   local result = stmt:step()
--   if result ~= sqlite3.DONE then
--     print("Error deleting whitelist item from the database")
--     return false
--   else
--     print("Whitelist item deleted!")
--     return true
--   end

--   stmt:reset()
--   stmt:finalize()
-- end

-- -- Handler to delete a whitelist item
-- Handlers.add(
--   "DeleteWhitelistItem",
--   Handlers.utils.hasMatchingTag("Action", "DeleteWhitelistItem"),
--   function (msg)
--     local dataJson = json.decode(msg.Data)
--     local id = dataJson.id

--     local success = deleteWhitelistItem(id)
--     Handlers.utils.reply(success and "Whitelist item deleted!" or "Error deleting whitelist item")(msg)
--   end
-- )


