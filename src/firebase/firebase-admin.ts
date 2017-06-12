import { FirebaseUser } from './firebase-admin';

import * as admin from 'firebase-admin';
let serviceAccount = require("../SaludYa.json");



admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://saludyadev.firebaseio.com"
});



export function retrieveUserByToken(idToken: string, callback) {
    admin.auth().verifyIdToken(idToken)
        .then(function (decodedToken) {
            var uid = decodedToken.uid;
            // ...
            admin.auth().getUser(uid)
                .then(function (userRecord) {
                    // See the UserRecord reference doc for the contents of userRecord.

                    callback(null, userRecord);
                })
                .catch(function (err) {
                    callback(err, null);
                });
        }).catch(function (err) {
            // Handle error
            callback(err, null);
        });
}

export interface FirebaseUser {
    email: string;
    password: string;
    displayName: string;
}

export function createUserWithEmail(user: FirebaseUser, callback) {
    admin.auth().createUser(user)
        .then(function (userRecord) {
            // See the UserRecord reference doc for the contents of userRecord.
            callback(null, userRecord);
        })
        .catch(function (err) {
            callback(err, null);
            // Handle error
        });
}


