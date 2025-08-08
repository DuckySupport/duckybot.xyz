local js = require("js")
local global = js.global
local document = global.document

local utils = {}

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
    local new = {}

    for i, v in pairs(tbl) do
        table.insert(new, v)
        if i == chop then
            break
        end
    end

    return new
end

function utils.floorDigits(n, digits)
    digits = digits or 4
    local factor = 10 ^ digits
    return math.floor(n / factor) * factor
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
    global.window.location.href = url
end

function utils.truncate(str, len)
    return str:sub(1, len - 3) .. "..."
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
        document.cookie = name .. "=" .. value .. "; path=/"
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


return utils
