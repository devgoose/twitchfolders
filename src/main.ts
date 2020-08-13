/**
 * Globals
 */

type GlobalType = {
  folders: Record<string, string[]>;
  folderOrder: string[]; // Persists the order of the channels
  followed: string[];
};

const Global: GlobalType = {
  folders: {},
  folderOrder: [],
  followed: [],
};

/**
 * Include FontAwesome
 */
const fascript: HTMLScriptElement = document.createElement("script");
fascript.src = "https://kit.fontawesome.com/ce701745ac.js";
fascript.crossOrigin = "anonymous";
document.head.appendChild(fascript);

/**
 * Show More Button Observer
 * If show more buttons exist, then the side nav bar has been loaded.
 * When there are two on the screen (for followed and for recommended channels)
 * then repeatedly click the first one to expand the list of followed channels.
 */
let followedLoaded = false;
const config = { attributes: true, childList: true, subtree: true };
const handleMutation = (mutationsList, observer) => {
  const showMoreButtons: NodeListOf<HTMLElement> = document.querySelectorAll<
    HTMLElement
  >("button[data-a-target='side-nav-show-more-button']");
  if (showMoreButtons.length > 0 && !followedLoaded) {
    if (showMoreButtons.length >= 2) {
      showMoreButtons[0].click();
    } else {
      followedLoaded = true;
      onFollowedChannelsLoaded();
      buttonObserver.disconnect();
    }
  }
};
const buttonObserver = new MutationObserver(handleMutation);
buttonObserver.observe(document.body, config);

function onFollowedChannelsLoaded() {
  // Load from storage, clean up bad data, display folders to DOM
  displayToolbar(createToolbar());
  loadGlobals().then(() => {
    return displayFolders();
  });
}
