import fs from 'fs'
import path from 'path'

type NoteHandler<T> = (fileName: string, subject: string, note: Buffer, result: T) => T

export async function iterNotes<T>(handler: NoteHandler<T>) {
  const result = {} as T

  const notesDir = path.join(process.cwd(), 'content', 'notes')
  for (const subject of fs.readdirSync(notesDir)) {
    const subjectDir = path.join(notesDir, subject)

    for (const fileName of fs.readdirSync(subjectDir)) {
      const regex = new RegExp('[^.]+$')
      if (fileName.match(regex)) {
        const note = fs.readFileSync(path.join(subjectDir, fileName))
				handler(fileName, subject, note, result)
      }
    }
  }
  return result
}

export function wrapPromise<T>(promise: Promise<T>) {
  let status = 'pending'
  let response

  const suspender = promise.then(
    (res) => {
      status = 'success'
      response = res
    },
    (err) => {
      status = 'error'
      response = err
    }
  )
  const read = () => {
    switch (status) {
      case 'pending':
        throw suspender
      case 'error':
        throw response
      default:
        return response
    }
  }
  return {read}
}
