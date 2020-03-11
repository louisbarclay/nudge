This project is built using vanilla JavaScript. It's a Node.js project because various Node.js modules are used to set up the dev environment. However the JavaScript of the extension itself all lives in the extension/js folder and is vanilla, with the exceptions of using the two libraries that are included in the extension/js/vendor folder.

HTML and CSS in the extension are compiled from .sass and .pug files. This means that to efficiently contribute to the HTML and CSS parts you have to make sure to get set up using yarn.

$ yarn install

Then, to run the dev environment - which basically watches the aforementioned .sass and .pug files - run:

$ yarn dev

Note: no need to run yarn dev if you're only tweaking JS.

To run your local version of Nudge in your browser, use Chrome's developer tool 'Load unpacked extension' and select the extension folder.

I recommend using an extension reloading extension like this one, with a keyboard shortcut enabled, to make developing more efficient:

https://chrome.google.com/webstore/detail/extensions-reloader/fimgfedafeadlieiabdeeaodndnlbhid?hl=en
