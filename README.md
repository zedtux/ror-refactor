# Ruby On Rails Refactor package

A set of refactoring tools for Ruby On Rails. It should ease your life.

[![Build Status](https://travis-ci.org/zedtux/ror-refactor.svg?branch=master)](https://travis-ci.org/zedtux/ror-refactor)

## Refactoring tools

This lists the available refactoring tools installed by this package:

 - Extract Method (Move a piece of code in a new method)
 - Extract Line (Move a piece of code line in a new method)
 - Extract Service (Move methods in a new Class)

## Installation

You can install it from the console with:

```bash
$ apm install ror-refactor
```

Or from Atom itself.

## Usage

#### Extract Method

Select a bunch of code then hit `CTRL + ALT + CMD + R`:

![ror-refactor-extract-method](https://cloud.githubusercontent.com/assets/478564/17622508/19844a66-609b-11e6-8fec-6fa7dfa42bb1.gif)

#### Extract Line

Select a piece of code line then hit `CTRL + ALT + CMD + R`:

![ror-refactor-extract-line](https://cloud.githubusercontent.com/assets/478564/17705195/d7817108-63d7-11e6-8717-e5dc996312b3.gif)

#### Extract Service

Select a bunch of methods to move in a new class then hit `CTRL + ALT + CMD + R`:

![ror-refactor-extract-service](https://cloud.githubusercontent.com/assets/478564/17926623/1dffdc30-69f2-11e6-8066-173dee88a4c9.gif)

You can specify the following options:

![ror-refactor-extract-service-options](https://cloud.githubusercontent.com/assets/478564/20620846/05cbb3a2-b2fc-11e6-832b-791b5b32b6d5.png)


## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request
