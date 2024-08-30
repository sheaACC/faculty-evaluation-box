import multer from 'multer'
import { departmentsByAos } from './departments-by-aos.js'

const upload = multer({
  dest: '/tmp/', // Location where files will be saved
})

const fileUploads = upload.fields([
  { name: 'all-rubrics' },
  { name: 'ip-rubric' },
])

export default function processForm(app, boxClient) {
  app.post('/process-form', fileUploads, function (req, res) {
    const { dept } = req.body
    console.log('departmentsByAos :>> ', departmentsByAos)
    console.log('BODY: ', req.body) // Text input
    console.log('DEPT ID: ', dept) // Text input

    // Find the department object based on the department ID
    const department = departmentsByAos
      .map((obj) => obj.departments)
      .flat()
      .find((department) => department.id === dept)
    console.log('DEPARTMENT: ', department.name)

    console.log('FILES: ', req.files) // Metadata about files (name, size, etc.)

    // try {
    //     const { folderID, file } = req.body
    //     fs.createReadStream('/tmp/rubric')
    //     const boxResponse = await boxClient.files.uploadFile(folderID, fileStream)
    //     return res.status(200).json({
    //       boxResponse,
    //     })
    //   } catch (error) {
    //     console.error(error)
    //     return res.status(500).json({
    //       error,
    //     })
    //   }
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
