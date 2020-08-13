/**
 * Creates a div that sits at the top of all folders and channels, with buttons for Adding and deleting a folder.
 * Probably just + and -
 *
 * Creates the buttons here as well
 */
function createToolbar(): HTMLDivElement {
  const toolbar = document.createElement("div");
  toolbar.classList.add("tf-toolbar");
  toolbar.innerHTML = `
  <div class="tf-toolbar-icon">
    <i class="fas fa-folder-plus fa-2x"
      title="Create Folder"></i>
  </div>
  <div class="tf-toolbar-icon">
    <i class="fas fa-folder-minus fa-2x"
      title: "Delete Folder"></i>
  </div>
  `;
  toolbar.querySelector(".fa-folder-plus").addEventListener("click", newFolder);
  toolbar
    .querySelector(".fa-folder-minus")
    .addEventListener("click", removeFolder);
  return toolbar;
}

/**
 * Add the tool bar to the top of the channels\
 *
 * @param toolbar the toolbar element to add
 */
function displayToolbar(toolbar): void {
  const sideNav = document.getElementsByClassName("side-nav-section")[0];
  const channelContainer = sideNav.children[1];
  channelContainer.insertBefore(toolbar, channelContainer.children[0]);
}

/**
 * Returns the toolbar element from the DOM.
 */
function getToolbar(): HTMLDivElement {
  return document.querySelector("div[class='tf-toolbar']");
}
