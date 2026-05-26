import { useState, useRef } from 'react'
import { uploadImage } from '../api/cloudinary'

interface Props {
  images: string[]
  onChange: (urls: string[]) => void
  max?: number
}

export const ImageUploader = ({ images, onChange, max = 5 }: Props) => {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = async (files: FileList) => {
    if (images.length >= max) return
    setUploading(true)
    try {
      const uploads = Array.from(files).slice(0, max - images.length)
      const urls = await Promise.all(uploads.map(uploadImage))
      onChange([...images, ...urls])
    } catch (e) {
      console.error('Upload error:', e)
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (idx: number) => {
    onChange(images.filter((_, i) => i !== idx))
  }

  return (
    <div className="flex flex-col gap-3">
      <label className="text-xs text-text-muted uppercase tracking-wider">
        Фотографии объекта ({images.length}/{max})
      </label>

      {/* Preview grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((url, i) => (
            <div key={i} className="relative aspect-video rounded-lg overflow-hidden border border-border-subtle group">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                onClick={() => removeImage(i)}
                className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/70 rounded-full items-center justify-center hidden group-hover:flex transition-all"
              >
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                </svg>
              </button>
              {i === 0 && (
                <span className="absolute bottom-1.5 left-1.5 text-xs bg-orange text-white px-1.5 py-0.5 rounded font-medium">
                  Главная
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload zone */}
      {images.length < max && (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
          className="border border-dashed border-border-default rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-orange transition-colors group"
        >
          {uploading ? (
            <>
              <div className="w-6 h-6 border-2 border-border-subtle border-t-orange rounded-full animate-spin" />
              <span className="text-xs text-text-muted">Загружаем...</span>
            </>
          ) : (
            <>
              <svg className="w-8 h-8 text-text-ghost group-hover:text-orange transition-colors" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-xs text-text-muted">Перетащи фото или <span className="text-orange">выбери файл</span></span>
              <span className="text-xs text-text-ghost">PNG, JPG до 10MB</span>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={e => e.target.files && handleFiles(e.target.files)}
          />
        </div>
      )}
    </div>
  )
}