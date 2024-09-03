import fs from 'fs'
import multer from 'multer'
import puppeteer from 'puppeteer'
import { departmentsByAos } from './departments-by-aos.js'
import { aosObjects } from './aos.js'

const upload = multer({
  dest: '/tmp/', // Location where files will be saved
})

const fileUploads = upload.fields([
  { name: 'all-rubrics' },
  { name: 'ip-rubric' },
])

// Puppeteer

async function generatePDFfromHTML(htmlContent, outputPath) {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.setContent(htmlContent)
  await page.pdf({
    path: outputPath,
    format: 'A4',
    margin: { top: 20, right: 20, bottom: 20, left: 20 },
  })
  await browser.close()
}
// jsPDF
// function generatePDFfromHTML(htmlContent, outputPath) {
//   const doc = new jsPDF()
//   doc.text(htmlContent, 10, 10)
//   doc.save(outputPath)
//   console.log('PDF generated successfully')
// }

export default function processForm(app, boxClient) {
  app.post('/process-form', fileUploads, async function (req, res) {
    const { aos, dept } = req.body
    console.log('departmentsByAos :>> ', departmentsByAos)
    console.log('BODY: ', req.body) // Text input
    console.log('DEPT ID: ', dept) // Text input

    // Find the aos object based on the aos abbreviation
    const aosObject = aosObjects.find((obj) => obj.abbr === aos)

    console.log('AOS: ', aosObject.name)

    // Find the department object based on the department ID
    const department = departmentsByAos
      .map((obj) => obj.departments)
      .flat()
      .find((department) => department.id === dept)
    console.log('DEPARTMENT: ', department.name)

    console.log('FILES: ', req.files) // Metadata about files (name, size, etc.)

    let htmlContent = `
    <!DOCTYPE html>
      <html>
        <head>
            <title>HTML content</title>
        </head>
        <body>
          <h1>Form Data</h1>
          <p>Department: ${aosObject.name}</p>
          <p>Department: ${department.name}</p>
        </body>
      </html>
    `
    console.log('html :>> ', htmlContent)

    // generatePDFfromHTML(htmlContent, 'custom.pdf') // jsPDF

    generatePDFfromHTML(htmlContent, './tmp/custom.pdf')
      .then(async () => {
        console.log('PDF generated successfully')
        // Wait 5 seconds before uploading the file
        await new Promise((resolve) => setTimeout(resolve, 5000))

        console.log('5 seconds have passed')

        // setTimeout(() => {
        //   console.log('5 seconds have passed')
        // }, 5000)

        var stream = fs.createReadStream('/tmp/custom.pdf')
        var options = {
          content_created_at: '2015-05-12T17:38:14-0600',
          content_modified_at: '2016-02-15T22:42:09-0600',
        }
        boxClient.files
          // Use the root folder ID '0' for testing
          .uploadFile('0', 'NewPDF.pdf', stream, options)

          // .uploadFile(dept, 'NewPDF.pdf', stream, options)
          .then((file) => {
            console.log('file :>> ', file)
            return res.status(200).json({
              file,
            })
          })
          .catch((error) => {
            console.error('Error generating PDF:', error)
            if (error.statusCode === 409) {
              res.send('There is already a file with that name')

              // return res.status(409).json({
              //   error: 'File already exists',
              // })
            }
          })
      })

      // try {
      //   // dept is the ID of the folder where the file will be uploaded
      //   const { dept } = req.body
      //   const fileStream = fs.createReadStream('./tmp/custom.pdf')
      //   const boxResponse = await boxClient.files.uploadFile(dept, fileStream)
      //   return res.status(200).json({
      //     boxResponse,
      //   })
      // } catch (error) {
      //   console.error(error)
      //   return res.status(500).json({
      //     error,
      //   })
      // }

      .catch((err) => console.error('Error generating PDF:', err))
  })
}

// Example of req.body:

// {
//     aos: 'ed',
//     dept: 'ed-2',
//     'course-materials': '',
//     'reflection-forms': '',
//     'additional-materials': '',
//     'specific-materials': '',
//     'number-of-courses': '',
//     'summer-refllection': '',
//     performance: '',
//     'professional-service': '',
//     'other-instructions': '',
//     'evaluation-process': '',
//     'ft-ip': '',
//     'adj-ip': '',
//     'ft-sf': '',
//     'adj-sf': '',
//     'ft-ap': '',
//     'adj-ap': '',
//     'ft-pd': '',
//     'adj-pd': '',
//     'ft-ps': '',
//     'adj-ps': ''
//   }
