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

/** unused for now
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
      let prefname = "image.animation_mode";
      let prefs = Services.prefs;
      prefs.setCharPref(prefname, args.mode);
      return "Animation mode is set to '" + prefs.getCharPref(prefname) + "'";
    }
  },

  chkupd: { // check for updates
    name: "chkupd",
    description: "Check " + Services.appinfo.name + " for updates.",
    exec: function(args, context) {
      let um = Cc['@mozilla.org/updates/update-manager;1'].getService(Ci.nsIUpdateManager);
      let prompter = Cc['@mozilla.org/updates/update-prompt;1'].createInstance(Ci.nsIUpdatePrompt);
      if (um.activeUpdate && um.activeUpdate.state === "pending")
        prompter.showUpdateDownloaded(um.activeUpdate);
      else
        prompter.checkForUpdates();
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

      let document = context.environment.document || context.environment.contentDocument;
      let elements = document.querySelectorAll("link[rel=stylesheet][href]");
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
        description: "0 = normal; 100 = pitch black. Default = 15"
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
      let win = context.environment.window || context.environment.contentDocument.defaultView;
      let string = args.string;
      if (!string)
        string = win.location.href;
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
      let win = context.environment.window || context.environment.contentDocument.defaultView;
      let prefname = "javascript.enabled";
      let prefs = Services.prefs;
      let jsEnabled = prefs.getBoolPref(prefname);
      prefs.setBoolPref(prefname, !jsEnabled);
      if (args.reload)
        win.location.reload();
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
      let document = environment.document || environment.contentDocument;
      let chromeWindow = environment.chromeWindow || environment.chromeDocument.defaultView;

      let url;
      if (args.url)
        url = args.url;
      else
        url = document.URL;

      if (!/^[a-z0-9]+:/i.test(url))
        url = "http://" + url;  // Use 'http' by default

      chromeWindow.switchToTabHavingURI("view-source:" + url, true);
    }
  },

  vrs: {  // view rendered source
    name: "vrs",
    description: "View rendered source of current page.",
    exec: function(args, context) {
      let environment = context.environment;
      let document = environment.document || environment.contentDocument;
      let chromeWindow = environment.chromeWindow || environment.chromeDocument.defaultView;

      let doctypeElem = "";
      let doctype = document.doctype;
      if (doctype) {
        doctypeElem += "<!DOCTYPE " + doctype.name;
        doctypeElem += doctype.publicId ? (' PUBLIC "' + doctype.publicId + '"') : "";
        doctypeElem += doctype.systemId ? (' "' + doctype.systemId + '"') : "";
        doctypeElem += ">\n";
      }
      let source = doctypeElem + document.documentElement.outerHTML;
      let isHTML = document.createElement("div").tagName === "DIV";
      let contentType = isHTML ? "text/html" : "application/xml";
      let dataURI = "data:" + contentType + ";charset=utf-8" + ","
                  + encodeURIComponent(source);
      chromeWindow.switchToTabHavingURI("view-source:" + dataURI, true);
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
    returnType: "string",
    exec: function(args, context) {
      let environment = context.environment;
      let content = environment.window || environment.contentDocument.defaultView;
      let window = environment.chromeWindow || environment.chromeDocument.defaultView;

      let hostname;
      if (!args.domain)
        hostname = content.location.hostname;
      else
        hostname = args.domain;

      if (!hostname) {
        return content.location.protocol + " scheme is not supported.";
      }

      let eTLDsvc = Services.eTLD;
      let eTLD, URI = Services.io.newURI("http://" + hostname, null, null);
      try {
        eTLD = eTLDsvc.getBaseDomain(URI);
      } catch (ex) {
        eTLD = URI.asciiHost;
      }
      window.switchToTabHavingURI("http://whois.domaintools.com/" + eTLD, true);
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
      let window = environment.chromeWindow || environment.chromeDocument.defaultView;
      let document = environment.chromeDocument;
      let browserWin = document.documentElement;
      let screen = window.screen;

      function centerScreen() {
        window.moveTo((screen.availWidth  - browserWin.width)  / 2,
                      (screen.availHeight - browserWin.height) / 2);
      }

      let width = args.width, height = args.height, center = args.center;
      if (width && height) {
        window.resizeTo(width, height);
        if (center)
          centerScreen();
        return "Resized to " + width + "x" + height;
      }

      if (center)
        centerScreen();

      switch (window.windowState) {
        case 3: // normal
          return browserWin.width + "x" + browserWin.height;
        case 1: // maximized
          return browserWin.clientWidth + "x" + browserWin.clientHeight;
      }
    }
  }
}

function startup(data, reason) {
  for (var i in mozcmd)
    gcli.addCommand(mozcmd[i]);
}

function shutdown(data, reason) {
  for (var i in mozcmd)
    gcli.removeCommand(mozcmd[i]);
}

function install(data, reason) {
}

function uninstall(data, reason) {
}
