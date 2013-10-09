## Commands

[anim](#anim) |
[chkupd](#chkupd) |
[cssreload](#cssreload) |
[darken](#darken) |
[escape](#escape) |
[jsenabled](#jsenabled) |
[locale](#locale) |
[tabsontop](#tabsontop) |
[unescape](#unescape) |
[vs](#vs) |
[vrs](#vrs) |
[whois](#whois) |
[winsize](#winsize)

### anim
Change image animation mode.

Syntax: `anim <mode>`

where `mode`:

* `normal`: animated images will play as normal
* `once`: animated images will play once
* `none`: animated images will never play

### chkupd
Check browser for updates.

Syntax `chkupd [option]`

where `option`:

* `notes` or `n`: open release notes
* `changeset` or `c`: open changeset
* `history` or `h`: show update history

If no option specified, check for updates.

### cssreload
Reload CSS on current page.

No parameter.

Code from [cssreloader.js](https://github.com/auchenberg/css-reloader/blob/master/firefox/src/chrome/content/cssreloader.js) by [Kenneth Auchenberg](https://github.com/auchenberg/).  
License: [Creative Commons Attribution 3.0 Unported License](http://creativecommons.org/licenses/by/3.0/)

### darken
Darken content area.

Syntax: `darken [dark level]`

where `dark level`: `0` - `100`

* `0`: normal
* `100`: pitch dark
* default: `15`

Based on [Global - Pseudo Brightness Control](http://userstyles.org/styles/45663) userstyle by [luckymouse](http://userstyles.org/users/14255).  
License: [Public Domain Dedication ](http://creativecommons.org/publicdomain/zero/1.0/)

### escape
Escape string or URL and copy the result to clipboard.

Syntax: `escape [string or URL]`

If no parameter specified, escape the URL of current page.

### jsenabled
Toggle enable/disable JavaScript.

Syntax: `jsenabled [reload]`

where `reload` (optional): Reload current document.

### locale
Change browser interface language.

Syntax: `locale [language code]`

If no language code specified, display current locale.

### tabsontop
Toggle Tabs on Top.

No parameter.

### unescape
Unescape string and copy the result to clipboard.

Syntax: `unescape <string>`

### vs
View source of current page or a specified URL.

Syntax: `vs [URL]`

If no URL specified, view source of current page.

### vrs
View rendered source of current page.

No parameter.

### whois
Whois lookup using DomainTools web service.

Sytax: `whois [domain]`

If no domain specified, lookup current web site.

### winsize
Resize browser window.

Syntax: `winsize [<width> <height>] [center]`

where:

* `width`: window width
* `height`: window height
* `center`: center window on screen

If no parameter specified, display current window size.
