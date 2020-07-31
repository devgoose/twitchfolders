


window.onload = function() {
    var followed = getFollowedChannelsThroughDOM();
    console.log(followed);
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

// Returns HTMLCollection of all followed channels currently online
function getFollowedChannelsThroughDOM() {
    // Get all followed channels by clicking "show more".......
    var sideNav = document.getElementsByClassName('side-nav-section')[0];
    loadFollowedChannels(sideNav);
    // Grab lise of all the followed channel panels
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

function loadFollowedChannels(sideNav) {
    var followedUpdated = false;
    const config = { attributes: true, childList: true, subtree: true};
    const waitForChannelListUpdate = function(mutationsList, observer) {
        for (let mutation of mutationsList) {
            if (mutation.type === 'childList') {
                var showMoreButtons = document.querySelectorAll("button[data-a-target='side-nav-show-more-button']");
                if (showMoreButtons.length >= 2) {
                    showMoreButtons[0].click();
                } else {
                    followedUpdated = true;
                    buttonObserver.disconnect();
                }
            }
        }     
    }
    const buttonObserver = new MutationObserver(waitForChannelListUpdate);
    buttonObserver.observe(sideNav, config);

    // observer registered, now click the button
    document.querySelectorAll("button[data-a-target='side-nav-show-more-button']")[0].click();
    
}


function isOnline(followedElement) {
    var liveStatusContainer = followedElement.getElementsByClassName("side-nav-card__live-status")[0]
    var liveStatusElementHTML = liveStatusContainer ?
                            liveStatusContainer.children[0].innerHTML :
                            null;
    console.log(liveStatusElementHTML);
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

function addFolderToTop(parent) {
    var newFolder = createFolder("Test Folder Name");
    parent.insertBefore(newFolder, parent.children[0]);
}

function createFolder(name) {
    var folder = document.createElement("div");
    folder.classList.add("tf-folder");

    var content = document.createElement("div");
    content.classList.add("tf-folder-content");

    var icon = document.createElement("img");
    icon.src =  chrome.runtime.getURL("images/down.jpg");

    var iconContainer = document.createElement("div");
    iconContainer.append(icon);
    iconContainer.classList.add("tf-folder-icon-closed");

    var text = document.createElement("div");
    text.innerText = name;
    text.classList.add("tf-folder-text");
    

    folder.append(content);
    content.append(iconContainer);
    content.append(text);

    return folder;
}

function folderOnClick(element) {
    show(element);
}

function show(element) {
    element.classList.toggle("show");
}
