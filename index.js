import 'dotenv/config'
import serverless from 'serverless-http'
import express from 'express'
import cors from 'cors'
import * as path from 'path'
import BoxSDK from 'box-node-sdk'
import processForm from './process-form.js'
import uploadFile from './upload-file.js'
import token from './jwt.js'

// Filetypes to allow: PDF, docx, doc, xls, xlsx

const {
  clientID,
  clientSecret,
  enterpriseID,
  keyID,
  privateKey,
  passphrase,
  appUserID,
} = process.env

if (!clientID || !clientSecret) {
  console.error('Missing Box app credentials!')
  process.exit(1)
}

var sdk = new BoxSDK({
  clientID,
  clientSecret,
  appAuth: {
    keyID,
    privateKey,
    passphrase,
  },
})

// Get the service account client, used to create and manage app user accounts
var boxClient = sdk.getAppAuthClient('enterprise', enterpriseID)

const app = express()

app.use(cors())

uploadFile(app, boxClient)

app.get('/', (req, res) => {
  res.sendFile(path.join(process.cwd(), './public/index.html'))
})

app.get('/upload', (req, res, next) => {
  res.sendFile(path.join(process.cwd(), './public/upload-form.html'))
})

app.get('/explore', (req, res, next) => {
  res.sendFile(path.join(process.cwd(), './public/box-explorer.html'))
})

// ####### PROCESS FORM ####### //

processForm(app, boxClient)

// ####### TOKEN ROUTE ####### //

token(app)

// app.get('/token', async (req, res) => {
//   console.log('Inside token route TOKEN :>> ', token)
//   const apiToken = token
//   return res.status(200).json({
//     token: apiToken,
//   })
// })

app.get('/aos', async (req, res, next) => {
  try {
    const boxResponse = await boxClient.folders.getItems('0', {
      usemarker: 'false',
      fields: 'name',
      offset: 0,
    })
    const aos = boxResponse.entries.map((entry) => ({
      name: entry.name,
      id: entry.id,
    }))
    return res.status(200).json({
      aos,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      error,
    })
  }
})

app.use(express.static('public'))

app.use((req, res, next) => {
  return res.status(404).json({
    error: 'Not Found',
  })
})

app.listen(3000, function () {
  console.log('Server is listening on http://localhost:3000 ...')
})

export const handler = serverless(app)
