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

return utils
