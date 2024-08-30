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
  res.send('This is a the home page!')
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
const dontCache = (req, res, next) => {
  res.setHeader('Surrogate-Control', 'no-store')
  res.setHeader(
    'Cache-Control',
    'no-store, no-cache, must-revalidate, proxy-revalidate'
  )
  res.setHeader('Expires', '0')
  next()
}

app.get('/token', dontCache, (req, res) => {
  return res.status(200).json({
    token,
  })
})

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

// [
//   ({ name: 'Arts, Digital Media & Communications', id: '243456623590' },
//   { name: 'Business', id: '243469218468' },
//   { name: 'Computer Science & IT', id: '243456982989' },
//   { name: 'Culinary, Hospitality, Tourism', id: '243455411349' },
//   {
//     name: 'Design, Manufacturing, Construction & Applied Technologies',
//     id: '243455975005',
//   },
//   { name: 'Education', id: '243468433972' },
//   { name: 'Health Sciences', id: '243467987344' },
//   { name: 'Liberal Arts', id: '243455662920' },
//   { name: 'Public & Social Services', id: '243468208150' },
//   { name: 'Science, Engineering & Math', id: '243470173965' })
// ]
