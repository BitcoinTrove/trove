# Description

Trove is a tool for securing bitcoin. You can try Trove at https://bitcointrove.github.io/

## Development

### NPM scripts

|                       Command | Description                                                                                                                | Server | Hot reloading | Loc injection | Compression |
| ----------------------------: | :------------------------------------------------------------------------------------------------------------------------- | ------ | ------------- | ------------- | ----------- |
|                 `npm run dev` | Creates a development build (multiple files in dist directory). Created share files will not contain everything they need. | Yes    | Yes           | No            | No          |
|             `npm run release` | Creates a release build (single html file) and puts it in the release directory.                                           | No     | NA            | Yes           | Yes         |
|      `npm run release-hosted` | Creates a release build and hosts it on localhost.                                                                         | Yes    | No            | Yes           | Yes         |
| `npm run release-unlocalized` | Creates a release build (single html file) and puts it in the release directory.                                           | No     | NA            | No            | No          |

### Debug mode

Add `?debug=true` to enable the debug options. All debug options and information is displayed with dashed borders.

If no parameter is set:

- dev builds default to debug on
- release builds default to debug off

### Development build

In development builds:

1. debug mode defaults to on.
2. Entropy type defaults to browser.
3. Dependency list is not injected

### Injecting data

It is useful to mock the data in the page, so you can develop on the access wizard (or anything else that requires data from the page).
This can be done using the `?data=` query parameter. The data to be injected is the json which is printed to the console when you open a share file. You can also access this data through the UI when debug mode is on.

#### Example steps

1. Use a release build to create shares
2. Open a share with `?debug=true` and copy the share data
3. Open Trove on the dev server with `?data=<your_data>`

### Other query parameters

1. Test actions directly: `?masterSeed=<masterSeedInHex>&network=<bitcoin|testnet>&addressStrategy=<single|multiplePrinted>`

### Localization

Localization works on the single built html file to produce another file with the localization injected.
Calls to localize(string) are replaced with localize(number) and the text is stored in a global variable.
[cheerio.js](https://cheerio.js.org/) is used to parse the html file and find the script elements.
[Recast](https://github.com/benjamn/recast) is used to parse the javascript and replace the localize() method calls.

To add new English text, use the localize() function in the code.
To localize new text, after adding it to the code, run a release build which will populate the localization files with the null value. The null can be changed to the localized text. You shouldn't add the new english text to the localization files. Rather use the build process to do it.
To add a new locale, add an empty json file with the locale name to the localization directory. Run a release build to populate the file with null content. Replace the nulls with real content.

Locale is set using `?locale=<en,etc.>`. For development you can set `?locale=uppercase` to make all localized text uppercased. This is helpful to find text which has not been wrapped in the localize function.
The `?locale` query parameter does not work on the dev server, except for the `?locale=uppercase` scenario.

Locales that begin with "fake\_" will be populated with fake localization text. You may need to run a release build twice. First time populates the files, second time uses them. Any markup in the text will get destroyed.

Flat .txt files are created for each locale. This is for convenience if you wish to run a spell checker or grammer checker on the text.

### Build analysis

[parcel-plugin-bundle-visualiser](https://github.com/gregtillbrook/parcel-plugin-bundle-visualiser) is used to analyze the size of the build. It runs automatically on release builds. The report is saved to dist/report.html

### Common issues

- Why am I getting "ENOENT: no such file or directory"?

  I've seen this happen when a file is renamed (normally from .ts to .tsx). I was able to fix this by doing 'npm cache clean --force && rm -rf .cache' or 'npm run enoent' for short.

### Testing

There are only a few automated tests to serve as a reference. Headless browser testing needs investigation.

To run all tests use `npm run test`
To run a single test use `npm run test <test_to_run>`

#### Manual browser testing

Test that in older browsers (ie11 etc.) a "unsupported browser" error is shown.

Test in latest Chrome, Firefox, Edge:

- Use the "Create a copy" link and verify that the copy has the same checksum
- Verify downloaded address image has correct filename
- Verify downloaded address image has QR code in the image
- Verify downloaded address file has correct filename
- Verify downloaded address file has correct address in the text file
- Verify that the copy to clipboard button actually copies the address
- Verify shares have correct filenames
- Verify that revealing works with digital shares only
- Verify that revealing works with at least one paper share
- Verify that revealing works with only paper shares - no password
- Verify that revealing works with only paper shares - with password
- Verify that random file cannot be used as digital share and error is shown
- Verify that a digital share for another reference cannot be used and an error is shown
- Verify that digital shares have the correct instruction message
- Verify that paper shares have the correct instruction message
- Verify that digital shares have the correct reveal message
- Verify that message signing works - a signature appears when message is entered
- Verify that a PSBT can be signed successfully
- Verify that the "Create a copy" on the share files, create copies with the correct checksum
- Verify that the About page opens and the "back home" buttons work
- Verify that the Version Info page opens and the "back home" buttons work
- Verify that the donatation address (In Version Info) changes when the browser reloads
- Verify that when using a password, it appears on the templates and user is prompted to fill it in
- Verify that when not using a password, it does not appear on the templates and user is not prompted to fill it in.
- Verify that coins send to a single address strategy can be sent out again
- Verify that coins send to a multiple address strategy can be sent out again

## Release instructions

(WIP)

1. Bump the version number in version.ts, package.json and package-lock.json
2. Run the automated tests `npm run test`
3. Create a release build `npm run release`
4. Perform manual browser tests
5. Sign the build `npm run gpg-sign-release`
6. Verify the signature `npm run gpg-verify-release`
7. Create an open timestamp of trove.html at https://opentimestamps.org/
8. Push to github pages (trove.html, trove.html.sig, trove.ots)
9. Download Trove from github pages `curl --socks5-hostname 127.0.0.1:9150 https://bitcointrove.github.io/index.html -o /tmp/trove.html`
10. Download signature from github pages `curl --socks5-hostname 127.0.0.1:9150 https://bitcointrove.github.io/trove.html.sig -o /tmp/trove.html.sig`
11. Verify files match `sha256sum release/trove.html /tmp/trove.html`
12. Verify files match `sha256sum release/trove.html.sig /tmp/trove.html.sig`
13. Verify signature `gpg --verify /tmp/trove.html.sig /tmp/trove.html`
14. Finished

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
