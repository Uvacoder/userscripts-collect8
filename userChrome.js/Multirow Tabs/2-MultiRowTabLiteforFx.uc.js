// ==UserScript==
// @name           zzzz-MultiRowTab_LiteforFx48.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    多段タブもどき実験版 CSS入れ替えまくりLiteバージョン
// @include        main
// @compatibility  Firefox 60
// @author         Alice0775
// @version        2016/08/05 00:00 Firefox 48
// @version        2016/05/01 00:01 hide favicon if busy
// @version        2016/03/09 00:01 Bug 1222490 - Actually remove panorama for Fx45+
// @version        2016/02/09 00:01 workaround css for lwt
// @version        2016/02/09 00:00
// ==/UserScript==
"user strict";
MultiRowTabLiteforFx();
function MultiRowTabLiteforFx() {
    var css =`
    /* 多段タブ時のタイトルバーボタン｢－□×｣の不具合対策 */
    #main-window:not([customizing]):not([pinned]) #titlebar {
        height: var(--tab-min-height) !important;
        margin-bottom: calc(var(--tab-min-height) * -1 + 0px) !important;
    }
    #main-window:not([customizing])[sizemode="maximized"] #titlebar {
        margin-bottom: calc(var(--tab-min-height) * -1 + 8px) !important;
    }
    #titlebar-buttonbox {
        display: block !important;
    }
    /* 多段タブ */
    #tabbrowser-tabs .arrowscrollbox-scrollbox {
        overflow: visible !important;
        display: block !important;
    }
    #tabbrowser-tabs .scrollbox-innerbox {
        display: flex !important;
        flex-wrap: wrap !important;
        overflow-x: hidden !important;
        overflow-y: auto !important;
        max-height: calc(var(--tab-min-height) * 5 /* 段数 */) !important;
    }
    .tabbrowser-tab:not([pinned]) {
        flex-grow: 1 !important;
    }
    .tabbrowser-tab,.tab-background {
        height: var(--tab-min-height) !important;
        display: -webkit-box !important;
        z-index: 1 !important;
    }
    .tabs-newtab-button {
        width: var(--tab-min-height) !important;
        height: calc(var(--tab-min-height) + -1px) !important;
    }
    .tab-stack {
        width: 100% !important;
    }
    /* 多段タブ時指定した段数以上になった時タブバーに出てくるスクロールバーをマウスドラッグで上下出来るようにする */
    #tabbrowser-tabs .scrollbox-innerbox scrollbar {
        -moz-window-dragging: no-drag !important;
    }
    /* -- 非表示 -- */
    #tabbrowser-tabs [anonid^="scrollbutton"],#alltabs-button,
    hbox.titlebar-placeholder:not([type="caption-buttons"]) {
        display: none !important;
    }
    /* 000-addToolbarInsideLocationBar.uc.js アイコン */
    #ucjs-Locationbar-toolbar .toolbarbutton-1 .toolbarbutton-icon {
        width: 22px !important;
        height: 22px !important;
        padding: 3px !important;
    }
    #ucjs-Locationbar-toolbar toolbarbutton#downloads-button .toolbarbutton-icon,
    #ucjs-Locationbar-toolbar .webextension-browser-action .toolbarbutton-badge-stack {
        width: 22px !important;
        height: 22px !important;
        padding: 0 !important;
    }
    #ucjs-Locationbar-toolbar toolbarbutton.toolbarbutton-1:hover,
    #ucjs-Locationbar-toolbar toolbaritem toolbarbutton:hover {
        background-color: hsla(0,0%,80%,.25) !important;
    }
    /* MultiRowTab_LiteforFx */
    .tabbrowser-tab, {
        z-index: 1 !important;
    }
    .tabbrowser-tab[last-visible-tab="true"]::after {
        border-left: 1px none !important;
    }
    .tabbrowser-tab[style="border-left-color: red !important;"] .tab-background {
        border-left: 1px solid red !important;
    }
    .tabbrowser-tab[style="border-right-color: red !important;"] .tab-background {
        border-right: 1px solid red !important;
    }
    .tabbrowser-tab:not([style="border-right-color: red !important;"]):not([selected="true"])[last-visible-tab="true"] .tab-background {
        border-right: 1px solid rgba(249, 249, 250, 0.3) !important;
    }`;
    var sss = Cc['@mozilla.org/content/style-sheet-service;1'].getService(Ci.nsIStyleSheetService);
    var uri = makeURI('data:text/css;charset=UTF=8,' + encodeURIComponent(css));
    sss.loadAndRegisterSheet(uri, sss.AGENT_SHEET);
    gBrowser.tabContainer._getDropEffectForTabDrag = function(event){return "";}; // multirow fix: to make the default "dragover" handler does nothing
    gBrowser.tabContainer.lastVisibleTab = function() {
        var tabs = this.childNodes;
        for (let i = tabs.length - 1; i >= 0; i--){
            if (!tabs[i].hasAttribute("hidden"))
                return i;
        }
        return -1;
    };
    gBrowser.tabContainer.clearDropIndicator = function() {
        var tabs = this.childNodes;
        for (let i = 0, len = tabs.length; i < len; i++){
            let tab_s= tabs[i].style;
            tab_s.removeProperty("border-left-color");
            tab_s.removeProperty("border-right-color");
        }
    };
    gBrowser.tabContainer.addEventListener("drop",function(event){this.onDrop(event);},true);
    gBrowser.tabContainer.addEventListener("dragleave",function(event){this.clearDropIndicator(event);},true);
    gBrowser.tabContainer._onDragOver = function(event) {
        event.preventDefault();
        event.stopPropagation();
        this.clearDropIndicator();
        var newIndex = this._getDropIndex(event);
        if (newIndex == null)
            return;
        if (newIndex < this.childNodes.length) {
            this.childNodes[newIndex].style.setProperty("border-left-color","red","important");
        } else {
            newIndex = gBrowser.tabContainer.lastVisibleTab();
            if (newIndex >= 0)
                this.childNodes[newIndex].style.setProperty("border-right-color","red","important");
        }
    };
    gBrowser.tabContainer.addEventListener("dragover", gBrowser.tabContainer._onDragOver, true);
    gBrowser.tabContainer._getDropIndex = function(event, isLink) {
        var tabs = this.childNodes;
        var tab = this._getDragTargetTab(event, isLink);
        if (window.getComputedStyle(this).direction == "ltr") {
            for (let i = tab ? tab._tPos : 0; i < tabs.length; i++) {
                let boxObject = tabs[i].boxObject;
                if (event.screenX < boxObject.screenX + boxObject.width / 2
                 && event.screenY < boxObject.screenY + boxObject.height) // multirow fix
                   return i;
            }
        } else {
            for (let i = tab ? tab._tPos : 0; i < tabs.length; i++) {
                let boxObject = tabs[i].boxObject;
                if (event.screenX > boxObject.screenX + boxObject.width / 2
                 && event.screenY < boxObject.screenY + boxObject.height) // multirow fix
                    return i;
            }
        }
        return tabs.length;
    };
    gBrowser.tabContainer.onDrop = function(event) {
        var newIndex;
        this.clearDropIndicator();
        var dt = event.dataTransfer;
        var dropEffect = dt.dropEffect;
        var draggedTab;
        if (dt.mozTypesAt(0)[0] == TAB_DROP_TYPE) {
            draggedTab = dt.mozGetDataAt(TAB_DROP_TYPE, 0);
            if (!draggedTab)
                return;
        }
        if (draggedTab && dropEffect == "copy") {
        } else if (draggedTab && draggedTab.parentNode == this) {
            newIndex = this._getDropIndex(event, false);
            if (newIndex > draggedTab._tPos)
                newIndex--;
            gBrowser.moveTabTo(draggedTab, newIndex);
        }
        if (draggedTab) {
          delete draggedTab._dragData;
        }
    };
}

