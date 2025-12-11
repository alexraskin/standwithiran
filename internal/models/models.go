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
