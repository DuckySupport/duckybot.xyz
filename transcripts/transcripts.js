document.addEventListener("DOMContentLoaded", () => {
    const loadingElement = document.getElementById("loading")
    const transcriptElement = document.getElementById("transcript")
    const messagesElement = document.getElementById("messages")
    const guildIconElement = document.getElementById("guild-icon")
    const guildNameElement = document.getElementById("guild-name")
    const channelNameElement = document.getElementById("channel-name")
    const errorElement = document.getElementById("error")
  
    const hash = window.location.hash.substring(1)
    const [guildId, ticketId] = hash.split("-")
  
    if (!guildId || !ticketId) {
      loadingElement.style.display = "none"
      errorElement.style.display = "block"
      return
    }


    const discordToken = document.cookie.split('; ').find(row => row.startsWith('discord='))?.split('=')[1]

    if (!discordToken) {
      window.location.href = `/login?redirect=transcripts#${guildId}-${ticketId}`;
      return;
  }

    const apiUrl = `https://api.duckybot.xyz/guilds/${guildId}/transcripts/${ticketId}`
  
    fetch(apiUrl, {
      method: "GET",
      headers: { "Discord-Code": discordToken }
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        return response.json()
      })
      .then((response) => {
        const data = response.data
        loadingElement.style.display = "none"
        renderTranscript(data)
      })
      .catch((error) => {
        console.error("Error fetching transcript:", error)
        loadingElement.style.display = "none"
        errorElement.style.display = "block"
        errorElement.textContent = error.message
      })
  
    function renderTranscript(data) {
      transcriptElement.style.display = "block"
  
      const { guild, channel, messages } = data
  
      guildIconElement.src = guild.icon
      guildNameElement.textContent = guild.name
      channelNameElement.textContent = `#${channel.name}`
  
      messagesElement.innerHTML = messages.map(renderMessage).join("")
    }
  
    function formatDiscordMarkdown(text) {
      if (!text) return "";
    
      // Convert custom emoji
      text = text.replace(/<:(\w+):(\d+)>/g, ":$1:");
    
      // Convert mentions
      text = text.replace(/<@!?(\d+)>/g, (match, id) => `@${id}`);
      text = text.replace(/<@&(\d+)>/g, (match, id) => `@&${id}`);
      text = text.replace(/<#(\d+)>/g, (match, id) => `#${id}`);
    
      // Format code blocks
      text = text.replace(/```(\w+)\n([\s\S]*?)```/g, '<pre><code class="language-$1 break-words whitespace-pre-wrap">$2</code></pre>');
      text = text.replace(/```([\s\S]*?)```/g, '<pre><code class="break-words whitespace-pre-wrap">$1</code></pre>');
      text = text.replace(/`([^`]+)`/g, '<code class="break-words whitespace-pre-wrap">$1</code>');
    
      // Bold, Italic, Underline, Strikethrough
      text = text.replace(/\*\*\*([^*]+)\*\*\*/g, "<strong><em>$1</em></strong>");
      text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
      text = text.replace(/\*([^*]+)\*/g, "<em>$1</em>");
      text = text.replace(/_([^_]+)_/g, "<em>$1</em>");
      text = text.replace(/__(.*?)__/g, "<u>$1</u>");
      text = text.replace(/~~(.*?)~~/g, "<s>$1</s>");
      text = text.replace(/\|\|(.*?)\|\|/g, '<span class="spoiler">$1</span>');
    
      // Blockquotes
      text = text.replace(/>>>([\s\S]*)/g, '<blockquote class="break-words whitespace-pre-wrap">$1</blockquote>');
      text = text.replace(/^> (.+)/gm, '<blockquote class="break-words whitespace-pre-wrap">$1</blockquote>');
    
      // Headers
      text = text.replace(/^# (.*?)$/gm, "<h1>$1</h1>");
      text = text.replace(/^## (.*?)$/gm, "<h2>$1</h2>");
      text = text.replace(/^### (.*?)$/gm, "<h3>$1</h3>");
    
      // Lists
      text = text.replace(/^(?:- |\* )(.*)/gm, "<li>$1</li>");
      text = text.replace(/^(?: {2}- | {2}\* )(.*)/gm, '<li class="indent">$1</li>');
      text = text.replace(/^(?:\d+\. )(.*)/gm, '<li class="numbered">$1</li>');
    
      // Convert Discord timestamps
      text = text.replace(/<t:(\d+)(?::(\w))?>/g, (match, timestamp, format) => {
        let date = new Date(timestamp * 1000);
        let options = {};
    
        switch (format) {
          case 't': options = { hour: '2-digit', minute: '2-digit' }; break;
          case 'T': options = { hour: '2-digit', minute: '2-digit', second: '2-digit' }; break;
          case 'd': options = { day: '2-digit', month: '2-digit', year: 'numeric' }; break;
          case 'D': options = { day: '2-digit', month: 'long', year: 'numeric' }; break;
          case 'f': options = { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }; break;
          case 'F': options = { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }; break;
          case 'R': 
            let diff = Math.round((date - new Date()) / 1000);
            if (diff > 0) return `<span title="${date.toISOString()}">in ${diff} seconds</span>`;
            return `<span title="${date.toISOString()}">${-diff} seconds ago</span>`;
          default: options = { year: 'numeric', month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit' };
        }
    
        return date.toLocaleString('en-US', options);
      });
    
      // Convert URLs into clickable links
      text = text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
    
      // Line breaks
      text = text.replace(/\n/g, "<br>");
    
      return text;
    }    
  
    function renderMessage(msg) {
      const { author, content, pfp, embeds = [], stickers = [], attachments = [] } = msg
  
      const messageHeader = `
              <div class="flex items-center gap-2 mb-2">
                  <img src="${pfp}" alt="${author}'s avatar" class="w-8 h-8 rounded-full" />
                  <strong class="text-[#F5FF82]">${author}</strong>
              </div>
          `
  
      const embedHtml = embeds.map((embed) => renderEmbed(embed)).join("")
  
      const stickerHtml = stickers
        .map(
          (sticker) => `
              <div class="sticker mt-2">
                  <img src="${sticker.url}" alt="${sticker.name}" title="${sticker.name}" class="max-w-[100px]"/>
                  <p class="text-sm text-gray-400">${sticker.name}</p>
              </div>
          `,
        )
        .join("")
  
      const attachmentHtml = attachments
        .map(
          (attachment) => `
              <div class="attachment">
                  ${
                    attachment.content_type?.startsWith("image/")
                      ? `<img src="${attachment.proxy_url}" alt="${attachment.filename}" />`
                      : `<p><strong>File:</strong> <a href="${attachment.url}" target="_blank" class="text-[#F5FF82]">${attachment.filename}</a></p>`
                  }
              </div>
          `,
        )
        .join("")
  
      return `
              <div class="message">
                  ${messageHeader}
                  ${content ? `<p class="mb-2 break-words whitespace-pre-wrap">${formatDiscordMarkdown(content)}</p>` : ""}
                  ${embedHtml}
                  ${stickerHtml}
                  ${attachmentHtml}
              </div>
          `
    }
  
    function renderEmbed(embed) {
      const { title, description, url, fields = [], image, footer, color, author } = embed
  
      const authorHtml = author
        ? `
              <div class="flex items-center gap-2 mb-2">
                  ${author.icon_url ? `<img src="${author.icon_url}" class="w-6 h-6 rounded-full" />` : ""}
                  <span class="font-semibold">${author.name}</span>
              </div>
          `
        : ""
  
      const fieldsHtml = fields
        .map(
          (field) => `
              <div class="embed-field mb-2">
                  <strong>${field.name}</strong>
                  <div class="break-words whitespace-pre-wrap">${formatDiscordMarkdown(field.value)}</div>
              </div>
          `,
        )
        .join("")
  
      return `
              <div class="embed" style="${color ? `border-color: #${color.toString(16).padStart(6, "0")}` : ""}">
                  ${authorHtml}
                  ${title ? `<h4 class="font-bold mb-2">${title}</h4>` : ""}
                  ${description ? `<div class="mb-2 break-words whitespace-pre-wrap">${formatDiscordMarkdown(description)}</div>` : ""}
                  ${fieldsHtml}
                  ${image ? `<div class="embed-image mt-2"><img src="${image.url}" alt="Embed Image" /></div>` : ""}
                  ${footer ? `<p class="text-sm text-gray-400 mt-2 break-words whitespace-pre-wrap">${formatDiscordMarkdown(footer.text)}</p>` : ""}
              </div>
          `
    }
  })
  
  
  