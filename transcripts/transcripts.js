document.addEventListener("DOMContentLoaded", () => {
  const loadingElement = document.getElementById("loading")
  const transcriptElement = document.getElementById("transcript")
  const messagesElement = document.getElementById("messages")
  const guildIconElement = document.getElementById("guild-icon")
  const guildNameElement = document.getElementById("guild-name")
  const channelNameElement = document.getElementById("channel-name")
  const errorElement = document.getElementById("error")
  const transcriptDateElement = document.getElementById("transcript-date")

  const currentDate = new Date()
  transcriptDateElement.textContent = currentDate.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  })

  const hash = window.location.hash.substring(1)
  let [guildId, ticketId] = hash.split("-")
  
  if (!guildId || !ticketId) {
    const saved = document.cookie.split('; ').find(row => row.startsWith('lastTicket='))
    if (saved) {
      const [savedGuild, savedTicket] = decodeURIComponent(saved.split('=')[1]).split("-")
      guildId = guildId || savedGuild
      ticketId = ticketId || savedTicket
    }
  }
  
  if (!guildId || !ticketId) {
    loadingElement.style.display = "none"
    errorElement.style.display = "block"
    return
  }
  
  document.cookie = `lastTicket=${encodeURIComponent(`${guildId}-${ticketId}`)}; path=/; max-age=120`
  
  const discordToken = document.cookie.split('; ').find(row => row.startsWith('discord='))?.split('=')[1]
  
  if (!discordToken || discordToken == "" || discordToken == "null" || discordToken == "undefined") {
    window.location.href = `/login?redirect=transcripts`
    return
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
      transcriptElement.style.display = "block"
      renderTranscript(data)
      
      document.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightBlock(block)
      })
      
      document.querySelectorAll('.spoiler').forEach((spoiler) => {
        spoiler.addEventListener('click', function() {
          this.classList.toggle('revealed')
        })
      })
    })
    .catch((error) => {
      console.error("Error fetching transcript:", error)
      loadingElement.style.display = "none"
      errorElement.style.display = "block"
    })

  function renderTranscript(data) {
    const { guild, channel, messages } = data

    guildIconElement.src = guild.icon || '/images/icons/Ducky.svg'
    guildNameElement.textContent = guild.name
    channelNameElement.textContent = channel.name

    let currentAuthor = null
    let currentDate = null
    let messageGroups = []
    let currentGroup = null

    messages.forEach((msg) => {
      const messageDate = new Date((msg.timestamp * 1000) || Date.now())
      const messageDay = messageDate.toDateString()
      
      if (messageDay !== currentDate) {
        messageGroups.push({
          type: 'divider',
          date: messageDate
        })
        currentDate = messageDay
      }
      
      if (msg.author !== currentAuthor) {
        currentGroup = {
          type: 'messages',
          author: msg.author,
          pfp: msg.pfp,
          bot: msg.bot,
          messages: [msg]
        }
        messageGroups.push(currentGroup)
        currentAuthor = msg.author
      } else {
        currentGroup.messages.push(msg)
      }
    })

    messagesElement.innerHTML = messageGroups.map(group => {
      if (group.type === 'divider') {
        return renderDateDivider(group.date)
      } else {
        return renderMessageGroup(group)
      }
    }).join("")
  }

  function renderDateDivider(date) {
    const formattedDate = date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
    
    return `
      <div class="system-message">
        <div class="flex items-center justify-center">
          <div class="h-px bg-[#4f545c] flex-grow mr-4"></div>
          <span>${formattedDate}</span>
          <div class="h-px bg-[#4f545c] flex-grow ml-4"></div>
        </div>
      </div>
    `
  }

  function renderMessageGroup(group) {
    const { author, pfp, bot, messages } = group
    
    const messageHeader = `
      <div class="message-header">
        <img draggable="false" src="${pfp || 'https://cdn.discordapp.com/embed/avatars/0.png'}" alt="${author}'s avatar" class="message-avatar" />
        <div class="flex items-center">
          <span class="message-author">${escapeHTML(author)}</span>
          ${bot ? '<span class="bot-tag">BOT</span>' : ''}
          <span class="message-timestamp">${formatTimestamp(messages[0].timestamp)}</span>
        </div>
      </div>
    `
    
    const messagesHTML = messages.map(msg => {
      const { content, embeds = [], stickers = [], attachments = [], timestamp } = msg
      
      let messageContent = ''
      
      if (content) {
        messageContent = `<div class="message-content">${formatDiscordMarkdown(content)}</div>`
      }
      
      const embedsHTML = embeds.map(embed => renderEmbed(embed)).join("")
      const stickersHTML = stickers.map(sticker => renderSticker(sticker)).join("")
      const attachmentsHTML = attachments.map(attachment => renderAttachment(attachment)).join("")
      
      return `
        ${messageContent}
        ${embedsHTML}
        ${stickersHTML}
        ${attachmentsHTML}
      `
    }).join("")
    
    return `
      <div class="message">
        ${messageHeader}
        ${messagesHTML}
      </div>
    `
  }

  function formatTimestamp(timestamp) {
    if (!timestamp) return 'Today at 00:00'
    
    const date = new Date(timestamp * 1000)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    const isYesterday = new Date(now - 86400000).toDateString() === date.toDateString()
    
    const time = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
    
    if (isToday) {
      return `Today at ${time}`
    } else if (isYesterday) {
      return `Yesterday at ${time}`
    } else {
      return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at ${time}`
    }
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
      const date = new Date(timestamp * 1000);
      return `<span class="timestamp" title="${date.toISOString()}">${formatDiscordTimestamp(date, format)}</span>`;
    });
  
    // Convert URLs into clickable links
    text = text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
  
    // Line breaks
    text = text.replace(/\n/g, "<br>");
  
    return text;
  }
  
  function formatDiscordTimestamp(date, format) {
    switch(format) {
      case 't': 
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
      case 'T':
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true })
      case 'd': 
        return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
      case 'D': 
        return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      case 'f': 
        return date.toLocaleDateString('en-US', { 
          month: 'long', day: 'numeric', year: 'numeric', 
          hour: 'numeric', minute: 'numeric', hour12: true 
        })
      case 'F': 
        return date.toLocaleDateString('en-US', { 
          weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', 
          hour: 'numeric', minute: 'numeric', hour12: true 
        })
      case 'R': 
        return getRelativeTime(date)
      default: 
        return date.toLocaleDateString('en-US', { 
          month: 'long', day: 'numeric', year: 'numeric', 
          hour: 'numeric', minute: 'numeric', hour12: true 
        })
    }
  }
  
  function getRelativeTime(date) {
    const now = new Date()
    const diffInSeconds = Math.floor((now - date) / 1000)
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds} second${diffInSeconds !== 1 ? 's' : ''} ago`
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60)
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`
    }
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 30) {
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`
    }
    
    const diffInMonths = Math.floor(diffInDays / 30)
    if (diffInMonths < 12) {
      return `${diffInMonths} month${diffInMonths !== 1 ? 's' : ''} ago`
    }
    
    const diffInYears = Math.floor(diffInMonths / 12)
    return `${diffInYears} year${diffInYears !== 1 ? 's' : ''} ago`
  }

  function renderEmbed(embed) {
    const { title, description, url, color, author, fields = [], image, thumbnail, footer } = embed
    
    const borderColor = color ? `#${color.toString(16).padStart(6, '0')}` : '#4f545c'
    
    const authorHtml = author
      ? `
          <div class="embed-author">
              ${author.icon_url ? `<img draggable="false" src="${author.icon_url}" class="embed-author-icon" />` : ''}
              <span class="embed-author-name">${escapeHTML(author.name)}</span>
          </div>
        `
      : ''
    
    const titleHtml = title
      ? `<div class="embed-title">${url ? `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-[#00aff4] hover:underline">${escapeHTML(title)}</a>` : escapeHTML(title)}</div>`
      : ''
    
    const descriptionHtml = description
      ? `<div class="embed-description">${formatDiscordMarkdown(description)}</div>`
      : ''
    
    const thumbnailHtml = thumbnail
      ? `<div class="embed-thumbnail"><img draggable="false" src="${thumbnail.url}" alt="Thumbnail" /></div>`
      : ''
    
    const fieldsHtml = fields.length > 0
      ? `
          <div class="embed-fields">
              ${fields.map(field => `
                  <div class="embed-field ${field.inline ? 'inline' : ''}">
                      <div class="embed-field-name">${escapeHTML(field.name)}</div>
                      <div class="embed-field-value">${formatDiscordMarkdown(field.value)}</div>
                  </div>
              `).join('')}
          </div>
        `
      : ''
    
    const imageHtml = image
      ? `<div class="embed-image"><img draggable="false" src="${image.url}" alt="Embed Image" /></div>`
      : ''
    
    const footerHtml = footer
      ? `
          <div class="embed-footer">
              ${footer.icon_url ? `<img draggable="false" src="${footer.icon_url}" class="embed-footer-icon" />` : ''}
              <span>${escapeHTML(footer.text)}</span>
          </div>
        `
      : ''
    
    return `
      <div class="embed" style="border-left-color: ${borderColor}">
          ${authorHtml}
          ${titleHtml}
          ${descriptionHtml}
          ${fieldsHtml}
          ${imageHtml}
          ${footerHtml}
      </div>
    `
  }

  function renderAttachment(attachment) {
    const { url, proxy_url, filename, content_type, size } = attachment
    
    if (content_type && content_type.startsWith('image/')) {
      return `
        <div class="attachment">
          <img draggable="false" src="${proxy_url || url}" alt="${escapeHTML(filename)}" />
        </div>
      `
    }
    
    if (content_type && (content_type.startsWith('video/mp4') || content_type.startsWith('video/webm'))) {
      return `
        <div class="attachment">
          <video controls src="${proxy_url || url}" class="max-w-full rounded-md"></video>
        </div>
      `
    }
    
    if (content_type && content_type.startsWith('audio/')) {
      return `
        <div class="attachment">
          <audio controls src="${proxy_url || url}" class="w-full"></audio>
        </div>
      `
    }
    
    const fileSize = formatFileSize(size)
    
    return `
      <div class="attachment-file">
        <div class="attachment-icon">
          <i class="fas fa-file"></i>
        </div>
        <div class="attachment-details">
          <div class="attachment-filename">${escapeHTML(filename)}</div>
          <div class="attachment-filesize">${fileSize}</div>
        </div>
        <a href="${url}" target="_blank" rel="noopener noreferrer" class="attachment-download">
          <i class="fas fa-download"></i>
        </a>
      </div>
    `
  }

  function renderSticker(sticker) {
    const { url, name } = sticker
    
    return `
      <div class="sticker">
        <img draggable="false" src="${url}" alt="${escapeHTML(name)}" title="${escapeHTML(name)}" />
        <div class="sticker-name">${escapeHTML(name)}</div>
      </div>
    `
  }

  function formatFileSize(bytes) {
    if (!bytes) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  function escapeHTML(text) {
    if (!text) return ''
    
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }
    
    return text.replace(/[&<>"']/g, m => map[m])
  }
})