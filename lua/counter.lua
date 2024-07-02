Players = Players or {}

-- bizz buzz
count = 0
-- .load counter.lua
-- Send({ Target = ao.id, Action = "Click" })

Handlers.add(
  "AddNew",
  Handlers.utils.hasMatchingTag("Action", "AddNew"),
  function (msg)
    table.insert(Players, msg.Data)
    count = #Players
    Handlers.utils.reply("bizz buzz")(msg)
  end
)

Handlers.add(
  "Info",
  Handlers.utils.hasMatchingTag("Action", "Info"),
  function (msg)
    -- TODO: impl the info with the source code of this snippet
    info = [[
Players = Players or {}

-- bizz buzz
count = 0
-- .load counter.lua
-- Send({ Target = ao.id, Action = "Click" })

Handlers.add(
  "AddNew",
  Handlers.utils.hasMatchingTag("Action", "AddNew"),
  function (msg)
    table.insert(Players, msg.Data)
    count = #Players
    Handlers.utils.reply("bizz buzz")(msg)
  end
)
      ]]
    Handlers.utils.reply(info)(msg)
  end
)