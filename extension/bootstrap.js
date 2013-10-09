/*
 *  This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this
 *  file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 *  Contributor(s):
 *  - LouCypher (original code)
 */

const { classes: Cc, interfaces: Ci, utils: Cu } = Components;

Cu.import("resource:///modules/devtools/gcli.jsm");
Cu.import("resource://gre/modules/Services.jsm");

/** for future use
Cu.import("resource://gre/modules/AddonManager.jsm");
Cu.import("resource://gre/modules/FileUtils.jsm");
Cu.import("resource://gre/modules/NetUtil.jsm");
Cu.import("resource://gre/modules/PlacesUtils.jsm");
Cu.import("resource://gre/modules/PrivateBrowsingUtils.jsm");
var Application = Cc["@mozilla.org/fuel/application;1"].getService(Ci.fuelIApplication);
**/

var mozcmd = {
  anim: {
    name: "anim",
    description: "Change image animation mode.",
    params: [
      {
        name: "mode",
        type: {
          name: "selection",
          data: ["normal", "once", "none"]
        },
        description: "Animation mode."
      }
    ],
    returnType: "string",
    exec: function(args, context) {
      Services.prefs.setCharPref("image.animation_mode", args.mode);
      return "Animation mode is set to '" + prefs.getCharPref(prefname) + "'";
    }
  },

  chkupd: { // Check for updates
    name: "chkupd",
    description: "Check " + Services.appinfo.name + " for updates.",
    params: [
      {
        name: "option",
        type: "string",
        defaultValue: null,
        description: "notes: open release notes; changeset: open changeset;\
                      history: show update history; no parameter: check for updates"
      }
    ],
    returnType: "string",
    exec: function(args, context) {
      function openURL(aURL) {
        let chromeWin = context.environment.chromeWindow ||
                        context.environment.chromeDocument.defaultView;
        chromeWin.switchToTabHavingURI(aURL, true);
      }

      let um = Cc['@mozilla.org/updates/update-manager;1'].getService(Ci.nsIUpdateManager);
      let option = args.option;

      if (option === "notes") {
        let relNotesURL;
        if (um.getUpdateAt(0))
          relNotesURL = um.getUpdateAt(0).detailsURL;

        if (!relNotesURL)
          return "No release notes.";

        if (/mozilla.com/.test(relNotesURL))
          relNotesURL = relNotesURL.replace(/mozilla.com/, "mozilla.org");

        openURL(relNotesURL);
      }

      else if (option === "changeset") {
        let req = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Ci.nsIXMLHttpRequest);
        req.open("GET", "about:buildconfig", false);
        req.send(null);
        let changeset = req.responseText.match(/http:\/\/hg.mozilla.org\/[^\"]*/);
        if (!changeset)
          return "No changeset on this release.";
        
        openURL(changeset);
      }

      else if (option === "history") {
        if (!um.getUpdateAt(0))
          return "No updates installed yet.";
        
        openURL("chrome://mozapps/content/update/history.xul");
      }

      else {
        let prompter = Cc['@mozilla.org/updates/update-prompt;1'].createInstance(Ci.nsIUpdatePrompt);
        if (um.activeUpdate && um.activeUpdate.state === "pending")
          prompter.showUpdateDownloaded(um.activeUpdate);
        else
          prompter.checkForUpdates();
      }
    }
  },

  cssreload: {  // CSS reload
    name: "cssreload",
    description: "Reload CSS on current page.",
    exec: function(args, context) {
      // @name      CSS Reloader
      // @author    Kenneth Auchenberg
      // @url       https://github.com/auchenberg/css-reloader
      // @license   Creative Commons Attribution 3.0 Unported License

      let contentDoc = context.environment.document || context.environment.contentDocument;
      let elements = contentDoc.querySelectorAll("link[rel=stylesheet][href]");
      for (let i = 0; i < elements.length; i++) {
        let element = elements[i];
        let h = element.href.replace(/[?&]cssReloader=([^&$]*)/, "");
        element.href = h + (h.indexOf("?") >= 0 ? "&" : "?") + "cssReloader=" + (new Date().valueOf());
      }
    }
  },

  darken: {
  /*
      Based on 'Global - Pseudo Brightness Control' userstyle
      http://userstyles.org/styles/45663
      by luckymouse
      http://userstyles.org/users/14255
      License under Public Domain Dedication 
      http://creativecommons.org/publicdomain/zero/1.0/
  */
    name: "darken",
    description: "Darken content area.",
    params: [
      {
        name: "Dark level",
        type: {
          name: "number",
          min: 0,
          max: 100,
        },
        defaultValue: 15,
        description: "0 = normal; 100 = pitch dark"
      }
    ],
    exec: function(args, context) {
      let darkLevel = args["Dark level"];
      if (darkLevel < 0) darkLevel = 0;
      if (darkLevel > 100) darkLevel = 100;

      let opacity = 0;
      if (darkLevel === 50)
        opacity = darkLevel / 100;
      else
        opacity = (100 - darkLevel) / 100;

      let browser = context.environment.chromeDocument.getElementById("browser");
      let gBrowser = context.environment.chromeDocument.getElementById("content");
      if (opacity === 1 || gBrowser.style.opacity === opacity.toString()) {
        browser.style.backgroundColor = "";
        gBrowser.style.opacity = "";
      }
      else {
        browser.style.backgroundColor = "black";
        gBrowser.style.opacity = opacity;
      }
    }
  },

  escape: {
    name: "escape",
    description: "Escape string and copy the result to clipboard.",
    params: [
      {
        name: "string",
        type: "string",
        defaultValue: null,
        description: "String to escape. If no parameter specified, escape current URL."
      }
    ],
    returnType: "string",
    exec: function(args, context) {
      let contentWin = context.environment.window || context.environment.contentDocument.defaultView;
      let string = args.string;
      if (!string)
        string = contentWin.location.href;
      let escaped = encodeURIComponent(string);
      let clipboardHelper = Cc["@mozilla.org/widget/clipboardhelper;1"].
                            getService(Ci.nsIClipboardHelper);
      clipboardHelper.copyString(escaped);
      return escaped;
    }
  },

  unescape: {
    name: "unescape",
    description: "Unescape string and copy the result to clipboard.",
    params: [
      {
        name: "string",
        type: "string",
        description: "String to unescape."
      }
    ],
    returnType: "string",
    exec: function(args, context) {
      let string = args.string;
      let unescaped = decodeURIComponent(string);
      let clipboardHelper = Cc["@mozilla.org/widget/clipboardhelper;1"].
                            getService(Ci.nsIClipboardHelper);
      clipboardHelper.copyString(unescaped);
      return unescaped;
    }
  },

  jsenabled: {
    name: "jsenabled",
    description: "Toggle enable/disable JavaScript.",
    params: [
      {
        name: "reload",
        type: "boolean",
        description: "Reload current document."
      }
    ],
    returnType: "string",
    exec: function(args, context) {
      let contentWin = context.environment.window || context.environment.contentDocument.defaultView;
      let prefname = "javascript.enabled";
      let prefs = Services.prefs;
      let jsEnabled = prefs.getBoolPref(prefname);
      prefs.setBoolPref(prefname, !jsEnabled);
      if (args.reload)
        contentWin.location.reload();
      return "JavaScript is " + (!jsEnabled ? "enabled" : "disabled") + ".";
    }
  },

  locale: {
    name: "locale",
    description: "Change browser language.",
    params: [
      {
        name: "langID",
        type: "string",
        defaultValue: null,
        description: "Language ID. Enter `locale default` to use default locale."
      }
    ],
    returnType: "string",
    exec: function(args, context) {
      let prefname = "general.useragent.locale";  // See AMO warning below
      /*
        AMO warning from add-on validator:
        ---
        Potentially unsafe preference branch referenced
        Warning: Extensions should not alter preferences in this preference branch
        ---
        I couldn't find another way to change browser locale without using preferences
      */
      let prefs = Services.prefs;
      let msgPrefix = "Browser language: '";
      let msgSuffix = "'";
      let lang = args.langID;
      if (lang) {
        switch (lang) {
          case "default":
            prefs.clearUserPref(prefname);
            msgSuffix = "' (default)";
            break;
          default:
            prefs.setCharPref(prefname, args.langID);
        }
        msgPrefix = "Browser language changed to '";
      }
      return msgPrefix + prefs.getCharPref(prefname) + msgSuffix;
    }
  },

  vs: { // view source
    name: "vs",
    description: "View HTML source of current page or a specified URL.",
    params: [
      {
        name: "url",
        type: "string",
        defaultValue: null,
        description: "Web page URL to view its source. If no URL is entered,\
                      view source of current page."
      }
    ],
    exec: function(args, context) {
      let environment = context.environment;
      let contentDoc = environment.document || environment.contentDocument;
      let chromeWin = environment.chromeWindow || environment.chromeDocument.defaultView;

      let url;
      if (args.url)
        url = args.url;
      else
        url = contentDoc.location.href;

      if (!/^[a-z0-9]+:/i.test(url))
        url = "http://" + url;  // Use 'http' by default

      chromeWin.switchToTabHavingURI("view-source:" + url, true);
    }
  },

  vrs: {  // view rendered source
    name: "vrs",
    description: "View rendered source of current page.",
    exec: function(args, context) {
      let environment = context.environment;
      let contentDoc = environment.document || environment.contentDocument;
      let chromeWin = environment.chromeWindow || environment.chromeDocument.defaultView;

      let domSerializer = Cc["@mozilla.org/xmlextras/xmlserializer;1"].
                          createInstance(Ci.nsIDOMSerializer);
      let source = domSerializer.serializeToString(contentDoc);
      let isHTML = contentDoc.createElement("div").tagName === "DIV";
      let contentType = isHTML ? "text/html" : "application/xml";
      let dataURI = "data:" + contentType + ";charset=utf-8" + ","
                  + encodeURIComponent(source);
      chromeWin.switchToTabHavingURI("view-source:" + dataURI, true);
    }
  },

  whois: {
    name: "whois",
    description: "Whois lookup using DomainTools web service.",
    params: [
      {
        name: "domain",
        type: "string",
        defaultValue: null,
        description: "Domain name to lookup. If no domain specified, lookup current web site."
      }
    ],
    //returnType: "string",
    exec: function(args, context) {
      let environment = context.environment;
      let contentWin = environment.window || environment.contentDocument.defaultView;
      let chromeWin = environment.chromeWindow || environment.chromeDocument.defaultView;

      let hostname;
      if (!args.domain)
        hostname = contentWin.location.hostname;
      else
        hostname = args.domain;

      if (!hostname) {
        return contentWin.location.protocol + " scheme is not supported.";
      }

      let eTLDsvc = Services.eTLD;
      let eTLD, URI = Services.io.newURI("http://" + hostname, null, null);
      try {
        eTLD = eTLDsvc.getBaseDomain(URI);
      } catch (ex) {
        eTLD = URI.asciiHost;
      }
      chromeWin.switchToTabHavingURI("http://whois.domaintools.com/" + eTLD, true);
      //return eTLD;
    }
  },

  winsize: {
    name: "winsize",
    description: "Resize browser window. If no parameters entered, display current window size.",
    params: [
      {
        name: "width",
        type: "number",
        defaultValue: null,
        description: "Browser width"
      },
      {
        name: "height",
        type: "number",
        defaultValue: null,
        description: "Browser height"
      },
      {
        name: "center",
        type: "boolean",
        description: "Center window on screen"
      }
    ],
    returnType: "string",
    exec: function(args, context) {
      let environment = context.environment;
      let chromeWin = environment.chromeWindow || environment.chromeDocument.defaultView;
      let chromeDoc = environment.chromeDocument;
      let browserWin = chromeDoc.documentElement;
      let screen = chromeWin.screen;

      function centerScreen() {
        chromeWin.moveTo((screen.availWidth  - browserWin.width)  / 2,
                         (screen.availHeight - browserWin.height) / 2);
      }

      let width = args.width, height = args.height, center = args.center;
      if (width && height) {
        chromeWin.resizeTo(width, height);
        if (center)
          centerScreen();
        return "Resized to " + width + "x" + height;
      }

      if (center)
        centerScreen();

      switch (chromeWin.windowState) {
        case 3: // normal
          return browserWin.width + "x" + browserWin.height;
        case 1: // maximized
          return browserWin.clientWidth + "x" + browserWin.clientHeight;
      }
    }
  }
}

function startup(data, reason) {
  for (let i in mozcmd)
    gcli.addCommand(mozcmd[i]);
}

function shutdown(data, reason) {
  for (let i in mozcmd)
    gcli.removeCommand(mozcmd[i]);
}

function install(data, reason) {
}

function uninstall(data, reason) {
}
