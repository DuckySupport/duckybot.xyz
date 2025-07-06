
# Ducky Privacy Policy

Terms of Service: https://duckybot.xyz/legal/tos

Effective Date: September 29, 2024

Last Updated: July 6, 2025

## 1. Introduction
Welcome to the Privacy Policy of Ducky. If you haven't already, read our Terms of Service first and then this Privacy Policy. I will try to be as transparent as possible about how Ducky uses information it receives from users. Whenever this Privacy Policy mentions **giving us consent** or similar phrases, it refers to giving Ducky your consent. "Us" and "Ducky" are used interchangeably, and both mean the same thing in this context.

## 2. Using the Ducky website
We currently support 2 features on our website that collect and process information. This includes Discord login and Roblox login; these are both done through an OAuth2 flow. For Discord login, the website stores a cookie with the provided authentication code from Discord. For Roblox login, the authentication code from Roblox is send to our API, which can link your Discord account with your Roblox account. More information about linking with Ducky can be found in section 3.1. Our domain is managed by Cloudflare, which provides basic statistical information about traffic on our domain. For information about how Cloudflare handles data, please view their [privacy policy](https://www.cloudflare.com/privacypolicy/).


## 3. Using Ducky in Discord
When using Ducky in your Discord server, you give us consent to see and process information about your server and you Ducky has access to. Additionally, Ducky may store and use information you give it to make it do what it's supposed to. Extra information on specific topics can be found below.

### 3.1. Roblox Linking
There are 2 ways you can get linked with Ducky. First is manually linking yourself. This can be done through the website or with the legacy verification method through a Discord command. The second possibility is when joining a server that has the **Use Bloxlink** feature enabled. This will use the Bloxlink "private" API (which requires a server key and the user to be a member of the server) to see if you have Roblox information on Bloxlink. If it does find Roblox information, it will DM you with confirmation and will not store the information from the Bloxlink API until you authorize this. If you don't want to receive this DM anymore, you can click the third option **Deny, and don't ask again**. Ducky will store your preference in usersettings, which can be managed with the `/usersettings` command. With that command you can also disable this feature in advance, and Ducky will not look up Roblox information using the Bloxlink API for you. Once linked with Ducky, using any way, anyone can get your Roblox ID using your Discord ID and the other way around. You can unlink from Ducky at any time using the `/link` command and click **Unlink**.

### 3.2. ER:LC API Key
When providing Ducky with an API key, you give us consent to see and process information about your ER:LC server. This doesn't mean we are going to spy on your ER:LC server; this means you give us, but in reality, Ducky, permission to see and process the information it gets using the ER:LC API. Ducky will automate requests to the PRC API, required for many of its features. Abiding by the [PRC Private Server API Use Guidelines](https://apidocs.policeroleplay.community/api-information/api-use-guidelines), once Ducky is removed from your server, it will not make any requests to the PRC API using your API key. For information about data retention, including the retention of your ER:LC API key, see section x.


## 4. Storage of Data
Ducky stores data in an SQL database. The raw data files are only accessible by Ducky Developers, which currently include bobbibones (Discord ID: 782235114858872854) and troptopreal (Discord ID: 598958193032560642). Access to data through any Ducky service will ensure the user has the required authorization to access that data. Ducky frequently makes a backup of the raw data file, and this will only be used for disaster recovery.

## 5. Security of Data
We care about keeping your data safe. We do our best to protect it using reasonable technical and organizational measures. However, no system is perfect, and things can still go wrong, like unexpected bugs or attacks. We implement reasonable security measures to protect your data. However, no system is completely secure, and we cannot guarantee prevention of unauthorized access, loss, or breaches. To the fullest extent permitted by law, we disclaim liability for any damages resulting from such incidents.

## 6. Retention and Deletion of Data
Server data is removed 7 days after removing Ducky from the server. You can manually wipe all server data on the first page of `/setup`. As stated in section 4, we make backups of the raw data file; this includes all data. Backups are deleted after 14 days.

## 7. Data Requests
If you would like to request all data we have about you or request deletion of all data, you can create a development ticket in our support server (Discord ID: 1228508072289370172, accessible at https://discord.gg/FChsKWG3ra) or DM bobbibones (Discord ID: 782235114858872854). We do not allow this through any other communication channel, as we cannot confirm ownership on any other communication channel.