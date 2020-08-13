window.onload = function () {
  let storagesrc = document.getElementById("storagesrc");
  let clearbutton = document.getElementById("clearbutton");
  let reloadbutton = document.getElementById("reloadbutton");

  clearbutton.addEventListener("click", clear);
  reloadbutton.addEventListener("click", reload);

  glob = {
    folderOrder: null,
    folders: null,
  };

  reload();

  function reload() {
    chrome.storage.sync.get(null, function (data) {
      console.log(data);
      glob.folderOrder = JSON.parse(data.folderOrder);
      glob.folders = JSON.parse(data.folders);
      console.log(glob);

      storagesrc.innerHTML = JSON.stringify(glob, null, 2);
    });
  }

  function clear() {
    chrome.storage.sync.clear(function () {
      chrome.storage.sync.set(
        { folderOrder: JSON.stringify([]), folders: JSON.stringify({}) },
        function () {
          reload();
        }
      );
    });
  }
};
