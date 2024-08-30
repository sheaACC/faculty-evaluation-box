import fs from 'fs'
import multer from 'multer'
const upload = multer({ dest: '/tmp/' })

var folderID = '243456623590'
export default function uploadFile(app, boxClient) {
  app.post('/upload-file', upload.single('rubric'), async (req, res, next) => {
    // req.file is the `rubric` file
    // req.body will hold the text fields, if there were any
    try {
      const { folderID, file } = req.body
      fs.createReadStream('/tmp/rubric')
      const boxResponse = await boxClient.files.uploadFile(folderID, fileStream)
      return res.status(200).json({
        boxResponse,
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({
        error,
      })
    }
  })
}

// client.files.uploadFile(folderID, 'My File.pdf', stream).then((file) => {
/* file -> {
			total_count: 1,
			entries: 
			[ { type: 'file',
				id: '11111',
				file_version: 
					{ type: 'file_version',
					id: '22222',
					sha1: '0beec7b5ea3f0fdbc95d0dd47f3c5bc275da8a33' },
				sequence_id: '0',
				etag: '0',
				sha1: '0beec7b5ea3f0fdbc95d0dd47f3c5bc275da8a33',
				name: 'My File.pdf',
				description: '',
				size: 68431,
				path_collection: 
					{ total_count: 1,
					entries: 
					[ { type: 'folder',
						id: '0',
						sequence_id: null,
						etag: null,
						name: 'All Files' } ] },
				created_at: '2017-05-16T15:18:02-07:00',
				modified_at: '2017-05-16T15:18:02-07:00',
				trashed_at: null,
				purged_at: null,
				content_created_at: '2017-05-16T15:18:02-07:00',
				content_modified_at: '2017-05-16T15:18:02-07:00',
				created_by: 
					{ type: 'user',
					id: '33333',
					name: 'Test User',
					login: 'test@example.com' },
				modified_by: 
					{ type: 'user',
					id: '33333',
					name: 'Test User',
					login: 'test@example.com' },
				owned_by: 
					{ type: 'user',
					id: '33333',
					name: 'Test User',
					login: 'test@example.com' },
				shared_link: null,
				parent: 
					{ type: 'folder',
					id: '0',
					sequence_id: null,
					etag: null,
					name: 'All Files' }
				item_status: 'active' } ] }
		*/
// })
