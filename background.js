var handlers = {
	checkWhitelistStatus: function(request, sender, sendResponse) {
		var tab = sender.tab;
		if(!tab) { return; }

		var domain = getDomain(tab);

		getWhitelist(function(whitelist) {
			var whitelisted = whitelist.includes(domain);

			sendResponse(whitelisted);
			setIcon(tab, whitelisted);
		});
	}
};

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	var handler = handlers[request.type];
	if(handler) {
		handler(request, sender, sendResponse);
	}

	return true;
});

chrome.browserAction.onClicked.addListener(function(tab) {
	var domain = getDomain(tab);

	getWhitelist(function(whitelist) {
		var index = whitelist.indexOf(domain);
		var whitelisted = index > -1;

		setIcon(tab, !whitelisted);

		if(whitelisted) {
			whitelist.splice(index, 1);
		} else {
			whitelist.push(domain);
		}

		chrome.storage.local.set({whitelist: whitelist}, function() {
			chrome.tabs.reload(tab.id);
		});
	});
});

function getWhitelist(callback) {
	chrome.storage.local.get(['whitelist'], function(result) {
		var whitelist = result.whitelist;
		if(!Array.isArray(whitelist)) { whitelist = []; }
		whitelist = whitelist.filter(function(entry) {
			return typeof entry === "string";
		});

		callback(whitelist);
	});
}

function setIcon(tab, whitelisted) {
	var icon, title;

	if(whitelisted) {
		icon = {tabId: tab.id, path: 'icon-enabled.png'};
		title = {tabId: tab.id, title: 'Block videos'};
	} else {
		icon = {tabId: tab.id, path: 'icon.png'};
		title = {tabId: tab.id, title: 'Allow videos'};
	}

	chrome.browserAction.setIcon(icon);
	chrome.browserAction.setTitle(title);
}

function getDomain(tab) {
	return (new URL(tab.url)).hostname;
}
