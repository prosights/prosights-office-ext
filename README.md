In /Excel, run `npm run build` to build the Excel add-in.

In the `webpack.config.js` file, you can change the `urlDev` and `urlProd` variables to your desired development and production URLs.

When the webpack build starts, it will automatically build with a manifest.xml file that is configured for whichever mode you choose.

In the manifest.xml, the URLs that should be automatically replaced by webpack, depending on the mode, are highlighted with a <!-- Webpack Replace --> comment.
