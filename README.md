# Fetchbench

A fast, free download manager for Windows 10 and 11.

- **Multi-connection downloads** — files are split into parts and fetched in parallel; idle connections take over slow parts.
- **Pause and resume** — stop any time and continue later, even after closing the app.
- **Browser capture** — downloads from Chrome and Edge go straight to Fetchbench.
- **Video saving** — direct video files, unprotected HLS streams, and video pages via the free yt-dlp tool.
- **Queues and scheduler** — run downloads one after another, start them at night, shut down when finished.
- **Site grabber** — collect every PDF, ZIP, image… linked from a website.
- **Black theme** with customizable accent color, density and columns.

## Download

Get the latest version from the [**Releases**](../../releases/latest) page:

| File | What it is |
|---|---|
| `Fetchbench_x.y.z_x64-setup.exe` | The installer |
| `Fetchbench-extension-x.y.z.zip` | Browser extension for Chrome / Edge |
| `SHA256SUMS-x.y.z.txt` | Checksums to verify your download |

## Install

1. Run `Fetchbench_x.y.z_x64-setup.exe`. It installs for your Windows account only — no administrator rights needed.
2. Windows may show **"Windows protected your PC"** because the app isn't code-signed yet. Click **More info → Run anyway**.
3. Start Fetchbench from the Start menu.

## Add the browser extension (Chrome / Edge)

1. Unzip `Fetchbench-extension-x.y.z.zip` to a folder you'll keep (don't delete it later).
2. Open `chrome://extensions` (Edge: `edge://extensions`).
3. Turn on **Developer mode**.
4. Click **Load unpacked** and choose the unzipped folder.

While Fetchbench is running, browser downloads go to it automatically. Right-click a link → **Download with Fetchbench**. Hover over a video → **Download video**. If Fetchbench isn't running, downloads stay in the browser as usual.

## Video sites

Paste a video page link (YouTube, Vimeo, …) into **New download** and pick a quality. The first time, Fetchbench offers to install **yt-dlp** and **FFmpeg** (free, open-source tools).

Only download videos you have the right to keep: your own uploads, Creative Commons or public-domain videos, or with the creator's permission. Some sites' terms (including YouTube's) don't allow other downloads. DRM-protected videos are never downloaded.

## Verify your download (optional)

In PowerShell, in the folder with the installer:

```powershell
Get-FileHash .\Fetchbench_x.y.z_x64-setup.exe -Algorithm SHA256
```

The result should match the line in `SHA256SUMS-x.y.z.txt`.

## Uninstall

**Settings → Apps → Installed apps → Fetchbench → Uninstall.** Files you downloaded stay in your Downloads folder.

## Support

Found a bug or have an idea? Open an [issue](../../issues).

---

© 2026 Abdullah Al Mazid. Fetchbench is free to use. See [LICENSE](LICENSE) and [PRIVACY](PRIVACY.md).
