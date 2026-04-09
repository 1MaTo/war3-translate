# war3-translate

This packages was made partly to learn new things and only tested on single map, but i will try to update parse logic if will encounter errors later on

Package to translate Warcraft 3 (.w3x) maps

`npm install war3-translate`

For successfull translation map must be:
  1. Unprotected so stormlib api can open and modify it
  2. Contain `(listfile)` that used to read map structure

How it works
  1. Import files suited for translation (`.txt` and `.j` for now)
  2. Combine all extracted string fragments and call translate api
  3. Apply translated fragments to files
  4. Export files to cloned map

## Use as dependency

There is single `translate` method to be used
```js
translate({
  pathToMap: "C:\...\map.w3x",
  pathToTranslatedMap: "C:\...\map-translated.w3x",
  from: "zh",
  to: "en",
  provider: "google-free",
});
```

## Use via CLI
Example - Translate map from korean to english using google free (for testing) api and save file as `map-translated.w3x`
```bash
war3translate "C:\...\map.w3x" ko --to en --provider google-free --save "C:\...\map-translated.w3x"
```
For all info about CLI usage run `war3translate -h`

## Bugs
Bug reports are welcomed but for now i not intend to actively maintain this package (but can do it later)

### Credits
[Native bindings for StormLib](https://github.com/jamiephan/casclib-stormlib-monorepo) by Jamie Phan
