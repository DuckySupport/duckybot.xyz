local js = require("js")
local http = require("http")
local time = require("time")
local global = js.global
local window = global.window
local document = global.document
local body = document.body
local console = global.console
local elements = {
    notifications = document:getElementById("notificationContainer"),
    loading = {
		container = document:getElementById("loadingContainer"),
		icon = document:getElementById("loadingIcon"),
		title = document:getElementById("loadingTitle"),
		text = document:getElementById("loadingText")
	}
}

local redirectWhitelist = {
    "/", -- self,
    "http://localhost:8888", -- local development
    "https://duckybot.xyz/",
    "https://dev.duckybot.xyz/",
    "https://docs.duckybot.xyz/",
    "https://status.duckybot.xyz/",
    "https://discord.com/",
    "https://discord.gg/",
    "https://authorize.roblox.com/"
}

local utils = {
    cache = {}
}

function utils.clamp(n, min, max)
	if n < min then
		return min
	elseif n > max then
		return max
	else
		return n
	end
end

function utils.round(n, i)
    local m = 10 ^ (i or 0)
	return math.floor(n * m + 0.5) / m
end

function utils.formatNumber(n)
	local number = js.new(global.Number, n)
	return number:toLocaleString()
end

function utils.mobile()
    return window.innerWidth <= 768
end

function utils.shuffle(tbl)
	for i = #tbl, 2, -1 do
		local j = math.random(i)
		tbl[i], tbl[j] = tbl[j], tbl[i]
	end
	return tbl
end

function utils.chop(tbl, chop)
    local ret = {}

    for i, v in pairs(tbl) do
        table.insert(ret, v)
        if i == chop then
            break
        end
    end

    return ret
end

function utils.floorDigits(n, digits)
    digits = digits or 4
    local factor = 10 ^ digits
    return math.floor(n / factor) * factor
end

function utils.filter(tbl, pred)
    local ret = {}

    for _, v in pairs(tbl) do
        if pred(v) == true then
            table.insert(ret, v)
        end
    end

    return ret
end

function utils.find(tbl, key, value)
    for _, v in pairs(tbl) do
        if v[key] == value then
            return v
        end
    end
    return nil
end

function utils.input(input, lower)
    local value = input.value ~= "" and input.value
    if value and lower then
        value = value:lower()
    end

    return value
end

function utils.plural(n, word, pluralized)
    local str = n .. " " .. word
    return (n == 1 and str) or ((pluralized and n .. " " .. pluralized) or (str .. "s"))
end

-- 

function utils.ago(timestamp)
    local now = time.now()
    local diff = now - timestamp

    if diff < 1 then
        return "just now"
    elseif diff < 60 then
        return utils.plural(math.floor(diff), "second") .. " ago"
    elseif diff < 3600 then
        return utils.plural(math.floor(diff / 60), "minute") .. " ago"
    elseif diff < 86400 then
        return utils.plural(math.floor(diff / 3600), "hour") .. " ago"
    else
        return utils.plural(math.floor(diff / 86400), "day") .. " ago"
    end
end

function utils.hexToRGBA(hex, alpha)
    hex = hex:gsub("#","")
    local r = tonumber(hex:sub(1,2), 16)
    local g = tonumber(hex:sub(3,4), 16)
    local b = tonumber(hex:sub(5,6), 16)
    return string.format("rgba(%d, %d, %d, %.2f)", r, g, b, alpha or 1)
end

function utils.redirect(url)
    if url:sub(1, 4) ~= "http" and url:sub(1, 1) ~= "/" then
        url = "/" .. url
    end
    
    for _, whitelistedURL in pairs(redirectWhitelist) do
        if url:sub(1, #whitelistedURL) == whitelistedURL then
            global.window.location.href = url
            break
        end
    end
end

--[[

data: {
    title = string,
    content = string,
    buttons = {
        {
            label = string,
            style = success/fail/transparent/glass,
            callback = function
        },
        ...
    },
    width = number/nil
}

example: {
    title = "Are you sure you want to do this?",
    content = "This cannot be undone.",
    buttons = {
        {
            label = "Yes",
            style = "success",
            callback = function()
                print("Pressed yes")
            end
        },
        {
            label = "No",
            style = "fail",
            callback = function()
                print("Pressed no")
            end
        }
    }
}

]]--
function utils.popup(data)
    local popupWrapper = document:createElement("div")
    local wrapperClass = "fixed inset-0 bg-black/30 flex items-center justify-center z-50"
    if data.blur then
        wrapperClass = wrapperClass .. " backdrop-blur-sm"
    end
    popupWrapper.className = wrapperClass

    local new = document:createElement("div")
    new.className = "popup animate-in quick"

    if utils.mobile() then
        new.style.width = "90vw"
        new.style.maxWidth = "400px"
    elseif data.width then
        new.style.width = data.width .. "px"
    else
        new.style.width = "500px"
    end

    new.innerHTML = string.format([[
        <div class="header">
            <p class="text-primary text-2xl font-bold m-0">%s</p>
            <button id="close">✕</button>
        </div>
        <p>%s</p>
    ]], data.title or "", data.content or "")

    local function close()
        new.classList:remove("animate-in")
        new.classList:add("animate-out")

        time.after(200, function()
            popupWrapper:remove()
        end)
    end

    popupWrapper:addEventListener("click", function()
        if js.global.event.target == popupWrapper then
            close()
        end
    end)

    local buttons = document:createElement("div")
    buttons.className = "buttons"

    for _, buttonData in pairs(data.buttons or {}) do
        local button = document:createElement("button")
        button.className = "btn-" .. buttonData.style .. " px-5 py-2.5 sm:px-6 sm:py-2 rounded-full text-sm sm:text-base"
        button.textContent = buttonData.label
        button:addEventListener("click", function(...)
            buttonData.callback(...)
            close()
        end)
        buttons:appendChild(button)
    end

    new:querySelector(".header #close"):addEventListener("click", close)

    new:appendChild(buttons)
    popupWrapper:appendChild(new)
    body:appendChild(popupWrapper)
end

function utils.truncate(str, len)
    if #str > len then
        return str:sub(1, len - 3) .. "..."
    else
        return str
    end
end

function utils.date(timestamp)
    local makeDate = js.global:eval("(function(t) { return new Date(t * 1000).toUTCString(); })")
    return makeDate(timestamp)
end

function utils.cookie(name, value, expires_in_seconds, samesite)
    if value == nil then
        local cookies = document.cookie
        if not cookies then return end

        for cookie in cookies:gmatch("([^;]+)") do
            local k, v = cookie:match("^%s*(.-)%s*=%s*(.*)%s*$")
            if k == name then
                return v
            end
        end
    elseif value == "delete" then
        document.cookie = name .. "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/"
        return utils.cookie(name) == nil
    else
        local lifetime = expires_in_seconds or 630720000
        local expires = utils.date(os.time() + lifetime)
        document.cookie = name .. "=" .. value .. "; expires=" .. expires .. "; path=/; Secure; SameSite=" .. (samesite or "Lax")

        local attempt = 1
        repeat
            attempt = attempt + 1
        until utils.cookie(name) or attempt > 10

        return utils.cookie(name) == value
    end
end

function utils.parameters()
    local params = {}
    local location = global.window.location
    local query = location.search or ""
    local hash = location.hash or ""

    local function parse(str)
        if str and #str > 1 then
            str = str:sub(2)
            for pair in str:gmatch("[^&]+") do
                local key, value = pair:match("([^=]+)=?(.*)")
                if key then
                    key = global:decodeURIComponent(key)
                    value = global:decodeURIComponent(value)
                    params[key] = value
                end
            end
        end
    end

    parse(query)
    parse(hash)

    return params
end

function utils.crypto()
    return global.crypto:randomUUID()
end

function utils.split(str, delim)
	local ret = {}
	if not str then
		return ret
	end
	if not delim or delim == '' then
		for c in string.gmatch(str, '.') do
			table.insert(ret, c)
		end
		return ret
	end
	local n = 1
	while true do
		local i, j = string.find(str, delim, n)
		if not i then break end
		table.insert(ret, string.sub(str, n, i - 1))
		n = j + 1
	end
	table.insert(ret, string.sub(str, n))
	return ret
end

function utils.loading(icon, title, text)
    if not icon then
        if elements.loading and elements.loading.container then
            elements.loading.container:remove()
        end
    else
        if (not elements.loading.container) or (not elements.loading.icon) or (not elements.loading.title) or (not elements.loading.text) then return end

        local icons = {
            loading = "/images/icons/Loading.gif",
            success = "/images/icons/Success.svg",
            fail = "/images/icons/Fail.svg"
        }

        elements.loading.icon.src = icons[icon] or icon
        elements.loading.title.textContent = title
        elements.loading.text.textContent = text
    end
end

function utils.notify(message, type, duration)
    if not elements.notifications then return end

    local notification = document:createElement("div")
    local icon

    if type == "success" then
        notification.className = "flex items-start bg-green-500/10 text-green-400 p-4 rounded-lg shadow-lg w-80 slide-in-right"
        icon = '<img src="/images/icons/Success.svg" class="w-6 h-6">'
    elseif type == "warning" then
        notification.className = "flex items-start bg-yellow-500/10 text-yellow-400 p-4 rounded-lg shadow-lg w-80 slide-in-right"
        icon = '<i class="fas fa-exclamation-triangle text-xl"></i>'
    elseif type == "fail" then
        notification.className = "flex items-start bg-red-500/10 text-red-400 p-4 rounded-lg shadow-lg w-80 slide-in-right"
        icon = '<img src="/images/icons/Fail.svg" class="w-6 h-6">'
    end

    notification.innerHTML = string.format([[
        <div class="flex-shrink-0">
            %s
        </div>
        <div class="ml-3">
            <p class="text-sm">%s</p>
        </div>
    ]], icon, message)

    elements.notifications:appendChild(notification)

    coroutine.wrap(function()
        time.sleep(duration or 5000)
        notification.classList:remove("slide-in-right")
        notification.classList:add("slide-out-right")
        time.sleep(500)
        notification:remove()
    end)()
end

function utils.readable(seconds, short, ms)
	local function decompose(value, mult)
		return math.modf(value / mult), math.fmod(value, mult)
	end
	
    local units = short and {
        {'y', 31536000000},
		{'mo', 2592000000},
		{'w', 604800000},
		{'d', 86400000},
		{'h', 3600000},
		{'m', 60000},
		{'s', 1000}
	} or {
        {'year', 31536000000},
		{'month', 2592000000},
		{'week', 604800000},
		{'day', 86400000},
		{'hour', 3600000},
		{'minute', 60000},
		{'second', 1000}
    }

    if ms then
        if short then
            table.insert(units, 1, {'ms', 1})
        else
            table.insert(units, 1, {'milliseconds', 1})
        end
    end

	local ret = {}
	local ms = seconds * 1000
	for _, unit in ipairs(units) do
		local n
		n, ms = decompose(ms, unit[2])
		if n > 0 then
			table.insert(ret, ((short and n .. unit[1]) or utils.plural(n, unit[1])))
		end
	end
	return #ret > 0 and table.concat(ret) or "0s"
end


function utils.convert(str, denyseconds)
    if not str then return nil end
    local units = {
        s = 1,
        m = 60,
        h = 3600,
        d = 86400,
        w = 604800,
        y = 31449600
    }
    local matchpattern = ""

    if denyseconds then
        units.s = nil
        matchpattern = "(%d+)([mhdwy"
    else
        matchpattern = "(%d+)([smhdwy"
    end

    matchpattern = matchpattern .. "]?)"

    local total = 0

    for i, v in str:gmatch(matchpattern) do
        local add = tonumber(i) * (units[v] or ((denyseconds and 0) or 1))
        total = total + add
    end

    if total == 0 then return nil end

    return total
end

function utils.user(cookie, refresh)
    cookie = cookie or utils.cookie("token")

    if cookie then
        if utils.cache.users and utils.cache.users[cookie] and (not refresh) then return utils.cache.users[cookie] end
        local success, response = http.requestSync("GET", "https://api.duckybot.xyz/users/@me", {
            ["token"] = cookie
        })

        if success and response and response.data then
            utils.cache.users = utils.cache.users or {}
            utils.cache.users[cookie] = response.data
            return response.data
        end
    end
end

function utils.auth(code)
    local success, response = http.requestSync("POST", "https://api.duckybot.xyz/auth", {
        ["Discord-Code"] = code
    })

    if success and response and response.data then
        utils.cookie("token", response.data.token)

       return response.data
    end
end

function utils.guild(id, cookie)
    cookie = cookie or utils.cookie("token")

    if id then
        local success, response = http.requestSync("GET", "https://devapi.duckybot.xyz/guilds/" .. id .. "/info", {
            ["Discord-Code"] = cookie
        })

        if success and response and response.data then
            return true, response.data
        else
            return false, response
        end
    end
end

function utils.panel(id, cookie)
    cookie = cookie or utils.cookie("token")

    if id then
        local success, response = http.requestSync("GET", "https://devapi.duckybot.xyz/guilds/" .. id .. "/panel", {
            ["Discord-Code"] = cookie
        })

        if success and response and response.data then
            return true, response.data
        else
            return false, response
        end
    end

    return false, nil
end

function utils.erlc(id, cookie)
    cookie = cookie or utils.cookie("token")

    if id then
        local success, response = http.requestSync("GET", "https://devapi.duckybot.xyz/guilds/" .. id .. "/erlc/data", {
            ["Discord-Code"] = cookie
        })

        if success and response and response.data then
            return response.data
        end
    end
end

function utils.queryUser(query, cookie)
    cookie = cookie or utils.cookie("token")

    if query then
        local success, response = http.requestSync("GET", "https://devapi.duckybot.xyz/users/" .. query, {
            ["Discord-Code"] = cookie
        })

        if success and response and response.data then
            return response.data
        end
    end
end

function utils.punishments(guildID, targetPlayer, targetModerator, cookie)
    cookie = cookie or utils.cookie("token")

    if guildID then
        local headers = {
            ["Discord-Code"] = cookie,
        }

        if targetPlayer then
            headers["Player"] = targetPlayer
        end

        if targetModerator then
            headers["Moderator"] = targetModerator
        end

        local success, response = http.requestSync("GET", "https://devapi.duckybot.xyz/guilds/" .. guildID .. "/punishments", headers)
        if success and response and response.data and response.data.punishments then
            return response.data.punishments
        end
    end
end

function utils.bolos(guildID, targetPlayer, cookie)
    cookie = cookie or utils.cookie("token")

    if guildID then
        local targetPlayer = string.format("%.0f", tostring(targetPlayer))
        local url = "https://devapi.duckybot.xyz/guilds/" .. guildID .. "/bolos" .. ((tostring(targetPlayer) and "/" .. tostring(targetPlayer)) or "")
        console.log(nil, url)
        local success, response = http.requestSync("GET", url, {
            ["Discord-Code"] = cookie
        })

        if success and response and response.data then
            return response.data
        end
    end
end

function utils.shifts(id, cookie)
    cookie = cookie or utils.cookie("token")

    if id then
        local success, response = http.requestSync("GET", "https://devapi.duckybot.xyz/guilds/" .. id .. "/shifts", {
            ["Discord-Code"] = cookie
        })

        if success and response and response.data then
            return response.data
        end
    end
end

function utils.startShift(guildID, shiftType, cookie, callback)
    cookie = cookie or utils.cookie("token")
    if guildID and shiftType then
        http.request(callback, "POST", "https://devapi.duckybot.xyz/guilds/" .. guildID .. "/shifts/start", {
            ["Discord-Code"] = cookie,
            ["Content-Type"] = "application/json"
        }, {type = shiftType})
    end
end

function utils.pauseShift(guildID, cookie, callback)
    cookie = cookie or utils.cookie("token")
    if guildID then
        http.request(callback, "POST", "https://devapi.duckybot.xyz/guilds/" .. guildID .. "/shifts/pause", {
            ["Discord-Code"] = cookie
        })
    end
end

function utils.endShift(guildID, cookie, callback)
    cookie = cookie or utils.cookie("token")
    if guildID then
        http.request(callback, "POST", "https://devapi.duckybot.xyz/guilds/" .. guildID .. "/shifts/end", {
            ["Discord-Code"] = cookie
        })
    end
end

return utils
