# Gallery source files

Place the source files from `D:\AGBN Video Shoot\For Gallery` in this folder before importing them into Payload.

Run `npm run seed:gallery` from the Node 22 deployment environment after transfer. It normalizes every supported filename to lowercase hyphenated form, uploads it to Media, and creates a published Gallery record. Videos receive the Video marker automatically. A poster image remains recommended for each video, but the first video frame is used if no poster is supplied.

This directory is intentionally separate from `public/media`: `public/media` is Payload's runtime upload store and is mounted persistently in Docker. Do not copy source files directly into it, because Payload also needs a Media record for every gallery asset.
