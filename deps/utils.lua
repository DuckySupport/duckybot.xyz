local js = require("js")
local http = require("http")
local time = require("time")
local global = js.global
local document = global.document
local elements = {
    notifications = document:getElementById("notificationContainer"),
    loading = {
		container = document:getElementById("loadingScreen"),
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

function utils.formatNumber(n)
	local number = js.new(global.Number, n)
	return number:toLocaleString()
end

function utils.mobile()
    return global.innerWidth <= 768
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

function utils.input(input, lower)
    local value = input.value ~= "" and input.value
    if value and lower then
        value = value:lower()
    end

    return value
end


function utils.plural(n, word)
    local str = n .. " " .. word
    return (n == 1 and str) or (str .. "s")
end

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

function utils.truncate(str, len)
    if #str > len then
        return str:sub(1, len - 3) .. "..."
    else
        return str
    end
end

function utils.cookie(name, value)
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
    else
        local expires = os.date("!%a, %d %b %Y %H:%M:%S GMT", os.time() + 5 * 24 * 60 * 60)
        document.cookie = name .. "=" .. value .. "; expires=" .. expires .. "; path=/; Secure; SameSite=Lax"
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
    if (not elements.loading.container) or (not elements.loading.icon) or (not elements.loading.title) or (not elements.loading.text) then return end

    local icons = {
        loading = "/images/icons/Loading.gif",
        success = "/images/icons/Success.svg",
        fail = "/images/icons/Fail.svg"
    }

    if not icon then
        elements.servers.loading.container:remove()
    else
        elements.servers.loading.icon.src = icons[icon] or icon
        elements.servers.loading.title.textContent = title
        elements.servers.loading.text.textContent = text
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
    cookie = cookie or utils.cookie("discord")

    if cookie then
        if utils.cache.users and utils.cache.users[cookie] and (not refresh) then return utils.cache.users[cookie] end
        local success, response = http.requestSync("GET", "https://api.duckybot.xyz/users/@me", {
            ["Discord-Code"] = cookie
        })

        if success and response and response.data then
            utils.cache.users = utils.cache.users or {}
            utils.cache.users[cookie] = response.data
            return response.data
        end
    end
end

function utils.guild(id, cookie)
    cookie = cookie or utils.cookie("discord")
    
    if id then
        local success, response = http.requestSync("GET", "https://devapi.duckybot.xyz/guilds/" .. id .. "/info", {
            ["Discord-Code"] = cookie
        })

        if success and response and response.data then
            return response.data
        end
    end
end

function utils.erlc(id, cookie)
    cookie = cookie or utils.cookie("discord")
    
    if id then
        local success, response = http.requestSync("GET", "https://devapi.duckybot.xyz/guilds/" .. id .. "/erlc/data", {
            ["Discord-Code"] = cookie
        })

        if success and response and response.data then
            return response.data
        end
    end
end

return utils
