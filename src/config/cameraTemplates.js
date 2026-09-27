export const CCTV_BRAND_TEMPLATES = {
  hikvision: {
    name: 'Hikvision / HiLook',
    mainStream: (ip, user, pass, port = 554) => `rtsp://${user}:${pass}@${ip}:${port}/Streaming/Channels/101/`,
    subStream: (ip, user, pass, port = 554) => `rtsp://${user}:${pass}@${ip}:${port}/Streaming/Channels/102/`
  },
  dahua_cpplus: {
    name: 'CP Plus / Dahua / Amcrest / Lorex',
    mainStream: (ip, user, pass, port = 554) => `rtsp://${user}:${pass}@${ip}:${port}/cam/realmonitor?channel=1&subtype=0`,
    subStream: (ip, user, pass, port = 554) => `rtsp://${user}:${pass}@${ip}:${port}/cam/realmonitor?channel=1&subtype=1`
  },
  tplink_tapo: {
    name: 'TP-Link Tapo',
    mainStream: (ip, user, pass, port = 554) => `rtsp://${user}:${pass}@${ip}:${port}/stream1`,
    subStream: (ip, user, pass, port = 554) => `rtsp://${user}:${pass}@${ip}:${port}/stream2`
  },
  uniview: {
    name: 'Uniview (UNV)',
    mainStream: (ip, user, pass, port = 554) => `rtsp://${user}:${pass}@${ip}:${port}/unicast/c1/s0/live`,
    subStream: (ip, user, pass, port = 554) => `rtsp://${user}:${pass}@${ip}:${port}/unicast/c1/s1/live`
  },
  reolink: {
    name: 'Reolink',
    mainStream: (ip, user, pass, port = 554) => `rtsp://${user}:${pass}@${ip}:${port}/Preview_01_main`,
    subStream: (ip, user, pass, port = 554) => `rtsp://${user}:${pass}@${ip}:${port}/Preview_01_sub`
  },
  hanwha: {
    name: 'Hanwha Techwin (Samsung)',
    mainStream: (ip, user, pass, port = 554) => `rtsp://${user}:${pass}@${ip}:${port}/profile2/media.smp`,
    subStream: (ip, user, pass, port = 554) => `rtsp://${user}:${pass}@${ip}:${port}/profile1/media.smp`
  },
  axis: {
    name: 'Axis',
    mainStream: (ip, user, pass, port = 554) => `rtsp://${user}:${pass}@${ip}:${port}/axis-media/media.amp`,
    subStream: (ip, user, pass, port = 554) => `rtsp://${user}:${pass}@${ip}:${port}/axis-media/media.amp?videocodec=h264`
  },
  eufy: {
    name: 'Eufy',
    mainStream: (ip, user, pass, port = 554) => `rtsp://${user}:${pass}@${ip}:${port}/live0`,
    subStream: (ip, user, pass, port = 554) => `rtsp://${user}:${pass}@${ip}:${port}/live1`
  },
  tiandy: {
    name: 'Tiandy',
    mainStream: (ip, user, pass, port = 554) => `rtsp://${user}:${pass}@${ip}:${port}/channel1`,
    subStream: (ip, user, pass, port = 554) => `rtsp://${user}:${pass}@${ip}:${port}/channel2`
  }
};