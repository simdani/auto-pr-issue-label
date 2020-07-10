# Auto PR issue label

Example of usage:

```YML
name: "Auto pr worflow"
on:
  pull_request:
    types: [opened, closed]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Auto PR issue label
        uses: simdani/auto-pr-issue-label@master
```

it's also possible to configure in review and done labels differently:

```YML
  steps:
    - uses: simdani/auto-pr-issue-label@master
      with:
        github-token: ${{ github.token }} # default
        in-review-label: '{"name": "In-Review", "color": "#c2e0c6"}' # default
        done-label: '{"name": "Resolved (test it)", "color": "#0e8a16"}' # default
```

## Code in Master

Install the dependencies
```bash
$ npm install
```

Build the typescript and package it for distribution
```bash
$ npm run build && npm run pack
```

Run the tests :heavy_check_mark:
```bash
$ npm test

 PASS  ./index.test.js
  ✓ throws invalid number (3ms)
  ✓ wait 500 ms (504ms)
  ✓ test runs (95ms)
```

## Publish to a distribution branch

Actions are run from GitHub repos so we will checkin the packed dist folder.

Then run [ncc](https://github.com/zeit/ncc) and push the results:
```bash
$ npm run pack
$ git add dist
$ git commit -a -m "prod dependencies"
$ git push origin releases/v1
```

Your action is now published! :rocket:

See the [versioning documentation](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md)
