This project is built using vanilla JavaScript. It's a Node.js project because various Node.js modules are used to set up the dev environment. However the JavaScript of the extension itself all lives in the extension/js folder and is vanilla, with the exceptions of using the three libraries that are included in the extension/js/vendor folder.

## Contribute to the app UI (HTML & CSS)

HTML and CSS in the extension are compiled from .sass and .pug files. This means that to efficiently contribute to the HTML and CSS parts you have to make sure to get set up using yarn.

$ yarn install

Then, to run the dev environment - which watches the aforementioned .sass and .pug files - run:

$ yarn dev

Note: no need to run yarn dev if you're only tweaking JS.

## Running the extension

To run your local version of Nudge in your browser, use Chrome's developer tool 'Load unpacked extension' and select the extension folder.

I recommend using an extension reloading extension like this one, with a keyboard shortcut enabled, to make developing more efficient:

https://chrome.google.com/webstore/detail/extensions-reloader/fimgfedafeadlieiabdeeaodndnlbhid?hl=en

## Contributing to blocker definitions

Definitions of website setions to be hidden (called "hidees" in the app) come from a [main Google spreadsheet](https://docs.google.com/spreadsheets/d/1Y-xQb1qRgnicD_0M-8REXKbSPi4lnsQW7lqUqh52fiw/edit#gid=0).

When developing, these definitions are synced by a [Node.js script](https://github.com/louisbarclay/nudge/blob/master/extension/js/background/sync-hidees.js) which is started by `yarn dev` (see previous section). They are then continuously written into a static file bundled into the extension code ([hidees.js](https://github.com/louisbarclay/nudge/blob/master/extension/js/vars/hidees.js)). This means the extension always comes with some pre-installed definitions.

These definitions can be outdated quickly however, and between extension updates, the extension also [checks for](https://github.com/louisbarclay/nudge/blob/ef28da111287b11f1da7d96c38edd9023761f6e7/extension/js/background/sync-hidees.js) new definitions when the user starts a browser session.

If you want to add new site sections to block yourself, or fix broken definitions, you first need:
1. Your own Google Sheet that you can edit
2. A Google Sheets API key.

### 1. Your own Google Sheet

1. Be sure to have a Google Account 
2. Go to the [main sheet from Louis](https://docs.google.com/spreadsheets/d/1Y-xQb1qRgnicD_0M-8REXKbSPi4lnsQW7lqUqh52fiw/edit#gid=0)
3. File -> Make a copy...
4. Make your own sheet publicly visible by clicking Share -> change to "Anyone with the link"
5. Note the Sheet ID in the URL of your sheet `https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit`

### 2. Get a Google Sheets API key

1. Create a new [Google Cloud Console Project](https://console.cloud.google.com/)
2. Enable the Sheets API inside "APIs and Services" -> Library (or search for it)
3. Go to Credentials inside "APIs and Services" -> Credentials (or search for it)
3. Create an OAuth Consent Screen (even though you won't need to use it, you need to create it to be given the option of creating an API key)
4. Create an API Key
### 3. Set up the hidees syncing environment

1. Copy `.env.sample` to `.env`
2. Fill in your sheet ID in HIDEES_GOOGLE_SHEET (replace the sample) & fill your API key
3. Run `yarn dev`, which will also export your environment keys to a file inside the extension.