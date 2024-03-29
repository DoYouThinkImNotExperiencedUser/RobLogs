Hello, in this repo i will rant about a problem, provide potential solution + a litle tutorial on how to implement it/setup

## The problem
Logging, most devs are familiar with this in some way or another, and i've noticed, alot of Roblox groups/games or whatver, use Discord's webhooks to log.
As a result of this, they need to create new comms channels specifically for logs and Discord even blocked (at some point, not sure if this is still valid) webhook API requests
coming from Roblox's servers. So developers needed to find workarounds, like proxies.

## The solution
While this is litle bit harder to setup and requires more resources, it is worth it in the end. I don't expect everyone who reads this post to automatically do this, but atleast try it out 
and see if it would fit your standards.
Now, i introduce you, Grafana (NOT developed by me), i would define it as open source "analytics" solution (capable of logging). 

# The tutorial

### What do you need?
- Debian/Ubuntu (doesn't need to be) with docker,git,docker-compose and npm installed, this would be the logging server
- Optionally static ip, or domain so you can portforward
#### In case you dont have these installed
To install docker, git, and docker-compose
- `sudo apt-get install docker.io`
- `sudo apt-get install git`

### What now?
- Clone the git repository
`git clone https://github.com/DoYouThinkImNotExperiencedUser/RobLogs`
- then navigate to the folder
`cd [Directory]` 
- open index.js and change token variable to something more secure (very important!!!)
`nano index.js`
CTRL+S to save and CTRL+X to exit
- Run the docker compose command
`docker compose up -d`
- Wait for the services to boot up (if doesnt work run it with sudo, the status can be checked with `docker ps`
- In your web browser, type your server's local ip with port 3000 (http://[IP]:3000) (if you're on local network/vpn'd to the network of the remote machine)
- It will ask you to log in, default login is admin:admin, then it will ask you for new password (make it something strong and secure!!)
- Now you're logged in, great! Navigate to "Connections tab", type "Loki" in the search bar and click on it, and then click on "Add new data source"
- Type in your servers local ip again but with port 3100

Great! That concludes setting up the infrastructure, now, it is safe to portforward ports 3000 if you have strong password, and 8080 which is for the api.

### Viewing logs
To view logs, simply navigate to "Explore" tab select Loki (or whatever you named it) and then query, you can also add it to a dashboard or anything, 
also you can view the logs view, you can play around with this yourself.

But since there were no logs added yet, we need a way to submit them, this is where the api comes in.
### Logs api
The Node.js api we setup is only for authentication, because apparently loki by default doesnt come with authentication and we need to manage that ourselves (atleast thats what i understood) to submit a log, the api format is like this

```
timestamp_ns=$(([UNIX TIMESTAMP] * 1000000000))

curl -H "Content-Type: application/json" \
    -H "Authorization: token" \
    -X POST \
    --url http://192.168.1.13:8080/api/log \
    --data-raw "{\"streams\": [{\"stream\": {\"label\": \"value\"}, \"values\": [[\"${timestamp_ns}\", \"Hello world\"]]}]}"
```

UNIX TIMESTAMP is, well you know... to get unix timestamp in roblox you can use the `os.time()` function and multiply it by 1000000000 to get the time in nanoseconds, since thats what grafana uses for timestamps
the label and value, basically label is something like key and value is well... value! so for example we can have values,
- "Error-type": "Client"
- "Kill-count": "6969"
- "Death-count": "1859"
- "Team": "blue"
- It is not limited to that, labels can be anything also make sure to include the timestamp otherwise it wont work

in roblox if you have a part, click detector and script in it
```
local clickDetector = script.Parent
local HttpService = game:GetService("HttpService")

local function Log(timestamp_ns, message)
	local timestamp_ns = os.time() * 1000000000
	local url = "[PROXY IP (PORTFORWARDED) OR DOMAIN NAME]/api/log"
	local headers = {
		["Authorization"] = "token"
	}
	local body = HttpService:JSONEncode({
		streams = {{
			stream = { label = "value" },
			values = { { timestamp_ns, message } }
		}}
	})

	local success, response = pcall(function()
		return HttpService:PostAsync(url, body, Enum.HttpContentType.ApplicationJson, false, headers)
	end)

	if success then
		print("200 OK")
	else
		print("Request failed: " .. response)
	end
end


clickDetector.MouseClick:Connect(function(player)
	Log("Cheese")
end)
```
Didn't bother to try if it works but i guess debugging it wont be hard
