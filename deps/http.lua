local js = require("js")
local global = js.global

local http = {}

function http.request(callback, method, url, headers, body, process)
	coroutine.wrap(function()
		process = process or "json"
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

		local processPromise = promise["then"](promise, function(_, response)
			status = response.status
			return response[process](response)
		end)

		processPromise["then"](processPromise, function(_, body) return callback(status >= 200 and status < 300, body) end)
	end)()
end

return http
