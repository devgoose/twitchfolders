/********************************
 * Folder functions
 ********************************/

/**
 * Creates a new folder.
 *
 * @param name Name of the folder to be created.
 *
 * @return Returns the new folder.
 */
function createFolder(name) {
  const folder = document.createElement("div");
  folder.classList.add("tf-folder");
  folder.innerHTML = `
    <div class="tf-folder-content">
      <i class="tf-folder-icon fas fa-chevron-down"></i>
      <div class="tf-folder-text">
        ${name}
      </div>
      <input
        maxlength="15"
        minlength="2"
        value=${name}
        class="tf-folder-input hide">
    </div>
    <div class="tf-folder-channels"></div>
  `;
  const channels: HTMLDivElement = folder.querySelector(".tf-folder-channels");
  const icon: HTMLElement = folder.querySelector("i");
  const iconContainer: HTMLDivElement = folder.querySelector(".tf-folder-icon");
  const content: HTMLDivElement = folder.querySelector(".tf-folder-content");
  const input: HTMLInputElement = folder.querySelector(".tf-folder-input");

  folder.onclick = (event) => {
    if (event.target !== input) {
      if (iconContainer.classList.contains("tf-folder-icon-open")) {
        iconContainer.classList.remove("tf-folder-icon-open");
        channels.classList.remove("tf-folder-channels-open");
        content.classList.remove("tf-folder-content-open");
        icon.classList.replace("fa-chevron-up", "fa-chevron-down");
      } else {
        iconContainer.classList.add("tf-folder-icon-open");
        channels.classList.add("tf-folder-channels-open");
        content.classList.add("tf-folder-content-open");
        icon.classList.replace("fa-chevron-down", "fa-chevron-up");
      }
    }
  };

  return folder;
}

/**
 * Returns the name of a given folder.
 *
 * @param folder
 */
function getFolderName(folder) {
  return folder.querySelector(".tf-folder-text").innerText.trim();
}

/**
 * Returns boolean whether or not the given element is a tf-folder.
 * @param folder
 */
function isFolder(folder) {
  if (folder == null) {
    return false;
  }
  return folder.classList.contains("tf-folder");
}

/**
 * Adds a folder to the beginning of the followed channel container, just below
 * the toolbar. Pushes everything else down.
 *
 * @param folder Represents the folder to be added.
 */
function displayFolderAtTop(folder): void {
  const channelContainer = document.querySelector(".side-nav-section")
    .children[1];
  channelContainer.insertBefore(folder, getToolbar().nextSibling);
}

/**
 * Opens a folder
 * @param folder
 */
function openFolder(folder): void {
  if (!folder.querySelector(".tf-folder-content-open")) {
    folder.click();
  }
}

/**
 * Closes a folder
 * @param folder
 */
function closeFolder(folder): void {
  if (folder.querySelector(".tf-folder-content-open")) {
    folder.click();
  }
}

/**
 * Moves the given channel inside of the folder, and modifies local memory to
 * represent the change.
 * @param channel
 * @param folder
 */
function addChannelToFolder(
  channel: HTMLDivElement,
  folder: HTMLDivElement
): boolean {
  const currentFolder = getFolderFromChannel(channel);
  if (currentFolder !== folder) {
    const currentFolderName = getFolderName(currentFolder);
    const channelName = getChannelName(channel);
    const index = Global.folders[currentFolderName].indexOf(channelName);
    // Remove from old folder
    Global.folders[currentFolderName].splice(index, 1);
    // Add to new folder
    Global.folders[getFolderName(folder)].push(channelName);
    // Display in the DOM
    displayChannel(channel, folder);
  }
  return false;
}

/**
 * Display the loaded channels into the loaded folders.
 *
 * Channels that are in the default tf folder or are offline
 * will not be modified with their order they are loaded into the DOM
 */
function displayFolders(): void {
  for (let i = Global.folderOrder.length - 1; i >= 0; i--) {
    const folder: string = Global.folderOrder[i];
    const folderElement: HTMLDivElement = createFolder(folder);
    if (Global.folders[folder]) {
      for (const channel of Global.folders[folder]) {
        displayChannel(getChannelFromDOM(channel), folderElement);
      }
      displayFolderAtTop(folderElement);
    }
  }
}

/**
 * Changes the name of a given folder. Because folders
 * are just stored as members of an object, must copy and
 * delete the old one
 * @param folder folder to be renamed
 */
function rename(folder: HTMLDivElement): void {
  const input: HTMLInputElement = folder.querySelector(".tf-folder-input");
  const text: HTMLDivElement = folder.querySelector(".tf-folder-text");
  const oldname: string = getFolderName(folder);

  input.select();
  input.classList.remove("hide");
  input.value = oldname;
  text.classList.add("hide");

  function onNameEntry(event) {
    if (
      (event.target !== input &&
        event.target !== document.querySelector(".fa-folder-plus")) ||
      event.keyCode === 13
    ) {
      const name: string = validateFolderName(oldname, input.value);
      text.innerHTML = name;
      input.classList.add("hide");
      text.classList.remove("hide");

      document.removeEventListener("click", onNameEntry);
      document.removeEventListener("keydown", onNameEntry);

      // If this is a new folder, create a new local entry for it
      // Else, overwrite old entry
      if (!Global.folders[oldname]) {
        Global.folderOrder.unshift(name);
        Global.folders[name] = [];
      } else {
        Global.folders[name] = Global.folders[oldname];
        delete Global.folders[oldname];
      }

      // Save changes
      save();
    } else if (!event.keyCode) {
      input.select();
    }
  }
  document.addEventListener("click", onNameEntry);
  document.addEventListener("keydown", onNameEntry);
}

/**
 * Validates that a given string can be used to name a folder
 * @param input Value of the input field used to rename folders
 */
function validateFolderName(oldname: string, input: string): string {
  if (
    !input ||
    input.length < 3 ||
    input.length > 15 ||
    (Global.folderOrder.includes(input) && input !== oldname)
  ) {
    return "Invalid Name";
  }
  return input;
}

/**
 * Full process of creating a folder
 */
function newFolder() {
  const folder = createFolder("New Folder");
  displayFolderAtTop(folder);
  rename(folder);
}

/**
 * Removes a folder from the dom
 * @param folder Folder to be deleted
 */
function removeFolder() {
  const folder = document.querySelector(".tf-folder");
  if (folder) {
    const name = getFolderName(folder);
    const channels = Global.folders[name];
    channels.forEach((channel) => {
      displayChannel(getChannelFromDOM(channel), null);
    });
    delete Global.folders[name];
    const index = Global.folderOrder.indexOf(name);
    Global.folderOrder.splice(index, 1);
    folder.remove();
    save();
  }
}

/**
 * Returns whether or not coords are in a rectangle.
 * @param rect bounding rectangle
 * @param x
 * @param y
 */
function isInRect(rect: DOMRect, x: number, y: number): boolean {
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

/**
 * Returns a folder given two mouse coordinates
 * @param x
 * @param y
 */
function getFolderFromCoords(x: number, y: number): HTMLDivElement {
  const channelContainer = document.querySelector(".side-nav-section")
    .children[1];
  for (const folder of channelContainer.children as any) {
    if (folder.classList.contains("tf-folder")) {
      if (isInRect(folder.getBoundingClientRect(), x, y)) {
        return folder as HTMLDivElement;
      }
    }
  }
  return null;
}
