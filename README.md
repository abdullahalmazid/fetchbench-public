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

## Is it safe?

Fetchbench is new and made by one person, so here is how you can check it yourself.

**What it does — and doesn't do**
- No ads, no tracking, no account. Nothing is sent to me or to any server of mine.
- It only connects to the websites you download from.
- The browser extension talks only to the Fetchbench app on your own PC (`127.0.0.1`). Its code is in the [`extension`](extension) folder of this repo — anyone can read it.
- Details: [PRIVACY.md](PRIVACY.md).

**Virus scan**
- The installer has been scanned by about 70 antivirus engines on VirusTotal:
  [see the scan result](https://www.virustotal.com/gui/file/c1bdd145cd4dd1e4d9e3f9f40d015dc59878b89e634048f475426a37d96cc50b) (version 0.1.0).
- Fetchbench also asks Microsoft Defender to scan every file it downloads (Settings → Security).

**Why does Windows show "Windows protected your PC"?**
The installer isn't code-signed yet (a paid certificate). Windows shows this warning for every new unsigned app,
not because anything harmful was found. Click **More info → Run anyway**. Code signing is planned.

**Check that your download is the original**
Compare the SHA-256 of the file you downloaded with `SHA256SUMS-x.y.z.txt` from the release (see *Verify your download* below).
For 0.1.0 the installer's SHA-256 is:
`c1bdd145cd4dd1e4d9e3f9f40d015dc59878b89e634048f475426a37d96cc50b`

**Who made it**
Abdullah Al Mazid — [GitHub](https://github.com/abdullahalmazid). Questions or concerns? Open an [issue](../../issues).

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
