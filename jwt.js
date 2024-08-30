import fs from 'fs'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import axios from 'axios'
import querystring from 'querystring'

export default function getToken(app) {
  app.get('/token', async (req, res) => {
    console.log('Inside token route TOKEN')
    // const apiToken = token

    // https://developer.box.com/guides/authentication/jwt/without-sdk/#1-read-json-configuration

    // 1. Read JSON configuration
    const config = JSON.parse(fs.readFileSync('config.json'))

    // 2. Decrypt private key

    let key = {
      key: config.boxAppSettings.appAuth.privateKey,
      passphrase: config.boxAppSettings.appAuth.passphrase,
    }

    // 3. Create JWT assertion

    const authenticationUrl = 'https://api.box.com/oauth2/token'

    let claims = {
      iss: config.boxAppSettings.clientID,
      sub: config.enterpriseID,
      box_sub_type: 'enterprise',
      aud: authenticationUrl,
      jti: crypto.randomBytes(64).toString('hex'),
      exp: Math.floor(Date.now() / 1000) + 45,
    }

    let keyId = config.boxAppSettings.appAuth.publicKeyID
    console.log('keyId :>> ', keyId)

    let headers = {
      algorithm: 'RS512',
      keyid: keyId,
    }

    let assertion = jwt.sign(claims, key, headers)

    // 4. Request Access Token

    let accessToken = await axios
      .post(
        authenticationUrl,
        querystring.stringify({
          grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
          assertion: assertion,
          client_id: config.boxAppSettings.clientID,
          client_secret: config.boxAppSettings.clientSecret,
        })
      )
      .then((response) => {
        console.log('response.data :>> ', response.data)
        return response.data.access_token
      })

    return res.status(200).json({
      token: accessToken,
    })
  })
}

// console.log('Inside JWT.js :>> ')
// // https://developer.box.com/guides/authentication/jwt/without-sdk/#1-read-json-configuration

// // 1. Read JSON configuration

// const config = JSON.parse(fs.readFileSync('config.json'))

// // 2. Decrypt private key

// let key = {
//   key: config.boxAppSettings.appAuth.privateKey,
//   passphrase: config.boxAppSettings.appAuth.passphrase,
// }

// // 3. Create JWT assertion

// const authenticationUrl = 'https://api.box.com/oauth2/token'

// let claims = {
//   iss: config.boxAppSettings.clientID,
//   sub: config.enterpriseID,
//   box_sub_type: 'enterprise',
//   aud: authenticationUrl,
//   jti: crypto.randomBytes(64).toString('hex'),
//   exp: Math.floor(Date.now() / 1000) + 45,
// }

// let keyId = config.boxAppSettings.appAuth.publicKeyID
// console.log('keyId :>> ', keyId)

// let headers = {
//   algorithm: 'RS512',
//   keyid: keyId,
// }

// let assertion = jwt.sign(claims, key, headers)

// // 4. Request Access Token

// let accessToken = await axios
//   .post(
//     authenticationUrl,
//     querystring.stringify({
//       grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
//       assertion: assertion,
//       client_id: config.boxAppSettings.clientID,
//       client_secret: config.boxAppSettings.clientSecret,
//     })
//   )
//   .then((response) => {
//     console.log('response.data :>> ', response.data)
//     return response.data.access_token
//   })

// // 5. Export Access Token

// export default accessToken
