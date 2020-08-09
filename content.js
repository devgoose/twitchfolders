/**
 * Show More Button Observer
 * If show more buttons exist, then the side nav bar has been loaded.
 * When there are two on the screen (for followed and for recommended channels)
 * then repeatedly click the first one to expand the list of followed channels.
 */
var followedLoaded = false;
const config = { attributes: true, childList: true, subtree: true};
const handleMutation = function(mutationsList, observer) {
    var showMoreButtons = document.querySelectorAll("button[data-a-target='side-nav-show-more-button']");
    if (showMoreButtons.length > 0 && !followedLoaded) {
        if (showMoreButtons.length >= 2) {
            showMoreButtons[0].click();
        } else {
            followedLoaded = true;
            onFollowedChannelsLoaded();
            buttonObserver.disconnect();
        }     
    }
}
const buttonObserver = new MutationObserver(handleMutation);
buttonObserver.observe(document.body, config);

function onFollowedChannelsLoaded() {
    // sideNav is the topmost container for all followed, offline and online channels
    var sideNav = document.getElementsByClassName('side-nav-section')[0];
    var followed = getFollowedChannelsThroughDOM(sideNav);
    var newFolder = addFolderToTop(sideNav);

    var index = 0;
    for (let channel of followed.online) {
        makeDraggable(channel, index);
        index++;
    }
    for (let channel of followed.offline) {
        makeDraggable(channel, index);
        index++;
    }
    //newFolder.children[1].append(followed.online[1]);

}

// Callled on window load
window.onload = function() {
    // var followed = getFollowedChannelsThroughDOM();
    // console.log(followed);
    // showMoreButton.addEventListener("click", reverseChildren);
    // let folder = document.createElement("div");
    // folder.classList.add("tf-folder");
    // let folderText = document.createTextNode("test text");
    // folder.append(folderText);
    // followedNavBar.append(folder);
    // var followed = followedNavBar.children[1];

    // addFolderToTop(followed);

    // reverseChildren(followed);
}

// Misc Funcs


// Returns HTMLCollection of all followed channels currently online
function getFollowedChannelsThroughDOM(sideNav) {
    // Grab list of all the followed channel panels
    var followedList = sideNav.childNodes[1].childNodes;

    var followed = {
        online: [],
        offline: []
    }

    for (var i = 0; i < followedList.length; i++) {
        var channel = followedList[i];
        if (isOnline(channel)) {
            followed.online.push(channel);
        } else {
            followed.offline.push(channel);
        }
    }
    return followed;
}

function isOnline(followedElement) {
    var liveStatusContainer = followedElement.getElementsByClassName("side-nav-card__live-status")[0]
    var liveStatusElementHTML = liveStatusContainer ?
                            liveStatusContainer.children[0].innerHTML :
                            null;
    if (liveStatusElementHTML === "Offline") {
        return false;
    }
    return true;
}


function reverseChildren(parent) {
    var children = parent.children;
    var len = children.length;
    for (i = len - 1; i >= 0; i--) {
        var child = children[i];
        child.remove();
        parent.append(child);
    }
}


function addFolderToTop(sideNav) {
    var newFolder = createFolder("Test Folder Name");
    var channelContainer = sideNav.children[1];
    channelContainer.insertBefore(newFolder, channelContainer.children[0]);
    return newFolder;
}

function createFolder(name) {
    var folder = document.createElement("div");
    folder.classList.add("tf-folder");

    var content = document.createElement("div");
    content.classList.add("tf-folder-content");

    var channels = document.createElement("div");
    channels.classList.add("tf-folder-channels-closed");

    var icon = document.createElement("img");
    icon.classList.add("tf-folder-icon-closed");
    icon.src = chrome.runtime.getURL("images/down.png");

    var iconContainer = document.createElement("div");
    iconContainer.append(icon);
    iconContainer.classList.add("tf-folder-icon");

    var text = document.createElement("div");
    text.innerText = name;
    text.classList.add("tf-folder-text");

    folder.append(content);
    folder.append(channels);
    content.append(iconContainer);
    content.append(text);

    folder.onclick = folderOnClick(folder);

    return folder;
}

function folderOnClick(folder) {
    return function() {
        var icon = folder.getElementsByClassName('tf-folder-icon')[0].children[0];
        var content = folder.children[0];
        var channels = folder.children[1];
        if (icon.classList.contains('tf-folder-icon-closed')) {
            icon.classList.remove('tf-folder-icon-closed');
            icon.classList.add('tf-folder-icon-open');
            icon.src = chrome.runtime.getURL("images/up.png");

            channels.classList.remove('tf-folder-channels-closed');
            channels.classList.add('tf-folder-channels-open');

            content.classList.add('tf-folder-content-open');
        } else {
            icon.classList.remove('tf-folder-icon-open');
            icon.classList.add('tf-folder-icon-closed');
            icon.src = chrome.runtime.getURL("images/down.png");

            channels.classList.remove('tf-folder-channels-open');
            channels.classList.add('tf-folder-channels-closed');

            content.classList.remove('tf-folder-content-open');
        }
    } 
}

function makeDraggable(channel, index) {
    channel.classList.add('tf-channel');
    channel.setAttribute('draggable', false);
    channel.onmousedown = dragMouseDown;
    var channelClone = null;
    var rect = channel.getBoundingClientRect();
    var width = rect.right - rect.left;
    var offsetLeft = 0;
    var offsetTop = 0;

    function dragMouseDown(event) {
        event = event || window.event;
        event.preventDefault();
        if (event.button == 0) {
            channel.classList.add('tf-channel-selected');
            offsetLeft = event.clientX - rect.left;
            offsetTop = event.clientY - rect.top;
            // Create a copy of the channel to drag around
            channelClone = channel.cloneNode(true);
            channelClone.classList.add('tf-channel-dragged');
            channelClone.style.width = width + "px";
            channelClone.style.left = rect.left + "px";
            channelClone.style.top = rect.top + "px";
            // Insert into document and add event listeners
            document.body.insertBefore(channelClone, document.body.firstChild);
            document.onmouseup = stopDrag;
            document.onmousemove = drag;
        }
    }

    function drag(event) {
        event = event || window.event;
        event.preventDefault();
        if (event.button == 0) {
            // update the coordinates 
            channelClone.style.left = (event.clientX - offsetLeft) + "px";
            channelClone.style.top = (event.clientY - offsetTop) + "px";
        }
    }

    function stopDrag() {
        // reset mouse events and get rid of clone
        document.onmouseup = null;
        document.onmousemove = null;
        channel.classList.remove('tf-channel-selected');
        channelClone.remove();
    }
}
