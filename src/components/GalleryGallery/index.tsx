'use client'

import Image from 'next/image'
import { Play, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import type { Gallery, Media } from '@/payload-types'
import { cn } from '@/utilities/ui'

type ResolvedMedia = Media

type Props = {
  items: Gallery[]
  variant?: 'ticker' | 'grid'
}

const isMedia = (value: Gallery['media'] | Gallery['poster']): value is ResolvedMedia =>
  typeof value === 'object' && value !== null

const mediaSrc = (media: ResolvedMedia) => media.url || `/api/media/file/${media.filename}`

const GalleryTile = ({ item, onOpen, ticker = false, duplicate = false }: { item: Gallery; onOpen: () => void; ticker?: boolean; duplicate?: boolean }) => {
  const media = isMedia(item.media) ? item.media : null
  const poster = isMedia(item.poster) ? item.poster : null
  const visual = item.mediaType === 'video' ? poster || media : media
  const groupLabel = item.group || 'Gallery'

  if (!visual?.url && !visual?.filename) return null

  return (
    <button
      type="button"
      onClick={onOpen}
      tabIndex={duplicate ? -1 : undefined}
      className={cn(
        'group relative block shrink-0 overflow-hidden bg-surface-deep text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-surface-page',
        ticker ? 'h-56 w-[min(72vw,22rem)] sm:h-64 sm:w-[22rem]' : 'aspect-[4/3] w-full',
      )}
      aria-label={`Open ${groupLabel} gallery item${item.mediaType === 'video' ? ' video' : ''}`}
    >
      {item.mediaType === 'video' && !poster && media ? (
        <video
          muted
          playsInline
          preload="metadata"
          className="size-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.04]"
          aria-hidden="true"
        >
          <source src={mediaSrc(media)} type={media.mimeType || undefined} />
        </video>
      ) : (
        <Image
          src={mediaSrc(visual)}
          alt={visual.alt || item.title}
          fill
          sizes={ticker ? '(min-width: 640px) 352px, 72vw' : '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'}
          className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.04]"
        />
      )}
      {item.mediaType === 'video' && (
        <span className="absolute left-4 top-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-midnight/90 px-3 text-caption font-medium uppercase tracking-[0.12em] text-white">
          <Play size={15} fill="currentColor" aria-hidden="true" /> Video
        </span>
      )}
    </button>
  )
}

export const GalleryGallery = ({ items, variant = 'grid' }: Props) => {
  const [selected, setSelected] = useState<Gallery | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const tickerRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef({ active: false, startX: 0, startScroll: 0, moved: false })
  const selectedMedia = selected && isMedia(selected.media) ? selected.media : null
  const selectedPoster = selected && isMedia(selected.poster) ? selected.poster : null

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (selected && !dialog.open) dialog.showModal()
    if (!selected && dialog.open) dialog.close()
  }, [selected])

  const close = () => setSelected(null)
  const tileItems = variant === 'ticker' ? [...items, ...items] : items
  const groups = items.reduce<{ label: string; items: Gallery[] }[]>((result, item) => {
    const label = item.group || 'Gallery'
    const existing = result.find((group) => group.label === label)
    if (existing) existing.items.push(item)
    else result.push({ label, items: [item] })
    return result
  }, [])

  return (
    <>
      {variant === 'ticker' ? (
        <div
          ref={tickerRef}
          className="gallery-ticker relative cursor-grab overflow-x-auto active:cursor-grabbing"
          aria-label="AGBN gallery"
          onPointerDown={(event) => {
            if (event.pointerType !== 'mouse') return
            dragRef.current = {
              active: true,
              startX: event.clientX,
              startScroll: event.currentTarget.scrollLeft,
              moved: false,
            }
            event.currentTarget.setPointerCapture(event.pointerId)
          }}
          onPointerMove={(event) => {
            const drag = dragRef.current
            if (!drag.active) return
            const distance = event.clientX - drag.startX
            if (Math.abs(distance) > 4) drag.moved = true
            event.currentTarget.scrollLeft = drag.startScroll - distance
          }}
          onPointerUp={(event) => {
            if (dragRef.current.active) event.currentTarget.releasePointerCapture(event.pointerId)
            dragRef.current.active = false
          }}
          onPointerCancel={() => { dragRef.current.active = false }}
          onClickCapture={(event) => {
            if (dragRef.current.moved) {
              event.preventDefault()
              event.stopPropagation()
              dragRef.current.moved = false
            }
          }}
          onWheel={(event) => {
            if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
              event.preventDefault()
              event.currentTarget.scrollLeft += event.deltaY
            }
          }}
        >
          <div className="gallery-ticker-track flex w-max gap-3 px-3 sm:gap-4 sm:px-4">
            {tileItems.map((item, index) => (
              <GalleryTile key={`${item.id}-${index}`} item={item} onOpen={() => setSelected(item)} ticker duplicate={index >= items.length} />
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-12">
          {groups.map((group) => (
            <section key={group.label} aria-labelledby={`gallery-group-${group.label.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`}>
              <h2 id={`gallery-group-${group.label.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`} className="mb-5 text-display-s text-on-surface-heading">
                {group.label}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
                {group.items.map((item) => <GalleryTile key={item.id} item={item} onOpen={() => setSelected(item)} />)}
              </div>
            </section>
          ))}
        </div>
      )}

      <dialog
        ref={dialogRef}
        aria-labelledby="gallery-viewer-title"
        onCancel={close}
        onClick={(event) => {
          if (event.target === event.currentTarget) close()
        }}
        className="m-auto w-[min(96vw,76rem)] max-w-none overflow-hidden border border-white/20 bg-midnight p-0 text-on-dark shadow-2xl backdrop:bg-midnight/85"
      >
        {selected && selectedMedia && (
          <div className="relative">
            <div className="max-h-[78vh] min-h-[15rem] bg-black">
              {selected.mediaType === 'video' ? (
                <video
                  controls
                  autoPlay
                  playsInline
                  poster={selectedPoster ? mediaSrc(selectedPoster) : undefined}
                  className="max-h-[78vh] w-full object-contain"
                >
                  <source src={mediaSrc(selectedMedia)} type={selectedMedia.mimeType || undefined} />
                  Your browser does not support this video.
                </video>
              ) : (
                <Image
                  src={mediaSrc(selectedMedia)}
                  alt={selectedMedia.alt || selected.title}
                  width={selectedMedia.width || 1600}
                  height={selectedMedia.height || 1000}
                  sizes="96vw"
                  className="max-h-[78vh] w-full object-contain"
                />
              )}
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-white/15 px-4 py-3 sm:px-5">
              <h2 id="gallery-viewer-title" className="text-body-m font-medium text-on-dark">{selected.group}</h2>
              <button type="button" onClick={close} className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-on-dark-muted transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold" aria-label="Close gallery viewer">
                <X size={20} aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </dialog>
    </>
  )
}
