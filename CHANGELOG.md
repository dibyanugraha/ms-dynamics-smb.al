# Business Central 2021 release wave 1 update 1
## Version 7.1
For this update there are bug fixes and changes around a few different areas.

### Snapshot debugging
Snapshot debugging allows recording built-in codeunit based stack traces if there is a snappoint defined in the al file containing the subscription to the built-in code unit trigger event.

### Reports extensions
* Parameters and captions are now supported report layouts in report extensions
* Debugging supported added for report extension
* Added support for modify on dataitems with a set of triggers to go along with it.
* There were a couple of issues around adding dataitems into the correct position, which caused layouts to not work correctly.
* The checks for duplicate usage of identical names did not catch all cases.

### Built-in functions and types
* [#6568](https://github.com/microsoft/al/issues/6568). The deprecation warning has been removed from UploadIntoStream
* [#6570](https://github.com/microsoft/al/issues/6570). The type ModuleInfo now contains a PackageId.
* If the StartSession with the timeout was to be used, it required a record and company. That has been changed so they are not required.

### Go to Definition
* When a package has ShowMyCode set to false, then the editor will show a generated view from the symbol information available. That has been improved to include more objects.


# Business Central 2021 release wave 1 update
## Version 7.0.0
### Report Extensibility
We have introduced `reportextension` objects to the language that allows extension of report objects. Some of the operations that can be performed are:
* Adding new dataitems to the base report's dataset
* Adding new columns to a base report's dataitem
* Extending the request page (e.g. adding new fields)
* Defining additional report triggers
* Defining additional request page triggers
* Defining additional layouts that will be made available for the base report
Use the `treportextension` snippet to get started!

### Return complex types from methods
We now allow complex types to be returned from methods. This includes user-defined types like codeunits and records, but also most built-in types. The syntax is similar to variable/parameter declarations.

```
procedure GetCustomerByName(Name: Text) Customer: record Customer;
begin
end;

procedure GetHttpClient(): HttpClient;
begin
end;
```

### Permission sets and permission set extensions
With this release we now support defining permission sets in AL objects. Among the benefits are
* Deployed as metadata and hence easy to update
* Easy to read source format
* Support for IntelliSense, comments, navigation, and diagnostics

The new permission set objects are extensible. An existing permission set can be extended with additional permissions to easily grant more access to users that already are assigned the permission set.

Use the `tpermissionset` or `tpermissionsetextension` snippet to get started!

### OnAfterLookup trigger
We have added a new trigger on page fields with `TableRelation` properties to support scenarios where you in code want to set others fields based on the selected record.

```AL
field(ItemNo; Rec.No)
{
    trigger OnAfterLookup(Selected: RecordRef)
    var
        Item: record Item;
    begin
        Selected.SetTable(Item);
        Rec.Description := Item.Description;
    end;
}
field(ItemDescription; Rec.Description)
{
    TableRelation = Item.Description;

    trigger OnAfterLookup(Selected: RecordRef)
    var
        Item: record Item;
    begin
        Selected.SetTable(Item);
        Rec.ItemNo := Item."No.";
    end;
}
```

The OnAfterLookup trigger supports split-relations.

### Interface Obsoletion
Interfaces can now be obsoleted using `ObsoleteState`, `ObsoleteReason`, and `ObsoleteTag`.
For interface procedures, the obsolete reason and tag can be specified in the `Obsolete` attribute: `[Obsolete(<Reason>,<tag>)]`

### Support for Access Property on Enums and Interfaces.
It is now possible to mark Enums and Interfaces as `internal` to a module.

### Control if locked labels should generate translation entries
When the "TranslationFile" setting is enabled, a template file with labels that can be sent for translation is generated. In previous versions, labels marked with `Locked = true` would be included in the template file, but marked so that they would be excluded from translation. With this change, these entries will no longer, by default, be included. If the flag `GenerateLockedTranslations` is added to the feature list in the app.json file, however, these entries are generated.

### Added cross-reference information generation
Compiling from the command line using the /generatecrossreferences or /xref option generates DGML and JSON files containing a serialized representation of the cross-reference graph.
DGML files can be loaded in Visual Studio for advanced visualizations and manipulation using the Code Map feature.


### Improvements to the AppSourceCop analyzer

As a continuation of the previous releases, we improved existing AppSourceCop code analyzer rules based on partner feedback and added new ones covering additional scenarios. More information can be found in our [online documentation](https://docs.microsoft.com/en-us/dynamics365/business-central/dev-itpro/developer/analyzers/appsourcecop). We also introduced a new configuration setting to specify a dedicated folder for the baseline packages to be used for breaking changes validation. For more information, see [AS0003](https://docs.microsoft.com/en-us/dynamics365/business-central/dev-itpro/developer/analyzers/appsourcecop-as0003-previousversionnotfound) and [AS0091](https://docs.microsoft.com/en-us/dynamics365/business-central/dev-itpro/developer/analyzers/appsourcecop-as0091-previousversiondependencynotfound).

# Business Central 2020 release wave 2 update 5
## Version 6.5
### Bugs fixed
* Fixed an issue which caused some labels and captions to not be translated in a dedicated language extension.
* Error "Constant value XXX is outside of the valid ordinal range for this Enum type" is no longer thrown when using an extended enum field with ValuesAllowed property.

# Business Central 2020 release wave 2 update 4
## Version 6.4
### Bugs fixed
* Add a message to sandbox publishing that extensions which have been published from Visual Studio Code are removed when the environment is updated or relocated within our service.
* Set compatibility for NavigationPageId and Multiplicity to 6.3. Github issue: https://github.com/microsoft/AL/issues/6436
* Use DropDown instead of Dropdown. Github issue: https://github.com/microsoft/AL/issues/6428
* Interface implementation validation sometimes falsely logs an error if a member is already implemented.
* Use of obsolete page variables are not showing warnings when used as variables.
* Full diagnostics are sometimes not reported when .NET types are included.
* Fixed report column decimal places format. Github issue: https://github.com/microsoft/AL/issues/5880
* Fix compatibility definition of certain properties. Github issue: https://github.com/microsoft/AL/issues/6368
* Fixed naming of XMLPort. https://github.com/microsoft/AL/issues/6304
* Add equivalence between Visual Studio Code 'Start Debugging' command and al.publish, respectively 'Run without Debugging' command and al.publishNoDebug command.
* 'Trigger Parameter Hint' (Ctrl+Shift+Space) command is not working. Github issue: https://github.com/microsoft/AL/issues/6379
* Support for variables larger then 1 Kb on the debug console.

# Business Central 2020 release wave 2 update
## Version 6.0.0
### SnapshotDebugger
We have introduced the ability to record AL execution on a Business Central server, also called snapshot debugging. To do snapshot debugging, you must be a delegated admin and part of the "D365 Snapshot Debug" permission group. When the AL execution has ended, you can download the recorded snapshot file and debug it with the new snapshot debugger in Visual Studio Code.
F7 will initialize a snapshot debugging session, Shift+F7 provides status such as when the end-user connects to the Business Central server using the client and then if a snapshot debugging request was saved for that user, the user's AL code in the specific client session will be recorded, and Alt+F7 ends snapshot debugging on the Business Central server and produces a debuggable snapshot file.
In connection with this addition, please note that the existing “al.downloadsource” command for F7 has been remapped to Alt+F6.

### Debugging Upgrade and Install code
It is now possible to debug upgrade and install codeunits. A new command "Publish extension without building" has been introduced that will allow for apps to be published while debugging. To debug upgrade or install code, first initiate an attach debug session. After the debugger has attached, invoke the new command or use Ctrl+F5 to publish the app file. If the version of the app has not been incremented, install codeunits will be invoked. If the version of the app has been incremented, or the `forceUpgrade` flag has been set to `true` in the `launch.json` file, upgrade codeunits will be invoked.

### Indication of overloads in IntelliSense.
IntelliSense now includes the number of additional overloads together with the signature of the first method. Selecting the method allows you to browse through the different overloads.

### Global warning suppression from app.json and the alc command-line
Warnings can be suppressed globally using the "suppressWarnings" option in the app.json file. The option takes a list of warning IDs as argument.

```
"suppressWarnings": [ "AL0604", "AA0215" ]
```
We also support global warning suppression from the alc command-line using the the /nowarn switch.

### Captions for OData
With this release we have added a new attribute Caption that can be applied to procedures that are ServiceEnabled or defined in an API page. It makes it possible to provide translations in the OData metadata for procedures. Furthermore, we have added two new properties EntityCaption and EntitySetCaption that enable providing different translations for entities.

### Documentation Comments
With this release we support documentation comments for AL similar to C#. Documentation comments are structured comments preceded with a three slashes (///) instead of the usual two slashes (//). The documentation comment a special syntax that contains XML text. The documentation comment must immediately precede a user-defined type that it annotates, for example a codeunit, table, or interface, or a member such as a field or method.
There is IntelliSense support for writing documentation comments. Most importantly providing a template documentation comment when writing the third slash in the triple slash.
Documentation comments are visible when hovering over source symbols, in completion lists, and in signature help.
Improve your source code by adding documentation comments.

### Preprocessor directives
AL now supports three types of preprocessor directives
* Conditional directives (conditional compilation)
* Regions (expand/collapse regions of code)
* Pragmas (disable/enable warnings and implicitwith)

### Improvements to the AppSourceCop and its documentation

Since the release of Business Central 2020 release wave 1, we have been working on the AppSourceCop code analyzer. We gathered the feedback we received on existing rules in order to improve them and create a more reliable experience. We have also added new rules covering aspects that were previously missing and improved our [online documentation](https://docs.microsoft.com/en-us/dynamics365/business-central/dev-itpro/developer/analyzers/appsourcecop) to be contain more examples and actionable information.

# Business Central 2020 release wave 1 update
## Version 5.0.0
### AL Interfaces
We have introduced the interface concept in AL which allows developers to apply polymorphism and code against abstraction. Codeunits can implement multiple interfaces by adding the ´implements´ keyword and a list of all the implemented interfaces to the codeunit declaration. Intelisense suggests you a list of available interfaces. We have added a code action which adds the missing members of an interface to the implementer codeunit.
We also introduced AppSourceCop rules to detect any breaking changes. Adding, deleting, or modifying a procedure in an interface might break the implementers of your interface. AppSourceCop generates an appropriate error for each case.

### Enum implements interfaces
We have added interface support to enums where an enum can implement multiple interfaces and set a default implementer codeunit for each of them. An enum value assigned to an interface variable can initialize the interface.

### Debugger changes
We have added support to view values of Lists and Dictionaries in the debugger.
We have simplified the evaluation of array index expressions in a watch window. Until now the NAV debugger evaluation syntax was used in a watch window for an array index expression, like array."[1]" . Now array[1] would also evaluate.
We have extended the support on hovering for evaluation when debugging. Both parts of a simple non-composed member access expression would evalute. We also
support hovering on quoted identifiers.
An example is when hovering on "My Customer Rec" and also "No." would evaluate on an expression like "My Customer Rec"."No."

### Workspace changes
We have added support for goto definition when multiple launch configurations are defined for a project. A new (per workspace folder) setting is defined called
al.defaultConfigurationName which is going to be used to resolve the server name in scenarios that involve multiple configurations and the need to request information from a server.
We have fixed the issue that Al projects cannot coexist with other project types in a workspace.

### Specifiying the data access intent of objects

You can now choose to run selected reports, queries, and web service calls on a read-only replica of the database. This way, analytical workloads will not have any impact on the primary database.

The Page, Report, and Query objects now have a property called `DataAccessIntent` that can take the values `ReadOnly` or `ReadWrite`. This property works as a hint for the server, which will connect to the secondary replica if possible. When a workload is executed against the replica, insert/delete/modify operations are not possible for ReadOnly objects.

### Object obsoletion tag

On top of the `ObsoleteState` and `ObsoleteReason` properties, it is now possible to specify an additional free-form text to support tracking of where and when the object was marked as obsolete, for example, branch, build, or date of obsoleting the object. This can be done through the `ObsoleteTag` property on AL objects.
For procedures and variables, the obsolete tag can be specified as an optional parameter in the `Obsolete` attribute: `[Obsolete(<Reason>,<tag>)]`.

### Select the intial state of repeater controls displayed as trees

We introduced the ability to specify the initial state of the records in repeater controls displayed as a tree structure in the web client by using the `TreeInitialState` property.
They can now be either fully expanded (`ExpandAll`) or fully collapsed (`CollapseAll`). This property can be modified in the web client and changes can be persisted using the designer.

### Declare multiple variables in the same declaration

Variable declarations of the same type can now be a comma-separated list of variable names. This improves readability of the code by allowing variables of the to be grouped together and thereby reducing the number of lines.

### New tool to generate CDS/CRM proxy tables

We have added a new command-line tool `altpgen.exe` to generate .al proxy tables for CDS/CRM. This tool replaces the `New-NAVCrmTable` powershell cmdlet. The new tool and the runtime supports extending an existing CDS/CRM table with additional fields through a tableextension.

### .NET Core runtime
With this release, we have switched from running the language server on the .NET Framework runtime to running it on the .NET Core 3.0 runtime.
This switch has allowed us to take advantage of the many [performance improvements made in .NET Core 3.0](https://devblogs.microsoft.com/dotnet/performance-improvements-in-net-core-3-0/) and has resulted in drastically improving the compilation time.
You can fallback to the legacy .NET Framework runtime by setting `al.useLegacyRuntime` to `true`. You must restart Visual Studio Code before the option will take effect.

### Support for "application" reference
You can now use the `application` property in your extension's manifest to express a dependency on an extension called `Application`. This allows you to remove direct dependencies on Microsoft's `Base Application` and "System Application" and to enable your extension to compile against any extension called `Application`.

### Support for propagated dependencies
You can use the `propagatedDependencies` manifest option to specify whether the dependencies of this project should be propagated as direct dependencies of projects that depend on this one. Default is false. If set to true then any dependencies of the current package will be visible to consumers of the package. For example, if A depends on B that depends on C, by default, A will not be able to use types defined in C. If B has "propagateDependencies" : "true", then A will be able to use types defined in C without taking a direct dependency.

### Fine-tune the behavior of the language server
The AL compiler and language server provide, by default, multiple productivity features such as background compilation, IntelliSense, Go to Definition, Find All References, and much more. All these features require additional computational resources and they can be especially taxing when working on very large projects.
We have added the following options to fine-tune the behavior of the language server:
```
"al.compilationOptions": {
        "parallel": true,
        "delayAfterLastDocumentChange": 800,
        "delayAfterLastProjectChange": 4000,
        "maxDegreeOfParallelism": 2
}
```

By default, the language server uses as many threads as the system allows to compile your solution. You can also control the number of threads that the language server uses by using the option `al.compilationOptions.maxDegreeOfParallelism`. Setting this to a higher value will use a higher number of threads, while lower values will use a lower number of threads.
By setting the `al.compilationOptions.parallel` option to `false` you will instruct the language server to use a single thread.
The `al.compilationOptions.delayAfterLastDocumentChange` and `al.compilationOptions.delayAfterLastProjectChange` options can be used to trade-off compiler responsiveness for resource consumption. Setting these options to higher values will increase the delay between when a change is made in Visual Studio Code and when the compiler processes it while reducing resource consumption.

### Launch queries from Visual Studio Code
You can now run queries when you publish an AL project (F5 and Ctrl+F5) from Visual Studio Code. Simply modify the launch.json file of the project to include the `"startupObjectType" = "query"` and `"startupObjectId" = "<QueryID>"` settings, replacing <QueryID> with the ID of the query that you want to run.

### Support for Microsoft Edge Beta
We have added support for launching the Microsoft Dynamics 365 Business Central Web Client in the Microsoft Edge Beta internet browser from Visual Studio Code.
This feature can be enabled by setting `al.browser` to `EdgeBeta` in your settings.

# Business Central 2019 release wave 2 update

## Version 4.0.0

Welcome to version 4.0.0! We are finally out of the Developer Preview stage, and this comes with a lot of new features.

### AL:Go! Version Selection

The AL:Go! command now allows you to choose which version of Business Central you wish to target. Because Business Central 4.0 comes with changes in how the Base Application is structured, AL:Go! seamlessly takes care of setting up the correct dependencies for extension development based on your target environment.

### Access Modifiers

We have added access modifiers to the AL language. Access modifiers can be used to specify access to language elements to facilitate encapsulation.

- Codeunits, Tables, and Queries can be marked as internal to the extension by specifying `Access = Internal` property.
- Procedures can now also be marked as internal or protected similar to the existing local keyword.
- Global variables can be marked as protected.
- Table fields can be marked as internal, protected, or local.

The different access modifiers are defined as:

- `Public` is accessible to all.
- `Internal` is only accessible from within the same extension.
- `Protected` is only accessible within the defining object and object extensions to the same object.
- `local` is only accessible from within the same object.

It is possible to grant access to internals to referencing extensions by specifying them in the internalVisibleTo section of the app.json file.

### Object Obsoletion

We have added the capability to mark most objects and members for obsoletion. The following can be made obsolete by specifying the `ObsoleteState = Pending` property. Optionally, the `ObsoleteReason = 'Reason'` property can also be specified to provide a more detailed warning message to users of the object.

- Codeunit
- Enum
- EnumValue
- Page
- PageAction
- PageActionArea
- PageActionGroup
- PageActionSeparator
- PageArea
- PageChartPart
- PageField
- PageGroup
- PageLabel
- PagePart
- PageSystemPart
- Query
- QueryColumn
- QueryDataItem
- QueryFilter
- Report
- ReportColumn
- ReportDataItem
- RequestPage
- XmlPort

The following can also be made obsolete by specifying the `[Obsolete(<Reason>)]` attribute:

- Procedure
- Variable

If an object marked for obsoletion is used, this will trigger a compiler warning that specifies the reason for obsoletion (if provided).

### Multiple sandboxes

Sometimes a single sandbox isn't enough, so with the opportunity to create sandboxes it is now possible in the launch.json file to specify which sandbox the extension should be installed to, simply by adding the parameter "SandboxName".

### Translate other extensions using Xliff

Translating objects outside the extension was possible before using .txt files but the support for that has been removed in favor of using Xliff files.
Take the generated xliff file of the extension that you want to change and translate it.
In the root of the extension, create a directory named "Translations" and place the translated xliff there.
Now publish the extension and make sure to change the language in 'My Settings' to see the new translations in the UI.

### Working in a workspace with projects and project references
We have added support for working with project references within a work space and also the ability to publish sets of changed projects that are in a dependency relation within a work space.
A project reference in a work space is a project that is defined as a dependency in the app.json file for a given project.
No UI semantics are presented for a project reference, like in Visual Studio. There is no need to download symbols to reolve project references.
They will be resolved from within the work space. Example: Assuming that one works with a Test project referencing a base project, if one adds a method to Base it should be immediately seen in TestProject(s).
One does not need to build the base for this.
Publishing within Visual Studio Code has also changed a lot. We now have the possibility to publish changed dependency sets. Dependency sets are packaged in *.dep files. We consider a project changed if it is RAD changed; meaning that a project is considered changed if it has at least one application object that is part of the RAD file or will be part of the RAD file, had it been built. When a publishing operation is requested all changed projects within a dependency set are published. Example if you work in a TestProject and change TestProject and then change Base then both will be packaged and published. RAD publishing obeys dependency set publishing. In the scenario above if you RAD publish TestProject with Base changed both will be RAD published.

### Attaching to the next BC session
We have added support to attach to the next BC session from Visual Studio Code.
We support attaching to a web client, background, and web API sessions for on-premise deployments and only web API for sandbox-based deployments. We also support debugging the new async page background tasks.
In order to get started one needs to first create an attach configuration. We have created two predefined templates that can be chosen from, one to create an attach configuration for sandboxes, and one for on-premise.
The attach configuration contains a breakOnNext enum that will determine which next client session the debugger will attempt to attach to. Pressing F5 will start an attach debugging session, if an attach configuration is selected. The first session type that has been specified in the breakOnNext enum will break on the breakpoints specified in Visual Studio Code. Only the user who has started an attach session in Visual Studio Code can later be attached to a session executing on the server.

### New profile capabilities

We introduced new properties on profiles to support translating them in AL. You can now use the properties Caption/CaptionML to specify a user-friendly name for the profile and use Description/DescriptionML to add some more information about the profile.

You can also decide whether your profile is by default proposed to end-users in 'My Settings' using the `Enabled` property and whether it should contribute to the Role Explorer by setting the `Promoted` property.

Discover the new profile capabilities by using the snippet `tprofile`.

### Improving the Navigation bar of your Role Center

It is now possible to extend the navigation bar of your profile's Role Center from page customizations. This is done by adding a new actions in the Sections or Embedding area of the page customization applied on your Role Center.

```
profile MyProfile
{
    Caption = 'My Business Manager Profile';
    RoleCenter = "Business Manager";
    Customizations = MyRoleCenterCustomization';
}

pagecustomization MyRoleCenterCustomization customizes "Business Manager"
{
    actions
    {
        addfirst(Embedding)
        {
            action(NewNavigationAction)
            {
                RunObject = page MyNewPage;
            }
        }
    }
}
```

While it was only possible to run List Pages from the actions defined in the Navigation bar, it is now also possible to run any type of Pages, Codeunits, Reports, and XmlPorts.

### SharedLayout for Views

As part of the April ‘19 release, we introduced a new model for creating page views, offering a simple way to define alternative views of list pages using filtering and sorting of the records, but also layout changes.

In order to offer more flexibility and design different experiences for end-users, it is now possible to specify whether a view shares the same layout than the base page or defines its own layout.

By setting the `SharedLayout` property of your view to true, your view follows the layout of the base page (`All`, in the web client) and any user personalization made on `All` or any of the views marked with SharedLayout are applied on the view.

On the other hand, by setting the `SharedLayout` property to false, the view defines its own layout and is independent from all other views. The view is detached. Any changes coded in the layout sections are applied in the view. User personalization made on the page are not applied on that view.

You can get snippets for both types of views by writing `tview`.

### Upgrade DEV extensions from VS Code

As part of this release, it's now possible to upgrade your developer extensions from Visual Studio Code. If you have an extension installed with version `1.0.0.0` and publish another version of this extension where the version is higher than `1.0.0.0`, the extension will be upgraded. This allows you to test your upgrade procedures using the developer endpoint, and gives you a faster feedback loop for testing your extension compared to, for example, testing upgrade through the management client. The extension upgrade will only be triggered if you don't use schema update mode `Recreate`. If you use `Recreate`, your old extension will be uninstalled and your new one will be installed.

### Symbol Searching now supports searching by ID

When using `Ctrl+T` in Visual Studio Code with the `#` character prefix, you can now search for objects by their ID in your AL projects. This enables you to faster navigate your codebase and hopefully will increase your productivity when developing AL extensions.


# Business Central April ‘19 update (2019/04)

## February 2019 update
Welcome to the February edition of the Developer Preview. The biggest announcement this month is that we are publishing a preview of the base application fully on AL language.

There is a new Docker image, which contains this version here: `bcinsider.azurecr.io/bcsandbox-master:14.0.28630.0-al`. Currently this image is not automatically refreshed. We will manually push new images with the country code `al` (and new version number) until we have a process in place to do this for all country codes. If you do not have bcinsider credentials, please reach out to dyn365bep@microsoft.com. Please note that:
- The upcoming April ‘19 2019 release of Business Central is still based on C/AL and C/SIDE, as communicated at Directions Fall 2018 and other events. This means that, just like now, on-premise code customization is done in C/AL and C/SIDE, whereas extensions for on-prem or SaaS are authored in AL and Visual Studio Code.
- The AL Docker Preview is exactly that, a peek into the future.
- The fact that the AL preview image has version 14.0 is just because the preview is an auto-generated AL version of the C/AL master code repository for the upcoming C/AL April ‘19 release which is version 14. Once we have branched internally for April ‘19, future AL preview images will be version 15. There will not be an official AL version of the application for the April ‘19 release.

Having the base application fully converted to AL means that it is one big extension with almost 6000 files. To make it easier to work with such a big extension we've developed a series of features.

### Rapid Application Development (RAD)

RAD is a C/SIDE term used for changing an application object, compiling it, and seeing the results instantaneously in the client.

We have tried to replicate a similar experience for extension development in AL Language in VS Code. More specifically it is about publishing only the AL objects that changed since the last full publish took place. This is especially useful when working on large projects with several thousands of objects.

We will use the terms "incremental publish" and "RAD publish" or just "RAD" interchangeably.
We have introduced two new commands for doing incremental publishing/debugging. These are:
- **Ctrl+Alt+F5** for incremental publish
- **Alt+F5** for incremental publish and invoking debugging

Please note that:
- You need an app to be fully published at least once before you can use incremental publish for the same app.
- You cannot change the version, publisher, and name of the app if you do an incremental publish
- If things fail for incremental publishing you would need to do a full publishing (Ctrl+F5) before using the RAD features again.
- A tracking file (rad.json) that captures which files have changed for the purposes of incremental build and publish is created and updated on any developer action that involves a build process for anything that involves a build (not Save and this is by design), like build (Ctrl+Shift+B), or any of the deployment or debugging tasks.
- A RAD published file will not contain the following files that are normally packaged during regular publishing:
    - translation files,
    - permissions files,
    - custom word and report rdlc layout files,
    - table data, and
    - web service definition.
- RAD does not replace full publishing.

### New schema update mode - ForceSync
In this release we've added a new data schema synchronization mode. It’s very similar to the existing ‘Synchronize’ schema update mode but with more freedom to make schema changes while retaining data:
- In the launch.json file, set the parameter `schemaUpdateMode` to `ForceSync`
- Keep your current  app version
- Iterate knowing the sync process will let you do everything while preserving data in all of your unchanged tables and fields

Data will be preserved in almost all cases. The only exception is changing the main table's Primary Key in which case the data from the extension tables will be lost.

Field renames are allowed and supported in this mode, but the data can only be preserved if you maintain the same ID. If you change both the name and the ID of the field than data will be lost.

Please note that this schema update mode is only meant for testing/development and should never be used in production.

The new mode is exposed both through the `schemaUpdateMode` setting in launch.json in VS Code as well as through the powershell cmdlet (`Sync-NavApp –Mode ForceSync`).

### Debug without publishing
A new command has been added - Ctrl+Shift+F5 - which will start the debugger attached to the Visual Studio Code launched client session.

Please be aware that if you start debugging without publishing you will be debugging the last published code of your app.

Firefox has also been added to the list of supported browsers that will open a client for a VS Code debugging session.

### Debugger info for HTTP, JSON etc

![Debugger Objects](https://community.dynamics.com/cfs-file/__key/communityserver-blogs-components-weblogfiles/00-00-00-16-25/DebuggerObjects.png)

Variable value inspection has been added for:
- HttpClient, HttpRequestMessage, HttpResponseMessage, HttpHeaders
- JsonValue, JsonToken, JsonObject, JsonArray
- XmlElement, XmlDocument, XmlNode, XmlText, XmlComment, XmlCData, XmlAttribute

### Code actions
Code Actions is a VS Code feature providing the user with possible corrective actions right next to an error or warning. If actions are available, a light bulb appears next to the error or warning. When the user clicks the light bulb (or presses Ctrl+.), a list of available Code Actions is presented. We introduced the extensible framework to provide the actions feature support in AL. There are two code actions available in the current version:
- Multiple IF to CASE converting code action
- Spell check code action.

### TableRelation extensibility
The TableRelation property on table fields can now be modifed in a table extension. The modifications to the TableRelation is additive and are evaluated after the existing value. The primary use case is conditional table relations based on conditional enums. For example, in one app a table is defined like below:

```
enum 50120 TypeEnum
{
    Extensible = true;

    value(0; Nothing) { }
    value(1; Customer) { }
    value(2; Item) { }
}


table 50120 TableWithRelation
{

    fields
    {

        field(1; Id; Integer) { }
        field(2; Type; enum TypeEnum) { }
        field(3; Relation; Code[20])
        {

            TableRelation =
            if (Type = const (Customer)) Customer
            else if (Type = const (Item)) Item;
        }

    }
}
```

Another app could then extend both the enum and modify the table relation to also handle the extended enum with the code below:

```
enumextension 50133 TypeEnumExt extends TypeEnum
{
    value(10; Resource) { }
}



tableextension 50135 TableWithRelationExt extends TableWithRelation
{
    fields
    {

        modify(Relation)
        {
            TableRelation = if (Type = const (Resource)) Resource;
        }
    }
}
```

The combined table relation is evaluated top-down. That means that the first unconditional relation will prevail, i.e. you cannot change an existing TableRelation from Customer to Item, since the original table relation is unconditional.

### Views
Views offer a way to improve user productivity when working with list pages by proposing an alternative view of the page that contains:
- Filtering of the data on multiple table fields.
- Sorting of the data on multiple table fields (but only in one direction: ascending/descending).
- Layout changes in the Content area: modifying page columns, moving them, etc.

#### Defining views in AL
Unlike V1 views which were defined as part of the RoleCenter, V2 views in AL are now defined on the list page itself.  Views are defined in a dedicated views section that contains an ordered list of views.

Note:  You can use IntelliSense and the `tview` snippet in order to help you get started!

![Views](https://community.dynamics.com/cfs-file/__key/communityserver-blogs-components-weblogfiles/00-00-00-16-25/views_5F00_1.png)

Views are also integrated in the extension model. It is then possible to create, re-order, or modify views in a page extension or in a page customization. With the version, you get the development story for creating views, later the end-user will be able to create views using Designer.

![View](https://community.dynamics.com/cfs-file/__key/communityserver-blogs-components-weblogfiles/00-00-00-16-25/view_5F00_2.png)

#### Filtering and sorting
Filtering in views is achieved by using the new property Filters. The property syntax is similar to the other properties you can use to apply filtering on a page in AL (like SourceTableView on a page, or RunPageView on an action).

The syntax is composed of a where clause with a list of filters defined with a filter name, the equal sign, the type of filter and the filter value to be applied:

![Syntax filters](https://community.dynamics.com/cfs-file/__key/communityserver-blogs-components-weblogfiles/00-00-00-16-25/syntax_5F00_filters.png)

#### Ordering
Ordering is achieved by using the property OrderBy. The property syntax is similar to the OrderBy property that exists on a Query. It is used to specify one sorting direction on a set of table fields. Currently the language allows you to specify only one sorting direction.

![Syntax order by](https://community.dynamics.com/cfs-file/__key/communityserver-blogs-components-weblogfiles/00-00-00-16-25/syntax_5F00_orderby.png)

Note: The filters are applied on the table fields, not on the page fields. It is then possible to filter on a table field even if this table field is not shown in the page. However, if a page field has a variable as a source expression, it is not possible to use it.

#### Modifying the page layout
Views enable you to modify properties on page controls from the control area and/or moving them.

Views can be seen as a page customization embedded at the page level and that is triggered when pressed in the UI. As a consequence, the capabilities (but also the limitations) of a view are similar the ones of a page customization:
- It is not possible to create new controls for a page from a view.
- The control properties that are modifiable in a view are the same ones as the properties that are modifiable in a page customization independently of where the view has been defined (page, page extension, or page customization level).
- It is not possible to use variables or methods in a view. When writing client side expression for properties like Visibility, it will only be possible to use constant values or table field references.

#### Modifying views from extensions/customizations
Like action and controls, views can be moved using the moveafter, movefirst, movelast and movebefore constructs. It is also possible to modify the visibility of a view and to modify its caption. Those are the only two properties that are available for modification from extensions in a view. If a developer wants to modify a view's filter, the advised approach is for him to create his own copy of the view.

When modifying views from extensions, IntelliSense can also help you to know what you can do or not.

![Intellisense](https://community.dynamics.com/cfs-file/__key/communityserver-blogs-components-weblogfiles/00-00-00-16-25/intelli_5F00_views.png)

#### Visualizing Views in the Web client
V2 views are rendered below any V1 views in the filter pane of the Web client. They are always visible on the view page no matter how the page was accessed.

![Views in client](https://community.dynamics.com/cfs-file/__key/communityserver-blogs-components-weblogfiles/00-00-00-16-25/views_5F00_in_5F00_client.png)

### AllObj and AllObjWithCaption no longer contains obsolete Tables
The `AllObj` and `AllObjWithCaption` virtual tables no longer contains obsolete tables.

### Context Sensitive Help

It is now possible to define help links for new created Pages, Reports / XmlPorts in a more maintainable way using two new properties.

The first one , `contextSensitiveHelpUrl`, is a manifest property which defines the base URL to be used for all pages and request pages of the extension. The other one, `contextSensitiveHelpPage`, is defined on the object level and sepcifies the exact documentation resource to use. In case, the contextSensitiveHelpPage is not defined, the contextSensitiveHelpUrl will be used as default.

Example:

```
  "contextSensitiveHelpUrl": "https://www.mydocumentationwebsite.com/{0}/business-central/",
  "supportedLocales": [
       "da-DK"
  ]
```

```
page 50100 MyPage
{
    ContextSensitiveHelpPage = 'help-topic';
}
```

The help link for the page MyPage will then be: `https://www.mydocumentationwebsite.com/{0}/business-central/help-topic`.

This new feature also enables you to define specific help links for new controls added in a page extension:

```
pageextension 50100 MyPageExtension extends "Customer Card"
{
    ContextSensitiveHelpPage = 'about-extension';

    layout
    {
        field(MyField; 'New field') { }
    }
}
```

## December 2018 update
This December marks the two year anniversary of the very first AL Developer preview back in December 2016. And we want to use this opportunity to say "Thank you!" to all the partners that have dived into AL, installed the Visual Studio Code, and AL Language tools. We are now at 47K downloads, and an impressive 20K installs and the numbers keep growing. Thank you for providing us with feedback on GitHub, submitting Ideas, bugs, as well as enhancements to make the product even better. Some of your suggestions have already shipped in the product.

With this December preview we are mainly releasing bug fixes (closed bugs in December), as the whole team is working hard on the process of converting the base application to AL, improving tools performance when working with large projects and building the infrastructure pieces allowing us to eventually switch to working in AL on W1 and country versions of the base application. We still have a couple of new features, though, read more about these below.

We have lots of exciting news to come in the next year, so we encourage you to keep up the work and continue providing feedback. Please do, however, notice the recent change of feedback channels described here: https://community.dynamics.com/business/b/financials/archive/2018/12/04/find-the-right-resources-and-provide-feedback. To recap, the AL GitHub from now on only accepts bug reports related directly to AL and developer tools for Business Central insider builds. Bugs for shipped versions should go through support. App and event requests should go to: https://github.com/microsoft/ALAppExtensions and ideas to https://aka.ms/bcideas to allow other partners to vote for these.

This Developer Preview is available only through the Ready to Go program. Read more at http://aka.ms/readytogo. To get all fixes and features described in this blog post, please make sure that you are running an image with build number 26685 or newer.

### HttpClient support for Windows Authentication (NTLM)

In an on-premises environment, you can now use one of the two new methods introduced on the HttpClient to authenticate using Windows Authentication. You can decide if you either want to specify user name, password and optionally domain yourself or if you want to authenticate as the currently logged in user in Windows.

![Auth1](https://community.dynamics.com/cfs-file/__key/communityserver-blogs-components-weblogfiles/00-00-00-16-25/win_2D00_auth_2D00_1.png)

![Auth2](https://community.dynamics.com/cfs-file/__key/communityserver-blogs-components-weblogfiles/00-00-00-16-25/win_2D00_auth_2D00_2.png)

### Pruning dependencies for extensions created in the Designer

As part of the multiple bug fixes we did over the last month, we also worked on the extension dependency issue of the Designer. Until now, when creating a new extension from the Designer, the extension would take a dependency on all extensions installed on the server, even if it actually did not need all of them. It was then not possible to publish a new version of any of the extensions taken as dependency without uninstalling and re-installing the Designer extension. The upgrade process of tenants for our internal teams was also harder due to these extra dependencies created by Designer extensions.

We have now fixed the Designer in order to take a dependency only on the extensions that are actually needed. The fix is available in the daily deployments from our master branch, but also as part of the Fall 2018 CU2 release. If you haven't saved your Designer extension (by giving it a name and a publisher) and you want its dependencies to be pruned, just move one control, revert the change and it will be done automatically. If your Designer extension has been saved already, you need to update its dependencies manually in the app.json file from VS Code. We hope this will help you saving time developing, but also help us during the future upgrades of your tenants.

That was it for 2018. Happy holidays and best wishes for the year to come!

## November 2018 update

We are ready with the November update of the Developer Preview, our first blog post on the Dynamics 365 community blog, which is where you will find us going forward. So, make sure to bookmark it (it is currently best viewed using, for example, Edge as your browser). With this release, we bring you several new features that help building your solutions as extensions. Again this month we have fixed a large number of GitHub issues, see what's been closed here: closed bugs in November.

This Developer Preview is available only through the Ready to Go program. Read more at http://aka.ms/readytogo. To get all fixes and features described in this blog post, please make sure that you are running an image with build number 26070 or newer.

### AL GitHub
In the period since the Business Central Fall 2018 release until now we have focused primarily on bringing down the number of active issues on AL GitHub repo. We have reduced the backlog from close to 900 active issues down to ~320. This was achieved through a combination of delivering ~350 fixes in the November update, close follow up on any outstanding questions and input-needed issues as well as by process change.

 The process change is that AL GitHub from now on accepts only bug reports and feature requests related directly to AL and developer tools for Business Central insider builds. This means that:

 - Any application related inquiries or requests should be directed to https://github.com/microsoft/ALAppExtensions

 Any general questions should be directed to our support team or community forums:
 - [Business Central Community](https://community.dynamics.com/business/f/758)
 - [mibuso forum](https://forum.mibuso.com/categories/nav-three-tier)
 - [Dynamics User Group](https://dynamicsuser.net/nav/f/developers)

Any issues related to already released versions of the product should be directed to our support team. You can open Support Request to CSS through PartnerSource portal or contact your Service Account Manager (SAM) in the local subsidiary to understand what is included in your contract as of support incident and PAH (Partner Advisory Hours). Your SAM might also step by step direct you how to open a support request or how to get credentials if this is the first time for you/your company.

![GitHub issues activities](https://community.dynamics.com/cfs-file/__key/communityserver-blogs-components-weblogfiles/00-00-00-16-25/githubactiveissues.png)


### Option to avoid new session upon deployment with CTRL + F5
A new launch.json option has been introduced - launchBrowser. This property indicates whether or not to open a new session - a new tab in your browser - upon publishing your AL extension. If the value is not specified or set to true, the session is started. If the value is explicitly set to false, the session is not started unless you launch your extension in debugging mode.

![Launch browser](https://community.dynamics.com/cfs-file/__key/communityserver-blogs-components-weblogfiles/00-00-00-16-25/launchbrowser.png)

### .NET Control Add-Ins
Legacy .NET Control Add-Ins can be used from AL through .NET interoperability. This type of add-ins is only supported in the Windows client and going forward we recommend that you convert your existing .NET and Javascript add-ins to native AL controladdins.

Given the following stub definition of the "Microsoft.Dynamics.Nav.Client.PingPong" .NET add-in:

```
namespace Microsoft.Dynamics.Nav.Client.PingPong
{
    /// <summary>
    /// Add-in for pinging the server from the client. The client will respond with a pong.
    /// </summary>
    [ControlAddInExport("Microsoft.Dynamics.Nav.Client.PingPong")]
    public class PingPongAddIn : WinFormsControlAddInBase {…}

}
```

We add the type declaration in AL making sure to reference the full type name and to set the IsControlAddIn property to true:

```
dotnet
{
    assembly("Microsoft.Dynamics.Nav.Client.PingPong")
    {
        type("Microsoft.Dynamics.Nav.Client.PingPong.PingPongAddIn";PingPongAddIn)
        {
            IsControlAddIn = true;
        }
    }
}
```

We can now use it from a page as a native control add-in.
```
page 50100 MyPage
{
    layout
    {
        area(Content)
        {
            usercontrol(PingPongControl; PingPongAddIn)
            {
                trigger Pong()
                begin
                    Message('Pong received.');
                end;

                trigger AddInReady()
                begin
                    Message('Ready');
                end;
            }
        }
    }
}
```

If you have a native add-in and a .NET add-in with the same name, inside a project, the .NET add-in will be the one used.

### Testing Reports in AL
If you need to validate if a report produces correct data, you should use - Codeunit 131007 “Library - Report Dataset”. Extensions cannot use the file share as we used in the existing tests, so we need to save the reports to stream.

#### Usage
To initialize the class, you can use two methods:
- (Preferred) RunReportAndLoad – will run the report and initialize the Library - Report Data Set class
- LoadDataFromInStream – if you want to run the report separately and load the data in the instream manually
To verify the output you can use these two methods:
- AssertElementWithValueExists
- AssertElementWithValueNotExist
The other methods in the library should work as well as long as they do not contain “Tag” in the name.

#### Code Example

```
// Exercise: Run the Report Remittance Advice - Journal.
XmlParameters := REPORT.RUNREQUESTPAGE(REPORT::"Remittance Advice - Journal");

LibraryReportDataset.RunReportAndLoad(REPORT::"Remittance Advice - Journal",GenJournalLine,XmlParameters);

// Verify: Verifying Total Amount on Report.
LibraryReportDataset.AssertElementWithValueExists('Amt_GenJournalLine',GenJournalLine.Amount);

RUNREQUESTPAGE is optional, it may be used to control the request page parameters. You need to implement RequestPageHandler in this case:

[RequestPageHandler]
PROCEDURE RemittanceAdviceJournalRequestPageHandler@4(VAR RemittanceAdviceJournal@1000 : TestRequestPage 399);
BEGIN
// Empty handler used to close the request page. We use default settings.
END;
```

Any changes done in the handler above will result in the XmlParameters being changed and applied automatically when the report runs. Examples of the implementation in the existing tests can be found in  Codeunit 133770 and Codeunit 134141.

#### Technical details
TestRequestPage SaveAsXML is using a different format than REPORT.SAVEASXML or REPORT.SaveAs. The reason is that the TestRequestPage.SaveAsXML is serializing the output of Report Previewer. This component will be deprecated at some point in the future; the new methods should be used for new tests. TestRequestPage SaveAsXML requires files to be saved to disk and loaded, while other methods work in memory, thus they are more efficient.

Because we need to support the existing tests, the codeunit is supporting both formats for now. TestRequestPage SaveAsXML is using Tags for values, while the new format uses attributes. This means we cannot use any public method that contains Tag in the name to test the reports generated in the memory.


### AL Language Extension is now also supported on MacOS
Finally! After having been work in progress for more than 2 years, the distributed .vsix file is now supporting both Windows and MacOS.

The MacOS version contains the same functionality as the Windows version. There are, however, a few differences/limitations compared to the Windows version.
- Windows authentication is not supported.
- AAD authentication is using device login (http://aka.ms/DeviceLogin) to authenticate. The user experience is different. Instead of getting a login dialog, a notification window is shown in the lower right corner. The window shows the device login URL and the device code. Clicking the 'Copy and Open' button will place the code on the clipboard and open a browser on the device login page.

![DeviceLoginPopup](https://community.dynamics.com/cfs-file/__key/communityserver-blogs-components-weblogfiles/00-00-00-16-25/DeviceLoginPopup.png)

- RDL editing is not supported on Mac. ReportBuilder is Windows only, and there is no other available tool for editing the RDL.
- Word editing is limited. The "XML Mapping Pane" feature is not available in the MacOS version of Word so it is not possible to add fields to the document.
- Reports datasets, code, and requestpage can still be designed, modified, and deployed using the MacOS version.

The MacOS version must be 10.12 (Sierra) or newer.

### Outline View
The Outline view is a separate section in the bottom of the File Explorer. When expanded, it will show the symbol tree of the currently active editor.

![Isolated Storage](https://community.dynamics.com/cfs-file/__key/communityserver-blogs-components-weblogfiles/00-00-00-16-25/isolatedstorage.png)

The Outline view has different Sort By modes, optional cursor tracking. It also includes an input box which finds or filters symbols as you type. Errors and warnings are also shown in the Outline view, letting you see at a glance a problem's location.

### Isolated Storage
Isolated Storage is a data storage that provides isolation between extensions, so that you can keep keys/values in one extension from being accessed from other extensions. Keys/values in the Isolated Storage are accessible through an API. The involved data type is DataScope.

The methods supported for the DataScope data type are:
|Method|Description|
|--------------|-----------------|
|ISOLATEDSTORAGE.SET|Sets the value associated with the specified key within the extension.|
|ISOLATEDSTORAGE.GET|Gets the value associated with the specified key within the extension.|
|ISOLATEDSTORAGE.CONTAINS|Determines whether the storage contains a value with the specified key within the extension.|
|ISOLATEDSTORAGE.DELETE|Deletes the value with the specified key from the isolated storage within the extension.|

The DataScope Option Type Identifies the scope of stored data in the isolated storage.

|Member|Description|
|--------------|-----------------|
|Module|Indicates that the record is available in the scope of the app(extension) context.|
|Company|Indicates that the record is available in the scope of the company within the app context.|
|User|Indicates that the record is available for a user within the app context.|
|CompanyAndUser|Indicates that the record is available for a user and specific company within the app context.|

DataScope is an optional parameter and if it is not passed the value would be Module.

![Isolatedstorage code](https://community.dynamics.com/cfs-file/__key/communityserver-blogs-components-weblogfiles/00-00-00-16-25/isolatedstoragecode.png)

### Multi ID Ranges
Support for multi ranges for application object IDs. You can add an "idranges" property to the app.json which is an array of "idrange". The "idrange" is still valid but you must either use "idrange" or "idranges" in the app.json file. For all objects outside the range, a compilation error will be raised. When you create new objects, an ID is automatically suggested from the first available range. Overlapping ranges are not supported and generates a compilation error will be raised.

![Multiidranges](https://community.dynamics.com/cfs-file/__key/communityserver-blogs-components-weblogfiles/00-00-00-16-25/multiidranges.png)

### Update to the AL reference documentation

Maybe you’ve already noticed, but last week, we refreshed the documentation with a new set of reference help for methods. We now have a 100% reflection of the methods that are available in AL with their syntax, parameters, return value and more. This is only a step on the way to having the same for properties and triggers, we will be working on this in the coming months. For now, explore the new methods here: https://docs.microsoft.com/en-us/dynamics365/business-central/dev-itpro/developer/methods-auto/library.

## August 2018 update
Once again it is our pleasure to announce the August update of the Developer Preview. With this release, we bring you several new features that help building your solutions as extensions. We also include a large number of resolved GitHub issues. See the list of closed bugs here: [closed bugs in August](https://github.com/Microsoft/AL/milestone/19?closed=1).
This Developer Preview is available only through the Ready to Go program. Read more at [http://aka.ms/readytogo](http://aka.ms/readytogo). To get all fixes and features described in this post please make sure you are running an image with a build number 2.0.41872 or newer.

## New virtual tables for Report Data Items and all Page Control Fields

The following two new virtual tables are added to reflect more info about request pages and reports:
* **All Control Fields** (ID 2000000202)
    * This table contains information about page controls on regular pages, as well as on request pages in reports and XMLports. The primary key is "Object Type", "Object ID", and "Control ID", where "Object Type" could have a value of Report, XMLport, or Page.
* **Report Data Items** (ID 2000000203)
    * This table reflects information about individual data items in a report, for example: "Indentation Level", "Related Table ID", "Request Filter Fields", etc.

With the help of these new tables, it is possible now, for example, to generate the report parameters XML string without actually invoking the report request page. Try this [code example](https://msdnshared.blob.core.windows.net/media/2018/08/codeunit-report-xml-parameters-builder.txt).


## Translating Base App Help using AL extensions
It is now possible to create AL extensions that override the default help link for Business Central and re-direct users pressing the Help button to another website. This also enables translating the help link for Base App objects.

In order to do so, we've introduced two new properties in the manifest of AL extensions: 'helpBaseUrl' and 'supportedLocales'. The 'helpBaseUrl' property represents the URL that will be used to override Microsoft's default help link (https://docs.microsoft.com/{0}/dynamics365/business-central). This URL must contain a place holder '{0}' for the locale culture used by the user and must point to a website that must be forked from https://github.com/MicrosoftDocs/dynamics365smb-docs in order to follow the same structure that Microsoft's help follows. The property 'supportedLocales' is used to specify the list of locales (in the format language2-country2/region2) that are supported by the URL provided and then by the translation app. If the user's current locale is among the 'supportedLocales' of your extension the user will be re-directed to the help base URL that you specified.  The settings in the app.json file look like this:
```
  "helpBaseUrl": "https://www.mydocumentationwebsite.com/{0}/business-central/",
  "supportedLocales": [
       "da-DK"
  ]
```

**Note:** This feature is not available for per-tenant extensions and a rule has been implemented for it in the PTE analyzer. See [PerTenantExtensionCop Analyzer.](https://docs.microsoft.com/en-us/dynamics365/business-central/dev-itpro/developer/devenv-codeanalyzer-pertenantextensioncop-rules)

## Adding help links with user locale on new created objects
We previously added the ability to add static help links in new created pages, reports, or XMLports. For more information, see [Adding Help Links from Pages, Reports, and XMLports.](https://docs.microsoft.com/en-us/dynamics365/business-central/dev-itpro/developer/devenv-adding-help-links-from-pages-tables-xmlports)
It is now also possible to include a placeholder for the user locale in these links. From code, you will define the HelpLink as follows, including the {0} placeholder:

```
page 50100 MyPage
{
    HelpLink = 'https://www.mydocumentationwebsite.com/{0}/business-central/my-page';
}
```

And the placeholder is then filled in according to the app.json file locale setting:
```
  "supportedLocales": [
    "da-DK", "en-US"
  ]
```
In case the user is using one of the supported locales, the supported locale will be inserted in the help link. If the user is not using one of the supported locales, the first locale specified in the 'supportedLocales' setting will be considered default and be inserted in the URL.

## Field group extensiblity
Field groups can now be extended from a table extension with the use of the **addlast** construct. It allows for adding more fields to the end of a field group.

![FieldGroupAddLast](https://msdnshared.blob.core.windows.net/media/2018/08/fieldgroups.png)


## AL Language Extension is now also supported on MacOS
Finally! After having been work in progress for more than 2 years, the distributed .vsix file now supports both Windows and MacOS.

The MacOS version contains the same functionality as the Windows version. There are, however, a few differences/limitations compared to the Windows version.
* Windows authentication is not supported.
* AAD authentication is using device login (http://aka.ms/DeviceLogin) to authenticate. The user experience is different. Instead of getting a login dialog, a notification window is shown in the lower right corner. The window shows the device login URL and the device code. Clicking the 'Copy and Open' button will place the code on the clipboard and open a browser at the device login page.
![MacDeviceLoginPopup](https://msdnshared.blob.core.windows.net/media/2018/08/DeviceLoginPopup.png)
* RDL editing is not supported on Mac. ReportBuilder is Windows only, and there is no other available tool for editing the RDL.
* Word editing is limited. The XML Mapping Pane feature is not available in the MacOS version of Word, so it is not possible to add fields to the document.
* Report datasets, code, and request page can still be designed, modified, and deployed using the MacOS version.

**Note:** The MacOS version must be 10.12 (Sierra) or newer to run the AL Language Extension.

## Report substitution is possible from extensions
Extensions can now replace built-in reports by subscribing to the **OnAfterSubstituteReport** event emitted by **Codeunit 44 - ReportManagement**. Substitution is possible whenever a report is invoked as the result of the user activating a page action that has the **RunObject** property set to a report or a report is invoked through one of the following static methods on the **Report** data type:
* Run
* RunModal
* SaveAsHtml
* SaveAsXml
* SaveAsPdf
* SaveAsExcel
* SaveAsWord
* RunRequestPage
* Execute
* Print
* SaveAs

Substitution is performed by setting the value of the NewReportId parameter to the ID of the report that should replace the report with ID ReportId. In the following example, I replace Report 2 with Report 4.

![ReportReplacement](https://msdnshared.blob.core.windows.net/media/2018/08/reportreplacement.png)

If the value of the NewReportId parameter is different from the value of the ReportId parameter and different from -1, it means that the report has already been substituted by another subscriber of this event.
The event is called 'OnAfterSubstituteReport' to match the pattern followed by other events in the ReportManagement Codeunit, but the subscriber will be invoked before the substitution takes place.


# July 2018 Update (2018/07/30)

Welcome to the July update of the Developer Preview. With this release, we bring you several new features that help building your solutions as extensions. We also include over 90 resolved GitHub issues. See the list of closed bugs here: [https://github.com/Microsoft/AL/milestone/18?closed=1](https://github.com/Microsoft/AL/milestone/18?closed=1).

This Developer Preview is available only through the Ready to Go program. Read more at [http://aka.ms/readytogo](http://aka.ms/readytogo). To get all fixes and features described in this post please make sure you are running an image with a build number 13.0.32492.0 or newer.


## OData-bound actions in AL
It is now possible to declare OData bound actions in AL. A new attribute [ServiceEnabled] and new AL types WebServiceActionContext and WebServiceActionResultCode have been introduced to achieve this.

Here is an example of how to declare a new OData bound action on a page exposed as a web service:

```
[ServiceEnabled]
procedure CreateCustomerCopy(var actionContext : WebServiceActionContext)
var
    createdCustomerGuid : Guid;
    customer : Record Customer;
begin
    actionContext.SetObjectType(ObjectType::Page);
    actionContext.SetObjectId(Pages::Customer);
    actionContext.AddEntityKey(customer.fieldNo(Id), createdCustomerGuid);
    actionContext.SetResultCode(WebServiceActionResultCode::Created);
end;
```
Note that similarly to C/AL approach the function's parameter has to be named 'actionContext' to be correctly picked up by the OData framework.

More details can be found in Developer and IT-Pro Help here: [https://docs.microsoft.com/en-us/dynamics-nav/walkthrough-creating-and-interacting-odata-v4-bound-action](https://docs.microsoft.com/en-us/dynamics-nav/walkthrough-creating-and-interacting-odata-v4-bound-action)

## Event discovery using a recorder
A core aspect of creating extensions is to subscribe to events. However, a common challenge is understanding which events are available in a given user flow. Debugging can help, but will only show events already being subscribed to. To aid in the discoverability of events and extension points, there is a new event tracer in the client. With this, a user flow can be recorded to list events that are raised, and the developer can have subscriber code for the event generated for easy copy into AL code.

To get the list of all events raised during a given session use the new **Event Recorder**:
1. Navigate to the Event Recorder page using the Search in the client or by using the command 'AL: Open Events Recorder' in VS Code.
2. Press the Start button in order to start recording events.
3. Now, perform the actions required for your scenario.
4. Press the Stop button to get the list of all recorded events.
5. Choose the event that suits you the best and get an AL snippet to use in VS Code by choosing **Get AL Snippet**.
![EventRecorderPage](https://msdnshared.blob.core.windows.net/media/2018/07/event-recorder.bmp)

## Extensible Enums
In this Developer Preview, we're also adding the ability to add and extend enums. This section introduces the concept.

### Declaration
Enum is a new concept that over time is meant to replace the existing Option type. It is a new top-level type and is declared like this:
```
enum 50121 Loyalty
{
    Extensible = true;
    value(0; None) { }
    value(1; Bronze) { }
    value(4; Silver) { }
    value(5; Gold)
    {
        Caption = 'Gold Customer';
    }
}
```

Enums require an ID and a name. In the preview the IDs are not validated against any license, but they must be within your assigned object range. An enum contains a list of values. The value corresponds to the individual elements of the OptionString on an Option. The value has an ID and a name. The ID is ordinal value used when persisting the enum and hence they must be unique. The name is used for programmatic access and is a fallback for the caption. Enums are pure metadata and can't contain any kind of code.

Enums can be marked as extensible. If an enum is extensible; you can add more values to the original list of values. The enumextension syntax looks like this:

```
enumextension 50130 LoyaltyWithDiamonds extends Loyalty
{
    value(50130; Diamond)
    {
        Caption = 'Diamond Level';
    }
}
```

### Usage
Enums can be used as table fields, global/local variables, and parameters. They are referenced using the following syntax:
```
enum Loyalty
```
For example, as a table field type:
```
field(50100; Loyal; enum Loyalty) {}
```
Or as a variable:
```
var
    LoyaltyLevel: enum Loyalty;
```

### In C/SIDE
Since most of the enums that are currently relevant for extensibility are on table fields in the base-app, we have made it possible to mark a table field in C/SIDE as Extensible.

![EnumsInCSide](https://msdnshared.blob.core.windows.net/media/2018/07/c-side-extensible.png)

To extend a table field option you must set up your development environment to run C/SIDE and AL side-by-side as described here: [https://docs.microsoft.com/en-us/dynamics-nav/developer/devenv-running-cside-and-al-side-by-side](https://docs.microsoft.com/en-us/dynamics-nav/developer/devenv-running-cside-and-al-side-by-side). Once the feature is out of preview we will allow requesting base application enums to be made extensible through GitHub requests similar to event requests.

### Conversions
Conversions to/from Enums are more strict than for Options.

* An enum can be assigned/compared to an enum of the same type.
* To be backwards compatible we support conversion to/from any Option, but we may in the future be more strict.

Known Issues in the July preview
* No runtime checks for ID collisions.
* Declare C/SIDE enums with the same ID on multiple table option fields will break symbol generation.

That's it for now. As usual we encourage you to let us know how you like working with these additions and keep submitting suggestions and bugs. You can see all the filed bugs on our GitHub issues list [https://github.com/Microsoft/AL/issues](https://github.com/Microsoft/AL/issues).


# June 2018 Update (0.17.23984 - 2018/06/25)

Welcome to the Developer Preview for June. In this release we have a number of new features for you that are introduced below. We have also spent time burning down outstanding bugs reported through GitHub. See the list of closed bugs here: https://github.com/Microsoft/AL/milestone/17?closed=1.

## Debugger enhancements
We have added support for the following  debugger options that have also been available in the Dynamics NAV debugger. The options are:
- breakOnError. The default is true.
- breakOnRecordWrite. Breaks before a write action. The default is false.

These settings are part of the configuration settings in the launch.json file.

We have added the possibility to go to definition on base app code or any reference code that has been published with showMyCode enabled. The "Go to definition on base app symbols" on local server scenarios requires that the AL symbols are rebuilt and downloaded from C/SIDE.
![GoToDefintionBaseApp](https://msdnshared.blob.core.windows.net/media/2018/06/F12.gif)

You can also set breakpoints in methods of downloaded content. This refers to both base application-based C/AL content and extension V2 based reference content where the showMyCode flag has been set to true when the package was deployed. Note that the base application-based C/AL is partly modified to render in the Visual Studio Code AL editor, and that object metadata is shown at the end of the file.
![BreakpointSetInBaseApp](https://msdnshared.blob.core.windows.net/media/2018/06/GetImage-11.png
)
![BreakpointHitInBaseApp](https://msdnshared.blob.core.windows.net/media/2018/06/DebuggingDAL.gif)

## Permission Set creation
We have added some utilities to make working with permissions easier for you. You can now export selected app and/or tenant permission sets which you have created in the client so that you can package them for your extension. This allows you to use the client instead of having to edit the XML by hand. Once you publish, you can see the permission sets in the client again, make more changes, and then export again.

1. On the Permission Sets page, select a few permissions that you want to export and then choose the Export Selected Permissions action.

2. Choose whether you want to export only app, tenant, or both types of permissions.

3. And then save the file to your extension folder.

You can now also generate a permission set file which contains permissions to all the files in your extension. This will make it easier to start setting up permissions for your app. Previously you had to do it by hand for each object and make sure you didn't forget something.

1. Simply create your extension with some objects.
![ObjectsForPermissionSetGeneration](https://msdnshared.blob.core.windows.net/media/2018/06/GetImage-15.png)

2. Invoke the Visual Studio Command with Ctrl+Shift+P and then select AL: Generate permission set containing current extension objects.  Please note that if you do this repeatedly, Visual Studio Code will probe for overwriting the file, there is no support for merging manual corrections into newly generated content.
![GeneratePermissionSetsCommand](https://msdnshared.blob.core.windows.net/media/2018/06/GetImage-16.png)

3. Now, you have your XML file with default permissions to all your objects.
![GeneratedPermissionSet](https://msdnshared.blob.core.windows.net/media/2018/06/GetImage-17.png)

## .NET Interoperability

We have added the posibility of using .NET types from AL. .NET interoperability will only be available for solutions that target on-premise deployments.
To create an extension that uses .NET interoperability you must first:
- Open the extension's app.json file and set the "target" property to "OnPrem"
- Open the settings for your current workspace and specify any folders that should be searched for assemblies by setting the "al.assemblyProbingPaths" property.

You can now start using .NET interoperability by declaring the .NET types that you will be using in a dotnet{} package and referencing them from code as in the example below. For more information, see [Get Started with .NET Interoperability from AL](https://docs.microsoft.com/en-us/dynamics365/business-central/dev-itpro/developer/devenv-get-started-call-dotnet-from-al).
![DotNetInterop](https://msdnshared.blob.core.windows.net/media/2018/06/GetImage-12.png)

## Backwards compatibility
We are working on making one single Visual Studio Code AL extension which is compatible with multiple versions of the server.

This means that in the near future you will be able to install the AL Language extension from the Visual Studio Code marketplace and use it to develop solutions for:
- Microsoft cloud sandbox
- Business Central, April 2018 release
- Business Central, Fall 2018 release
- And more

Please note that at the moment there are no plans to make this AL Language extension version backwards compatible with Dynamics NAV. For Dynamics NAV development, the traditional method should be used – install the VS Code extension from the ALLanguage.vsix file shipped on the DVD.

The first bits of this feature are out in the preview now.

In the app.json file, a new attribute "runtime" is added. This attribute defines the platform version that the extension is targeting. Depending on the runtime version, certain features become available or on the contrary – not allowed. For example, .NET interopability can only be used when the runtime version is 2.0 or higher.

# May 2018 Update (0.17.16611 - 2018/05/25)

Welcome to the May 2018 Developer Preview update. In this release we have focused primarily on burning down the outstanding bugs reported through GitHub. This milestone contains ~300 events and bug fixes and brings the number of outstanding bugs close to 0. See the list of closed bugs here: https://github.com/Microsoft/AL/milestone/16?closed=1. We have also added a few small features, please see more details below.

## Help links from IntelliSense
We improved the help experience of all properties in AL, both on hover and in IntelliSense, adding help links that redirects you to the related online documentation.
![HelpFromIntelliSense](https://msdnshared.blob.core.windows.net/media/2018/05/May-PropertyLinks.gif)

## Improved support of the Image property
We also improved the support around the Image property in the extension. This includes improving the suggestion of images to only propose the ones that can be used in the current context, displaying a warning for images that cannot be used in the current context, but also the possibility to preview images when using IntelliSense and on hover.
![ImagesInHoverTooltip](https://msdnshared.blob.core.windows.net/media/2018/05/May-PreviewImages.gif)

## Contextual information in XLIFF files
We have added contextual information in the XLIFF file that describes which object and element a given string applies to. This helps translators get a better overview of where a string is displayed in the UI thereby increasing the quality of the translation.
![ContextualXliff](https://msdnshared.blob.core.windows.net/media/2018/05/xliff-note.png)

# Dynamics 365 Business Central Spring 2018 Release (0.15.18771 - 2018/03/23)

We are happy to announce the following great features:

## Static Code Analysis
Specifying `"al.enableCodeAnalysis": true` in your settings, static code analysis will be enabled for AL projects. 3 analyzers have been implemented that will support general AL, AppSource and Per-Tenant Extension analysis. Analyzers can be individually enabled by specifiying the rulesets in the al.codeAnalyzers setting.
```json
"al.enableCodeAnalysis": true,
"al.codeAnalyzers": [
        "${CodeCop}"
]
```
You can create and customize your own ruleset but adding a file <myruleset>.ruleset.json to the project. Using the
snippets **truleset** and **trule** will get you started quickly.

For more information, see [Using the Code Analysis Tool](https://docs.microsoft.com/en-us/dynamics365/business-central/dev-itpro/developer/devenv-using-code-analysis-tool).

## Help for new pages
When creating new Pages, Reports, and XMLports in V2 extensions, it is now possible to specify the help link that will be used when the user presses the help button in the UI.

You can do this by using the property HelpLink on Pages:
```
page 50100 MyPageWithHelp
{
    HelpLink = 'https://www.github.com/Microsoft/AL';
}
```
And by using the property HelpLink on the request page of Reports and XMLports:

```
report 50100 MyReportWithHelp
{
    requestpage
    {
        HelpLink = 'https://www.github.com/Microsoft/AL';
    }
}
```
For more information, see [Adding Help Links from Pages, Reports, and XMLports](https://docs.microsoft.com/en-us/dynamics365/business-central/dev-itpro/developer/devenv-adding-help-links-from-pages-tables-xmlports)

## Creating Role Center Headlines
You can set up a Role Center to display a series of headlines, where headlines appear one at a time for a predefined period of time before moving to the next. The headlines can provide users with up-to-date information and insights into the business and their daily work.

For more information, see [Creating Role Center Headlines](https://docs.microsoft.com/en-us/dynamics365/business-central/dev-itpro/developer/devenv-create-role-center-headline). 

## Improved experience for event subscribers
We improved the snippets and IntelliSense around event subscribers, for both the attribute arguments and the method parameters. It is now working for trigger, integration, and business events. In case of business and integration events, the suggestion of the method parameters is made based on the attributes of the event publisher in order to know if the global variables and/or the sender should also be suggested.

Here is what it looks like to subscribe to an integration event when using the snippets:

![EventSubscriber1](https://msdnshared.blob.core.windows.net/media/2018/03/EventSubscriberIntellisenseDemo.gif)

Here is what it looks like when writing the event subscriber from scratch:

![EventSubscriber2](https://msdnshared.blob.core.windows.net/media/2018/03/EventSubscriberIntellisenseDemoWithoutSnippet.gif)

## Working with data?
You can now inspect the contents of a table when you publish an AL project (F5 and Ctrl+F5) from Visual Code. Simply modify the launch.json file of the project to include the `"startupObjectType" = "table"` and `"startupObjectId" = "<TableID>"` settings, replacing <TableID> with the ID of the table that you want to see. The table will display in the client as read-only.

From the client, you can also view a specific table by appending the URL with "&table=<ID>", such as:
https://businesscentral.dynamics.com/?company=CRONUS%20Inc.&table=18

For more information, see [Viewing Table Data](https://docs.microsoft.com/en-us/dynamics365/business-central/dev-itpro/developer/devenv-view-table-data).

## Choose your cue layout on Role Centers
We now offer a wide layout option for cues. The wide layout is designed to display large values and gives you a way to emphasize a group of cues. When set to the wide layout, a cue group will be placed in its own area, spanning the entire width of the workspace.

![Cues](https://msdnshared.blob.core.windows.net/media/2018/03/Cues.png)

For more information, see [Cues and Action Tiles](https://docs.microsoft.com/en-us/dynamics365/business-central/dev-itpro/developer/devenv-cues-action-tiles).

# February Update (0.14.17461 - 2018/02/15)

Let's kick start 2018 with a great set of features.

## Synchronize data on F5

When doing subsequent publishing from Visual Studio Code, it is now possible to keep the data entered into tables specified in the extension.
This is controlled by a property in the launch.json file:

![SynchonizeChanges](https://msdnshared.blob.core.windows.net/media/2018/01/SynchronizeLaunchJson.png)

The two possible values are: Recreate and Synchronize.

**Recreate** is the behavior you have experienced so far; all the tables and table extensions are recreated at every publish, meaning that all the data in those tables is lost.

**Synchronize** is the new behavior that tries to synchronize the current state of the database with the extension that is being published. This means that, for example, if a field is removed then it cannot be synchronized and you have to either use the other mode (Recreate) or write upgrade code and follow the steps for that.

For more information, see [Upgrading Extensions](https://docs.microsoft.com/en-us/dynamics-nav/developer/devenv-upgrading-extensions).

## Adjustable column width in the Web client
Using Designer, you can now adjust the width of columns in lists that are displayed by a List, ListPart, ListPlus, or WorkSheet type page. For more information, see [Designer](https://docs.microsoft.com/en-us/dynamics-nav/developer/devenv-inclient-designer).

## Report RDL and Word layout development with AL
We have enabled the scenario to develop RDL Report Layouts and Word Report Layouts by using the AL Extension and the editor for the files. Now, when you specify the path to the layout in the report, such as:

![GenerateRDL](https://msdnshared.blob.core.windows.net/media/2018/01/Report.png)

The extension will generate the .rdl file in the specified path.
The scenarios are the same for both RDL and Word development.
You specify the file and it is created.
You make changes to the file in Word or SQL Server Report Builder or you change the dataset in AL code and the layout files stay in sync with the AL extension.
You can use the existing RDL and Word files which you export from your codebase and use it with this new development scenario.

## Enabling Dynamics 365 for Sales tables for extension development
The creation of Dynamics 365 for Sales tables is now available for extension development to allow you to create extensions that integrate with Dynamics 365 for Sales. Dedicated properties, along with IntelliSense and diagnostics, are also available to enable field mapping with the tables you use in Dynamics 365 for Sales.

![CRMTable](https://msdnshared.blob.core.windows.net/media/2018/01/CRM_Example.png)

## Autonumbering of objects
We have improved the object Id IntelliSense so that it suggests the next available ID for a given object type. The next available ID is determined based on the Id range defined in app.json and based on all occupied Ids by objects that are within the compilation scope (i.e. the current project and its dependencies).
Simply press Ctrl + Space after an object keyword to get the next available ID.

## Multi root workspace support
Visual Studio Code recently introduced the so-called multi root workspace support which allows you to organize your work in multiple top level folders. See the details on how to add multiple folders to a workspace in https://code.visualstudio.com/docs/editor/multi-root-workspaces
The AL Language extension now also supports the multi root functionality. This feature-set allows you to work with multiple top level AL folders (roots/projects) within one workspace. Not all roots have to be AL-based - you can mix all kinds of roots/projects together. Each AL project will now have its own configuration values for the following settings:

    a. al.packageCachePath
    b. al.enableCodeAnalysis
This allows you to create a package cache path relative to each project or use the same absolute path to share the same packages across different projects.

![Multi-Root](https://msdnshared.blob.core.windows.net/media/2018/02/MultiRoot.png)

# Anniversary Update (0.13.15836 - 2017/12/20)

To celebrate that it is exactly one year ago that we shipped the first Developer Preview release we have an extra update for you before the end of the year. Here are the new features.

## Debugger Changes:
The performance of the debugger has been improved by:
1. The Visual Studio Code debug adapter has been refactored to lazily evaluate globals and locals.

2. Text constants are not shown anymore as part of global symbols.

## New Language Feature - Method Overloading:
The AL language now supports method overloading. It is possible to have a procedure with the same name, but with different parameter lists. The codeunit shown in the sample below has 3 procedures all named Add():

![MethodOverload1](https://msdnshared.blob.core.windows.net/media/2017/12/method_1.png)

IntelliSense will now show the parameter lists for the different versions to browse through:

![MethodOverload2](https://msdnshared.blob.core.windows.net/media/2017/12/method_2.png)

When hovering over a method call the called version is shown:

![MethodOverload3](https://msdnshared.blob.core.windows.net/media/2017/12/method_3.png)

## More Control Add-Ins Now Available
A number of built-in control add-ins can now be used in AL extensions:
* Microsoft.Dynamics.Nav.Client.VideoPlayer
* Microsoft.Dynamics.Nav.Client.WebPageViewer
* Microsoft.Dynamics.Nav.Client.PageReady
* Microsoft.Dynamics.Nav.Client.BusinessChart

**Note**: Business Chart can currently only be configured through table Business Chart Buffer (485), which internally uses .NET interop to set up the chart.

All new control add-ins are available in the newest Application symbols package, therefore they can simply be referenced in the user control field:

![Charts](https://msdnshared.blob.core.windows.net/media/2017/12/chart.png)

## Working with Camera

A new base page Camera Interaction (1910) has been added to encapsulate the interaction with the device camera (if available). .NET interop code is no longer needed to take a selfie in AL as illustrated in the code sample below:

![Camera](https://msdnshared.blob.core.windows.net/media/2017/12/camera.png)

## More System Tables Unblocked
A number of system and virtual tables have been unblocked for extension development:
* License Permission
* Permission Set
* Permission
* Aggregate Permission Set
* All Profile
* Profile
* Profile Metadata
* Add-in
* Chart

# December Update (0.12.15359 - 2017/12/06)

Welcome to another installment of our development updates. We have the pleasure of announcing the following great features.

## AL Formatter

The AL Language Visual Studio Code extension now offers users the option to automatically format their source code. The auto-formatter can be invoked to format an entire AL document or a pre-selected range.

In an existing project, open the document you want to format, right click - inside the document, and run "Format Document".

To format a range, in an already opened project, open the document you want to modify, select the specific range you want to format, right click it, and run "Format Selection" command.

![Formatter](https://docs.microsoft.com/en-us/dynamics-nav/developer/media/format-document.gif)

## Show My Code

The manifest has a new setting: Show My Code. It controls whether the source code is visible when other extensions debug it.

For example, an amazing library is developed and shared on AppSource for other people to use but the author doesn't want the users to see the code when they try to debug into it from their extension. The author will with the use of ShowMyCode make sure that the code is not shown when the user tries to debug into it. By default ShowMyCode is false but can be overriden in the app.json to true.

## Pages/reports show up in Search in the Web client

Each page and report has a new property called UsageCategory, which accepts the following values: None,Lists,Tasks,ReportsAndAnalysis,Documents,History,Administration. If this value is not set to none then the page/report will appear in Search.

There are two more properties added if the UsageCatgeory is set; ApplicationArea and AccessByPermission. These are used to control whether or not a page will appear, or if the page can be launched from Search.

Example:
```
page 70050088 SimpleCustomerCard
{
    PageType = Card;
    SourceTable = Customer;
    UsageCategory = Documents;

    layout
    {
        area(content)
        {
            group(General)
            {
                field("No.";"No.") {}
                field(Name;Name) {}
                field(Address;Address) {}
            }
        }
    }
}
```

## Generating symbols from C/SIDE and using them in VS Code.

In order to allow the server to accept symbols from C/SIDE you must enable the EnableSymbolLoadingAtServerStartup flag in the server's configuration file.

You can generate symbols from C/SIDE with the generatesymbolreference command. Example:
```
finsql.exe command=generatesymbolreference,database=<Dabasename>servername<server>,logfile=<path to log file>
```
This operation is lengthy. It should normally take a full application object compile time.

Once symbols are generated they can be downloaded from Visual Studio Code.

This new feature also allows that symbols changed in C/SIDE are immediately updated on the server. Therefore any change can be instantly downloaded with a new symbol download command from Visual Studio Code.

For this to happen you must start finsql with a special flag called generatesymbolreference.
Example:
```
finsql.exe generatesymbolreference=yes
```
If C/SIDE is started with this flag then a compilation of any application object would also update generate a new symbol reference for the changed application object.


# November Update (0.11.14434 - 2017/11/08)

Welcome to the November Update. We have several exiciting changes to announce.

## Multi-country extensions

It is no longer necessary to specify application locale in app.json. Your AL package will be compiled against the application that is present on the server that you connect to. This allows you to write a single AL extension for multiple country versions as long as you don't depend on country-specific code. If you do depend on country specific code you should only try to compile your app against a server set up for that country.

The application property in app.json has changed its format accordingly.

Old:
```
"application": {
    "version": "11.0.0.0",
    "locale": "US"
}
```
New:
```
"application": "11.0.0.0"
```
## Runtime packages

For On-Prem app distribution purposes it is now possible to generate "Runtime" packages that don't contain any AL code. Instead they contain the compiled output files that the server uses.

It first requires to have an extension developed and published to an on-premise instance. Then for generating the package, it connects to the server and finds the extension by the following powershell command:

```
Get-NavAppRuntimePackage
```

For publishing and installing the package the following powershell commands are used:

```
Publish-NavApp
Install-NavApp
```

This comes with the limitation that it only works for on-premise installations, the debugging experience is very limited since no source code is available and it can't be used for submissions to AppSource.


## Translations

We have now improved the translations feature with the support of Xliff files. To enable it open the app.json file and enter:

```
  "features": "TranslationFile"
```

Then invoke the package command (Ctrl + Shift + B) in Visual Studio code and there will be a directory "Translations" with the .xliff files ready to filled out with a new language.
The generated xliff file can be used within many of the free or commercial tools for translators.
All labels, label properties (Caption, Tooltip etc.) and report label will be included in the xliff file and be ready for translation.
After you have specified the target language and translated your labels, include the renamed xliff file in the Translations folder.
Make sure the name is not the same as the file which is being generated as it will be overwritten.
On next publishing of your extension the translations will be included in the package and picked up by the server.

Some things to note: ML properties, old report label syntax and TextConst do not get included in the xliff file and will not be translated. Make sure to update your code from the old ML syntax (=ENU='asd';DEU='qwe') to the new label syntax.

The label syntax is as follows (example for Caption property):
Caption = 'Developer translation for %1',  Comment = '%1 is extension name', locked = false, MaxLength=999;

The `comment`, `locked` and `maxLength` attributes are optional and the ordering is not enforced.
Use the same syntax for report labels

```
labels
{
    LabelName = 'Label Text', Comment='Foo', MaxLength=999, Locked=true;
}
```

And label data types:

```
var
    a : Label 'Label Text', Comment='Foo' MaxLength=999, Locked=true;
```

# October Update (0.10.13928 - 2017/10/12)

We are excited to announce the following changes in the October Update:

## Web client add-ins

It is now possible to develop JavaScript control add-ins in AL. The new AL type controladdin serves both as a replacement for the old XML manifest (https://msdn.microsoft.com/en-us/library/dn182591(v=nav.90).aspx) and as a replacement for the .NET interface as for bidirectional JavaScript-to-AL communication.
-  The JavaScript APIs remain the same as in Extensions V1: https://msdn.microsoft.com/en-us/library/dn182584(v=nav.90).aspx.
- There is no need for creating a DLL, signing it and creating a .zip file anymore. All development happens within the VS Code AL project and the control add-in gets deployed as part of the extension (Ctrl + F5).

A control add-in sample in 42 lines:
![ControlAddIn](https://msdnshared.blob.core.windows.net/media/2017/09/ControlAddIn.png)

## Dictionary and List
This update adds two new, highly requested AL types: List and Dictionary. For the first time in AL, you will be able to work with strongly typed lists and dictionaries.
At the moment, these types can only be used with simple types, for example, you can have a List of [Integer], but not a 'List of [Blob]'. The list of supported types is fairly long, but the main point is that: if you can use it as the return type of a procedure, you can use it in a list.
![DictionaryAndList](https://msdnshared.blob.core.windows.net/media/2017/09/DictionaryList.png)
![DictionaryAndList2](https://msdnshared.blob.core.windows.net/media/2017/09/DictionaryList_2.png)

## ForEach is back
We've added support for iterating over expressions of enumerable types in AL using the foreach statement. At the moment, you can use the foreach statement to iterate over expressions of type List, XmlNodeList, XmlAttributeCollection, and JsonArray.
![ForEach](https://msdnshared.blob.core.windows.net/media/2017/09/ForEach.png)

## New translation syntax
We have added support for the new Label syntax which will prepare you for using the new translation process which decouples translation from source code. You will be able to specify a default translation in code with some attributes and then in the next update we will provide you with generating a standard format translation file which is widely supported for translating. When you get your translation back, you simply package it with the extension and you now have a multilanguage extension!

We encourage you to start transitioning to this new syntax, so that you’re ready when we update the compiler.
You cannot use Caption and CaptionML at the same time. This applies to the rest of the classic multilanguage properties.

The syntax is as follows:
![TranslationSyntax](https://msdnshared.blob.core.windows.net/media/2017/09/Translation1.png)

# September Update (0.9.12794 - 2017/09/07)

Welcome to the September update for the Developer Preview.

## We have a new developer preview image ready for you. To get up and running, follow these steps:
- Navigate to http://aka.ms/navdeveloperpreview to launch the September update of the Developer Preview.
- Specify Resource group, Vm Name, and Admin Password and then select which country version you want.
- When deployment has succeeded, you'll see following the landing page (Open the Virtual Machine DNS Name URL in a browser).
  ![VMLandingPage](https://msdnshared.blob.core.windows.net/media/2017/09/NewDevPreviewImage.jpg)
- You can connect to the Virtual Machine using Remote Desktop and Open VS Code to develop like before. Or, you can develop using VS Code on your local computer. To do this you must download the self-signed certificate and install it in the Local Machine Trusted Root Certification Authorities. Having downloaded and installed the certificate, you can download the AL Language Extension and install it into your local VS Code.
Use AL GO! and replace the corresponding lines in launch.json and app.json with the lines you see on the landing page. Download symbols, compile, deploy, and debug.

In addition to the next batch of [fixed issues](https://github.com/Microsoft/AL/milestone/9?closed=1) we announce the following changes:
- The .navx file extension for AL packages has been changed to .app
- The developer endpoint on the Dynamics NAV server now performs license checks when publishing AL projects. Developer Preview environments offer a free demo range of **50100-50149**. Dynamics 365 for Financials sandboxes have a more permissive license that lets you use range 50000-99999 as well as the 70000000-75000000 range.
- The developer endpoint on the Dynamics NAV server now performs permission checks to see if the user who is trying to publish an AL project has the rights to do so. The indirect insert permission into the Nav App table is validated. This permission is a part of the **"D365 EXTENSION MGT"** permission set.
- It is now possible to define Watches and conditional breakpoints in the new debugger. In the Activity Bar in Visual Studio Code, choose the Debugging icon to bring up the Debug view and add Watches. Use the Debug Menu to set breakpoints in the code.
![DebuggerWatch](https://msdnshared.blob.core.windows.net/media/2017/09/Watch-002.gif)

# August Update (0.8.11706 - 2017/08/16)

The Developer Preview August Update is now live! We're excited to announce the new features for this month as well as share our progress on [fixing the issues](https://github.com/Microsoft/AL/milestone/8?closed=1) reported by you.
Please keep the feedback coming, we really appreciate your engagement.

As usual, you can provision the latest environment at [https://aka.ms/navdeveloperpreview](https://aka.ms/navdeveloperpreview)

## This update brings the following changes:
-   In this update, based on your requests, you can work with three different country versions of the application database. This is provided through hosting them on the Dev Preview VM; each with their own NST. The services that are available and the names that you should use in serverInstance setting in launch.json file are the following: “US”, “GB”, and “CA”. The US, GB, and CA versions correspond to the Dynamics 365 for Financials user experience and application database.
If you need to code against W1, you will have to enable the developer service endpoint in the Administration Console for the NAV serverInstance and use “NAV” in the serverInstance setting in launch.json file. Note, that the NAV serverInstance is using UserPassword authentication and the other instances are using Windows Authentication.

-   We continue to add replacements for highly requested .NET types. This update adds a new AL type, TextBuilder, that wraps the most commonly used functionality of the System.StringBuilder type in the .NET Framework.

    ```
    procedure ConcatenateString()
    var builder : TextBuilder;
        textResult : Text;
    begin
        builder.AppendLine('We can append new lines');
        builder.Append('... or just characters to the current line');
        builder.Replace('Text can also be', 'replaced');
        textResult := builder.ToText();
    end;
    ```

- We've also enriched the built-in Text data type with a bunch of new functions - for a full list, see the [documentation](https://msdn.microsoft.com/en-us/dynamics-nav/developer/datatypes/devenv-text-data-type).

## Our VS Code extension comes with new capabilities again this time:
-   The popular "Go To Definition" for dependencies gives you a generated version of the application objects, such as which fields a table has, and the datatypes of the fields. Simply place your cursor on the type and press F12.
    ![GoToReferenceSymbols](https://msdnshared.blob.core.windows.net/media/2017/08/2017_Aug_GoToReference.gif)

-   We've added a preview of the new debugging experience.

    The semantics of pressing **F5** in the VS Code has changed - now it will start a debugging session. To start the client without debugging, use **Ctrl+F5**.
    To hit the breakpoints in the debugger, you just trigger the relevant actions in the web interface.
    ![Debugger](https://msdnshared.blob.core.windows.net/media/2017/08/2017_Aug_Debugging.gif)

-   New authentication methods are now available. The property `windowsAuthentication` in the launch.json file is deprecated, although it will still work.

    Instead, set the new `authentication` property to the following values:
    -   Windows
    -   UserPassword
    -   AAD


# July Update (0.7.11459 - 2017/07/12)

Welcome to the Developer Preview July Update! We're excited to announce the new features for this month as well as share our progress on [fixing the issues](https://github.com/Microsoft/AL/milestone/7?closed=1) reported by you.
Please keep the feedback coming, we really appreciate your engagement.

As usual, you can provision the latest environment at [https://aka.ms/navdeveloperpreview](https://aka.ms/navdeveloperpreview)

## This update brings the following changes:
-	We're addressing the most highly requested .NET replacement, namely XML handling. This update brings a set of new native AL types that let you create, read, update and output XML documents using the XML DOM model. The most important new types include:
    -	XmlDocument
    -	XmlElement
    -	XmlAttribute

    Documentation for these new types can be found [here](https://go.microsoft.com/fwlink/?linkid=851979).

-	Completing the functionality around tenant-specific profiles originally announced in June Update we now offer new AL object types Profile and Page Customization. These new objects let you define a set of pre-defined profiles and include them in your extension. Page Customization object is very similar to a Page Extension but more restricted. As of now Page Customization can only include moving of controls and actions as well as setting Visiblity to true/false. It cannot contain variables, functions or triggers.

-	Our VS Code extension now offers signature help for all syntax elements that have structured parameters, for example:
    ```
    field(Name;Expression)
    key(Name;Field1, Field2, Field3)
    ```

-	The RecordRef type has been reworked and made available for extension development. When used from extensions RecordRef.Open will only let you open records with Id less than 2 billion.

-	The Permission property has been reworked and made available for extension development. In the first iteration the property lets you only reference objects added within your own extension. However, this will be expanded in the future releases.


# June Update (0.5.10663 - 2017/06/20)

The June update for Developer Preview is now live! We've had a month with new features and a lot of time spent on improving quality, especially trying to iron out the bugs you have submitted to us via GitHUb. Here is a [full list of fixes](https://github.com/Microsoft/AL/milestone/6?closed=1). Thanks again to everyone who has contributed and, please keep that feedback coming.

## This month's update includes
- 	In the in-app designer you can now reposition or hide a Cue tile or Cue Group on any page by using the jewel menu.
![DesignerCue](https://msdnshared.blob.core.windows.net/media/2017/05/cue.gif)
-	We've focused on making the boundary between the in-app designer and Visual Studio Code smoother.
    -	Pressing F6 in Visual Studio Code will open the current extension and allow you to add more changes using the in-app designer. For example, start in VS Code, define a page extension, press F6 to open the web client, then use the in-app designer to move the fields around and finally save your extension to files.
    -	Pressing F7 in Visual Studio Code to pull changes made by the in-app designer and add them as code back into your source. For example, start in VS Code, write a page extension, press F6, and move fields. Then switch back to VS Code and press F7. The new field order will update in the source code.

-	Added fixes to the txt2al.exe converter utility. We now support .DELTA files conversion and the command line format has changed to:
```
Copyright (C) 2017 Copyright (c) Microsoft Corporation. All rights reserved.
-source=Path	Required. The path of the directory containing the TXT files.
-target=Path	Required. The path of the directory into which the converted AL files will be placed.
-rename	Rename the output files to prevent clashes with the source .txt files.
-type=ObjectType	The type of object to convert. Allowed values: Codeunit, Table, Page, Report, Query, XmlPort
-extensionStartId	The starting numeric ID of the extension objects (Default: 70000000). It will be incremented by 1 for each extension object.
-help	Display this help screen.
```

- You can now include translation files and table data files in Extensions V2. To include a language, include the TXT file in the project directory. Press F5 will generate a .navx package that includes the captions. Note, that you can export captions using the following cmdlet https://msdn.microsoft.com/en-us/dynamics-nav/microsoft.dynamics.nav.model.tools/export-navapplicationobjectlanguage. The same approach goes for data and you can use this cmdlet https://msdn.microsoft.com/en-us/dynamics-nav/microsoft.dynamics.nav.management/export-navdata to export your data to file and then include in the .navx package.
- 	Following a community suggestion from GitHub, IntelliSense has been improved to help writing pages faster (and other objects which have fields based on source tables)
 ![FieldRecommenders](https://msdnshared.blob.core.windows.net/media/2017/05/Code_2017-05-29_14-24-25-002.png)
When coding the page fields, use the snippet tfieldpage, then position your cursor as shown and invoke IntelliSense (Ctrl+Space) to choose which field to populate.

- Tenant-specific profiles

   With this update, we introduce the system capability to define tenant-specific profiles. This has been one of the most requested features by partners who create extensions. You'll be able to use full capability of this feature in upcoming developer preview when we deliver compiler support to define a new tenant-specific profile directly in AL code. This update delivers only the underlying platform capability enabling extensions to define profiles.

   As a consequence of adding this feature we expanded the UI around Profile creation and selection to differentiate system-wide profiles from tenant-specific profiles. Now the page which is listing profiles identifies profile scope which is either System or Tenant. Additionally, in case a profile is introduced when installing an extension, you'll be able to see the extension name on that list.
    ![Profiles](https://msdnshared.blob.core.windows.net/media/2017/05/profiles.jpg)
   The profile card has been changed in similar way. Now you must choose the scope of new profile depending on a need to create a profile which is common for all tenants or tenant-specific.

   *Note: in Dynamics 365 for Financials the System option isn't available – a tenant administrator is not able to create System profiles, which would be shared with other tenants. The only option is to create a tenant-specific profile.*

   ![Profiles-Card](https://msdnshared.blob.core.windows.net/media/2017/05/profile-card.jpg)

   Stay tuned until the next update when you will be able to fully use this feature in your extensions.

- Other notable fixes:
    - Highly requested virtual tables are now available: User, Field, AllObj, AllObjWithCaption etc.
    - Powershell cmdlet support for exporting objects into new syntax.

# April Update (0.4.9209 - 2017/04/21)

Welcome to the April update for the Developer Preview. Again this month we've been working on a lot of exciting stuff. Check out the list of what's new below.
- GitHub reported issues fixed in this release: https://github.com/Microsoft/AL/milestone/5?closed=1
- Query and XmlPort objects have been added to the compiler.
- This update contains a conversion tool that allows you to take existing Dynamics NAV objects that have been exported in .txt format and convert them into the new .al format. It's a two-step process; firstly exporting the objects from C/SIDE in a cleaned format, and secondly converting them to the new syntax. Give it a try by following these steps:
Export the objects using the command line. The client GUI doesn't have the switch available, so you must use the command line, for example for table with ID 225:
   ```
   finsql.exe Command=ExportToNewSyntax, File=exportedObjects.txt, Database="Demo Database NAV (10-0)", ServerName=.\NAVDEMO ,Filter=Type=table;ID=225
   ```

   Run the txt2al.exe converter tool. The tool is located in the ..\Program Files (x86)\Microsoft Dynamics NAV\100\RoleTailored Client folder. Usage:
   ```
   txt2al <Source directory> <Destination directory> [-rename]
    -rename - Name the output files based on the object name.
   Important: The conversion tool should only be used for export. Importing objects that have been exported can damage your application!
   ```
- You can now embed Permission Sets, Tenant Web Service definitions, and Custom Report Layouts in Extensions V2. The process is similar to the one that you used for Extensions V1 and you can follow the existing documentation: https://msdn.microsoft.com/en-us/dynamics-nav/how-to-export-data-for-an-extension.
- AL:Go! startup is under development to start supporting the choice between online and local development. For now, just select the Local server option.
![AlGo](https://msdnshared.blob.core.windows.net/media/2017/04/algo_cloud.gif)
Typing Ctrl+Shift+P opens the command palette where you can execute the AL: Go! command. This will still prepare an empty project for you to start with and now includes a step for choosing if you're working locally or against a cloud instance.

   *Note: When you do an F5 deploy you may be asked to enter your Azure account. This is a bug and because we haven't been able to set 'local' for your debug environment. To set this yourself, select the debug button from the left-hand menu and pick the local in the drop-down list for the configuration.*

- In the Designer, drag and drop a page part to reposition it on the Role Center or FactBox pane. You can also hide an individual part. For now, the only way to make the hidden part visible again is to uninstall the extension or modify the extension using Visual Studio Code.
![DesignerDragParts](https://msdnshared.blob.core.windows.net/media/2017/04/designer_drag.gif)

- You can now reposition the Freeze Pane on any list page or part by using the jewel on the column header.
![DesignerFreezePane](https://msdnshared.blob.core.windows.net/media/2017/04/designer_freeze.gif)
- The new Query and XmlPorts objects have snippet support as well. Take a look at tquery and txmlport. Here is an example of an XmlPort object in the new syntax:
![XmlPortSyntax](https://msdnshared.blob.core.windows.net/media/2017/04/xmlport.png)

# March Update (0.2.8249 - 2017/03/28)

Welcome to the March update for the Developer Preview. We continue to fix bugs reported by you on our GitHub issues list [https://github.com/Microsoft/AL/milestone/3?closed=1] and made other improvements.
Here's what's new:
- We're making you more productive in the Designer! You can now reorder columns with a simple drag and drop, and you can hide or show columns. Try it out on any page with columns, such as worksheets, sales documents, or lists.
![DesignerAddColumn](https://msdnshared.blob.core.windows.net/media/2017/03/Add-a-column.gif)
- Report application objects join the list of supported objects! Create reports using new syntax and include them in your extensions.
Reports do support both Word and RDLC layout.
Layouts are now saved as external files. Save your layouts in a subdirectory of your VS Code project and then point to the file with the property wordlayout and rdlclayout.

   ![ReportLayout](https://msdnshared.blob.core.windows.net/media/2017/03/A0C4CB3F.png)

   *Note: At this time we have basic support for reports. Reports can be authored and they compile and run, but we're aware there are advanced scenarios that may not work. We're working hard to fix these and also encourage you to file issues you find to our GitHub project.*

   *Note: Report development does not include an integrated designer experience i.e., integration with Visual Studio for RDLC is missing but the Word editor will show fields in the XML Mapping from the Developer tab.*

   Sample code has been updated on the Azure VM to include Report 101 - Customer List.

- You may define a dependency on another extension by listing it in the app.json configuration file. Taking a dependency will allow you to code against objects including page extension object and table extension objects in that extension. Symbols from the extension will show up in IntelliSense.

# February Update (0.2.7308 - 2017/02/16)

Welcome to the February update for the Developer Preview.As in the last two updates, we've fixed bugs reported by you on our GitHub issues list (https://github.com/Microsoft/AL/milestone/2?closed=1) and made other improvements.

You can see a list of what's new below:
- Finishing your design work in the client now offers two options on saving, allowing you to save the changes to the tenant for all users, or to save the changes to a file that you can work on later in VS Code.Performance of the designer has improved and is snappier.
   ![DesignerFinishUp](https://msdnshared.blob.core.windows.net/media/2017/02/inclient_2.png)

- To guide users towards a better page design, we've been adding a few rules in the in-client designer. For example, you can only drop media fields onto card part pages. Also, you cannot drop a field under a repeater control, because this is not the design that list pages were intended for.

- Getting started in VS Code has been streamlined. Once you've installed the visx file, just enter AL: Go! in the command palette (Ctrl+Shift+P) and you'll be offered a new folder to build a solution in. The preset values are configured for your Azure Gallery instance and if you're missing the symbols for the project, VS Code will offer to download them for you. Note, we've introduced a shortcut for this too - Alt+A, Alt+L. Enjoy!
![AlGo](https://msdnshared.blob.core.windows.net/media/2017/02/algo.gif)

- We've made improvements in IntelliSense with contextual support for keywords in all objects - and we've added autocompletion and IntelliSense for setting values for the CalcFormula and TableRelation properties.
- You can now reference Query objects from the base application. This gives you the ability to declare variables of the type Query and call AL functions on them.
- References by symbols have been implemented meaning that you can find all references in an inline editor.Pressing Shift+F12 on top of a symbol will open a view that lets you jump to all instances of that symbol.Furthermore,selecting a symbol and pressing F2 allows you to rename all instances of that symbol. Note, that symbolic rename is cleverer than text matching and will only change the current symbol. For example, it will replace all instances of variable Foo, but not rename function Foo.
- Several AL variable types have been introduced mapping to the HTTP Client and JSON types. Using HttpClient, HttpResponseMessage, JsonObject, JsonToken, and JsonValue will allow you to access Azure functions and other Web services.

# January Update (0.2.6084 - 2017/01/14)

We've been bowled over by the positive comments from the community supporting this development effort. The team has read every suggestion, bug submitted, and idea and we're enthusiastic that you're so interested. That's why we're even happier to announce an update to the developer tools preview.

## The following is included in the update
- Fixed various bugs reported by the community in the in-client designer.
- You can now reference Report and XMLPort objects from the base application. This gives you the ability to use these objects in the RunObject property, as well as, declare variables of the types Report and XMLPort, and call AL functions on them.
- Improved IntelliSense for Pages and Tables. IntelliSense will offer keywords in Pages and Tables. The supported keywords will be offered in the correct context and are intended to help build the object correctly.
![KeywordsPage](https://msdnshared.blob.core.windows.net/media/2017/01/page_keywords.jpg)
![KeywordsPage2](https://msdnshared.blob.core.windows.net/media/2017/01/page_keywords_1.jpg)
![KeywordsTable](https://msdnshared.blob.core.windows.net/media/2017/01/table_keywords.jpg)
- IntelliSense for attributes. The list of available attributes will be displayed after typing '['. Each attribute will also include signature help showing the number and types of expected parameters. Also, IntelliSense for the EventSubscriber attribute offers lookup for the event name and the field/action name parameters which helps discover the available event publishers.
![IntellisenseAttributes](https://msdnshared.blob.core.windows.net/media/2017/01/event_subscriber.jpg)
- Fixed miscellaneous bugs reported to us. Issues submitted to the GitHub project issue list that have been fixed have been marked as included in the January update.
![BugListJanuary](https://msdnshared.blob.core.windows.net/media/2017/01/bugs_fixed1.jpg)

# December Preview Release (0.0.1 - 2016/12/20)

We're excited to introduce you to the new tools you'll use to build extensions and apps in and for Dynamics NAV. This December preview is meant as an appetizer and way for you to try out what we have so far. We've been looking forward to showing you what the new tools look like and let you take them for a spin.
The tools that you'll be using come in two flavors and both are available in preview from today.

## The in-client designer
![Designer](https://msdnshared.blob.core.windows.net/media/2016/12/Adding-a-field.gif)

Make an extension in the client itself. Business consultants and UX designers will love using this drag-and-drop interface. Rearrange fields, rename groups, and reposition elements to build a perfect extension to support an industry-specific solution or implement a business process optimization.

## Visual Studio Code
![VS Code](https://msdnshared.blob.core.windows.net/media/2016/12/vscode.png)

Use the AL Extension for NAV in Visual Studio Code to build powerful extensions based on tables, pages, and codeunits using the new objects: Page Extensions and Table Extensions. Follow this route to build rich extensions that reuse and extend core business logic in your application.

## I'm keen! How do I get started?
Two steps to get set up and then you can put rubber to the road. First you need an Azure Subscription. If you don't have one, you can get a free 30-day trial from https://azure.microsoft.com/free/ that will give you access to everything you need. If you do take the trial, you will need to provide a telephone number and credit card, but these are for ensuring you're not a bot and you won't be charged.
Secondly, head over to http://aka.ms/navdeveloperpreview. Login to your Azure Subscription. Select your subscription, resource group, location, name, and a VM Admin Password. Leave the remaining fields as their defaults. Accept the terms, Pin to dashboard and select Purchase. The instance takes about 5 minutes to set up, and the VM will be ready about 15 minutes after Azure says Deployment Succeeded. So go get a coffee and come right back.

## How do I learn more?
Great question! We were hoping you'd ask that. Check out our docs:
- [Tools overview](https://go.microsoft.com/fwlink/?linkid=835954)
- [Getting Started guide](https://go.microsoft.com/fwlink/?linkid=835955)
- [Object overview and AL language changes](https://go.microsoft.com/fwlink/?linkid=835956)

## This is great - how do I share the love?
Are you as excited as we are? Then blog or tweet using the tags #dyndev365, #msdynnav, and #code. Collaborate with us by adding your product ideas. Do that in GitHub https://github.com/microsoft/al/issues.

## I found a bug - what do I do?
We're sorry - we're still in preview and still learning too. It would help us so much if you can track down the bug and tell us. During the preview, the best way to let us know is to file it as an issue in GitHub https://github.com/microsoft/al/issues. The sooner we know, the sooner we can patch it and get it back out there.

## New builds! Where do I get a new build?
While we're in preview we're going to be fixing as many of those bugs as we can and we'll be working on new features too. We'll update the image on Azure Gallery about every month and let you know here on the blog when we do. We're also working on a process to get them out faster but with Christmas and the New Year coming up, it might just take a bit longer the first time.
Another warning, when we do provide a new gallery image, we won't be able to provide any upgrade tools between the versions. We'll try our best to avoid breaking changes but there are no promises.
