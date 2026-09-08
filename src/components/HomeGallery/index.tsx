import Image from 'next/image'

import { Reveal } from '@/components/Reveal'

/**
 * The homepage gallery. Brand DNA §2 asks the site to look pan-African rather
 * than defaulting to one country's visual cues, and §5.5 asks for real sites,
 * real people, real equipment.
 *
 * Deliberately NOT a uniform grid of equal tiles — that is the single most
 * template-looking thing this section could have been. Tiles vary in width and
 * one spans both rows, so the block reads as an edit rather than a dump.
 *
 * These five countries are all absent from the sector imagery used elsewhere on
 * the site, so the gallery widens the "54 countries" claim instead of repeating
 * it. Central Africa in particular had no representation before this.
 *
 * Images are plain files under `public/home/` rather than CMS uploads: this is
 * curated brand furniture, not editorial content, and swapping in real
 * commissioned photography is then a file replacement rather than a migration.
 */
type Tile = {
  src: string
  country: string
  sector: string
  alt: string
  /** Layout classes. The mosaic is hand-placed; see the grid comment below. */
  className: string
  /** Only the first tile is worth prioritising; the rest are below the fold. */
  sizes: string
}

const TILES: Tile[] = [
  {
    src: '/home/gallery-douala.jpg',
    country: 'Cameroon',
    sector: 'Wholesale trade',
    alt: 'A trader counting stock on a notepad among sacks and crates at a wholesale market stall in Douala, Cameroon.',
    className: 'col-span-2 aspect-[4/3] md:col-span-5 md:row-span-2 md:aspect-auto',
    sizes: '(min-width: 1024px) 40vw, 100vw',
  },
  {
    src: '/home/gallery-cairo.jpg',
    country: 'Egypt',
    sector: 'Textiles',
    alt: 'A cutter marking fabric with chalk on a long workbench in a textile workshop in Cairo, Egypt.',
    className: 'aspect-square md:col-span-4 md:aspect-auto',
    sizes: '(min-width: 1024px) 30vw, 50vw',
  },
  {
    src: '/home/gallery-luanda.jpg',
    country: 'Angola',
    sector: 'Ports & logistics',
    alt: 'A checker with a tally sheet walking a line of stacked shipping containers at the port of Luanda, Angola.',
    className: 'aspect-square md:col-span-3 md:aspect-auto',
    sizes: '(min-width: 1024px) 22vw, 50vw',
  },
  {
    src: '/home/gallery-bamako.jpg',
    country: 'Mali',
    sector: 'Fabrication',
    alt: 'A metalworker shaping a steel frame at a workbench in a fabrication workshop in Bamako, Mali.',
    className: 'aspect-square md:col-span-3 md:aspect-auto',
    sizes: '(min-width: 1024px) 22vw, 50vw',
  },
  {
    src: '/home/gallery-tunis.jpg',
    country: 'Tunisia',
    sector: 'Professional services',
    alt: 'A woman working at a laptop while a colleague pulls a folder from a filing cabinet in a shared office in Tunis, Tunisia.',
    className: 'aspect-square md:col-span-4 md:aspect-auto',
    sizes: '(min-width: 1024px) 30vw, 50vw',
  },
]

export const HomeGallery: React.FC = () => (
  /*
    Desktop mosaic, 12 columns over 2 fixed-height rows:

      ┌───────────┬────────┬─────┐
      │           │ Cairo  │Luan │   row 1  5 + 4 + 3
      │  Douala   ├─────┬──┴─────┤
      │           │Bam. │ Tunis  │   row 2  5 + 3 + 4
      └───────────┴─────┴────────┘

    Rows are given an explicit height so every tile fills its cell with
    object-cover. Deriving heights from per-tile aspect ratios instead left the
    two rows unequal, because tile widths differ.
  */
  <div className="grid grid-cols-2 gap-3 sm:gap-4 md:h-[30rem] md:grid-cols-12 md:grid-rows-2 lg:h-[36rem]">
    {TILES.map((tile, i) => (
      <Reveal
        key={tile.src}
        delay={i * 60}
        className={`group relative overflow-hidden rounded-lg ${tile.className}`}
      >
        <Image
          src={tile.src}
          alt={tile.alt}
          fill
          sizes={tile.sizes}
          className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.03]"
        />

        {/*
          Captions are gold on a scrim rather than gold on the raw photograph.
          Brand DNA §5.2 only allows gold over Navy or Midnight, and an
          unscrimmed photo is neither — a light patch behind the label would
          drop it well under AA.
        */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-midnight via-midnight/70 to-transparent p-4 pt-10">
          <p className="font-mono text-caption uppercase tracking-[0.14em] text-gold">
            {tile.country}
          </p>
          <p className="mt-0.5 text-body-s text-on-dark">{tile.sector}</p>
        </div>
      </Reveal>
    ))}
  </div>
)
