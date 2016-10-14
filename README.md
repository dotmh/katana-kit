KATANA KIT
==========
[![CircleCI](https://circleci.com/gh/dotmh/katana-kit.svg?style=svg)](https://circleci.com/gh/dotmh/katana-kit)
[![Coverage Status](https://coveralls.io/repos/github/dotmh/katana-kit/badge.svg?branch=master)](https://coveralls.io/github/dotmh/katana-kit?branch=master)
[![Known Vulnerabilities](https://snyk.io/test/github/dotmh/katana-kit/badge.svg)](https://snyk.io/test/github/dotmh/katana-kit)
[![bitHound Overall Score](https://www.bithound.io/github/dotmh/katana-kit/badges/score.svg)](https://www.bithound.io/github/dotmh/katana-kit)
[![bitHound Dependencies](https://www.bithound.io/github/dotmh/katana-kit/badges/dependencies.svg)](https://www.bithound.io/github/dotmh/katana-kit/master/dependencies/npm)
[![Dependency Status](https://gemnasium.com/badges/github.com/dotmh/katana-kit.svg)](https://gemnasium.com/github.com/dotmh/katana-kit)

A Kit for building Javascript apps, using Common JS. Aimed at Node though some classes will work in both node
and the browser.

Installation
------------
Recommend that you use [Yarn](https://yarnpkg.com/) rather than NPM.

### Yarn
```
yarn add katana-kit
```

### NPM
```
npm install --save katana-kit
```

Usage
-----
You can include the entire library in your code with
```
const katana = require('katana-kit')
```
or see the API Documentation below to require the individual components.

API Documentation
-----------------

Katana Kit is made up of a series of components

### Collection
A collection is a specialist object that can be observed

#### Usage
```
let Collection = require('katana-kit').Collection;
```
[Documentation](collection.html)

----

### Eventify
Turn any class into an event emitter/handler

#### Usage
```
let Eventify = require('katana-kit').Eventify;

class MyClass extends Eventify
{
// ...
}
```
[Documentation](eventify.html)

----

### FileExt
__! NODE ONLY__

A collection of functions that extend the built in node `fs`

#### Usage
```
let FileExt = require('katana-kit').FileExt;
```
[Documentation](file_ext.html)

----

### JsonFile

__! NODE ONLY__

Wrap a Json file in a collection and validate it with schemas. Adding a powerful and standard API to access
JSON files in your app.

#### Usage
```
let JsonFile = require('katana-kit').JsonFile;
```
[Documentation](json_file.html)

----

### Logger

A wrapper round `console.log` to help standardise log messages, making them easier to read and parse.

#### Usage
```
let Logger = require('katana-kit').Logger;
```
[Documentation](logger.html)

----

### Schema

Validate Javascript objects against a defined Schema (in JSON)

#### Usage
```
let Schema = require('katana-kit').Schema;
```
[Documentation](schema.html)