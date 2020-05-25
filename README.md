# Description

A tool for securing your bitcoin private key or seed. This is experimental software. It should not be trusted or used for any real world scenarios.

## Development

### NPM scripts

|                     Command | Description                                                                                                                                                                                                                  |
| --------------------------: | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|                 npm run dev | Creates a development build (multiple files in dist directory). Hot reloading works. Created share files will not contain everything they need. Localization is not injected. Bootstrapping and compression does not happen. |
|             npm run release | Creates a release build (single html file) and puts it in the release directory. Includes localization injection. Bootstrapping and compression takes place.                                                                 |
|      npm run release-hosted | Creates a release build and hosts it on localhost. No hot reloading. Includes localization, bootstrapping and compression.                                                                                                   |
| npm run release-unlocalized | Creates a release build (single html file) and puts it in the release directory. Localization is not injected.                                                                                                               |

### Injecting data

To develop on the reveal flow, it is useful to inject the share data into the page.
This can be done using the `?data=` query parameter. The data to be injected is the json which is printed to the console when you open a share file. You can also see this data in the UI when debug mode is on.

### Debug mode

Add `?debug=true` to see the following debug options:

1. Ability to select bitcoin mainnet
2. See entropyString during entropy generation
3. Use pseudo randomness for the manual entropy generation methods. Only available for testnet.
4. Peek at envelope data before downloading share files.

If no parameter is set:

- dev builds default to debug on
- release builds default to debug off

### Development build

In development builds:

1. debug mode defaults to on.
2. Entropy type defaults to browser.

### Other query parameters

1. `?masterSeed=<masterSeedInHex>&network=<bitcoin|testnet>`

### Localization

Localization works on the single built html file to produce another file with the localization injected.
Calls to localize(string) are replaced with localize(number) and the text is stored in a global variable.
cheerio.js (https://cheerio.js.org/) is used to parse the html file and find the script elements.
Recast (https://github.com/benjamn/recast) is used to parse the javascript and replace the localize() method calls.

To add new English text, use the localize() function in the code.
To localize new text, after adding it to the code, run a release build which will populate the localization files with the null value. The null can be changed to the localized text. You shouldn't add the new english text to the localization files. Rather use the build process to do it.
To add a new locale, add an empty json file with the locale name to the localization directory. Run a release build to populate the file with null content. Replace the nulls with real content.

Locale is set using `?locale=<en,etc.>`. For development you can set `?locale=uppercase` to make all localized text uppercased. This is helpful to find text which has not been wrapped in the localize function.
The locale query parameter only works on release builds (not in dev), except for the `?locale=uppercase` scenario.

Locales that begin with "fake\_" will be populated with fake localization text. You may need to run a release build twice. First time populates the files, second time uses them. Any markup in the text will get destroyed.

Flat .txt files are created for each locale. This is for convenience if you wish to run a spell checker or grammer checker on the text.

### Build analysis

parcel-plugin-bundle-visualiser (https://github.com/gregtillbrook/parcel-plugin-bundle-visualiser) is used to analyze the size of the build. It runs automatically on release builds. The report is saved to dist/report.html

### Common issues

Why am I getting "ENOENT: no such file or directory"?
I've seen this happen when a file is renamed (normally from .ts to .tsx). I was able to fix this by doing 'npm cache clean --force && rm -rf .cache' or 'npm run enoent' for short.

### Testing

There isn't enough automated testing. There are only a few tests which are to serve as a reference.

To run all tests use `npm run test`
To run a single test use `npm run test <test_to_run>`

#### Manual integration testing

Test in older browsers (ie11) to ensure that shares load (even though they are not usable)

Test in latest Chrome and Firefox:

- Use the "Copy this tool" button and verify that the copy has the same checksum
- Verify downloaded address image has correct filename
- Verify downloaded address image has QR code in the image
- Verify downloaded address file has correct filename
- Verify downloaded address file has correct address in the text file
- Verify that the copy to clipboard button actually copies the address
- Verify shares have correct filenames
- Verify that revealing works with digital shares only
- Verify that revealing works with at least one paper share
- Verify that random file cannot be used as digital share and error is shown
- Verify that a digital share for another reference cannot be used and an error is shown
- Verify that digital shares have the correct instruction message
- Verify that paper shares have the correct instruction message
- Verify that digital shares have the correct reveal message
- Verify that message signing works - a signature appears when message is entered
- Verify that a PSBT can be signed successfully
- Verify that the "Copy this tool" on the share files, create copies with the correct checksum
- Verify that the About page opens and the "back home" buttons work
- Verify that the Licenses page opens and the "back home" buttons work
- Verify that the Donate button pops up a QR code, reloading the browser changes the QR code
- Verify that when using a password, it appears on the templates and user is prompted to fill it in
- Verify that when not using a password, it does not appear on the templates and user is not prompted to fill it in.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
