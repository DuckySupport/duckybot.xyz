local js = require("js")
local json = require("json")
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

		if body then opts.body = (type(body) == "table" and json.encode(body)) or body end

		local promise = global:fetch(url, opts)

		local status = 408

		local processPromise = promise["then"](promise, function(_, response)
			status = response.status
			return response:text()
		end)

		processPromise["then"](processPromise, function(_, body)
			if process == "json" then
				body = json.decode(body)
			end
			
			return coroutine.wrap(callback)(status >= 200 and status < 300, body)
		end)
	end)()
end

function http.requestSync(...)
	local co, main = coroutine.running()
	assert(co and not main, "http.requestSync must be called from a coroutine")

	http.request(function(success, response)
		coroutine.resume(co, success, response)
	end, ...)

	return coroutine.yield()
end

return http
