local js = require("js")
local global = js.global

local time = {}

function time.interval(interval, cb)
    local newInterval

    local function callback()
        local stop = cb() == true

        if stop then
            global:clearInterval(newInterval)
        end
    end

    newInterval = global:setInterval(callback, interval)
end

function time.now()
    return js.global.Date:now() / 1000
end

function time.sleep(ms)
    local co = coroutine.running()
    if not co then error("time.sleep() must be called from a coroutine") end

    global:setTimeout(function()
        coroutine.resume(co)
    end, ms)

    coroutine.yield()
end

return time