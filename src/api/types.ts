//  Subscribe to
export interface Subscribe {
  id: number

  //  Subscribe to名称
  name: string

  //  Subscribe to年份
  year: string

  //  Subscribe to类型 电影/电视剧
  type: string

  //  Search keywords
  keyword?: string

  // TMDB ID
  tmdbid: number

  //  Douban, prc social networking websiteID
  doubanid?: string

  //  Quarter
  season?: number

  //  Playbill
  poster?: string

  //  Background image
  backdrop?: string

  //  Score (of student's work)
  vote?: number

  //  Descriptive
  description?: string

  //  Filter rules
  filter?: string

  //  Embody
  include?: string

  //  Rule out
  exclude?: string

  //  Total episodes
  total_episode?: number

  //  Number of episodes
  start_episode?: number

  //  Missing episodes
  lack_episode?: number

  //  Additional information
  note?: string

  //  State of affairs：N- Newly built， R- Subscription
  state: string

  //  Last updated
  last_update: string

  //  Subscribe to用户
  username: string

  //  Subscribe to站点
  sites: number[]

  //  Whether or not to wash the plate
  best_version: number

  //  Current priority
  current_priority: number
}

//  Historical record
export interface TransferHistory {

  // ID
  id: number

  //  Source catalog
  src?: string

  //  Destination catalog
  dest?: string

  //  Transfer modelink/copy/move/softlink
  mode?: string

  //  Typology： Cinematic、 Dramas
  type?: string

  //  Secondary classification
  category?: string

  //  Caption
  title?: string

  //  Particular year
  year?: string

  // TMDBID
  tmdbid?: number

  // IMDBID
  imdbid?: string

  // TVDBID
  tvdbid?: number

  //  Douban, prc social networking websiteID
  doubanid?: string

  //  Classifier for seasonal crop yield or seasons of a tv seriesSxx
  seasons?: string

  //  Classifier for sections of a tv series e.g. episodeExx
  episodes?: string

  //  Playbill
  image?: string

  //  DownloaderHash
  download_hash?: string

  //  State of affairs 1- Successes，0- Fail (e.g. experiments)
  status: boolean

  //  Reasons for failure
  errmsg?: string

  //  Dates
  date?: string
}

//  Media information
export interface MediaInfo {

  //  Typology  Cinematic、 Dramas
  type?: string

  //  Media title
  title?: string

  //  Particular year
  year?: string

  //  Caption（年）
  title_year?: string

  //  Quarter
  season?: number

  // TMDB ID
  tmdb_id?: number

  // IMDB ID
  imdb_id?: string

  // TVDB ID
  tvdb_id?: string

  //  Douban, prc social networking websiteID
  douban_id?: string

  //  Original language of the media
  original_language?: string

  //  Original media release title
  original_title?: string

  //  Media release date
  release_date?: string

  //  Background image片
  backdrop_path?: string

  //  Playbill图片
  poster_path?: string

  //  Score (of student's work)
  vote_average?: number

  //  Descriptive
  overview?: string

  //  Secondary classification
  category?: string

  //  Detail page
  detail_link?: string

  //  Season details
  season_info?: TmdbSeason[]

  //  Director (film etc)
  directors?: any[]

  //  Actor or actress
  actors?: any[]

  //  Adult content
  adult?: boolean

  //  Founder
  created_by?: string[]

  //  Episode length
  episode_run_time: string[]

  //  Hairstyle
  genres?: string[]

  //  Premiere date
  first_air_date?: string

  //  Homepage
  homepage?: string

  //  Multilingualism
  languages?: string[]

  //  Last update date
  last_air_date?: string

  //  Streaming media
  networks?: string[]

  //  Total episodes
  number_of_episodes?: number

  //  Total number of quarters
  number_of_seasons?: number

  //  Country of origin
  origin_country: string[]

  //  Original name
  original_name?: string

  //  Production company
  production_companies?: any[]

  //  Producer
  production_countries?: any[]

  //  Language type (in a classification)
  spoken_languages?: string[]

  //  State of affairs
  status?: string

  //  Tab (of a window) (computing)
  tagline?: string

  //  Score (of student's work)人数
  vote_count?: number

  //  Popularity
  popularity?: number

  //  Length of time
  runtime?: number

  //  Next episode
  next_episode_to_air?: object
}

// TMDB Quarterly information
export interface TmdbSeason {

  //  Release date
  air_date?: string

  //  Total episodes
  episode_count?: number

  //  Season name
  name?: string

  //  Descriptive
  overview?: string

  //  Playbill
  poster_path?: string

  //  Quarter
  season_number?: number

  //  Score (of student's work)
  vote_average?: number
}

// TMDB Collective information
export interface TmdbEpisode {

  //  Release date
  air_date?: string

  //  Bugle call
  episode_number?: number

  //  Episode title
  name?: string

  //  Descriptive
  overview?: string

  //  Length of time
  runtime?: number

  //  Quarter
  season_number?: number

  //  Playbill
  still_path?: string

  //  Score (of student's work)
  vote_average?: number

  //  Performer
  crew: Object[]

  //  Honored guest
  guest_stars: Object[]
}

// TMDB Information about people
export interface TmdbPerson {
  // ID
  id?: number

  //  Name (of a thing)
  name?: string

  //  Character
  character?: string

  //  Photograph
  profile_path?: string

  //  Distinguishing between the sexes
  gender?: number

  //  Original name
  original_name?: string

  //  Actor or actressID
  credit_id?: string

  //  Nickname
  also_known_as?: string[]

  //  Birthdays
  birthday?: string

  //  At the end of the day
  deathday?: string

  // IMDB ID
  imdb_id?: string

  //  Sectoral
  known_for_department?: string

  //  Birthplace
  place_of_birth?: string

  //  Short-lived enthusiasm
  popularity?: number

  //  Photograph
  images?: Object

  //  Particulars
  biography?: string
}

//  Website
export interface Site {

  // ID
  id: number

  //  Website名称
  name: string

  //  Website主域名Key
  domain: string

  //  Website地址
  url: string

  //  Website优先级
  pri?: number

  // RSS Address
  rss?: string

  // Cookie
  cookie?: string

  // User-Agent
  ua?: string

  //  Whether to use a proxy
  proxy?: number

  //  Filter rules
  filter?: string

  //  Whether or not to act and dye
  render?: number

  //  Whether or not the site is public
  public?: number

  //  Note
  note?: string

  //  Flow control unit cycle
  limit_interval?: number

  //  Number of flow control sessions
  limit_count?: number

  //  Flow control interval
  limit_seconds?: number

  //  Enable or disable
  is_active: boolean
}

//  Downloading
export interface DownloadingInfo {

  // HASH
  hash?: string

  //  Seed name
  title?: string

  //  Identified name
  name?: string

  //  Particular year
  year?: string

  // SXXEXX
  season_episode?: string

  //  Adults and children
  size?: number

  //  Download  Degree (angles, temperature etc)
  progress?: number

  //  State of affairs
  state?: string

  //  Download speed
  dlspeed?: string

  //  Upload speed
  upspeed?: string

  //  Media information
  media: { [key: string]: any }
}

//  Missing episode information
export interface NotExistMediaInfo {

  //  Classifier for seasonal crop yield or seasons of a tv series
  season: number

  //  Episode list
  episodes: number[]

  //  Total episodes
  total_episode: number

  //  Initial set
  start_episode: number
}

//  Plug-in (software component)
export interface Plugin {
  id?: string

  //  Plug-in (software component)名称
  plugin_name?: string

  //  Plug-in (software component)描述
  plugin_desc?: string

  //  Plug-in (software component)图标
  plugin_icon?: string

  //  Theme color
  plugin_color?: string

  //  Plug-in (software component)版本
  plugin_version?: string

  //  Plug-in (software component)作者
  plugin_author?: string

  //  Author's homepage
  author_url?: string

  //  Plug-in (software component)配置项ID前缀
  plugin_config_prefix?: string

  //  Loading sequence
  plugin_order?: number

  //  Available user levels
  auth_level?: number

  //  Installed or not
  installed?: boolean

  //  Operational state
  state?: boolean

  //  Availability of detail pages
  has_page?: boolean
}

//  Seed information
export interface TorrentInfo {

  //  WebsiteID
  site?: number

  //  Website名称
  site_name?: string

  //  WebsiteCookie
  site_cookie?: string

  //  WebsiteUA
  site_ua?: string

  //  Website是否使用代理
  site_proxy: boolean

  //  Website优先级
  site_order: number

  //  Seed name
  title?: string

  //  Seed subtitle
  description?: string

  // IMDB ID
  imdbid: string

  //  Seed links
  enclosure?: string

  //  Detail page
  page_url?: string

  //  Seed size
  size: number

  //  Breeder
  seeders: number

  //  Downloader
  peers: number

  //  Completer
  grabs: number

  //  Release time
  pubdate?: string

  //  Past due
  date_elapsed?: string

  //  Upload factor
  uploadvolumefactor: number

  //  Download factor
  downloadvolumefactor: number

  // HR
  hit_and_run: boolean

  //  Seed labels
  labels: string[]

  //  Seeding priority
  pri_order: number

  //  Promotion description
  volume_factor: string
}

//  Identifying metadata
export interface MetaInfo {

  //  Documents processed or not
  isfile: boolean

  //  Original string
  org_string?: string

  //  Subheading
  subtitle?: string

  //  Typology  Cinematic、 Dramas
  type: string

  //  Recognized chinese names
  cn_name?: string

  //  Recognizable english names
  en_name?: string

  //  Particular year
  year?: string

  //  Total number of quarters
  total_season: number

  //  The beginning of the identification season  Digital (electronics etc)
  begin_season?: number

  //  End of season for identification  Digital (electronics etc)
  end_season?: number

  //  Total episodes
  total_episode: number

  //  Identified starting set
  begin_episode?: number

  //  Identified end sets
  end_episode?: number

  // Partx Cd Dvd Disk Disc
  part?: string

  //  Types of resources identified
  resource_type?: string

  //  Effectiveness of identification
  resource_effect?: string

  //  Recognized resolution
  resource_pix?: string

  //  Identified production team/ Subtitling team
  resource_team?: string

  //  Video encoding
  video_encode?: string

  //  Audio encoding
  audio_encode?: string

  //  Name (of a thing)（自动中英文）
  name: string

  // SXX-SXX
  season: string

  // SXX-SXX  We'll return only if there's a seasonal number.
  sea: string

  // begin_season  Figures， Return of the tv series without seasons1
  season_seq: string

  //  Classifier for seasonal crop yield or seasons of a tv series的数组
  season_list: number[]

  // Exx-Exx
  episode: string

  //  Array of sets
  episode_list: number[]

  // ExxExx
  episodes: string

  // xx-xx
  episode_seqs: string

  // begin_episode  Figures
  episode_seq: string

  // SxxExx
  season_episode: string

  //  Resource type string， With resolution
  resource_term: string

  //  Release group/ Subtitle strings
  release_group: string

  //  Video encoding
  video_term: string

  //  Audio encoding
  audio_term: string

  //  Resource type+ Especially efficacious
  edition: string
}

//  Contextual information
export interface Context {

  //  Meta-information
  meta_info: MetaInfo

  //  Media information
  media_info: MediaInfo

  //  Seed information
  torrent_info: TorrentInfo
}

//  User information
export interface User {
  id: number
  name: string
  password: string
  email: string
  is_active: boolean
  is_superuser: boolean
  avatar: string
}

//  Storage space
export interface Storage {
  total_storage: number
  used_storage: number
}

//  Media statistics
export interface MediaStatistic {

  //  Total number of movies
  movie_count: number

  //  Total number of television dramas
  tv_count: number

  //  Total episodes of tv series
  episode_count: number

  //  Number of users
  user_count: number
}

//  Background process
export interface Process {

  //  StepID
  pid: number

  //  Process name
  name: string

  //  Process state
  status: string

  //  Process startup time
  create_time: number

  //  Process runtime
  run_time: number

  //  StepCPU Occupancy level
  cpu: number

  //  Process memory usage
  memory: number
}

//  Downloader information
export interface DownloaderInfo {

  //  Download speed
  download_speed: number

  //  Upload speed
  upload_speed: number

  //  Downloads
  download_size: number

  //  Upload volume
  upload_size: number

  //  Headroom
  free_space: number
}

//  Timed service information
export interface ScheduleInfo {

  // ID
  id: string

  //  Name (of a thing)
  name: string

  //  State of affairs
  status: string

  //  Next run time
  next_run: string
}

//  Message notification
export interface NotificationSwitch {

  //  Message type
  mtype: string

  //  Switchgear
  wechat: boolean
  telegram: boolean
  slack: boolean
  synologychat: boolean
}

//  Environmental settings
export interface Setting {
  //  Download catalog
  DOWNLOAD_PATH: string
}

//  Document viewing interface
export interface EndPoints {
  list: any
  mkdir: any
  delete: any
  download: any
  image: any
  rename: any
}

//  Document viewing project
export interface FileItem {
  type: string
  name: string
  basename: string
  path: string
  extension: string
  size: number
  children: FileItem[]
  modify_time: number
}
