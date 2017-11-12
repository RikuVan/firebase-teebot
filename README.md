# Firebase cloud function bot with Preact UI example

This example uses Express and Preact to render 'config' and 'log' views, which can be useful since firebase logging is awkward for anything other than basic debugging.

For a easier version of this bot, checkout the first commit to this repo.

This example also offers an endpoint 'https://battlecube-teebot.firebaseio.com/config' for changing bot parameters: .
```json
{
  "minMoves": 1,
  "moveFraction": 2,
  "implodeRadiusFraction": 2,
  "explodeImplodeRatio": 0.8,
  "randomMovement": false,
  "randomTargeting": false,
  "randomSpread": false,
  "deterministic": false,
  "verbose": false
}
```

### Getting started adding your own bot

1. Get a [Firebase account](https://firebase.google.com).
2. Install the firebase cli `npm install -g firebase-tools`

Some useful commands:
- `firebase login`
- `firebase init functions`
- `firebase init hosting` (only needed if you want to render html)
- `firebase deploy --only functions`
- `firebase functions:log`
- `firebase server only --functions,hosting` (run locally)
