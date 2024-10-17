In /Excel, run `npm run build` to build the Excel add-in.

In the `webpack.config.js` file, you can change the `urlDev` and `urlProd` variables to your desired development and production URLs.

When the webpack build starts, it will automatically build with a manifest.xml file that is configured for whichever mode you choose.

In the manifest.xml, the URLs that should be automatically replaced by webpack, depending on the mode, are highlighted with a <!-- Webpack Replace --> comment.

### How Office Add-ins Work

Essentially, the manifest.xml file is the core of the add-in. It tells Office what the add-in is, and most importantly, the _urls_ that the add-in needs to access.

If you run `npm run build`, the `manifest.xml` file will be built with the `urlDev` variable. The resulting `/dist` folder will contain all the files needed to run the add-in. You can serve this /dist folder anywhere as a server, and just make sure the URLs in the manifest.xml file are correct for where you're serving the add-in from.

### For Local Development

If you want the add-in running locally in Excel, but also access a local instance of the FastAPI/python workers, you **must** find a way to access the local fastAPI server via https. You must also add that domain to the `<AppDomains>` section of `manifest.xml`.
