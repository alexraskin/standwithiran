package server

import (
	"crypto/rand"
	"encoding/hex"
	"io"
	"log/slog"
	"net/http"
	"strings"
	"time"

	"github.com/alexraskin/standwithiran/internal/models"
)

func (s *Server) renderError(w http.ResponseWriter, status int) {
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.WriteHeader(status)
	if err := s.tmplFunc(w, "error.html", nil); err != nil {
		slog.Error("Failed to render error template", "error", err)
	}
}

func (s *Server) HandleIndex(w http.ResponseWriter, r *http.Request) {

	profile, err := s.db.GetProfile(r.Context())
	if err != nil {
		slog.Error("Failed to load profile", "error", err)
		s.renderError(w, http.StatusInternalServerError)
		return
	}

	links, err := s.db.GetLinks(r.Context())
	if err != nil {
		slog.Error("Failed to load links", "error", err)
		s.renderError(w, http.StatusInternalServerError)
		return
	}

	banner, _ := s.db.GetBanner(r.Context())

	data := models.IndexPageData{
		Profile:     profile,
		Links:       links,
		Banner:      banner,
		LastUpdated: time.Now().Format("Jan 2, 2006"),
	}

	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	if err := s.tmplFunc(w, "index.html", data); err != nil {
		slog.Error("Failed to render index template", "error", err)
	}
}

func (s *Server) HandleLoginPage(w http.ResponseWriter, r *http.Request) {
	token := s.getSessionFromRequest(r)
	if s.validateSession(token) {
		http.Redirect(w, r, "/admin", http.StatusSeeOther)
		return
	}

	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	if err := s.tmplFunc(w, "login.html", nil); err != nil {
		slog.Error("Failed to render login template", "error", err)
	}
}

func (s *Server) HandleLogin(w http.ResponseWriter, r *http.Request) {
	password := r.FormValue("password")

	valid, err := s.db.VerifyPassword(r.Context(), password)
	if err != nil {
		slog.Error("Failed to verify password", "error", err)
		s.renderError(w, http.StatusInternalServerError)
		return
	}

	if !valid {
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		if err := s.tmplFunc(w, "login.html", map[string]string{"Error": "Invalid password"}); err != nil {
			slog.Error("Failed to render login template", "error", err)
		}
		return
	}

	token := s.createSession()
	http.SetCookie(w, &http.Cookie{
		Name:     "session",
		Value:    token,
		Path:     "/",
		HttpOnly: true,
		MaxAge:   86400,
		SameSite: http.SameSiteStrictMode,
	})

	http.Redirect(w, r, "/admin", http.StatusSeeOther)
}

func (s *Server) HandleLogout(w http.ResponseWriter, r *http.Request) {
	token := s.getSessionFromRequest(r)
	s.deleteSession(token)

	http.SetCookie(w, &http.Cookie{
		Name:     "session",
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		MaxAge:   -1,
	})

	http.Redirect(w, r, "/", http.StatusSeeOther)
}

func (s *Server) HandleAdmin(w http.ResponseWriter, r *http.Request) {
	message := r.URL.Query().Get("message")
	errorMsg := r.URL.Query().Get("error")

	profile, err := s.db.GetProfile(r.Context())
	if err != nil {
		slog.Error("Failed to load profile", "error", err)
		s.renderError(w, http.StatusInternalServerError)
		return
	}
	links, err := s.db.GetLinks(r.Context())
	if err != nil {
		slog.Error("Failed to load links", "error", err)
		s.renderError(w, http.StatusInternalServerError)
		return
	}
	banner, err := s.db.GetBanner(r.Context())
	if err != nil {
		slog.Error("Failed to load banner", "error", err)
		s.renderError(w, http.StatusInternalServerError)
		return
	}

	data := models.AdminPageData{
		Profile: profile,
		Links:   links,
		Banner:  banner,
		Message: message,
		Error:   errorMsg,
	}

	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	if err := s.tmplFunc(w, "admin.html", data); err != nil {
		slog.Error("Failed to render admin template", "error", err)
	}
}

func (s *Server) HandleAddLink(w http.ResponseWriter, r *http.Request) {
	title := r.FormValue("title")
	url := r.FormValue("url")
	category := r.FormValue("category")
	icon := r.FormValue("icon")
	featured := r.FormValue("featured") == "true"

	if title == "" || url == "" {
		http.Redirect(w, r, "/admin?error=Title+and+URL+are+required", http.StatusSeeOther)
		return
	}

	bytes := make([]byte, 8)
	if _, err := rand.Read(bytes); err != nil {
		slog.Error("Failed to generate random ID", "error", err)
		http.Redirect(w, r, "/admin?error=Failed+to+generate+ID", http.StatusSeeOther)
		return
	}
	id := hex.EncodeToString(bytes)

	link := models.Link{
		ID:       id,
		Title:    title,
		URL:      url,
		Category: category,
		Icon:     icon,
		Featured: featured,
	}

	if err := s.db.AddLink(r.Context(), link); err != nil {
		slog.Error("Failed to add link", "error", err)
		http.Redirect(w, r, "/admin?error=Failed+to+save", http.StatusSeeOther)
		return
	}

	http.Redirect(w, r, "/admin?message=Link+added+successfully", http.StatusSeeOther)
}

func (s *Server) HandleDeleteLink(w http.ResponseWriter, r *http.Request) {
	id := r.FormValue("id")

	if err := s.db.DeleteLink(r.Context(), id); err != nil {
		slog.Error("Failed to delete link", "error", err)
		http.Redirect(w, r, "/admin?error=Failed+to+delete", http.StatusSeeOther)
		return
	}

	http.Redirect(w, r, "/admin?message=Link+deleted", http.StatusSeeOther)
}

func (s *Server) HandleToggleFeatured(w http.ResponseWriter, r *http.Request) {
	id := r.FormValue("id")
	featured := r.FormValue("featured") == "true"

	if err := s.db.UpdateLinkFeatured(r.Context(), id, featured); err != nil {
		slog.Error("Failed to update featured status", "error", err)
		http.Redirect(w, r, "/admin?error=Failed+to+update", http.StatusSeeOther)
		return
	}

	http.Redirect(w, r, "/admin?message=Link+updated", http.StatusSeeOther)
}

func (s *Server) HandleUpdateProfile(w http.ResponseWriter, r *http.Request) {
	profile := models.Profile{
		Name:        r.FormValue("name"),
		Title:       r.FormValue("title"),
		Subtitle:    r.FormValue("subtitle"),
		Description: r.FormValue("description"),
		Avatar:      r.FormValue("avatar"),
	}

	if err := s.db.UpdateProfile(r.Context(), profile); err != nil {
		slog.Error("Failed to update profile", "error", err)
		http.Redirect(w, r, "/admin?error=Failed+to+save", http.StatusSeeOther)
		return
	}

	http.Redirect(w, r, "/admin?message=Profile+updated", http.StatusSeeOther)
}

func (s *Server) HandleUpdatePassword(w http.ResponseWriter, r *http.Request) {
	newPassword := r.FormValue("new_password")

	if len(newPassword) < 6 {
		http.Redirect(w, r, "/admin?error=Password+must+be+at+least+6+characters", http.StatusSeeOther)
		return
	}

	if err := s.db.SetPassword(r.Context(), newPassword); err != nil {
		slog.Error("Failed to update password", "error", err)
		http.Redirect(w, r, "/admin?error=Failed+to+save", http.StatusSeeOther)
		return
	}

	http.Redirect(w, r, "/admin?message=Password+updated", http.StatusSeeOther)
}

func (s *Server) HandleUpdateBanner(w http.ResponseWriter, r *http.Request) {
	banner := models.Banner{
		Enabled: r.FormValue("banner_enabled") == "true",
		Text:    r.FormValue("banner_text"),
		Link:    r.FormValue("banner_link"),
		Type:    r.FormValue("banner_type"),
	}

	if err := s.db.UpdateBanner(r.Context(), banner); err != nil {
		slog.Error("Failed to update banner", "error", err)
		http.Redirect(w, r, "/admin?error=Failed+to+save+banner", http.StatusSeeOther)
		return
	}

	http.Redirect(w, r, "/admin?message=Banner+updated", http.StatusSeeOther)
}

func (s *Server) serveFile(path string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		file, err := s.assets.Open(path)
		if err != nil {
			http.Error(w, "File not found", http.StatusNotFound)
			return
		}
		defer func() { _ = file.Close() }()
		_, _ = io.Copy(w, file)
	}
}

func (s *Server) cacheControl(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if strings.HasPrefix(r.URL.Path, "/static/") {
			w.Header().Set("Cache-Control", "public, max-age=86400")
			next.ServeHTTP(w, r)
			return
		}
		w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
		next.ServeHTTP(w, r)
	})
}
