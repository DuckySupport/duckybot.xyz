local js = require("js")
local global = js.global

local http = {}

function http.request(callback, method, url, headers, body)
    local promise = global:fetch(url)
    local jsonPromise = promise["then"](promise, function(_, response) return response:json() end)

    jsonPromise["then"](jsonPromise, function(_, body)
        return coroutine.wrap(callback)(body.code == 200, body)
    end)
end

return http
