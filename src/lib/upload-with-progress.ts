/**
 * Uploads a file using XMLHttpRequest so we can track progress.
 * Returns the parsed JSON response on success, or throws an error.
 */
export function uploadFileWithProgress(
  file: File,
  onProgress: (percent: number) => void
): Promise<{ fileUrl: string; fileName: string }> {
  return new Promise((resolve, reject) => {
    const formData = new FormData()
    formData.append("file", file)

    const xhr = new XMLHttpRequest()

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100)
        onProgress(percent)
      }
    })

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText))
        } catch {
          reject(new Error("Invalid JSON response from server"))
        }
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`))
      }
    })

    xhr.addEventListener("error", () => reject(new Error("Network error during upload")))
    xhr.addEventListener("abort", () => reject(new Error("Upload was cancelled")))

    xhr.open("POST", "/api/upload")
    xhr.send(formData)
  })
}
