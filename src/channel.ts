/********************************
 * Functions that interact with the DOM, setting and getting
 * simple information. Getters/setters that are specific to
 * tf components are located in their individual files.
 ********************************/

/**
 * After channels in the sidebar have been fully loaded,
 * grabs all the followed channels from the DOM and returns
 * an object containing the channel elements, separated by
 * offline and online.
 *
 * @param sideNav navigation container for channels
 */
function loadFollowedChannelsThroughDOM(sideNav): string[] {
  // Grab list of all the followed channel panels
  const followedList = sideNav.childNodes[1].childNodes;

  const followed: string[] = [];

  for (const channel of followedList) {
    if (!channel.classList.contains("tf-toolbar")) {
      makeChannelDraggable(channel);
      followed.push(getChannelName(channel));
    }
  }
  return followed;
}

/**
 * Inserts a channel into the folder's container, if the channel is online, and
 * sorts by viewers. Does not modify local memory or storage. Used to initialize the
 * DOM, and should not be used for moving folders around after the initial load.
 *
 * If the channel is offline, that means it goes in its normal alphabetical location.
 * If @param folder is null, then channel is properly displayed in channel list un-categorized
 *
 * @param channel Channel to display
 * @param folder Folder that channel will be inserted into
 */
function displayChannel(
  channel: HTMLDivElement,
  folder: HTMLDivElement
): boolean {
  let container;
  if (folder) {
    container = folder.querySelector(".tf-folder-channels");
  } else {
    container = document.querySelector(".side-nav-section").children[1];
  }
  const viewers = getViewerCount(channel);
  // If channel is online, display it
  if (viewers > 0) {
    for (const cur of container.children) {
      if (viewers >= getViewerCount(cur)) {
        container.insertBefore(channel, cur);
        return true;
      }
    }
    container.insertBefore(channel, null);
    return true;
  }
  return false;
}

/**
 * Edits local memory to reflect a change in a folder's location.
 * @param channel
 * @param folder
 */
function recordChannelInFolder(channel: string, folder: string): void {
  // First, remove channel from existing folder
  for (const f of Object.keys(Global.folders)) {
    if (Global.folders[f].includes(channel)) {
      Global.folders[f].splice(Global.folders[f].indexOf(channel), 1);
    }
  }
  // Then, add to the folder
  Global.folders[folder].push(channel);
}

/**
 * Returns the channel element with the given name.
 * @param name Name of a channel
 */
function getChannelFromDOM(name: string): HTMLDivElement {
  const channels = document.querySelectorAll(".tf-channel");
  for (const channel of channels as any) {
    const div = channel as HTMLDivElement;
    if (getChannelName(div) === name) {
      return div;
    }
  }
  return null;
}

/**
 * Returns the string username of a channel, or null if the
 * input is invalid.
 * @param channel
 */
function getChannelName(channel: HTMLDivElement): string {
  if (isChannel(channel)) {
    return channel
      .querySelector("p[data-a-target='side-nav-title']")
      .innerHTML.trim();
  }
  return null;
}

/**
 * Returns the number of viewers a channel has if it is online,
 * or 0 if the channel is offline. Otherwise, returns -1.
 * @param channel
 */
function getViewerCount(channel): number {
  if (isChannel(channel)) {
    if (isOnline(channel)) {
      const count: string = channel.querySelector(
        "span[data-test-selector='1']"
      ).innerText;
      if (count.charAt[count.length - 1] === "K") {
        return parseFloat(count.substring(0, count.length - 1)) * 1000;
      }
      if (count.charAt[count.length - 1] === "M") {
        return parseFloat(count.substring(0, count.length - 1)) * 1000000;
      }
      return parseFloat(count);
    } else {
      return 0;
    }
  }
  return -1;
}

function getFolderFromChannel(channel: HTMLDivElement): HTMLDivElement {
  return channel.closest(".tf-folder");
}

/**
 * Returns boolean whether or not the channel is online.
 * @param channel
 */
function isOnline(channel): boolean {
  const liveStatusContainer = channel.getElementsByClassName(
    "side-nav-card__live-status"
  )[0];
  const liveStatusElementHTML = liveStatusContainer
    ? liveStatusContainer.children[0].innerHTML
    : null;
  if (liveStatusElementHTML === "Offline") {
    return false;
  }
  return true;
}

/**
 * Returns boolean whether or not the given element is a tf-channel.
 * Note that this class is added after
 * @param channel
 */
function isChannel(channel: HTMLDivElement): boolean {
  if (channel == null) {
    return false;
  }
  return channel.classList.contains("tf-channel");
}

/**
 * Checks if channel is included in a folder or not. Uses the DOM to check for this,'
 * not memory.
 * @param channel
 */
function isInFolder(channel: HTMLDivElement): boolean {
  const parent = getFolderFromChannel(channel);
  if (parent) {
    return true;
  }
  return false;
}

/**
 * Returns true if the channel is followed, based on what was loaded in from the DOM.
 * @param channel
 */
function isFollowed(channel): boolean {
  return Global.followed.includes(channel);
}

/**
 * Gives a channel its drag and drop events.
 * @param channel channel to be made draggable
 */
function makeChannelDraggable(channel: HTMLDivElement) {
  channel.classList.add("tf-channel");
  channel.setAttribute("draggable", "false");
  channel.onmousedown = dragMouseDown;
  let offsetLeft = 0;
  let offsetTop = 0;
  let channelClone: HTMLDivElement = null;
  let dragged = false;
  let target: HTMLDivElement = null;

  function dragMouseDown(event: any) {
    event = event || window.event;
    event.preventDefault();
    if (event.button === 0) {
      channel.classList.add("tf-channel-selected");
      document.onmousemove = drag;
      document.onmouseup = drop;
    }
  }

  function drag(event: any) {
    if (!dragged) {
      // Grab location info
      const rect: DOMRect = channel.getBoundingClientRect();
      const width: number = rect.right - rect.left;
      offsetLeft = event.clientX - rect.left;
      offsetTop = event.clientY - rect.top;
      // Create a copy of the channel to drag around
      channelClone = channel.cloneNode(true) as HTMLDivElement;
      channelClone.classList.add("tf-channel-dragged");
      channelClone.style.width = width + "px";
      channelClone.style.left = rect.left + "px";
      channelClone.style.top = rect.top + "px";
      // Insert into document and add event listeners
      document.body.insertBefore(channelClone, document.body.firstChild);
      dragged = true;
    }

    const currentTarget = getFolderFromCoords(event.clientX, event.clientY);
    if (currentTarget) {
      if (target && target !== currentTarget) {
        target.classList.remove("tf-folder-hover");
      }
      currentTarget.classList.add("tf-folder-hover");
    }
    target = currentTarget;

    event = event || window.event;
    event.preventDefault();
    if (event.button === 0) {
      // update the coordinates
      channelClone.style.left = event.clientX - offsetLeft + "px";
      channelClone.style.top = event.clientY - offsetTop + "px";
    }
  }

  function drop() {
    // reset mouse events and get rid of clone
    dragged = false;
    document.onmouseup = null;
    document.onmousemove = null;
    channel.classList.remove("tf-channel-selected");
    channelClone.remove();
    if (target) {
      target.classList.remove("tf-folder-hover");
      openFolder(target);
    }
    if (isFolder(target) || (isChannel(target) && isInFolder(target))) {
      displayChannel(channel, target);
      recordChannelInFolder(getChannelName(channel), getFolderName(target));
      save();
    } else {
      // Do nothing
    }
  }
}

function removeChannelFromFolder(
  channel: HTMLDivElement,
  folder: HTMLDivElement
): void {
  if (!folder) {
    folder = getFolderFromChannel(channel);
  }

  // Remove in local memory
  const channelName = getChannelName(channel);
  const folderName = getFolderName(folder);
  Global.folders[folderName].splice(
    Global.folders[folderName].indexOf(channelName),
    1
  );

  // Remove in the folder, resort in the DOM channel list
  const viewers: number = getViewerCount(channel);
  const channelContainer = document.querySelector(".side-nav-section")
    .children[1];
  for (const child of channelContainer.children) {
    if (
      isChannel(child as HTMLDivElement) &&
      !isInFolder(child as HTMLDivElement) &&
      viewers >= getViewerCount(child)
    ) {
      channelContainer.insertBefore(channel, child);
    }
  }
}
