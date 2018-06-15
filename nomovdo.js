var flaggedVideos = new Set();

function killVideo(video) {
	video.innerHTML = '';

	if(video.hasAttribute("src")) {
		video.removeAttribute("src");
		video.load();
	}
}

function nomovdo(element) {
	document.querySelectorAll("video").forEach(function(video) {
		if(!video.src && video.childElementCount === 0 && flaggedVideos.has(video)) { return; }

		flaggedVideos.add(video);

		killVideo(video);

		video.addEventListener("loadstart", function() {
			killVideo(video);
		});
	});
}

function beginNomovdo() {
	var observer = new MutationObserver(nomovdo);
	observer.observe(document, {childList: true, subtree: true});

	document.addEventListener("DOMContentLoaded", nomovdo);

	nomovdo();
}

chrome.runtime.sendMessage({type: "checkWhitelistStatus"}, function(response) {
	if(!response) {
		beginNomovdo();
	}
});
