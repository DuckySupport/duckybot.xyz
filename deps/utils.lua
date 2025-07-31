local js = require("js")
local global = js.global

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
    global.window.location.href = url
end

return utils
