# Viewer

Browser VNC viewer for the Sun ecosystem. Mirrors the Linux `:0` desktop.

## PC setup

```bash
sudo apt install x11vnc websockify novnc
sudo x11vnc -storepasswd password /etc/x11vnc.pass && sudo chmod 600 /etc/x11vnc.pass
sudo mkdir -p /etc/websockify && sudo touch /etc/websockify/tokens
sudo chown GATEWAY_USER /etc/websockify/tokens
sudo cp deploy/x11vnc.service deploy/websockify.service /etc/systemd/system/
```

Edit `x11vnc.service` (`User`, `XAUTHORITY`), then:

```bash
sudo systemctl enable --now x11vnc websockify
```

x11vnc needs a live `:0` session. Enable display-manager auto-login or run it from `~/.config/autostart`.

## Gateway env

Add to the `.env`:

```dotenv
VNC_TOKEN_FILE=/etc/websockify/tokens
VNC_BACKEND=127.0.0.1:5900
VNC_PASSWORD=password
VNC_WEBSOCKIFY_PATH=/websockify
VNC_NOVNC_PATH=/novnc/vnc.html
```

The gateway runs on the same PC as x11vnc. Rebuild and run it.

## @sun/ssr

Republish (cookie-setting mutations, `0.2.2`):

```bash
cd Sun/packages/ssr && npm run build && npm run publish
```

## nginx Proxy Manager

Host `viewer.int.scarlettparker.co.uk`:

| Location | Port | Websockets | Rewrite |
|---|---|---|---|
| `/` | 5177 | off | |
| `/websockify` | 6080 | on | |
| `/novnc/` | 6080 | off | `/novnc/` to `/` |

## Run

```bash
npm install
npm run dev
```