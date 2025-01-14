document.addEventListener("DOMContentLoaded", () => {
  const loadingElement = document.getElementById("loading");
  const transcriptElement = document.getElementById("transcript");
  const ticketDetailsElement = document.getElementById("ticket-details");
  const errorElement = document.getElementById("error");

  // Extract guildId and ticketId from URL hash
  const hash = window.location.hash.substring(1); // Remove the #
  const [guildId, ticketId] = hash.split("-");

  if (!guildId || !ticketId) {
      loadingElement.style.display = "none";
      errorElement.style.display = "block";
      return;
  }

  // Example API URL
  const apiUrl = `https://api.duckybot.xyz/transcripts/${guildId}/${ticketId}`;

  // Fetch the transcript data
  fetch(apiUrl, {
      method: "GET",
  })
      .then((response) => {
          if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
      })
      .then((response) => {
          const data = response.data;
          // Hide loading
          loadingElement.style.display = "none";

          // Show transcript data
          renderTranscript(data);
      })
      .catch((error) => {
          console.error("Error fetching transcript:", error);
          loadingElement.style.display = "none";
          errorElement.style.display = "block";
      });

  function renderTranscript(data) {
      transcriptElement.style.display = "block";

      const { guildName, messages } = data;

      const ticketInfo = `
          <p><strong>Guild:</strong> ${guildName}</p>
          <h3>Messages:</h3>
          <ul>
              ${messages.map(renderMessage).join("")}
          </ul>
      `;

      ticketDetailsElement.innerHTML = ticketInfo;
  }

  function renderMessage(msg) {
      const { author, content, pfp, embeds = [], stickers = [], attachments = [] } = msg;

      // Render author details as a table
      const authorTable = `
          <table class="author-table">
              <tr>
                  <td>
                      <img src="${pfp}" alt="${author}'s avatar" class="author-pfp" />
                  </td>
                  <td>
                      <strong>${author}</strong>
                  </td>
              </tr>
          </table>
      `;

      // Render embeds
      const embedHtml = embeds.map((embed) => renderEmbed(embed)).join("");

      // Render a single sticker
      const stickerHtml =
          stickers.length > 0
              ? `
          <div class="sticker">
              <img src="${stickers[0].url}" alt="${stickers[0].name}" title="${stickers[0].name}" style="max-width: 100px;"/>
              <p>${stickers[0].name}</p>
          </div>`
              : "";

      // Render attachments
      const attachmentHtml = attachments
          .map(
              (attachment) => `
          <div class="attachment">
              <p><strong>File:</strong> <a href="${attachment.url}" target="_blank">${attachment.filename}</a></p>
              ${
                  attachment.content_type.startsWith("image/")
                      ? `<img src="${attachment.proxy_url}" alt="${attachment.filename}" style="max-width: 200px;"/>`
                      : ""
              }
          </div>`
          )
          .join("");

      return `
          <li>
              ${authorTable}
              <p>${content || ""}</p>
              ${embedHtml}
              ${stickerHtml}
              ${attachmentHtml}
          </li>
      `;
  }

  function renderEmbed(embed) {
      const { title, description, url, fields = [], image, footer } = embed;

      // Render embed fields
      const fieldsHtml = fields
          .map(
              (field) => `
          <div class="embed-field">
              <strong>${field.name}</strong>: ${field.value}
          </div>`
          )
          .join("");

      // Render embed structure
      return `
          <div class="embed">
              ${title ? `<h4><a href="${url || '#'}">${title}</a></h4>` : ""}
              ${description ? `<p>${description}</p>` : ""}
              ${fieldsHtml}
              ${
                  image
                      ? `<div class="embed-image"><img src="${image.url}" alt="Embed Image" style="max-width: 300px;"/></div>`
                      : ""
              }
              ${footer ? `<p class="embed-footer">${footer.text}</p>` : ""}
          </div>
      `;
  }
});