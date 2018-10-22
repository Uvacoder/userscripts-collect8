// ==UserScript==
// @name           saveSpecifiedUrl.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    urlを指定して保存
// @include        main
// @compatibility  Firefox 60+
// @author         Alice0775
// @version        2019/09/26 23:00 60+
// @version        2013/01/19 23:20 Bug 795065 Add privacy status to nsDownload
// @version        2012/12/08 22:30 Bug 788290 Bug 788293 Remove E4X 
// @version        2009/12/12
// ==/UserScript==
var saveSpecifiedUrl = {
  init: function() {
    let menuitem = document.createElement("menuitem");
    menuitem.setAttribute("id", "menu_saveSpecifiedUrl");
    menuitem.setAttribute("label", "Save Specified Url");
    menuitem.setAttribute("accesskey", "U");
    menuitem.setAttribute("oncommand", "saveSpecifiedUrl.doSaveSpecifiedUrl();");
    let ref = document.getElementById("menu_sendLink");
    ref.parentNode.insertBefore(menuitem, ref);
  },

  doSaveSpecifiedUrl: function() {
    var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                        .getService(Components.interfaces.nsIPromptService);
    var check = {value: false};               // default the checkbox to false
    var input = {value: ""};                  // default the edit field to Bob
    var result = prompts.prompt(null, "Save Specified Url", "Please Input a URL?", input, null, check);
    // result is true if OK is pressed, false if Cancel. input.value holds the value of the edit field if "OK" was pressed.
    if (!result)
      return;

    var url = input.value;
    if (!url)
      return;

    saveURL(url, null, null, true, false, null, null,
            PrivateBrowsingUtils.isWindowPrivate(window),
            Services.scriptSecurityManager.createNullPrincipal({}));
  }
}


saveSpecifiedUrl.init();
