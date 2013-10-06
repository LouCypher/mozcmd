/*
 *  This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this
 *  file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 *  Contributor(s):
 *  - LouCypher (original code)
 */


const { classes: Cc, interfaces: Ci, utils: Cu } = Components;

Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource:///modules/devtools/gcli.jsm");

function startup(data, reason) {
/*

  gcli.addCommand({
  })

*/

  // anim
  gcli.addCommand({
    name: "anim",
    description: "Change image animation mode.",
    params: [
      {
        name: "mode",
        type: "string",
        defaultValue: null,
        description: "Animation mode (normal, once or none)."
      }
    ],
    returnType: "string",
    exec: function(args, context) {
      let prefname = "image.animation_mode";
      let prefs = Services.prefs;
      switch (args.mode) {
        case "": break;
        case "normal":
        case "once":
        case "none":
          prefs.setCharPref(prefname, args.mode);
          break;
        default:
          return "Syntax: anim [normal | once | none]";
      }
      return "Animation mode is '" + prefs.getCharPref(prefname) + "'";
    }
  })

  // check for updates
  gcli.addCommand({
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
  })

  // cssreload
  gcli.addCommand({
    name: "cssreload",
    description: "Reload CSS on current page.",
    exec: function(args, context) {
      // @name      CSS Reloader
      // @author    Kenneth Auchenberg
      // @url       https://github.com/auchenberg/css-reloader
      // @license   Creative Commons Attribution 3.0 Unported License

      let elements = context.environment.document.querySelectorAll("link[rel=stylesheet][href]");
      for (let i = 0; i < elements.length; i++) {
        let element = elements[i];
        let h = element.href.replace(/[?&]cssReloader=([^&$]*)/, "");
        element.href = h + (h.indexOf("?") >= 0 ? "&" : "?") + "cssReloader=" + (new Date().valueOf());
      }
    }
  })

  // darken
  /*
      Based on 'Global - Pseudo Brightness Control' userstyle
      http://userstyles.org/styles/45663
      by luckymouse
      http://userstyles.org/users/14255
      License under Public Domain Dedication 
      http://creativecommons.org/publicdomain/zero/1.0/
  */

  gcli.addCommand({
    name: "darken",
    description: "Darken content area.",
    params: [
      {
        name: "Dark level",
        type: "number",
        defaultValue: 15,
        description: "0 = normal; 100 = pitch black. Default = 15",
      }
    ],
    exec: function(args, context) {
      Services.prefs.clearUserPref("darken.data"); // Remove old prefs

      let darkLevel = args["Dark level"];
      if (darkLevel < 0) darkLevel = 0;
      if (darkLevel > 100) darkLevel = 100;

      let opacity = 0;
      if (darkLevel === 50)
        opacity = darkLevel / 100;
      else
        opacity = (100 - darkLevel) / 100;

      let browser = context.environment.chromeDocument.getElementById("browser"),
         gBrowser = context.environment.chromeWindow.gBrowser;
      if (opacity === 1 || gBrowser.style.opacity === opacity.toString()) {
        browser.style.backgroundColor = "";
        gBrowser.style.opacity = "";
      }
      else {
        browser.style.backgroundColor = "black";
        gBrowser.style.opacity = opacity;
      }
    }
  })

  // escape
  gcli.addCommand({
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
      let string = args.string;
      if (!string)
        string = context.environment.window.location.href;
      let escaped = encodeURIComponent(string);
      let clipboardHelper = Cc["@mozilla.org/widget/clipboardhelper;1"].
                            getService(Ci.nsIClipboardHelper);
      clipboardHelper.copyString(escaped);
      return escaped;
    }
  })

  // unescape
  gcli.addCommand({
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
  })

  // locale
  gcli.addCommand({
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
      let prefname = "general.useragent.locale";
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
  })

  // view source
  gcli.addCommand({
    name: "vs",
    description: "View HTML source of current document or a specified URL.",
    params: [
      {
        name: "url",
        type: "string",
        defaultValue: null,
        description: "Web page URL to view its source. If no URL is entered,\
                      view source of current document."
      }
    ],
    exec: function(args, context) {
      let url;
      if (args.url)
        url = args.url;
      else
        url = context.environment.document.URL;

      if (!/^[a-z0-9]+:/i.test(url))
        url = "http://" + url;  // Use 'http' by default

      context.environment.chromeWindow.switchToTabHavingURI("view-source:" + url, true);
    }
  })

  // whois
  gcli.addCommand({
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
      let content = context.environment.window;
      let window = context.environment.chromeWindow;

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
  })

  // winsize
  gcli.addCommand({
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
      let window = context.environment.chromeWindow;
      let document = context.environment.chromeDocument;
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
  })
}

function shutdown(data, reason) {
  ["anim", "cssreload", "chkupd", "darken", "escape", "locale", "unescape", "vs", "whois", "winsize"].
  forEach(function(cmd) {
    gcli.removeCommand(cmd);
  })
}

function install(data, reason) {
}

function uninstall(data, reason) {
}
