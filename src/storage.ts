/*******************************************
 * Storage Functions
 *******************************************/

/**
 *
 * @param channel channel to add to the folder
 * @param folder
 */
// function addChannelToFolder(channel: HTMLDivElement, folder: HTMLDivElement) {}

/**
 * Loads the followed channels and mappings of channel:folder and folder:channels
 * from Chrome storage. Returns a Promise to be .then() chained in main.js because
 * of the async nature of chrome storage requests.
 *
 * Returns a copy of the Global object, technicalily not needed.
 */
function loadGlobals(): Promise<GlobalType> {
  return new Promise((resolve) => {
    // first, load the channels that are followed
    chrome.storage.sync.get(null, (result) => {
      const sideNav = document.querySelector(".side-nav-section");
      Global.followed = loadFollowedChannelsThroughDOM(sideNav);
      if (result.folderOrder) {
        Global.folderOrder = JSON.parse(result.folderOrder);
      }
      if (result.folders) {
        Global.folders = clean(JSON.parse(result.folders));
      }
      resolve();
    });
  });
}

/**
 * Assuming that Global.folderOrder and Global.followed are already successfully
 * loaded, returns an Object represeting the folder:channel mappings that has removed
 * duplicates, unfollowed channels, or other invalid data.
 *
 * @param folders JSON object representing an object with key:value pairs mapped to
 * folder:channels[]
 */
function clean(
  foldersObject: Record<string, string[]>
): Record<string, string[]> {
  const cleanFolders: Record<string, any> = {};
  const mappedChannels: string[] = []; // List of channels to prevent duplicates

  for (const loadedFolder of Object.keys(foldersObject)) {
    if (Global.folderOrder.includes(loadedFolder)) {
      cleanFolders[loadedFolder] = [];
      for (const loadedChannel of foldersObject[loadedFolder]) {
        if (
          !mappedChannels.includes(loadedChannel) &&
          Global.followed.includes(loadedChannel)
        ) {
          mappedChannels.push(loadedChannel);
          cleanFolders[loadedFolder].push(loadedChannel);
        }
      }
    }
  }
  return cleanFolders;
}

/**
 * Saves the current browser state of the folder mappings to the chrome storage
 */
function save() {
  chrome.storage.sync.set({
    folders: JSON.stringify(Global.folders),
    folderOrder: JSON.stringify(Global.folderOrder),
  });
}

/**
 * Converts the given object's key: value pairs into a map
 * @param foldersObject Object born of parsed JSON from storage
 */
function convertFoldersObjectToMap(
  foldersObject: Record<string, any>
): Map<string, string[]> {
  const map: Map<string, string[]> = new Map();
  for (const key of Object.keys(foldersObject)) {
    map.set(key, foldersObject.key);
  }
  return map;
}

function convertFoldersMapToObject(
  foldersMap: Map<string, string[]>
): Record<string, any> {
  const foldersObject: Record<string, any> = {
    tf: [],
  };

  foldersMap.forEach((channels: string[], folder: string) => {
    foldersObject[folder] = channels;
  });

  return foldersObject;
}
