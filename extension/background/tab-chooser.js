'use strict';

define(() => {
    class TabChooser {
        constructor() {
            this.currentTabId = null;
            this.onTabChanged = null;
            chrome.runtime.onMessage.addListener((message, sender) => {
                if (!sender.tab) {
                    return;
                }
                if (sender.tab.id !== this.currentTabId) {
                    switch (message.command) {
                    case 'play':
                    case 'progress':
                        this.changeTab(sender.tab.id);
                        break;
                    }
                } else {
                    switch (message.command) {
                    case 'force-unload':
                        this.changeTab(null);
                        break;
                    }
                }
            });
            chrome.tabs.onRemoved.addListener((tabId) => {
                if (tabId === this.currentTabId) {
                    this.changeTab(null);
                }
            });
        }

        changeTab(tabId) {
            if (this.currentTabId) {
                chrome.pageAction.hide(this.currentTabId);
                chrome.pageAction.setTitle({
                    tabId: this.currentTabId,
                    title: 'Not playing',
                });
                chrome.pageAction.setIcon({
                    tabId: this.currentTabId,
                    path: {
                        '16': 'icons/disconnect-16.png',
                        '32': 'icons/disconnect-32.png',
                        '64': 'icons/disconnect-64.png',
                        '128': 'icons/disconnect-128.png',
                    },
                });
            }
            this.currentTabId = tabId;
            if (tabId) {
                chrome.pageAction.show(this.currentTabId);
                chrome.pageAction.setTitle({
                    tabId: this.currentTabId,
                    title: 'Playing',
                });
                chrome.pageAction.setIcon({
                    tabId: this.currentTabId,
                    path: {
                        '16': 'icons/playing-16.png',
                        '32': 'icons/playing-32.png',
                        '64': 'icons/playing-64.png',
                        '128': 'icons/playing-128.png',
                    }
                });
            }
            this.sendMessage({ command: 'reload' });
        }

        sendMessage(message) {
            if (this.currentTabId === null) {
                return;
            }
            chrome.tabs.sendMessage(this.currentTabId, message);
        }
    }
    return new TabChooser();
});