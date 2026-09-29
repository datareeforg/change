# Be The Change app icons

The manifest uses scalable SVG icons so the PWA has a crisp branded fallback at every requested size: 16, 32, 48, 72, 96, 128, 144, 152, 167, 180, 192, 256, 384, and 512 pixels. `icon-maskable.svg` keeps the globe and mission node inside a generous safe area, and `icon-monochrome.svg` is the valid monochrome variant.

For store submission or device-specific catalog requirements, export the same vectors to separate PNGs at those exact sizes without changing the safe padding, then update `manifest.webmanifest` entries to the exported files. No tiny text is used in the artwork.
