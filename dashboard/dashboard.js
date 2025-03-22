document.addEventListener("DOMContentLoaded", async () => {
    const loadingOverlay = document.getElementById("loadingOverlay")
    const serverGrid = document.getElementById("serverGrid")
    const serverSelectionView = document.getElementById("serverSelectionView")
    const moderationPanelView = document.getElementById("moderationPanelView")
    const backToServersBtn = document.getElementById("backToServersBtn")
    const punishmentsTabBtn = document.getElementById("punishmentsTabBtn")
    const shiftsTabBtn = document.getElementById("shiftsTabBtn")
    const punishmentsTab = document.getElementById("punishmentsTab")
    const shiftsTab = document.getElementById("shiftsTab")
    const punishmentForm = document.getElementById("punishmentForm")
    const punishmentType = document.getElementById("punishmentType")
    const durationContainer = document.getElementById("durationContainer")
    const punishmentHistory = document.getElementById("punishmentHistory")
    const activeShifts = document.getElementById("activeShifts")
    const recentShifts = document.getElementById("recentShifts")
    const toast = document.getElementById("toast")
    const toastMessage = document.getElementById("toastMessage")
    const menuBtn = document.getElementById("menuBtn")
    const closeMenuBtn = document.getElementById("closeMenuBtn")
    const mobileMenu = document.getElementById("mobileMenu")
    const confirmationModal = document.getElementById("confirmationModal")
    const confirmDeleteBtn = document.getElementById("confirmDeleteBtn")
    const cancelDeleteBtn = document.getElementById("cancelDeleteBtn")
    const confirmationMessage = document.getElementById("confirmationMessage")
    const startShiftBtn = document.getElementById("startShiftBtn")
    const pauseShiftBtn = document.getElementById("pauseShiftBtn")
    const endShiftBtn = document.getElementById("endShiftBtn")
    const shiftType = document.getElementById("shiftType")
    const shiftStatusIndicator = document.getElementById("shiftStatusIndicator")
    const shiftStatusText = document.getElementById("shiftStatusText")
    const shiftTimer = document.getElementById("shiftTimer")
    const recentUserShifts = document.getElementById("recentUserShifts")
    const filteredPunishments = document.getElementById("filteredPunishments")
    const filteredPunishmentsList = document.getElementById("filteredPunishmentsList")
    const clearFilter = document.getElementById("clearFilter")
  
    const punishmentTypeSelected = document.getElementById("punishmentTypeSelected")
    const punishmentTypeOptions = document.getElementById("punishmentTypeOptions")
    const durationUnitSelected = document.getElementById("durationUnitSelected")
    const durationUnitOptions = document.getElementById("durationUnitOptions")
    const durationUnit = document.getElementById("durationUnit")
    const shiftTypeSelected = document.getElementById("shiftTypeSelected")
    const shiftTypeOptions = document.getElementById("shiftTypeOptions")
  
    let selectedServerId = null
    let selectedServerConfig = null
    const userCache = new Map()
    const avatarCache = new Map()
    let discordToken = null
    let discordUser = null
    let lastPunishmentTime = 0
    const PUNISHMENT_COOLDOWN = 5000
  
    let shiftStatus = "inactive"
    let shiftStartTime = 0
    let shiftElapsedTime = 0
    let shiftTimerInterval = null
    let currentPunishmentToDelete = null
    let currentUserShift = null
    let activeShiftsInterval = null
  
    function initDropdowns() {
      punishmentTypeSelected.addEventListener("click", () => {
        punishmentTypeSelected.classList.toggle("active")
        punishmentTypeOptions.classList.toggle("active")
      })
  
      durationUnitSelected.addEventListener("click", () => {
        durationUnitSelected.classList.toggle("active")
        durationUnitOptions.classList.toggle("active")
      })
  
      document.querySelectorAll("#durationUnitOptions .dropdown-option").forEach((option) => {
        option.addEventListener("click", () => {
          const value = option.dataset.value
          durationUnit.value = value
          durationUnitSelected.querySelector("span").textContent = option.textContent
  
          document.querySelectorAll("#durationUnitOptions .dropdown-option").forEach((opt) => {
            opt.classList.remove("selected")
          })
          option.classList.add("selected")
  
          durationUnitSelected.classList.remove("active")
          durationUnitOptions.classList.remove("active")
        })
      })
  
      shiftTypeSelected.addEventListener("click", () => {
        if (shiftStatus === "inactive") {
          shiftTypeSelected.classList.toggle("active")
          shiftTypeOptions.classList.toggle("active")
        }
      })
  
      document.addEventListener("click", (e) => {
        if (!e.target.closest(".custom-dropdown")) {
          document.querySelectorAll(".dropdown-options").forEach((dropdown) => {
            dropdown.classList.remove("active")
          })
          document.querySelectorAll(".dropdown-selected").forEach((selected) => {
            selected.classList.remove("active")
          })
        }
      })
    }
  
    function getDiscordToken() {
      return document.cookie
        .split("; ")
        .find((row) => row.startsWith("discord="))
        ?.split("=")[1]
    }
  
    function formatDuration(seconds) {
      if (seconds < 60) return `${seconds} second${seconds !== 1 ? "s" : ""}`
  
      const months = Math.floor(seconds / (30 * 24 * 3600))
      const remainingAfterMonths = seconds % (30 * 24 * 3600)
      const weeks = Math.floor(remainingAfterMonths / (7 * 24 * 3600))
      const remainingAfterWeeks = remainingAfterMonths % (7 * 24 * 3600)
      const hours = Math.floor(remainingAfterWeeks / 3600)
      const remainingAfterHours = remainingAfterWeeks % 3600
      const minutes = Math.floor(remainingAfterHours / 60)
      const secs = remainingAfterHours % 60
  
      let durationString = ""
      if (months > 0) durationString += `${months} month${months !== 1 ? "s" : ""}`
      if (weeks > 0) durationString += `${durationString ? ", " : ""}${weeks} week${weeks !== 1 ? "s" : ""}`
      if (hours > 0) durationString += `${durationString ? ", " : ""}${hours} hour${hours !== 1 ? "s" : ""}`
      if (minutes > 0) durationString += `${durationString ? ", " : ""}${minutes} minute${minutes !== 1 ? "s" : ""}`
      if (secs > 0 || (months === 0 && weeks === 0 && hours === 0 && minutes === 0)) {
        durationString += `${durationString ? ", " : ""}${secs} second${secs !== 1 ? "s" : ""}`
      }
  
      return durationString
    }
  
    function formatShiftTime(seconds) {
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      const secs = seconds % 60
  
      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
  
    function formatDate(timestamp) {
      const date = new Date(timestamp * 1000)
      return date.toLocaleString()
    }
  
    function showToast(message, type = "success") {
      toastMessage.textContent = message
      toast.className = `toast ${type}`
      toast.classList.add("show")
  
      setTimeout(() => {
        toast.classList.remove("show")
      }, 3000)
    }
  
    async function fetchUserData(userId, forceRefresh = false) {
      if (!forceRefresh && userCache.has(userId)) {
        return userCache.get(userId)
      }
  
      try {
        const response = await fetch(`https://api.duckybot.xyz/user/${userId}`)
  
        if (!response.ok) {
          return { id: userId, name: userId, username: userId }
        }
  
        const data = await response.json()
  
        if (data.code === 200 && data.data) {
          userCache.set(userId, data.data)
          return data.data
        }
  
        return { id: userId, name: userId, username: userId }
      } catch (error) {
        console.error("Error fetching user data:", error)
        return { id: userId, name: userId, username: userId }
      }
    }
  
    menuBtn.addEventListener("click", () => {
      mobileMenu.classList.add("active")
      document.body.style.overflow = "hidden"
    })
  
    closeMenuBtn.addEventListener("click", () => {
      mobileMenu.classList.remove("active")
      document.body.style.overflow = ""
    })
  
    function setupPunishmentTypeDropdown(types) {
      punishmentTypeOptions.innerHTML = ""
  
      types.forEach((type, index) => {
        const option = document.createElement("div")
        option.className = "dropdown-option"
        option.dataset.value = type.toLowerCase()
        option.textContent = type.charAt(0).toUpperCase() + type.slice(1)
  
        option.addEventListener("click", () => {
          punishmentType.value = type.toLowerCase()
          punishmentTypeSelected.querySelector("span").textContent = option.textContent
  
          document.querySelectorAll("#punishmentTypeOptions .dropdown-option").forEach((opt) => {
            opt.classList.remove("selected")
          })
          option.classList.add("selected")
  
          punishmentTypeSelected.classList.remove("active")
          punishmentTypeOptions.classList.remove("active")
  
          durationContainer.classList.toggle("hidden", punishmentType.value !== "tempban")
        })
  
        punishmentTypeOptions.appendChild(option)
      })
    }
  
    function setupShiftTypeDropdown(types) {
      shiftTypeOptions.innerHTML = ""
  
      if (!types || types.length === 0) {
        types = [{ name: "quacking" }]
      }
  
      types.forEach((type, index) => {
        const option = document.createElement("div")
        option.className = "dropdown-option"
        option.dataset.value = type.name.toLowerCase()
        option.textContent = type.name.charAt(0).toUpperCase() + type.name.slice(1)
  
        if (index === 0) {
          option.classList.add("selected")
          shiftTypeSelected.querySelector("span").textContent = option.textContent
          shiftType.value = type.name.toLowerCase()
        }
  
        option.addEventListener("click", () => {
          shiftType.value = type.name.toLowerCase()
          shiftTypeSelected.querySelector("span").textContent = option.textContent
  
          document.querySelectorAll("#shiftTypeOptions .dropdown-option").forEach((opt) => {
            opt.classList.remove("selected")
          })
          option.classList.add("selected")
  
          shiftTypeSelected.classList.remove("active")
          shiftTypeOptions.classList.remove("active")
        })
  
        shiftTypeOptions.appendChild(option)
      })
    }
  
    backToServersBtn.addEventListener("click", () => {
      moderationPanelView.classList.add("hidden")
      serverSelectionView.classList.remove("hidden")
      localStorage.removeItem("selectedServerId")
    })
  
    punishmentsTabBtn.addEventListener("click", () => {
      punishmentsTabBtn.classList.add("active")
      shiftsTabBtn.classList.remove("active")
      punishmentsTab.classList.remove("hidden")
      shiftsTab.classList.add("hidden")
    })
  
    shiftsTabBtn.addEventListener("click", () => {
      shiftsTabBtn.classList.add("active")
      punishmentsTabBtn.classList.remove("active")
      shiftsTab.classList.remove("hidden")
      punishmentsTab.classList.add("hidden")
  
      if (activeShifts.innerHTML.includes("Loading")) {
        loadShifts(selectedServerId)
      }
    })
  
    punishmentForm.addEventListener("submit", (e) => {
      e.preventDefault()
      issuePunishment()
    })
  
    startShiftBtn.addEventListener("click", startShift)
    pauseShiftBtn.addEventListener("click", pauseShift)
    endShiftBtn.addEventListener("click", endShift)
  
    confirmDeleteBtn.addEventListener("click", confirmDeletePunishment)
    cancelDeleteBtn.addEventListener("click", () => {
      confirmationModal.classList.remove("active")
      currentPunishmentToDelete = null
    })
  
    function selectServer(serverId, serverName, serverIcon, serverConfig) {
      selectedServerId = serverId
      selectedServerConfig = serverConfig
  
      document.getElementById("serverName").textContent = serverName
      document.getElementById("serverIcon").src = serverIcon || "https://duckybot.xyz/images/Ducky.svg"
  
      serverSelectionView.classList.add("hidden")
      moderationPanelView.classList.remove("hidden")
  
      localStorage.setItem(
        "selectedServerId",
        JSON.stringify({
          id: serverId,
          name: serverName,
          icon: serverIcon,
          config: serverConfig,
        }),
      )
  
      let punishmentTypes = []
      if (serverConfig && serverConfig.punishmenttypes && serverConfig.punishmenttypes.length > 0) {
        punishmentTypes = serverConfig.punishmenttypes
      }
      setupPunishmentTypeDropdown(punishmentTypes)
  
      let shiftTypes = []
      if (serverConfig && serverConfig.shifttypes && serverConfig.shifttypes.length > 0) {
        shiftTypes = serverConfig.shifttypes
      }
      setupShiftTypeDropdown(shiftTypes)
  
      loadPunishments(serverId)
      checkActiveShift(serverId)
    }
  
    async function loadPunishments(serverId) {
      punishmentHistory.innerHTML = `
              <div class="text-center py-4">
                  <div class="spinner mx-auto mb-2"></div>
                  <p class="text-gray-400">Loading punishment history...</p>
              </div>
          `
  
      discordToken = getDiscordToken()
  
      if (!discordToken) {
        punishmentHistory.innerHTML =
          '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>Authentication error. Please log in again.</p></div>'
        return
      }
  
      try {
        const response = await fetch(`https://api.duckybot.xyz/guilds/${serverId}/punishments`, {
          headers: { "Discord-Code": discordToken },
        })
  
        if (!response.ok) {
          throw new Error("Failed to fetch punishments")
        }
  
        const { data: punishments } = await response.json()
  
        if (!punishments || punishments.length === 0) {
          punishmentHistory.innerHTML =
            '<div class="empty-state"><i class="fas fa-ban"></i><p>No punishment history found.</p></div>'
          return
        }
  
        punishmentHistory.innerHTML = ""
  
        punishments.sort((a, b) => b.timestamp - a.timestamp)
  
        const fragment = document.createDocumentFragment()
  
        for (const punishment of punishments) {
          const item = document.createElement("div")
          item.className =
            "punishment-item p-3 pl-4 bg-black/30 rounded-md border-l-2 border-[#F5FF82] hover:bg-black/40 transition-colors"
          item.dataset.punishmentId = punishment.punishmentid || punishment.id
          item.dataset.username = (punishment.robloxUser.name || "").toLowerCase()
          item.dataset.displayname = (punishment.robloxUser.displayName || "").toLowerCase()
  
          const typeColors = {
            warn: "text-yellow-400",
            warning: "text-yellow-400",
            kick: "text-orange-400",
            ban: "text-red-500",
            tempban: "text-red-400",
          }
  
          const typeColor = typeColors[punishment.type.toLowerCase()] || "text-gray-400"
  
          const moderatorData = await fetchUserData(punishment.moderator)
          const moderatorName = moderatorData.username || moderatorData.name || punishment.moderator
  
          let avatarUrl = punishment.robloxUser.pfpURL || punishment.robloxUser.avatar
          if (!avatarUrl && punishment.robloxUser.id) {
            const robloxData = await fetchUserData(punishment.robloxUser.id)
            avatarUrl = robloxData.avatar
          }
  
          item.innerHTML = `
                      <div class="flex flex-col md:flex-row justify-between items-start gap-2">
                          <div class="flex items-start gap-3">
                              <div class="avatar-circle hidden sm:flex">
                                  ${avatarUrl ? `<img src="${avatarUrl}" alt="${punishment.robloxUser.name}">` : punishment.robloxUser.name.charAt(0)}
                              </div>
                              <div>
                                  <h4 class="font-medium"><span class="roblox-displayname">${punishment.robloxUser.displayName || punishment.robloxUser.name}</span> <span class="text-sm text-gray-400">(<span class="roblox-username">${punishment.robloxUser.name}</span>)</span></h4>
                                  <p class="text-sm ${typeColor} mt-1">${punishment.type.toUpperCase()}</p>
                                  <p class="text-sm text-gray-400 mt-1">${punishment.reason}</p>
                              </div>
                          </div>
                          <div class="text-right text-xs">
                              <p class="text-gray-500">${formatDate(punishment.timestamp)}</p>
                              <p class="text-gray-400 mt-1">By: ${moderatorName}</p>
                          </div>
                      </div>
                      <div class="delete-btn" title="Delete punishment">
                          <i class="fas fa-trash-alt"></i>
                      </div>
                  `
  
          const deleteBtn = item.querySelector(".delete-btn")
          deleteBtn.addEventListener("click", (e) => {
            e.stopPropagation()
            showDeleteConfirmation(punishment.punishmentid || punishment.id, punishment.robloxUser.name, punishment.type)
          })
  
          fragment.appendChild(item)
        }
  
        punishmentHistory.appendChild(fragment)
  
        if (clearFilter) {
          clearFilter.addEventListener("click", () => {
            document.getElementById("robloxUsername").value = ""
            filteredPunishments.classList.add("hidden")
            filterPunishmentHistory()
          })
        }
      } catch (error) {
        console.error("Error loading punishments:", error)
        punishmentHistory.innerHTML =
          '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>Failed to load punishment history. Please try again.</p></div>'
      }
    }
  
    function filterPunishmentHistory() {
      const username = document.getElementById("robloxUsername").value.trim().toLowerCase()
  
      if (!username) {
        filteredPunishments.classList.add("hidden")
        return
      }
  
      filteredPunishments.classList.remove("hidden")
      filteredPunishmentsList.innerHTML = ""
  
      const matchingPunishments = []
      document.querySelectorAll("#punishmentHistory .punishment-item").forEach((item) => {
        const itemUsername = item.dataset.username || ""
        const itemDisplayName = item.dataset.displayname || ""
  
        if (itemUsername.includes(username) || itemDisplayName.includes(username)) {
          matchingPunishments.push(item.cloneNode(true))
        }
      })
  
      if (matchingPunishments.length === 0) {
        filteredPunishmentsList.innerHTML =
          '<div class="empty-state"><i class="fas fa-search"></i><p>No matching punishments found.</p></div>'
      } else {
        matchingPunishments.forEach((item) => {
          const deleteBtn = item.querySelector(".delete-btn")
          const punishmentId = item.dataset.punishmentId
          const username = item.querySelector(".roblox-username").textContent
          const type = item.querySelector("p").textContent
  
          deleteBtn.addEventListener("click", (e) => {
            e.stopPropagation()
            showDeleteConfirmation(punishmentId, username, type)
          })
  
          filteredPunishmentsList.appendChild(item)
        })
      }
    }
  
    const robloxUsername = document.getElementById("robloxUsername")
    if (robloxUsername) {
      robloxUsername.addEventListener("input", filterPunishmentHistory)
    }
  
    function showDeleteConfirmation(punishmentId, username, type) {
      currentPunishmentToDelete = punishmentId
      confirmationMessage.textContent = `Are you sure you want to delete the ${type.toUpperCase()} punishment for ${username}?`
      confirmationModal.classList.add("active")
    }
  
    async function confirmDeletePunishment() {
      if (!currentPunishmentToDelete || !selectedServerId || !discordToken) {
        showToast("Error: Missing information for deletion", "error")
        confirmationModal.classList.remove("active")
        return
      }
  
      try {
        const response = await fetch(
          `https://api.duckybot.xyz/guilds/${selectedServerId}/punishments/${currentPunishmentToDelete}`,
          {
            method: "DELETE",
            headers: {
              "Discord-Code": discordToken,
            },
          },
        )
  
        if (!response.ok) {
          throw new Error("Failed to delete punishment")
        }
  
        showToast("Punishment deleted successfully")
  
        const punishmentElement = document.querySelector(
          `.punishment-item[data-punishment-id="${currentPunishmentToDelete}"]`,
        )
        if (punishmentElement) {
          punishmentElement.style.height = punishmentElement.offsetHeight + "px"
          punishmentElement.style.overflow = "hidden"
  
          setTimeout(() => {
            punishmentElement.style.height = "0"
            punishmentElement.style.padding = "0"
            punishmentElement.style.margin = "0"
            punishmentElement.style.opacity = "0"
  
            setTimeout(() => {
              punishmentElement.remove()
  
              if (punishmentHistory.children.length === 0) {
                punishmentHistory.innerHTML =
                  '<div class="empty-state"><i class="fas fa-ban"></i><p>No punishment history found.</p></div>'
              }
            }, 300)
          }, 10)
        }
  
        const filteredElement = document.querySelector(
          `#filteredPunishmentsList .punishment-item[data-punishment-id="${currentPunishmentToDelete}"]`,
        )
        if (filteredElement) {
          filteredElement.remove()
  
          if (filteredPunishmentsList.children.length === 0) {
            filteredPunishmentsList.innerHTML =
              '<div class="empty-state"><i class="fas fa-search"></i><p>No matching punishments found.</p></div>'
          }
        }
      } catch (error) {
        console.error("Error deleting punishment:", error)
        showToast("Failed to delete punishment: " + error.message, "error")
      } finally {
        confirmationModal.classList.remove("active")
        currentPunishmentToDelete = null
      }
    }
  
    async function loadShifts(serverId) {
      activeShifts.innerHTML = `
              <div class="text-center py-4 col-span-full">
                  <div class="spinner mx-auto mb-2"></div>
                  <p class="text-gray-400">Loading active shifts...</p>
              </div>
          `
  
      recentShifts.innerHTML = `
              <div class="text-center py-4">
                  <div class="spinner mx-auto mb-2"></div>
                  <p class="text-gray-400">Loading recent shifts...</p>
              </div>
          `
  
      discordToken = getDiscordToken()
  
      if (!discordToken) {
        activeShifts.innerHTML =
          '<div class="empty-state col-span-full"><i class="fas fa-exclamation-triangle"></i><p>Authentication error. Please log in again.</p></div>'
        recentShifts.innerHTML =
          '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>Authentication error. Please log in again.</p></div>'
        return
      }
  
      try {
        const response = await fetch(`https://api.duckybot.xyz/guilds/${serverId}/shifts`, {
          headers: { "Discord-Code": discordToken },
        })
  
        if (!response.ok) {
          throw new Error("Failed to fetch shifts")
        }
  
        const { data } = await response.json()
  
        if (!data.activeshifts || data.activeshifts.length === 0) {
          activeShifts.innerHTML =
            '<div class="empty-state col-span-full"><i class="fas fa-user-clock"></i><p>No active shifts found.</p></div>'
        } else {
          activeShifts.innerHTML = ""
  
          const fragment = document.createDocumentFragment()
  
          for (const shift of data.activeshifts) {
            const duration = Math.floor(Date.now() / 1000 - shift.started)
            const userData = await fetchUserData(shift.user)
  
            const card = document.createElement("div")
            card.className = "shift-card"
  
            const avatarUrl = userData.avatar
  
            card.innerHTML = `
                          <div class="avatar-circle">
                              ${avatarUrl ? `<img src="${avatarUrl}" alt="${userData.username || userData.name || shift.user}">` : (userData.username || userData.name || shift.user).charAt(0)}
                          </div>
                          <div class="flex-1">
                              <div class="flex justify-between items-start">
                                  <div>
                                      <h4 class="font-medium">${userData.username || userData.name || shift.user}</h4>
                                      <p class="text-sm text-[#F5FF82] mt-1">Active for <span class="active-duration">${formatDuration(duration)}</span></p>
                                      <p class="text-xs text-gray-400 mt-1">Type: ${shift.type || "Default"}</p>
                                  </div>
                                  <div class="text-right">
                                      <p class="text-xs text-gray-500">Started: <span data-started-time="${shift.started}">${formatDate(shift.started)}</span></p>
                                      <p class="text-xs text-gray-400 mt-1">Punishments: ${shift.punishments}</p>
                                  </div>
                              </div>
                          </div>
                      `
  
            fragment.appendChild(card)
          }
  
          activeShifts.appendChild(fragment)
  
          if (activeShiftsInterval) {
            clearInterval(activeShiftsInterval)
          }
  
          activeShiftsInterval = setInterval(updateActiveShifts, 10000)
        }
  
        if (!data.shifts || data.shifts.length === 0) {
          recentShifts.innerHTML =
            '<div class="empty-state"><i class="fas fa-history"></i><p>No recent shifts found.</p></div>'
        } else {
          recentShifts.innerHTML = ""
  
          const fragment = document.createDocumentFragment()
  
          const sortedShifts = data.shifts.sort((a, b) => b.ended - a.ended).slice(0, 5)
  
          for (const shift of sortedShifts) {
            const userData = await fetchUserData(shift.user)
  
            const item = document.createElement("div")
            item.className = "shift-card"
  
            const avatarUrl = userData.avatar
            const actualDuration = shift.elapsed > 0 ? shift.elapsed * 60 : 0
  
            item.innerHTML = `
                          <div class="avatar-circle">
                              ${avatarUrl ? `<img src="${avatarUrl}" alt="${userData.username || userData.name || shift.user}">` : (userData.username || userData.name || shift.user).charAt(0)}
                          </div>
                          <div class="flex-1">
                              <div class="flex justify-between items-start">
                                  <div>
                                      <h4 class="font-medium">${userData.username || userData.name || shift.user}</h4>
                                      <p class="text-sm text-gray-400 mt-1">Duration: ${formatDuration(actualDuration)}</p>
                                      <p class="text-xs text-gray-400 mt-1">Type: ${shift.type || "Default"}</p>
                                  </div>
                                  <div class="text-right">
                                      <p class="text-xs text-gray-500">Ended: ${formatDate(shift.ended)}</p>
                                      <p class="text-xs text-gray-400 mt-1">Punishments: ${shift.punishments}</p>
                                  </div>
                              </div>
                          </div>
                      `
  
            fragment.appendChild(item)
          }
  
          recentShifts.appendChild(fragment)
        }
  
        if (discordUser) {
          const userId = discordUser.id
          const userActiveShift = data.activeshifts?.find((shift) => shift.user === userId)
  
          if (userActiveShift) {
            currentUserShift = userActiveShift
            shiftStatus = userActiveShift.paused ? "paused" : "active"
            shiftStartTime = userActiveShift.started
            shiftElapsedTime = userActiveShift.elapsed || 0
  
            updateShiftUI()
  
            if (shiftStatus === "active") {
              startShiftTimer()
            }
  
            if (userActiveShift.type && shiftType) {
              shiftType.value = userActiveShift.type
              shiftTypeSelected.querySelector("span").textContent =
                userActiveShift.type.charAt(0).toUpperCase() + userActiveShift.type.slice(1)
  
              const option = document.querySelector(
                `#shiftTypeOptions .dropdown-option[data-value="${userActiveShift.type.toLowerCase()}"]`,
              )
              if (option) {
                document.querySelectorAll("#shiftTypeOptions .dropdown-option").forEach((opt) => {
                  opt.classList.remove("selected")
                })
                option.classList.add("selected")
              }
            }
          }
        }
  
        loadUserRecentShifts(serverId, data)
      } catch (error) {
        console.error("Error loading shifts:", error)
        activeShifts.innerHTML =
          '<div class="empty-state col-span-full"><i class="fas fa-exclamation-triangle"></i><p>Failed to load active shifts. Please try again.</p></div>'
        recentShifts.innerHTML =
          '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>Failed to load recent shifts. Please try again.</p></div>'
      }
    }
  
    async function loadUserRecentShifts(serverId, shiftData) {
      if (!discordToken || !discordUser) {
        recentUserShifts.innerHTML =
          '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>Authentication error. Please log in again.</p></div>'
        return
      }
  
      try {
        const userId = discordUser.id
  
        if (!shiftData || !shiftData.shifts || shiftData.shifts.length === 0) {
          recentUserShifts.innerHTML =
            '<div class="empty-state"><i class="fas fa-history"></i><p>No shift history found.</p></div>'
          return
        }
  
        const userShifts = shiftData.shifts.filter((shift) => shift.user === userId)
  
        if (userShifts.length === 0) {
          recentUserShifts.innerHTML =
            '<div class="empty-state"><i class="fas fa-history"></i><p>No shift history found.</p></div>'
          return
        }
  
        recentUserShifts.innerHTML = ""
  
        const fragment = document.createDocumentFragment()
  
        userShifts.sort((a, b) => b.ended - a.ended)
  
        const recentUserShiftsList = userShifts.slice(0, 3)
  
        for (const shift of recentUserShiftsList) {
          const item = document.createElement("div")
          item.className = "p-3 bg-black/20 rounded-lg flex justify-between items-center"
  
          const actualDuration = shift.elapsed > 0 ? shift.elapsed * 60 : 0
  
          item.innerHTML = `
                      <div>
                          <div class="flex items-center gap-2">
                              <span class="px-2 py-1 bg-[#F5FF82]/10 text-[#F5FF82] rounded-md text-xs font-medium">${shift.type || "default"}</span>
                              <span class="text-sm text-gray-400">${shift.breaks || 0} breaks</span>
                          </div>
                      </div>
                      <div class="text-right">
                          <div class="text-sm font-semibold">${formatDuration(actualDuration)}</div>
                      </div>
                  `
  
          fragment.appendChild(item)
        }
  
        recentUserShifts.appendChild(fragment)
      } catch (error) {
        console.error("Error loading user recent shifts:", error)
        recentUserShifts.innerHTML =
          '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>Failed to load your shift history.</p></div>'
      }
    }
  
    async function issuePunishment() {
      const now = Date.now()
      if (now - lastPunishmentTime < PUNISHMENT_COOLDOWN) {
        showToast("Please wait 5 seconds between punishments", "error")
        return
      }
  
      discordToken = getDiscordToken()
      if (!discordToken) {
        showToast("Authentication error. Please log in again.", "error")
        return
      }
  
      const robloxUsername = document.getElementById("robloxUsername").value
      const type = document.getElementById("punishmentType").value
      const reason = document.getElementById("reason").value
  
      if (!type) {
        showToast("Please select a punishment type", "error")
        return
      }
  
      let expires = null
      if (type === "tempban") {
        const durationValue = document.getElementById("durationValue").value
        const durationUnit = document.getElementById("durationUnit").value
  
        if (!durationValue || durationValue <= 0) {
          showToast("Please enter a valid duration", "error")
          return
        }
  
        const multipliers = {
          minutes: 60,
          hours: 3600,
          days: 86400,
          weeks: 604800,
        }
  
        const duration = durationValue * multipliers[durationUnit]
        expires = Math.floor(Date.now() / 1000) + duration
      }
  
      const submitBtn = document.getElementById("submitBtn")
      const originalBtnText = submitBtn.innerHTML
      submitBtn.disabled = true
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Processing...'
  
      try {
        const response = await fetch(`https://api.duckybot.xyz/guilds/${selectedServerId}/punishments`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Discord-Code": discordToken,
          },
          body: JSON.stringify({
            username: robloxUsername,
            type,
            reason,
            expires,
          }),
        })
  
        const data = await response.json()
  
        if (!response.ok) {
          throw new Error(data.message || "Failed to issue punishment")
        }
  
        punishmentForm.reset()
        durationContainer.classList.add("hidden")
        punishmentTypeSelected.querySelector("span").textContent = "Select type..."
        document.querySelectorAll("#punishmentTypeOptions .dropdown-option").forEach((opt) => {
          opt.classList.remove("selected")
        })
  
        showToast(`Successfully issued ${type} to ${robloxUsername}`)
        lastPunishmentTime = now
  
        loadPunishments(selectedServerId)
      } catch (error) {
        console.error("Error issuing punishment:", error)
        showToast(error.message || "Failed to issue punishment. Please try again.", "error")
      } finally {
        submitBtn.disabled = false
        submitBtn.innerHTML = originalBtnText
      }
    }
  
    async function checkActiveShift(serverId) {
      discordToken = getDiscordToken()
      if (!discordToken || !discordUser) return
  
      try {
        const response = await fetch(`https://api.duckybot.xyz/guilds/${serverId}/shifts`, {
          headers: { "Discord-Code": discordToken },
        })
  
        if (!response.ok) {
          throw new Error("Failed to check active shift")
        }
  
        const { data } = await response.json()
  
        const userId = discordUser.id
        let userActiveShift = null
  
        if (data.activeshifts && data.activeshifts.length > 0) {
          userActiveShift = data.activeshifts.find((shift) => shift.user === userId)
        }
  
        if (userActiveShift) {
          currentUserShift = userActiveShift
          shiftStatus = userActiveShift.paused ? "paused" : "active"
          shiftStartTime = userActiveShift.started
          shiftElapsedTime = userActiveShift.elapsed || 0
  
          updateShiftUI()
  
          if (shiftStatus === "active") {
            startShiftTimer()
          }
  
          if (userActiveShift.type && shiftType) {
            shiftType.value = userActiveShift.type
            shiftTypeSelected.querySelector("span").textContent =
              userActiveShift.type.charAt(0).toUpperCase() + userActiveShift.type.slice(1)
  
            const option = document.querySelector(
              `#shiftTypeOptions .dropdown-option[data-value="${userActiveShift.type.toLowerCase()}"]`,
            )
            if (option) {
              document.querySelectorAll("#shiftTypeOptions .dropdown-option").forEach((opt) => {
                opt.classList.remove("selected")
              })
              option.classList.add("selected")
            }
          }
        } else {
          shiftStatus = "inactive"
          updateShiftUI()
        }
      } catch (error) {
        console.error("Error checking active shift:", error)
        showToast("Failed to check active shift status", "error")
      }
    }
  
    function updateShiftUI() {
      if (shiftStatus === "paused") {
        startShiftBtn.disabled = false
        pauseShiftBtn.disabled = true
        endShiftBtn.disabled = false
  
        pauseShiftBtn.classList.add("resume")
        pauseShiftBtn.innerHTML = '<i class="fas fa-play"></i><span>Resume</span>'
      } else if (shiftStatus === "active") {
        startShiftBtn.disabled = true
        pauseShiftBtn.disabled = false
        endShiftBtn.disabled = false
  
        pauseShiftBtn.classList.remove("resume")
        pauseShiftBtn.innerHTML = '<i class="fas fa-pause"></i><span>Pause</span>'
      } else {
        startShiftBtn.disabled = false
        pauseShiftBtn.disabled = true
        endShiftBtn.disabled = true
      }
  
      if (shiftStatus !== "inactive") {
        shiftTypeSelected.classList.add("disabled")
      } else {
        shiftTypeSelected.classList.remove("disabled")
      }
  
      shiftStatusIndicator.className = `shift-status ${shiftStatus}`
      const pulse = shiftStatusIndicator.querySelector(".pulse")
      if (pulse) {
        pulse.className = `pulse ${shiftStatus}`
      }
  
      if (shiftStatus === "active") {
        shiftStatusText.textContent = "On Duty"
      } else if (shiftStatus === "paused") {
        shiftStatusText.textContent = "Paused"
      } else {
        shiftStatusText.textContent = "Off Duty"
      }
  
      if (shiftStatus === "inactive") {
        shiftTimer.textContent = "00:00:00"
      }
    }
  
    function startShiftTimer() {
      if (shiftTimerInterval) {
        clearInterval(shiftTimerInterval)
      }
  
      shiftTimerInterval = setInterval(() => {
        if (shiftStatus === "active") {
          const now = Math.floor(Date.now() / 1000)
          const elapsed = now - shiftStartTime + shiftElapsedTime
          shiftTimer.textContent = formatShiftTime(elapsed)
        }
      }, 1000)
    }
  
    async function startShift() {
      discordToken = getDiscordToken()
      if (!discordToken || !selectedServerId) {
        showToast("Authentication error. Please log in again.", "error")
        return
      }
  
      const type = shiftType.value
  
      try {
        startShiftBtn.disabled = true
        startShiftBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'
  
        if (shiftStatus === "paused" && currentUserShift) {
          const response = await fetch(`https://api.duckybot.xyz/guilds/${selectedServerId}/shifts/pause`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Discord-Code": discordToken,
            },
            body: JSON.stringify({ type: currentUserShift.type }),
          })
  
          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || "Failed to resume shift")
          }
  
          shiftStatus = "active"
          startShiftTimer()
  
          showToast("Shift resumed successfully")
        } else {
          const response = await fetch(`https://api.duckybot.xyz/guilds/${selectedServerId}/shifts/start`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Discord-Code": discordToken,
            },
            body: JSON.stringify({ type }),
          })
  
          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || "Failed to start shift")
          }
  
          shiftStatus = "active"
          shiftStartTime = Math.floor(Date.now() / 1000)
          shiftElapsedTime = 0
  
          startShiftTimer()
  
          showToast("Shift started successfully")
        }
  
        updateShiftUI()
        loadShifts(selectedServerId)
      } catch (error) {
        console.error("Error starting shift:", error)
        showToast("Failed to start shift: " + error.message, "error")
      } finally {
        startShiftBtn.disabled = false
        startShiftBtn.innerHTML = '<i class="fas fa-play"></i><span>Start</span>'
      }
    }
  
    async function pauseShift() {
      discordToken = getDiscordToken()
      if (!discordToken || !selectedServerId) {
        showToast("Authentication error. Please log in again.", "error")
        return
      }
  
      try {
        pauseShiftBtn.disabled = true
        pauseShiftBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'
  
        const response = await fetch(`https://api.duckybot.xyz/guilds/${selectedServerId}/shifts/pause`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Discord-Code": discordToken,
          },
          body: JSON.stringify({ type: currentUserShift ? currentUserShift.type : shiftType.value }),
        })
  
        if (!response.ok) {
          const errorData = await response.json()
  
          if (errorData.message && errorData.message.includes("already paused")) {
            shiftStatus = "paused"
            updateShiftUI()
            showToast("Shift is already paused. Use Start to resume.", "info")
          } else {
            throw new Error(errorData.message || "Failed to pause shift")
          }
        } else {
          if (shiftTimerInterval) {
            clearInterval(shiftTimerInterval)
            shiftTimerInterval = null
          }
  
          shiftStatus = "paused"
          showToast("Shift paused successfully")
  
          updateShiftUI()
          loadShifts(selectedServerId)
        }
      } catch (error) {
        console.error("Error pausing shift:", error)
        showToast("Failed to pause shift: " + error.message, "error")
      } finally {
        pauseShiftBtn.disabled = false
        pauseShiftBtn.innerHTML = '<i class="fas fa-pause"></i><span>Pause</span>'
        if (shiftStatus === "paused") {
          pauseShiftBtn.classList.add("resume")
          pauseShiftBtn.innerHTML = '<i class="fas fa-play"></i><span>Resume</span>'
        }
      }
    }
  
    async function endShift() {
      discordToken = getDiscordToken()
      if (!discordToken || !selectedServerId) {
        showToast("Authentication error. Please log in again.", "error")
        return
      }
  
      try {
        endShiftBtn.disabled = true
        endShiftBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'
  
        const response = await fetch(`https://api.duckybot.xyz/guilds/${selectedServerId}/shifts/end`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Discord-Code": discordToken,
          },
          body: JSON.stringify({ type: currentUserShift ? currentUserShift.type : shiftType.value }),
        })
  
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || "Failed to end shift")
        }
  
        if (shiftTimerInterval) {
          clearInterval(shiftTimerInterval)
          shiftTimerInterval = null
        }
  
        shiftStatus = "inactive"
        shiftStartTime = 0
        shiftElapsedTime = 0
        currentUserShift = null
  
        updateShiftUI()
  
        showToast("Shift ended successfully")
  
        loadShifts(selectedServerId)
      } catch (error) {
        console.error("Error ending shift:", error)
        showToast("Failed to end shift: " + error.message, "error")
      } finally {
        endShiftBtn.disabled = false
        endShiftBtn.innerHTML = '<i class="fas fa-stop"></i><span>End</span>'
      }
    }
  
    function updateActiveShifts() {
      document.querySelectorAll("#activeShifts .shift-card").forEach((card) => {
        const startTimeElement = card.querySelector("[data-started-time]")
        if (startTimeElement) {
          const startTime = Number.parseInt(startTimeElement.dataset.startedTime)
          const now = Math.floor(Date.now() / 1000)
          const duration = now - startTime
  
          const durationElement = card.querySelector(".active-duration")
          if (durationElement) {
            durationElement.textContent = formatDuration(duration)
          }
        }
      })
    }
  
    async function loadServers() {
      discordToken = getDiscordToken()
  
      if (!discordToken) {
        loadingOverlay.style.display = "none"
        showToast("Authentication error. Please log in again.", "error")
        return
      }
  
      try {
        const response = await fetch("https://api.duckybot.xyz/guilds", {
          headers: { "Discord-Code": discordToken },
        })
  
        if (!response.ok) {
          throw new Error("Failed to fetch servers")
        }
  
        const { data: guilds, code } = await response.json()
  
        if (code !== 200 || !guilds) {
          throw new Error("Invalid response from server")
        }

        const userResponse = await fetch("https://api.duckybot.xyz/user/@me", {
          headers: { "Discord-Code": discordToken },
        })

        if (userResponse.ok) {
          const userData = await userResponse.json()
          if (userData.code === 200 && userData.data) {
            discordUser = userData.data
            document.getElementById("username").textContent = discordUser.username || discordUser.name
            document.getElementById("profilePicture").src =
              discordUser.avatar || "https://duckybot.xyz/images/Ducky.svg"
          }
        }
  
        serverGrid.innerHTML = ""
  
        const moderationGuilds = guilds.filter((guild) => guild.ducky && guild.manage_server)
  
        if (moderationGuilds.length === 0) {
          serverGrid.innerHTML = `
                      <div class="col-span-full text-center py-8">
                          <i class="fas fa-server text-4xl text-gray-500 mb-4"></i>
                          <p class="text-gray-400">No servers found with Ducky and moderation permissions.</p>
                          <a href="/invite" class="mt-4 inline-block px-4 py-2 bg-[#F5FF82] text-black rounded-lg font-medium hover:opacity-90 transition">Invite Ducky to your server</a>
                      </div>
                  `
        } else {
          moderationGuilds.forEach((guild) => {
            const serverCard = document.createElement("div")
            serverCard.className = "server-card glass-card"
            serverCard.innerHTML = `
                          <img src="${guild.icon || "https://duckybot.xyz/images/Ducky.svg"}" alt="${guild.name}">
                          <span class="text-center text-sm font-medium truncate w-full">${guild.name}</span>
                      `
  
            serverCard.addEventListener("click", () => {
              selectServer(guild.id, guild.name, guild.icon, guild.config)
            })
  
            serverGrid.appendChild(serverCard)
          })
        }
  
        const savedServer = localStorage.getItem("selectedServerId")
        if (savedServer) {
          try {
            const { id, name, icon, config } = JSON.parse(savedServer)
            if (moderationGuilds.some((guild) => guild.id === id)) {
              selectServer(id, name, icon, config)
              return
            }
          } catch (e) {
            console.error("Error parsing saved server:", e)
          }
        }
  
        loadingOverlay.style.display = "none"
        serverSelectionView.style.opacity = "1"
      } catch (error) {
        console.error("Error loading servers:", error)
        loadingOverlay.style.display = "none"
        serverSelectionView.style.opacity = "1"
        serverGrid.innerHTML = `
                  <div class="col-span-full text-center py-8">
                      <i class="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
                      <p class="text-gray-400">Failed to load servers. Please try again.</p>
                      <button id="retryBtn" class="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition">Retry</button>
                  </div>
              `
  
        document.getElementById("retryBtn")?.addEventListener("click", loadServers)
      }
    }
  
    window.addEventListener("beforeunload", () => {
      if (activeShiftsInterval) {
        clearInterval(activeShiftsInterval)
      }
      if (shiftTimerInterval) {
        clearInterval(shiftTimerInterval)
      }
    })
  
    initDropdowns()
    loadServers()
  })
  