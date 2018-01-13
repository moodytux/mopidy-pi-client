[core]
cache_dir = /var/cache/mopidy
config_dir = /etc/mopidy
data_dir = /var/lib/mopidy

[logging]
config_file = /etc/mopidy/logging.conf
debug_file = /var/log/mopidy/mopidy-debug.log

[local]
library = images
scan_timeout = 5000
scan_flush_threshold = 100
data_dir = /var/lib/mopidy/local
media_dir = {{mopidy.music_path}}

[local-images]
enabled = true
library = sqlite
#library = json

[m3u]
playlists_dir = /var/lib/mopidy/playlists

[http]
enabled = true
hostname = {{server.ip}}
port = 6680
static_dir =
zeroconf = Mopidy HTTP servier

[local-sqlite]
enabled = true

[loglevels]
root = INFO
mopidy = INFO

[mpd]
enabled = true
hostname = {{server.ip}}
port = 6600
password = 
max_connections = 20
connection_timeout = 60
zeroconf = Mopidy MPD server on $hostname
command_blacklist = 
default_playlist_scheme = m3u

