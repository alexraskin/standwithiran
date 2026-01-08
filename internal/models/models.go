package models

type Link struct {
	ID       string
	Title    string
	URL      string
	Category string
	Icon     string
	Featured bool
}

type Profile struct {
	Name        string
	Title       string
	Subtitle    string
	Description string
	Avatar      string
}

type Banner struct {
	Enabled bool
	Text    string
	Link    string
	Type    string
}

type AdminPageData struct {
	Profile Profile
	Links   []Link
	Banner  Banner
	Message string
	Error   string
}

type IndexPageData struct {
	Profile     Profile
	Links       []Link
	Banner      Banner
	LastUpdated string
}

type Protest struct {
	ID            string
	Date          string
	CityVillage   string
	County        string
	Province      string
	Latitude      float64
	Longitude     float64
	EstimatedSize int
	Description   string
	Injured       int
	Arrested      int
	Killed        int
	Link          string
	MediaURL      string
	Source        string
	IsCustom      bool
}

type ProtestStats struct {
	TotalKilled   int
	MinorsKilled  int
	TotalArrested int
	SinceDate     string
}

type ProtestMapData struct {
	LastUpdated  string
	Stats        ProtestStats
	RecentVideos []Protest
}
