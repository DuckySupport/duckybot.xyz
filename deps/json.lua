local js = require("js")
local global = js.global

local json = {}

local function convert(v)
	if type(v) == "table" then
		-- detect array
		local is_array = (#v > 0)
		if is_array then
			local arr = js.new(global.Array)
			for i = 1, #v do arr[i - 1] = convert(v[i]) end
			return arr
		else
			local obj = js.new(global.Object)
			for k, val in pairs(v) do obj[k] = convert(val) end
			return obj
		end
	elseif v == nil then
		return js.null
	else
		return v
	end
end

function json.encode(data) return global:JSON():stringify(convert(data)) end

function json.decode(str) return global:JSON():parse(str) end

return json
