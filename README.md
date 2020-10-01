## Overview
Welcome to the AL Language extension for Microsoft Dynamics 365 Business Central.

NOTE: To deploy code built using this extension you need to sign up for a [Dynamics 365 Business Central Sandbox tenant](https://aka.ms/getsandboxforbusinesscentral)

With this extension, you can write extensions for Dynamics 365 Business Central in the AL language with full support for formatting, syntax highlighting, and rich IntelliSense.

This extension includes:

- Editing support through IntelliSense (Ctrl+Space), syntax highlighting, and formatting
- Typing AL:Go! in the command palette (Ctrl+Shift+P) easily gets you started with your first AL extension
- Support for and snippets to define Codeunits, Control Addins, Pages, Page Customizations, Page Extensions, Profiles, Queries, Reports, Tables, Table Extensions, and XmlPorts
- Support for find all references (Shift+F12) to list all instances of a specific symbol
- Incremental compilation with diagnostics appearing in the **Problems** window while working
- Added native support for using HTTP and JSON types to access Azure functions and other Web Services
- Using Ctrl+F5 to deploy to the current development instance and using F5 to deploy and debug
- Ability to define a dependency on another extension by listing it in the app.json configuration file
- Autogeneration of app.json and launch.json project files
- Using Ctrl+Alt+F5 to perform rapid application development(RAD) and using Alt+F5 to perform RAD and debugging

NOTE: The AL Language extension and the AL compiler ship with English (en-US) as the display language. The display language is used for the display text for the commands contributed by the extension as well as for all diagnostic messages emitted by the compiler.

## Documentation
Read more about developing in AL in our documentation here: https://docs.microsoft.com/en-us/dynamics365/business-central/dev-itpro.

## Support
If you encounter bugs with the extension, ensure you have the latest version of Visual Studio Code before reporting them through GitHub [https://github.com/microsoft/al/issues](https://github.com/microsoft/al/issues).

## License and Privacy
The extension is made available under the following [Microsoft Software License Terms](https://go.microsoft.com/fwlink/?linkid=2138588) and the following [Microsoft Enterprise and Developer Privacy Statement](https://go.microsoft.com/fwlink/?linkid=2138587).

### Telemetry
The AL Language extension collects telemetry data, which is used to help understand how to improve the product. For example, this data helps to debug issues, such as compiler crashes, slow compilation times, and to prioritize new features.

The extension respects the Visual Studio Code setting for [telemetry reporting](https://code.visualstudio.com/docs/getstarted/telemetry). While we appreciate the insights this data provides, we also know that not everyone wants to send usage data and you can disable telemetry as described in [disable telemetry reporting](https://code.visualstudio.com/docs/getstarted/telemetry#_disable-telemetry-reporting).