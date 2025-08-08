local js = require("js")
local global = js.global

local http = {}

function http.request(callback, method, url, headers, body)
	coroutine.wrap(function()
		local opts = js.new(global.Object)
		opts.method = method or "GET"

		if headers then
			local jsHeaders = js.new(global.Object)
			for k, v in pairs(headers) do jsHeaders[k] = v end
			opts.headers = jsHeaders
		end

		if body then opts.body = body end

		local promise = global:fetch(url, opts)

		local status = 408

		local jsonPromise = promise["then"](promise, function(_, response)
			status = response.status
			return response:json()
		end)

		jsonPromise["then"](jsonPromise, function(_, body, thing) return callback(status == 200, body) end)
	end)()
end

return http
