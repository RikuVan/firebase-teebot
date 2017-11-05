# Firebase cloud function bot example

Although this example uses Express and renders one 'log' view, Express is unnecessary for a single endpoint. However, the firebase console logs are awkward to use for more than very basic debugging, so this might be one way to log data. If you do want to render a view from the server, notice you will need to remove the index.html that comes with initialising hosting under 'public'. You will also need to change the firebase.json as in this example to render the function instead of the index.html. 

### Getting started

1. Get a [Firebase account](https://firebase.google.com).
2. Install the firebase cli `npm install -g firebase-tools`

Some useful commands:
- `firebase login`
- `firebase init functions`
- `firebase init hosting` (only needed if you want to render html)
- `firebase deploy --only functions`
- `firebase functions:log`
- `firebase server only --functions,hosting` (run locally)
